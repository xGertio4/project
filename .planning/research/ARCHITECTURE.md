# Architecture Patterns

**Domain:** Premium multilingual marketing site + admin dashboard (brownfield Supabase migration + full redesign)
**Researched:** 2026-05-09
**Confidence:** HIGH — based on direct codebase analysis of all source files; no speculative claims

---

## Recommended Architecture

### Target Structure

```
src/
├── main.jsx                    # React hydration + ErrorBoundary (keep as-is)
├── App.jsx                     # Route dispatch + theme/lang providers
├── index.css                   # Global CSS reset + CSS variable tokens (keep)
│
├── lib/
│   ├── supabase.js             # Supabase client singleton (new)
│   ├── store.js                # Prune: remove useLocalStorage, keep useTheme, useHashRoute, useToasts, toast, downloadCSV
│   ├── i18n.js                 # Keep structure, remove detectLang localStorage dependency
│   └── hooks/
│       ├── useSupabaseQuery.js # Generic query wrapper (useQuery pattern, no extra library needed)
│       ├── useAuth.js          # Replaces useAuth from store.js — wraps supabase.auth
│       └── useStorage.js       # Supabase Storage upload helpers
│
├── components/                 # Shared primitives (used across public + admin)
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx           # Extracted from Admin.jsx useConfirm + CrudForm
│   │   ├── Toast.jsx           # Extracted from toastListeners pattern
│   │   └── ImageUpload.jsx     # Extracted from CrudForm file handling + Supabase Storage
│   └── layout/
│       ├── PageSection.jsx     # Wrapper for scroll-reveal sections
│       └── SectionHeader.jsx   # Repeated label/title/titleEm pattern across all sections
│
├── public-site/                # Everything that was DervishiGroup.jsx
│   ├── PublicSite.jsx          # Thin orchestrator (replaces DervishiGroup.jsx)
│   ├── sections/
│   │   ├── Hero.jsx
│   │   ├── Services.jsx
│   │   ├── Showroom.jsx
│   │   ├── Products.jsx
│   │   ├── Transforms.jsx      # Highest priority: conversion funnel
│   │   ├── Solar.jsx
│   │   ├── Blog.jsx
│   │   ├── Testimonials.jsx
│   │   ├── Consultations.jsx
│   │   ├── Contact.jsx
│   │   ├── FAQ.jsx
│   │   └── Footer.jsx
│   └── Nav.jsx
│
└── admin/
    ├── Admin.jsx               # Shell: sidebar + topbar + tab routing (keep structure, refactor internals)
    ├── Login.jsx               # Extracted from Admin.jsx
    ├── Dashboard.jsx           # Extracted from Admin.jsx (replace localStorage.getItem calls with Supabase counts)
    └── tabs/
        ├── Quotes.jsx
        ├── Transforms.jsx
        ├── Products.jsx
        ├── Blog.jsx
        ├── Projects.jsx
        ├── SolarConfig.jsx
        ├── Testimonials.jsx
        ├── Consultations.jsx
        └── Settings.jsx
```

---

## Component Boundaries

### What Must Be Split Out of DervishiGroup.jsx and In What Order

DervishiGroup.jsx (1028 lines) contains these distinct sections as top-level functions already:
`TransformSection` (line 262), `SolarSection` (line 367), `FAQSection` (line 435), `ContactSection` (line 464), `AdminPanel` (line 523), `AdminTable` (line 643), `AdminCRUD` (line 657), plus inline Hero, Nav, Services, Showroom, Products, Blog, Testimonials, Consultations, Footer.

The file-move is mechanical because these are already isolated functions — the split is a file extraction, not a refactor.

**Extraction order: redesign-first, highest-conversion-impact first**

| Priority | Component | Why This Order | Supabase Dependency |
|----------|-----------|---------------|---------------------|
| 1 | `Nav.jsx` | Required by every other section; needs Supabase settings for phone/email in topbar | Only `dg_settings` → read-only |
| 2 | `Transforms.jsx` | Primary conversion funnel; photo upload depends on Supabase Storage being ready | Needs Storage (uploads) + `dg_transforms` table |
| 3 | `Hero.jsx` | Visual entry point for premium redesign; no data dependency | None — static content |
| 4 | `Services.jsx` | Second section visitors see; no Supabase dependency | None |
| 5 | `Products.jsx` | Has filtering logic + `dg_products`; can use localStorage during migration window | `dg_products` table |
| 6 | `Solar.jsx` | Self-contained calculator + config read; `dg_solar_config` table | `dg_solar_config` (read-only on public site) |
| 7 | `Blog.jsx` | Reads `dg_blogs`; straightforward extraction | `dg_blogs` table |
| 8 | `Testimonials.jsx` | Read-only on public site | `dg_testimonials` table |
| 9 | `Consultations.jsx` | Form submission; writes to `dg_consultations` | `dg_consultations` table |
| 10 | `Contact.jsx` | Form submission; writes to `dg_quotes` | `dg_quotes` table |
| 11 | `FAQ.jsx`, `Footer.jsx`, `Showroom.jsx` | Static or near-static; no data | `dg_settings` (Footer) |

**Rule:** Extract each section into its own file at the moment it gets redesigned. Do not pre-split sections that haven't been redesigned yet — splitting then redesigning doubles the work. The redesign IS the extraction.

---

## Data Flow: Replacing localStorage with Supabase

### Pattern: Drop-In Hook Swap (no TanStack Query, no SWR needed)

The existing `useLocalStorage(key, initial)` hook has a clean signature: `[value, setValue]`. The migration strategy is to replace it with a `useSupabaseQuery(table, options)` hook that returns the same shape. This keeps component code stable during migration.

**Recommended pattern — custom hooks, no extra library:**

```js
// src/lib/hooks/useSupabaseQuery.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

export function useSupabaseQuery(table, { filter, order } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    let q = supabase.from(table).select("*");
    if (filter) q = q.match(filter);
    if (order) q = q.order(order.column, { ascending: order.asc ?? false });
    const { data: rows, error: err } = await q;
    if (err) setError(err);
    else setData(rows ?? []);
    setLoading(false);
  }, [table, filter, order]);

  useEffect(() => { fetch(); }, [fetch]);

  const upsert = useCallback(async (row) => {
    const { error: err } = await supabase.from(table).upsert(row);
    if (!err) fetch();
    return err;
  }, [table, fetch]);

  const remove = useCallback(async (id) => {
    const { error: err } = await supabase.from(table).delete().eq("id", id);
    if (!err) fetch();
    return err;
  }, [table, fetch]);

  return { data, loading, error, upsert, remove, refetch: fetch };
}
```

**Rationale for no TanStack Query / SWR:** The admin data volumes are small (dozens to hundreds of rows). The forms are non-concurrent. The caching and deduplication benefits of TanStack Query don't pay for the added complexity on this project. A custom hook gives the same interface, is easier to debug, and does not add a new dependency to learn. Revisit if real-time sync becomes a requirement.

**Rationale against dual-write (localStorage + Supabase simultaneously):** The existing PROJECT.md decision is correct — dual-write means every bug has to be diagnosed in two systems. Cut to Supabase per-table, not gradually.

### Migration Map: localStorage keys → Supabase tables

| localStorage Key | Supabase Table | Notes |
|-----------------|----------------|-------|
| `dg_products` | `products` | Add `images` text[] column for Storage URLs |
| `dg_quotes` | `quotes` | Status field stays as enum |
| `dg_transforms` | `transforms` | Photos: base64 → Storage URLs array |
| `dg_blogs` | `blog_posts` | Add `slug` for future SEO |
| `dg_projects` | `projects` | Before/after photos → Storage |
| `dg_testimonials` | `testimonials` | `published` boolean for gating |
| `dg_consultations` | `consultations` | Status enum matches existing values |
| `dg_solar_config` | `solar_config` | Single-row table (use `.single()`) |
| `dg_settings` | `settings` | Single-row table; cache aggressively |
| `dg_theme` | `localStorage` only | Theme preference stays client-side — not user data |
| `dg_lang` | `localStorage` only | Language preference stays client-side |
| `dg_auth` | Supabase Auth session | sessionStorage replaced by `supabase.auth.getSession()` |

### Auth Flow: Replacing the Hardcoded Credentials

**Current state:** `ADMIN_CREDENTIALS` object in store.js (plaintext, in git history), compared client-side. Session in sessionStorage.

**Target state:**

```js
// src/lib/hooks/useAuth.js
import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signOut = () => supabase.auth.signOut();

  return { user, loading, signIn, signOut };
}
```

Supabase Auth stores the JWT in localStorage automatically and refreshes it. No sessionStorage needed. No credential comparison in frontend code. Multi-tab logout works because `onAuthStateChange` fires in all tabs.

**Route protection:** Keep the existing pattern in `Admin.jsx` — if `!user` render `<Login />`. No new routing library needed. The `loading` state from `useAuth` should render a spinner instead of the login form to avoid flash.

---

## Image Upload + Storage Flow

### Supabase Storage Bucket Structure

```
supabase-storage/
├── transforms/           # PUBLIC bucket — transform before/after photos
│   └── {transform_id}/{filename}
├── products/             # PUBLIC bucket — product images
│   └── {product_id}/{filename}
├── projects/             # PUBLIC bucket — project portfolio before/after
│   └── {project_id}/{filename}
└── settings/             # PUBLIC bucket — company logo
    └── logo
```

**Rules:**
- All image buckets are PUBLIC with RLS allowing `select` for anonymous, `insert/update/delete` for authenticated only
- Never store base64 in the database — the current approach embeds large base64 strings in every query response; a 5-photo transform row is ~2-5MB of JSON
- Use Supabase's built-in image transformations for thumbnails: `supabase.storage.from('transforms').getPublicUrl(path, { transform: { width: 400, height: 300, resize: 'cover' } })`

**Upload hook pattern:**

```js
// src/lib/hooks/useStorage.js
import { supabase } from "../supabase";

export async function uploadImage(bucket, path, file) {
  const ext = file.name.split(".").pop();
  const filePath = `${path}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
}
```

**Replace the existing `fileToBase64` calls in CrudForm and TransformSection with `uploadImage`.** The CrudForm component passes `onSave` the resulting public URL string, which is stored in the database as a text column. No base64 anywhere.

**Signed URLs:** Do NOT use signed URLs for product/transform images — these are public-facing marketing assets. Signed URLs expire and will break embedded `<img>` tags. Public buckets with RLS on mutations are correct for this use case.

---

## i18n Architecture at Scale

The current `i18n.js` structure is sound — a flat JS object per language, accessed via `useI18n()`. The problem is the single file will grow linearly as new sections and copy are added.

**Recommended change: namespace split (lazy, not upfront)**

Keep the single `useI18n` hook. Keep the `TRANSLATIONS` object. When the file exceeds ~400 lines per language object, split into namespace files:

```
src/lib/i18n/
├── index.js          # exports useI18n, merges all namespaces
├── nav.js            # { sq: {...}, en: {...}, ... }
├── hero.js
├── sections.js       # services, showroom, products, solar, blog, testimonials, faq, footer
├── forms.js          # transform, consultation, contact
└── admin.js          # all admin strings
```

**Do not migrate to react-i18next or i18next for this project.** The current approach is fast, type-checkable with JSDoc, and has zero runtime dependency. The 7-language overhead is a translation cost (content), not an architecture cost (code). `react-i18next` solves pluralization, formatting, and lazy-loading of translation files — none of which is a current pain point.

---

## Architecture Anti-Patterns to Avoid

### Anti-Pattern 1: Prop-Drilling `t` Through the Entire Tree
**Current state:** Every component receives `t` as a prop from parent.
**What goes wrong:** As components decompose into 2-3 levels deep, prop drilling becomes `t` passed through 4-5 levels.
**Instead:** Create a React Context for i18n and expose `useI18n` directly from the context. Components call `const { t } = useI18n()` themselves. This is already how the hook works — just consume it directly rather than passing `t` as a prop.

### Anti-Pattern 2: One Supabase Client Per Hook File
**What goes wrong:** Multiple `createClient()` calls create multiple connection pools, multiple auth state listeners, and subtle race conditions on session refresh.
**Instead:** Single `supabase.js` module that exports one client instance. All hooks import from it. Vite's module system guarantees singleton behavior.

```js
// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### Anti-Pattern 3: Migrating Admin Tabs Before Auth is Working
**What goes wrong:** If Supabase Auth is not the gate, migrated tabs have no row-level security enforcement. Any CRUD operation is unauthenticated.
**Instead:** Auth must land before any admin data tab is migrated. RLS policies on every table must be written and tested before the first admin tab goes live on Supabase.

### Anti-Pattern 4: Redesigning and Migrating the Same Component at Once
**What goes wrong:** A section being redesigned AND having its data layer swapped in the same PR is nearly impossible to review and extremely hard to debug when something breaks.
**Instead:** For each section, do the migration (data layer swap) first in one PR, then the redesign (visual layer) in the next PR. The only exception is Transforms — the photo upload flow is so tightly coupled to the UI that they should be done together in one section-specific epic.

### Anti-Pattern 5: Keeping AdminPanel Inside DervishiGroup.jsx
**Current state:** `AdminPanel` function is defined at line 523 of DervishiGroup.jsx but is a dead code path — `App.jsx` routes to `admin/Admin.jsx` directly, never triggering it.
**What goes wrong:** Confusion, dead code bloat, potential for someone to accidentally edit the wrong admin component.
**Instead:** Delete `AdminPanel`, `AdminTable`, `AdminCRUD` from DervishiGroup.jsx in the first PR. No behavior change — these are unreachable.

---

## Suggested Build Order

**What must happen before redesign work can start:**

The redesign cannot proceed cleanly until the codebase is in a stable extraction state. Three gates must be open before visual redesign begins in earnest:

### Gate 1: Supabase Auth (must be first)

**Blocks:** All admin data migration. All public form submissions. Any RLS-protected reads.

Work:
1. Create Supabase project, set up `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Create `src/lib/supabase.js` singleton
3. Replace `useAuth` in store.js with the Supabase-backed `src/lib/hooks/useAuth.js`
4. Update `Admin.jsx` Login to call `signIn()` instead of comparing `ADMIN_CREDENTIALS`
5. Remove `ADMIN_CREDENTIALS` and `ADMIN_USERS` from store.js and DervishiGroup.jsx
6. Verify: admin login/logout works, session persists across refresh, multi-tab logout works

**After Gate 1:** Admin credentials are no longer in source code. Security risk is resolved.

### Gate 2: Settings and Schema Migration (must be second)

**Blocks:** Nav, Footer, and any component that reads `dg_settings`. Also blocks meaningful RLS because tables don't exist yet.

Work:
1. Create Postgres schema (all 9 tables listed in migration map above)
2. Write RLS policies: anon can SELECT published/active records; authenticated can INSERT/UPDATE/DELETE all
3. Migrate `dg_settings` → `settings` table (single-row)
4. Migrate `dg_solar_config` → `solar_config` table (single-row)
5. Swap `useLocalStorage("dg_settings", ...)` in Nav and Footer to `useSupabaseQuery("settings")`

**After Gate 2:** The app has a real backend. Remaining `useLocalStorage` swaps are mechanical.

### Gate 3: DervishiGroup.jsx Extraction (must be third)

**Blocks:** Redesign. A 1028-line file cannot be redesigned — you cannot work on Hero while someone else works on Products. The extraction enables parallel work.

Work:
1. Delete dead code: `AdminPanel`, `AdminTable`, `AdminCRUD` functions from DervishiGroup.jsx
2. Extract `Nav.jsx` — thin component, establishes the file structure
3. Extract `TransformSection` → `src/public-site/sections/Transforms.jsx` (already a named function at line 262)
4. Extract each remaining section in redesign-priority order (see extraction order table above)
5. Replace DervishiGroup.jsx with `PublicSite.jsx` that imports all sections

**After Gate 3:** Every section is an independent file. Design and data work can proceed in parallel across sections.

---

## Parallel vs Sequential Work Map

```
SEQUENTIAL (must complete before next starts)
─────────────────────────────────────────────
Gate 1: Supabase Auth
    │
    ▼
Gate 2: Schema + Settings Migration
    │
    ▼
Gate 3: DervishiGroup.jsx Extraction
    │
    ▼
─────────────────────────────────────────────
PARALLEL (all can proceed simultaneously after Gate 3)
─────────────────────────────────────────────
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Redesign Track   │  │ Data Layer Track  │  │ Admin Track      │
│                  │  │                  │  │                  │
│ Hero visual      │  │ Transforms table  │  │ Admin tab        │
│ Services visual  │  │ + Storage upload  │  │ redesigns        │
│ Products visual  │  │ Products table    │  │ (post-auth,      │
│ Solar visual     │  │ Blog table        │  │ post-schema)     │
│ etc.             │  │ etc.              │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

**Redesign track and data layer track are independent** after Gate 3. A section can be redesigned against the existing `useLocalStorage` hook (using a feature flag or just shipping section by section), then the data swap done in a follow-up PR. The Transforms section is the exception — its photo upload UX and Storage integration should be one unit of work.

---

## Component Organization Pattern Recommendation

**Use: Feature folders with co-located styles, NOT atomic design**

Atomic design (atoms/molecules/organisms) introduces a categorization burden that slows the team down on a project of this size. The question "is this a molecule or organism?" has no clear answer for a `SectionHeader` used in 11 sections.

**Recommended pattern:**

```
src/public-site/sections/Transforms/
├── Transforms.jsx        # Section component
├── PhotoUploader.jsx     # Sub-component (local to this section)
├── BeforeAfterGallery.jsx
└── Transforms.css        # If section needs scoped styles beyond Tailwind
```

For components shared across sections (Button, Modal, Input), put them in `src/components/ui/`. For everything used in only one section, co-locate it in that section's folder. The rule is: **shared → `src/components/`, section-only → next to the section file.**

Tailwind eliminates the need for most `.css` files. Only create a section CSS file when you need keyframe animations or complex selectors that Tailwind can't express. Framer Motion handles transitions; Tailwind handles layout and color.

---

## Scalability Considerations

| Concern | Current | After Migration | Notes |
|---------|---------|-----------------|-------|
| Image storage | localStorage ~5MB quota, base64 bloat | Supabase Storage (unlimited) with CDN URLs | Immediate fix for the quota problem |
| Multi-admin | Single hardcoded account | Supabase Auth supports unlimited users + roles | Row-level security via `auth.uid()` |
| Bundle size | ~1MB single bundle (all sections + admin) | Section files enable `React.lazy()` per section | Defer until after extraction is done |
| i18n translation cost | 7× per string | Unchanged — this is a content cost, not code cost | Minimize new copy strings in design |
| Admin data volume | Capped by localStorage | Supabase pagination via `.range()` | Add pagination to admin tables when row counts exceed 200 |

---

## Sources

- Direct codebase analysis: `src/DervishiGroup.jsx` (1028 lines), `src/admin/Admin.jsx` (546 lines), `src/lib/store.js`, `src/lib/i18n.js`, `src/App.jsx`
- Codebase documentation: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/CONCERNS.md`, `.planning/codebase/STRUCTURE.md`
- Supabase Auth session management pattern: standard `onAuthStateChange` approach from Supabase JS v2 docs (HIGH confidence — matches current supabase-js API)
- Supabase Storage public bucket + image transform pattern: standard Supabase Storage API (HIGH confidence)
- RLS pattern for public reads / authenticated writes: standard Supabase RLS (HIGH confidence)
- Custom hook over TanStack Query recommendation: based on project data volume and team complexity tradeoff (MEDIUM confidence — valid for small datasets; revisit if real-time sync added)

---

*Architecture research: 2026-05-09*

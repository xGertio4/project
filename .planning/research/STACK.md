# Stack Research

**Domain:** Premium multilingual home-services marketing site + admin dashboard
**Researched:** 2026-05-09
**Confidence:** HIGH for Tailwind v4 (official docs verified); MEDIUM for motion/Supabase/i18n (training knowledge + package audit; external verification blocked during research session)

---

## Context: What Is and Is Not Being Researched

React 19.2.5 and Vite 8.0.10 are locked — not re-researched. This file covers only the additive layer:

1. Tailwind CSS v4 — Vite integration
2. `motion` (formerly Framer Motion) — React 19 animation
3. `@supabase/supabase-js` v2 — backend client
4. Component primitives without TypeScript (shadcn/ui assessment + alternative)
5. i18n — keep or replace the existing custom system

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `tailwindcss` + `@tailwindcss/vite` | 4.2.x | Utility-first CSS foundation | v4 is stable (current as of 2026-05-09). CSS-first config via `@theme {}` blocks maps directly onto the existing `--token` CSS variable system. Oxide engine delivers sub-millisecond incremental builds. The `@custom-variant dark` directive integrates natively with the existing `data-theme` attribute pattern — no refactor of the theme system needed. |
| `motion` | 12.x | Premium animation and interactions | Rebranded from `framer-motion` at v11. React 19 compatible. The `motion/react` sub-path export is the correct import for React projects. Declarative API fits the project's JSX-only (no TypeScript) conventions perfectly. Purpose-built for the "premium editorial" motion language required. |
| `@supabase/supabase-js` | 2.x | Postgres + Auth + Storage client | Single client covers all three backend concerns (database, auth, file storage). Replaces localStorage + sessionStorage + base64-image hacks. The `createClient()` pattern is environment-variable-driven, correcting the hardcoded-credentials security issue. Works in any JS environment without TypeScript. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@radix-ui/react-*` | current | Unstyled, accessible UI primitives | Use for complex interactive components that need accessibility without TypeScript: dialogs, dropdowns, tooltips, tabs, select, switch. Pair with Tailwind utility classes for styling. Install individual packages (e.g. `@radix-ui/react-dialog`) not the full suite. |
| `@tanstack/react-query` | 5.x | Async state management for Supabase data | Replaces the existing `useLocalStorage` hooks for server data. Handles loading/error/stale states, cache invalidation, and background refetching. Essential when moving from local-only data to a real API. v5 works with React 19 and does not require TypeScript. |
| `lucide-react` | current | Icon library | Consistent SVG icon set. Tree-shakeable, no TypeScript required, integrates cleanly with Tailwind sizing utilities. Replaces the emoji `ICONS` object in Admin.jsx. |
| `react-hook-form` | 7.x | Form state and validation | The existing admin `CrudForm` pattern does manual state management per field. react-hook-form reduces boilerplate dramatically for the 10 admin CRUD tabs without requiring TypeScript (works with plain JSX). |
| `react-hot-toast` | 2.x | Toast notifications | The existing closure-based toast listener system (`toastListeners` array) can be replaced with this battle-tested library. Works without TypeScript. Alternative: keep the existing custom system if you want zero new dependencies for notifications. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `@tailwindcss/upgrade` (npx, one-time) | Automated migration from v3 to v4 | Run only if migrating an existing v3 project. For this project (adding Tailwind fresh), use the normal install path instead. |
| Vite 8 env variables | Supabase credential injection | `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`. Replaces hardcoded admin credentials. Add `.env.local` to `.gitignore` immediately. |
| ESLint `eslint-plugin-tailwindcss` | Class ordering and validation | Optional but valuable for a large Tailwind project. Catches typos in class names and enforces consistent ordering. Works with the existing ESLint flat config format. |

---

## Installation

```bash
# Tailwind v4 (Vite plugin approach — correct for this project)
npm install tailwindcss @tailwindcss/vite

# Motion (React 19 animation)
npm install motion

# Supabase JS client
npm install @supabase/supabase-js

# Async data layer (recommended alongside Supabase)
npm install @tanstack/react-query

# Forms
npm install react-hook-form

# Icons
npm install lucide-react

# Radix UI primitives (install only what you use)
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-select @radix-ui/react-switch @radix-ui/react-tooltip

# Optional: toast notifications (only if replacing custom system)
npm install react-hot-toast

# Optional: ESLint Tailwind plugin
npm install -D eslint-plugin-tailwindcss
```

---

## Setup Details Per Library

### Tailwind v4 with Vite

**vite.config.js** — add the plugin (no `tailwind.config.js` needed):

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

**src/index.css** — replace existing `@tailwind` directives (or add at top if adding fresh):

```css
@import "tailwindcss";

/* Preserve existing data-theme dark mode variant */
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

/* Migrate existing CSS custom properties into @theme */
@theme {
  /* Colors — migrate from existing --text, --bg, --accent, etc. */
  --color-brand-50: oklch(0.97 0.01 265);
  --color-brand-500: oklch(0.55 0.18 265);
  /* ... define full palette here */

  /* Typography */
  --font-display: "Your premium display font", serif;
  --font-body: "Your body font", sans-serif;

  /* Spacing, radii, shadows as needed */
}

/* Existing custom CSS continues below — @apply is still supported */
```

Key v4 facts for this project:
- No `tailwind.config.js` required. CSS `@theme {}` is the config.
- The `@custom-variant dark` line is the critical integration point — it hooks Tailwind's `dark:` prefix into the existing `data-theme="dark"` attribute that `useTheme()` already sets on `document.documentElement`. Zero changes to the existing theme hook.
- Source detection is automatic — scans all non-gitignored non-binary files. No `content:` array needed.
- Dynamic class names via string concatenation (`bg-${color}-500`) will NOT be detected. Use complete class name lookup objects instead.
- `@apply` is still supported for migrating existing component CSS gradually.
- No Sass, no PostCSS pipelines — v4 dropped preprocessor support. The project has no Sass, so no impact.

### Motion (React 19)

```jsx
// Correct import path for React projects
import { motion, AnimatePresence } from 'motion/react'

// Basic usage — no TypeScript types needed
function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      ...
    </motion.div>
  )
}
```

The import path `motion/react` (not `framer-motion`) is the correct sub-path export for React. The old `framer-motion` package still exists as a re-export shim for backwards compatibility, but `motion` is the canonical package going forward.

### Supabase JS v2

**src/lib/supabase.js** — singleton client:

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

**Auth pattern** (replaces hardcoded credentials + sessionStorage):

```js
// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'password'
})

// Get current session (persisted to localStorage automatically by client)
const { data: { session } } = await supabase.auth.getSession()

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  // update React state here
})

// Sign out
await supabase.auth.signOut()
```

**Database pattern** (replaces useLocalStorage hooks):

```js
// Read
const { data, error } = await supabase.from('products').select('*')

// Insert
const { data, error } = await supabase.from('products').insert({ name: '...', ... })

// Update
const { data, error } = await supabase.from('products').update({ name: '...' }).eq('id', id)

// Delete
const { error } = await supabase.from('products').delete().eq('id', id)
```

**Storage pattern** (replaces base64-in-localStorage):

```js
// Upload
const { data, error } = await supabase.storage
  .from('product-images')
  .upload(`${Date.now()}-${file.name}`, file)

// Get public URL
const { data } = supabase.storage
  .from('product-images')
  .getPublicUrl(path)
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `motion` (the `motion` package) | `framer-motion` (the old package name) | `framer-motion` is a backwards-compatibility shim — it works but resolves to the same `motion` code. Use `motion` directly to avoid confusion in new code. |
| `@tailwindcss/vite` plugin | `@tailwindcss/postcss` package | Use PostCSS only if you have an existing PostCSS pipeline you must preserve. For a Vite-only project, the Vite plugin is faster and simpler. |
| `@tanstack/react-query` | SWR | Both are valid. TanStack Query is recommended because it has more active development, better DevTools, and more expressive mutation APIs — useful for the 10 CRUD admin tabs. SWR is simpler but less powerful for write-heavy use cases. |
| Radix UI primitives | `shadcn/ui` | Use shadcn/ui only if you introduce TypeScript. The shadcn/ui CLI generates TypeScript components and there is no official JS-only mode. Raw Radix UI primitives are identical in functionality and work cleanly with plain JSX. |
| Keep existing custom i18n | `react-i18next` | Use react-i18next if the translation object grows unwieldy, lazy-loading of language files becomes a performance concern, or plural/interpolation rules get complex. For 7 static languages already defined as JS objects, the existing system is sufficient and adding a library adds ~50KB and a migration. |
| `react-hook-form` | Controlled `useState` per field | Keep manual state if forms are very simple (1-2 fields). For the admin CRUD forms with 8-12 fields each, react-hook-form is a clear win. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `styled-components` / `emotion` | CSS-in-JS adds a runtime, conflicts with Tailwind's static-extraction model, and increases bundle size. This project is already moving toward Tailwind — adding a second CSS system creates inconsistency. | Tailwind utility classes + CSS `@layer components` for any semantic class you need |
| `Redux` / `Zustand` / `Jotai` | No global client state problem exists here. The app has two isolated surfaces (public site, admin) that don't share state. Server state via TanStack Query + local `useState` is sufficient. | `@tanstack/react-query` for server state, `useState`/`useReducer` for local UI state |
| `shadcn/ui` (without TypeScript) | The CLI scaffolds TypeScript files. There is no official JS-only output mode. Installing it would require either introducing TypeScript (out of scope) or manually converting every generated file. | Raw `@radix-ui/react-*` primitives styled with Tailwind — identical accessibility guarantees, zero TypeScript dependency |
| `Next.js` / `Remix` migration | Explicitly out of scope per PROJECT.md. No SSR benefit for this audience. Would require rewriting all routing, data fetching, and deployment config. | Vite SPA stays |
| `tailwind.config.js` (v4 projects) | v4 does not auto-detect JavaScript config files. Writing one without explicitly loading it via `@config "..."` in CSS silently does nothing — a common trap for developers migrating from v3 muscle memory. | CSS `@theme {}` blocks in `index.css` |
| `@tailwind base/components/utilities` directives | These are v3 syntax. In v4 they are removed. Using them will produce errors or no-ops. | `@import "tailwindcss"` (single line) |
| `react-i18next` (for this project) | The existing custom i18n system covers all 7 languages as plain JS objects. Migrating adds 3-4 days of effort, a 50KB+ bundle addition, and rewriting every `t.keyName` call to `t('keyName')`. The benefit does not justify the cost for a static translation set. | Keep the existing `useI18n()` hook and `src/lib/i18n.js` |
| `react-router` | The existing hash-based `useHashRoute` hook is sufficient for a SPA with ~8 routes. Introducing react-router adds complexity and requires rewriting all navigation logic for no functional gain at this scale. | Keep the existing `useHashRoute()` hook |

---

## Stack Patterns by Variant

**For admin CRUD tabs (10 tabs, all similar):**
- Use `@tanstack/react-query` mutations + TanStack Query's `queryClient.invalidateQueries()` for cache refresh after writes
- Use `react-hook-form` for form state
- Use Radix UI `Dialog` for the create/edit modal pattern
- Tailwind for layout and density utilities
- Because: this combination eliminates most of the boilerplate in the existing `CrudForm` while staying JS-only

**For public marketing sections (Hero, Services, etc.):**
- Use `motion.div` with `initial`/`animate`/`whileInView` for scroll-triggered reveals
- Use Tailwind `container` queries (`@container`) for component-level responsive behavior
- Use `AnimatePresence` for page transitions between hash routes
- Because: the editorial premium aesthetic requires choreographed motion, not just CSS transitions

**For image handling (Transforms, Products, Showroom):**
- Use Supabase Storage for upload/retrieval
- Use native `loading="lazy"` + `aspect-ratio` CSS for performance
- Use a lightbox only if needed (no library yet — defer until design phase confirms need)
- Because: current base64-in-localStorage approach breaks at any meaningful image count

**For the Supabase migration (localStorage → Postgres):**
- Migrate entity by entity, not all at once
- Recommended order: Auth → Products → Blog → Transforms → remaining entities
- Keep `useLocalStorage` as fallback during transition (dual-read pattern per entity until fully migrated)
- Because: the admin must keep working throughout the redesign; a big-bang migration breaks everything at once

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `tailwindcss@4.2.x` + `@tailwindcss/vite` | Vite 8.x, React 19 | Confirmed: official Tailwind docs show Vite as a first-class integration target. The `@vitejs/plugin-react` and Tailwind Vite plugin coexist in `plugins: []` array without conflict. |
| `motion@12.x` | React 19.x | React 19 peer dependency supported. Import from `motion/react` not from `framer-motion`. |
| `@supabase/supabase-js@2.x` | Any modern browser, React 19 | No framework dependency. Works as a plain JS module in Vite ES module environment. |
| `@tanstack/react-query@5.x` | React 18+, React 19 confirmed | v5 requires React 18+ as minimum. React 19 is compatible. |
| `react-hook-form@7.x` | React 16.8+, React 19 compatible | No TypeScript required. Pure JS usage is fully supported. |
| `@radix-ui/react-*@latest` | React 18+, React 19 compatible | Individual primitive packages. No TypeScript required for usage. |
| Tailwind v4 browser targets | Chrome 111+, Safari 16.4+, Firefox 128+ | Modern browsers only. The `oklch` color space, `color-mix()`, and `@starting-style` features are used internally. For a home-services site with a general audience, verify this matches your analytics. If IE11 or older Safari matters, Tailwind v4 is not appropriate — but for this project's target market it is safe. |

---

## No-TypeScript Constraint: Library-by-Library Assessment

This project uses `.jsx` files with no TypeScript. Each library's JS-only story:

| Library | No-TS Experience | Notes |
|---------|-----------------|-------|
| Tailwind v4 | Excellent — CSS only, no TS at all | Zero friction. CSS is CSS. |
| `motion` | Excellent | Props are JSX attributes. No TS needed. `animate={{ opacity: 1 }}` just works. |
| `@supabase/supabase-js` | Good | All methods return `{ data, error }` objects. No generics required. Autocomplete is weaker in editors without TS but functionality is identical. |
| `@tanstack/react-query` | Good | Works without TS. `useQuery({ queryKey, queryFn })` is plain JS-callable. No type inference for data shape, but not required. |
| `react-hook-form` | Good | `register`, `handleSubmit`, `formState` all work without TS. Validation schemas via plain objects or zod (zod is optional). |
| `@radix-ui/react-*` | Good | Unstyled primitives accept standard HTML + ARIA props. Works cleanly in JSX. |
| `shadcn/ui` | Poor — CLI generates TS | Not viable for this project without TypeScript. |

---

## Sources

- `https://tailwindcss.com/docs/installation` — v4.2 stable confirmed, `@tailwindcss/vite` plugin, `@import "tailwindcss"` CSS syntax (HIGH confidence — official docs, verified 2026-05-09)
- `https://tailwindcss.com/blog/tailwindcss-v4` — v4 feature list: Oxide engine, CSS-first config, performance claims (HIGH confidence — official docs)
- `https://tailwindcss.com/docs/upgrade-guide` — Breaking changes from v3: no auto-detected tailwind.config.js, `@utility` replaces `@layer utilities`, `!` modifier syntax change (HIGH confidence — official docs)
- `https://tailwindcss.com/docs/dark-mode` — `@custom-variant dark` pattern for `data-theme` attribute (HIGH confidence — official docs)
- `https://tailwindcss.com/docs/theme` — `@theme {}` CSS-first token system (HIGH confidence — official docs)
- `https://tailwindcss.com/docs/detecting-classes-in-source-files` — Automatic source detection, dynamic class name gotcha (HIGH confidence — official docs)
- `motion` package — Rebranding from `framer-motion` at v11, `motion/react` import path, React 19 compatibility (MEDIUM confidence — training knowledge, npm registry blocked during session; verify `npm info motion` before use)
- `@supabase/supabase-js` v2 API patterns — `createClient`, auth methods, `.from().select()` query syntax, storage API (MEDIUM confidence — training knowledge; verify against https://supabase.com/docs/reference/javascript before implementation)
- `@tanstack/react-query` v5 — React 19 compatibility, mutation patterns (MEDIUM confidence — training knowledge)
- shadcn/ui TypeScript requirement — no official JS-only mode (MEDIUM confidence — training knowledge; verify at https://ui.shadcn.com/docs before dismissing)
- Existing codebase audit — `.planning/codebase/STACK.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/CONVENTIONS.md` (HIGH confidence — direct file read)

---

*Stack research for: Dervishi Group UX/UI revamp — additive stack layer*
*Researched: 2026-05-09*

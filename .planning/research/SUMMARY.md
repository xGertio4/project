# Project Research Summary

**Project:** Dervishi Group — UX/UI Revamp
**Domain:** Premium multilingual home-services marketing site + admin dashboard (brownfield)
**Researched:** 2026-05-09
**Confidence:** MEDIUM–HIGH

## Executive Summary

This is a brownfield revamp of a React 19 + Vite SPA for a full-service home-renovation company operating across 7 language markets. The core mission is one change: visitors should be able to submit a Transform request (before/after renovation project) on a polished, mobile-first site that converts. Everything else — the backend migration, the visual redesign, the admin improvements — exists to support that single funnel. The project is technically a refactor + redesign + backend swap delivered simultaneously, which demands strict sequencing to avoid breaking the live admin at any step.

The recommended approach is a three-gate sequential foundation (Supabase Auth → schema + settings migration → DervishiGroup.jsx component extraction) followed by parallel tracks for visual redesign, data migration, and admin improvements. The existing tech stack stays in place (React 19, Vite 8, no TypeScript); the additive layer is Tailwind CSS v4, the `motion` library (formerly framer-motion), and Supabase JS v2. No framework migrations. Custom hooks plus TanStack Query v5 for async data. The existing custom i18n system is preserved.

The top risks in order of severity: (1) hardcoded admin credentials already in git history — purge with `git filter-repo` before any repo exposure; (2) admin lockout during Supabase cutover if RLS is misconfigured — staging verification mandatory; (3) silent Transform submission failures from unhandled Supabase errors — localStorage fallback queue needed from day one; (4) Tailwind Preflight breaking existing CSS on installation — must be disabled during the transition. All four are preventable with known techniques.

## Key Findings

### Recommended Stack

**Additive on top of React 19 + Vite 8 + plain JS:**

- **Tailwind CSS v4.2**: styling foundation — `@tailwindcss/vite` plugin, `@import "tailwindcss"` entry, `@theme {}` config in CSS, `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))` reuses existing `useTheme()` hook with zero changes
- **motion** (the rebranded `framer-motion`): premium interactions — `import { motion } from 'motion/react'`, declarative API, no TS dependency, must be wired with `useReducedMotion()` from day one
- **@supabase/supabase-js v2**: Postgres + Auth + Storage backend — replaces all 9 localStorage business-data keys; `dg_theme` and `dg_lang` stay in localStorage as user preferences
- **TanStack Query v5**: async data layer for Supabase calls — works without TypeScript; replaces synchronous `useLocalStorage` semantics
- **@radix-ui/react-***: unstyled accessible primitives (Dialog, DropdownMenu, etc.) — replaces shadcn/ui (TS-only)
- **react-hook-form**: form state for the multi-step Transform submission
- **browser-image-compression**: client-side image compression before Supabase Storage upload

**Explicitly NOT used:** shadcn/ui (TS-only), styled-components/emotion (Tailwind covers this), Redux/Zustand (custom hooks suffice), react-i18next (existing custom system is fine), Next.js/Remix (Vite SPA stays).

### Expected Features

**Must have (table stakes — current site lacks these):**

Public site:
- Transform multi-step submission (project info → photo upload → contact)
- Client-side image compression + Supabase Storage upload
- Before/after slider in transforms gallery (industry standard since ~2018)
- Category filter chips on gallery
- Language switcher with native names (Italiano, Deutsch, Ελληνικά, etc.) not just flags
- Mobile-first responsive at every breakpoint
- Trust signals (testimonials, stats bar, certifications)
- Contact via WhatsApp link + visible phone in header

Admin:
- Real Supabase Auth (replace hardcoded credentials)
- Lead status workflow (New → Reviewed → Contacted → Closed)
- Realtime new-submission badge
- Sortable / filterable / searchable data tables
- Image lightbox for transform photos in admin

**Should have (differentiators):**
- Drag-reorder photo upload UI in Transform form
- Quick-view drawer for lead details (vs full-page nav)
- Solar calculator with progressive disclosure
- Multi-step success screen after submission with what-happens-next

**Defer (out of scope):**
- Live chat (LCP cost > conversion benefit; staffing burden)
- Infinite scroll on galleries (anti-pattern per Baymard)
- Activity log / audit trail in admin
- Analytics platform integration
- Email/SMS notifications (in-app realtime sufficient for v1)

### Architecture Approach

Three-gate sequential foundation followed by parallel tracks. The existing `DervishiGroup.jsx` (1028 lines) is partially decomposed already — `TransformSection`, `SolarSection`, `FAQSection`, `ContactSection` are named functions ready to be moved to files. Dead admin code at lines 523–700+ is unreachable and deletes in PR 1.

**Major components:**

1. **Backend Foundation (Supabase)** — Auth, Postgres schema with RLS, Storage buckets for images
2. **Design System Layer** — Tailwind v4 tokens, motion primitives, shared Radix UI components, type/color/space scales
3. **Public Site** — Section components extracted from DervishiGroup.jsx, each with its own data hook (`useSupabaseQuery(table)`)
4. **Admin Shell** — Layout + nav + 10 tab components, each using the same data hook, plus realtime subscriptions for lead inboxes
5. **i18n System** — Existing `src/lib/i18n.js` retained, key-check utility added to detect missing translations across 7 languages
6. **Image Pipeline** — `browser-image-compression` → Supabase Storage upload → public URL with `?width=&quality=&format=webp` transforms

**Build order:** All section redesign and data migration is gated on (1) Auth + Schema and (2) DervishiGroup.jsx extraction. Once unblocked, sections can be redesigned in parallel.

### Critical Pitfalls

1. **Hardcoded admin credentials are already in git history** (`src/lib/store.js:111-114`, `DervishiGroup.jsx:16`). Run `git filter-repo` to purge BEFORE any wider repo exposure. Just changing the file does not remove them from history.
2. **RLS misconfiguration causes admin lockout** during Supabase migration. Mandatory staging verification with the actual auth flow before flipping any production cutover.
3. **Tailwind Preflight will break existing CSS** on first install — disable Preflight via `corePlugins` in v4 config OR scope existing styles, then re-enable Preflight section by section as components are migrated.
4. **Silent Transform submission failures** if Supabase throws during upload. Wrap submission in localStorage fallback queue + retry; show success only after server confirmation.
5. **German/Greek strings are 30–40% longer than English** — every component must be tested in DE and EL before "done"; avoid fixed widths for translatable text.
6. **Framer Motion overuse** turns premium into janky. Cap motion vocabulary to 3 primitives, all under 350ms, all gated by `useReducedMotion()` from day one (not retrofitted).
7. **Supabase Storage serves originals by default** — image transforms (`?width=&quality=&format=webp`) are opt-in. Without them, Lighthouse mobile ≥ 90 target will not be met.
8. **Hash routing limits SEO** — decision must be made in Phase 2 (before IA rebuild in Phase 4) whether to migrate to History API. Migrating later means rebuilding navigation twice.

## Implications for Roadmap

Based on research, suggested phase structure: **6 phases**

### Phase 1: Foundation & Security
**Rationale:** Hardcoded credentials + git history are an active security concern; Supabase Auth + RLS-backed schema are the prerequisites for every other change. Nothing else can ship safely until this is done.
**Delivers:** Supabase project provisioned, Auth replacing hardcoded credentials, Postgres schema with RLS for all 9 entities, Storage buckets for images, git history purged of credentials, Settings + SolarConfig migrated end-to-end as the migration template.
**Addresses:** Real auth, multi-device admin foundation, security hole closure.
**Avoids:** Pitfalls 1, 2 (credentials in git, RLS lockout).

### Phase 2: Design System & Component Extraction
**Rationale:** Cannot redesign sections that don't yet exist as files. Cannot apply premium visual language without a token system in place. Both are one-time setup.
**Delivers:** Tailwind v4 installed (Preflight disabled), motion primitives + `useReducedMotion()` integration, brand identity proposed (2–3 visual directions; user picks one), full design system (color/type/space tokens, shared Radix-based UI primitives), `DervishiGroup.jsx` decomposed into per-section files, dead admin code deleted, i18n key-check utility, hash-routing-vs-History-API decision.
**Uses:** Tailwind v4, motion, Radix UI primitives.
**Avoids:** Pitfalls 3, 6 (Preflight conflict, motion overuse).

### Phase 3: Transform Section — Critical Path
**Rationale:** Transform submissions are the primary conversion funnel. Public form + admin lead management must land together — submissions arriving but admin not handling them = zero business value.
**Delivers:** Multi-step Transform submission with image compression + drag-reorder + Supabase Storage upload + localStorage fallback queue, redesigned public Transforms gallery with before/after slider + category filter, admin Transforms tab with status workflow + realtime new-submission badge + image lightbox.
**Uses:** react-hook-form, browser-image-compression, motion (slider), Supabase Storage + Realtime.
**Avoids:** Pitfall 4 (silent submission failure).

### Phase 4: Public Site Redesign (Remaining Sections)
**Rationale:** All other public sections can be redesigned in parallel after Phase 2 extraction. Each section is independent and migrates its own localStorage entity to Supabase.
**Delivers:** Hero, Services, Showroom, Products, Solar Calculator (with progressive disclosure), Blog, Testimonials, Consultations, Contact, FAQ, Footer — all redesigned, all mobile-first, language switcher with native names, cookie consent banner, trust signals (stats bar, testimonials carousel).
**Addresses:** All non-Transform public-site requirements.
**Avoids:** Pitfalls 5, 7 (long-language layout, image performance).

### Phase 5: Admin Redesign & Data Completion
**Rationale:** Admin polish blocks no public conversion, but multi-device admin is a stated goal. Consolidating all 10 tabs to a consistent shell is one phase of focused work.
**Delivers:** Admin shell redesign (sidebar, density, navigation), all 10 tabs refactored to a single layout pattern, sortable/filterable/searchable tables, react-hook-form replacing manual field state, all remaining entities migrated to Supabase, tablet-responsive admin.
**Uses:** TanStack Table patterns, react-hook-form, Radix UI Dialog/DropdownMenu.

### Phase 6: SEO, Quality & Launch Hardening
**Rationale:** Cross-cutting concerns are best addressed once at the end against the integrated system, not in each phase.
**Delivers:** Hash routing decision implemented (if History API was chosen), Lighthouse mobile ≥ 90 verified, WCAG AA audit + fixes, German/Greek layout regression sweep, `prefers-reduced-motion` end-to-end test, image pipeline (Supabase Storage transforms) verified across all gallery uses, sitemap + meta tags + OG images, deployment hardening.
**Avoids:** Last-mile regressions, accessibility gaps, performance debt.

### Phase Ordering Rationale

- **Phase 1 first because:** Security + foundation. Cannot run in parallel with anything else — every later phase depends on Auth and the schema.
- **Phase 2 second because:** Component extraction unblocks parallel redesign work; design system unblocks visual implementation. Both are one-time investments.
- **Phase 3 before Phase 4 because:** Transform is the primary conversion funnel — it ships in isolation to reduce risk and validate the integrated stack (motion + Supabase + image pipeline) end-to-end on the most important user journey.
- **Phase 4 before Phase 5 because:** Public site impacts conversion (revenue); admin impacts internal operations (lower urgency). Ship public-facing improvements first.
- **Phase 6 last because:** Cross-cutting quality work needs the full system to audit against.

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 3:** `browser-image-compression` current API/maintenance; Supabase `postgres_changes` realtime subscription setup; `react-compare-image` vs custom clip-path for before/after slider
- **Phase 4:** Solar calculator UX (live competitor audit recommended — Sunrun, SolarEdge); cookie banner copy for Albanian PDPSA + EU GDPR
- **Phase 6:** Supabase Storage image transform URL parameter syntax (verify at implementation); SEO if migrating to History API (hosting config, redirects)

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Supabase Auth setup and `git filter-repo` are fully documented
- **Phase 2:** Tailwind v4 + Vite integration is documented in official docs
- **Phase 5:** TanStack Table and `react-hook-form` patterns are stable

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM–HIGH | Tailwind v4 HIGH (official docs verified); motion/Supabase MEDIUM (web verification limited) |
| Features | MEDIUM–HIGH | Form UX/slider patterns HIGH; solar calculator UX MEDIUM; GDPR specifics MEDIUM |
| Architecture | HIGH | Direct codebase analysis of all source files |
| Pitfalls | HIGH | Pitfalls 1–4 are directly observed in the codebase, not hypothetical |

**Overall confidence:** MEDIUM–HIGH

### Gaps to Address

- **Supabase Storage image transform URL syntax** — verify exact parameter names at implementation in Phase 3/6
- **`browser-image-compression` package vitality** — confirm via `npm info` before locking in Phase 3
- **`motion` exact current version** — verify via `npm info motion` before installing in Phase 2
- **Hash routing vs History API** — must be decided in Phase 2 (before IA rebuild) to avoid rebuilding navigation twice
- **Tailwind v4 Preflight-disable mechanism** — verify v4 syntax (PITFALLS.md cites v3 syntax)
- **Albanian PDPSA cookie consent** — verify current legal status before Phase 4 cookie banner copy
- **Multi-admin / role-based access** — decide before Phase 1 schema is finalized whether multiple admin users / roles are in scope

## Sources

### Primary (HIGH confidence)
- Tailwind CSS v4 official docs (tailwindcss.com) — version, plugin, syntax, dark variant
- Direct codebase audit — DervishiGroup.jsx structure, hook patterns, localStorage keys, hardcoded credentials

### Secondary (MEDIUM confidence)
- Training data on Supabase JS v2 patterns — Auth, queries, Storage, Realtime
- Training data on motion (formerly framer-motion) v11 rebrand
- NNGroup / Baymard guidance on form UX, language switchers, infinite scroll anti-pattern
- TanStack Query v5 React 19 compatibility

### Tertiary (LOW confidence — needs validation)
- Supabase Storage image transform URL parameter exact syntax
- `browser-image-compression` current maintenance status
- Albanian PDPSA cookie consent requirements

---
*Research completed: 2026-05-09*
*Ready for roadmap: yes*

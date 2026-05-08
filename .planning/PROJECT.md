# Dervishi Group — UX/UI Revamp

## What This Is

Dervishi Group is a full home services group offering design, build, solar, products, and consultations. The current site is a React 19 + Vite SPA with a multilingual public marketing site and a localStorage-backed admin dashboard. This milestone is a full UX/UI revamp — premium look-and-feel, rebuilt information architecture, new brand identity, and a real backend — so visitors actually convert and the team can operate the business across devices.

## Core Value

Visitors submit a Transform request (before/after renovation project) on a polished, premium-feeling site that loads fast and works flawlessly on mobile.

## Requirements

### Validated

<!-- Existing capabilities inferred from current codebase. These already work. -->

- ✓ Public marketing site rendering (Hero, Services, Showroom, Products, Transforms, Solar Calculator, Blog, Testimonials, Consultations, Contact, FAQ, Footer) — existing
- ✓ Admin dashboard with CRUD across 10 tabs (Quotes, Transforms, Products, Blog, Projects, Solar Config, Testimonials, Consultations, Settings, Login) — existing
- ✓ 7-language i18n system (Albanian, English, Italian, German, Greek, Turkish, French) — existing
- ✓ Hash-based client-side routing — existing
- ✓ Light/dark theme via `data-theme` attribute — existing
- ✓ Error boundary at root — existing

### Active

<!-- Current scope being built toward. Hypotheses until shipped. -->

**Brand & Visual System**

- [ ] Propose 2–3 distinct premium visual directions (logo, palette, type, motion language); user picks one
- [ ] Build a complete design system from the chosen direction (color tokens, type scale, spacing, radii, shadows, motion primitives)
- [ ] Add Tailwind CSS as the styling foundation
- [ ] Add Framer Motion for premium interactions (page transitions, scroll reveals, hover states)

**Information Architecture (Public Site)**

- [ ] Restructure navigation around the primary conversion (Transform submissions)
- [ ] Redesign every public section: Hero, Services, Showroom, Products, Transforms, Solar Calculator, Blog, Testimonials, Consultations, Contact, FAQ, Footer
- [ ] Mobile-first responsive layouts at every breakpoint
- [ ] Conversion-optimized Transform submission flow (multi-step, photo upload, clear CTA)
- [ ] Premium imagery treatment (lazy loading, aspect-ratio preservation, lightbox/gallery)

**Information Architecture (Admin)**

- [ ] Redesign admin shell (sidebar/topbar, navigation, density)
- [ ] Redesign every admin tab to a consistent layout pattern
- [ ] Better data tables (sorting, filtering, search)
- [ ] Real authentication (replace hardcoded credentials)

**Backend Migration**

- [ ] Add Supabase (Postgres + Auth + Storage)
- [ ] Migrate every localStorage entity (products, quotes, transforms, blog posts, projects, testimonials, consultations, solar config, settings) to Postgres
- [ ] Real auth: Supabase Auth with email/password + session management
- [ ] Image storage: move base64-in-localStorage to Supabase Storage
- [ ] Multi-device admin (admins can sign in from anywhere, edits sync)

**Internationalization**

- [ ] Preserve all 7 languages
- [ ] Update i18n approach to work with the new component architecture
- [ ] Translate all new copy into all 7 languages

**Quality**

- [ ] Lighthouse performance ≥ 90 on mobile for the public site
- [ ] All public pages keyboard-navigable and meet WCAG AA contrast
- [ ] No regressions vs current functionality

### Out of Scope

<!-- Explicit boundaries with reasoning. -->

- Native mobile apps — web-first, premium responsive web is the goal
- E-commerce checkout / payments — not part of current business model
- Server-side rendering / Next.js migration — Vite SPA is sufficient for the audience and faster to ship
- Adding new business lines or features beyond the existing 10 admin entities — the milestone is revamp, not expansion
- Custom CMS UI for marketing content beyond the existing admin tabs — content stays in the admin entities we already have
- Analytics platform — deferred until after redesign ships and we know what to measure
- Email / SMS notification system — deferred (admin can be notified of new submissions in-app for now)
- Replacing the 7-language coverage with fewer languages — user explicitly wants all 7

## Context

**Codebase state (from `.planning/codebase/`):**

- React 19.2.5, Vite 8, vanilla CSS with custom properties, no TypeScript
- Monolithic components: `src/DervishiGroup.jsx` (1028 lines) holds the entire public site
- All persistence via `localStorage`; sessionStorage for admin auth
- Hardcoded admin credentials in `src/lib/store.js` — security concern, must be replaced when backend lands
- No tests, no CI, no environment config
- Existing photography lives in `Photos/` and `public/`

**Why this matters:**
- The DervishiGroup.jsx monolith means a redesign is also a refactor — components must be split as we redesign them
- localStorage → Supabase migration must run alongside the redesign so admin keeps working at every step
- 7-language coverage means every new copy string is a 7× translation cost — design must minimize unnecessary text

**User feedback themes (motivations driving the revamp):**
- "Looks dated / unprofessional"
- "Hard to navigate / confusing IA"
- "Not converting visitors"
- "Not mobile-friendly enough"

## Constraints

- **Tech stack**: React 19 + Vite 8 — keep the existing stack; add Tailwind + Framer Motion + Supabase on top, no framework swap
- **Languages**: All 7 languages (sq, en, it, de, el, tr, fr) preserved through the redesign — no scope reduction
- **Backend**: Supabase (Postgres + Auth + Storage) — not a custom backend; managed BaaS for speed
- **Aesthetic**: Premium / luxurious — not bold, not minimal-utility; refined editorial feel
- **Conversion focus**: Transform submissions are the primary funnel — every IA decision serves this CTA
- **Mobile**: Mobile-first, not desktop-first — current mobile experience is a top complaint
- **No SSR**: Vite SPA stays — no migration to Next.js / Remix

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full rebrand (new logo, palette, type) | Existing identity feels dated; user wants to start fresh | — Pending |
| Tailwind + Framer Motion (added on top of existing CSS) | Faster iteration on premium layouts; motion library purpose-built for the aesthetic target | — Pending |
| Supabase as backend | Managed Postgres + Auth + Storage; ships faster than a custom backend; covers multi-device admin requirement | — Pending |
| Primary conversion = Transform submissions | User's stated business priority; informs nav, hero, and CTA placement everywhere | — Pending |
| Keep all 7 languages | User explicitly required; rules out simplification of i18n cost | — Pending |
| Premium / luxurious aesthetic (not bold, not minimal-utility) | User's chosen direction; guides type, motion, palette restraint | — Pending |
| Full IA rethink (not reskin) | "Confusing IA" is one of the top complaints — visual changes alone won't fix it | — Pending |
| Replace localStorage entirely (no hybrid) | Hardcoded admin credentials are a security risk; localStorage breaks across devices; clean cut is simpler than dual-write | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-09 after initialization*

# Roadmap: Dervishi Group — UX/UI Revamp

**Created:** 2026-05-09
**Core Value:** Visitors submit a Transform request on a polished, premium-feeling site that loads fast and works flawlessly on mobile.
**Granularity:** Standard
**Coverage:** 75/75 v1 requirements mapped ✓

---

## Phases

- [ ] **Phase 1: Foundation & Security** — Supabase provisioned, credentials purged from git history, Auth live, full Postgres schema with RLS, Storage buckets configured, Settings + SolarConfig migrated as migration template
- [ ] **Phase 2: Design System & Architecture** — Brand identity chosen, full design system built, Tailwind + motion installed, DervishiGroup.jsx decomposed into per-section files, routing decision implemented, i18n key-check utility added
- [ ] **Phase 3: Transform — Critical Path** — Multi-step public submission form with image upload + fallback queue, redesigned public gallery with before/after slider, admin Transforms tab with lead status workflow and realtime badge
- [ ] **Phase 4: Public Site Redesign** — Every remaining public section redesigned mobile-first (Hero, Services, Showroom, Products, Solar, Blog, Testimonials, Consultations, Contact, FAQ, Footer), all i18n preserved and extended
- [ ] **Phase 5: Admin Redesign & Data Completion** — Admin shell redesigned, all 10 tabs refactored, data tables with sort/filter/search, remaining entities migrated to Supabase, admin responsive on tablet
- [ ] **Phase 6: Quality & Launch Hardening** — Lighthouse ≥ 90 mobile verified, WCAG AA audit, image pipeline confirmed, sitemap + meta tags, DE/EL layout regression sweep, error handling end-to-end

---

## Phase Details

### Phase 1: Foundation & Security
**Goal**: The app runs on a real, secure backend — hardcoded credentials are gone from the codebase and git history, admins log in via Supabase Auth, and the full database schema with Row Level Security is in place
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-05, FND-06, FND-07, FND-08, FND-09, FND-10, FND-11, FND-12
**Success Criteria** (what must be TRUE):
  1. Admin can log in with a real email/password via Supabase Auth and stay logged in across browser refreshes and multiple tabs
  2. Admin can log out and the session is fully cleared; a second tab auto-logs out when the first logs out
  3. `git log -p | grep -i password` returns no credential matches — history is clean
  4. The Supabase dashboard shows all 9 entity tables with RLS enabled; anon reads work for published records, writes require auth
  5. Settings and SolarConfig data are live in Supabase and the admin can edit them; no localStorage fallback needed for these two entities
**Plans**: TBD
**UI hint**: no

---

### Phase 2: Design System & Architecture
**Goal**: A premium visual identity is chosen and codified as a token-based design system; the codebase is restructured so every section is an independent file ready for redesign; routing strategy is locked in
**Depends on**: Phase 1
**Requirements**: BRD-01, BRD-02, BRD-03, BRD-04, BRD-05, BRD-06, BRD-07, BRD-08, BRD-09, ARC-01, ARC-02, ARC-03, ARC-04, ARC-05, ARC-06
**Success Criteria** (what must be TRUE):
  1. User has reviewed 3 distinct premium visual directions (logo, palette, type, motion language) and selected one; the chosen direction is documented
  2. Tailwind v4 is installed and utility classes apply correctly to new components without breaking existing vanilla-CSS sections; dark mode responds to the existing `data-theme` toggle
  3. A motion primitive set (max 3 animation types, all ≤350ms, all gated by `useReducedMotion`) is in place and documented
  4. `src/DervishiGroup.jsx` no longer exists as a monolith; every section lives in its own file under `src/public-site/sections/`; dead admin code is deleted
  5. Routing strategy is implemented (History API or hash, decided); navigating to any public section produces the correct URL
  6. The i18n key-check utility runs and reports no missing translation keys across all 7 languages for existing strings
**Plans**: TBD
**UI hint**: yes

---

### Phase 3: Transform — Critical Path
**Goal**: Visitors can submit a Transform request end-to-end with photo upload, and admins can manage incoming leads — the primary conversion funnel is fully operational
**Depends on**: Phase 2
**Requirements**: TRA-01, TRA-02, TRA-03, TRA-04, TRA-05, TRA-06, TRA-07, TRA-08, TRA-09, TRA-10, ADM-06, ADM-07, ADM-08
**Success Criteria** (what must be TRUE):
  1. A visitor can complete the multi-step Transform form (project info → drag-reorder photo upload → contact details) and reach a success screen that explains the next steps
  2. Uploading 5 photos shows a per-image progress indicator and completes without error; photos are stored in Supabase Storage (not base64)
  3. If Supabase is unreachable during submission, the form saves the payload locally and shows a "saved — will retry" message; it auto-retries on reconnect
  4. The public Transforms gallery shows before/after sliders, category filter chips, and page-based pagination
  5. Each project has a detail view with a full photo gallery and description
  6. Admin sees new Transform submissions with a realtime badge; can open an image lightbox; can move leads through New → Reviewed → Contacted → Closed
**Plans**: TBD
**UI hint**: yes

---

### Phase 4: Public Site Redesign
**Goal**: Every public section is redesigned mobile-first with the chosen brand identity, all data reads from Supabase, and all 7 languages are complete with no missing keys
**Depends on**: Phase 2 (Phase 3 can run in parallel for sections not covered there)
**Requirements**: PUB-01, PUB-02, PUB-03, PUB-04, PUB-05, PUB-06, PUB-07, PUB-08, PUB-09, PUB-10, PUB-11, PUB-12, PUB-13, PUB-14, I18N-01, I18N-02, I18N-03, I18N-04, I18N-05, I18N-06
**Success Criteria** (what must be TRUE):
  1. Hero section leads with a clear primary CTA pointing to the Transform submission form; navigation header shows phone number prominently and a WhatsApp link
  2. Every public section (Services, Showroom, Products, Solar Calculator, Blog, Testimonials, Consultations, Contact, FAQ, Footer) is redesigned and renders correctly at 360px, 768px, 1024px, and 1440px viewports
  3. Solar Calculator uses progressive disclosure (step-by-step) and reads config from Supabase
  4. Language switcher displays native language names (not just flags); switching language works on every section; all new copy exists in all 7 language files
  5. Blog article detail view renders with a typography-first reading experience; Blog list renders article cards
  6. Trust signals (stats bar, certifications) are visible on the public site
**Plans**: TBD
**UI hint**: yes

---

### Phase 5: Admin Redesign & Data Completion
**Goal**: Every admin function works on Supabase data, the admin shell has a consistent premium layout, and admins can operate from any device
**Depends on**: Phase 1
**Requirements**: ADM-01, ADM-02, ADM-03, ADM-04, ADM-05, ADM-09, ADM-10
**Success Criteria** (what must be TRUE):
  1. Admin shell has a sidebar/topbar layout consistent across all 10 tabs; admin login page matches the new brand
  2. Every admin tab uses the same layout pattern: data table with sort, filter, and search; selecting a row opens a quick-view drawer without full-page navigation
  3. All forms across all admin tabs use react-hook-form (no manual field state)
  4. Admin is fully usable on a tablet at 768px and functional (no broken layouts) on a 360px phone screen
  5. All 9 business entities (products, quotes, transforms, blogs, projects, testimonials, consultations, solar_config, settings) are live in Supabase; no localStorage reads remain for business data
**Plans**: TBD
**UI hint**: yes

---

### Phase 6: Quality & Launch Hardening
**Goal**: The integrated site meets every performance, accessibility, and SEO target; no regressions exist; the product is ready to ship
**Depends on**: Phases 3, 4, 5
**Requirements**: QLT-01, QLT-02, QLT-03, QLT-04, QLT-05, QLT-06, QLT-07, QLT-08
**Success Criteria** (what must be TRUE):
  1. Lighthouse mobile audit on the public site returns ≥ 90 for Performance, Accessibility, Best Practices, and SEO
  2. All public pages pass WCAG AA contrast checks; every interactive element is reachable and operable via keyboard alone
  3. Enabling OS "Reduce Motion" stops all Framer Motion animations and CSS keyframe animations site-wide
  4. All public gallery and hero images are served via Supabase Storage transforms with WebP format and appropriate width parameters; no raw originals are loaded on public pages
  5. Sitemap and per-page meta/OG tags are in place; page titles update on route change
  6. Theme toggle, language switcher, and all existing functionality work without regression; Supabase errors surface as toast notifications rather than silent failures
**Plans**: TBD
**UI hint**: no

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Security | 0/? | Not started | - |
| 2. Design System & Architecture | 0/? | Not started | - |
| 3. Transform — Critical Path | 0/? | Not started | - |
| 4. Public Site Redesign | 0/? | Not started | - |
| 5. Admin Redesign & Data Completion | 0/? | Not started | - |
| 6. Quality & Launch Hardening | 0/? | Not started | - |

---

*Roadmap created: 2026-05-09*
*Last updated: 2026-05-09 after initial creation*

# Requirements: Dervishi Group — UX/UI Revamp

**Defined:** 2026-05-09
**Core Value:** Visitors submit a Transform request on a polished, premium-feeling site that loads fast and works flawlessly on mobile.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation & Security

- [ ] **FND-01**: Supabase project provisioned with environment config in `.env` (anon key, project URL)
- [ ] **FND-02**: Hardcoded admin credentials removed from `src/lib/store.js` and `src/DervishiGroup.jsx`
- [ ] **FND-03**: Git history purged of hardcoded credentials via `git filter-repo`
- [ ] **FND-04**: Supabase Auth replaces hardcoded email/password check (single admin account in v1)
- [ ] **FND-05**: Admin session managed by Supabase Auth (`onAuthStateChange`, `getSession`); login/logout flow updated
- [ ] **FND-06**: Postgres schema with Row Level Security (RLS) for all 9 business entities (products, quotes, transforms, blogs, projects, testimonials, consultations, solar_config, settings)
- [ ] **FND-07**: RLS policies allow public read for published content, admin-only writes
- [ ] **FND-08**: Supabase Storage buckets configured for transform photos, product images, blog images, project images, testimonial avatars
- [ ] **FND-09**: Image upload pipeline replaces base64-in-localStorage with Supabase Storage public URLs
- [ ] **FND-10**: Image transform parameters (`?width=&quality=&format=webp`) applied to all rendered images
- [ ] **FND-11**: localStorage migration scripts/helpers ensure no data is lost when admin first logs in to new system (one-shot import path)
- [ ] **FND-12**: User preferences (`dg_theme`, `dg_lang`) remain in localStorage (not migrated)

### Brand & Design System

- [ ] **BRD-01**: Three distinct premium visual directions proposed (logo + palette + typography + motion language); user picks one
- [ ] **BRD-02**: Chosen direction implemented as a complete design system (color tokens, type scale, spacing scale, radii, shadows)
- [ ] **BRD-03**: Tailwind CSS v4 installed via `@tailwindcss/vite` plugin with `@theme {}` config
- [ ] **BRD-04**: Tailwind Preflight disabled at install; existing CSS continues to work; Preflight re-enabled section by section as components are migrated
- [ ] **BRD-05**: Tailwind dark variant wired to `data-theme` attribute (existing `useTheme` hook works unchanged)
- [ ] **BRD-06**: `motion` library (formerly `framer-motion`) installed; `useReducedMotion` integrated globally
- [ ] **BRD-07**: Motion primitive library defined: max 3 animation types, all under 350ms, all gated by `useReducedMotion()`
- [ ] **BRD-08**: Shared UI primitives built on Radix UI (Button, Input, Textarea, Select, Dialog, DropdownMenu, Tabs, Toast)
- [ ] **BRD-09**: Logo finalized in SVG form with horizontal, stacked, and icon-only variants

### Architecture & Refactoring

- [ ] **ARC-01**: `src/DervishiGroup.jsx` decomposed into per-section files (Hero, Services, Showroom, Products, Transforms, Solar, Blog, Testimonials, Consultations, Contact, FAQ, Footer)
- [ ] **ARC-02**: Dead admin code in `DervishiGroup.jsx` (lines ~523–700) deleted
- [ ] **ARC-03**: Custom data hook `useSupabaseQuery(table)` replaces `useLocalStorage(key)` across all entities
- [ ] **ARC-04**: TanStack Query v5 installed and integrated into data hooks
- [ ] **ARC-05**: Routing migrated from hash-based to History API (`react-router` v7 or equivalent); SPA fallback configured for hosting
- [ ] **ARC-06**: i18n key-check utility detects missing translations across all 7 languages (CI or build-time check)

### Public Site — Transform Section (Primary Conversion)

- [ ] **TRA-01**: Transform submission flow restructured as multi-step form (project info → photo upload → contact)
- [ ] **TRA-02**: Photo upload accepts up to 5 photos with drag-reorder UI
- [ ] **TRA-03**: Client-side image compression (`browser-image-compression`) before Supabase Storage upload
- [ ] **TRA-04**: Upload progress indicator visible during image upload
- [ ] **TRA-05**: Submission success screen explains what happens next (review timeline, contact expectation)
- [ ] **TRA-06**: localStorage fallback queue retains submission if Supabase is unreachable; retries on reconnect
- [ ] **TRA-07**: Public Transforms gallery displays before/after slider for each project
- [ ] **TRA-08**: Gallery has category filter chips (renovation type, room, etc.)
- [ ] **TRA-09**: Gallery uses page-based pagination (not infinite scroll)
- [ ] **TRA-10**: Each project has a detail view with full photo gallery + description

### Public Site — Other Sections

- [ ] **PUB-01**: Hero section redesigned with primary CTA driving to Transform submission
- [ ] **PUB-02**: Services section redesigned (renovation, solar, products, consultations)
- [ ] **PUB-03**: Showroom section redesigned with image gallery
- [ ] **PUB-04**: Products section redesigned with grid layout
- [ ] **PUB-05**: Solar Calculator redesigned with progressive disclosure (step-by-step)
- [ ] **PUB-06**: Blog section redesigned with article cards
- [ ] **PUB-07**: Blog article detail view redesigned (typography-first reading experience)
- [ ] **PUB-08**: Testimonials section redesigned with carousel/grid
- [ ] **PUB-09**: Consultations form redesigned (booking flow)
- [ ] **PUB-10**: Contact section redesigned with WhatsApp link + visible phone in header
- [ ] **PUB-11**: FAQ section redesigned with accordion
- [ ] **PUB-12**: Footer redesigned with sitemap and trust signals
- [ ] **PUB-13**: Trust signals (stats bar, certifications) added to public site
- [ ] **PUB-14**: Header navigation restructured around Transform conversion goal

### Internationalization

- [ ] **I18N-01**: All 7 languages preserved (sq, en, it, de, el, tr, fr) through redesign
- [ ] **I18N-02**: Language switcher displays native names (Italiano, Deutsch, Ελληνικά, etc.) not just flags
- [ ] **I18N-03**: All new copy added to all 7 language files
- [ ] **I18N-04**: Components tested in German and Greek (longest strings) to catch layout breakage
- [ ] **I18N-05**: i18n.js auto-detection from browser navigator preserved
- [ ] **I18N-06**: Language preference persists in localStorage (`dg_lang`)

### Admin Dashboard

- [ ] **ADM-01**: Admin shell redesigned (sidebar/topbar, density, navigation)
- [ ] **ADM-02**: All 10 admin tabs refactored to consistent layout pattern
- [ ] **ADM-03**: Data tables support sorting, filtering, and search
- [ ] **ADM-04**: `react-hook-form` replaces manual field state in admin forms
- [ ] **ADM-05**: Admin tables have quick-view drawer for row details (vs full-page nav)
- [ ] **ADM-06**: Lead status workflow (New → Reviewed → Contacted → Closed) for transforms, quotes, consultations
- [ ] **ADM-07**: Realtime new-submission badge across tabs (via Supabase `postgres_changes`)
- [ ] **ADM-08**: Image lightbox in admin for transform photos
- [ ] **ADM-09**: Admin layout responsive on tablet (≥768px); functional on phone (≥360px)
- [ ] **ADM-10**: Admin login page redesigned to match new brand

### Quality & Performance

- [ ] **QLT-01**: Lighthouse mobile score ≥ 90 on the public site (Performance, Accessibility, Best Practices, SEO)
- [ ] **QLT-02**: All public pages keyboard-navigable and meet WCAG AA contrast
- [ ] **QLT-03**: `prefers-reduced-motion` honored across all animated components
- [ ] **QLT-04**: Mobile-first responsive layouts at every breakpoint (≥360px, ≥768px, ≥1024px, ≥1440px)
- [ ] **QLT-05**: Images served via Supabase Storage transforms with WebP and width parameters
- [ ] **QLT-06**: Existing functionality preserved (no regressions on theme, language, routing)
- [ ] **QLT-07**: Sitemap and basic meta tags / OG images for SEO
- [ ] **QLT-08**: Error boundary at root preserved; Supabase error toast notifications

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Multi-Admin & Roles

- **ROLE-01**: Multiple admin user accounts
- **ROLE-02**: Role-based permissions (editor vs superadmin)
- **ROLE-03**: Admin user management UI

### Notifications

- **NOTF-01**: Email notification on new Transform submission
- **NOTF-02**: SMS notification on new Quote request
- **NOTF-03**: Admin notification preferences

### Analytics & Tracking

- **ANL-01**: Analytics platform integration (Plausible / GA4)
- **ANL-02**: Conversion tracking for Transform submissions
- **ANL-03**: Cookie consent banner (when tracking is added)

### Content Workflow

- **CWF-01**: Draft / scheduled publishing for blog posts
- **CWF-02**: Activity log / audit trail in admin
- **CWF-03**: Drag-reorder of items in admin (products, projects, etc.)

### Advanced Features

- **ADV-01**: Live chat / WhatsApp Business widget
- **ADV-02**: E-commerce checkout for products
- **ADV-03**: Booking calendar for consultations
- **ADV-04**: Customer-facing accounts (track quote status)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Native mobile apps | Web-first; premium responsive web is the goal |
| E-commerce checkout / payments | Not part of current business model |
| SSR / Next.js migration | Vite SPA is sufficient; faster to ship |
| New business lines beyond existing 10 entities | Milestone is revamp, not expansion |
| Custom CMS UI beyond existing admin tabs | Existing entity model covers all needs |
| Live chat widget in v1 | LCP cost > conversion benefit; staffing burden; defer to v2 |
| Infinite scroll on galleries | Anti-pattern per Baymard; pagination converts better |
| Email/SMS notifications in v1 | In-app realtime sufficient; defer to v2 |
| Multi-admin / role-based access in v1 | User chose single admin for simplicity |
| Cookie consent banner in v1 | No tracking cookies in v1; revisit when analytics is added |
| Activity log / audit trail | Not needed at launch; defer to v2 |
| Reducing the 7-language coverage | User explicitly required all 7 |
| `react-i18next` migration | Existing custom system is fine; ~50KB cost not justified |
| `shadcn/ui` | TS-only CLI; project is plain JS — Radix primitives used instead |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Pending |
| FND-02 | Phase 1 | Pending |
| FND-03 | Phase 1 | Pending |
| FND-04 | Phase 1 | Pending |
| FND-05 | Phase 1 | Pending |
| FND-06 | Phase 1 | Pending |
| FND-07 | Phase 1 | Pending |
| FND-08 | Phase 1 | Pending |
| FND-09 | Phase 1 | Pending |
| FND-10 | Phase 1 | Pending |
| FND-11 | Phase 1 | Pending |
| FND-12 | Phase 1 | Pending |
| BRD-01 | Phase 2 | Pending |
| BRD-02 | Phase 2 | Pending |
| BRD-03 | Phase 2 | Pending |
| BRD-04 | Phase 2 | Pending |
| BRD-05 | Phase 2 | Pending |
| BRD-06 | Phase 2 | Pending |
| BRD-07 | Phase 2 | Pending |
| BRD-08 | Phase 2 | Pending |
| BRD-09 | Phase 2 | Pending |
| ARC-01 | Phase 2 | Pending |
| ARC-02 | Phase 2 | Pending |
| ARC-03 | Phase 2 | Pending |
| ARC-04 | Phase 2 | Pending |
| ARC-05 | Phase 2 | Pending |
| ARC-06 | Phase 2 | Pending |
| TRA-01 | Phase 3 | Pending |
| TRA-02 | Phase 3 | Pending |
| TRA-03 | Phase 3 | Pending |
| TRA-04 | Phase 3 | Pending |
| TRA-05 | Phase 3 | Pending |
| TRA-06 | Phase 3 | Pending |
| TRA-07 | Phase 3 | Pending |
| TRA-08 | Phase 3 | Pending |
| TRA-09 | Phase 3 | Pending |
| TRA-10 | Phase 3 | Pending |
| ADM-06 | Phase 3 | Pending |
| ADM-07 | Phase 3 | Pending |
| ADM-08 | Phase 3 | Pending |
| PUB-01 | Phase 4 | Pending |
| PUB-02 | Phase 4 | Pending |
| PUB-03 | Phase 4 | Pending |
| PUB-04 | Phase 4 | Pending |
| PUB-05 | Phase 4 | Pending |
| PUB-06 | Phase 4 | Pending |
| PUB-07 | Phase 4 | Pending |
| PUB-08 | Phase 4 | Pending |
| PUB-09 | Phase 4 | Pending |
| PUB-10 | Phase 4 | Pending |
| PUB-11 | Phase 4 | Pending |
| PUB-12 | Phase 4 | Pending |
| PUB-13 | Phase 4 | Pending |
| PUB-14 | Phase 4 | Pending |
| I18N-01 | Phase 4 | Pending |
| I18N-02 | Phase 4 | Pending |
| I18N-03 | Phase 4 | Pending |
| I18N-04 | Phase 4 | Pending |
| I18N-05 | Phase 4 | Pending |
| I18N-06 | Phase 4 | Pending |
| ADM-01 | Phase 5 | Pending |
| ADM-02 | Phase 5 | Pending |
| ADM-03 | Phase 5 | Pending |
| ADM-04 | Phase 5 | Pending |
| ADM-05 | Phase 5 | Pending |
| ADM-09 | Phase 5 | Pending |
| ADM-10 | Phase 5 | Pending |
| QLT-01 | Phase 6 | Pending |
| QLT-02 | Phase 6 | Pending |
| QLT-03 | Phase 6 | Pending |
| QLT-04 | Phase 6 | Pending |
| QLT-05 | Phase 6 | Pending |
| QLT-06 | Phase 6 | Pending |
| QLT-07 | Phase 6 | Pending |
| QLT-08 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 75 total
- Mapped to phases: 75
- Unmapped: 0 ✓

**Note on count:** Initial traceability stated 71 requirements. Actual count from enumerated requirement IDs is 75 (FND×12 + BRD×9 + ARC×6 + TRA×10 + PUB×14 + I18N×6 + ADM×10 + QLT×8). All 75 are mapped.

**Key departure from initial traceability:** ADM-06, ADM-07, ADM-08 are assigned to Phase 3 (not Phase 5) because they are tightly coupled to the Transform critical path — lead status workflow, realtime badge, and image lightbox are the admin side of the Transform funnel and must ship together with the public form.

---
*Requirements defined: 2026-05-09*
*Last updated: 2026-05-09 — traceability updated after roadmap creation; ADM-06/07/08 moved to Phase 3*

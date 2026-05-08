# Feature Research

**Domain:** Premium multilingual home-services marketing site + content-heavy admin dashboard
**Researched:** 2026-05-09
**Confidence:** MEDIUM (training knowledge through Aug 2025; web verification blocked)

> **Note on sources:** WebSearch and WebFetch were unavailable for this session. All findings
> draw from training knowledge (NNGroup research, Baymard Institute UX studies, industry
> patterns from Houzz, Angi, Thumbtack, Sunrun, Tesla Solar, and comparable premium home
> services brands). Confidence is MEDIUM unless stated otherwise. Flag any finding that drives
> a major implementation decision for live verification before building.

---

## Scope Reminder

Existing features (Hero, Services, Showroom, Products, Transforms, Solar Calculator, Blog,
Testimonials, Consultations, Contact, FAQ, admin CRUD across 10 tabs) are NOT re-evaluated
here. This file answers: **what's missing, what needs to be upgraded, and what should be
avoided?**

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that premium home-service visitors and admin operators assume exist. Missing = feels
broken or dated.

#### Public Site — Trust & Conversion

| Feature | Why Expected | Complexity | Serves Transform Goal? | Notes |
|---------|--------------|------------|------------------------|-------|
| Sticky navigation with single prominent CTA | Every premium site anchors one action in the nav; visitors scan for it immediately | LOW | YES — nav CTA should be "Submit Your Project" | CTA label must be benefit-led ("Get Your Free Renovation Review"), not generic ("Submit") |
| Progress indicator on multi-step forms | Users abandon forms when they can't see how long it takes; Baymard shows step indicators reduce abandonment 20–30% | LOW | YES — Transform submission is a multi-step form | Numbered steps + estimated time ("3 steps, ~2 min") at top |
| Mobile-optimized photo upload (camera capture) | Majority of home-service leads come from mobile; file picker that opens camera is expected | MEDIUM | YES — Transform submission requires photo upload | `accept="image/*" capture="environment"` on input; compress client-side before upload |
| Client-side image preview before submit | Users expect to see thumbnails of uploaded photos before committing | LOW | YES | Show drag-reorder + individual remove on each thumbnail |
| Inline form validation with clear error messages | Red borders and error text on blur, not only on submit | LOW | YES | Never show ALL errors at once on submit; validate field-by-field as user completes each one |
| Success state with next-step messaging | After Transform submission, user must know what happens next and when | LOW | YES | "We'll review your project and contact you within 48 hours" + confirmation number |
| Testimonial with attribution (name, project type, photo) | Anonymous testimonials are trusted less; name + project context signals authenticity | LOW | NO | Even initials + city + service type significantly increases trust |
| Google Maps or address embed | Service area credibility; users verify you're local | LOW | NO | Embed or link to Google Maps for main office/showroom |
| Visible phone number in header | 40%+ of home service site visitors want to call; phone-only in footer is a conversion killer | LOW | NO | Click-to-call `<a href="tel:…">` in header, especially on mobile |
| HTTPS / trust badges near CTAs | Security indicators near forms reduce abandonment | LOW | YES | Not just padlock — "Your data is secure" text near form submit buttons |
| Clear service area statement | "Serving [Region] since [year]" — visitors need to know you operate in their area before they invest time | LOW | NO | Surface on Hero and Contact sections |

#### Public Site — Content & Navigation

| Feature | Why Expected | Complexity | Serves Transform Goal? | Notes |
|---------|--------------|------------|------------------------|-------|
| Keyboard-accessible navigation | WCAG AA; also SEO signal; users with motor impairment navigate by keyboard | MEDIUM | NO | Focus rings, skip-to-content link, tab order matches visual order |
| Scroll-to-section anchor links that update URL hash | Users share links to specific sections; #solar, #contact etc. already exist but must work reliably | LOW | NO | Each section gets a stable `id`; nav smooth-scrolls to it |
| Estimated read time on blog posts | Sets expectation; improves engagement for long-form content | LOW | NO | `~N min read` in post header |
| 404 / empty state handling | Empty gallery, no blog posts, 0 testimonials — each needs a human message not a blank void | LOW | NO | Every list/grid must have a non-empty empty state |
| Cookie / privacy notice | GDPR-adjacent; expected in EU markets (Albania, Italy, Germany, France, Greece) | LOW | NO | Minimal banner with Accept / Decline; don't over-engineer consent categories |

#### Admin Dashboard — Operational Basics

| Feature | Why Expected | Complexity | Serves Transform Goal? | Notes |
|---------|--------------|------------|------------------------|-------|
| New submission badge / indicator | Admin needs to know new Transforms arrived without refreshing | MEDIUM | YES — core admin need | Red dot / count badge on Transforms tab; Supabase realtime subscription makes this feasible |
| Status workflow on Transform submissions | "New → Reviewed → Contacted → Closed" — admin can't track leads without status | LOW | YES | Status column + filter; status change triggers toast |
| Sortable, filterable data tables | Operators expect click-to-sort on any column; filter by status, date range | MEDIUM | YES — sorting by "new" submissions | Use a lightweight headless table (TanStack Table) not custom built |
| Row-level bulk actions | Select multiple → delete, export, change status | MEDIUM | YES | Checkbox column + sticky bulk-action bar |
| CSV export per tab | Business operators always want to pull data to Excel; this is non-negotiable for small business ops | LOW | NO | Already partially exists (downloadCSV in store.js) — surface it prominently |
| Image lightbox in admin records | Admin reviewing Transform submissions needs to see uploaded photos at full size | LOW | YES | Click thumbnail → modal with zoom; keyboard arrow navigation between photos |
| Responsive admin (tablet + desktop) | Admins increasingly work on tablets; admin that only works at 1440px is broken for field use | MEDIUM | NO | Admin shell must reflow at ≥768px; sidebar collapses to icon rail on tablet |
| Session persistence across tabs | sessionStorage clears on tab close — admin loses session opening a link in new tab | LOW | NO | Switch to Supabase Auth (JWT in localStorage); this is solved by the backend migration |
| Confirmation dialogs for destructive actions | Already exists (useConfirm) but must be present on every delete path | LOW | NO | Audit all delete paths; useConfirm already in codebase — ensure it's wired everywhere |
| Toast notifications for all mutations | Every create/update/delete should surface a brief dismissable confirmation | LOW | NO | Already exists in codebase; ensure 100% coverage |

---

### Differentiators (Competitive Advantage)

Features that separate a premium home-services brand from a generic Wix/Squarespace site. Not
assumed, but highly valued when present.

#### Transform Submission Experience

| Feature | Value Proposition | Complexity | Serves Transform Goal? | Notes |
|---------|-------------------|------------|------------------------|-------|
| Guided "project story" submission flow | Instead of a plain upload form, ask 3–4 guided questions: "What room?", "What was the problem?", "What changed?" — makes the submission feel like a premium consultation, not a contact form | MEDIUM | YES — primary differentiator | Each step: one question, large touch target, illustration/icon. Step 3 is the photo upload. |
| Client-side image compression before upload | Supabase Storage costs scale with file size; mobile photos are 5–15MB each; compress to ≤1MB before upload | MEDIUM | YES | Use `browser-image-compression` library; show progress per file |
| Drag-to-reorder photo sequence | Lets users control "before" vs "after" narrative; signals premium attention to their story | LOW | YES | CSS drag-and-drop with `@dnd-kit/sortable`; visual handles |
| Before/after slider in public gallery | Side-by-side is table stakes; interactive slider (drag to reveal) is the premium standard (Houzz, Thumbtack use it) | MEDIUM | YES | `react-compare-image` or custom CSS clip-path approach; mobile touch must work |
| Project category tagging | Users browsing the Transforms gallery want to filter by "Kitchen", "Bathroom", "Solar", "Exterior" — without it the gallery is a dump | LOW | YES | Tag filter chips above gallery; each Transform record gets a category in admin |
| Social sharing on individual Transform projects | Homeowners love sharing their renovations; viral loop for brand awareness | LOW | YES (indirect) | Share button on each project: copy link + native share API on mobile |

#### Solar Calculator UX

| Feature | Value Proposition | Complexity | Serves Transform Goal? | Notes |
|---------|-------------------|------------|------------------------|-------|
| Animated result reveal | Most solar calculators show a static output; an animated number counter (0 → savings amount) creates emotional impact and encourages sharing | LOW | NO | CSS counter animation or `framer-motion`'s `useMotionValue`; fire on scroll-into-view |
| Instant result (no submit button) | Best solar UX (Sunrun, SolarEdge configurators) updates estimate as user adjusts sliders; no form submit required | LOW | NO | Derived state from slider values; `useMemo` for calculation; no async calls needed |
| "What this means" plain-language callout | Show the number AND explain it: "That's roughly your electric bill for 2 years" — contextualizes the abstract figure | LOW | NO | Single sentence beneath the number; translatable string |
| CTA inside calculator result | "Interested? Get a free solar consultation" button that appears only AFTER user sees a positive result | LOW | NO (conversion adjacent) | Result threshold: if savings > 0, show CTA linking to Consultations section |
| Input presets by property type | "Apartment / House / Villa / Commercial" — different avg consumption; presets reduce friction for users who don't know their kWh | LOW | NO | Radio buttons at top of calculator; each preset loads reasonable default slider values |

#### Trust & Social Proof

| Feature | Value Proposition | Complexity | Serves Transform Goal? | Notes |
|---------|-------------------|------------|------------------------|-------|
| Project count stats bar | "142 Projects Completed · 7 Countries · 12 Years" — at-a-glance credibility bar near hero or above fold | LOW | YES (indirect) | Animated count-up on scroll; values managed in admin Settings tab |
| Video testimonial embed | Written testimonials are easily faked; a 30-second video testimonial is the highest-trust social proof for premium home services | MEDIUM | NO | YouTube/Vimeo embed support in Testimonials admin tab; optional field |
| Partner / manufacturer logos | "Certified partner of [Brand]" strips signal quality assurance, especially for solar and building materials | LOW | NO | Horizontal logo strip in Services or Footer; static images in admin |
| Real project timelines in Transform gallery | "Started: March 2025 · Completed: April 2025" — specificity signals authenticity | LOW | YES | Add start_date, end_date fields to Transform admin tab |

#### Multilingual UX

| Feature | Value Proposition | Complexity | Serves Transform Goal? | Notes |
|---------|-------------------|------------|------------------------|-------|
| Language switcher in header (flag + code) | Language icon + current language code ("EN") in nav is the industry standard; icon-only confuses users; dropdown with native language names ("Italiano", "Deutsch") | LOW | NO | Show current lang as code (EN/IT/DE…) + globe icon; dropdown lists all 7 in their native script |
| Language-persistent deep links | If a user shares `/#/solar` and their browser is set to German, the page should load in German automatically | LOW | NO | Already handled by `dg_lang` in localStorage + `useI18n` detection; just needs testing |
| Per-language WhatsApp / contact number | Markets differ: Italian customers may use WhatsApp, Albanian may prefer phone — surfacing the right channel per language is a trust signal | MEDIUM | NO | `settings` entity already exists in admin; add language-keyed contact fields |

#### Admin Productivity

| Feature | Value Proposition | Complexity | Serves Transform Goal? | Notes |
|---------|-------------------|------------|------------------------|-------|
| Global search across all entities | As content grows (100+ products, 200+ transforms), search is the only scalable navigation | MEDIUM | YES — find Transform submissions fast | `Cmd+K` command palette or search bar in topbar; Supabase full-text search via `websearch_to_tsquery` |
| Draft / Published toggle on Blog posts | Operators need to write posts ahead of publication without immediately showing them publicly | LOW | NO | Boolean `published` field already likely present; just needs surfacing as a toggle |
| Quick-view panel on Transform submissions | Click a row → side panel slides in with photos + details + status controls, without leaving the list | MEDIUM | YES — speeds admin review workflow | Sheet/drawer component (Radix UI `Sheet` or custom); avoids full-page navigate |
| Inline image reorder in admin Transform editor | When admin edits a Transform, they should reorder the before/after photo sequence the same way the submitter can | MEDIUM | YES | Same `@dnd-kit/sortable` component used in public form |
| Activity log per submission | Timestamp trail: "Submitted → Reviewed by [admin] → Status changed to Contacted" | HIGH | YES | Requires `events` table in Supabase; defer to v1.x unless required at launch |

---

### Anti-Features (Deliberately Not Building)

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| Live chat widget (Intercom/Tidio/Crisp) | "Competitors have it" / increases perceived responsiveness | Adds ~80KB JS, slows LCP by 200–400ms, requires staffing to be useful, creates GDPR data processing obligations in 5 of 7 language markets | Prominent phone number + WhatsApp link in header; contact form with sub-24hr reply SLA stated explicitly |
| Full e-commerce checkout for Products | "Users want to buy online" | Out of scope per PROJECT.md; requires payment processing, inventory, returns — a different product; adds months | "Request a Quote" CTA on each product; leads to Consultations flow |
| User accounts / customer portal | "Customers want to track their project" | Scope explosion; requires registration, password reset, email flows, notifications — distracts from core revamp | Success screen after Transform submission with reference number; admin can follow up by phone/email |
| Automated email notifications on submission | "We need to know immediately when someone submits" | Not in scope per PROJECT.md; requires email service integration (Resend/SendGrid), templates in 7 languages, GDPR opt-in management | Supabase realtime → admin dashboard badge; admin checks dashboard; defer email to post-launch |
| Real-time collaboration in admin | "Multiple admins editing at same time" | Conflict resolution is complex; the business is a small team with one primary admin | Supabase multi-device auth (any device, not simultaneous editing) covers the real need |
| AI-generated project descriptions | "Auto-fill the description from photos" | Vision API latency, cost per submission, unpredictable quality in 7 languages, creates trust issues if admin doesn't review | Simple text field; admin writes short description; quality is controlled |
| Map-based project portfolio | "Show where our projects are on a map" | Privacy concern (reveals customer addresses), maintenance burden, adds Google Maps billing | Project count stats bar + city/region text tag on each Transform card |
| Infinite scroll on Transforms gallery | "Modern sites use infinite scroll" | Baymard research consistently shows pagination outperforms infinite scroll for exploratory gallery browsing — users lose their place, can't share a position, and abandon more | Page-based pagination (12 per page) with clear "Next / Previous" and total count |

---

## Feature Dependencies

```
Transform Submission Flow (multi-step guided form)
    └──requires──> Client-side image compression
    └──requires──> Drag-to-reorder photo thumbnails
    └──requires──> Progress indicator (step 1/3 etc.)
    └──requires──> Success state with confirmation number
                       └──requires──> Supabase write (transforms table)

Before/After Slider (public gallery)
    └──requires──> Project category tags (for filter chips above gallery)
    └──requires──> Transforms stored in Supabase (not localStorage)

Admin Transform Quick-view panel
    └──requires──> Image lightbox (full-size photo viewer)
    └──requires──> Status workflow fields (new → reviewed → contacted)

Admin New-submission badge
    └──requires──> Supabase realtime subscription (postgres_changes)
    └──requires──> Status workflow (badge clears when status moves off "New")

Solar Calculator instant result
    └──enhances──> CTA inside calculator result
    └──requires──> Admin Solar Config CRUD (already exists — values drive the formula)

Project count stats bar (animated)
    └──requires──> Settings fields in admin (already exists as Settings tab)

Language switcher (native names dropdown)
    └──enhances──> Language-persistent deep links
    └──requires──> useI18n hook (already exists)

Global admin search
    └──requires──> Supabase full-text search (tsquery)
    └──requires──> Supabase migration complete (all entities in Postgres)

Activity log per Transform
    └──requires──> events table in Supabase
    └──conflicts──> MVP scope — defer to v1.x
```

### Dependency Notes

- **Transform submission requires Supabase:** The photo upload to Supabase Storage + record insert must land before the public submission flow can be rebuilt. This is the critical path for the entire revamp.
- **Admin badge requires Supabase realtime:** Can't be built until Supabase migration is done. Don't stub it with polling.
- **Before/after slider requires category tags:** The gallery filter makes the slider feature worthwhile; without filtering, a large gallery is hard to navigate by project type.
- **Global admin search requires full Postgres migration:** Don't build until all entities are in Supabase — cross-entity search on a split localStorage/Supabase state is a maintenance trap.
- **Activity log conflicts with MVP scope:** Nice to have but requires an extra table and audit-write logic on every status change. Defer until v1.x validation proves the status workflow is used.

---

## MVP Definition

This is a brownfield revamp, not a greenfield launch. "MVP" here means: what must be true
for the revamp to be considered shippable — not what the minimum viable product of the
original site was.

### Launch With (v1)

- [ ] **Sticky nav with single Transform CTA** — primary conversion anchor; visible on every scroll position
- [ ] **Multi-step Transform submission flow** (3 steps: project info → photos → contact) — the entire reason for the revamp
- [ ] **Client-side image compression + preview thumbnails** — mobile photos will break Supabase Storage budget without it; no compression = broken upload experience
- [ ] **Progress indicator on submission form** — drop-off without it on mobile is significant
- [ ] **Success screen with confirmation copy** — users must know what happens after they submit
- [ ] **Before/after slider in Transforms gallery** — the primary social proof asset; slider is the 2026 gold standard vs static side-by-side
- [ ] **Project category tags + filter chips** — enables the gallery to grow without becoming a dump
- [ ] **Status workflow on Transform admin tab** (New / Reviewed / Contacted / Closed) — admin can't manage leads without this
- [ ] **New submission badge on admin Transforms tab** — Supabase realtime; tells admin immediately
- [ ] **Sortable/filterable data tables in admin** — table stakes for content-heavy admin in 2026
- [ ] **Image lightbox in admin Transform records** — admin must be able to review photos at full size
- [ ] **Language switcher with native language names** — 7-language site needs a trustworthy switcher in header
- [ ] **Visible phone number in header (click-to-call)** — removes friction for mobile visitors who want to call
- [ ] **HTTPS / "Your data is secure" copy near form CTA** — reduces form abandonment
- [ ] **Cookie/privacy banner** — required for EU markets (IT, DE, FR, GR)
- [ ] **Responsive admin at ≥768px** — tablet support for field use

### Add After Validation (v1.x)

- [ ] **Social sharing on individual Transform projects** — add once gallery has ≥20 projects to share
- [ ] **Per-language WhatsApp / contact links** — add once multi-market traffic data shows which languages convert
- [ ] **Global admin search (Cmd+K)** — add once admin has >50 transforms and struggles to find records
- [ ] **Quick-view panel on Transform list** — add once admin has expressed friction with full-page edit navigation
- [ ] **Video testimonial embed support** — add when first video testimonial is available
- [ ] **Animated stats bar (project count / years)** — add after brand identity is locked; needs real numbers
- [ ] **Solar calculator CTA inside result** — add after A/B evidence that calculator users don't convert to consultation

### Future Consideration (v2+)

- [ ] **Activity log per Transform submission** — defer until admin team size grows beyond 1–2 people
- [ ] **Drag-to-reorder photos in admin Transform editor** — defer; low admin pain point vs implementation cost
- [ ] **Partner / manufacturer logo strip** — defer until partnerships are established and logos are available
- [ ] **Real project timelines (start/end date) in gallery** — defer until admin consistently fills these fields

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Multi-step Transform submission flow | HIGH | MEDIUM | P1 |
| Client-side image compression | HIGH | LOW | P1 |
| Before/after slider in gallery | HIGH | LOW | P1 |
| Status workflow (admin Transform tab) | HIGH | LOW | P1 |
| New submission badge (realtime) | HIGH | MEDIUM | P1 |
| Sticky nav + single Transform CTA | HIGH | LOW | P1 |
| Progress indicator on form | HIGH | LOW | P1 |
| Success screen with confirmation | HIGH | LOW | P1 |
| Category tags + gallery filter | MEDIUM | LOW | P1 |
| Language switcher (native names) | HIGH | LOW | P1 |
| Phone in header (click-to-call) | HIGH | LOW | P1 |
| Sortable/filterable admin tables | HIGH | MEDIUM | P1 |
| Image lightbox in admin | MEDIUM | LOW | P1 |
| Responsive admin (tablet) | MEDIUM | MEDIUM | P1 |
| Cookie/privacy banner | MEDIUM | LOW | P1 |
| Solar calculator instant result | MEDIUM | LOW | P2 |
| Solar calculator "what this means" copy | MEDIUM | LOW | P2 |
| Solar input presets by property type | MEDIUM | LOW | P2 |
| Animated stats bar | MEDIUM | LOW | P2 |
| Project social sharing | LOW | LOW | P2 |
| Global admin search | MEDIUM | HIGH | P2 |
| Admin quick-view panel | MEDIUM | MEDIUM | P2 |
| Video testimonial embed | MEDIUM | LOW | P2 |
| Per-language WhatsApp link | LOW | MEDIUM | P2 |
| Activity log per submission | LOW | HIGH | P3 |
| Admin drag-to-reorder photos | LOW | MEDIUM | P3 |
| Partner logo strip | LOW | LOW | P3 |
| Real project timelines | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for v1 launch
- P2: Ship in v1.x once core is validated
- P3: Future consideration

---

## Competitor Feature Analysis

| Feature | Houzz | Angi / Thumbtack | Sunrun (solar) | Our Approach |
|---------|-------|------------------|----------------|--------------|
| Before/after presentation | Side-by-side + drag slider | Static gallery | N/A | Drag slider; mobile touch required |
| Social proof | Photo count + review count + years | Star rating + review count | Savings calculator | Project count stats bar + testimonials with attribution |
| Form UX | Multi-step project wizard | 3-step quote request | Slider-based estimate | 3-step guided project story (info → photos → contact) |
| Gallery filtering | Room type, style, budget | Service type, location | N/A | Category chips (Kitchen, Bathroom, Solar, Exterior, Other) |
| CTA placement | Sticky "Contact Pro" in nav | Sticky "Get Quotes" | Above fold + in calculator | Sticky nav CTA + hero CTA + inline after calculator result |
| Language support | English-only (US market) | English-only | English-only | 7 languages, native names in switcher |
| Admin | N/A (marketplace) | N/A (marketplace) | N/A | Bespoke dashboard with Supabase realtime |

---

## Sources

- NNGroup research on multi-step form UX and abandonment reduction (training knowledge through Aug 2025; not web-verified this session)
- Baymard Institute findings on infinite scroll vs pagination for gallery browsing (training knowledge; not web-verified)
- Houzz, Angi, Thumbtack, Sunrun UX patterns — observed patterns from training data, not live audit
- React ecosystem: `browser-image-compression`, `@dnd-kit/sortable`, `react-compare-image`, TanStack Table — library capabilities from training knowledge (verify current versions before implementation)
- Supabase realtime (`postgres_changes`) and full-text search (`websearch_to_tsquery`) — documented capabilities as of training cutoff; verify API surface hasn't changed
- GDPR applicability to EU markets: Albania (PDPSA aligns with GDPR), Italy, Germany, France, Greece all require consent for analytics/tracking cookies

**Confidence by area:**
- Multi-step form UX / conversion patterns: HIGH (stable, well-documented domain)
- Before/after gallery gold standard: HIGH (slider is established pattern since ~2018)
- Solar calculator UX: MEDIUM (Sunrun/SolarEdge patterns from training; not live-verified)
- Admin dashboard patterns: HIGH (TanStack Table, sortable tables, drawer panels are established 2024–2025 patterns)
- Multilingual UX (language switcher placement): MEDIUM (NNGroup recommendation from training; not web-verified)
- GDPR applicability: MEDIUM (regulatory landscape; verify current status for Albanian jurisdiction specifically)

---

*Feature research for: Dervishi Group — premium multilingual home-services marketing site + admin dashboard*
*Researched: 2026-05-09*

# Domain Pitfalls

**Domain:** Premium multilingual marketing SPA — localStorage → Supabase migration
**Project:** Dervishi Group UX/UI Revamp
**Researched:** 2026-05-09
**Confidence:** HIGH (derived from concrete codebase analysis + domain expertise)

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, admin lockout, or major rework.

---

### Pitfall 1: Hardcoded Credentials Survive in Git History

**What goes wrong:** The credentials in `src/lib/store.js:111-114` (`**REMOVED**` / `**REMOVED**`) are committed to git. Even after Supabase Auth replaces them, the plaintext password remains forever readable via `git log -p`. If the repo is ever made public, shared, or accessed by a third party, those credentials are compromised indefinitely.

**Why it happens:** Developers rotate the live credentials but don't purge git history. The new `.env`-based approach is correct going forward, but the historical commits still expose the old values.

**Consequences:** Permanent credential exposure in version history. If the admin reused that password elsewhere (email, domain host, etc.), those accounts are compromised too.

**Prevention:**
1. Before Supabase migration lands, rotate the admin password in the existing system.
2. Use `git filter-repo` (preferred over `git filter-branch`) to rewrite history and remove the literal credential strings from `store.js` and `DervishiGroup.jsx`.
3. Force-push the rewritten history and invalidate any existing clones.
4. Never commit `.env` files — add `.env.local` and `.env` to `.gitignore` before creating them.
5. Use `VITE_` prefix for any env vars exposed to the frontend, but put Supabase service-role keys only in backend/server contexts — never in the Vite bundle.

**Warning signs:** `git log --all -p | grep -i "password\|credential\|secret"` returns results. The constants `ADMIN_CREDENTIALS` or `ADMIN_USERS` appear in any commit.

**Phase:** Address in the Backend Migration phase, before Supabase Auth goes live. History purge happens once, at migration start.

---

### Pitfall 2: Admin Lockout During localStorage → Supabase Cutover

**What goes wrong:** The migration plan is a "clean cut" — drop localStorage, switch to Supabase. If the Supabase tables, RLS policies, or Auth setup have any misconfiguration, the admin panel stops working entirely. There is no fallback because the old auth code was removed. The client is locked out of their own CMS.

**Why it happens:** Single-pass migrations that treat auth and data as one atomic swap. In practice, Supabase RLS misconfiguration is the most common cause — tables are created but Row Level Security blocks all reads because the policy was written incorrectly (e.g., `auth.uid()` returns null for service-role keys, policies missing `FOR SELECT` clauses, etc.).

**Consequences:** Zero admin functionality. No way to manage content. Requires emergency rollback or late-night debugging under pressure.

**Prevention:**
1. Deploy Supabase schema + RLS + Auth in a staging environment first and manually verify every admin CRUD operation before touching production.
2. Migration order: Auth first (verify login works), then one entity (e.g., Settings), then the rest. Never migrate all 10 entities simultaneously.
3. Keep the old `useLocalStorage`-backed admin route accessible under a temporary flag (e.g., `#/admin-legacy`) until the new Supabase admin has been verified in production for at least one full session.
4. Test RLS policies explicitly with the actual `anon` role and the actual `authenticated` role using the Supabase dashboard's SQL editor before going live.

**Warning signs:** Supabase dashboard shows tables created but the API returns 403 on `SELECT`. The admin login succeeds via Supabase Auth but data fetches return empty arrays instead of errors (a common RLS misconfiguration symptom).

**Phase:** Backend Migration phase. Dedicate a sub-phase checkpoint to "staging admin verification" before any production cutover.

---

### Pitfall 3: Supabase Outage Silently Drops Form Submissions

**What goes wrong:** The Transform submission form (the primary conversion funnel) does a `supabase.from('transforms').insert(...)`. If Supabase is down or unreachable (network hiccup, rate limit, RLS error returning a non-obvious status), the insert silently fails and the visitor's submission is lost. The current code has a precedent for silent failure — multiple empty `catch` blocks in `store.js`.

**Why it happens:** Developers test the happy path only. Error state UI is an afterthought. Supabase JS client returns an `{ error }` object on failure rather than throwing — code that only checks `data` and ignores `error` will silently discard failures.

**Consequences:** Lost leads. The client's primary business metric (Transform requests) has invisible holes in it. Visitors get no feedback and do not retry.

**Prevention:**
1. Always destructure `{ data, error }` from every Supabase call and treat `error !== null` as a hard failure with user-visible feedback.
2. For the Transform submission form specifically: if the Supabase insert fails, persist the payload to `localStorage` as a "pending submission" queue, show the user a "saved locally — will retry" message, and attempt re-submission on next page load.
3. Implement a submission confirmation step ("Your request was received — reference #XYZ") that only shows after a confirmed successful insert.
4. Add a retry mechanism with exponential backoff for transient network errors.

**Warning signs:** Form submit handler does not have explicit `if (error)` branches. No error state in the submission form component. No user-visible failure message.

**Phase:** Public Site revamp (Transform submission flow). The offline/retry pattern should be built into the form from the start, not added later.

---

### Pitfall 4: Tailwind Preflight Nukes Existing CSS

**What goes wrong:** Tailwind's `@tailwind base` directive injects Preflight — an opinionated CSS reset derived from modern-normalize. It sets `display: block` on images, removes all default margins/padding, resets heading font sizes to `1em`, and removes list styles. Every existing style in `src/index.css` and `src/App.css` that relies on browser defaults or the existing CSS custom properties will either conflict or be silently overridden.

**Why it happens:** Tailwind is added to the project with the standard setup instructions without accounting for the existing vanilla CSS that uses `--text`, `--bg`, `--accent` custom properties for theming.

**Consequences:** Entire visual system breaks on installation. Sections that currently look fine render without margins, headings shrink, lists lose bullets. Fixing it takes longer than the initial "just add Tailwind" step.

**Prevention:**
1. **Disable Preflight entirely** in `tailwind.config.js` using `corePlugins: { preflight: false }` for the initial integration. Add it back only once the existing CSS is fully replaced.
2. Add Tailwind via `@layer` directives so Tailwind utilities remain below existing cascade specificity during the transition.
3. Audit every CSS custom property (`--text`, `--bg`, `--accent`, etc.) and map them to Tailwind theme extensions in `tailwind.config.js` so both systems use the same tokens.
4. Migrate sections one at a time: old CSS stays for unmigrated sections, Tailwind classes apply to newly built components.

**Warning signs:** Running `npm install tailwindcss` and importing `@tailwind base` causes visible layout breaks on first hot-reload. Heading text suddenly renders at body font size.

**Phase:** Brand & Visual System phase (first phase). Preflight decision must be made at Tailwind installation, not after.

---

### Pitfall 5: Framer Motion Degrades into Jank

**What goes wrong:** Framer Motion animations are added enthusiastically — every section has a `whileInView` fade, every card has a `whileHover` scale, every page transition has a layout animation. On mid-range Android devices (the actual mobile audience for a home services company in Albania/Italy), these stack into dropped frames, delayed interactions, and a site that feels slower than the plain HTML version did.

**Why it happens:** Development happens on a MacBook Pro with a 120Hz display. The "premium feel" looks smooth in dev. Testing on real mobile hardware is deferred or skipped.

**Consequences:** The site achieves the opposite of "premium." Visitors on €200 Android phones experience lag on every scroll and tap. Lighthouse performance score collapses well below the 90 target.

**Prevention:**
1. **Limit to three animation primitives:** entrance fade (opacity 0→1, translateY 20px→0), hover lift (scale 1→1.02, shadow), and page transition (opacity). Everything else is noise.
2. Use `transform` and `opacity` only — these are the only CSS properties that don't trigger layout or paint (GPU-composited). Never animate `height`, `width`, `padding`, `margin`, `top`, `left` with Framer Motion.
3. Set `will-change: transform` only on actively animating elements, not statically.
4. Stagger duration: keep all durations under 350ms. Entrance delays over 600ms feel broken on slow devices.
5. Test on a real mid-range Android device (or Chrome DevTools CPU throttling at 4x) before finalizing any animation.

**Warning signs:** `whileInView` on more than 5 components on a single scroll page. Any animation with `duration > 0.5`. Layout animations (`layoutId`) used for non-critical UI.

**Phase:** Brand & Visual System (establish animation primitives). Public Site revamp (enforce the primitives, don't expand them).

---

### Pitfall 6: `prefers-reduced-motion` Ignored — Accessibility and Legal Risk

**What goes wrong:** Framer Motion animations are implemented globally. Users who have set "reduce motion" in their OS accessibility settings (a legally protected accessibility accommodation in many EU countries where this site operates — Italy, France, Germany, Greece) experience auto-playing, looping, or large-motion animations that can trigger vestibular disorders.

**Why it happens:** `prefers-reduced-motion` is a CSS media query that developers forget to handle in JavaScript-driven animation libraries. Framer Motion does not automatically respect it — it must be explicitly wired up.

**Consequences:** WCAG 2.1 SC 2.3.3 (AAA) and SC 2.1.1 failures. EU Web Accessibility Directive applies to public-facing commercial sites in several of Dervishi Group's markets. Beyond compliance, users with motion sensitivity are actively harmed.

**Prevention:**
1. Create a global animation config that reads `window.matchMedia('(prefers-reduced-motion: reduce)')` and returns either full animation variants or instant (zero-duration) variants.
2. Use Framer Motion's `useReducedMotion()` hook at the layout root and pass `shouldReduceMotion` down as a context value.
3. Apply the pattern: `const transition = shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }` to every animated component.
4. CSS animations (keyframes) must also be wrapped in `@media (prefers-reduced-motion: reduce) { animation: none; }`.
5. Test by enabling "Reduce Motion" in macOS/iOS/Windows Accessibility settings.

**Warning signs:** No `useReducedMotion` import anywhere in the codebase. CSS `@keyframes` without a `prefers-reduced-motion` media query override. Framer Motion variants defined with fixed durations not parameterized by a global config.

**Phase:** Brand & Visual System (establish the motion primitive system with reduced-motion built in from day one).

---

### Pitfall 7: Translation Drift — New Copy Added in English Only

**What goes wrong:** A new section, button, or modal is built. The developer adds the English string inline (`"Request a Consultation"`) or adds it only to the `en` key in `i18n.js`. The other 6 languages show the English fallback, show nothing, or show a key string like `t.consultationCta`. This ships undetected because QA is done in English.

**Why it happens:** The current i18n system in `src/lib/i18n.js` is a plain JavaScript object. There is no type-safety, no missing-key warning, no CI check. Adding a key to one language and forgetting the other 6 is the path of least resistance.

**Consequences:** Albanian, Italian, German, Greek, Turkish, and French visitors see English text embedded in their native-language page — an obvious signal the site is low-quality and not truly localized. German and Greek strings are significantly longer than English (see Pitfall 8), so a "missing" German translation that falls back to short English text breaks the layout differently than intended.

**Prevention:**
1. Define a canonical TypeScript-style shape (even in plain JS, as a JSDoc `@typedef`) for the translation object so all 7 language objects must implement the same keys.
2. Add a startup assertion (dev-only) that iterates all language keys and warns in the console if any language is missing a key present in the `en` baseline. This is a 20-line utility.
3. Establish a translation workflow: every new string gets added to all 7 language objects in the same commit, using placeholder text (`"[PENDING TRANSLATION: en text here]"`) if the real translation is not yet available — visible placeholder is better than silent English fallback.
4. When the design minimizes text (as the project brief suggests), consolidate — fewer strings means fewer translation gaps.

**Warning signs:** The `en` object in `i18n.js` has more keys than `de`, `el`, or `tr`. Any component uses a hardcoded English string instead of `t.someKey`.

**Phase:** Every phase that adds new public-facing copy. The startup assertion utility should be built in the Brand/Design System phase before any new strings are created.

---

### Pitfall 8: German and Greek Layout Breakage (Long-String Languages)

**What goes wrong:** UI components are sized and tested against English and Albanian strings. German strings are typically 30-40% longer than English equivalents (e.g., "Request Transform" → "Sanierungsprojekt anfragen"). Greek is similar. In German, a single compound noun can exceed the width of a button, nav item, or card title, causing line wrapping, overflow, truncation, or broken flexbox layouts.

**Why it happens:** Responsive layout testing happens in the default language (Albanian or English). German and Greek are checked last, if at all.

**Consequences:** The premium design collapses into a janky layout for two of the seven supported languages. This is particularly damaging for the German market, which is a key segment for a home-services company serving the Albanian diaspora in Germany.

**Prevention:**
1. Design all text-bearing components with `min-width: 0` and `overflow-wrap: break-word` as defaults.
2. Test navigation items, button labels, and hero taglines in German and Greek explicitly at every breakpoint during component development — not after.
3. Avoid fixed-width containers for any text that comes from `t.someKey`. Use `max-content` sizing with capped `max-width` instead.
4. For navigation items that must fit in a single line: negotiate shorter German strings with the translator rather than breaking the layout. "Anfragen" instead of "Sanierungsprojekt anfragen".
5. Add a dev utility that renders key UI components in all 7 languages simultaneously for visual regression checks.

**Warning signs:** Any CSS rule using `width: [fixed]px` on a container holding translated text. Navigation that fits perfectly in English but has not been tested in German.

**Phase:** Public Site revamp (every section). Language testing must be part of the definition of done for each section component.

---

### Pitfall 9: Image-Heavy Site Tanking Mobile Performance

**What goes wrong:** The `Photos/` directory and `public/` contain full-resolution photography. These are loaded as `<img src="...">` tags without width/height attributes, without `loading="lazy"`, without `srcset`, and without compression. The existing Transform section stores photos as base64 strings in localStorage — after migration to Supabase Storage, developers simply replace the base64 src with a Supabase Storage URL, without adding any image optimization pipeline. Lighthouse mobile score stays below 50.

**Why it happens:** Image optimization is treated as a post-launch polish task. Supabase Storage serves the original uploaded file with no automatic resizing or format conversion.

**Consequences:** Lighthouse Performance score misses the ≥ 90 mobile target. Core Web Vitals LCP (Largest Contentful Paint) is almost certainly driven by a hero image — a 3MB JPEG hero image on mobile will fail LCP at every network condition below LTE.

**Prevention:**
1. **Width/height attributes on every `<img>`** — prevents Cumulative Layout Shift (CLS) from image load.
2. **`loading="lazy"` on all below-fold images** — defers offscreen image fetches.
3. **WebP format for all photography** — convert existing `Photos/` content to WebP at build time using `vite-imagetools` or similar.
4. **`srcset` and `sizes` for responsive images** — serve 400w, 800w, 1200w variants. The hero image should never be more than 1200px wide on desktop.
5. **Supabase Storage image transforms**: Supabase Storage supports image transformation via URL parameters (`?width=800&quality=80&format=webp`). Use these URL transforms for all Supabase-hosted photography instead of serving originals.
6. **Lazy-load lightbox images** — the gallery/lightbox should fetch full-resolution images only on open, not on page load.
7. Establish an upload pipeline that rejects images over 10MB and warns at 5MB.

**Warning signs:** `<img>` tags without `loading="lazy"` or `width`/`height`. Supabase Storage URLs without transformation parameters. Any base64 image that survived the migration and is now a `data:image/jpeg;base64,...` src attribute on a public page.

**Phase:** Public Site revamp (Showroom, Transforms, Products sections). Supabase Storage setup (migration phase) must include the URL transform pattern from the start.

---

## Moderate Pitfalls

---

### Pitfall 10: shadcn/ui or Radix Primitives Assuming TypeScript

**What goes wrong:** The project is plain JavaScript (no TypeScript). shadcn/ui's CLI scaffolding (`npx shadcn-ui@latest add button`) generates `.tsx` files and imports type declarations. If the team uses shadcn components directly, they must either add TypeScript to the project (a significant parallel track) or manually convert every generated component from `.tsx` to `.jsx` and strip all type annotations.

**Why it happens:** shadcn/ui is the dominant "premium components" recommendation in 2025. Developers add it without checking the TS assumption.

**Consequences:** Build errors from `.tsx` files in a non-TypeScript Vite config. Either TypeScript gets added mid-project (scope creep) or every component is a manual conversion that duplicates maintenance burden.

**Prevention:**
1. Use Radix UI primitives directly (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, etc.) — they ship as plain JavaScript with optional TS types as a separate export. This gives the same accessible, headless component foundation without the scaffolding CLI that assumes TypeScript.
2. Alternatively, use the shadcn/ui manual installation path (copy component source into `src/components/ui/`) and immediately convert `.tsx` → `.jsx`, stripping TypeScript annotations. Do this once during the design system phase and never use the CLI after that.
3. Decision must be made at design system setup — do not discover this mid-component-build.

**Warning signs:** `npx shadcn-ui@latest init` being run against the project. Any `.tsx` file appearing in `src/`.

**Phase:** Brand & Visual System (design system setup, day one).

---

### Pitfall 11: Hash Routing Blocking SEO

**What goes wrong:** The site uses hash-based routing (`#/transform`, `#/solar`, `#/blog`). Search engines either do not index hash fragments at all, or index only the root URL. All sections of the public marketing site that live under hash routes are effectively invisible to Google — no canonical URLs, no Open Graph sharing for individual sections, no structured data per page.

**Why it happens:** Hash routing was chosen for simplicity (no server configuration needed for client-side routing). It works fine for SPAs that don't need SEO — but a home services marketing site with multiple conversion pages (Transform, Solar Calculator, Blog) absolutely needs SEO.

**Consequences:** All organic traffic lands on the homepage only. The Blog section at `/#/blog` cannot be indexed as individual post URLs. The Transform page cannot have its own meta description. Google Search Console shows only one URL.

**Prevention:**
1. Migrate from hash routing to HTML5 History API routing using React Router v6 `createBrowserRouter`. This requires configuring the hosting provider (Vercel, Netlify, etc.) to serve `index.html` for all paths — a one-line config on most hosts.
2. Add `react-helmet-async` or Vite's SSG meta injection to set page-level `<title>` and `<meta description>` per route.
3. Add a `sitemap.xml` with all public route URLs.
4. If hash routing is kept (e.g., to avoid the hosting config change), implement a `<link rel="canonical">` strategy and accept the SEO limitation as a known constraint.

**Warning signs:** `useHashRoute` hook still in use after the IA revamp. `window.location.hash` appearing in navigation code. No `<title>` change on route transitions.

**Phase:** Information Architecture / Public Site revamp. Routing strategy must be decided before building the new section structure.

---

### Pitfall 12: "Premium" Visual Design That Is Inaccessible

**What goes wrong:** The premium design direction uses low-contrast text-on-image overlays (light gray text on off-white photo), thin font weights (200–300) for elegance, and small text sizes for refinement. All three are common luxury design patterns that fail WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text).

**Why it happens:** Design mockups look beautiful on a calibrated designer monitor. Low contrast is a premium aesthetic signal in fashion/luxury. Developers implement the mockup without running contrast checks.

**Consequences:** The project requirement of "WCAG AA contrast on all public pages" is not met. Accessibility audit failures. Elderly visitors (a realistic demographic for home renovation services) cannot read the content.

**Prevention:**
1. Run every proposed color pairing through a contrast checker (e.g., Figma's built-in A11y plugin, or `axe-core` in the browser) before finalizing the design system.
2. Minimum font weight of 400 for body text. Decorative thin weights (200–300) are acceptable only for very large display text (>48px) where contrast thresholds are lower.
3. For text-on-image overlays: use a semi-transparent dark scrim (`rgba(0,0,0,0.5)` or higher) behind all text. Test at the actual overlay opacity, not the Figma mock.
4. Color tokens in the design system must be labeled with their contrast ratio against their expected background. If a token fails WCAG AA, it cannot be used for body text — only for decorative elements.

**Warning signs:** Font weights below 400 on text under 32px. Hero text with no background scrim. Color palette tokens with contrast ratios below 4.5:1 against the background.

**Phase:** Brand & Visual System (enforce during design system definition).

---

### Pitfall 13: Mobile-First in Words Only — Desktop Assumptions in Code

**What goes wrong:** The "mobile-first" requirement is acknowledged but implementation is desktop-first. Developers build on large screens, add responsive styles as overrides at small breakpoints, and deliver a desktop layout with a responsive patch. The result passes basic resizing tests but has touch-target failures (buttons under 44px), hover-only interactions with no touch equivalent, and layouts that technically fit 375px width but require horizontal scrolling due to `vw` units on child elements.

**Why it happens:** Developer workflow is on a large monitor. Mobile testing is done by dragging the browser window — not on actual touch hardware. "Responsive" is interpreted as "fits small screen" not "designed for touch interaction."

**Consequences:** The top user complaint ("not mobile-friendly enough") persists in the revamp. Mobile Lighthouse score fails on Interaction to Next Paint (INP) and CLS. Touch targets fail WCAG 2.5.5 (44×44px minimum).

**Prevention:**
1. **Start every component with mobile styles**, then add `@screen md:` and `@screen lg:` Tailwind variants as progressive enhancements — not the reverse.
2. Touch targets: all interactive elements (buttons, links, form inputs) must have a minimum `44px` height. In Tailwind: `h-11` (44px) minimum.
3. No hover-only interactions for critical UI. Every `hover:` Tailwind variant that reveals functionality must have a `focus:` or touch equivalent.
4. Test on a real device (or BrowserStack with a real Android device profile) before marking any section complete.
5. Avoid `100vw` on elements that may have a scrollbar (causes overflow). Use `100%` on block elements inside a constrained container instead.
6. Form inputs must be `font-size: 16px` minimum on mobile to prevent iOS Safari's auto-zoom on focus.

**Warning signs:** Any Tailwind class pattern of `flex-row sm:flex-col` (reversed — mobile should be column, desktop row). Buttons with `h-8` (32px). Input `font-size` below 16px.

**Phase:** Every public site section. The mobile-first rule must be in the component implementation conventions, not just stated in PROJECT.md.

---

## Minor Pitfalls

---

### Pitfall 14: Dark Mode Broken by Tailwind's `dark:` Variant

**What goes wrong:** The existing theme system uses `data-theme="dark"` on the document root and CSS custom properties (`--bg`, `--text`, etc.). Tailwind's dark mode defaults to the `media` strategy (CSS `prefers-color-scheme`), not a `data-` attribute class strategy. When a developer adds `dark:bg-zinc-900` to a component expecting it to respond to the site's `data-theme` toggle, nothing happens — the Tailwind dark variant and the existing theme system are on different signals.

**Prevention:** In `tailwind.config.js`, set `darkMode: ['selector', '[data-theme="dark"]']` (Tailwind v3.4+) or `darkMode: ['class', '[data-theme="dark"]']` to align Tailwind's dark variant with the existing `data-theme` attribute. Do this at Tailwind installation. Document it in the project conventions.

**Warning signs:** `dark:` Tailwind classes not responding to the theme toggle. Theme toggle works for components using CSS custom properties but not for Tailwind-styled components.

**Phase:** Brand & Visual System (Tailwind installation).

---

### Pitfall 15: Supabase Anon Key Exposed in Bundle — Misunderstood as a Secret

**What goes wrong:** Developers see `VITE_SUPABASE_ANON_KEY` in the environment config and treat it as a secret that must be hidden. They then try to proxy all Supabase calls through a backend to avoid "exposing" it. This adds unnecessary complexity and latency.

**Clarification:** The Supabase `anon` key is designed to be public — it is scoped by Row Level Security policies. What must never be in the frontend bundle is the `service_role` key (bypasses RLS entirely). The `anon` key in `VITE_SUPABASE_ANON_KEY` is intentional and correct.

**Prevention:** The risk is not in the anon key being visible in the bundle. The risk is in RLS policies being too permissive. Ensure every Supabase table has RLS enabled and that the default deny policy is in place before writing permissive policies.

**Warning signs:** Supabase `service_role` key appearing in any Vite env var (`VITE_` prefix). RLS disabled on any table containing user-submitted data.

**Phase:** Backend Migration phase (Supabase setup).

---

### Pitfall 16: i18n Language Detection Fragile on Init

**What goes wrong:** `src/lib/i18n.js` detects language from `localStorage → browser navigator → default Albanian`. If `localStorage` is unavailable (private browsing, storage quota hit), language detection silently falls through. If the browser `navigator.language` returns `de-AT` (Austrian German) instead of `de`, the current detection logic may not match it to the German translations, defaulting to Albanian — which is jarring for a German visitor.

**Prevention:**
1. Normalize `navigator.language` by taking only the primary subtag: `navigator.language.split('-')[0]` before matching.
2. Handle `localStorage` unavailability explicitly with a try/catch that falls to navigator detection rather than throwing.
3. Add the startup key-check utility (see Pitfall 7) so the language fallback chain is always tested.

**Phase:** i18n preservation pass (first phase that touches i18n.js).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Tailwind installation | Preflight breaks existing CSS; `dark:` uses wrong strategy | Disable Preflight; set `darkMode: ['selector', '[data-theme="dark"]']` at install |
| Design system definition | Accessibility failures baked into color tokens; no reduced-motion system | Run contrast checks on every token; build `useReducedMotion` wrapper before writing any animations |
| Framer Motion integration | Overuse degrades mobile performance; `prefers-reduced-motion` ignored | Define motion primitives (max 3); wire `useReducedMotion()` globally on day one |
| Component decomposition (DervishiGroup monolith) | Splitting the 1028-line file without breaking i18n or routing | Extract one section at a time; verify translations work after each extraction |
| New copy strings | Translation drift; 7× translation cost | Add startup key-check utility; use placeholder text policy |
| German/Greek string testing | Layout breakage from longer strings | Test in DE and EL at every component completion |
| Supabase schema setup | RLS misconfiguration locks out admin; service_role key exposure | Verify every RLS policy in staging; never use service_role in frontend |
| Supabase Auth migration | Admin lockout during cutover | Migrate auth first, verify, then migrate data entity by entity |
| Git history cleanup | Hardcoded credentials permanent in history | Run `git filter-repo` before Supabase migration; rotate credentials first |
| Transform submission form | Silent failures on Supabase outage | Build localStorage fallback queue into form from the start |
| Image migration (base64 → Supabase Storage) | Unoptimized originals tank Lighthouse mobile | Apply Supabase image transform URL params on every image URL |
| Hash routing → history API | SEO invisibility persists | Decide routing strategy before IA rebuild; configure host for SPA fallback |
| Mobile implementation | Desktop-first assumptions; touch target failures | Mobile styles first; 44px touch targets; test on real device per section |
| shadcn/ui or Radix adoption | TypeScript assumptions in a plain JS project | Use Radix primitives directly, or manually convert shadcn .tsx → .jsx at setup |

---

## Sources

- Project context: `.planning/PROJECT.md`
- Codebase concerns: `.planning/codebase/CONCERNS.md`
- Architecture: `.planning/codebase/ARCHITECTURE.md`
- Supabase RLS documentation (HIGH confidence — well-established pattern): Row Level Security with `anon` vs `service_role` key distinction is core to Supabase's design
- Tailwind CSS Preflight and dark mode documentation (HIGH confidence — documented behavior)
- WCAG 2.1 SC 2.3.3, 2.5.5, 1.4.3 (HIGH confidence — normative spec)
- Framer Motion `useReducedMotion` hook (HIGH confidence — documented API)
- German compound noun length characteristics (HIGH confidence — linguistic fact)
- Supabase Storage image transformations (MEDIUM confidence — feature exists as of 2024, verify current URL param syntax against Supabase docs at implementation time)
- `git filter-repo` for history rewriting (HIGH confidence — recommended by git-scm.com over deprecated `filter-branch`)

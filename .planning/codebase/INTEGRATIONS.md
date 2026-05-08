# External Integrations

**Analysis Date:** 2026-05-09

## APIs & External Services

**Not Detected:**
- No external API clients detected in dependencies
- No third-party service SDKs installed
- No Stripe, Supabase, Firebase, or cloud service integrations

## Data Storage

**Databases:**
- Not applicable - this is a client-side SPA with no backend
- No database drivers or ORM packages present

**File Storage:**
- Local browser storage only
- Uses browser localStorage API via custom `useLocalStorage` hook in `src/lib/store.js`
- Data persisted locally per user/browser
- No cloud storage integration

**Client-Side Storage:**
- localStorage - Persistent storage for user data:
  - `dg_quotes` - Quote request submissions
  - `dg_transforms` - Bathroom transformation requests
  - `dg_products` - Product catalog
  - `dg_blogs` - Blog posts
  - `dg_projects` - Portfolio/project showcase
  - `dg_testimonials` - Customer testimonials
  - `dg_consultations` - Consultation requests
  - `dg_solar_config` - Solar panel calculator configuration
  - `dg_settings` - Application settings (company info, contact details)
  - `dg_theme` - Theme preference (light/dark)
  - `dg_lang` - Language preference
- sessionStorage - Temporary auth storage in `src/lib/store.js`:
  - `dg_auth` - Admin session (cleared on tab close)

**Caching:**
- Browser cache only - no explicit caching layer

## Authentication & Identity

**Auth Provider:**
- Custom local authentication
- Implementation: In-memory session check at `src/admin/Admin.jsx` and `src/lib/store.js`
- Credentials stored in source code:
  - `ADMIN_CREDENTIALS` object in `src/lib/store.js` (lines 111-114)
  - email: `**REMOVED**`
  - password: `**REMOVED**`
- Auth state: sessionStorage (`dg_auth`)
- No third-party auth provider (OAuth, Auth0, etc.)

## Monitoring & Observability

**Error Tracking:**
- Not detected - no error tracking service integrated
- Error Boundary component in `src/main.jsx` provides client-side error display

**Logs:**
- Console logging only via standard browser console
- No external logging service

## CI/CD & Deployment

**Hosting:**
- Not specified in config
- Expected: Static hosting (Netlify, Vercel, GitHub Pages, etc.)
- Build output: `dist/` directory

**CI Pipeline:**
- Not detected - no CI config files found

## Environment Configuration

**Configuration Approach:**
- All configuration hardcoded in source files
- No .env files detected
- No environment variable usage

**Contact & Company Settings:**
- Hardcoded in `src/lib/store.js` - `DEFAULT_SETTINGS`:
  - Company name: "Dervishi Group"
  - Phone: "+355 68 203 3446"
  - Email: "info@dervishigroup.com"
  - Address: "Rruga 31 Gushti, Belsh, Albania"
  - Hours: "Mon-Sat 07:00-18:00"
  - Facebook: `https://www.facebook.com/hidrosanitare.saer/`
  - Instagram: `https://www.instagram.com/dervishi_group/`
  - WhatsApp: "355682033446"

**Solar Calculator Parameters:**
- Hardcoded in `src/lib/store.js` - `DEFAULT_SOLAR`:
  - kwhPriceEUR: 0.08
  - kwhPerPanelYear: 500
  - costPerPanelEUR: 250
  - savingsPct: 0.75
  - allToEur: 0.0088

## Webhooks & Callbacks

**Incoming:**
- Not applicable - no backend to receive webhooks

**Outgoing:**
- Not implemented
- Form submissions (quotes, transforms, consultations, contact) are stored locally only
- No email or external notification system

## External Resources

**Internationalization:**
- No i18n library (i18next, react-intl)
- Custom translation system in `src/lib/i18n.js`
- Supports 7 languages: Albanian (sq), English (en), Italian (it), German (de), Greek (el), Turkish (tr), French (fr)
- Language detection: browser language with fallback to Albanian
- Storage: localStorage key `dg_lang`

**Fonts & Typographies:**
- CSS variables for font families
- No external font service (Google Fonts, Typekit)
- System fonts or custom CSS referenced

## Social Media & External Links

**Embedded Links:**
- Facebook: `https://www.facebook.com/hidrosanitare.saer/`
- Instagram: `https://www.instagram.com/dervishi_group/`
- WhatsApp: Phone-based (SMS/WhatsApp link generation)
- Google Maps: Location can be embedded but not detected in code

---

*Integration audit: 2026-05-09*

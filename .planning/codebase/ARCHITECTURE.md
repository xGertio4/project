# Architecture

**Analysis Date:** 2026-05-09

## Pattern Overview

**Overall:** React SPA (Single Page Application) with hash-based routing and client-side state management via localStorage and React Context hooks.

**Key Characteristics:**
- Frontend-only application (no backend API calls)
- Dual-interface: public marketing site + admin dashboard
- Hash-based routing (`#/admin`, `#/`) for client-side navigation
- Monolithic component structure with all logic in single files
- Multi-language support (7 languages) with localStorage persistence
- Data persistence exclusively via browser localStorage
- Error boundary protection at root level

## Layers

**Presentation Layer:**
- Purpose: Render UI components and handle user interactions
- Location: `src/App.jsx`, `src/DervishiGroup.jsx`, `src/admin/Admin.jsx`
- Contains: Page components, feature sections, forms, modals
- Depends on: `src/lib/store.js` (hooks), `src/lib/i18n.js` (translations)
- Used by: Application root

**Logic & State Management Layer:**
- Purpose: Manage application state, localStorage sync, authentication, translations
- Location: `src/lib/store.js`, `src/lib/i18n.js`
- Contains: Custom React hooks for state management, i18n system
- Depends on: React 19.2.5
- Used by: All components across the app

**Styling Layer:**
- Purpose: Theme management, responsive design, CSS variables
- Location: `src/index.css`, `src/App.css`
- Contains: CSS custom properties (--text, --bg, --accent, etc.), global styles, component styles
- Light/dark theme implementation via `data-theme` attribute
- CSS Grid and Flexbox for layouts

## Data Flow

**Public Site Flow:**

1. User visits site → `App.jsx` checks hash route
2. Route is not `/admin` → renders `<DervishiGroup />`
3. `DervishiGroup` renders section components (Hero, Services, Products, etc.)
4. User interactions (form submissions) → `useLocalStorage` hook updates state
5. State persists to localStorage automatically
6. User can navigate sections via hash routing (`#/transform`, `#/solar`, etc.)
7. Language change → updates `dg_lang` in localStorage, re-renders translations

**Admin Dashboard Flow:**

1. User navigates to `/#/admin` → `App.jsx` renders `<Admin />`
2. `Admin` component checks `useAuth()` for session
3. If not authenticated → shows `<Login />` component
4. Successful login → stores user in sessionStorage via `useAuth()`
5. Tab selection updates local state in `Admin` component
6. Each admin tab (Products, Blog, Quotes, etc.) manages its own CRUD operations
7. Data operations trigger `useLocalStorage` updates
8. Toast notifications appear via global toast listener system
9. Logout clears sessionStorage, returns to login

**State Management:**

- **localStorage:** Persistent data (products, blog posts, quotes, solar config, theme, language)
  - Keys: `dg_products`, `dg_quotes`, `dg_transforms`, `dg_blogs`, `dg_projects`, `dg_testimonials`, `dg_consultations`, `dg_solar_config`, `dg_settings`, `dg_theme`, `dg_lang`
- **sessionStorage:** Temporary session data (admin auth)
  - Key: `dg_auth` (cleared on tab close)
- **React State:** Component-level state (form inputs, modals, dropdowns, tab selections)
- **Global Toast System:** Event-based notification system via closure over `toastListeners` array

## Key Abstractions

**useLocalStorage Hook:**
- Purpose: Provide React useState-like interface with automatic localStorage persistence
- Location: `src/lib/store.js` lines 5-18
- Pattern: Custom hook that reads from localStorage on init, syncs on value change
- Usage: `const [items, setItems] = useLocalStorage("dg_products", [])`

**useI18n Hook:**
- Purpose: Provide translation system with language detection and persistence
- Location: `src/lib/i18n.js` lines 149-159
- Pattern: Returns translation object, current language, and setter
- Detects language from: localStorage → browser navigator → defaults to Albanian
- Usage: `const { t, lang, setLang } = useI18n()`

**useAuth Hook:**
- Purpose: Manage admin authentication state in sessionStorage
- Location: `src/lib/store.js` lines 116-126
- Pattern: sessionStorage-backed state that clears on tab close
- Usage: `const [user, setUser] = useAuth()`

**useTheme Hook:**
- Purpose: Manage dark/light theme and persist preference
- Location: `src/lib/store.js` lines 21-34
- Pattern: Syncs to `data-theme` attribute on document root
- Usage: `const [dark, setDark] = useTheme()`

**useHashRoute Hook:**
- Purpose: Implement client-side hash routing
- Location: `src/lib/store.js` lines 37-46
- Pattern: Returns current route string and navigate function
- Routes: `/`, `/admin`, `/transform`, `/solar`, `/contact`, `/blog`, etc.
- Usage: `const [route, navigate] = useHashRoute()`

**useConfirm Hook:**
- Purpose: Provide reusable confirmation modal for destructive operations
- Location: `src/admin/Admin.jsx` lines 143-159
- Pattern: Returns `ask(msg, fn)` function and `Modal` component
- Usage: Wraps delete operations to prevent accidental data loss

**CrudForm Component:**
- Purpose: Generic reusable form builder for admin content creation/editing
- Location: `src/admin/Admin.jsx` lines 251-287
- Pattern: Accepts field configuration array, handles file uploads, validation
- Supports: text, textarea, select, image, checkbox, date inputs
- File handling: Converts images to base64 for localStorage storage

## Entry Points

**Application Root:**
- Location: `src/main.jsx`
- Triggers: Browser loads HTML file
- Responsibilities: React hydration, error boundary wrapping, StrictMode initialization
- Contains: `ErrorBoundary` class component that catches runtime errors

**App Component:**
- Location: `src/App.jsx`
- Triggers: After hydration
- Responsibilities: Route detection, theme/language state provision, conditional rendering (admin vs public)

**Public Site Entry:**
- Location: `src/DervishiGroup.jsx` (1028 lines)
- Triggers: Hash route is not `/admin`
- Responsibilities: Renders all public pages (sections rendered conditionally based on scroll or route)
- Contains: Hero, Services, Showroom, Products, Transforms, Solar Calculator, Blog, Testimonials, Consultations, Contact, FAQ, Footer sections

**Admin Entry:**
- Location: `src/admin/Admin.jsx`
- Triggers: Hash route starts with `/admin`
- Responsibilities: Admin layout, authentication gate, tab navigation, content management
- Contains: Login screen, Dashboard, and 10 admin sub-tabs (Quotes, Transforms, Products, Blog, Projects, Solar Config, Testimonials, Consultations, Settings)

## Error Handling

**Strategy:** Client-side error boundary + try-catch blocks for state operations

**Patterns:**
- ErrorBoundary class component in `src/main.jsx` catches React render errors
  - Displays red error page with stack trace
  - Prevents white-screen crashes
- localStorage operations wrapped in try-catch (prevent quota/access errors)
  - Example: `useLocalStorage` hook lines 6-10, 14-15 in `src/lib/store.js`
- File reader operations use Promise rejection handling
  - Example: `fileToBase64` in `src/lib/store.js` lines 49-54
- CSV export checks for empty arrays before processing
  - Example: `downloadCSV` line 58 in `src/lib/store.js`

## Cross-Cutting Concerns

**Logging:** None currently implemented. Debugging relies on browser DevTools and console logs.

**Validation:** 
- Client-side only (no server-side validation)
- CrudForm validates required fields before save (line 280 in Admin.jsx)
- Transform form validates max 5 photos (DervishiGroup.jsx)
- Email format not strictly validated (advisory only)

**Authentication:**
- Simple credential checking: email + password comparison against constants
- Credentials: `**REMOVED**` / `**REMOVED**` (hardcoded in `src/lib/store.js` line 111-113)
- No password hashing (plain text comparison)
- Session duration: Tab-based (sessionStorage cleared on close)

**Internationalization:**
- 7 languages supported: Albanian (sq), English (en), Italian (it), German (de), Greek (el), Turkish (tr), French (fr)
- All UI strings defined in `src/lib/i18n.js` as JavaScript objects
- Language auto-detection from browser navigator
- Fallback: Albanian if detected language not supported
- Form labels, buttons, section headers all use `t` object from `useI18n()`

---

*Architecture analysis: 2026-05-09*

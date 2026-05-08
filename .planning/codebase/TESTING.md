# Testing Patterns

**Analysis Date:** 2026-05-09

## Test Framework

**Status:** Not detected

**No testing infrastructure found:**
- No Jest, Vitest, or other test runner configured
- No `.test.js`, `.spec.js` files in source code (node_modules excluded)
- No test configuration files: `jest.config.js`, `vitest.config.js`
- No test scripts in `package.json` (only `dev`, `build`, `lint`, `preview`)

**Implication:**
- This is a React frontend application without unit/integration test coverage
- Quality assurance relies on:
  - ESLint linting (configured and executable via `npm run lint`)
  - Manual testing during development
  - Error boundary for runtime error visibility

## Development & Linting

**Linting Setup:**
- Runner: ESLint v10.2.1
- Config file: `eslint.config.js` (ES module flat config)
- Run command:
```bash
npm run lint              # Check linting
```

**Linting Rules:**
- Extends `@eslint/js` recommended rules
- Includes `react-hooks` plugin: enforces hooks rules of hooks (no conditional hooks, etc.)
- Includes `react-refresh` plugin: ensures components are compatible with Vite Fast Refresh
- Ignores `/dist` directory from linting
- Target files: `**/*.{js,jsx}`

## Error Boundary Pattern

**Location:** `src/main.jsx`

**Implementation:**
```javascript
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:'40px',fontFamily:'monospace',color:'red',background:'#fff',minHeight:'100vh'}}>
          <h2>Runtime Error</h2>
          <pre style={{whiteSpace:'pre-wrap'}}>{this.state.error.message}</pre>
          <pre style={{whiteSpace:'pre-wrap',fontSize:'12px',color:'#666'}}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Purpose:**
- Catches unhandled React rendering errors
- Displays error message and stack trace inline (monospace red text)
- Prevents white-screen-of-death (WSOD) crashes
- Acts as safety net, not a testing mechanism

## Manual Testing Approach

**Development Workflow:**
- File: `src/main.jsx` wraps entire app in `ErrorBoundary`
- Command: `npm run dev` starts Vite dev server with hot reload
- React StrictMode enabled: warns about legacy lifecycle methods and side effects during development
- Browser DevTools for console error inspection

**Error Detection:**
```javascript
import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'

// ErrorBoundary catches errors
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
```

## State & Hook Testing Points

**Areas without automated coverage:**
- `useLocalStorage()` hook: localStorage persistence logic untested
- `useTheme()` hook: dark mode preference detection and persistence untested
- `useHashRoute()` hook: hash-based routing logic untested
- `useAuth()` hook: authentication state management untested
- `useToasts()` hook: toast notification system untested
- `fileToBase64()` utility: image file conversion untested
- `downloadCSV()` utility: CSV generation and download untested

**Manual Testing Evidence:**
- Admin login form at `src/admin/Admin.jsx` allows testing auth flow
- Dark theme toggle button visible in admin sidebar
- CSV export functionality in admin dashboard
- Multiple language switching visible in UI

## Browser APIs Used (No Mocking)

**APIs accessed directly, no mocking setup:**
- `localStorage` - persisted state
- `sessionStorage` - temporary auth storage
- `window.location.hash` - URL routing
- `window.addEventListener/removeEventListener` - hash change events
- `window.matchMedia` - prefers-color-scheme detection
- `FileReader` - image to base64 conversion
- `URL.createObjectURL/revokeObjectURL` - file download links
- `document.createElement/appendChild/removeChild` - DOM manipulation for CSV download

## Test Coverage Gaps

**Critical untested functionality:**

1. **Authentication Flow**
   - Files: `src/lib/store.js` (useAuth), `src/admin/Admin.jsx` (Login component)
   - What's not tested: Credential validation, session storage persistence, logout
   - Risk: Login bypass or auth state corruption could go unnoticed

2. **Data Persistence**
   - Files: `src/lib/store.js` (useLocalStorage, useTheme)
   - What's not tested: localStorage full/quota errors, JSON parse failures, persistence after reload
   - Risk: Settings loss or corruption silently fails with catch blocks

3. **Routing**
   - Files: `src/lib/store.js` (useHashRoute), `src/App.jsx`
   - What's not tested: Hash navigation, URL state sync, back/forward button behavior
   - Risk: Router state could become desynchronized with URL

4. **CSV Export**
   - Files: `src/lib/store.js` (downloadCSV)
   - What's not tested: Proper CSV formatting, special character escaping, large datasets
   - Risk: Data corruption in exported files undetected

5. **Image Upload Conversion**
   - Files: `src/lib/store.js` (fileToBase64)
   - What's not tested: File type validation, unsupported formats, large files
   - Risk: Invalid base64 strings sent to server

6. **Theme System**
   - Files: `src/lib/store.js` (useTheme)
   - What's not tested: System preference detection, theme persistence, dark/light toggle
   - Risk: Theme switching failures undetected

7. **Admin Features**
   - Files: `src/admin/Admin.jsx`, all admin tabs
   - What's not tested: Form submissions, data operations, CRUD actions
   - Risk: Admin operations could fail silently

8. **Internationalization**
   - Files: `src/lib/i18n.js`
   - What's not tested: Language detection, fallback handling, missing translation keys
   - Risk: Missing translations cause undefined values in UI

**Priority:** High - Core user-facing features lack any automated verification

## Recommendation for Testing Setup

**To add testing infrastructure:**

1. **Install test dependencies:**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event jsdom
```

2. **Create `vitest.config.js`:**
```javascript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
})
```

3. **Test file structure:**
- Place `*.test.jsx` files co-located with components
- Example: `src/lib/__tests__/store.test.js` for hook tests
- Example: `src/admin/__tests__/Admin.test.jsx` for component tests

4. **Test patterns to adopt:**
- Use `@testing-library/react` for component rendering
- Mock localStorage with test setup files
- Test hooks with `@testing-library/react` hooks testing library or inline
- Mock browser APIs: `window.location.hash`, `FileReader`, etc.

---

*Testing analysis: 2026-05-09*

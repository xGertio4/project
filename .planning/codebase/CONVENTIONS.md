# Coding Conventions

**Analysis Date:** 2026-05-09

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `App.jsx`, `Admin.jsx`, `DervishiGroup.jsx`)
- JavaScript modules: camelCase with .js extension (e.g., `store.js`, `i18n.js`)
- CSS files: match component name in kebab-case (e.g., `App.css`)

**Functions:**
- React functional components: PascalCase (e.g., `App()`, `Login()`, `Admin()`)
- Hook functions: camelCase with `use` prefix (e.g., `useHashRoute()`, `useTheme()`, `useLocalStorage()`, `useAuth()`)
- Regular functions: camelCase (e.g., `downloadCSV()`, `fileToBase64()`, `detectLang()`)
- Arrow functions commonly used for event handlers and callbacks (e.g., `const escape = (v) => ...`)

**Variables:**
- State variables: camelCase (e.g., `route`, `dark`, `tab`, `user`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `ADMIN_CREDENTIALS`, `DEFAULT_SOLAR`, `DEFAULT_SETTINGS`, `LANGUAGES`, `ICONS`)
- Object properties: camelCase (e.g., `email`, `password`, `kwhPriceEUR`, `savingsPct`)

**Types:**
- No TypeScript detected; project uses `.jsx` files
- Prop objects passed inline without formal type definitions

## Code Style

**Formatting:**
- No `.prettierrc` file detected
- Spacing observed: 2 spaces for indentation
- Single quotes for strings (e.g., `'src/App.jsx'`, `'react'`)
- Template literals for string interpolation (e.g., `${value}`)
- Ternary operators preferred for conditional rendering: `isAdmin ? <Admin /> : <DervishiGroup />`

**Linting:**
- ESLint v10.2.1 configured in `eslint.config.js`
- Extends: `@eslint/js` recommended, `react-hooks` recommended, `react-refresh` for Vite
- Config location: `eslint.config.js` (ES module format)
- Key rules enforced:
  - React Hooks rules of hooks
  - React Refresh fast refresh compatibility
  - JavaScript recommended practices
  - No dist directory (globalIgnores)

**Line Length:**
- No hard limit observed; code ranges from ~80 to 120+ characters per line
- Long i18n object definitions exceed 500 characters per line

## Import Organization

**Order:**
1. React and third-party libraries: `import { ... } from 'react'`, `import { createRoot } from 'react-dom/client'`
2. Local hooks and utilities: `import { useHashRoute, useTheme } from './lib/store'`
3. Local components: `import DervishiGroup from './DervishiGroup'`
4. Local modules: `import './index.css'`

**Path Aliases:**
- No path aliases detected (e.g., no `@/` or `$lib/` patterns)
- Relative imports used throughout (e.g., `'./DervishiGroup'`, `'../lib/store'`)

## Error Handling

**Patterns:**
- Try-catch blocks for JSON operations: `try { JSON.parse(...) } catch { return initial; }`
- Silent error swallowing common: `try { localStorage.setItem(...) } catch {}`
- Conditional checks before operations: `if (!user) return <Login ...>`
- Error state in form handling: `const [err, setErr] = useState("")`
- Error fallback in ErrorBoundary: renders red error display with message and stack trace in `main.jsx`

**Error Display:**
- `ErrorBoundary` class component in `main.jsx` catches React runtime errors
- Renders inline error UI with stack trace for debugging
- Toast system for user-facing messages: `toast(msg, type = "success")`

## Logging

**Framework:** Native `console` (no logging library detected)

**Patterns:**
- No explicit logging found in source code
- Error boundaries used for error visibility
- Toast notifications for user feedback via `useToasts()` hook
- Console errors rely on browser DevTools

## Comments

**When to Comment:**
- Section dividers used (e.g., `// ===== LOGIN =====`)
- Functional grouping of related code (e.g., `// ---- Generic localStorage hook ----`)
- No JSDoc/TSDoc detected
- Minimal inline comments observed

**JSDoc/TSDoc:**
- Not used in this codebase (no TypeScript)
- No function documentation strings

## Function Design

**Size:**
- Most functions are compact: 5-20 lines
- Component bodies vary: login form ~20 lines, admin shell ~50+ lines
- Long data structures (i18n translations) not counted as "functions"

**Parameters:**
- React components receive `{ prop1, prop2 }` as destructured objects
- Custom hooks accept simple parameters: `useLocalStorage(key, initial)`
- Callback functions use arrow syntax: `navigate = useCallback((to) => { ... }, [])`

**Return Values:**
- React components return JSX
- Custom hooks return arrays: `[value, setValue]` for state-like hooks
- Utility functions return primitives or objects: `fileToBase64(file)` returns Promise

## Module Design

**Exports:**
- Default exports for React components: `export default function App() { ... }`
- Named exports for custom hooks: `export function useTheme() { ... }`, `export function useLocalStorage(...) { ... }`
- Named exports for utilities: `export const fileToBase64 = ...`, `export const downloadCSV = ...`
- Mixed exports in `i18n.js`: constants and hook

**Barrel Files:**
- No barrel files (index.js) detected
- Direct imports from component files

## Structured Data

**Constants Files:**
- Localization data stored in `i18n.js` as large objects: `const sq = { ... }`, `const en = { ... }`
- Configuration constants: `DEFAULT_SOLAR`, `DEFAULT_SETTINGS`, `ADMIN_CREDENTIALS` in `store.js`
- ICONS object as record: `{ dashboard:"📊", quotes:"📩", ... }` in `Admin.jsx`

**Type Conventions:**
- Booleans prefixed with `is` or suffixed with related words: `isAdmin`, `dark` (theme boolean)
- Status strings: lowercase enum-like values: `"statusNew"`, `"statusDone"`
- IDs generated with `Date.now() + Math.random()` for toast notifications

---

*Convention analysis: 2026-05-09*

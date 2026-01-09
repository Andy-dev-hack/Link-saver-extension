# Link Saver Extension - Technical Guidelines & Rulebook

## 1. Project Overview

**Link Saver** is a Chrome Extension built with React and Vite. It allows users to save, categorize, and manage links (leads) in folders.

## 2. Technology Stack (Strict Rules)

- **Framework**: React 19 (JavaScript) + Vite.
- **Styling**: Tailwind CSS.
- **Icons**: `lucide-react`.
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`.
- **Testing**: Vitest + React Testing Library.
- **Language**: JavaScript (`.jsx` for components, `.js` for logic). **NO TypeScript**.

## 3. Critical Architecture Rules

### 3.1 Storage (CRITICAL)

- **MUST USE**: `chrome.storage.local`.
- **FORBIDDEN**: `localStorage` (except for legacy migration).
- **Reason**: Extensions lose `localStorage` data on updates/unloads. `chrome.storage.local` persists.
- **Pattern**:

  ```javascript
  // Reading
  chrome.storage.local.get(["key"], (result) => { ... });
  // Writing
  chrome.storage.local.set({ key: data });
  ```

### 3.4 Update & Migration Safety (CRITICAL - DO NOT IGNORE)

1.  **NEVER DELETE FALLBACKS**: When migrating storage keys or logic, DO NOT remove the old reading logic/keys for at least **2 major versions**.
    - _Bug Prevention_: Users skip versions. A user might jump from v1.0 to v2.5. If v2.5 only migrates from v2.0, v1.0 data is lost.
2.  **Assume Nothing**: Do not assume the old data is perfectly formatted.
    - _Bad_: `if (!Array.isArray(oldData))` -> Fail.
    - _Good_: `if (!Array.isArray(oldData))` -> Try to parse/rescue/wrap it. **Never return empty unless data is truly null**.
3.  **Ghost Backups**: Before any destructive migration (overwriting), save a copy of the raw old data to a "backup" key (e.g., `backup_v1_raw`).
4.  **Idemptotency**: Migration scripts must be idempotent. Running them 10 times should behave the same as running them once.

### 3.2 File Structure

- `src/components/`: Reusable React components (with `.test.jsx` files colocated).
- `src/hooks/`: Custom hooks (with `.test.js` files colocated).
- `src/services/`: External API logic (with `.test.js` files colocated).
- `src/constants/`: Global configuration and static strings (index.js).
- `src/validators/`: Business logic and data validation rules (with tests).
- `src/utils/`: Generic helpers only (date formatting, truncation).

**Test Colocation**: Tests are placed **next to the code they test** (e.g., `helpers.js` and `helpers.test.js` in the same directory).

### 3.3 State Management

- Use `useLeads` hook as the central store for leads data.
- Ensure `isLoaded` state is checked before saving to avoid overwriting data with initial empty states.

## 4. Coding Standards

### 4.1 Imports & Sructure

- **Path Aliases**: Use `@/` to import from `src/` (e.g., `import { Header } from '@/components'`).
- **Barrel Files**: Use `index.js` to export modules from directories.
  - Allowed: `import { Header } from '@/components'`
  - Avoid: `import Header from '../../components/Header'`

### 4.2 React

- Use Functional Components.
- Use Hooks (`useState`, `useEffect`, `useRef`).
- Meaningful variable names.

### 4.3 Styling

- Use Tailwind utility classes directly in JSX `className`.
- Do not use separate CSS files unless absolutely necessary (e.g., global resets).

### 4.4 Formatting

- Use **Prettier** for code formatting.
- Run `npx prettier --write .` before committing.

### 4.5 Chrome APIs

- Always wrap Chrome API calls in checks (`typeof chrome !== "undefined"`) to allow development in local browser (fallback mode).

### 4.6 Architecture Patterns (New)

- **Centralized Configuration**:
  - NEVER hardcode "magic numbers" or strings in components/hooks.
  - Move all config to `src/constants/index.js`.
- **Isolated Validation**:
  - Complex validation logic (e.g., duplicate checks) GOES TO `src/validators/`.
  - Hooks should consume validators, not implement them inline.

## 5. Documentation & Comments

- **JSDoc**: Mandatory for all Hooks, Services, and Utils. complex functions.
  ```javascript
  /**
   * Truncates a string to a specific length.
   * @param {string} str - The string to truncate.
   * @param {number} length - Max length.
   * @returns {string} Truncated string.
   */
  ```
- **Inline Comments**: Use only for complex logic, not for obvious code.

## 6. Error Handling

- **User Facing**: Use `alert()` or UI notifications for user errors (e.g., "Folder duplicate").
- **Internal**: Use `console.error()` for API or logic failures.
- **Fail Gracefully**: The app must not crash if `chrome.storage` fails; use fallbacks.

## 7. Version Control (Conventional Commits)

- `feat:` New features.
- `fix:` Bug fixes.
- `docs:` Documentation changes.
- `style:` Formatting, missing semi-colons, etc.
- `refactor:` Code change that neither fixes a bug nor adds a feature.
- `test:` Adding missing tests or correcting existing tests.
- `chore:` Build process, auxiliary tools.

## 8. Security

- Do not use `innerHTML`. Use React's safe rendering.
- No `eval()`.

## 9. Testing Requirements (MANDATORY)

### 6.1 Test Coverage Rules

- **MANDATORY**: Write unit tests for **ALL new logic flows**.
- **Target Coverage**: Aim for **80%+ code coverage**.
- **Test Location**: Tests must be **colocated** with source files.
  - Example: `src/hooks/useLeads.js` → `src/hooks/useLeads.test.js`
  - Example: `src/components/Header.jsx` → `src/components/Header.test.jsx`

### 6.2 What to Test

**Always test**:

- ✅ **Hooks**: All functions in custom hooks (add, delete, edit, reorder, etc.)
- ✅ **Utils**: Pure functions (helpers, data migration, truncation)
- ✅ **Services**: Chrome API interactions (mock `chrome.tabs`, `chrome.storage`)
- ✅ **Components**: User interactions (clicks, inputs, drag-and-drop)
- ✅ **Edge Cases**: Empty data, null, undefined, invalid inputs
- ✅ **Storage Migration**:
  - Test V1 data -> V2 migration
  - Test **V2 Array data in V1 Key** (Transition states)
  - Test corrupt data handling (Should not crash/wipe)
  - Test `localStorage` fallback presence

### 6.3 Test Structure

Use **Vitest** + **React Testing Library**:

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something', () => {
    // Arrange
    // Act
    // Assert
    expect(result).toBe(expected);
  });
});
```

### 6.4 Mocking

- **Chrome APIs**: Mock `chrome.storage.local`, `chrome.tabs`, etc.
- **Browser APIs**: Mock `window.prompt`, `window.alert`, `window.confirm`.
- **Crypto**: Mock `crypto.randomUUID()` for deterministic tests.

### 6.5 Test-Driven Development (TDD)

**Encouraged workflow**:

1. Write test first (red)
2. Implement feature (green)
3. Refactor (clean)

### 6.6 Running Tests

```bash
npm test          # Run all tests
npm test -- --watch  # Watch mode
```

## 10. Development Workflow

1. **Plan**: Understand the feature/fix
2. **Write Tests**: Create unit tests for new logic
3. **Implement**: Write the code
4. **Verify**: Run tests and ensure they pass
5. **Build**: `npm run build`
6. **Manual Test**: Load in Chrome and verify

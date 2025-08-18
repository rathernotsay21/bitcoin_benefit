# Bitcoin Benefit - Code Style & Conventions

## TypeScript Configuration
- **Strict mode enabled** with comprehensive type checking
- **Path aliases**: `@/*` maps to `./src/*`
- **Target**: ES2022 with DOM libraries
- **Module resolution**: bundler mode with ESNext modules

## ESLint Rules
- Extends Next.js core web vitals config
- **Key rules**:
  - `react/no-unescaped-entities: "off"`
  - `react/display-name: "off"`
  - `import/no-anonymous-default-export: "warn"`
  - `react-hooks/exhaustive-deps: "warn"`
  - `react-hooks/rules-of-hooks: "error"`

## Code Organization
- **File structure**: Features organized by domain (calculators, historical, etc.)
- **Component naming**: PascalCase for components, camelCase for functions
- **Store naming**: `*Store.ts` for Zustand stores
- **Test naming**: `*.test.tsx` or `*.test.ts` for unit tests

## Component Patterns
- **Functional components** with hooks (no class components)
- **TypeScript interfaces** for all props and data structures
- **Optimized components** with `*Optimized.tsx` suffix for performance-critical components
- **Error boundaries** for component error handling

## Import Conventions
- **Absolute imports** using `@/` prefix
- **Named exports** preferred over default exports
- **Barrel exports** in index.ts files for clean imports

## Performance Conventions
- **Memoization** with `useMemo` and `useCallback` for expensive operations
- **Code splitting** with dynamic imports for large components
- **Virtualization** for large data sets
- **Optimized Zustand stores** with selectors

## Testing Conventions
- **Vitest** with jsdom environment
- **React Testing Library** for component testing
- **Performance tests** with `*.performance.test.ts` suffix
- **Integration tests** with `*.integration.test.ts` suffix
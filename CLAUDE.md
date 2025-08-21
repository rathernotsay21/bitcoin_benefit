# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) for efficient development on the Bitcoin Benefit platform.

## Project Overview

Bitcoin Benefit is a comprehensive Bitcoin vesting calculator and benefits platform that helps companies implement Bitcoin-based employee compensation packages. The platform provides both future projections (20-year forecasts) and historical analysis (2015-present) for three distinct vesting schemes: Pioneer (accelerator), Stacker (steady-builder), and Builder (slow-burn).

## Token Efficiency Guidelines

### File Reading Strategy
- **NEVER** read entire source files unless absolutely necessary
- Use symbolic search tools (`find_symbol`, `get_symbols_overview`) first
- Static data files in `public/data/` are pre-generated - no need to regenerate
- Test files follow `*.test.ts` or `*.performance.test.ts` patterns

### Quick File Locations
- **Vesting logic**: `src/lib/vesting-*.ts`
- **API routes**: `src/app/api/*/route.ts`
- **Store management**: `src/stores/*Store.ts`
- **Chart components**: `src/components/charts/` and `*Chart*.tsx`
- **On-chain tracking**: `src/components/on-chain/` and `src/lib/on-chain/`
- **Security/validation**: `src/lib/security/` and `src/lib/validation/`

### Directories to Avoid Reading
- `node_modules/`, `.next/`, `out/`, `coverage/`
- Generated files: `*.tsbuildinfo`, `next-env.d.ts`
- Large JSON data files in `src/data/` (use specific queries instead)

## Critical Development Commands

### Before Making Changes
```bash
npm run lint              # Check code style
npm run type-check        # Verify TypeScript types
```

### After Making Changes
```bash
npm run lint              # Validate code style
npm run type-check        # Ensure no type errors
npm test                  # Run unit tests
npm run build            # Verify production build succeeds
```

### Performance Validation
```bash
npm run test:performance  # Run performance benchmarks
npm run benchmark        # Detailed performance report
```

### Data Management
```bash
npm run update-bitcoin-data              # Update all historical data
npm run update-bitcoin-year --year=2024  # Update specific year
npm run clear-bitcoin-cache              # Clear cache if needed
npm run prebuild                        # Generate static data files
```

## Architecture

### Core Calculation System
1. **Future Projections** (`src/lib/vesting-calculations.ts`): Projects potential outcomes over 20 years with customizable Bitcoin growth assumptions
2. **Historical Analysis** (`src/lib/historical-calculations.ts`): Analyzes actual performance from 2015 to present with multiple cost basis methods
3. **Vesting Schemes** (`src/lib/vesting-schemes.ts`): Defines three core vesting strategies with configurable parameters

### State Management Architecture
- **Zustand stores** in `src/stores/`:
  - `calculatorStore.ts`: Future calculator state and UI controls
  - `historicalCalculatorStore.ts`: Historical calculator state and settings
  - `onChainStore.ts`: Blockchain tracking state
  - `bitcoinToolsStore.ts`: Bitcoin tools state
- **Store Best Practices**:
  - Use selectors for performance (see `src/stores/selectors.ts`)
  - Avoid storing derived state (calculate in components)
  - Use `StoreSyncProvider` for cross-store synchronization

### Component Architecture
- **Chart Components**: Built with Recharts for interactive visualizations
  - `VestingTimelineChartRecharts.tsx`: Main future projections chart
  - `HistoricalTimelineVisualizationOptimized.tsx`: Performance-optimized historical chart
- **Performance Patterns**:
  - Components ending with `*Optimized.tsx` use memoization and virtualization
  - Use React.memo() and useMemo() for expensive calculations
  - Virtualized components use react-window for lists > 100 items
  - ChartSuspense wrapper provides lazy loading for all chart components

### Data Flow
1. **Static Data Generation**: `scripts/generate-static-data.js` runs during prebuild to create optimized JSON files
2. **Real-time Data**: CoinGecko API integration with caching and fallbacks for live Bitcoin prices
3. **Historical Data**: Static JSON files in `public/data/` for historical Bitcoin prices (2015-present)

## Performance Optimization Patterns

### Component Optimization
- Components ending with `*Optimized.tsx` use memoization and virtualization - prefer these for large datasets
- Use React.memo() and useMemo() for expensive calculations
- Virtualized components use react-window for lists > 100 items
- ChartSuspense wrapper provides lazy loading for all chart components

### Bundle Optimization
- Dynamic imports for route-level code splitting already configured
- Static data in `public/data/` is pre-generated and cached at build time
- Use `npm run build:analyze` to check bundle size before deployment
- Memory allocation: 4GB for builds (NODE_OPTIONS in package.json)

### API Response Caching
- Bitcoin price data cached for 5 minutes (CACHE_TTL_BITCOIN_PRICE)
- Historical data cached for 1 hour (CACHE_TTL_HISTORICAL_DATA)
- Network status cached for 30 seconds (CACHE_TTL_NETWORK_HEALTH)

## API Integration & Security

### External APIs
- **CoinGecko**: Rate limited (50 RPM default), use fallback prices on failure
- **Mempool.space**: Rate limited (60 RPM default), includes fee recommendations
- All external API calls use `secure-fetch-wrapper.ts` with retry logic

### Security Patterns
- Input validation using Zod schemas in `src/lib/validation/schemas.ts`
- Rate limiting configured per endpoint (see `.env.example`)
- API middleware in `src/lib/security/apiMiddleware.ts`
- Circuit breaker pattern for external APIs in `src/lib/security/circuitBreaker.ts`
- **Never** expose API keys in client-side code (use API routes)

### Error Handling
- Circuit breaker pattern for external APIs
- Graceful degradation with static fallback data
- Error boundaries for component-level failures
- Type-safe error handling via `src/lib/type-safe-error-handler.ts`

## Common Development Workflows

### Adding a New Calculator Feature
1. Update types in `src/types/vesting.ts`
2. Modify calculation logic in `src/lib/vesting-calculations.ts`
3. Update store in `src/stores/calculatorStore.ts`
4. Add UI components in `src/components/`
5. Write tests in `__tests__/` directories

### Updating API Endpoints
1. Create route handler in `src/app/api/[endpoint]/route.ts`
2. Add rate limiting in route handler
3. Implement input validation with Zod schemas
4. Add error handling and logging
5. Test with `src/components/dev/APITester.tsx`

### Debugging API Issues
1. Check rate limits in `.env.local`
2. Review logs in `logs/` directory
3. Test health: `npm run api:health`
4. Use `src/components/dev/APITester.tsx` for debugging
5. Check circuit breaker status in monitoring

## Code Conventions

### TypeScript Configuration
- **Strict mode enabled** with comprehensive type checking
- **Path aliases**: `@/*` maps to `./src/*`
- **Target**: ES2022 with DOM libraries

### File Organization
- Features organized by domain (calculators, historical, on-chain tracking)
- Component naming: PascalCase for components, `*Optimized.tsx` suffix for performance-critical
- Store naming: `*Store.ts` for Zustand stores
- Test naming: `*.test.ts` for unit tests, `*.performance.test.ts` for benchmarks

### Import Conventions
- **Absolute imports** using `@/` prefix
- **Named exports** preferred over default exports
- **Barrel exports** in index.ts files for clean imports

### Performance Conventions
- Memoization with `useMemo` and `useCallback` for expensive operations
- Code splitting with dynamic imports for large components
- Virtualization for lists > 100 items
- Optimized Zustand stores with selectors

## Testing Strategy

### Test Types & Patterns
- **Unit tests**: `*.test.ts` - Component and function testing
- **Performance tests**: `*.performance.test.ts` - Benchmark validation (should complete within 10s)
- **Integration tests**: `*.integration.test.ts` - Full workflow testing

### Key Test Commands
```bash
npm test                     # Run all tests
npm run test:performance     # Performance tests only
npm run test:coverage       # Generate coverage report
npm run test:watch          # Watch mode for development
npm run benchmark           # Detailed performance benchmarks
```

### Testing Best Practices
- Mock external APIs using `src/__mocks__/`
- Use `src/test-utils.tsx` for consistent test setup
- Performance tests should complete within 10 seconds
- Integration tests use real store instances

## Deployment & Build Process

### Pre-deployment Checklist
1. Run `npm run build:safe` for comprehensive validation
2. Check bundle size with `npm run build:analyze`
3. Verify all tests pass: `npm test`
4. Update static data: `npm run prebuild`
5. Test deployment locally: `npm run build && npm start`

### Netlify Configuration
- **Build command**: `npm run build`
- **Node version**: 20.19.4 (specified in `.nvmrc`)
- **Memory allocation**: 6GB (NODE_OPTIONS in netlify.toml)
- **Auto-deploys**: From main branch
- **Build cache**: Busted on types fix (see netlify.toml)

### Environment Variables
- Copy `.env.example` to `.env.local` for local development
- Critical vars: API keys, rate limits, cache TTLs
- See `.env.example` for comprehensive list

## Known Issues & Solutions

### Common Build Issues
1. **CSS not loading**: Run `node scripts/verify-css-build.js`
2. **Type errors with react-dom**: Clear node_modules and reinstall
3. **Build memory issues**: Increase NODE_OPTIONS memory allocation
4. **API rate limits**: Check `.env.local` rate limit settings

### Performance Gotchas
- Avoid rendering > 1000 data points without virtualization
- Use `*Optimized.tsx` components for large datasets
- Lazy load chart components with dynamic imports
- Monitor bundle size with `npm run build:analyze`

### Development Tips
- Use `npm run dev` for hot reloading
- Enable debug mode in `.env.local` for verbose logging
- Check `/api/health` endpoint for system status
- Use performance monitor at `npm run monitoring:dashboard`

## Tech Stack Reference

### Core Technologies
- **Next.js 14** with App Router
- **TypeScript 5** with strict mode
- **React 18** with Suspense and concurrent features
- **Tailwind CSS 3** with custom design system
- **Zustand 4** for state management

### Key Libraries
- **Recharts**: Interactive charts and visualizations
- **React Hook Form + Zod**: Form validation
- **React Window**: List virtualization
- **Headless UI**: Accessible component primitives
- **Vitest**: Testing framework

### API Integrations
- **CoinGecko**: Bitcoin price data
- **Mempool.space**: Network status and fees
- **Bitcoin address validation**: `bitcoin-address-validation`
- **Timestamp service**: Internal implementation

## Important Notes

- **Security First**: Never commit API keys or secrets
- **Performance Critical**: This is a financial calculator - accuracy and speed matter
- **Mobile Responsive**: All features must work on mobile devices
- **Accessibility**: Follow WCAG 2.1 AA standards
- **Browser Support**: Chrome, Firefox, Safari, Edge (latest 2 versions)
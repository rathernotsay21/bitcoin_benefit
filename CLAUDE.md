# CLAUDE.md - Ultimate Developer Guide for Bitcoin Benefit

This file provides comprehensive guidance to Claude Code (claude.ai/code) for efficient development on the Bitcoin Benefit platform.

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Reference](#quick-reference)
3. [⚠️ CRITICAL: Static Export Limitations](#critical-static-export-limitations)
4. [Token Efficiency Guidelines](#token-efficiency-guidelines)
5. [Critical Development Commands](#critical-development-commands)
6. [Complete Architecture Reference](#complete-architecture-reference)
7. [Bitcoin Tools Development Guide](#bitcoin-tools-development-guide)
8. [Advanced Analytics Development](#advanced-analytics-development)
9. [API Development Guide](#api-development-guide)
10. [Security Checklist](#security-checklist)
11. [Performance Requirements](#performance-requirements)
12. [Testing Requirements](#testing-requirements)
13. [Common Development Workflows](#common-development-workflows)
14. [All NPM Scripts Reference](#all-npm-scripts-reference)
15. [Code Conventions](#code-conventions)
16. [Deployment & Build Process](#deployment--build-process)
17. [Troubleshooting Guide](#troubleshooting-guide)
18. [Important Notes](#important-notes)

---

## Project Overview

Bitcoin Benefit is a comprehensive Bitcoin vesting calculator and benefits platform that helps companies implement Bitcoin-based employee compensation packages. The platform provides:

- **Core Features**: Future projections (20-year), Historical analysis (2015-present), Three vesting schemes
- **Bitcoin Tools Suite**: Transaction lookup, Address explorer, Fee calculator, Document timestamping, Network status monitor
- **Advanced Analytics**: Tax calculator, Risk analysis, Retention modeling, Growth projections
- **Infrastructure**: Real-time pricing, On-chain tracking, Enterprise security, Performance monitoring
- **Services**: Enhanced rate limiting, Privacy management, Secure file handling, Transaction analysis

## Quick Reference

### 🚀 Most Used Commands
```bash
npm run dev                # Start development
npm run lint               # Check code style
npm run type-check         # Check TypeScript
npm test                   # Run tests
npm run build             # Production build
```

### 📁 Key File Locations
```
src/lib/vesting-*.ts       # Vesting logic
src/lib/calculators/*.ts   # Advanced calculators
src/app/api/*/route.ts     # API endpoints (STATIC ONLY!)
src/stores/*Store.ts       # State management
src/components/bitcoin-tools/*.tsx  # Bitcoin tools
src/lib/services/*.ts      # Service layer
```

### ⚡ Performance Targets
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- Bundle < 500KB
- Memory < 100MB

## ⚠️ CRITICAL: Static Export Limitations

### **THIS PROJECT USES `output: 'export'` - STATIC SITE GENERATION ONLY!**

This means:
- ❌ **NO DYNAMIC ROUTES**: Cannot use `[param]` in API routes
- ❌ **NO SERVER-SIDE RENDERING**: All pages are pre-rendered at build time
- ❌ **NO MIDDLEWARE**: Next.js middleware doesn't work with static export
- ❌ **NO IMAGE OPTIMIZATION**: Next.js Image optimization requires a server
- ✅ **STATIC API ROUTES ONLY**: Routes like `/api/bitcoin-price` work
- ✅ **CLIENT-SIDE FETCHING**: Use direct API calls from browser when possible
- ✅ **PRE-GENERATED DATA**: Use build-time data generation via `prebuild` script

### API Route Rules for Static Export

#### ✅ ALLOWED - Static API Routes
```typescript
// src/app/api/bitcoin-price/route.ts
export async function GET() {
  // Static route without parameters - WORKS!
  return NextResponse.json({ price: 100000 });
}
```

#### ❌ FORBIDDEN - Dynamic API Routes
```typescript
// src/app/api/address/[address]/route.ts
export async function GET(request, { params }) {
  // Dynamic route with [address] parameter - WILL BREAK BUILD!
  // Error: Missing generateStaticParams() for static export
}
```

### Working with External APIs

Since we can't create dynamic proxy routes, use these strategies:

1. **Direct Client-Side Calls** (when CORS is enabled):
```typescript
// Good - Direct call from client
const response = await fetch('https://mempool.space/api/address/abc123');
```

2. **Static Proxy Routes** (for APIs without CORS):
```typescript
// Create /api/coingecko/route.ts that handles params via query string
const response = await fetch('/api/coingecko?endpoint=/simple/price&ids=bitcoin');
```

3. **Build-Time Data Generation**:
```typescript
// Generate data during build via scripts/generate-static-data.js
// Data saved to public/data/*.json and imported statically
```

## Token Efficiency Guidelines

### File Reading Strategy
- **NEVER** read entire source files unless absolutely necessary
- Use symbolic search tools (`find_symbol`, `get_symbols_overview`) first
- Static data files in `public/data/` are pre-generated - no need to regenerate
- Test files follow `*.test.ts` or `*.performance.test.ts` patterns
- Critical CSS is auto-generated in `public/critical.css`

### Quick File Locations Matrix

| Feature | Location | Key Files |
|---------|----------|-----------|
| Vesting Logic | `src/lib/` | `vesting-calculations.ts`, `vesting-schemes.ts` |
| API Routes | `src/app/api/` | `*/route.ts` (STATIC ONLY!) |
| State Management | `src/stores/` | `calculatorStore.ts`, `historicalCalculatorStore.ts`, `bitcoinToolsStore.ts` |
| Bitcoin Tools | `src/components/bitcoin-tools/` | `*Tool.tsx`, `NetworkStatus.tsx` |
| Services | `src/lib/services/` | `addressService.ts`, `transactionService.ts`, `networkService.ts` |
| Charts | `src/components/` | `*Chart*.tsx`, `*Visualization*.tsx` |
| Security | `src/lib/security/` | `rateLimiter.ts`, `circuitBreaker.ts` |
| Performance | `src/lib/performance/` | `monitor.tsx`, `object-pool.ts` |
| Types | `src/types/` | `vesting.ts`, `bitcoin-tools.ts` |

### Directories to Avoid Reading
- `node_modules/`, `.next/`, `out/`, `coverage/`
- Generated files: `*.tsbuildinfo`, `next-env.d.ts`
- Large JSON data files in `src/data/` (use specific queries instead)
- `hamburger_meat/` - deprecated/archived content
- `docs/hamburger_meat/` - old documentation

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
npm run perf:lighthouse  # Lighthouse audit
npm run perf:budget      # Check performance budget
```

### Data Management
```bash
npm run update-bitcoin-data              # Update all historical data
npm run update-bitcoin-year --year=2024  # Update specific year
npm run clear-bitcoin-cache              # Clear cache if needed
npm run prebuild                        # Generate static data files
```

## Complete Architecture Reference

### System Architecture
```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js App   │────▶│  Static API  │────▶│  External   │
│  (Static Export)│     │   Routes     │     │    APIs     │
└─────────────────┘     └──────────────┘     └─────────────┘
         │                      │                     │
         ▼                      ▼                     ▼
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Zustand Store  │     │ Rate Limiter │     │  CoinGecko  │
│  (State Mgmt)   │     │   & Cache    │     │  Mempool    │
└─────────────────┘     └──────────────┘     └─────────────┘
```

### Core Calculation System
1. **Future Projections** (`src/lib/vesting-calculations.ts`)
2. **Historical Analysis** (`src/lib/historical-calculations.ts`)
3. **Vesting Schemes** (`src/lib/vesting-schemes.ts`)

### State Management Architecture
```typescript
// Zustand stores in src/stores/
calculatorStore.ts         // Future calculator state
historicalCalculatorStore.ts // Historical calculator state
onChainStore.ts           // Blockchain tracking state
bitcoinToolsStore.ts      // Bitcoin tools state
```

### Service Layer Architecture
```typescript
// Services in src/lib/services/
addressService.ts         // Bitcoin address analysis
transactionService.ts     // Transaction details & validation
networkService.ts         // Network health monitoring
timestampService.ts       // Document timestamping
privacyManager.ts        // Privacy settings management
enhancedRateLimiter.ts   // Advanced rate limiting
secureFileHandler.ts     // Secure file operations
```

### Component Architecture
```typescript
// Performance-optimized components
*Optimized.tsx            // Use memoization and virtualization
// Chart components
VestingTimelineChartRecharts.tsx
HistoricalTimelineVisualizationOptimized.tsx
// Tool components
src/components/bitcoin-tools/*.tsx
// Educational components
src/components/bitcoin-tools/educational/*.tsx
```

## Bitcoin Tools Development Guide

### Current Bitcoin Tools
1. **Transaction Lookup** - Search and analyze Bitcoin transactions
2. **Address Explorer** - Explore Bitcoin address details and history
3. **Fee Calculator** - Calculate optimal transaction fees
4. **Document Timestamping** - Create blockchain timestamps for documents
5. **Network Status** - Monitor Bitcoin network health and statistics

### Tool Architecture Pattern
Every Bitcoin tool follows this pattern:

```typescript
// 1. Tool Component Structure
export function ToolNameTool() {
  // State from Zustand store
  const toolState = useBitcoinToolsStore(state => state.tools.toolName);
  
  // Error boundary wrapper
  return (
    <ToolErrorBoundary toolName="Tool Name">
      <ToolContent />
    </ToolErrorBoundary>
  );
}

// 2. Error Handling
const handleError = (error: unknown) => {
  const toolError = createToolError(
    'network',          // type
    'API_ERROR',       // code
    error,             // original error
    { endpoint: url }  // context
  );
  setError(toolError);
};

// 3. Educational Content
<BitcoinTooltip term="TRANSACTION_ID">
  <span>Transaction ID</span>
</BitcoinTooltip>
```

### Adding a New Bitcoin Tool

1. **Create Tool Component**: `src/components/bitcoin-tools/NewTool.tsx`
2. **Add to Store**: Update `bitcoinToolsStore.ts`
3. **Create Static API Route**: `src/app/api/toolname/route.ts` (NO DYNAMIC PARAMS!)
4. **Add Error Boundary**: Wrap with `ToolErrorBoundary`
5. **Add Educational Content**: Use `BitcoinTooltip` components
6. **Add Loading States**: Use `ToolSkeleton` component
7. **Add Tests**: `src/components/bitcoin-tools/__tests__/NewTool.test.tsx`

### Tool Services Integration
```typescript
// Use service layer for complex operations
import { AddressService } from '@/lib/services/addressService';
import { TransactionService } from '@/lib/services/transactionService';

// Services handle caching, validation, and API calls
const data = await AddressService.analyzeAddress(address);
```

### Tool Error Types
```typescript
type ToolErrorType = 
  | 'validation'    // Invalid input
  | 'network'       // API failure
  | 'timeout'       // Request timeout
  | 'api'          // API error response
  | 'not_found'    // Resource not found
  | 'rate_limit'   // Rate limit exceeded
  | 'unknown';     // Unexpected error
```

## Advanced Analytics Development

### Calculator Functions Available

1. **BitcoinGrowthProjector** - Price projection scenarios
2. **TaxImplicationCalculator** - Capital gains calculations
3. **EmployeeRetentionModeler** - Retention probability modeling
4. **RiskAnalysisEngine** - Monte Carlo simulations
5. **VestingScheduleCalculator** - Custom vesting schedules

### Adding a New Calculator

```typescript
// 1. Create calculator class in src/lib/calculators/
export class NewCalculator {
  calculate(params: Params): Result {
    // Implementation
  }
}

// 2. Add to index export
export { NewCalculator } from './NewCalculator';

// 3. Create tests
describe('NewCalculator', () => {
  // Test cases
});
```

### Calculator Integration Pattern
```typescript
// In component
import { NewCalculator } from '@/lib/calculators';

const calculator = useMemo(() => new NewCalculator(), []);
const result = useMemo(
  () => calculator.calculate(params),
  [calculator, params]
);
```

## API Development Guide

### ⚠️ STATIC API ROUTES ONLY!

Due to `output: 'export'`, we can only create static API routes without dynamic parameters.

### Static API Endpoint Creation

```typescript
// ✅ CORRECT: src/app/api/bitcoin-price/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get parameters from query string, not route params
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  
  try {
    // Make external API call
    const response = await fetch(`https://api.example.com/address/${address}`);
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
```

### Current API Endpoints

| Endpoint | Method | Purpose | Notes |
|----------|--------|---------|-------|
| `/api/bitcoin-price` | GET | Get current BTC price | Proxies to CoinGecko |
| `/api/coingecko` | GET | CoinGecko proxy | Handles CORS |
| `/api/indexnow` | POST | SEO indexing | Netlify only |

### External API Integration

For APIs with CORS support (like mempool.space):
```typescript
// Call directly from client
const response = await fetch('https://mempool.space/api/address/abc123');
```

For APIs without CORS (need proxy):
```typescript
// Create static proxy route that uses query params
const response = await fetch('/api/proxy?url=' + encodeURIComponent(apiUrl));
```

## Security Checklist

### Required for All Changes
- [ ] Input validation with Zod schemas
- [ ] Rate limiting configured (use enhancedRateLimiter)
- [ ] API keys in environment variables only
- [ ] No sensitive data in logs
- [ ] Error messages sanitized
- [ ] CORS headers configured (in netlify.toml)
- [ ] XSS prevention measures
- [ ] SQL injection prevention (if applicable)
- [ ] CSRF protection enabled
- [ ] Dependencies up to date

### Security Patterns

```typescript
// Input Validation
const schema = z.object({
  btcAmount: z.number().min(0.00000001).max(21000000),
  address: z.string().regex(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/),
  txid: z.string().length(64)
});

// Enhanced Rate Limiting
import { enhancedRateLimiter } from '@/lib/services/enhancedRateLimiter';
const allowed = await enhancedRateLimiter.checkLimit(request);

// Circuit Breaker
const breaker = new CircuitBreaker({
  timeout: 30000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
});
```

### Content Security Policy
Configured in `netlify.toml`:
- Allows fonts from Google Fonts and Perplexity CDN
- Restricts script sources
- Enables upgrade-insecure-requests
- Blocks framing (frame-ancestors: 'none')

## Performance Requirements

### Core Web Vitals
```
LCP (Largest Contentful Paint) < 2.5s
FID (First Input Delay) < 100ms
CLS (Cumulative Layout Shift) < 0.1
```

### Performance Benchmarks
```
Lighthouse Score > 95
First Contentful Paint < 1.2s
Time to Interactive < 3.5s
Bundle Size < 500KB (gzipped)
Memory Usage < 100MB
API Response < 200ms (p95)
```

### Performance Optimization Checklist
- [ ] Use React.memo() for expensive components
- [ ] Implement useMemo() for expensive calculations
- [ ] Use useCallback() for event handlers
- [ ] Implement virtualization for lists > 100 items
- [ ] Use dynamic imports for code splitting
- [ ] Optimize images (unoptimized due to static export)
- [ ] Implement proper caching strategies
- [ ] Use Web Workers for heavy calculations
- [ ] Critical CSS inlined (auto-generated in public/critical.css)

## Testing Requirements

### Test Coverage Requirements
- **Unit Tests**: 80%+ coverage required
- **Integration Tests**: All API endpoints
- **Performance Tests**: Must complete within 10s
- **Accessibility Tests**: WCAG 2.1 AA compliance

### Testing Patterns

```typescript
// Unit Test
describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
});

// Performance Test
describe('Performance', () => {
  it('should complete within 100ms', async () => {
    const start = performance.now();
    await heavyOperation();
    expect(performance.now() - start).toBeLessThan(100);
  });
});

// API Test (for static routes only!)
describe('API Route', () => {
  it('should return data', async () => {
    const response = await fetch('/api/bitcoin-price');
    expect(response.status).toBe(200);
  });
});
```

## Common Development Workflows

### Adding a New Calculator Feature
1. Update types in `src/types/vesting.ts`
2. Modify calculation logic in `src/lib/vesting-calculations.ts`
3. Update store in `src/stores/calculatorStore.ts`
4. Add UI components in `src/components/`
5. Write tests in `__tests__/` directories
6. Run `npm test` to verify
7. Run `npm run build` to check production build

### Creating a Static API Endpoint
1. Create route handler in `src/app/api/[endpoint]/route.ts` (NO DYNAMIC SEGMENTS!)
2. Use query parameters for dynamic data
3. Add input validation with Zod schemas
4. Implement error handling
5. Test locally with `npm run dev`
6. Verify build with `npm run build`
7. Add integration tests

### Adding a Bitcoin Tool
1. Create component in `src/components/bitcoin-tools/`
2. Add state to `bitcoinToolsStore.ts`
3. Create service in `src/lib/services/` if needed
4. Create static API route if needed (NO DYNAMIC PARAMS!)
5. Add error boundary wrapper
6. Implement educational tooltips
7. Add loading states with ToolSkeleton
8. Write tests
9. Update documentation

### Debugging Performance Issues
1. Run `npm run perf:lighthouse` for Lighthouse audit
2. Check bundle size with `npm run build:analyze`
3. Profile with React DevTools Profiler
4. Check memory usage in Chrome DevTools
5. Review network waterfall
6. Identify render bottlenecks
7. Implement optimizations
8. Re-run benchmarks

### Handling CORS Issues
1. Check if external API supports CORS
2. If yes: Call directly from client
3. If no: Create static proxy route with query params
4. Never create dynamic routes with [param] syntax
5. Update CSP in netlify.toml if needed

## All NPM Scripts Reference

### Development Scripts
```bash
npm run dev                    # Start development server
npm run dev:clean             # Clean start with cache clear
npm run cache:clear           # Clear .next and node_modules cache
npm run cache:clear:all       # Clear all caches including .next/cache
```

### Build Scripts
```bash
npm run prebuild              # Generate static data before build
npm run build                 # Production build with CSS verification
npm run build:safe            # Build with all validations
npm run build:analyze         # Build with bundle analyzer
npm run build:optimized       # Build with optimized config
npm start                     # Start production server
npm run export                # Export static site (deprecated, use build)
```

### Testing Scripts
```bash
npm test                      # Run all tests
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Generate coverage report
npm run test:performance     # Run performance tests only
npm run test:performance:watch # Watch performance tests
npm run test:performance:ui  # Performance tests with UI
npm run test:all             # Run complete test suite
npm run test:validate        # Validate test files
npm run test:health          # Check test health
npm run test:dashboard       # View test dashboard
npm run test:maintenance     # Run test maintenance
npm run test:fix-strings     # Fix test string issues
npm run test:fix-issues      # Fix test issues
npm run test:hooks:install   # Install test hooks
npm run test:hooks:remove    # Remove test hooks
npm run test:hooks:status    # Check hooks status
```

### Performance Scripts
```bash
npm run benchmark             # Run performance benchmarks
npm run benchmark:report      # Detailed benchmark report
npm run validate:optimizations # Validate optimizations
npm run perf:lighthouse       # Run Lighthouse audit
npm run perf:budget          # Check performance budget
npm run perf:analyze         # Full performance analysis
npm run optimize             # Run optimization script
npm run optimize:analyze     # Analyze optimization opportunities
npm run extract-critical-css # Extract critical CSS for inlining
```

### Data Management Scripts
```bash
npm run update-bitcoin-data   # Update all historical Bitcoin data
npm run update-bitcoin-year   # Update specific year data
npm run clear-bitcoin-cache   # Clear Bitcoin data cache
npm run generate-static-data  # Generate all static data files
```

### Deployment Scripts
```bash
npm run deploy               # Build and deploy to Netlify
npm run deploy:test         # Test deployment readiness
npm run test:deployment     # Run deployment tests
```

### Security Scripts
```bash
npm run security:check       # Check for vulnerabilities
npm run security:fix        # Auto-fix vulnerabilities
npm run security:audit      # Run security audit
npm run security:fix-force  # Force fix vulnerabilities
npm run security:full-scan  # Complete security scan
npm run security:licenses   # Check license compliance
npm run security:sbom       # Generate SBOM
npm run security:update-deps # Update dependencies safely
npm run security:analyze    # Run security analyzer
npm run security:lockfile-lint # Lint lockfile
```

### Code Quality Scripts
```bash
npm run lint                # Run ESLint
npm run type-check         # Check TypeScript types
npm run verify-types       # Verify all types
npm run verify-css-build   # Verify CSS build
```

### API Scripts
```bash
npm run api:health         # Check API health
npm run api:monitor        # Monitor API performance
```

### Monitoring Scripts
```bash
npm run monitoring:dashboard # View monitoring dashboard
```

### Utility Scripts
```bash
npm run redis:install      # Install Redis (optional)
```

## Code Conventions

### TypeScript Configuration
- **Strict mode enabled** with comprehensive type checking
- **Path aliases**: `@/*` maps to `./src/*`
- **Target**: ES2022 with DOM libraries
- **Build errors temporarily ignored** (TODO: fix remaining TS errors)

### File Organization
- Features organized by domain (calculators, historical, on-chain tracking)
- Component naming: PascalCase for components, `*Optimized.tsx` suffix for performance-critical
- Store naming: `*Store.ts` for Zustand stores
- Service naming: `*Service.ts` for service layer
- Test naming: `*.test.ts` for unit tests, `*.performance.test.ts` for benchmarks

### Import Conventions
```typescript
// Correct import order
import { useState, useEffect } from 'react'; // React
import { useRouter } from 'next/navigation'; // Next.js
import { z } from 'zod';                     // External libraries
import { calculateVesting } from '@/lib/vesting-calculations'; // Internal absolute
import { Button } from '@/components/ui/button'; // UI components
import type { VestingScheme } from '@/types/vesting'; // Types
```

### Component Patterns
```typescript
// Memoized component
export const ExpensiveComponent = React.memo(({ data }) => {
  const processed = useMemo(() => processData(data), [data]);
  return <div>{processed}</div>;
});

// Error boundary wrapper
export default function ComponentWithErrorBoundary(props) {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Component {...props} />
    </ErrorBoundary>
  );
}

// Tool component pattern
export function BitcoinTool() {
  const state = useBitcoinToolsStore(selector);
  return (
    <ToolErrorBoundary toolName="Bitcoin Tool">
      <ToolContent />
    </ToolErrorBoundary>
  );
}
```

### Performance Conventions
- Memoization with `useMemo` and `useCallback` for expensive operations
- Code splitting with dynamic imports for large components
- Virtualization for lists > 100 items
- Optimized Zustand stores with selectors
- Critical CSS extraction and inlining

## Deployment & Build Process

### Pre-deployment Checklist
1. Run `npm run build:safe` for comprehensive validation
2. Check bundle size with `npm run build:analyze`
3. Verify all tests pass: `npm test`
4. Update static data: `npm run prebuild`
5. Test deployment locally: `npm run build && npm start`
6. Check performance: `npm run perf:lighthouse`
7. Security audit: `npm run security:full-scan`
8. Verify no dynamic routes are used

### Netlify Configuration
- **Build command**: `npm run build`
- **Output directory**: `out` (from static export)
- **Node version**: 20.19.4 (specified in `.nvmrc`)
- **Memory allocation**: 6GB (NODE_OPTIONS in netlify.toml)
- **Auto-deploys**: From main branch
- **Build cache**: Busted on types fix (see netlify.toml)
- **Headers & CSP**: Configured in netlify.toml

### Environment Variables
```env
# Required for production
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_COINGECKO_API_KEY=
NEXT_PUBLIC_MEMPOOL_API_URL=

# Rate limiting
RATE_LIMIT_PER_MINUTE=50
RATE_LIMIT_BLOCK_DURATION=600

# Caching
CACHE_TTL_BITCOIN_PRICE=300
CACHE_TTL_HISTORICAL_DATA=3600
CACHE_TTL_NETWORK_HEALTH=30

# Performance
NODE_OPTIONS=--max-old-space-size=4096

# Feature flags
NEXT_PUBLIC_USE_FALLBACK_PRICES=false
NEXT_PUBLIC_MIN_REQUEST_INTERVAL=3000
NEXT_PUBLIC_MAX_REQUESTS_PER_MINUTE=10
```

## Troubleshooting Guide

### Common Build Issues

#### Dynamic Route Error
```
Error: Page "/api/[param]/route" is missing "generateStaticParams()"
```
**Solution**: Remove dynamic segments from API routes. Use query parameters instead.

#### CSS not loading
```bash
node scripts/verify-css-build.js
node scripts/extract-critical-css.js
```

#### Type errors with react-dom
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Build memory issues
```bash
NODE_OPTIONS='--max-old-space-size=6144' npm run build
```

#### API rate limits
Check `.env.local` rate limit settings and use enhancedRateLimiter service

### Performance Issues

#### Slow initial load
- Check bundle size: `npm run build:analyze`
- Review code splitting in `next.config.js`
- Verify critical CSS is inlined
- Check if static data is pre-generated

#### High memory usage
- Check for memory leaks in components
- Review virtualization implementation
- Monitor with Chrome DevTools Memory Profiler
- Use object pooling for frequently created objects

#### Slow calculations
- Implement Web Workers for heavy operations
- Add debouncing to user inputs
- Use memoization for expensive calculations
- Pre-calculate common scenarios during build

### CORS Issues

#### External API blocked by CORS
1. Check if API supports CORS headers
2. If yes: Call directly from client
3. If no: Create static proxy route
4. Use query parameters, not dynamic routes
5. Update CSP in netlify.toml if needed

Example proxy route:
```typescript
// /api/proxy/route.ts
export async function GET(request) {
  const url = new URL(request.url).searchParams.get('url');
  const response = await fetch(url);
  return NextResponse.json(await response.json());
}
```

### Development Tips
- Use `npm run dev` for hot reloading
- Enable debug mode in `.env.local` for verbose logging
- Check `/api/health` endpoint for system status (if implemented)
- Use performance monitor at `npm run monitoring:dashboard`
- Review React DevTools Profiler for render issues
- Always verify static export compatibility

### Common Error Patterns

#### Rate Limit Errors
```typescript
if (error.code === 'RATE_LIMIT_EXCEEDED') {
  // Use enhancedRateLimiter service
  await enhancedRateLimiter.waitForReset();
  return retry();
}
```

#### API Timeout Errors
```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000);

try {
  const response = await fetch(url, { signal: controller.signal });
} finally {
  clearTimeout(timeout);
}
```

#### State Update Errors
```typescript
// Avoid state updates on unmounted components
useEffect(() => {
  let mounted = true;
  
  fetchData().then(data => {
    if (mounted) setState(data);
  });
  
  return () => { mounted = false; };
}, []);
```

## Important Notes

### Security First
- Never commit API keys or secrets
- Always validate user input
- Use environment variables for configuration
- Implement rate limiting on all endpoints
- Sanitize error messages
- CSP configured in netlify.toml

### Performance Critical
- This is a financial calculator - accuracy and speed matter
- Always test performance impact of changes
- Monitor bundle size growth
- Implement proper caching strategies
- Use virtualization for large datasets
- Critical CSS auto-extracted and inlined

### Static Export Limitations
- **NO DYNAMIC ROUTES** - This cannot be emphasized enough
- All API routes must be static
- Use query parameters for dynamic data
- Pre-generate data at build time when possible
- Client-side fetching for real-time data

### Mobile Responsive
- All features must work on mobile devices
- Test on actual devices, not just browser DevTools
- Ensure touch targets are at least 44x44px
- Implement proper viewport meta tags

### Accessibility
- Follow WCAG 2.1 AA standards
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers

### Browser Support
- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile Safari iOS 14+
- Chrome Android 90+
- Test in all supported browsers before deployment

### Code Quality
- Maintain 80%+ test coverage
- Document complex logic
- Keep components under 200 lines
- Follow established patterns
- Review performance impact
- Use service layer for business logic

---

## Quick Debugging Commands

```bash
# Check system status
curl http://localhost:3000/api/health

# Clear all caches
npm run cache:clear:all

# Reset development environment
rm -rf .next node_modules
npm install
npm run dev

# Check for type errors
npm run type-check -- --listFilesOnly

# Find large dependencies
npm ls --depth=0 | awk '{print $2}' | xargs -I {} sh -c 'echo {} $(npm pack {} 2>/dev/null | tail -1 | awk "{print \$NF}")'

# Profile bundle
ANALYZE=true npm run build

# Generate static data
npm run prebuild

# Extract critical CSS
npm run extract-critical-css

# Verify static export compatibility
npm run build
```

---

## Recent Updates (2024-2025)

### New Features Added
- Enhanced Bitcoin Tools suite with educational components
- Network status monitoring with real-time updates
- Advanced service layer for all Bitcoin operations
- Enhanced rate limiting with sophisticated algorithms
- Privacy management system
- Document timestamping service
- Critical CSS extraction and inlining
- Improved error boundaries for all tools

### Architecture Changes
- Migrated to static export (`output: 'export'`)
- Removed all dynamic API routes
- Implemented service layer pattern
- Added comprehensive error handling
- Improved caching strategies
- Enhanced TypeScript types

### Performance Improvements
- Critical CSS inlining
- Object pooling for frequent allocations
- Improved memoization strategies
- Bundle size optimizations
- Static data pre-generation

### Security Enhancements
- Updated CSP headers
- Enhanced rate limiting
- Improved input validation
- Better error sanitization
- Secure file handling

---

**Remember**: 
1. **NEVER create dynamic API routes** - they break the static export
2. Always use query parameters for dynamic data in API routes
3. Prefer client-side fetching when the external API supports CORS
4. When in doubt, refer to existing patterns in the codebase
5. The best code is consistent code
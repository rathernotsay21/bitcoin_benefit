# CLAUDE.md - Bitcoin Benefit Developer Guide

## ⚠️ CRITICAL: Static Export Limitations

### **THIS PROJECT USES `output: 'export'` - STATIC SITE GENERATION ONLY!**

**BREAKING CHANGES TO AVOID:**
- ❌ **NO DYNAMIC ROUTES**: Cannot use `[param]` in API routes - **WILL BREAK BUILD**
- ❌ **NO SERVER-SIDE RENDERING**: Everything pre-rendered at build time
- ❌ **NO MIDDLEWARE**: Next.js middleware incompatible with static export
- ✅ **STATIC API ROUTES ONLY**: Use query parameters for dynamic data
- ✅ **CLIENT-SIDE FETCHING**: Direct API calls when CORS enabled

### API Route Rules

#### ✅ CORRECT - Static Route
```typescript
// src/app/api/bitcoin-price/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address'); // Use query params!
  return NextResponse.json(data);
}
```

#### ❌ WRONG - Dynamic Route (BREAKS BUILD!)
```typescript
// src/app/api/[param]/route.ts - WILL FAIL!
// Error: Missing generateStaticParams() for static export
```

### External API Strategies

1. **CORS-enabled APIs** (mempool.space): Call directly from client
2. **No CORS**: Create static proxy with query params
3. **Build-time data**: Use `prebuild` script for static generation

---

## Project Overview

Bitcoin vesting calculator platform with:
- Future projections, historical analysis, vesting schemes
- Bitcoin tools: Transaction lookup, Address explorer, Fee calculator, Timestamping, Network status
- Services: Rate limiting, Privacy management, Transaction analysis

## Quick Reference

### Essential Commands
```bash
npm run dev          # Development
npm run lint         # Check code
npm run type-check   # Check types
npm run build        # Production build - VERIFY NO DYNAMIC ROUTES!
npm run prebuild     # Generate static data
```

### Key Locations
```
src/app/api/*/route.ts        # API routes (STATIC ONLY!)
src/lib/services/*.ts         # Service layer
src/stores/*Store.ts          # State management
src/components/bitcoin-tools/ # Bitcoin tools
public/data/*.json           # Pre-generated static data
```

### Performance Targets
- LCP < 2.5s, FID < 100ms, CLS < 0.1
- Bundle < 500KB, Memory < 100MB

---

## Common Breaking Issues & Solutions

### 1. Dynamic Route Error
```
Error: Page "/api/[param]/route" is missing "generateStaticParams()"
```
**FIX**: Remove `[param]` segments. Use query parameters instead.

### 2. Build Failures
```bash
# Memory issues
NODE_OPTIONS='--max-old-space-size=6144' npm run build

# Type errors
rm -rf node_modules package-lock.json && npm install
```

### 3. CORS Issues
- **mempool.space**: Has CORS, call directly
- **CoinGecko**: No CORS, use `/api/coingecko` proxy
- **CSP errors**: Update `netlify.toml`

---

## Architecture Essentials

### State Management
```typescript
calculatorStore.ts    // Future calculator
historicalCalculatorStore.ts // Historical
bitcoinToolsStore.ts  // Bitcoin tools
onChainStore.ts      // Blockchain tracking
```

### Service Layer
```typescript
addressService.ts     // Address analysis
transactionService.ts // Transaction validation
networkService.ts    // Network monitoring
enhancedRateLimiter.ts // Rate limiting
```

### Current API Endpoints
| Endpoint | Purpose | Notes |
|----------|---------|-------|
| `/api/bitcoin-price` | BTC price | Static proxy |
| `/api/coingecko` | CoinGecko proxy | Query params only |
| `/api/indexnow` | SEO | Netlify only |

---

## Development Workflows

### Adding API Endpoint (STATIC ONLY!)
1. Create `src/app/api/endpoint/route.ts` (NO `[brackets]`!)
2. Use query parameters: `searchParams.get('param')`
3. Add validation with Zod
4. Test build: `npm run build`

### Adding Bitcoin Tool
1. Component: `src/components/bitcoin-tools/NewTool.tsx`
2. Update `bitcoinToolsStore.ts`
3. Add service if needed
4. Wrap with `ToolErrorBoundary`
5. Create STATIC API route if needed

### Pre-deployment Checklist
1. ✅ No dynamic routes (`[param]`)
2. ✅ `npm run lint` passes
3. ✅ `npm run type-check` passes
4. ✅ `npm run build` succeeds
5. ✅ Static data updated: `npm run prebuild`

---

## Security & Performance

### Required Security
- Input validation (Zod)
- Rate limiting (`enhancedRateLimiter`)
- Environment variables for secrets
- CSP in `netlify.toml`

### Performance Patterns
- `React.memo()` for expensive components
- `useMemo()` for calculations
- Critical CSS auto-inlined
- Static data pre-generation

---

## Environment Variables
```env
NEXT_PUBLIC_COINGECKO_API_KEY=
NEXT_PUBLIC_MEMPOOL_API_URL=
NODE_OPTIONS=--max-old-space-size=4096
```

---

## Critical File Patterns

### Component Pattern
```typescript
export function BitcoinTool() {
  const state = useBitcoinToolsStore(selector);
  return (
    <ToolErrorBoundary toolName="Tool">
      <ToolContent />
    </ToolErrorBoundary>
  );
}
```

### Service Pattern
```typescript
// Direct client call when CORS available
const response = await fetch('https://mempool.space/api/...');

// Static proxy when no CORS
const response = await fetch('/api/proxy?url=' + encodeURIComponent(url));
```

---

## Debugging Commands
```bash
# Clear caches
npm run cache:clear:all

# Reset environment
rm -rf .next node_modules && npm install

# Check bundle size
ANALYZE=true npm run build

# Generate static data
npm run prebuild

# Verify build
npm run build
```

---

## Recent Changes (2024-2025)
- Migrated to static export (`output: 'export'`)
- Removed ALL dynamic API routes
- Added service layer pattern
- Enhanced rate limiting
- Critical CSS inlining
- Network status monitoring

---

## Remember
1. **NEVER create dynamic API routes** - breaks static export
2. **Always use query parameters** for dynamic data
3. **Test with `npm run build`** before committing
4. **Pre-generate static data** when possible
5. **Direct client fetching** when API has CORS

---

## Token Efficiency

When reading files:
- Use symbolic search tools first
- Never read `node_modules/`, `.next/`, `out/`
- Static data in `public/data/` is pre-generated
- Avoid reading entire source files

---

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Dynamic route error | Remove `[param]`, use query strings |
| Build memory error | `NODE_OPTIONS='--max-old-space-size=6144'` |
| CORS blocked | Create static proxy with query params |
| CSS not loading | Run `npm run extract-critical-css` |
| Type errors | Clean install: `rm -rf node_modules` |

**Critical**: This project CANNOT use dynamic routes. All API routes must be static with parameters passed via query strings. Test every change with `npm run build` to ensure compatibility.
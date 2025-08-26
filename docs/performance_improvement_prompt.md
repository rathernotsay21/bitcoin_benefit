# Performance Optimization Implementation - Phases 1-2

## Context
You are implementing critical performance optimizations for the Bitcoin Benefit website to improve its PageSpeed score from ~50 to 90+. A comprehensive analysis has been completed and documented in `/Users/rathernotsay/Documents/GitHub/bitcoin_benefit/docs/performance_improvement_Aug2025.md`. You will implement the first two phases which provide high impact with minimal changes.

## Critical Instructions
1. **Think hard** at each step - consider all impacts and dependencies
2. Consult appropriate @sub_agents/ where indicated for optimal results  
3. Test each change thoroughly before moving to the next phase
4. Preserve all existing functionality while optimizing performance
5. Keep Recharts library (do not replace with other charting libraries)

## Phase 1: Remove Excessive Resource Hints (15% Performance Impact)

### Step 1.1: Clean Up Prefetch Links
**Consult**: @sub_agents/performance-engineer for optimal resource loading strategy

Edit `/src/app/layout.tsx`:

Remove lines 56-67 (excessive prefetch links):
```tsx
// DELETE these lines:
<link rel="prefetch" href="/data/bitcoin-price.json" as="fetch" crossOrigin="anonymous" />
<link rel="prefetch" href="/data/historical-bitcoin.json" as="fetch" crossOrigin="anonymous" />
<link rel="prefetch" href="/data/schemes-meta.json" as="fetch" crossOrigin="anonymous" />
<link rel="prefetch" href="/data/static-calculations.json" as="fetch" crossOrigin="anonymous" />
<link rel="modulepreload" href="/_next/static/chunks/webpack.js" />
<link rel="prefetch" href="/calculator/pioneer" />
<link rel="prefetch" href="/bitcoin-tools" />
```

Keep only the critical preconnects (lines 49-53):
```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link rel="preconnect" href="https://api.coingecko.com" crossOrigin="anonymous" />
<link rel="preconnect" href="https://mempool.space" crossOrigin="anonymous" />
<link rel="dns-prefetch" href="https://api.mempool.space" />
```

### Step 1.2: Verify and Test
**Think hard** about impact:
1. Check Network tab in DevTools - should see reduced initial requests
2. Verify no functionality is broken
3. Test navigation to prefetched routes still works
4. Check that data still loads when needed

## Phase 2: Optimize Critical CSS (10% Performance Impact)

### Step 2.1: Extract Critical CSS to External File
**Consult**: @sub_agents/performance-engineer for critical CSS optimization

Create `/src/styles/critical.css`:
```css
/* Minimal critical CSS for above-the-fold content */
body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background: #F4F6F8;
}

.hero-section {
  min-height: 400px;
  background: #0f172a;
}

.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Step 2.2: Update Layout.tsx to Use External Critical CSS
Edit `/src/app/layout.tsx`:

1. Replace the large inline `<style>` tag (lines 72-87) with a link to the critical CSS:
   ```tsx
   <link rel="stylesheet" href="/critical.css" />
   ```

2. Move non-critical styles to `globals.css` or component-specific CSS modules

### Step 2.3: Ensure Critical CSS is Optimized
**Think hard** about CSS delivery:
1. Keep critical CSS under 14KB
2. Include only above-the-fold styles
3. Defer non-critical CSS loading
4. Verify no flash of unstyled content (FOUC)

## Validation After Each Phase

### Performance Metrics to Check
After completing each phase, run these checks:

1. **Local Testing**:
   ```bash
   npm run dev
   # Open Chrome DevTools > Lighthouse
   # Run Performance audit
   ```

2. **Build Verification**:
   ```bash
   npm run build
   npm run build:analyze  # Check bundle sizes
   ```

3. **Key Metrics to Monitor**:
   - Largest Contentful Paint (LCP) < 2.5s
   - Total Blocking Time (TBT) < 200ms
   - Cumulative Layout Shift (CLS) < 0.1
   - First Contentful Paint (FCP) < 1.8s

### Rollback Plan
If any phase causes issues:
1. Use git to revert changes: `git checkout -- <file>`
2. Re-test previous working state
3. Document the issue for analysis
4. Try alternative approach from the comprehensive plan

## Important Reminders

1. **Preserve Functionality**: All existing features must continue working
2. **Test Thoroughly**: Each phase should be tested before proceeding
3. **Think Hard**: Consider all edge cases and dependencies
4. **Use Sub-Agents**: Leverage specialized agents for optimal implementations
5. **Document Issues**: Note any unexpected behaviors or challenges

## Success Criteria
- PageSpeed score improves by at least 10-15 points after Phase 1
- Additional 5-10 points after Phase 2  
- Total improvement brings score from ~50 to 65+ (phases 1-2 alone)
- No regression in functionality or visual appearance
- Site remains fully responsive and accessible

## Next Steps
After successfully completing these two phases:
1. Measure performance improvement
2. Document actual vs expected gains
3. Proceed with remaining phases from the comprehensive plan if needed
4. Consider implementing advanced optimizations if score < 90

Remember: **Think hard** at each step. The success of this optimization depends on careful, thoughtful implementation that preserves functionality while dramatically improving performance.
# Performance Optimization Implementation Plan

## Executive Summary
This document outlines performance optimizations for the Bitcoin Benefit application, organized by priority. Each item includes specific implementation details, file paths, and code snippets to facilitate rapid implementation by the development team.

**Current Performance Baseline:**
- Lighthouse Score: 84 (but with noticeable slowness)
- Primary Issue: Chart rendering and data processing bottlenecks
- Bundle Size: ~450KB (needs reduction)

---

## 🔴 CRITICAL OPTIMIZATIONS (Immediate Impact)

### 1. ✅ Chart Rendering Bottlenecks
**Status:** ✅ Completed by Performance Engineer
**Impact:** 40% faster chart rendering, 52% faster LCP

**What was done:**
- Created optimized components with React.memo and useMemo
- Implemented virtual scrolling for large datasets
- Added shallow comparison selectors for state management

**Files Modified:**
- Created: `/src/components/HistoricalTimelineVisualizationOptimized.tsx`
- Created: `/src/components/VirtualizedAnnualBreakdownOptimized.tsx`
- Created: `/src/hooks/useOptimizedStores.ts`
- Updated: `/src/app/historical/page.tsx` (now imports optimized version)
- Updated: `/src/components/VestingTimelineChartRecharts.tsx` (uses optimized breakdown)

---


### 2. ✅ Implement Parallel Data Loading
**Status:** ✅ Completed
**Impact:** ~500ms faster initial data load
**Effort:** Medium (4-6 hours)

**Problem:**
Data loading happens sequentially: static data → Bitcoin price → historical data

**Solution:**
```typescript
// /src/hooks/useParallelDataLoader.ts
export function useParallelDataLoader() {
  useEffect(() => {
    const loadAllData = async () => {
      // Load all data in parallel
      const [staticData, bitcoinPrice, historicalData] = await Promise.all([
        loadStaticData(),
        OptimizedBitcoinAPI.getCurrentPrice(),
        HistoricalBitcoinAPI.getYearlyPrices(startYear, currentYear)
      ]);
      
      // Update stores with results
      setStaticData(staticData);
      setBitcoinPrice(bitcoinPrice.price, bitcoinPrice.change24h);
      setHistoricalPrices(historicalData);
    };
    
    loadAllData();
  }, []);
}
```

**Files to Update:**
- `/src/app/calculator/[plan]/CalculatorPlanClient.tsx` (lines 85-95)
- `/src/app/historical/page.tsx` (lines 95-105)
- `/src/stores/calculatorStore.ts` (loadStaticData method)
- `/src/stores/historicalCalculatorStore.ts` (fetchHistoricalData method)

---

## 🟡 IMPORTANT OPTIMIZATIONS (Significant Impact)

### 3. ⬜ Implement Service Worker for Offline Support
**Priority:** Important
**Estimated Impact:** Instant load for returning users, offline capability
**Effort:** Medium (6-8 hours)

**Implementation:**

1. **Create service worker:**
```javascript
// /public/sw.js
const CACHE_NAME = 'bitcoin-benefit-v1';
const urlsToCache = [
  '/',
  '/calculator/accelerator',
  '/historical',
  '/data/bitcoin-price.json',
  '/data/historical-bitcoin.json',
  '/data/static-calculations.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // Stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            if (networkResponse.ok) {
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, networkResponse.clone()));
            }
            return networkResponse;
          });
        return response || fetchPromise;
      })
  );
});
```

2. **Register in layout:**
```typescript
// /src/app/layout.tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
}, []);
```

3. **Add PWA manifest:**
```json
// /public/manifest.json
{
  "name": "Bitcoin Benefit Calculator",
  "short_name": "BTC Benefit",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F172A",
  "theme_color": "#F7931A",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

---

### 4. ⬜ Optimize Store Updates with Selectors
**Priority:** Important
**Estimated Impact:** 30% fewer re-renders
**Effort:** Medium (4-5 hours)

**Problem:**
Components re-render when any part of store updates, even if they don't use that data.

**Solution:**
Implement granular selectors for all store consumers.

**Files to Update:**

1. **Create selector utilities:**
```typescript
// /src/stores/selectors.ts
import { shallow } from 'zustand/shallow';

// Calculator selectors
export const selectCalculatorInputs = (state) => ({
  selectedScheme: state.selectedScheme,
  inputs: state.inputs,
});

export const selectCalculatorResults = (state) => ({
  results: state.results,
  isCalculating: state.isCalculating,
});

export const selectBitcoinPrice = (state) => ({
  currentBitcoinPrice: state.currentBitcoinPrice,
  bitcoinChange24h: state.bitcoinChange24h,
  isLoadingPrice: state.isLoadingPrice,
});

// Historical selectors
export const selectHistoricalInputs = (state) => ({
  selectedScheme: state.selectedScheme,
  startingYear: state.startingYear,
  costBasisMethod: state.costBasisMethod,
});

export const selectHistoricalResults = (state) => ({
  historicalResults: state.historicalResults,
  isCalculating: state.isCalculating,
  calculationError: state.calculationError,
});
```

2. **Update component usage:**
```typescript
// Before (causes unnecessary re-renders)
const store = useCalculatorStore();

// After (only re-renders when specific data changes)
const { selectedScheme, inputs } = useCalculatorStore(selectCalculatorInputs, shallow);
const { results, isCalculating } = useCalculatorStore(selectCalculatorResults, shallow);
```

**Components to Update:**
- `/src/app/calculator/[plan]/CalculatorPlanClient.tsx`
- `/src/app/historical/page.tsx`
- All components using store data

---

### 5. ⬜ Implement Code Splitting for Routes
**Priority:** Important
**Estimated Impact:** 40% smaller initial bundle
**Effort:** Low (2-3 hours)

**Implementation:**

1. **Update page components to use dynamic imports:**
```typescript
// /src/app/calculator/[plan]/page.tsx
import dynamic from 'next/dynamic';

const CalculatorPlanClient = dynamic(
  () => import('./CalculatorPlanClient'),
  { 
    ssr: false,
    loading: () => <CalculatorSkeleton />
  }
);
```

2. **Split heavy components:**
```typescript
// /src/components/charts/index.ts
export const VestingChart = dynamic(() => import('./VestingChart'));
export const HistoricalChart = dynamic(() => import('./HistoricalChart'));
export const TimelineChart = dynamic(() => import('./TimelineChart'));
```

**Files to Update:**
- All page.tsx files in `/src/app/`
- Heavy component imports in client components

---

### 6. ⬜ Optimize Image and Icon Loading
**Priority:** Important
**Estimated Impact:** 20KB reduction, better CLS
**Effort:** Low (2-3 hours)

**Solution:**

1. **Create icon sprite:**
```typescript
// /src/components/icons/IconSprite.tsx
export const IconSprite = () => (
  <svg style={{ display: 'none' }}>
    <symbol id="bitcoin" viewBox="0 0 24 24">
      {/* Bitcoin icon path */}
    </symbol>
    <symbol id="satoshi" viewBox="0 0 24 24">
      {/* Satoshi icon path */}
    </symbol>
  </svg>
);

// Usage
<svg className="w-6 h-6">
  <use href="#bitcoin" />
</svg>
```

2. **Preload critical icons:**
```html
<!-- In layout.tsx head -->
<link rel="preload" as="image" href="/icons/sprite.svg" />
```

**Files to Update:**
- All files in `/src/components/icons/`
- Components using icons

---

## 🟢 NON-ESSENTIAL OPTIMIZATIONS (Nice to Have)

### 7. ⬜ Implement Request Coalescing for Bitcoin Price
**Priority:** Non-Essential
**Estimated Impact:** Reduce API calls by 60%
**Effort:** Low (2-3 hours)

**Implementation:**
```typescript
// /src/lib/bitcoin-api-coalesced.ts
class CoalescedBitcoinAPI {
  private static pendingRequest: Promise<any> | null = null;
  private static subscribers: Set<(data: any) => void> = new Set();
  
  static async getCurrentPrice() {
    if (this.pendingRequest) {
      return this.pendingRequest;
    }
    
    this.pendingRequest = OptimizedBitcoinAPI.getCurrentPrice()
      .finally(() => {
        this.pendingRequest = null;
      });
    
    return this.pendingRequest;
  }
}
```

---

### 8. ⬜ Add WebSocket for Real-time Price Updates
**Priority:** Non-Essential
**Estimated Impact:** Real-time price updates, better UX
**Effort:** Medium (4-6 hours)

**Implementation:**
```typescript
// /src/hooks/useBitcoinWebSocket.ts
export function useBitcoinWebSocket() {
  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setBitcoinPrice(parseFloat(data.c), parseFloat(data.P));
    };
    
    return () => ws.close();
  }, []);
}
```

---

### 9. ⬜ Implement Progressive Enhancement
**Priority:** Non-Essential
**Estimated Impact:** Better experience on slow connections
**Effort:** Medium (4-5 hours)

**Approach:**
1. Render basic HTML/CSS first
2. Enhance with JavaScript when loaded
3. Add interactions progressively

```typescript
// /src/components/ProgressiveChart.tsx
export function ProgressiveChart({ data }) {
  const [enhanced, setEnhanced] = useState(false);
  
  useEffect(() => {
    setEnhanced(true);
  }, []);
  
  if (!enhanced) {
    // Return basic HTML table
    return <BasicTable data={data} />;
  }
  
  // Return interactive chart
  return <InteractiveChart data={data} />;
}
```

---

### 10. ⬜ Add Performance Monitoring
**Priority:** Non-Essential
**Estimated Impact:** Visibility into real-world performance
**Effort:** Low (2 hours)

**Implementation:**
```typescript
// /src/lib/performance-monitor.ts
export function reportWebVitals(metric: any) {
  // Send to analytics
  if (metric.label === 'web-vital') {
    console.log(metric);
    // Send to your analytics endpoint
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify(metric)
    });
  }
}

// In _app.tsx
export { reportWebVitals } from '@/lib/performance-monitor';
```

---

### 11. ⬜ Optimize Font Loading
**Priority:** Non-Essential
**Estimated Impact:** 100ms faster text rendering
**Effort:** Low (1 hour)

**Implementation:**
```css
/* /src/app/globals.css */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap; /* Use swap instead of block */
  font-weight: 400;
}

/* Preload in layout.tsx */
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
```

---

## 📊 Performance Testing Checklist

After implementing each optimization:

- [ ] Run Lighthouse audit (target: 95+ on all metrics)
- [ ] Test on slow 3G connection
- [ ] Verify no console errors
- [ ] Check bundle size with `npm run build:analyze`
- [ ] Test all interactive features
- [ ] Verify mobile responsiveness
- [ ] Check memory usage in DevTools

## 🛠️ Development Resources

### Testing Tools
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools Lighthouse](chrome://lighthouse)
- [Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

### Documentation
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [React Performance](https://react.dev/learn/render-and-commit)

### Monitoring Services
- [Vercel Analytics](https://vercel.com/analytics)
- [Sentry Performance](https://sentry.io/for/performance/)
- [DataDog RUM](https://www.datadoghq.com/dg/real-user-monitoring/)

## 📝 Notes

- Always test on real devices, not just DevTools emulation (Use MCP server tools to execute commands directly in terminal, open browser to check changes, and for other needs)
- Keep accessibility in mind during optimizations
- Document any breaking changes in the changelog
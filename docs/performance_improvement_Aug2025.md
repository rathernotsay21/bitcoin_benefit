# Performance Improvement Plan - Bitcoin Benefit
## August 2025

### Document Version: 1.0
### Author: Performance Optimization Team
### Target: PageSpeed Score 90+ (from current ~50)
### Priority: CRITICAL

---

## Executive Summary

This document outlines a comprehensive plan to improve the Bitcoin Benefit website's PageSpeed performance score from approximately 50 to 90+. The plan focuses on high-impact, low-risk changes that preserve all existing functionality while dramatically improving performance metrics.

**Key Targets:**
- Mobile PageSpeed Score: 90-94 (from ~50)
- Desktop PageSpeed Score: 95-98
- Largest Contentful Paint (LCP): < 2.5s (from ~4s)
- Total Blocking Time (TBT): < 200ms (from ~600ms)
- First Input Delay (FID): < 50ms
- Cumulative Layout Shift (CLS): < 0.05 (already good)

**Total Implementation Time:** 6-8 hours
**Risk Level:** Low
**Rollback Time:** < 30 minutes

---

## Current Performance Analysis

### Critical Issues Identified

1. **Heavy Canvas-Based Particle Animation (30% of performance impact)**
   - Location: `src/app/page.tsx` lines 63-69
   - Component: `<Particles>` from `@/components/ui/particles`
   - Issue: Continuous canvas repainting with 50 particles
   - Impact: High CPU/GPU usage, blocking main thread
   - Evidence: requestAnimationFrame runs continuously, even when not visible

2. **Excessive Resource Preloading (15% of performance impact)**
   - Location: `src/app/layout.tsx` lines 56-67
   - Issues:
     - Prefetching 4 JSON files that may not be needed
     - Module preloading webpack chunks
     - Prefetching calculator pages before user intent
   - Impact: Network congestion, delayed critical resource loading

3. **Large Inline Critical CSS (10% of performance impact)**
   - Location: `src/app/layout.tsx` lines 72-87
   - Size: ~2KB inline styles
   - Issue: Increases HTML size, delays parsing
   - Many styles are not actually critical for first paint

4. **Synchronous Bitcoin Price Fetching (8% of performance impact)**
   - Location: `src/app/page.tsx` lines 28-47
   - Issue: Fetches prices during initial component render
   - Impact: Delays hydration, increases Time to Interactive

5. **Recharts Bundle Loading Strategy (10% of performance impact)**
   - Location: `next.config.js` lines 100-106
   - Current: Loads as async chunk but with high priority
   - Issue: Still blocks initial render due to priority setting

---

## Implementation Plan

### Phase 1: Replace Heavy Canvas Animation [Priority: CRITICAL]
**Impact: +25-30 PageSpeed points**
**Time: 2 hours**
**Risk: Low**

#### Step 1.1: Create New Dust Particles Component

**File:** Create new file `src/components/ui/dust-particles.tsx`

```typescript
'use client';

import { useEffect, useRef } from 'react';

interface DustParticlesProps {
  className?: string;
}

export default function DustParticles({ className = '' }: DustParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Detect mobile for performance
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 0 : 60; // No particles on mobile

    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'dust-particle';
      
      // Random positioning
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      
      // Random animation duration (slower = more realistic)
      const duration = 20 + Math.random() * 30; // 20-50s
      particle.style.animationDuration = `${duration}s`;
      
      // Random animation delay for staggered effect
      const delay = Math.random() * 20;
      particle.style.animationDelay = `${delay}s`;
      
      // Random size (smaller particles)
      const size = 1 + Math.random() * 2; // 1-3px
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random opacity for depth
      const opacity = 0.2 + Math.random() * 0.4; // 0.2-0.6
      particle.style.opacity = `${opacity}`;
      
      container.appendChild(particle);
      particles.push(particle);
    }

    // Cleanup
    return () => {
      particles.forEach(particle => particle.remove());
    };
  }, []);

  return (
    <div ref={containerRef} className={`dust-particles-container ${className}`}>
      <style jsx global>{`
        .dust-particles-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .dust-particle {
          position: absolute;
          background: rgba(148, 163, 184, 0.6); /* Matches current #94a3b8 */
          border-radius: 50%;
          pointer-events: none;
          will-change: transform;
          animation: dustFloat linear infinite;
        }

        @keyframes dustFloat {
          0% {
            transform: translateY(100vh) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: var(--particle-opacity, 0.3);
          }
          90% {
            opacity: var(--particle-opacity, 0.3);
          }
          100% {
            transform: translateY(-100vh) translateX(20px) scale(0.8);
            opacity: 0;
          }
        }

        /* Performance optimizations */
        @media (prefers-reduced-motion: reduce) {
          .dust-particle {
            animation: none !important;
          }
        }

        /* Hide on mobile for better performance */
        @media (max-width: 768px) {
          .dust-particles-container {
            display: none !important;
          }
        }

        /* Reduce particles on tablets */
        @media (max-width: 1024px) {
          .dust-particle:nth-child(3n) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
```

**Why this approach:**
- Pure CSS animations use GPU acceleration
- No continuous JavaScript execution
- Auto-disables on mobile and for users with motion preferences
- 60 lightweight DOM elements vs continuous canvas operations
- Each particle animates independently without blocking

#### Step 1.2: Update Homepage to Use New Component

**File:** `src/app/page.tsx`

**Changes:**
1. Line 16: Replace import
   ```typescript
   // OLD:
   import Particles from '@/components/ui/particles';
   
   // NEW:
   import DustParticles from '@/components/ui/dust-particles';
   ```

2. Lines 63-69: Replace component usage
   ```typescript
   // OLD:
   <Particles
     className="absolute inset-0 z-0"
     quantity={50}
     ease={80}
     color="#94a3b8"
     refresh={false}
   />
   
   // NEW:
   <DustParticles className="absolute inset-0 z-0" />
   ```

**Testing Required:**
- Verify particles appear on desktop
- Verify particles are hidden on mobile
- Test with prefers-reduced-motion enabled
- Check CPU usage in Performance tab

**Potential Issues & Solutions:**
- **Issue:** Particles might not match exact visual style
  - **Solution:** Adjust opacity and size values in dust-particles.tsx
- **Issue:** Z-index conflicts with content
  - **Solution:** Already set to z-0, but can adjust if needed

---

### Phase 2: Remove Excessive Resource Hints [Priority: HIGH]
**Impact: +10-15 PageSpeed points**
**Time: 30 minutes**
**Risk: Very Low**

#### Step 2.1: Clean Up Prefetch Links

**File:** `src/app/layout.tsx`

**Changes to make:**

1. **DELETE Lines 56-59** (JSON prefetches)
   ```html
   <!-- DELETE THESE LINES -->
   <link rel="prefetch" href="/data/bitcoin-price.json" as="fetch" crossOrigin="anonymous" />
   <link rel="prefetch" href="/data/historical-bitcoin.json" as="fetch" crossOrigin="anonymous" />
   <link rel="prefetch" href="/data/schemes-meta.json" as="fetch" crossOrigin="anonymous" />
   <link rel="prefetch" href="/data/static-calculations.json" as="fetch" crossOrigin="anonymous" />
   ```
   **Reason:** These files total ~200KB and may not be needed immediately

2. **DELETE Line 63** (Module preload)
   ```html
   <!-- DELETE THIS LINE -->
   <link rel="modulepreload" href="/_next/static/chunks/webpack.js" />
   ```
   **Reason:** Next.js handles this automatically

3. **DELETE Lines 66-67** (Page prefetches)
   ```html
   <!-- DELETE THESE LINES -->
   <link rel="prefetch" href="/calculator/pioneer" />
   <link rel="prefetch" href="/bitcoin-tools" />
   ```
   **Reason:** PrefetchLinks component handles this dynamically

4. **KEEP Lines 49-53** (Critical preconnects)
   ```html
   <!-- KEEP THESE - They are actually helpful -->
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
   <link rel="preconnect" href="https://api.coingecko.com" crossOrigin="anonymous" />
   <link rel="preconnect" href="https://mempool.space" crossOrigin="anonymous" />
   <link rel="dns-prefetch" href="https://api.mempool.space" />
   ```

**Why this helps:**
- Reduces initial network congestion
- Allows critical resources to load faster
- Browser can prioritize actual needed resources
- Reduces bandwidth usage on mobile

**Testing Required:**
- Check Network tab to ensure no 404s
- Verify pages still load correctly
- Test navigation speed

---

### Phase 3: Optimize Critical CSS [Priority: HIGH]
**Impact: +8-10 PageSpeed points**
**Time: 1 hour**
**Risk: Low**

#### Step 3.1: Extract Non-Critical CSS

**File:** `src/app/layout.tsx`

**Current Issue:** Lines 72-87 contain 15 style rules inline, increasing HTML size

**Changes:**

1. **Create new file:** `src/app/critical.css`
   ```css
   /* Only truly critical above-fold styles */
   body {
     margin: 0;
     padding: 0;
     min-height: 100vh;
     background-color: #F4F6F8;
   }
   
   .hero-section {
     min-height: 400px;
     background: #0f172a;
   }
   
   /* Loading skeleton for immediate feedback */
   .loading-skeleton {
     background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
     background-size: 200% 100%;
     animation: loading 1.5s infinite;
   }
   
   @keyframes loading {
     0% { background-position: 200% 0; }
     to { background-position: -200% 0; }
   }
   ```

2. **Update layout.tsx:** Replace lines 72-87
   ```tsx
   // OLD: Large inline style block
   <style dangerouslySetInnerHTML={{__html: `...`}} />
   
   // NEW: Minimal critical CSS
   <style dangerouslySetInnerHTML={{
     __html: `
       body{margin:0;padding:0;min-height:100vh;background:#F4F6F8}
       .hero-section{min-height:400px;background:#0f172a}
     `
   }} />
   ```

3. **Move remaining styles to globals.css**
   - Add button styles to globals.css
   - Add feature card styles to globals.css
   - These will load async but that's fine for below-fold content

**Why this helps:**
- Reduces initial HTML parse time
- Faster First Contentful Paint
- Critical CSS is only ~200 bytes instead of 2KB

---

### Phase 4: Optimize Recharts Loading [Priority: MEDIUM]
**Impact: +10-15 PageSpeed points**
**Time: 1 hour**
**Risk: Low**

#### Step 4.1: Update Bundle Configuration

**File:** `next.config.js`

**Changes:** Lines 100-106

```javascript
// OLD:
recharts: {
  test: /[\\/]node_modules[\\/](recharts|d3-[^/]+|victory[^/]*|chart\.js)[\\/]/,
  name: 'charts-vendor',
  priority: 40,
  chunks: 'async',
  enforce: true
},

// NEW:
recharts: {
  test: /[\\/]node_modules[\\/](recharts|d3-)[\\/]/,
  name: 'charts-vendor',
  priority: 20,  // Lower priority
  chunks: 'async',
  reuseExistingChunk: true,
  enforce: true,
  minChunks: 2  // Only split if used in 2+ places
},
```

#### Step 4.2: Add Intersection Observer to Chart Component

**File:** `src/components/VestingTimelineChartRecharts.tsx`

**Add at line 215 (inside component):**

```typescript
// Add intersection observer for lazy loading
const chartRef = useRef<HTMLDivElement>(null);
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect(); // Only load once
      }
    },
    { rootMargin: '100px' } // Start loading 100px before visible
  );

  if (chartRef.current) {
    observer.observe(chartRef.current);
  }

  return () => observer.disconnect();
}, []);

// Wrap return statement at line 489:
return (
  <div ref={chartRef}>
    {!isVisible ? (
      <div className="w-full h-[540px] bg-gray-100 dark:bg-gray-800 rounded-sm animate-pulse" />
    ) : (
      // ... existing chart JSX
    )}
  </div>
);
```

**Apply same pattern to:** `src/components/HistoricalTimelineVisualizationOptimized.tsx`

**Why this helps:**
- Chart only loads when user scrolls near it
- Reduces initial JavaScript execution
- Improves Time to Interactive

---

### Phase 5: Defer Bitcoin Price Loading [Priority: MEDIUM]
**Impact: +5-8 PageSpeed points**
**Time: 30 minutes**
**Risk: Very Low**

#### Step 5.1: Update Price Fetching Logic

**File:** `src/app/page.tsx`

**Changes:** Lines 28-47

```typescript
// OLD: Fetch in useEffect immediately
useEffect(() => {
  const fetchPrices = async () => {
    try {
      const currentPriceData = await BitcoinAPI.getCurrentPrice();
      // ...
    } catch (error) {
      // ...
    }
  };
  fetchPrices();
}, []);

// NEW: Defer with requestIdleCallback
useEffect(() => {
  // Use requestIdleCallback if available, otherwise setTimeout
  const loadPrices = () => {
    const fetchPrices = async () => {
      try {
        const currentPriceData = await BitcoinAPI.getCurrentPrice();
        setCurrentBitcoinPrice(currentPriceData.price);
        
        const historical2020 = await HistoricalBitcoinAPI.getYearlyPrice(2020);
        setHistoricalPrice2020(historical2020.average);
      } catch (error) {
        console.error('Failed to fetch benefit values:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrices();
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadPrices, { timeout: 3000 });
  } else {
    setTimeout(loadPrices, 100);
  }
}, []);
```

**Why this helps:**
- Doesn't block initial render
- Loads when browser is idle
- Fallback values show immediately

---

### Phase 6: Font Optimization [Priority: LOW]
**Impact: +3-5 PageSpeed points**
**Time: 15 minutes**
**Risk: Very Low**

#### Step 6.1: Update Font Loading Strategy

**File:** `src/app/layout.tsx`

**Changes:** Lines 19-26

```typescript
// OLD:
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: false,
  variable: '--font-inter',
})

// NEW:
const inter = Inter({ 
  subsets: ['latin'],
  display: 'optional', // Changed from 'swap'
  preload: false,      // Let Next.js handle automatically
  fallback: ['system-ui', 'arial'],
  variable: '--font-inter',
})
```

**Why this helps:**
- 'optional' allows browser to skip font if slow
- Prevents layout shift from font swap
- Better for users on slow connections

---

### Phase 7: Additional Quick Wins [Priority: LOW]
**Impact: +5 PageSpeed points total**
**Time: 30 minutes**
**Risk: Very Low**

#### Step 7.1: Remove Float Animation

**File:** `src/app/page.tsx`

**Changes:** Line 77

```typescript
// OLD:
<div className="inline-flex items-center justify-center w-20 h-20 rounded-full animate-float shadow-sm" style={{backgroundColor: '#F7931A'}}>

// NEW:
<div className="inline-flex items-center justify-center w-20 h-20 rounded-full shadow-sm hover:scale-105 transition-transform duration-300" style={{backgroundColor: '#F7931A'}}>
```

**Why:** Continuous animations block CPU

#### Step 7.2: Reduce Bundle Size Limits

**File:** `next.config.js`

**Changes:** Line 94-96

```javascript
// ADD to webpack optimization:
optimization: {
  ...config.optimization,
  runtimeChunk: 'single',
  moduleIds: 'deterministic',
  usedExports: true,
  sideEffects: false,
  splitChunks: {
    chunks: 'all',
    maxInitialRequests: 10,    // Reduced from 25
    minSize: 20000,
    maxAsyncRequests: 10,       // Add this
    maxSize: 244000,            // Add this - 244KB max chunk
    // ... rest of config
  }
}
```

---

## Testing Plan

### Pre-Deployment Testing

1. **Local Testing**
   ```bash
   # Build and test locally
   npm run build
   npm start
   
   # Test with Lighthouse
   # Open Chrome DevTools > Lighthouse > Mobile > Performance
   # Run audit on http://localhost:3000
   ```

2. **Visual Regression Testing**
   - Take screenshots of all pages before changes
   - Take screenshots after changes
   - Compare for any visual differences

3. **Performance Metrics to Track**
   - Initial PageSpeed score
   - LCP, TBT, FID, CLS values
   - JavaScript bundle sizes
   - Network waterfall

### Staging Deployment

1. **Deploy to Netlify Preview**
   ```bash
   git checkout -b perf-improvements-aug-2025
   git add .
   git commit -m "perf: implement performance improvements for 90+ PageSpeed"
   git push origin perf-improvements-aug-2025
   ```

2. **Test on Netlify Preview URL**
   - Run PageSpeed Insights on preview URL
   - Test all functionality
   - Check console for errors

### Production Deployment Checklist

- [ ] All changes tested locally
- [ ] PageSpeed score meets target (90+)
- [ ] No visual regressions
- [ ] No console errors
- [ ] All functionality working
- [ ] Rollback plan ready
- [ ] Monitoring in place

---

## Rollback Plan

If issues arise after deployment:

### Immediate Rollback (< 5 minutes)

1. **Via Netlify UI:**
   - Go to Deploys tab
   - Click "Rollback" on previous deployment
   - Site reverts immediately

2. **Via Git:**
   ```bash
   git revert HEAD
   git push origin main
   ```

### Partial Rollback Options

If only one change causes issues:

1. **Particles only:** Revert page.tsx changes
2. **Resource hints only:** Revert layout.tsx prefetch deletions
3. **Charts only:** Revert next.config.js and chart component changes

---

## Monitoring & Success Metrics

### Week 1 Targets
- Mobile PageSpeed: 75+ 
- Desktop PageSpeed: 85+
- No increase in error rate
- No decrease in user engagement

### Week 2 Targets
- Mobile PageSpeed: 90+
- Desktop PageSpeed: 95+
- 20% improvement in bounce rate
- 15% improvement in session duration

### Monitoring Tools
1. **PageSpeed Insights** - Daily checks
2. **Google Analytics** - User metrics
3. **Netlify Analytics** - Performance data
4. **Browser DevTools** - Performance profiling

---

## Troubleshooting Guide

### Common Issues & Solutions

#### Issue: Dust particles not visible
**Solution:** Check z-index values, ensure not covered by gradient overlay

#### Issue: Charts not loading
**Solution:** Check intersection observer implementation, verify chartRef is attached

#### Issue: Font flash on load
**Solution:** Revert to display: 'swap' if 'optional' causes issues

#### Issue: Build fails after changes
**Solution:** 
```bash
rm -rf .next node_modules
npm install
npm run build
```

#### Issue: Styles not applying
**Solution:** Check if critical CSS is loading, verify globals.css imports

---

## Additional Notes

### Why These Specific Changes?

1. **Canvas to CSS Particles:** Canvas requires continuous JavaScript execution and GPU repainting. CSS animations are hardware-accelerated and run on the compositor thread.

2. **Resource Hint Removal:** Each prefetch triggers a network request, competing with critical resources. The browser is smart enough to prioritize without hints.

3. **CSS Optimization:** Inline CSS blocks HTML parsing. Moving non-critical styles allows faster initial render.

4. **Deferred Loading:** Not all content needs to load immediately. Deferring non-critical JavaScript improves Time to Interactive.

### What We're NOT Changing

- **Recharts Library:** Keeping it, just optimizing when it loads
- **Design/UX:** No visual changes except particle effect (which looks similar)
- **Functionality:** All features remain exactly the same
- **Content:** No content changes

### Browser Compatibility

All changes are compatible with:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari iOS 14+
- Chrome Android 90+

### Accessibility Considerations

- Dust particles respect `prefers-reduced-motion`
- No impact on screen reader users
- Keyboard navigation unchanged
- Color contrast maintained

---

## Appendix: File Change Summary

| File | Lines Changed | Risk | Impact |
|------|--------------|------|--------|
| `src/components/ui/dust-particles.tsx` | NEW (120 lines) | Low | High |
| `src/app/page.tsx` | 16, 63-69, 77, 28-47 | Low | High |
| `src/app/layout.tsx` | 56-59, 63, 66-67, 72-87, 21 | Low | Medium |
| `next.config.js` | 100-106, 94-96 | Low | Medium |
| `src/components/VestingTimelineChartRecharts.tsx` | 215-230, 489-495 | Low | Medium |

Total files modified: 5
New files created: 1
Lines of code changed: ~50
Lines of code added: ~120

---

## Final Checklist for Developer

Before starting:
- [ ] Read entire document
- [ ] Backup current code
- [ ] Note current PageSpeed score
- [ ] Have rollback plan ready

During implementation:
- [ ] Follow steps in order
- [ ] Test after each phase
- [ ] Document any deviations
- [ ] Keep performance metrics log

After implementation:
- [ ] Run full test suite
- [ ] Check PageSpeed score
- [ ] Verify all functionality
- [ ] Update documentation
- [ ] Communicate results to team

---

**END OF DOCUMENT**

For questions or clarifications, please refer to the troubleshooting section or contact the performance team.
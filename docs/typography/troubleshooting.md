# Typography Troubleshooting Guide
## Bitcoin Benefit Platform

*Solutions for common typography system issues and debugging techniques*

---

## Table of Contents

1. [Common Issues](#common-issues)
2. [CSS Custom Properties Problems](#css-custom-properties-problems)
3. [Component Integration Issues](#component-integration-issues)
4. [Build and Performance Issues](#build-and-performance-issues)
5. [Browser Compatibility Problems](#browser-compatibility-problems)
6. [Accessibility Concerns](#accessibility-concerns)
7. [Debugging Tools](#debugging-tools)
8. [Performance Diagnostics](#performance-diagnostics)

---

## Common Issues

### Typography Not Loading

**Symptoms:**
- Default browser fonts showing instead of system fonts
- CSS custom properties returning `undefined`
- Typography classes not applying styles

**Solutions:**

1. **Check CSS Import Order**
   ```css
   /* Make sure typography.css is imported early */
   @import 'typography.css'; /* This should come first */
   @import 'components.css';
   @import 'utilities.css';
   ```

2. **Verify CSS Custom Properties**
   ```tsx
   // Check in browser dev tools console
   const rootStyles = getComputedStyle(document.documentElement);
   console.log(rootStyles.getPropertyValue('--font-size-base'));
   // Should return: clamp(1rem, 0.9375rem + 0.3125vw, 1.125rem)
   ```

3. **Ensure Theme Class Applied**
   ```tsx
   // Make sure theme class is on root element
   <html className={theme === 'dark' ? 'dark' : ''}>
     {/* or */}
   <div className={`app ${theme === 'dark' ? 'dark' : ''}`}>
   ```

### Inconsistent Font Sizes

**Symptoms:**
- Text appears different sizes than expected
- Responsive scaling not working
- Font sizes jumping at breakpoints

**Solutions:**

1. **Verify Base Font Size**
   ```css
   /* Check that html font-size is 16px */
   html {
     font-size: 16px; /* This is crucial for rem calculations */
   }
   ```

2. **Check for CSS Cascade Conflicts**
   ```css
   /* Bad: Overriding system values */
   .my-component {
     font-size: 14px !important; /* Avoid !important */
   }
   
   /* Good: Using system tokens */
   .my-component {
     font-size: var(--font-size-body);
   }
   ```

3. **Validate Clamp Function Support**
   ```javascript
   // Check browser support
   const supportsClamp = CSS.supports('font-size', 'clamp(1rem, 2vw, 2rem)');
   if (!supportsClamp) {
     console.warn('Browser does not support CSS clamp()');
   }
   ```

### Colors Not Adapting to Theme

**Symptoms:**
- Text colors remain the same across light/dark themes
- High contrast mode not working
- Brand colors not displaying correctly

**Solutions:**

1. **Check Theme Class Inheritance**
   ```tsx
   // Ensure theme class is properly inherited
   <div className="dark"> {/* or theme provider */}
     <p className="text-primary"> {/* Should adapt automatically */}
       This text should change color
     </p>
   </div>
   ```

2. **Verify CSS Custom Property Definitions**
   ```css
   /* Check that dark theme variables are defined */
   .dark {
     --text-primary: hsl(210, 15%, 95%); /* Light text for dark theme */
   }
   ```

3. **Use Semantic Color Tokens**
   ```tsx
   // ✅ Good: Uses semantic tokens
   <span className="text-primary">Primary text</span>
   <span className="text-bitcoin">Bitcoin orange</span>
   
   // ❌ Bad: Hardcoded colors
   <span style={{ color: '#333' }}>Primary text</span>
   <span style={{ color: '#f2a900' }}>Bitcoin orange</span>
   ```

## CSS Custom Properties Problems

### Variables Not Updating

**Problem:** CSS custom properties not reflecting changes

**Debug Steps:**

1. **Inspect Computed Values**
   ```javascript
   // In browser console
   const element = document.querySelector('.text-base');
   const styles = getComputedStyle(element);
   console.log({
     fontSize: styles.fontSize,
     customProperty: styles.getPropertyValue('--font-size-base')
   });
   ```

2. **Check Property Inheritance**
   ```css
   /* Make sure properties are defined at root level */
   :root {
     --font-size-base: clamp(1rem, 0.9375rem + 0.3125vw, 1.125rem);
   }
   
   /* Not just in component scope */
   .component {
     --font-size-base: 1rem; /* This won't affect other components */
   }
   ```

3. **Validate Variable Names**
   ```tsx
   // Check for typos in variable names
   const correctVar = 'var(--font-size-base)';
   const incorrectVar = 'var(--font-size-basic)'; // Typo!
   ```

### Fallback Values Missing

**Problem:** Typography breaks when CSS custom properties aren't supported

**Solution:**

```css
/* Always provide fallbacks */
.text-base {
  font-size: 1rem; /* Fallback */
  font-size: var(--font-size-base, 1rem); /* With custom property */
}

/* For older browsers */
@supports not (font-size: clamp(1rem, 2vw, 2rem)) {
  .text-base {
    font-size: 1rem;
  }
  
  @media (min-width: 768px) {
    .text-base {
      font-size: 1.125rem;
    }
  }
}
```

## Component Integration Issues

### React Components Not Rendering Typography

**Problem:** Typography components showing default styling

**Debug Checklist:**

1. **Check Import Paths**
   ```tsx
   // ✅ Correct import
   import { PageHeading, BodyText } from '@/components/ui/typography';
   
   // ❌ Wrong import path
   import { PageHeading } from '@/components/typography'; // Missing /ui/
   ```

2. **Verify CSS Class Application**
   ```tsx
   // Use React Developer Tools to inspect actual className
   <PageHeading className="debug-heading">
     My Heading
   </PageHeading>
   
   // Should render as:
   // <h1 class="heading-h1 debug-heading">My Heading</h1>
   ```

3. **Check for Styling Conflicts**
   ```css
   /* Look for conflicting styles */
   .debug-heading {
     all: unset; /* This will remove typography styles! */
   }
   ```

### TypeScript Type Errors

**Problem:** TypeScript errors with typography props

**Common Fixes:**

1. **Import Types Correctly**
   ```tsx
   import type { HeadingLevel, FontSizeScale } from '@/types/typography';
   import { PageHeading } from '@/components/ui/typography';
   
   const level: HeadingLevel = 'h1'; // ✅ Correct
   const size: FontSizeScale = 'large'; // ❌ 'large' is not a valid FontSizeScale
   ```

2. **Use Correct Prop Types**
   ```tsx
   // ✅ Correct usage
   <PageHeading level="h1" color="bitcoin">
     Bitcoin Price
   </PageHeading>
   
   // ❌ Incorrect prop types
   <PageHeading size="large" textColor="orange"> // Wrong prop names
     Bitcoin Price
   </PageHeading>
   ```

## Build and Performance Issues

### Large Bundle Size

**Problem:** Typography system adding too much to bundle

**Analysis:**

```bash
# Check bundle composition
npm run build:analyze

# Look for typography-related chunks
# Should see:
# - typography.css (~8KB)
# - typography components (~5KB)
```

**Optimization:**

1. **Use Tree Shaking**
   ```tsx
   // ✅ Import only what you need
   import { PageHeading, BodyText } from '@/components/ui/typography';
   
   // ❌ Don't import everything
   import * as Typography from '@/components/ui/typography';
   ```

2. **Purge Unused CSS**
   ```javascript
   // tailwind.config.js
   module.exports = {
     content: [
       './src/**/*.{js,ts,jsx,tsx}',
     ],
     // This will remove unused typography classes
   };
   ```

### Slow Font Loading

**Problem:** Font loading causing layout shift or performance issues

**Solutions:**

1. **Use Font Display Swap**
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
   
   /* Or with font-face */
   @font-face {
     font-family: 'Inter Variable';
     font-display: swap; /* Prevents invisible text during font load */
     src: url('/fonts/inter-variable.woff2') format('woff2');
   }
   ```

2. **Preload Critical Fonts**
   ```html
   <link rel="preload" href="/fonts/inter-variable.woff2" as="font" type="font/woff2" crossorigin>
   ```

3. **Monitor Loading Performance**
   ```javascript
   // Measure font loading time
   const observer = new PerformanceObserver((list) => {
     for (const entry of list.getEntries()) {
       if (entry.name.includes('font')) {
         console.log(`Font load time: ${entry.duration}ms`);
       }
     }
   });
   observer.observe({ entryTypes: ['navigation', 'resource'] });
   ```

## Browser Compatibility Problems

### CSS Clamp Not Supported

**Problem:** Fluid typography not working in older browsers

**Detection:**

```javascript
function detectClampSupport() {
  const testElement = document.createElement('div');
  testElement.style.fontSize = 'clamp(1rem, 2vw, 2rem)';
  
  const supportsClamp = testElement.style.fontSize.includes('clamp');
  
  if (!supportsClamp) {
    console.warn('CSS clamp() not supported, using fallbacks');
    document.documentElement.classList.add('no-clamp-support');
  }
  
  return supportsClamp;
}
```

**Fallback Strategy:**

```css
/* Default fallback */
.text-base {
  font-size: 1rem;
}

/* Enhanced for modern browsers */
@supports (font-size: clamp(1rem, 2vw, 2rem)) {
  .text-base {
    font-size: var(--font-size-base);
  }
}

/* Manual responsive for older browsers */
.no-clamp-support .text-base {
  font-size: 1rem;
}

@media (min-width: 768px) {
  .no-clamp-support .text-base {
    font-size: 1.125rem;
  }
}
```

### Container Queries Not Supported

**Problem:** Container-based responsive typography failing

**Polyfill Solution:**

```javascript
// Install: npm install @csstools/postcss-container-query-polyfill
// Or use resize observer fallback

function containerQueryFallback() {
  const containers = document.querySelectorAll('.@container');
  
  containers.forEach(container => {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        
        // Apply size classes based on container width
        if (width >= 512) {
          entry.target.classList.add('container-lg');
        } else {
          entry.target.classList.remove('container-lg');
        }
      }
    });
    
    resizeObserver.observe(container);
  });
}
```

## Accessibility Concerns

### Text Too Small for Accessibility

**Problem:** Typography failing WCAG guidelines

**Validation:**

```typescript
import { validateTypographyAccessibility } from '@/lib/typography/utils';

// Check minimum font sizes
const result = validateTypographyAccessibility({
  fontSize: '12px',
  lineHeight: 1.2,
  contrast: 3.8
});

if (!result.meetsWCAG) {
  console.error('Typography accessibility violation:', result.issues);
  console.log('Recommendations:', result.recommendations);
}
```

**Common Fixes:**

1. **Increase Minimum Font Size**
   ```css
   /* Ensure minimum 16px for body text */
   .text-body {
     font-size: max(var(--font-size-body), 1rem);
   }
   ```

2. **Improve Line Height**
   ```css
   /* Body text needs 1.5+ line height */
   .body-text {
     line-height: var(--line-height-relaxed); /* 1.6 */
   }
   ```

3. **Check Color Contrast**
   ```javascript
   // Use browser dev tools or automated tools
   // Lighthouse accessibility audit will catch these
   ```

### Screen Reader Issues

**Problem:** Typography not working well with assistive technologies

**Solutions:**

1. **Use Semantic HTML**
   ```tsx
   // ✅ Good: Proper semantic structure
   <h1 className="text-h1">Main Heading</h1>
   <h2 className="text-h2">Section Heading</h2>
   
   // ❌ Bad: Non-semantic markup
   <div className="text-h1">Main Heading</div>
   <div className="text-h2">Section Heading</div>
   ```

2. **Add Screen Reader Content**
   ```tsx
   import { ScreenReaderOnly, BitcoinAmount } from '@/components/ui/typography';
   
   <BitcoinAmount amount={1.5} />
   <ScreenReaderOnly>Bitcoin</ScreenReaderOnly>
   ```

## Debugging Tools

### Browser Developer Tools

**CSS Custom Property Inspector:**

```javascript
// Console script to debug typography variables
function debugTypographyVariables() {
  const root = document.documentElement;
  const computedStyles = getComputedStyle(root);
  
  const typographyVars = {};
  
  // Get all typography-related CSS variables
  for (const prop of computedStyles) {
    if (prop.startsWith('--font-') || prop.startsWith('--text-')) {
      typographyVars[prop] = computedStyles.getPropertyValue(prop).trim();
    }
  }
  
  console.table(typographyVars);
  return typographyVars;
}

// Run in console
debugTypographyVariables();
```

**Element Typography Analysis:**

```javascript
function analyzeElementTypography(selector) {
  const element = document.querySelector(selector);
  if (!element) return null;
  
  const styles = getComputedStyle(element);
  
  return {
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    lineHeight: styles.lineHeight,
    fontFamily: styles.fontFamily,
    color: styles.color,
    customProperties: {
      fontSizeVar: styles.getPropertyValue('--font-size-base'),
      colorVar: styles.getPropertyValue('--text-primary')
    }
  };
}

// Usage
console.log(analyzeElementTypography('h1'));
```

### Component Debugging

**Typography Component Inspector:**

```tsx
import { useEffect } from 'react';

function TypographyDebugger({ children }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const elements = document.querySelectorAll('[class*="text-"]');
      
      elements.forEach(el => {
        const classes = Array.from(el.classList)
          .filter(cls => cls.startsWith('text-') || cls.startsWith('font-'));
        
        if (classes.length > 0) {
          console.log('Typography element:', {
            element: el.tagName,
            classes,
            computedFontSize: getComputedStyle(el).fontSize
          });
        }
      });
    }
  }, []);
  
  return children;
}

// Wrap your app in development
<TypographyDebugger>
  <App />
</TypographyDebugger>
```

### Validation Utilities

**Typography Validation Hook:**

```tsx
import { useEffect, useState } from 'react';

function useTypographyValidation() {
  const [issues, setIssues] = useState([]);
  
  useEffect(() => {
    const validateElements = () => {
      const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div');
      const foundIssues = [];
      
      textElements.forEach(el => {
        const styles = getComputedStyle(el);
        const fontSize = parseFloat(styles.fontSize);
        
        // Check minimum font size
        if (fontSize < 12) {
          foundIssues.push({
            element: el,
            issue: 'Font size too small',
            value: fontSize,
            recommendation: 'Use minimum 12px font size'
          });
        }
        
        // Check line height
        const lineHeight = parseFloat(styles.lineHeight);
        if (lineHeight < fontSize * 1.2) {
          foundIssues.push({
            element: el,
            issue: 'Line height too tight',
            value: lineHeight / fontSize,
            recommendation: 'Use minimum 1.2 line height ratio'
          });
        }
      });
      
      setIssues(foundIssues);
    };
    
    // Validate on mount and when content changes
    validateElements();
    const observer = new MutationObserver(validateElements);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);
  
  return issues;
}

// Usage in development
function TypographyValidator() {
  const issues = useTypographyValidation();
  
  if (issues.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-red-100 p-4 rounded shadow max-w-sm">
      <h4 className="font-bold text-red-800 mb-2">
        Typography Issues ({issues.length})
      </h4>
      {issues.map((issue, i) => (
        <div key={i} className="text-sm text-red-700 mb-1">
          {issue.issue}: {issue.value} - {issue.recommendation}
        </div>
      ))}
    </div>
  );
}
```

## Performance Diagnostics

### Typography Performance Monitor

```javascript
class TypographyPerformanceMonitor {
  constructor() {
    this.metrics = {
      fontLoadTime: 0,
      renderTime: 0,
      cumulativeLayoutShift: 0
    };
    
    this.startMonitoring();
  }
  
  startMonitoring() {
    // Monitor font loading
    document.fonts.ready.then(() => {
      this.metrics.fontLoadTime = performance.now();
      console.log(`Font loading completed in ${this.metrics.fontLoadTime}ms`);
    });
    
    // Monitor CLS from typography
    this.observeLayoutShift();
    
    // Monitor render performance
    this.observeRenderTiming();
  }
  
  observeLayoutShift() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            this.metrics.cumulativeLayoutShift += entry.value;
          }
        }
        
        if (this.metrics.cumulativeLayoutShift > 0.1) {
          console.warn('High typography CLS detected:', this.metrics.cumulativeLayoutShift);
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }
  
  observeRenderTiming() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'typography-render') {
          this.metrics.renderTime = entry.duration;
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure'] });
  }
  
  getReport() {
    return {
      ...this.metrics,
      recommendations: this.getRecommendations()
    };
  }
  
  getRecommendations() {
    const recommendations = [];
    
    if (this.metrics.fontLoadTime > 1000) {
      recommendations.push('Consider using font-display: swap for faster loading');
    }
    
    if (this.metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push('Reduce layout shift by defining font sizes early');
    }
    
    if (this.metrics.renderTime > 16) {
      recommendations.push('Typography rendering is slow, check for expensive operations');
    }
    
    return recommendations;
  }
}

// Usage
const monitor = new TypographyPerformanceMonitor();

// Get performance report
setTimeout(() => {
  console.log('Typography Performance Report:', monitor.getReport());
}, 5000);
```

### Bundle Analysis

```bash
# Check typography bundle impact
npm run build:analyze

# Look for:
# - typography.css size (~8KB expected)
# - unused CSS classes
# - font file sizes
# - JavaScript bundle impact from components
```

---

## Quick Reference Commands

```bash
# Development debugging
npm run dev
# Open browser console and run:
# debugTypographyVariables()

# Build analysis
npm run build:analyze

# Type checking
npm run type-check

# Accessibility testing
npm run test:a11y

# Performance testing
npm run lighthouse
```

---

*If you encounter issues not covered in this guide, please [open an issue](https://github.com/bitcoin-benefit/issues) with a detailed description and steps to reproduce the problem.*
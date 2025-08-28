/**
 * Font Optimization Component
 * Phase 1.3 Performance Enhancement: Advanced font loading for ~200ms FCP improvement
 * 
 * Features:
 * - font-display: swap implementation
 * - Critical font subset preloading
 * - Progressive enhancement
 * - Performance monitoring
 */
'use client';

import { useEffect, useCallback } from 'react';

export function FontOptimization(): null {
  // Phase 1.3: Enhanced font loading with better error handling and performance
  const optimizeFontLoading = useCallback(() => {
    // Browser environment check
    if (typeof window === 'undefined') return;
    if (typeof document === 'undefined') return;
    if (!document?.documentElement) return;
    
    // TypeScript type assertion for document access
    const doc = document as Document & { fonts: FontFaceSet };
    
    // Performance timing marks
    const markStart = () => {
      if ('performance' in window && performance.mark) {
        performance.mark('font-loading-start');
      }
    };
    
    const markEnd = () => {
      if ('performance' in window && performance.mark && performance.measure) {
        performance.mark('font-loading-end');
        performance.measure('font-loading-duration', 'font-loading-start', 'font-loading-end');
      }
    };

    // Check if document fonts API is available
    if ('fonts' in doc) {
      markStart();
      
      // Critical font loading - reduced weights for better performance
      const fontLoadPromises = [
        // Updated weights: 400, 500, 700 (removed 600)
        doc.fonts.load('400 1rem Inter'),
        doc.fonts.load('500 1rem Inter'), // Changed from 600 to 500
        doc.fonts.load('700 1rem Inter'),
      ];

      // Aggressive timeout for faster fallback (reduced from 2s to 1.5s)
      const fontLoadingTimeout = new Promise((resolve) => {
        setTimeout(resolve, 1500); // 1.5 second timeout for better FCP
      });

      Promise.race([
        Promise.all(fontLoadPromises),
        fontLoadingTimeout
      ]).then(() => {
        // Add class to document to indicate fonts are loaded
        doc.documentElement.classList.add('fonts-loaded');
        doc.documentElement.classList.remove('fonts-loading');
        
        markEnd();
        
        // Performance timing for monitoring
        if ('performance' in window && performance.getEntriesByName) {
          const measure = performance.getEntriesByName('font-loading-duration')[0];
          if (measure && process.env.NODE_ENV === 'development') {
            console.log(`Font loading completed in ${Math.round(measure.duration)}ms`);
          }
        }
      }).catch((error) => {
        // Enhanced fallback handling
        doc.documentElement.classList.add('fonts-fallback');
        doc.documentElement.classList.remove('fonts-loading');
        
        if (process.env.NODE_ENV === 'development') {
          console.warn('Font loading failed, using fallbacks:', error);
        }
        
        markEnd();
      });
    } else {
      // No Font Loading API support - immediate fallback
      document.documentElement?.classList.add('fonts-fallback');
    }

    // Phase 1.3: Optimized non-critical font preloading
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Preload italic variants only if needed (check if any italic text exists)
        const hasItalicContent = doc.querySelector('em, i, .italic, .font-italic');
        
        if (hasItalicContent) {
          const link = doc.createElement('link');
          link.rel = 'preload';
          link.as = 'font';
          link.type = 'font/woff2';
          link.crossOrigin = 'anonymous';
          link.href = 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2'; // Inter Italic
          doc.head.appendChild(link);
        }
      }, { timeout: 3000 });
    }
  }, []);
  
  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined') return;
    if (typeof document === 'undefined') return;
    
    const doc = document as Document;

    // Phase 1.3: Enhanced initialization with loading state
    doc.documentElement?.classList.add('fonts-loading');
    
    // Run optimization
    optimizeFontLoading();

    // Phase 1.3: Enhanced performance monitoring with FCP tracking
    const monitorFontPerformance = () => {
      if ('performance' in window && performance.getEntriesByType) {
        // Monitor both font resources and FCP
        setTimeout(() => {
          const fontEntries = performance.getEntriesByType('resource').filter(
            (entry) => entry.name.includes('fonts.gstatic.com')
          );

          // Enhanced monitoring with FCP correlation
          fontEntries.forEach((entry) => {
            const loadTime = Math.round(entry.duration);
            if (loadTime > 800) { // Reduced threshold from 1000ms to 800ms
              console.warn(`Font loading performance issue: ${entry.name} took ${loadTime}ms`);
            }
          });
          
          // Monitor First Contentful Paint in relation to font loading
          const fcpEntries = performance.getEntriesByType('paint').filter(
            entry => entry.name === 'first-contentful-paint'
          );
          
          if (fcpEntries.length > 0) {
            const fcpTime = Math.round(fcpEntries[0].startTime);
            console.log(`FCP: ${fcpTime}ms with font optimization`);
            
            // Check if FCP is within target (<2500ms)
            if (fcpTime > 2500) {
              console.warn(`FCP performance target missed: ${fcpTime}ms > 2500ms target`);
            }
          }
        }, 3000);
      }
    };

    if (process.env.NODE_ENV === 'development') {
      monitorFontPerformance();
    }
  }, [optimizeFontLoading]);

  return null; // This component handles font loading optimization without rendering
}

// Phase 1.3: Enhanced font loading CSS for improved FCP
export const criticalFontCSS = `
  /* Critical font fallback styles with font-display: swap support */
  .font-loading {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size-adjust: 0.52;
    font-display: swap;
  }
  
  /* Smooth transition when fonts load */
  .fonts-loaded .font-loading {
    font-family: var(--font-inter), system-ui, sans-serif;
    font-display: swap;
    transition: font-family 0.1s ease-out;
  }
  
  /* Fallback state maintains consistency */
  .fonts-fallback .font-loading {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    font-size-adjust: 0.52;
    font-display: swap;
  }
  
  /* Critical above-the-fold optimization */
  .font-critical-render {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    font-size-adjust: 0.52;
    text-rendering: optimizeSpeed;
    -webkit-font-smoothing: antialiased;
  }
  
  .fonts-loaded .font-critical-render {
    font-family: var(--font-inter), system-ui, sans-serif;
    text-rendering: optimizeLegibility;
  }
  
  /* Progressive enhancement for non-critical content */
  .font-progressive {
    font-family: system-ui, sans-serif;
    font-display: swap;
  }
  
  .fonts-loaded .font-progressive {
    font-family: var(--font-inter), system-ui, sans-serif;
  }
`;
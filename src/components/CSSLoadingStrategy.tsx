'use client';

/**
 * CSS Loading Strategy Component - Phase 3.1 Performance Optimization
 * Bitcoin Benefit Platform
 * 
 * Implements advanced CSS loading patterns:
 * 1. Inline critical CSS (already loaded via CriticalCSS component)
 * 2. Preload non-critical CSS
 * 3. Defer non-essential stylesheets
 * 4. Progressive CSS enhancement
 */

import { useEffect, useRef } from 'react';

interface CSSLoadingStrategyProps {
  /** Enable preloading of non-critical CSS */
  enablePreload?: boolean;
  /** Delay before loading non-critical CSS (ms) */
  deferDelay?: number;
  /** Enable progressive CSS loading */
  enableProgressive?: boolean;
}

export function CSSLoadingStrategy({ 
  enablePreload = true,
  deferDelay = 100,
  enableProgressive = true
}: CSSLoadingStrategyProps): null {
  const loadedRef = useRef(new Set<string>());

  useEffect(() => {
    // Wait for critical rendering to complete
    const timer = setTimeout(() => {
      // Mark that critical CSS phase is complete
      document.documentElement.setAttribute('data-critical-loaded', 'true');
      
      // Preload remaining CSS files if enabled
      if (enablePreload) {
        preloadNonCriticalCSS();
      }
      
      // Enable progressive CSS loading
      if (enableProgressive) {
        enableProgressiveCSS();
      }
      
    }, deferDelay);

    return () => clearTimeout(timer);
  }, [enablePreload, deferDelay, enableProgressive]);

  return null;
}

/**
 * Preloads non-critical CSS files without blocking rendering
 */
function preloadNonCriticalCSS() {
  // List of non-critical CSS that can be preloaded
  const nonCriticalStyles = [
    // These would be chunks created by webpack CSS splitting
    'chunk-charts.css',
    'chunk-forms.css', 
    'chunk-animations.css',
  ];

  nonCriticalStyles.forEach(href => {
    // Check if already preloaded
    if (document.querySelector(`link[href*="${href}"]`)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = `/_next/static/css/${href}`;
    link.setAttribute('data-preloaded', 'true');
    
    // Convert preload to stylesheet when loaded
    link.onload = function() {
      const linkElement = this as unknown as HTMLLinkElement;
      linkElement.rel = 'stylesheet';
      linkElement.media = 'all';
    };
    
    // Fallback for browsers that don't support preload
    link.onerror = function() {
      const styleLink = document.createElement('link');
      styleLink.rel = 'stylesheet';
      styleLink.href = link.href;
      styleLink.setAttribute('data-fallback', 'true');
      document.head.appendChild(styleLink);
    };
    
    document.head.appendChild(link);
  });
}

/**
 * Enables progressive CSS enhancement based on user interaction
 */
function enableProgressiveCSS() {
  // Load additional CSS on user interaction
  const loadEnhancedCSS = () => {
    loadCSSChunk('enhanced-interactions.css');
  };

  // Load animation CSS on hover events
  const loadAnimationCSS = () => {
    loadCSSChunk('advanced-animations.css');
  };

  // Add event listeners for progressive loading
  document.addEventListener('mouseover', loadEnhancedCSS, { once: true, passive: true });
  document.addEventListener('touchstart', loadAnimationCSS, { once: true, passive: true });
  document.addEventListener('scroll', loadEnhancedCSS, { once: true, passive: true });
}

/**
 * Loads a specific CSS chunk
 */
function loadCSSChunk(chunkName: string) {
  if (document.querySelector(`link[href*="${chunkName}"]`)) {
    return; // Already loaded
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `/_next/static/css/${chunkName}`;
  link.setAttribute('data-progressive', 'true');
  link.media = 'all';
  
  document.head.appendChild(link);
}

/**
 * Hook for programmatic CSS loading
 */
export function useCSSLoader() {
  const loadCSS = (href: string, options?: {
    preload?: boolean;
    media?: string;
    priority?: 'high' | 'low';
  }) => {
    const { preload = false, media = 'all', priority = 'low' } = options || {};
    
    if (preload) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'style';
      preloadLink.href = href;
      
      preloadLink.onload = function() {
        const linkElement = this as unknown as HTMLLinkElement;
        linkElement.rel = 'stylesheet';
        linkElement.media = media;
      };
      
      document.head.appendChild(preloadLink);
    } else {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = media;
      
      if (priority === 'high') {
        // Insert at beginning for higher priority
        document.head.insertBefore(link, document.head.firstChild);
      } else {
        document.head.appendChild(link);
      }
    }
  };

  return { loadCSS };
}

/**
 * CSS loading performance monitor
 */
export function CSSPerformanceMonitor(): null {
  useEffect(() => {
    // Monitor CSS loading performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('.css')) {
          console.log(`[CSS Performance] ${entry.name}: ${entry.duration}ms`);
          
          // Report large CSS files
          if (entry.duration > 100) {
            console.warn(`[CSS Performance Warning] Slow CSS load: ${entry.name} (${entry.duration}ms)`);
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => observer.disconnect();
  }, []);

  return null;
}

export default CSSLoadingStrategy;
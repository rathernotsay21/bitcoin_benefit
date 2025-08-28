'use client';

/**
 * Deferred CSS Loading Component - Phase 3.1 Performance Optimization
 * Bitcoin Benefit Platform
 * 
 * Loads non-critical CSS asynchronously after critical rendering is complete
 * Prevents render-blocking CSS while ensuring all styles are eventually loaded
 */

import { useEffect } from 'react';

interface DeferredCSSProps {
  /** List of CSS files to load asynchronously */
  stylesheets?: string[];
  /** Delay before loading non-critical CSS (in ms) */
  delay?: number;
  /** Whether to preload stylesheets */
  preload?: boolean;
}

export function DeferredCSS({ 
  stylesheets = [],
  delay = 100,
  preload = true 
}: DeferredCSSProps): null {
  
  useEffect(() => {
    // Load non-critical CSS after a short delay to avoid blocking rendering
    const timer = setTimeout(() => {
      loadDeferredStylesheets(stylesheets, preload);
    }, delay);

    return () => clearTimeout(timer);
  }, [stylesheets, delay, preload]);

  return null;
}

/**
 * Dynamically loads CSS files without blocking rendering
 */
function loadDeferredStylesheets(stylesheets: string[], preload: boolean) {
  stylesheets.forEach(href => {
    // Check if stylesheet is already loaded
    if (document.querySelector(`link[href="${href}"]`)) {
      return;
    }

    // Create link element for the stylesheet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'all'; // Set to 'all' for immediate application
    link.setAttribute('data-deferred', 'true');

    // Optional: Add preload link for faster loading
    if (preload) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'style';
      preloadLink.href = href;
      preloadLink.setAttribute('data-deferred-preload', 'true');
      
      // Insert preload first
      document.head.appendChild(preloadLink);
    }

    // Insert the actual stylesheet
    document.head.appendChild(link);
  });
}

/**
 * Utility function to preload CSS with media attribute trick
 * This allows the CSS to be fetched but not applied until media condition is met
 */
export function preloadCSS(href: string): HTMLLinkElement {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  
  // Use onload to convert preload to stylesheet
  link.onload = function() {
    // @ts-ignore - onload context
    this.rel = 'stylesheet';
  };
  
  document.head.appendChild(link);
  return link;
}

/**
 * Hook for programmatically loading CSS
 */
export function useLoadCSS() {
  const loadCSS = (href: string, preload = false): HTMLLinkElement | void => {
    if (preload) {
      return preloadCSS(href);
    } else {
      loadDeferredStylesheets([href], false);
      return undefined;
    }
  };

  return { loadCSS };
}

export default DeferredCSS;
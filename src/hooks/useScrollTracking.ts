import { useEffect, useRef } from 'react';
import { trackClarityEvent, ClarityEvents } from '@/lib/analytics/clarity-events';

/**
 * Hook to track scroll depth for analytics
 * Fires events at 25%, 50%, 75%, and 100% scroll depth
 */
export function useScrollTracking(enabled: boolean = true) {
  const trackedDepths = useRef(new Set<number>());
  
  useEffect(() => {
    if (!enabled) return;
    
    // Capture ref value at effect initialization to avoid stale closures
    const effectTrackedDepths = trackedDepths.current;
    
    let scrollTimer: NodeJS.Timeout;
    
    const handleScroll = () => {
      // Debounce scroll events
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        
        // Calculate scroll percentage
        const scrollPercentage = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
        
        // Track milestone depths
        const milestones = [
          { depth: 25, event: ClarityEvents.SCROLL_DEPTH_25 },
          { depth: 50, event: ClarityEvents.SCROLL_DEPTH_50 },
          { depth: 75, event: ClarityEvents.SCROLL_DEPTH_75 },
          { depth: 100, event: ClarityEvents.SCROLL_DEPTH_100 },
        ];
        
        milestones.forEach(({ depth, event }) => {
          if (scrollPercentage >= depth && !trackedDepths.current.has(depth)) {
            trackClarityEvent(event, {
              depth,
              path: window.location.pathname,
              timestamp: new Date().toISOString(),
            });
            trackedDepths.current.add(depth);
          }
        });
      }, 150); // Debounce delay
    };
    
    // Initial check in case page loads scrolled
    handleScroll();
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearTimeout(scrollTimer);
      window.removeEventListener('scroll', handleScroll);
      // Reset tracked depths when component unmounts using captured ref value
      // Note: We use the captured ref to avoid stale closure warnings
      effectTrackedDepths.clear();
    };
  }, [enabled]);
  
  // Return current scroll depth for component use if needed
  const getCurrentScrollDepth = (): number => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    return Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
  };
  
  return {
    getCurrentScrollDepth,
    trackedDepths: Array.from(trackedDepths.current),
  };
}
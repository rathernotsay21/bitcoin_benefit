import { useEffect, useRef } from 'react';
import { trackEngagement, trackPageView, ClarityEvents, trackClarityEvent } from '@/lib/analytics/clarity-events';

interface UseEngagementTrackingOptions {
  enabled?: boolean;
  trackPageViews?: boolean;
  trackTimeOnPage?: boolean;
  pageIdentifier?: string;
}

/**
 * Hook to track user engagement metrics
 * Tracks page views, time on page, and other engagement signals
 */
export function useEngagementTracking(options: UseEngagementTrackingOptions = {}) {
  const {
    enabled = true,
    trackPageViews = true,
    trackTimeOnPage = true,
    pageIdentifier,
  } = options;
  
  const startTime = useRef<number>(Date.now());
  const isTracked = useRef<boolean>(false);
  const engagementTimer = useRef<NodeJS.Timeout>();
  const visibilityTimer = useRef<NodeJS.Timeout>();
  const totalActiveTime = useRef<number>(0);
  const lastActiveTime = useRef<number>(Date.now());
  
  useEffect(() => {
    if (!enabled) return;
    
    // Track page view on mount
    if (trackPageViews && !isTracked.current) {
      trackPageView(pageIdentifier || window.location.pathname);
      isTracked.current = true;
    }
    
    // Track time on page milestones
    if (trackTimeOnPage) {
      const checkEngagement = () => {
        const currentTime = Date.now();
        const timeOnPage = Math.floor((currentTime - startTime.current) / 1000); // in seconds
        
        // Only count active time
        if (document.visibilityState === 'visible') {
          totalActiveTime.current += (currentTime - lastActiveTime.current) / 1000;
          lastActiveTime.current = currentTime;
          
          // Track engagement milestones based on active time
          trackEngagement(totalActiveTime.current);
        }
      };
      
      // Check engagement every 30 seconds
      engagementTimer.current = setInterval(checkEngagement, 30000);
      
      // Track visibility changes
      const handleVisibilityChange = () => {
        const currentTime = Date.now();
        
        if (document.visibilityState === 'visible') {
          // Page became visible
          lastActiveTime.current = currentTime;
          
          // Resume engagement tracking
          if (!engagementTimer.current) {
            engagementTimer.current = setInterval(checkEngagement, 30000);
          }
        } else {
          // Page became hidden
          totalActiveTime.current += (currentTime - lastActiveTime.current) / 1000;
          
          // Pause engagement tracking
          if (engagementTimer.current) {
            clearInterval(engagementTimer.current);
            engagementTimer.current = undefined;
          }
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Track user interactions as engagement signals
      const interactionEvents = ['click', 'keydown', 'touchstart', 'mousemove'];
      let lastInteraction = Date.now();
      let isEngaged = true;
      
      const handleInteraction = () => {
        const now = Date.now();
        
        // If user was inactive for more than 30 seconds, track re-engagement
        if (now - lastInteraction > 30000 && !isEngaged) {
          trackClarityEvent('user_reengaged', {
            inactiveDuration: Math.floor((now - lastInteraction) / 1000),
            path: window.location.pathname,
          });
          isEngaged = true;
        }
        
        lastInteraction = now;
      };
      
      // Check for inactivity
      const inactivityTimer = setInterval(() => {
        const now = Date.now();
        if (now - lastInteraction > 30000 && isEngaged) {
          isEngaged = false;
          trackClarityEvent('user_inactive', {
            path: window.location.pathname,
          });
        }
      }, 10000);
      
      interactionEvents.forEach(event => {
        document.addEventListener(event, handleInteraction, { passive: true });
      });
      
      // Cleanup
      return () => {
        // Track page exit with time spent
        const exitTime = Date.now();
        const totalTime = Math.floor((exitTime - startTime.current) / 1000);
        
        if (document.visibilityState === 'visible') {
          totalActiveTime.current += (exitTime - lastActiveTime.current) / 1000;
        }
        
        trackClarityEvent(ClarityEvents.PAGE_EXIT, {
          path: pageIdentifier || window.location.pathname,
          totalTime,
          activeTime: Math.floor(totalActiveTime.current),
          timestamp: new Date().toISOString(),
        });
        
        // Clear timers
        if (engagementTimer.current) {
          clearInterval(engagementTimer.current);
        }
        if (visibilityTimer.current) {
          clearTimeout(visibilityTimer.current);
        }
        clearInterval(inactivityTimer);
        
        // Remove event listeners
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        interactionEvents.forEach(event => {
          document.removeEventListener(event, handleInteraction);
        });
      };
    }
  }, [enabled, trackPageViews, trackTimeOnPage, pageIdentifier]);
  
  // Return engagement metrics for component use if needed
  return {
    timeOnPage: Math.floor((Date.now() - startTime.current) / 1000),
    activeTime: Math.floor(totalActiveTime.current),
  };
}
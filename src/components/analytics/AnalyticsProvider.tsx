'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { CookieConsent, CookieConsentState, useCookieConsent } from './CookieConsent';
import { ClarityScript } from './ClarityScript';
import { GoogleAnalytics, trackEvent as gaTrackEvent, trackPageView as gaTrackPageView } from './GoogleAnalytics';
import { useEngagementTracking } from '@/hooks/useEngagementTracking';
import { useScrollTracking } from '@/hooks/useScrollTracking';
import { getUserSegmentation } from '@/lib/analytics/user-segmentation';
import { trackClarityEvent, ClarityEvents } from '@/lib/analytics/clarity-events';

interface AnalyticsContextType {
  isInitialized: boolean;
  analyticsEnabled: boolean;
  trackEvent: (eventName: string, data?: any) => void;
  trackPageView: (path?: string) => void;
  trackCalculatorEvent: (action: string, data?: any) => void;
  trackToolUsage: (tool: string, action: string, success?: boolean) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: React.ReactNode;
  enableInDevelopment?: boolean;
}

export function AnalyticsProvider({ 
  children, 
  enableInDevelopment = false 
}: AnalyticsProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { analyticsAllowed, hasConsent } = useCookieConsent();
  
  // Determine if analytics should be enabled
  const shouldEnableAnalytics = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const devOverride = process.env.NEXT_PUBLIC_ENABLE_CLARITY_DEV === 'true' || enableInDevelopment;
    const hasValidId = !!process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
    
    return hasValidId && (isProduction || devOverride) && (!hasConsent || analyticsAllowed);
  };

  const analyticsEnabled = shouldEnableAnalytics();

  // Initialize engagement and scroll tracking when analytics is enabled
  useEngagementTracking({
    enabled: analyticsEnabled,
    trackPageViews: true,
    trackTimeOnPage: true,
  });

  useScrollTracking(analyticsEnabled);

  useEffect(() => {
    if (analyticsEnabled && !isInitialized) {
      // Initialize user segmentation
      const segmentation = getUserSegmentation();
      
      // Track initial session start
      trackClarityEvent(ClarityEvents.PAGE_VIEW, {
        session_start: true,
        analytics_enabled: true,
        user_insights: segmentation.getUserInsights(),
      });

      setIsInitialized(true);
    }
  }, [analyticsEnabled, isInitialized]);

  // Track route changes
  useEffect(() => {
    if (analyticsEnabled && typeof window !== 'undefined') {
      const handleRouteChange = () => {
        const path = window.location.pathname;
        getUserSegmentation().trackPageView(path);
      };

      // Track initial page
      handleRouteChange();

      // Listen for navigation changes (Next.js app router)
      const observer = new MutationObserver(() => {
        const currentPath = window.location.pathname;
        if (currentPath !== window.location.pathname) {
          handleRouteChange();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }
  }, [analyticsEnabled]);

  // Context value
  const contextValue: AnalyticsContextType = {
    isInitialized,
    analyticsEnabled,
    trackEvent: (eventName: string, data?: any) => {
      if (analyticsEnabled) {
        // Track in Clarity
        trackClarityEvent(eventName, {
          ...data,
          user_insights: getUserSegmentation().getUserInsights(),
        });
        // Track in Google Analytics
        gaTrackEvent(eventName, data?.category || 'general', data?.label, data?.value);
      }
    },
    trackPageView: (path?: string) => {
      if (analyticsEnabled) {
        const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '');
        getUserSegmentation().trackPageView(currentPath);
        // Also track in Google Analytics
        gaTrackPageView(currentPath);
      }
    },
    trackCalculatorEvent: (action: string, data?: any) => {
      if (analyticsEnabled) {
        getUserSegmentation().trackCalculatorEngagement(action, data?.scheme);
        trackClarityEvent(ClarityEvents.CALCULATOR_STARTED, {
          ...data,
          user_insights: getUserSegmentation().getUserInsights(),
        });
      }
    },
    trackToolUsage: (tool: string, action: string, success = true) => {
      if (analyticsEnabled) {
        getUserSegmentation().trackToolUsage(tool);
        trackClarityEvent(ClarityEvents.BITCOIN_TOOL_USED, {
          tool,
          action,
          success,
          user_insights: getUserSegmentation().getUserInsights(),
        });
      }
    },
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {/* Only show cookie consent if analytics could be enabled */}
      {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && (
        <CookieConsent 
          onConsentChange={(consent: CookieConsentState) => {
            // Track consent changes
            if (analyticsEnabled) {
              trackClarityEvent(ClarityEvents.FORM_SUBMITTED, {
                form_type: 'cookie_consent',
                analytics_consent: consent.analytics,
                marketing_consent: consent.marketing,
                preferences_consent: consent.preferences,
              });
            }
          }}
        />
      )}
      
      {/* Load analytics scripts if enabled */}
      {analyticsEnabled && (
        <>
          <ClarityScript />
          <GoogleAnalytics />
        </>
      )}
      
      {children}
    </AnalyticsContext.Provider>
  );
}

// Hook to use analytics
export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);
  if (!context) {
    // Return disabled analytics if not within provider
    return {
      isInitialized: false,
      analyticsEnabled: false,
      trackEvent: () => {},
      trackPageView: () => {},
      trackCalculatorEvent: () => {},
      trackToolUsage: () => {},
    };
  }
  return context;
}

// Higher-order component for analytics tracking
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P & { trackingEnabled?: boolean }> {
  return function AnalyticsComponent(props) {
    const analytics = useAnalytics();
    
    return (
      <Component 
        {...props} 
        analytics={analytics}
      />
    );
  };
}

// Analytics event helpers
export const analyticsEvents = {
  pageView: (path?: string) => {
    getUserSegmentation().trackPageView(path || window.location.pathname);
  },
  
  calculatorStart: (scheme: string) => {
    getUserSegmentation().trackCalculatorEngagement('start', scheme);
  },
  
  toolUsage: (tool: string) => {
    getUserSegmentation().trackToolUsage(tool);
  },
  
  formSubmission: (formType: string, success: boolean = true) => {
    trackClarityEvent(ClarityEvents.FORM_SUBMITTED, {
      form_type: formType,
      success,
      user_insights: getUserSegmentation().getUserInsights(),
    });
  },
  
  errorOccurred: (error: string, source: string) => {
    trackClarityEvent(ClarityEvents.ERROR_OCCURRED, {
      error,
      source,
      user_insights: getUserSegmentation().getUserInsights(),
    });
  },
  
  ctaClicked: (ctaType: string, location: string) => {
    trackClarityEvent(ClarityEvents.CTA_CLICKED, {
      cta_type: ctaType,
      location,
      user_insights: getUserSegmentation().getUserInsights(),
    });
  },
};
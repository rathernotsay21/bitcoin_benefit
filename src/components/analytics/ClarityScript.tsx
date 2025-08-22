'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { useCookieConsent } from './CookieConsent';

declare global {
  interface Window {
    clarity?: (action: string, ...params: any[]) => void;
    clarityTracker?: {
      track: (eventName: string, data?: any) => void;
      identify: (userId: string, sessionId?: string, customData?: Record<string, any>) => void;
      setCustomTags: (tags: Record<string, string>) => void;
    };
  }
}

export function ClarityScript() {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  const { analyticsAllowed, hasConsent } = useCookieConsent();
  
  useEffect(() => {
    // Initialize clarity tracker methods even before Clarity loads
    if (typeof window !== 'undefined' && !window.clarityTracker) {
      window.clarityTracker = {
        track: function(eventName: string, data?: any) {
          if (window.clarity) {
            // Convert data to string if it's an object
            const dataStr = typeof data === 'object' ? JSON.stringify(data) : data;
            window.clarity('set', eventName, dataStr || 'true');
          } else {
            // Queue events if Clarity isn't loaded yet
            console.log('[Clarity] Event queued:', eventName, data);
          }
        },
        identify: function(userId: string, sessionId?: string, customData?: Record<string, any>) {
          if (window.clarity) {
            window.clarity('identify', userId, sessionId || '', customData || {});
          }
        },
        setCustomTags: function(tags: Record<string, string>) {
          if (window.clarity) {
            Object.entries(tags).forEach(([key, value]) => {
              window.clarity('set', key, value);
            });
          }
        }
      };
    }
  }, []);
  
  // Don't load if no Clarity ID is configured
  if (!clarityId) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Clarity] Project ID not configured. Add NEXT_PUBLIC_CLARITY_PROJECT_ID to your .env.local');
    }
    return null;
  }

  // Only load in production by default, but allow override for testing
  const shouldLoadClarity = process.env.NODE_ENV === 'production' || 
                           process.env.NEXT_PUBLIC_ENABLE_CLARITY_DEV === 'true';
  
  if (!shouldLoadClarity) {
    console.log('[Clarity] Skipping load in development. Set NEXT_PUBLIC_ENABLE_CLARITY_DEV=true to enable.');
    return null;
  }

  // Don't load if user hasn't consented to analytics
  if (hasConsent && !analyticsAllowed) {
    console.log('[Clarity] Analytics not allowed by user consent.');
    return null;
  }

  return (
    <>
      <Script
        id="microsoft-clarity"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityId}");
            
            // Set up custom tracking after Clarity loads
            if (typeof window !== 'undefined') {
              // Enhanced tracker with more capabilities
              window.clarityTracker = {
                track: function(eventName, data) {
                  if (window.clarity) {
                    const dataStr = typeof data === 'object' ? JSON.stringify(data) : data;
                    window.clarity("set", eventName, dataStr || "true");
                  }
                },
                identify: function(userId, sessionId, customData) {
                  if (window.clarity) {
                    window.clarity("identify", userId, sessionId || "", customData || {});
                  }
                },
                setCustomTags: function(tags) {
                  if (window.clarity) {
                    Object.entries(tags).forEach(([key, value]) => {
                      window.clarity("set", key, value);
                    });
                  }
                }
              };
              
              // Log successful initialization
              console.log("[Clarity] Initialized with project ID: ${clarityId}");
            }
          `,
        }}
        onLoad={() => {
          console.log('[Clarity] Script loaded successfully');
          // Track initial page view
          if (window.clarityTracker) {
            window.clarityTracker.track('page_view', {
              path: window.location.pathname,
              referrer: document.referrer
            });
          }
        }}
        onError={(e) => {
          console.error('[Clarity] Failed to load script:', e);
        }}
      />
    </>
  );
}
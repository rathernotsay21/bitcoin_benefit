'use client';

import { useState, useEffect } from 'react';
import { trackClarityEvent, ClarityEvents } from '@/lib/analytics/clarity-events';

interface CookieConsentProps {
  onConsentChange?: (consent: CookieConsentState) => void;
}

export interface CookieConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: number;
}

const DEFAULT_CONSENT: CookieConsentState = {
  necessary: true, // Always required
  analytics: false,
  marketing: false,
  preferences: false,
  timestamp: Date.now(),
};

export function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsentState>(DEFAULT_CONSENT);

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent) as CookieConsentState;
        setConsent(parsed);
        onConsentChange?.(parsed);
      } catch (error) {
        console.error('Error parsing saved consent:', error);
        setShowBanner(true);
      }
    } else {
      // Show banner for new users
      setShowBanner(true);
    }
  }, [onConsentChange]);

  const saveConsent = (newConsent: CookieConsentState) => {
    const consentWithTimestamp = {
      ...newConsent,
      timestamp: Date.now(),
    };
    
    localStorage.setItem('cookie-consent', JSON.stringify(consentWithTimestamp));
    setConsent(consentWithTimestamp);
    setShowBanner(false);
    setShowDetails(false);
    onConsentChange?.(consentWithTimestamp);

    // Track consent choice
    trackClarityEvent(ClarityEvents.FORM_SUBMITTED, {
      formType: 'cookie-consent',
      analytics: newConsent.analytics,
      marketing: newConsent.marketing,
      preferences: newConsent.preferences,
    });
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: Date.now(),
    });
  };

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: Date.now(),
    });
  };

  const handleCustomConsent = () => {
    saveConsent(consent);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      {!showDetails ? (
        // Simple banner
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                We use cookies to enhance your experience and analyze usage. 
                Microsoft Clarity helps us understand how you use our calculators to improve the platform.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Customize
              </button>
              <button
                onClick={acceptNecessary}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Necessary Only
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Detailed preferences
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cookie Preferences
              </h3>
              <p className="text-sm text-gray-600">
                Choose which cookies you allow. You can change these settings at any time.
              </p>
            </div>

            <div className="space-y-4">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Necessary Cookies</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Required for the website to function properly. These cannot be disabled.
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="h-4 w-4 text-orange-500 rounded opacity-50"
                  />
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Help us understand how you use our calculators via Microsoft Clarity. 
                    This data is anonymized and helps improve user experience.
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={consent.analytics}
                    onChange={(e) => setConsent(prev => ({ ...prev, analytics: e.target.checked }))}
                    className="h-4 w-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Preferences Cookies */}
              <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Preference Cookies</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Remember your settings and preferences for a better experience.
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={consent.preferences}
                    onChange={(e) => setConsent(prev => ({ ...prev, preferences: e.target.checked }))}
                    className="h-4 w-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Marketing Cookies</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Used to show you relevant content and measure the effectiveness of our communications.
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={consent.marketing}
                    onChange={(e) => setConsent(prev => ({ ...prev, marketing: e.target.checked }))}
                    className="h-4 w-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowDetails(false)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
              <div className="flex gap-2">
                <button
                  onClick={acceptNecessary}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Necessary Only
                </button>
                <button
                  onClick={handleCustomConsent}
                  className="px-4 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook to use cookie consent state
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsentState | null>(null);

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent) as CookieConsentState;
        setConsent(parsed);
      } catch (error) {
        console.error('Error parsing saved consent:', error);
      }
    }
  }, []);

  const updateConsent = (newConsent: Partial<CookieConsentState>) => {
    const updatedConsent = {
      ...consent,
      ...newConsent,
      timestamp: Date.now(),
    } as CookieConsentState;
    
    localStorage.setItem('cookie-consent', JSON.stringify(updatedConsent));
    setConsent(updatedConsent);
  };

  return {
    consent,
    updateConsent,
    hasConsent: consent !== null,
    analyticsAllowed: consent?.analytics ?? false,
    marketingAllowed: consent?.marketing ?? false,
    preferencesAllowed: consent?.preferences ?? false,
  };
}
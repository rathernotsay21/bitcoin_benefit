'use client';

import { useState, useEffect } from 'react';
import { useAnalytics } from '@/components/analytics/AnalyticsProvider';
import { useCookieConsent } from '@/components/analytics/CookieConsent';
import { getUserSegmentation } from '@/lib/analytics/user-segmentation';
import { trackClarityEvent, ClarityEvents } from '@/lib/analytics/clarity-events';

/**
 * Development component to test Microsoft Clarity integration
 * Only visible in development mode
 */
export function ClarityTester() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { analyticsEnabled, trackEvent, trackPageView, trackCalculatorEvent } = useAnalytics();
  const { consent, analyticsAllowed } = useCookieConsent();

  // Only show in development
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development');
  }, []);

  const addResult = (message: string) => {
    setTestResults(prev => [
      `${new Date().toLocaleTimeString()}: ${message}`,
      ...prev.slice(0, 9) // Keep last 10 results
    ]);
  };

  const testBasicEvent = () => {
    trackEvent('test_basic_event', { test: true, timestamp: Date.now() });
    addResult('✅ Basic event tracked');
  };

  const testPageView = () => {
    trackPageView('/test-page');
    addResult('✅ Page view tracked');
  };

  const testCalculatorEvent = () => {
    trackCalculatorEvent('test', { scheme: 'test-scheme', action: 'test-action' });
    addResult('✅ Calculator event tracked');
  };

  const testErrorEvent = () => {
    trackEvent(ClarityEvents.ERROR_OCCURRED, {
      error: 'Test error',
      source: 'clarity-tester',
      severity: 'low'
    });
    addResult('✅ Error event tracked');
  };

  const testFormEvent = () => {
    trackEvent(ClarityEvents.FORM_SUBMITTED, {
      formType: 'test-form',
      success: true,
      fields: ['test_field']
    });
    addResult('✅ Form event tracked');
  };

  const testScrollEvent = () => {
    trackEvent(ClarityEvents.SCROLL_DEPTH_50, {
      depth: 50,
      path: window.location.pathname
    });
    addResult('✅ Scroll event tracked');
  };

  const testUserSegmentation = () => {
    const segmentation = getUserSegmentation();
    const session = segmentation.getSession();
    const insights = segmentation.getUserInsights();
    
    addResult(`📊 User Type: ${session?.userType || 'unknown'}`);
    addResult(`📊 Engagement: ${session?.engagementLevel || 'unknown'}`);
    addResult(`📊 Page Views: ${session?.pageViews || 0}`);
    addResult(`📊 Is Power User: ${insights.isPowerUser ? 'Yes' : 'No'}`);
  };

  const testClarityAvailability = () => {
    if (typeof window !== 'undefined') {
      const clarityAvailable = !!window.clarity;
      const trackerAvailable = !!window.clarityTracker;
      
      addResult(`🔍 window.clarity: ${clarityAvailable ? '✅' : '❌'}`);
      addResult(`🔍 window.clarityTracker: ${trackerAvailable ? '✅' : '❌'}`);
      
      if (window.clarityTracker) {
        addResult('🔍 Tracker methods available');
      }
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-h-96 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Clarity Tester</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 mb-3">
        <div className="text-xs">
          <span className="font-medium">Status:</span>{' '}
          <span className={analyticsEnabled ? 'text-green-600' : 'text-red-600'}>
            {analyticsEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <div className="text-xs">
          <span className="font-medium">Analytics Consent:</span>{' '}
          <span className={analyticsAllowed ? 'text-green-600' : 'text-red-600'}>
            {analyticsAllowed ? 'Granted' : 'Not Granted'}
          </span>
        </div>
        <div className="text-xs">
          <span className="font-medium">Project ID:</span>{' '}
          <span className="font-mono text-xs">
            {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || 'Not Set'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 mb-3">
        <button
          onClick={testBasicEvent}
          className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded"
        >
          Basic Event
        </button>
        <button
          onClick={testPageView}
          className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 rounded"
        >
          Page View
        </button>
        <button
          onClick={testCalculatorEvent}
          className="px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 rounded"
        >
          Calculator
        </button>
        <button
          onClick={testErrorEvent}
          className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 rounded"
        >
          Error
        </button>
        <button
          onClick={testFormEvent}
          className="px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 rounded"
        >
          Form
        </button>
        <button
          onClick={testScrollEvent}
          className="px-2 py-1 text-xs bg-indigo-100 hover:bg-indigo-200 rounded"
        >
          Scroll
        </button>
      </div>

      <div className="flex gap-1 mb-3">
        <button
          onClick={testUserSegmentation}
          className="px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 rounded flex-1"
        >
          Segmentation
        </button>
        <button
          onClick={testClarityAvailability}
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex-1"
        >
          Check API
        </button>
        <button
          onClick={clearResults}
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
        >
          Clear
        </button>
      </div>

      <div className="text-xs bg-gray-50 rounded p-2 max-h-32 overflow-y-auto">
        <div className="font-medium mb-1">Test Results:</div>
        {testResults.length === 0 ? (
          <div className="text-gray-500">No tests run yet</div>
        ) : (
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="font-mono text-xs">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
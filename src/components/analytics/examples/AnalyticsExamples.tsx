// Example: How to add GA4 tracking to your components

import { useEffect } from 'react';
import { useAnalytics } from '@/components/analytics/AnalyticsProvider';
import { trackCalculatorEvent, trackEngagement, trackConversion } from '@/components/analytics/GoogleAnalytics';

// Example 1: Track calculator usage
export function VestingCalculatorExample() {
  const analytics = useAnalytics();
  
  const handleCalculationStart = (scheme: string) => {
    // Using the analytics context
    analytics.trackCalculatorEvent('started', {
      scheme,
      category: 'vesting_calculator',
    });
    
    // Or using the direct GA function
    trackCalculatorEvent('vesting', 'calculation_started', scheme);
  };
  
  const handleCalculationComplete = (results: any) => {
    // Track completion with value
    analytics.trackEvent('calculation_completed', {
      category: 'vesting_calculator',
      label: results.scheme,
      value: results.totalValue,
    });
  };
  
  return (
    <div>
      {/* Your calculator UI */}
    </div>
  );
}

// Example 2: Track Bitcoin tools usage
export function BitcoinToolExample() {
  const analytics = useAnalytics();
  
  const handleToolUse = (toolName: string) => {
    analytics.trackToolUsage(toolName, 'initiated', true);
    
    // Track in GA4 with custom parameters
    trackCalculatorEvent('bitcoin-tools', toolName, 'success');
  };
  
  return (
    <div>
      {/* Your tool UI */}
    </div>
  );
}

// Example 3: Track user engagement
export function EngagementExample() {
  const analytics = useAnalytics();
  
  useEffect(() => {
    // Track scroll depth
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / document.body.scrollHeight) * 100;
      
      if (scrollPercent > 75) {
        trackEngagement('scroll', 'deep_scroll_75');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return <div>{/* Your content */}</div>;
}

// Example 4: Track form submissions
export function FormExample() {
  const analytics = useAnalytics();
  
  const handleSubmit = async (formData: any) => {
    try {
      // Your form submission logic
      // await submitForm(formData); // Replace with your actual submission
      
      // Track successful submission
      analytics.trackEvent('form_submitted', {
        category: 'forms',
        label: 'contact_form',
        value: 1,
      });
    } catch (error) {
      // Track form errors
      analytics.trackEvent('form_error', {
        category: 'errors',
        label: 'contact_form',
        value: 0,
      });
    }
  };
  
  return <form>{/* Your form fields */}</form>;
}

// Example 5: Track CTA clicks
export function CTAButtonExample() {
  const analytics = useAnalytics();
  
  const handleCTAClick = (ctaName: string, location: string) => {
    analytics.trackEvent('cta_clicked', {
      category: 'engagement',
      label: `${ctaName}_${location}`,
      value: 1,
    });
    
    // Also track as conversion if important
    if (ctaName === 'start_calculator') {
      trackConversion('YOUR_CONVERSION_ID', 1, 'USD');
    }
  };
  
  return (
    <button onClick={() => handleCTAClick('start_calculator', 'hero')}>
      Start Calculator
    </button>
  );
}

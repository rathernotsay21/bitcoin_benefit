'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

interface WebVitalsReporterProps {
  enableReporting?: boolean;
}

export const WebVitalsReporter: React.FC<WebVitalsReporterProps> = ({ 
  enableReporting = true 
}) => {
  useEffect(() => {
    if (!enableReporting || typeof window === 'undefined') return undefined;

    // Report to analytics service
    const reportWebVital = (metric: any) => {
      // Development logging
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}`, metric);
      }


      // Custom tracking for Bitcoin Benefit specific metrics
      if (metric.name === 'LCP' && metric.value > 2500) {
        console.warn('LCP is poor (>2.5s). Consider optimizing critical resources.');
        
      }

      if (metric.name === 'INP' && metric.value > 200) {
        console.warn('INP is poor (>200ms). Consider optimizing JavaScript execution.');
      }

      // Store metrics for debugging
      if (window.bitcoinBenefitMetrics) {
        window.bitcoinBenefitMetrics[metric.name] = metric;
      } else {
        window.bitcoinBenefitMetrics = { [metric.name]: metric };
      }
    };

    // Initialize metrics collection
    window.bitcoinBenefitMetrics = {};

    // Collect all Web Vitals
    onCLS(reportWebVital);
    onINP(reportWebVital);  // INP replaced FID in web-vitals v3+
    onFCP(reportWebVital);
    onLCP(reportWebVital);
    onTTFB(reportWebVital);

    // Custom performance observers
    if ('PerformanceObserver' in window) {
      // Track long tasks that could impact responsiveness
      try {
        const longTaskObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
            }
          });
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });

        // Track layout shifts
        const layoutShiftObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry: any) => {
            if (entry.value > 0.1) {
              console.warn(`Layout shift detected: ${entry.value.toFixed(4)}`);
            }
          });
        });

        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });

        // Clean up observers
        return () => {
          longTaskObserver.disconnect();
          layoutShiftObserver.disconnect();
        };
      } catch (error) {
        console.warn('Performance observers not supported:', error);
        return undefined;
      }
    }
    return undefined;
  }, [enableReporting]);

  return null;
};

// Export types for TypeScript
declare global {
  interface Window {
    bitcoinBenefitMetrics: Record<string, any>;
  }
}

export default WebVitalsReporter;
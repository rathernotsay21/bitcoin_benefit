'use client';

import { useEffect } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

interface WebVitalsReporterProps {
  enableReporting?: boolean;
}

export const WebVitalsReporter: React.FC<WebVitalsReporterProps> = ({ 
  enableReporting = true 
}) => {
  useEffect(() => {
    if (!enableReporting || typeof window === 'undefined') return;

    // Report to analytics service
    const reportWebVital = (metric: any) => {
      // Development logging
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}`, metric);
      }

      // Production analytics reporting
      if (typeof window.gtag === 'function') {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          value: Math.round(metric.value),
          event_label: metric.id,
          non_interaction: true,
        });
      }

      // Additional performance tracking
      if (typeof window.clarity === 'function') {
        window.clarity('event', `web_vital_${metric.name.toLowerCase()}`, {
          value: metric.value,
          rating: metric.rating || 'unknown',
        });
      }

      // Custom tracking for Bitcoin Benefit specific metrics
      if (metric.name === 'LCP' && metric.value > 2500) {
        console.warn('LCP is poor (>2.5s). Consider optimizing critical resources.');
        
        // Track slow LCP events
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'slow_lcp', {
            event_category: 'Performance Issues',
            value: Math.round(metric.value),
            custom_map: { metric_name: 'lcp_performance_issue' }
          });
        }
      }

      if (metric.name === 'FID' && metric.value > 100) {
        console.warn('FID is poor (>100ms). Consider optimizing JavaScript execution.');
        
        // Track poor interactivity
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'poor_interactivity', {
            event_category: 'Performance Issues',
            value: Math.round(metric.value),
          });
        }
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
    getCLS(reportWebVital);
    getFID(reportWebVital);
    getFCP(reportWebVital);
    getLCP(reportWebVital);
    getTTFB(reportWebVital);

    // Custom performance observers
    if ('PerformanceObserver' in window) {
      // Track long tasks that could impact responsiveness
      try {
        const longTaskObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
              
              if (typeof window.gtag === 'function') {
                window.gtag('event', 'long_task', {
                  event_category: 'Performance Issues',
                  value: Math.round(entry.duration),
                  event_label: entry.name || 'unknown',
                });
              }
            }
          });
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });

        // Track layout shifts
        const layoutShiftObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry: any) => {
            if (entry.value > 0.1) {
              console.warn(`Layout shift detected: ${entry.value.toFixed(4)}`);
              
              if (typeof window.gtag === 'function') {
                window.gtag('event', 'layout_shift', {
                  event_category: 'Performance Issues',
                  value: Math.round(entry.value * 1000),
                });
              }
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
      }
    }
  }, [enableReporting]);

  return null;
};

// Export types for TypeScript
declare global {
  interface Window {
    bitcoinBenefitMetrics: Record<string, any>;
    gtag?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}

export default WebVitalsReporter;
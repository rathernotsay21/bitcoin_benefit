'use client';

import React, { useEffect, useCallback, useRef } from 'react';

// Performance metrics interface
interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
  timeToInteractive?: number;
  userAgent: string;
  timestamp: number;
}

// Core Web Vitals thresholds (as per Google)
const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },   // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  TTI: { good: 3800, needsImprovement: 7300 }  // Time to Interactive
};

// Performance monitor hook
export function usePerformanceMonitor(componentName: string) {
  const startTimeRef = useRef<number>(performance.now());
  const metricsRef = useRef<PerformanceMetrics | null>(null);
  
  useEffect(() => {
    startTimeRef.current = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTimeRef.current;
      
      metricsRef.current = {
        componentName,
        renderTime,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      };
      
      // Log performance issues in development
      if (process.env.NODE_ENV === 'development') {
        if (renderTime > 16) {
          console.warn(`⚠️ ${componentName} render time: ${renderTime.toFixed(2)}ms (>16ms threshold)`);
        }
        
        if (renderTime > 100) {
          console.error(`🔴 ${componentName} slow render: ${renderTime.toFixed(2)}ms (>100ms threshold)`);
        }
      }
      
    };
  }, [componentName]);
  
  const getMetrics = useCallback(() => metricsRef.current, []);
  
  return { getMetrics };
}

// Core Web Vitals monitoring
export function useCoreWebVitals() {
  const metricsRef = useRef<Partial<PerformanceMetrics>>({});
  
  useEffect(() => {
    // Largest Contentful Paint (LCP)
    const observeLCP = () => {
      try {
        const po = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          metricsRef.current.largestContentfulPaint = lastEntry.startTime;
          
          if (process.env.NODE_ENV === 'development') {
            const lcp = lastEntry.startTime;
            const status = lcp <= PERFORMANCE_THRESHOLDS.LCP.good ? '🟢' : 
                          lcp <= PERFORMANCE_THRESHOLDS.LCP.needsImprovement ? '🟡' : '🔴';
            console.log(`${status} LCP: ${lcp.toFixed(2)}ms`);
          }
        });
        
        po.observe({ entryTypes: ['largest-contentful-paint'] });
        return () => po.disconnect();
      } catch (error) {
        console.warn('LCP observation not supported');
        return () => {}; // Return no-op cleanup function
      }
    };
    
    // First Input Delay (FID)
    const observeFID = () => {
      try {
        const po = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            metricsRef.current.firstInputDelay = entry.processingStart - entry.startTime;
            
            if (process.env.NODE_ENV === 'development') {
              const fid = entry.processingStart - entry.startTime;
              const status = fid <= PERFORMANCE_THRESHOLDS.FID.good ? '🟢' : 
                            fid <= PERFORMANCE_THRESHOLDS.FID.needsImprovement ? '🟡' : '🔴';
              console.log(`${status} FID: ${fid.toFixed(2)}ms`);
            }
          });
        });
        
        po.observe({ entryTypes: ['first-input'] });
        return () => po.disconnect();
      } catch (error) {
        console.warn('FID observation not supported');
        return () => {}; // Return no-op cleanup function
      }
    };
    
    // Cumulative Layout Shift (CLS)
    const observeCLS = () => {
      try {
        let clsValue = 0;
        const po = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
              metricsRef.current.cumulativeLayoutShift = clsValue;
              
              if (process.env.NODE_ENV === 'development') {
                const status = clsValue <= PERFORMANCE_THRESHOLDS.CLS.good ? '🟢' : 
                              clsValue <= PERFORMANCE_THRESHOLDS.CLS.needsImprovement ? '🟡' : '🔴';
                console.log(`${status} CLS: ${clsValue.toFixed(4)}`);
              }
            }
          });
        });
        
        po.observe({ entryTypes: ['layout-shift'] });
        return () => po.disconnect();
      } catch (error) {
        console.warn('CLS observation not supported');
        return () => {}; // Return no-op cleanup function
      }
    };
    
    // Initialize observers
    const cleanupFunctions = [
      observeLCP(),
      observeFID(),
      observeCLS()
    ].filter(Boolean) as (() => void)[];
    
    // Cleanup
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, []);
  
  const getWebVitals = useCallback(() => metricsRef.current, []);
  
  return { getWebVitals };
}

// Performance monitoring component
interface PerformanceMonitorProps {
  children: React.ReactNode;
  componentName: string;
  enableCoreWebVitals?: boolean;
  enableDevLogging?: boolean;
}

export function PerformanceMonitor({
  children,
  componentName,
  enableCoreWebVitals = true,
  enableDevLogging = true
}: PerformanceMonitorProps) {
  const { getMetrics } = usePerformanceMonitor(componentName);
  const coreWebVitalsHook = useCoreWebVitals();
  const { getWebVitals } = enableCoreWebVitals ? coreWebVitalsHook : { getWebVitals: () => ({}) };
  
  // Report combined metrics periodically
  useEffect(() => {
    const reportInterval = setInterval(() => {
      const componentMetrics = getMetrics();
      const webVitals = getWebVitals();
      
      if (componentMetrics || Object.keys(webVitals).length > 0) {
        const combinedMetrics = {
          ...componentMetrics,
          ...webVitals
        };
        
        
        // Log in development
        if (enableDevLogging && process.env.NODE_ENV === 'development') {
          console.table(combinedMetrics);
        }
      }
    }, 30000); // Report every 30 seconds
    
    return () => clearInterval(reportInterval);
  }, [componentName, getMetrics, getWebVitals, enableDevLogging]);
  
  return <>{children}</>;
}

// HOC for easy performance monitoring
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string,
  enableCoreWebVitals: boolean = false
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const WithPerformanceMonitoring = (props: P) => {
    return (
      <PerformanceMonitor 
        componentName={displayName}
        enableCoreWebVitals={enableCoreWebVitals}
      >
        <WrappedComponent {...props} />
      </PerformanceMonitor>
    );
  };
  
  WithPerformanceMonitoring.displayName = `withPerformanceMonitoring(${displayName})`;
  return WithPerformanceMonitoring;
}

// Performance budget checker
export function checkPerformanceBudget(metrics: Partial<PerformanceMetrics>) {
  const issues: string[] = [];
  
  if (metrics.renderTime && metrics.renderTime > 16) {
    issues.push(`Slow render: ${metrics.renderTime.toFixed(2)}ms (target: <16ms)`);
  }
  
  if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > PERFORMANCE_THRESHOLDS.LCP.good) {
    issues.push(`Poor LCP: ${metrics.largestContentfulPaint.toFixed(2)}ms (target: <2500ms)`);
  }
  
  if (metrics.firstInputDelay && metrics.firstInputDelay > PERFORMANCE_THRESHOLDS.FID.good) {
    issues.push(`Poor FID: ${metrics.firstInputDelay.toFixed(2)}ms (target: <100ms)`);
  }
  
  if (metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > PERFORMANCE_THRESHOLDS.CLS.good) {
    issues.push(`Poor CLS: ${metrics.cumulativeLayoutShift.toFixed(4)} (target: <0.1)`);
  }
  
  return {
    isWithinBudget: issues.length === 0,
    issues,
    score: calculatePerformanceScore(metrics)
  };
}

// Calculate performance score (0-100)
function calculatePerformanceScore(metrics: Partial<PerformanceMetrics>): number {
  let score = 100;
  
  // Render time penalty
  if (metrics.renderTime) {
    if (metrics.renderTime > 100) score -= 30;
    else if (metrics.renderTime > 50) score -= 15;
    else if (metrics.renderTime > 16) score -= 5;
  }
  
  // LCP penalty
  if (metrics.largestContentfulPaint) {
    if (metrics.largestContentfulPaint > PERFORMANCE_THRESHOLDS.LCP.needsImprovement) score -= 25;
    else if (metrics.largestContentfulPaint > PERFORMANCE_THRESHOLDS.LCP.good) score -= 10;
  }
  
  // FID penalty
  if (metrics.firstInputDelay) {
    if (metrics.firstInputDelay > PERFORMANCE_THRESHOLDS.FID.needsImprovement) score -= 25;
    else if (metrics.firstInputDelay > PERFORMANCE_THRESHOLDS.FID.good) score -= 10;
  }
  
  // CLS penalty
  if (metrics.cumulativeLayoutShift) {
    if (metrics.cumulativeLayoutShift > PERFORMANCE_THRESHOLDS.CLS.needsImprovement) score -= 20;
    else if (metrics.cumulativeLayoutShift > PERFORMANCE_THRESHOLDS.CLS.good) score -= 10;
  }
  
  return Math.max(0, score);
}

export default PerformanceMonitor;
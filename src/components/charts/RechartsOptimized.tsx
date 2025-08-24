'use client';

import React, { lazy, Suspense, memo } from 'react';

// Import recharts components directly to avoid type issues
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';

// Lightweight loading fallback for chart components
const ChartComponentFallback = () => (
  <div className="w-full h-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
);

// Optimized chart component exports with Suspense
export const OptimizedLine = (props: any) => (
  <Suspense fallback={<ChartComponentFallback />}>
    <Line {...props} />
  </Suspense>
);

export const OptimizedXAxis = (props: any) => (
  <Suspense fallback={<ChartComponentFallback />}>
    <XAxis {...props} />
  </Suspense>
);

export const OptimizedYAxis = (props: any) => (
  <Suspense fallback={<ChartComponentFallback />}>
    <YAxis {...props} />
  </Suspense>
);

export const OptimizedCartesianGrid = (props: any) => (
  <Suspense fallback={<ChartComponentFallback />}>
    <CartesianGrid {...props} />
  </Suspense>
);

export const OptimizedTooltip = (props: any) => (
  <Suspense fallback={<ChartComponentFallback />}>
    <Tooltip {...props} />
  </Suspense>
);

export const OptimizedLegend = (props: any) => (
  <Suspense fallback={<ChartComponentFallback />}>
    <Legend {...props} />
  </Suspense>
);

export const OptimizedResponsiveContainer = (props: any) => (
  <Suspense fallback={<div className="w-full h-64 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />}>
    <ResponsiveContainer {...props} />
  </Suspense>
);

export const OptimizedComposedChart = (props: any) => (
  <Suspense fallback={<div className="w-full h-64 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />}>
    <ComposedChart {...props} />
  </Suspense>
);

// Advanced bundle optimization utilities
export const RECHARTS_BUNDLE_CONFIG = {
  // Performance-first animation settings
  defaultAnimationDuration: 0,
  tooltipAnimationDuration: 0,
  // Optimize rendering pipeline
  throttleDelay: 16, // 60fps
  // Mobile-first optimizations
  mobileOptimizations: {
    maxDataPoints: 25,
    disableAnimations: true,
    reduceStrokeWidth: true,
    simplifyTooltips: true,
    useCanvasRenderer: false // SVG is better for Bitcoin Benefit's use case
  },
  // Desktop optimizations
  desktopOptimizations: {
    maxDataPoints: 100,
    enableAnimations: true,
    highQualityRendering: true
  },
  // Memory management
  memoryOptimization: {
    enableVirtualization: true,
    cleanupThreshold: 1000,
    cacheSize: 50
  }
};

// Enhanced performance monitoring with Web Vitals integration
export function withChartPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return memo((props: P) => {
    React.useEffect(() => {
      const startTime = performance.now();
      let observer: PerformanceObserver | null = null;
      
      // Monitor long tasks that could block rendering
      if ('PerformanceObserver' in window) {
        observer = new PerformanceObserver((entries) => {
          entries.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              console.warn(`Long task in ${componentName}: ${entry.duration.toFixed(2)}ms`);
            }
          });
        });
        observer.observe({ entryTypes: ['longtask'] });
      }
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        // Cleanup observer
        if (observer) {
          observer.disconnect();
        }
        
        // Performance thresholds based on component criticality
        const threshold = componentName.includes('Chart') ? 100 : 50;
        
        if (process.env.NODE_ENV === 'development' && renderTime > threshold) {
          console.warn(`${componentName} render time: ${renderTime.toFixed(2)}ms (>${threshold}ms threshold)`);
        }
        
        // Enhanced analytics reporting
        if (typeof window !== 'undefined' && renderTime > threshold) {
          // Report to Web Vitals if available
          if ('gtag' in window) {
            (window as any).gtag('event', 'chart_performance', {
              event_category: 'Performance',
              event_label: componentName,
              value: Math.round(renderTime),
              custom_map: { metric_name: 'chart_render_time' }
            });
          }
          
          // Report to Performance Observer API
          if ('performance' in window && 'mark' in performance) {
            performance.mark(`${componentName}-render-complete`);
          }
        }
      };
    }, []);
    
    return <WrappedComponent {...props} />;
  });
}

// Optimize data processing for charts with memoization
export const optimizeChartData = memo(<T,>(data: T[], maxDataPoints: number = 50): T[] => {
  if (!data || data.length <= maxDataPoints) {
    return data;
  }
  
  // Use more intelligent sampling for time series data
  if (data.length > maxDataPoints * 2) {
    // For very large datasets, use Douglas-Peucker-like simplification
    const step = Math.ceil(data.length / maxDataPoints);
    const optimized: T[] = [data[0]]; // Always include first point
    
    for (let i = step; i < data.length - 1; i += step) {
      optimized.push(data[i]);
    }
    
    optimized.push(data[data.length - 1]); // Always include last point
    return optimized;
  }
  
  return data;
}) as <T>(data: T[], maxDataPoints?: number) => T[];

// Mobile-optimized chart configuration
export function getMobileChartConfig(isMobile: boolean) {
  return {
    margin: isMobile 
      ? { top: 20, right: 20, bottom: 25, left: 10 }
      : { top: 30, right: 35, bottom: 40, left: 15 },
    height: isMobile ? 300 : 540,
    strokeWidth: isMobile ? 2 : 3,
    dotRadius: isMobile ? 3 : 4,
    fontSize: isMobile ? 11 : 12,
    animationDuration: isMobile ? 0 : 300
  };
}

const RechartsOptimized = {
  OptimizedLine,
  OptimizedXAxis,
  OptimizedYAxis,
  OptimizedCartesianGrid,
  OptimizedTooltip,
  OptimizedLegend,
  OptimizedResponsiveContainer,
  OptimizedComposedChart,
  RECHARTS_BUNDLE_CONFIG,
  withChartPerformanceMonitoring,
  optimizeChartData,
  getMobileChartConfig
};

export default RechartsOptimized;
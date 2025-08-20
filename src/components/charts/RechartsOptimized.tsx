'use client';

import React, { lazy, Suspense } from 'react';

// Dynamically import specific Recharts components for better tree shaking
const Line = lazy(() => 
  import('recharts').then(module => ({ default: module.Line }))
);

const XAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.XAxis }))
);

const YAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.YAxis }))
);

const CartesianGrid = lazy(() => 
  import('recharts').then(module => ({ default: module.CartesianGrid }))
);

const Tooltip = lazy(() => 
  import('recharts').then(module => ({ default: module.Tooltip }))
);

const Legend = lazy(() => 
  import('recharts').then(module => ({ default: module.Legend }))
);

const ResponsiveContainer = lazy(() => 
  import('recharts').then(module => ({ default: module.ResponsiveContainer }))
);

const ComposedChart = lazy(() => 
  import('recharts').then(module => ({ default: module.ComposedChart }))
);

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

// Bundle size optimization utilities
export const RECHARTS_BUNDLE_CONFIG = {
  // Disable animations by default for better performance
  defaultAnimationDuration: 0,
  // Optimize tooltip rendering
  tooltipAnimationDuration: 0,
  // Reduce re-render frequency
  throttleDelay: 100,
  // Optimize for mobile
  reduceChartComplexityOnMobile: true
};

// Performance monitoring for chart rendering
export function withChartPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return React.memo((props: P) => {
    React.useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        // Log performance metrics in development
        if (process.env.NODE_ENV === 'development' && renderTime > 16) {
          console.warn(`${componentName} render time: ${renderTime.toFixed(2)}ms (>16ms threshold)`);
        }
        
        // Report to analytics in production (if available)
        if (typeof window !== 'undefined' && window.gtag && renderTime > 100) {
          window.gtag('event', 'chart_performance', {
            event_category: 'Performance',
            event_label: componentName,
            value: Math.round(renderTime)
          });
        }
      };
    });
    
    return <WrappedComponent {...props} />;
  });
}

// Optimize data processing for charts
export function optimizeChartData<T>(data: T[], maxDataPoints: number = 50): T[] {
  if (data.length <= maxDataPoints) {
    return data;
  }
  
  // Sample data points evenly across the dataset
  const step = Math.ceil(data.length / maxDataPoints);
  const optimized: T[] = [];
  
  for (let i = 0; i < data.length; i += step) {
    optimized.push(data[i]);
  }
  
  // Always include the last point
  if (optimized[optimized.length - 1] !== data[data.length - 1]) {
    optimized.push(data[data.length - 1]);
  }
  
  return optimized;
}

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
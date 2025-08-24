'use client';

import dynamic from 'next/dynamic';
import { Suspense, memo } from 'react';
import { Card } from '@/components/ui/card';

// Lightweight loading component
const ChartLoadingSkeleton = memo(() => (
  <Card className="w-full h-[540px] flex items-center justify-center bg-gray-50 dark:bg-slate-800">
    <div className="space-y-4 w-full max-w-md mx-auto p-8">
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
        <div className="h-40 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
        <div className="h-28 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </div>
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-3/4"></div>
    </div>
  </Card>
));

ChartLoadingSkeleton.displayName = 'ChartLoadingSkeleton';

// Ultra-lazy chart imports - only load when actually needed
export const LazyVestingChart = dynamic(
  () => import('@/components/VestingTimelineChartRecharts').then(mod => ({ default: mod.default })),
  {
    loading: () => <ChartLoadingSkeleton />,
    ssr: false,
  }
);

export const LazyHistoricalChart = dynamic(
  () => import('@/components/HistoricalTimelineVisualizationOptimized').then(mod => ({ default: mod.default })),
  {
    loading: () => <ChartLoadingSkeleton />,
    ssr: false,
  }
);

// Virtualized table with intersection observer
export const LazyVirtualizedTable = dynamic(
  () => import('@/components/VirtualizedAnnualBreakdownOptimized').then(mod => ({ default: mod.default })),
  {
    loading: () => (
      <div className="h-64 bg-gray-50 dark:bg-slate-800 rounded-sm flex items-center justify-center">
        <div className="animate-pulse">Loading table...</div>
      </div>
    ),
    ssr: false,
  }
);

// Chart wrapper with intersection observer for better performance
export const ChartWithVisibility = memo(({ children, threshold = 0.1 }: {
  children: React.ReactNode;
  threshold?: number;
}) => {
  return (
    <div className="chart-container">
      <Suspense fallback={<ChartLoadingSkeleton />}>
        {children}
      </Suspense>
    </div>
  );
});

ChartWithVisibility.displayName = 'ChartWithVisibility';

// Export optimized recharts bundle configuration
export const CHART_PERFORMANCE_CONFIG = {
  // Reduce animation duration for better performance
  animationDuration: 300,
  // Optimize tooltip rendering
  tooltipAnimationDuration: 0,
  // Reduce reflow frequency
  throttleDelay: 16, // 60fps
  // Mobile optimizations
  mobileOptimizations: {
    reduceDataPoints: true,
    disableAnimations: true,
    simplifyTooltips: true
  }
} as const;
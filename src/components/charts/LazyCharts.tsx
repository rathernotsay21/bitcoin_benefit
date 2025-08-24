'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Chart Loading Fallback
const ChartLoadingFallback = () => (
  <Card className="p-8 flex items-center justify-center h-96">
    <div className="flex items-center space-x-2 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span>Loading chart...</span>
    </div>
  </Card>
);

// Lazy load the main vesting chart (only loaded on calculator pages)
export const LazyVestingTimelineChart = dynamic(
  () => import('@/components/VestingTimelineChartRecharts'),
  {
    loading: () => <ChartLoadingFallback />,
    ssr: false, // Don't render on server to reduce initial bundle
  }
);

// Lazy load the historical chart (only loaded on historical page)
export const LazyHistoricalChart = dynamic(
  () => import('@/components/HistoricalTimelineVisualizationOptimized'),
  {
    loading: () => <ChartLoadingFallback />,
    ssr: false,
  }
);

// Lazy load virtualized components
export const LazyVirtualizedAnnualBreakdown = dynamic(
  () => import('@/components/VirtualizedAnnualBreakdownOptimized'),
  {
    loading: () => <div className="h-64 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-sm" />,
    ssr: false,
  }
);

// Wrapper for suspense boundary
interface ChartSuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ChartSuspense: React.FC<ChartSuspenseProps> = ({ 
  children, 
  fallback = <ChartLoadingFallback /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};
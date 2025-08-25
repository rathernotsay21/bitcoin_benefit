'use client';

import React, { memo } from 'react';
import dynamic from 'next/dynamic';
import { useChartOptimized } from '@/hooks/useCalculatorOptimized';

// Lazy load the heavy chart component
const VestingTimelineChart = dynamic(
  () => import('@/components/VestingTimelineChartRecharts'),
  {
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);

// Chart skeleton for loading state
function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm p-6 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
      <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  );
}

// Props interface
interface MemoizedChartProps {
  scheme?: any;
  className?: string;
}

// Memoized chart wrapper with deep comparison
const MemoizedChart = memo(function MemoizedChart({ 
  scheme, 
  className 
}: MemoizedChartProps) {
  const { data, isLoading } = useChartOptimized();
  
  if (!data || data.length === 0) {
    return <ChartSkeleton />;
  }
  
  return (
    <div className={className}>
      {isLoading && (
        <div className="absolute top-4 right-4 z-10">
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-bitcoin"></div>
            Updating...
          </div>
        </div>
      )}
      <VestingTimelineChart 
        timeline={data}
        {...scheme}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for deep equality check
  return (
    prevProps.scheme?.id === nextProps.scheme?.id &&
    prevProps.className === nextProps.className
  );
});

export default MemoizedChart;
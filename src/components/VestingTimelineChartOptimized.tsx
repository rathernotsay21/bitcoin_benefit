'use client';

import React, { useState, useEffect, useMemo, useCallback, startTransition, useDeferredValue } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ChartSkeleton } from '@/components/loading/ChartSkeleton';
import VestingTimelineChartRecharts from './VestingTimelineChartRecharts';
import { VestingTimelinePoint } from '@/types/vesting';

interface VestingTimelineChartOptimizedProps {
  timeline: VestingTimelinePoint[];
  initialGrant: number;
  annualGrant?: number;
  projectedBitcoinGrowth: number;
  currentBitcoinPrice: number;
  schemeId?: string;
  customVestingEvents?: import('@/types/vesting').CustomVestingEvent[];
}

// Performance-optimized wrapper for the main chart component
function VestingTimelineChartOptimized(props: VestingTimelineChartOptimizedProps) {
  const [isChartReady, setIsChartReady] = useState(false);
  const [shouldRenderChart, setShouldRenderChart] = useState(false);
  
  // Defer expensive props to prevent blocking UI
  const deferredTimeline = useDeferredValue(props.timeline);
  const deferredCurrentBitcoinPrice = useDeferredValue(props.currentBitcoinPrice);
  
  // Memoize chart visibility check
  const isDataValid = useMemo(() => {
    return deferredTimeline && 
           deferredTimeline.length > 0 && 
           deferredCurrentBitcoinPrice > 0 &&
           props.initialGrant > 0;
  }, [deferredTimeline, deferredCurrentBitcoinPrice, props.initialGrant]);
  
  // Progressive loading with startTransition for non-blocking updates
  useEffect(() => {
    if (isDataValid) {
      // Use startTransition to mark state update as non-urgent
      startTransition(() => {
        setIsChartReady(true);
      });
      
      // Delay chart rendering to prevent blocking main thread
      const timer = setTimeout(() => {
        startTransition(() => {
          setShouldRenderChart(true);
        });
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isDataValid]);
  
  // Memoize optimized props to prevent unnecessary re-renders
  const optimizedProps = useMemo(() => ({
    ...props,
    timeline: deferredTimeline,
    currentBitcoinPrice: deferredCurrentBitcoinPrice
  }), [
    props,
    deferredTimeline,
    deferredCurrentBitcoinPrice
  ]);
  
  // Error boundary fallback component
  const ErrorFallback = useCallback((): JSX.Element => (
    <div className="w-full max-w-full overflow-hidden">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          10-Year Projection
        </h3>
      </div>
      <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border border-red-200 dark:border-red-700 rounded-2xl p-6 shadow-xl">
        <div className="text-center text-red-600 dark:text-red-400">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-lg font-semibold mb-2">Chart Loading Error</div>
          <div className="text-sm">Unable to load chart visualization. Please refresh the page.</div>
        </div>
      </div>
    </div>
  ), []);
  
  // Loading state with skeleton
  if (!isChartReady || !shouldRenderChart) {
    return (
      <ChartSkeleton 
        height={540}
        showLegend={true}
        showDetails={true}
        className="w-full max-w-full overflow-hidden"
      />
    );
  }
  
  // Render optimized chart with error boundary
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="w-full max-w-full overflow-hidden">
        <VestingTimelineChartRecharts {...optimizedProps} />
      </div>
    </ErrorBoundary>
  );
}

// Memoize the entire component to prevent unnecessary re-renders
export default React.memo(VestingTimelineChartOptimized, (prevProps, nextProps) => {
  // Custom comparison function for optimal performance
  return (
    prevProps.initialGrant === nextProps.initialGrant &&
    prevProps.annualGrant === nextProps.annualGrant &&
    prevProps.projectedBitcoinGrowth === nextProps.projectedBitcoinGrowth &&
    prevProps.currentBitcoinPrice === nextProps.currentBitcoinPrice &&
    prevProps.schemeId === nextProps.schemeId &&
    prevProps.timeline?.length === nextProps.timeline?.length &&
    prevProps.customVestingEvents?.length === nextProps.customVestingEvents?.length &&
    JSON.stringify(prevProps.customVestingEvents) === JSON.stringify(nextProps.customVestingEvents)
  );
});
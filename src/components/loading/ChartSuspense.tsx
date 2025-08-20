'use client';

import React, { Suspense, lazy, ComponentType } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ChartSkeleton, CompactChartSkeleton, HistoricalChartSkeleton } from './ChartSkeleton';

// Lazy load heavy chart components with better performance
export const LazyVestingTimelineChart = lazy(() => 
  import('@/components/VestingTimelineChartRecharts').then(module => ({
    default: module.default
  }))
);

export const LazyHistoricalTimelineVisualization = lazy(() => 
  import('@/components/HistoricalTimelineVisualizationOptimized').then(module => ({
    default: module.default
  }))
);

export const LazyVirtualizedAnnualBreakdown = lazy(() => 
  import('@/components/VirtualizedAnnualBreakdownOptimized').then(module => ({
    default: module.default
  }))
);

// Suspense wrapper with error boundaries
interface ChartSuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  skeletonType?: 'full' | 'compact' | 'historical';
  height?: number;
  className?: string;
}

export function ChartSuspenseWrapper({
  children,
  fallback,
  skeletonType = 'full',
  height,
  className
}: ChartSuspenseWrapperProps) {
  const defaultFallback = (() => {
    switch (skeletonType) {
      case 'compact':
        return <CompactChartSkeleton height={height} className={className} />;
      case 'historical':
        return <HistoricalChartSkeleton className={className} />;
      case 'full':
      default:
        return <ChartSkeleton height={height} className={className} />;
    }
  })();

  return (
    <ErrorBoundary>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// High-order component for lazy loading with optimized performance
export function withChartSuspense<P extends object>(
  WrappedComponent: ComponentType<P>,
  skeletonType: 'full' | 'compact' | 'historical' = 'full',
  height?: number
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const WithChartSuspenseComponent = (props: P) => {
    return (
      <ChartSuspenseWrapper 
        skeletonType={skeletonType} 
        height={height}
        className="w-full"
      >
        <WrappedComponent {...props} />
      </ChartSuspenseWrapper>
    );
  };
  
  WithChartSuspenseComponent.displayName = `withChartSuspense(${displayName})`;
  return WithChartSuspenseComponent;
}

// Optimized chart components with Suspense
export const VestingTimelineChartWithSuspense = withChartSuspense(
  LazyVestingTimelineChart, 
  'full', 
  540
);

export const HistoricalTimelineVisualizationWithSuspense = withChartSuspense(
  LazyHistoricalTimelineVisualization, 
  'historical'
);

export const VirtualizedAnnualBreakdownWithSuspense = withChartSuspense(
  LazyVirtualizedAnnualBreakdown, 
  'compact', 
  400
);

// Progressive loading hook for non-critical components
export function useProgressiveLoading(delay: number = 100) {
  const [isReady, setIsReady] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return isReady;
}

// Intersection observer hook for lazy loading on scroll
export function useIntersectionObserver(threshold: number = 0.1) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [hasBeenVisible, setHasBeenVisible] = React.useState(false);
  const targetRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyIntersecting = entry.isIntersecting;
        setIsIntersecting(isCurrentlyIntersecting);
        
        if (isCurrentlyIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true);
        }
      },
      { threshold }
    );
    
    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }
    
    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [threshold, hasBeenVisible]);
  
  return { targetRef, isIntersecting, hasBeenVisible };
}

// Lazy chart component with intersection observer
interface LazyChartProps {
  children: React.ReactNode;
  skeletonType?: 'full' | 'compact' | 'historical';
  height?: number;
  threshold?: number;
  className?: string;
}

export function LazyChart({
  children,
  skeletonType = 'full',
  height,
  threshold = 0.1,
  className
}: LazyChartProps) {
  const { targetRef, hasBeenVisible } = useIntersectionObserver(threshold);
  
  const fallback = (() => {
    switch (skeletonType) {
      case 'compact':
        return <CompactChartSkeleton height={height} className={className} />;
      case 'historical':
        return <HistoricalChartSkeleton className={className} />;
      case 'full':
      default:
        return <ChartSkeleton height={height} className={className} />;
    }
  })();
  
  return (
    <div ref={targetRef} className="w-full">
      {hasBeenVisible ? (
        <ChartSuspenseWrapper 
          skeletonType={skeletonType}
          height={height}
          className={className}
        >
          {children}
        </ChartSuspenseWrapper>
      ) : (
        fallback
      )}
    </div>
  );
}

export default ChartSuspenseWrapper;
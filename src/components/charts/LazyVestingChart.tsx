import dynamic from 'next/dynamic';
import { ChartSkeleton } from '@/components/loading/ChartSkeleton';

// Lazy load the main vesting chart with proper loading state
export const LazyVestingTimelineChart = dynamic(
  () => import('@/components/VestingTimelineChartRecharts').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);

// Lazy load the optimized chart version
export const LazyVestingTimelineChartOptimized = dynamic(
  () => import('@/components/VestingTimelineChartOptimized').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);

// Lazy load historical chart
export const LazyHistoricalTimelineChart = dynamic(
  () => import('@/components/HistoricalTimelineVisualizationOptimized').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);

// Export a wrapper that decides which chart to use based on data size
export function VestingChartWrapper({ data, ...props }: any) {
  // Use optimized version for large datasets
  const ChartComponent = data?.timeline?.length > 100 
    ? LazyVestingTimelineChartOptimized 
    : LazyVestingTimelineChart;
    
  return <ChartComponent data={data} {...props} />;
}
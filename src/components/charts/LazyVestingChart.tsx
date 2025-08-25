import dynamic from 'next/dynamic';
import { ChartSkeleton } from '@/components/loading/ChartSkeleton';

// Lazy load the main vesting chart with proper loading state
export const LazyVestingTimelineChart = dynamic(
  () => import('@/components/VestingTimelineChartRecharts'),
  {
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);

// Lazy load historical chart
export const LazyHistoricalTimelineChart = dynamic(
  () => import('@/components/HistoricalTimelineVisualizationOptimized'),
  {
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);

// Export a wrapper that uses the main chart component
export function VestingChartWrapper({ data, ...props }: any) {
  return <LazyVestingTimelineChart data={data} {...props} />;
}
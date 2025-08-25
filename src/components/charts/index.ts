import dynamic from 'next/dynamic';

// Dynamically import chart components to reduce initial bundle size
export const VestingTimelineChartRecharts = dynamic(
  () => import('../VestingTimelineChartRecharts'),
  { ssr: false }
);

export const HistoricalTimelineVisualization = dynamic(
  () => import('../HistoricalTimelineVisualizationOptimized'),
  { ssr: false }
);

export const VirtualizedAnnualBreakdown = dynamic(
  () => import('../VirtualizedAnnualBreakdownOptimized'),
  { ssr: false }
);
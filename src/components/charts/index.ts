import dynamic from 'next/dynamic';

// Dynamically import chart components to reduce initial bundle size
export const VestingTimelineChart = dynamic(
  () => import('../VestingTimelineChart'),
  { ssr: false }
);

export const VestingTimelineChartRecharts = dynamic(
  () => import('../VestingTimelineChartRecharts'),
  { ssr: false }
);

export const HistoricalTimelineChart = dynamic(
  () => import('../HistoricalTimelineChart'),
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
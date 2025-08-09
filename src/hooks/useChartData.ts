/**
 * Custom hook for memoizing chart data transformations
 * Optimizes performance by preventing unnecessary recalculations
 */

import { useMemo } from 'react';
import { VestingTimelinePoint } from '@/types/vesting';
import {
  processYearlyData,
  calculateMetrics,
  generateMilestones,
  formatForRecharts,
  calculateCumulativeStats,
  generateComparisonData,
  YearlyData,
  ChartMetrics,
  ChartMilestone
} from '@/lib/utils/chart-data';

export interface ChartDataResult {
  yearlyData: YearlyData[];
  metrics: ChartMetrics;
  milestones: ChartMilestone[];
  rechartsData: ReturnType<typeof formatForRecharts>;
  cumulativeStats: ReturnType<typeof calculateCumulativeStats>;
}

/**
 * Hook that memoizes the transformation of raw timeline data into chart-ready formats
 * Prevents expensive recalculations when timeline hasn't changed
 */
export function useChartData(timeline: VestingTimelinePoint[]): ChartDataResult {
  return useMemo(() => {
    // Process all chart data transformations
    const yearlyData = processYearlyData(timeline);
    const metrics = calculateMetrics(timeline);
    const milestones = generateMilestones(timeline);
    const rechartsData = formatForRecharts(timeline);
    const cumulativeStats = calculateCumulativeStats(timeline);
    
    return {
      yearlyData,
      metrics,
      milestones,
      rechartsData,
      cumulativeStats
    };
  }, [timeline]);
}

/**
 * Hook for comparing multiple vesting schemes
 * Memoizes comparison data generation
 */
export function useComparisonChartData(
  timelines: Record<string, VestingTimelinePoint[]>
) {
  return useMemo(() => {
    const comparisonData = generateComparisonData(timelines);
    
    // Calculate metrics for each scheme
    const schemeMetrics: Record<string, ChartMetrics> = {};
    Object.entries(timelines).forEach(([scheme, timeline]) => {
      schemeMetrics[scheme] = calculateMetrics(timeline);
    });
    
    return {
      comparisonData,
      schemeMetrics
    };
  }, [timelines]);
}

/**
 * Hook for specific chart types with tailored data formats
 */
export function useAreaChartData(timeline: VestingTimelinePoint[]) {
  return useMemo(() => {
    return timeline.map(point => ({
      name: `M${point.month}`,
      vested: point.vestedAmount,
      unvested: point.totalBalance - point.vestedAmount,
      total: point.totalBalance,
      price: point.bitcoinPrice,
      value: point.usdValue
    }));
  }, [timeline]);
}

export function useLineChartData(timeline: VestingTimelinePoint[]) {
  return useMemo(() => {
    return timeline.map(point => ({
      x: point.month,
      balance: point.totalBalance,
      value: point.usdValue,
      price: point.bitcoinPrice
    }));
  }, [timeline]);
}

export function useBarChartData(timeline: VestingTimelinePoint[]) {
  return useMemo(() => {
    const yearlyData = processYearlyData(timeline);
    return yearlyData.map(year => ({
      year: `Year ${year.year}`,
      bitcoin: year.totalBalance,
      vested: year.vestedAmount,
      value: year.usdValue
    }));
  }, [timeline]);
}

/**
 * Hook for progress indicators and gauges
 */
export function useProgressData(timeline: VestingTimelinePoint[]) {
  return useMemo(() => {
    if (!timeline || timeline.length === 0) {
      return {
        vestingProgress: 0,
        timeProgress: 0,
        valueGrowth: 0,
        currentMonth: 0,
        totalMonths: 0
      };
    }
    
    const lastPoint = timeline[timeline.length - 1];
    const totalMonths = timeline.length;
    const currentMonth = lastPoint.month;
    
    const vestingProgress = lastPoint.totalBalance > 0
      ? (lastPoint.vestedAmount / lastPoint.totalBalance) * 100
      : 0;
    
    const timeProgress = totalMonths > 0
      ? (currentMonth / totalMonths) * 100
      : 0;
    
    const initialValue = timeline[0].usdValue;
    const valueGrowth = initialValue > 0
      ? ((lastPoint.usdValue - initialValue) / initialValue) * 100
      : 0;
    
    return {
      vestingProgress,
      timeProgress,
      valueGrowth,
      currentMonth,
      totalMonths
    };
  }, [timeline]);
}

/**
 * Hook for sparkline and mini chart data
 */
export function useSparklineData(
  timeline: VestingTimelinePoint[],
  dataKey: 'totalBalance' | 'vestedAmount' | 'usdValue' | 'bitcoinPrice' = 'usdValue'
) {
  return useMemo(() => {
    // Sample data points for sparklines (every 3rd month for performance)
    const sampledData = timeline.filter((_, index) => index % 3 === 0);
    return sampledData.map(point => point[dataKey]);
  }, [timeline, dataKey]);
}

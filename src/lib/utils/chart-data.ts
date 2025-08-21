/**
 * Chart data processing utilities
 * Functions for transforming raw calculation data into chart-ready formats
 */

import { VestingTimelinePoint } from '@/types/vesting';

export interface YearlyData {
  year: number;
  totalBalance: number;
  vestedAmount: number;
  usdValue: number;
  bitcoinPrice: number;
  monthlyData: VestingTimelinePoint[];
}

export interface ChartMetrics {
  totalBitcoin: number;
  totalVested: number;
  totalUSDValue: number;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  vestingProgress: number; // percentage
}

export interface ChartMilestone {
  month: number;
  year: number;
  label: string;
  value: number;
  type: 'vesting' | 'bonus' | 'grant';
}

/**
 * Process timeline data into yearly aggregates for charts
 */
export function processYearlyData(timeline: VestingTimelinePoint[]): YearlyData[] {
  if (!timeline || timeline.length === 0) return [];
  
  const yearlyMap = new Map<number, VestingTimelinePoint[]>();
  
  // Group timeline points by year
  timeline.forEach(point => {
    const year = Math.floor(point.month / 12) + 1;
    if (!yearlyMap.has(year)) {
      yearlyMap.set(year, []);
    }
    yearlyMap.get(year)!.push(point);
  });
  
  // Convert to yearly data format
  const yearlyData: YearlyData[] = [];
  yearlyMap.forEach((monthlyData, year) => {
    const lastMonth = monthlyData[monthlyData.length - 1];
    if (lastMonth) {
      yearlyData.push({
        year,
        totalBalance: lastMonth.totalBalance,
        vestedAmount: lastMonth.vestedAmount,
        usdValue: lastMonth.usdValue,
        bitcoinPrice: lastMonth.bitcoinPrice,
        monthlyData
      });
    }
  });
  
  return yearlyData.sort((a, b) => a.year - b.year);
}

/**
 * Calculate key metrics from timeline data
 */
export function calculateMetrics(timeline: VestingTimelinePoint[]): ChartMetrics {
  if (!timeline || timeline.length === 0) {
    return {
      totalBitcoin: 0,
      totalVested: 0,
      totalUSDValue: 0,
      averagePrice: 0,
      priceRange: { min: 0, max: 0 },
      vestingProgress: 0
    };
  }
  
  const lastPoint = timeline[timeline.length - 1];
  const prices = timeline.map(p => p.bitcoinPrice);
  const totalPrice = prices.reduce((sum, price) => sum + price, 0);
  
  return {
    totalBitcoin: lastPoint?.totalBalance ?? 0,
    totalVested: lastPoint?.vestedAmount ?? 0,
    totalUSDValue: lastPoint?.usdValue ?? 0,
    averagePrice: totalPrice / prices.length,
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices)
    },
    vestingProgress: (lastPoint?.totalBalance ?? 0) > 0 
      ? ((lastPoint?.vestedAmount ?? 0) / (lastPoint?.totalBalance ?? 1)) * 100 
      : 0
  };
}

/**
 * Generate milestone markers for the timeline
 */
export function generateMilestones(timeline: VestingTimelinePoint[]): ChartMilestone[] {
  if (!timeline || timeline.length === 0) return [];
  
  const milestones: ChartMilestone[] = [];
  
  // Add vesting milestones (25%, 50%, 75%, 100% vested)
  const vestingTargets = [0.25, 0.5, 0.75, 1.0];
  let currentTargetIndex = 0;
  
  for (let i = 0; i < timeline.length && currentTargetIndex < vestingTargets.length; i++) {
    const point = timeline[i];
    if (!point) continue;
    
    const vestingRatio = point.totalBalance > 0 
      ? point.vestedAmount / point.totalBalance 
      : 0;
    
    if (vestingRatio >= vestingTargets[currentTargetIndex]) {
      milestones.push({
        month: point.month,
        year: Math.floor(point.month / 12) + 1,
        label: `${vestingTargets[currentTargetIndex] * 100}% Vested`,
        value: point.vestedAmount,
        type: 'vesting'
      });
      currentTargetIndex++;
    }
  }
  
  // Add significant balance changes (e.g., annual grants)
  for (let i = 1; i < timeline.length; i++) {
    const prevBalance = timeline[i - 1].totalBalance;
    const currentBalance = timeline[i].totalBalance;
    const change = currentBalance - prevBalance;
    
    // If balance increased by more than 10% (likely a grant or bonus)
    if (prevBalance > 0 && change / prevBalance > 0.1) {
      milestones.push({
        month: timeline[i].month,
        year: Math.floor(timeline[i].month / 12) + 1,
        label: 'Grant/Bonus',
        value: change,
        type: timeline[i].month % 12 === 0 ? 'grant' : 'bonus'
      });
    }
  }
  
  return milestones.sort((a, b) => a.month - b.month);
}

/**
 * Format timeline data for specific chart libraries
 */
export function formatForRecharts(timeline: VestingTimelinePoint[]) {
  return timeline.map(point => ({
    month: `Month ${point.month}`,
    totalBalance: point.totalBalance,
    vestedAmount: point.vestedAmount,
    usdValue: point.usdValue,
    bitcoinPrice: point.bitcoinPrice,
    unvested: point.totalBalance - point.vestedAmount
  }));
}

/**
 * Calculate cumulative statistics over time
 */
export function calculateCumulativeStats(timeline: VestingTimelinePoint[]) {
  let cumulativeStats: Array<{
    month: number;
    cumulativeVested: number;
    cumulativeValue: number;
    growthRate: number;
  }> = [];
  
  let previousValue = 0;
  
  timeline.forEach((point, _index) => {
    const growthRate = previousValue > 0 
      ? ((point.usdValue - previousValue) / previousValue) * 100 
      : 0;
    
    cumulativeStats.push({
      month: point.month,
      cumulativeVested: point.vestedAmount,
      cumulativeValue: point.usdValue,
      growthRate
    });
    
    previousValue = point.usdValue;
  });
  
  return cumulativeStats;
}

/**
 * Generate comparison data for multiple schemes
 */
export function generateComparisonData(
  timelines: Record<string, VestingTimelinePoint[]>
): Array<{
  month: number;
  [key: string]: number;
}> {
  const maxLength = Math.max(
    ...Object.values(timelines).map(t => t.length)
  );
  
  const comparisonData = [];
  
  for (let i = 0; i < maxLength; i++) {
    const dataPoint: any = { month: i };
    
    Object.entries(timelines).forEach(([scheme, timeline]) => {
      const timelinePoint = timeline[i];
      if (timelinePoint) {
        dataPoint[`${scheme}_balance`] = timelinePoint.totalBalance;
        dataPoint[`${scheme}_vested`] = timelinePoint.vestedAmount;
        dataPoint[`${scheme}_value`] = timelinePoint.usdValue;
      }
    });
    
    comparisonData.push(dataPoint);
  }
  
  return comparisonData;
}

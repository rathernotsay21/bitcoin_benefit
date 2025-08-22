'use client';

import { useMemo, useCallback } from 'react';
import type { VestingTimelinePoint } from '@/types/vesting';

// Data processing hooks for the vesting chart
export const useProcessedChartData = (
  timeline: VestingTimelinePoint[],
  currentBitcoinPrice: number,
  projectedBitcoinGrowth: number,
  initialGrant: number,
  annualGrant?: number,
  customVestingEvents?: any[]
) => {
  // Defer expensive calculations
  const deferredTimeline = useMemo(() => timeline, [timeline]);
  const deferredBitcoinPrice = useMemo(() => currentBitcoinPrice, [currentBitcoinPrice]);

  // Sort custom vesting events
  const sortedEvents = useMemo(() => {
    if (!customVestingEvents?.length) return null;
    return [...customVestingEvents].sort((a, b) => a.timePeriod - b.timePeriod);
  }, [customVestingEvents]);

  // Calculate vesting percentage based on timeline
  const getVestingPercentage = useCallback((months: number): number => {
    if (!sortedEvents) {
      // Fallback to default vesting schedule
      return months >= 120 ? 100 : months >= 60 ? 50 : 0;
    }
    
    // Find the highest vesting percentage that has been reached
    for (let i = sortedEvents.length - 1; i >= 0; i--) {
      if (months >= sortedEvents[i].timePeriod) {
        return sortedEvents[i].percentageVested;
      }
    }
    return 0;
  }, [sortedEvents]);

  // Calculate monthly growth rate
  const monthlyGrowthRate = useMemo(() => {
    return projectedBitcoinGrowth > 0 ? projectedBitcoinGrowth / 100 / 12 : 0;
  }, [projectedBitcoinGrowth]);

  // Extend timeline to 10 years
  const extendedTimeline = useMemo(() => {
    if (!deferredTimeline?.length) return [];
    
    const maxMonth = deferredTimeline[deferredTimeline.length - 1]?.month || 0;
    const targetMonths = 120; // 10 years

    if (maxMonth >= targetMonths) {
      return deferredTimeline.slice(0, targetMonths + 1);
    }
    
    const extended = [...deferredTimeline];
    const lastPoint = deferredTimeline[deferredTimeline.length - 1];
    if (!lastPoint) return extended;

    for (let month = maxMonth + 1; month <= targetMonths; month++) {
      const bitcoinPrice = deferredBitcoinPrice * (1 + monthlyGrowthRate) ** month;
      const employerBalance = lastPoint.employerBalance || 0;

      extended.push({
        month,
        employeeBalance: lastPoint.employeeBalance,
        employerBalance,
        vestedAmount: lastPoint.vestedAmount,
        totalBalance: lastPoint.totalBalance,
        bitcoinPrice,
        usdValue: employerBalance * bitcoinPrice,
      });
    }
    return extended;
  }, [deferredTimeline, monthlyGrowthRate, deferredBitcoinPrice]);

  // Grant rules based on scheme
  const grantRules = useMemo(() => {
    const hasAnnualGrants = annualGrant && annualGrant > 0;
    const maxYears = hasAnnualGrants ? 5 : 1;
    return { hasAnnualGrants, maxYears };
  }, [annualGrant]);

  // Process yearly data for the chart
  const yearlyData = useMemo(() => {
    if (!extendedTimeline?.length) return [];
    
    const yearlyPoints: Array<{
      year: number;
      btcBalance: number;
      usdValue: number;
      bitcoinPrice: number;
      vestedAmount: number;
      vestingPercent: number;
      grantSize: number;
      grantCost: number;
      isInitialGrant: boolean;
    }> = [];
    
    for (let year = 0; year <= 10; year++) {
      const pointIndex = year * 12;
      const point = extendedTimeline[pointIndex];
      if (!point) continue;
      
      let grantSize = 0;
      let grantCost = 0;
      const isInitialGrant = year === 0;
      
      if (isInitialGrant && initialGrant > 0) {
        grantSize = initialGrant;
        grantCost = initialGrant * deferredBitcoinPrice;
      } else if (annualGrant && year > 0 && year <= grantRules.maxYears && grantRules.hasAnnualGrants) {
        grantSize = annualGrant;
        grantCost = annualGrant * deferredBitcoinPrice;
      }
      
      const btcBalance = Math.max(0, point.employerBalance || 0);
      const bitcoinPrice = Math.max(deferredBitcoinPrice, point.bitcoinPrice || deferredBitcoinPrice);
      const vestingPercent = getVestingPercentage(year * 12);
      
      yearlyPoints.push({
        year,
        btcBalance,
        usdValue: btcBalance * bitcoinPrice,
        bitcoinPrice,
        vestedAmount: point.vestedAmount || 0,
        vestingPercent,
        grantSize,
        grantCost,
        isInitialGrant
      });
    }
    
    return yearlyPoints;
  }, [extendedTimeline, initialGrant, annualGrant, deferredBitcoinPrice, getVestingPercentage, grantRules]);

  // Calculate cost basis for ROI
  const costBasis = useMemo(() => {
    let totalCost = 0;
    
    if (initialGrant > 0) {
      totalCost += initialGrant * deferredBitcoinPrice;
    }
    
    if (annualGrant && annualGrant > 0) {
      const numYears = Math.min(5, yearlyData.length - 1);
      totalCost += annualGrant * deferredBitcoinPrice * numYears;
    }
    
    return totalCost;
  }, [initialGrant, annualGrant, deferredBitcoinPrice, yearlyData]);

  // Calculate chart metrics
  const chartMetrics = useMemo(() => {
    const currentYear = 0;
    const finalYear = 10;
    
    const growthMultiple = yearlyData.length > finalYear && costBasis > 0
      ? yearlyData[finalYear].usdValue / costBasis
      : 0;

    const maxUsdValue = Math.max(...yearlyData.map(d => d.usdValue || 0));
    const minUsdValue = 0;
    
    return {
      currentYear,
      finalYear,
      growthMultiple,
      maxUsdValue,
      minUsdValue,
      costBasis
    };
  }, [yearlyData, costBasis]);

  // Calculate USD domain and ticks for Y-axis
  const { usdDomain, usdTicks } = useMemo(() => {
    const maxValue = chartMetrics.maxUsdValue;
    const calculateNiceScale = (max: number) => {
      if (max <= 0) return { domain: [0, 100000], ticks: [0, 25000, 50000, 75000, 100000] };
      
      const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
      const normalized = max / magnitude;
      
      let step;
      if (normalized <= 1) step = 0.2;
      else if (normalized <= 2) step = 0.5;
      else if (normalized <= 5) step = 1;
      else step = 2;
      
      const stepSize = step * magnitude;
      const maxDomain = Math.ceil(max / stepSize) * stepSize;
      
      const ticks = [];
      for (let i = 0; i <= maxDomain; i += stepSize) {
        ticks.push(i);
      }
      
      if (ticks.length > 6) {
        const reducedTicks = [];
        const skipFactor = Math.ceil(ticks.length / 5);
        for (let i = 0; i < ticks.length; i += skipFactor) {
          reducedTicks.push(ticks[i]);
        }
        if (reducedTicks[reducedTicks.length - 1] !== maxDomain) {
          reducedTicks.push(maxDomain);
        }
        return { domain: [0, maxDomain], ticks: reducedTicks };
      }
      
      return { domain: [0, maxDomain], ticks };
    };
    
    return calculateNiceScale(maxValue);
  }, [chartMetrics.maxUsdValue]);

  // Vesting milestone years
  const vestingMilestoneYears = useMemo(() => {
    return sortedEvents?.map(event => Math.floor(event.timePeriod / 12)) || [5, 10];
  }, [sortedEvents]);

  return {
    yearlyData,
    costBasis,
    chartMetrics,
    usdDomain,
    usdTicks,
    vestingMilestoneYears,
    getVestingPercentage,
    extendedTimeline
  };
};

// Formatters with memoization
export const useChartFormatters = () => {
  const formatUSD = useCallback((value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  }, []);

  const formatUSDCompact = useCallback((value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 100000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else if (value >= 10000) {
      return `$${(value / 1000).toFixed(1)}K`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  }, []);

  const formatBTC = useCallback((value: number): string => {
    if (value === 0) return '0 BTC';
    if (value < 0.00001) return '<0.00001 BTC';
    if (value < 0.001) return `${value.toFixed(6)} BTC`;
    if (value < 1) return `${value.toFixed(4)} BTC`;
    return `${value.toFixed(2)} BTC`;
  }, []);

  return {
    formatUSD,
    formatUSDCompact,
    formatBTC
  };
};
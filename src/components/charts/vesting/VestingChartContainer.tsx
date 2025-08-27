'use client';

import React, { useState, useEffect, useCallback, useMemo, startTransition } from 'react';
import { VestingChartCore } from './VestingChartCore';
import { useProcessedChartData } from './VestingChartData';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { selectChartData, selectSelectedScheme, shallow } from '@/stores/selectors';
import type { VestingTimelinePoint } from '@/types/vesting';

interface VestingChartContainerProps {
  timeline: VestingTimelinePoint[];
  initialGrant: number;
  annualGrant?: number;
  projectedBitcoinGrowth: number;
  currentBitcoinPrice: number;
  schemeId?: string;
  customVestingEvents?: any[];
}

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Memoized chart configuration
const getMobileChartConfig = (isMobile: boolean) => ({
  height: isMobile ? 300 : 400,
  margin: isMobile 
    ? { top: 10, right: 10, bottom: 30, left: 10 }
    : { top: 20, right: 30, bottom: 40, left: 60 }
});

export const VestingChartContainer: React.FC<VestingChartContainerProps> = ({
  timeline,
  initialGrant,
  annualGrant,
  projectedBitcoinGrowth,
  currentBitcoinPrice,
  schemeId = 'Vesting',
  customVestingEvents
}) => {
  // Use optimized selectors from Zustand store
  const chartData = useCalculatorStore(selectChartData, shallow);
  const selectedScheme = useCalculatorStore(selectSelectedScheme);
  
  // Local state for UI interactions
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const isMobile = useIsMobile();

  // Process chart data with memoization
  const {
    yearlyData,
    usdDomain,
    usdTicks,
    vestingMilestoneYears
  } = useProcessedChartData(
    timeline,
    currentBitcoinPrice,
    projectedBitcoinGrowth,
    initialGrant,
    annualGrant,
    customVestingEvents
  );

  // Memoized chart config
  const chartConfig = useMemo(() => getMobileChartConfig(isMobile), [isMobile]);

  // Optimized event handlers with useCallback
  const handleMouseMove = useCallback((e: any) => {
    if (e && e.activeLabel !== undefined) {
      // Use startTransition for non-urgent updates
      startTransition(() => {
        setHoveredYear(e.activeLabel);
      });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    startTransition(() => {
      setHoveredYear(null);
    });
  }, []);

  // Early return if no data
  if (!yearlyData || yearlyData.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-sm">
        <p className="text-gray-500 dark:text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <VestingChartCore
        data={yearlyData}
        usdDomain={usdDomain as [number, number]}
        usdTicks={usdTicks}
        vestingMilestoneYears={vestingMilestoneYears}
        chartConfig={chartConfig}
        schemeId={schemeId || selectedScheme?.id || 'Vesting'}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        hoveredYear={hoveredYear}
      />
    </div>
  );
};

export default VestingChartContainer;
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Lazy load the full chart component
const VestingTimelineChartRecharts = dynamic(
  () => import('../VestingTimelineChartRecharts'),
  {
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);

// Skeleton component for initial render
export const ChartSkeleton = () => (
  <div className="w-full h-[400px] animate-pulse">
    <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-sm flex items-center justify-center">
      <div className="text-gray-400 dark:text-gray-600">
        <svg className="w-12 h-12 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="mt-2 text-sm">Loading chart...</p>
      </div>
    </div>
  </div>
);

// Basic chart for quick render
const BasicChart = ({ data, schemeId }: { data: any[]; schemeId: string }) => (
  <div className="w-full h-[400px] bg-white dark:bg-gray-900 rounded-sm p-4">
    <div className="h-full flex items-end justify-between space-x-1">
      {data.map((point, index) => {
        const maxValue = Math.max(...data.map(d => d.totalValueUSD || 0));
        const height = ((point.totalValueUSD || 0) / maxValue) * 100;
        
        return (
          <div
            key={index}
            className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 dark:from-blue-600 dark:to-blue-400 rounded-t transition-all duration-300"
            style={{ height: `${height}%` }}
            title={`Month ${point.month}: $${point.totalValueUSD?.toLocaleString() || 0}`}
          />
        );
      })}
    </div>
    <div className="mt-2 text-center text-sm text-gray-500 dark:text-gray-600">
      {schemeId} Vesting Timeline (Simplified View)
    </div>
  </div>
);

interface ChartProgressiveLoaderProps {
  data: any[];
  schemeId: string;
  currentBitcoinPrice: number;
  projectedBitcoinGrowth: number;
  initialGrant?: number;
  annualGrant?: number;
  className?: string;
}

export const ChartProgressiveLoader: React.FC<ChartProgressiveLoaderProps> = ({
  data,
  schemeId,
  currentBitcoinPrice,
  projectedBitcoinGrowth,
  initialGrant = 0,
  annualGrant = 0,
  className = ''
}) => {
  const [phase, setPhase] = useState<'skeleton' | 'basic' | 'full'>('skeleton');
  const [isVisible, setIsVisible] = useState(false);

  // Optimize data processing with memoization
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (phase === 'basic') {
      // For basic view, sample every 12th data point for performance
      return data.filter((_, index) => index % 12 === 0);
    }
    
    return data;
  }, [data, phase]);

  // Progressive loading phases
  useEffect(() => {
    if (!data || data.length === 0) return undefined;

    // Phase 1: Show skeleton immediately (0ms)
    const timer1 = setTimeout(() => {
      // Phase 2: Show basic chart (50ms)
      setPhase('basic');
    }, 50);

    const timer2 = setTimeout(() => {
      // Phase 3: Show full chart (200ms)
      setPhase('full');
      setIsVisible(true);
    }, 200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [data]);

  // Intersection observer for lazy loading when scrolled into view
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && phase === 'skeleton') {
            setPhase('basic');
            setTimeout(() => {
              setPhase('full');
              setIsVisible(true);
            }, 150);
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('chart-progressive-container');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [phase]);

  return (
    <div id="chart-progressive-container" className={className}>
      {phase === 'skeleton' && <ChartSkeleton />}
      {phase === 'basic' && (
        <BasicChart data={chartData} schemeId={schemeId} />
      )}
      {phase === 'full' && isVisible && (
        <VestingTimelineChartRecharts
          timeline={chartData}
          schemeId={schemeId}
          currentBitcoinPrice={currentBitcoinPrice}
          projectedBitcoinGrowth={projectedBitcoinGrowth}
          initialGrant={initialGrant}
          annualGrant={annualGrant}
        />
      )}
    </div>
  );
};

export default ChartProgressiveLoader;
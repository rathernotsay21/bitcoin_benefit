'use client';

import React, { memo, useMemo, useCallback, useState, useEffect, lazy, Suspense } from 'react';
import { ChartConfig } from '@/components/ui/chart';
import { ChartSkeleton } from '@/components/ChartSkeleton';
import type { VestingEvent, CalculatorInputs, ProjectionData, Grant } from '@/types/vesting';

// Lazy load recharts components for better code splitting
const LazyChartContainer = lazy(() => 
  import('@/components/ui/chart').then(module => ({ default: module.ChartContainer }))
);
const LazyChartTooltipContent = lazy(() => 
  import('@/components/ui/chart').then(module => ({ default: module.ChartTooltipContent }))
);

// Lazy load all recharts components individually
const LazyLineChart = lazy(() => 
  import('recharts').then(module => ({ default: module.LineChart }))
);
const LazyLine = lazy(() => 
  import('recharts').then(module => ({ default: module.Line }))
);
const LazyXAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.XAxis }))
);
const LazyYAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.YAxis }))
);
const LazyCartesianGrid = lazy(() => 
  import('recharts').then(module => ({ default: module.CartesianGrid }))
);
const LazyTooltip = lazy(() => 
  import('recharts').then(module => ({ default: module.Tooltip }))
);
const LazyResponsiveContainer = lazy(() => 
  import('recharts').then(module => ({ default: module.ResponsiveContainer }))
);
const LazyLegend = lazy(() => 
  import('recharts').then(module => ({ default: module.Legend }))
);
const LazyReferenceLine = lazy(() => 
  import('recharts').then(module => ({ default: module.ReferenceLine }))
);
const LazyDot = lazy(() => 
  import('recharts').then(module => ({ default: module.Dot }))
);
const LazyReferenceArea = lazy(() => 
  import('recharts').then(module => ({ default: module.ReferenceArea }))
);

interface VestingTimelineChartProps {
  projectionData: ProjectionData | null;
  timeline: VestingEvent[];
  bitcoinPrice: number;
  projectedBitcoinGrowth: number;
  schemeId: 'pioneer' | 'stacker' | 'builder';
  grants: Grant[];
}

// Memoized formatting functions
const formatBTC = (value: number) => {
  return `${value.toFixed(8)} BTC`;
};

const formatUSD = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatUSDCompact = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return formatUSD(value);
};

// Memoized tooltip component
const CustomTooltip = memo(({ 
  active, 
  payload, 
  label, 
  yearlyData,
  hoveredYear,
  vestingMilestoneYears,
  grantRules,
  extendedTimeline,
  formatBTC,
  formatUSD
}: any) => {
  // Calculate YoY growth before any early returns
  const year = label;
  const yearData = yearlyData?.[year];
  
  const yoyGrowth = useMemo(() => {
    if (!yearData) return null;
    if (year > 0 && yearlyData[year - 1]?.usdValue > 0) {
      return ((yearData.usdValue - yearlyData[year - 1].usdValue) / yearlyData[year - 1].usdValue) * 100;
    }
    return null;
  }, [year, yearData, yearlyData]);

  // Early returns after hooks
  if (!active || !payload || !payload.length) return null;
  if (!yearData) return null;

  const relevantEvents = extendedTimeline.filter((e: VestingEvent) => 
    Math.floor(e.month / 12) === year
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[250px]">
      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Year {year}
      </p>
      
      <div className="space-y-1 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">BTC Accumulated:</span>
          <span className="font-mono text-gray-900 dark:text-gray-100">
            {formatBTC(yearData.btcAccumulated)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">USD Value:</span>
          <span className="font-mono text-gray-900 dark:text-gray-100">
            {formatUSD(yearData.usdValue)}
          </span>
        </div>
        
        {yoyGrowth !== null && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">YoY Growth:</span>
            <span className={`font-mono ${yoyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {yoyGrowth >= 0 ? '+' : ''}{yoyGrowth.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {relevantEvents.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Vesting Events:
          </p>
          {relevantEvents.map((event: VestingEvent, idx: number) => (
            <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">
              Month {event.month}: {formatBTC(event.btcAmount)}
            </div>
          ))}
        </div>
      )}

      {grantRules[year] && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            New Grant: {formatBTC(grantRules[year])}
          </p>
        </div>
      )}
    </div>
  );
});
CustomTooltip.displayName = 'CustomTooltip';

// Memoized grant dot component
const CustomGrantDot = memo((props: any) => {
  const { cx, cy, payload } = props;
  
  if (!payload.isGrantYear) return null;
  
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#f59e0b"
        stroke="#fff"
        strokeWidth={2}
      />
      <circle
        cx={cx}
        cy={cy}
        r={3}
        fill="#fff"
      />
    </g>
  );
});
CustomGrantDot.displayName = 'CustomGrantDot';

// Memoized legend component
const CustomLegend = memo(({ payload }: any) => {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
});
CustomLegend.displayName = 'CustomLegend';

// Main optimized chart component
const VestingTimelineChartRechartsOptimized = memo(({
  projectionData,
  timeline,
  bitcoinPrice,
  projectedBitcoinGrowth,
  schemeId,
  grants = []
}: VestingTimelineChartProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  // Memoize timeline processing
  const deferredTimeline = useMemo(() => timeline, [timeline]);
  const deferredBitcoinPrice = useMemo(() => bitcoinPrice, [bitcoinPrice]);

  // Check for mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Memoize sorted events
  const sortedEvents = useMemo(() => 
    [...deferredTimeline].sort((a, b) => a.month - b.month),
    [deferredTimeline]
  );

  // Memoize vesting percentage calculation
  const getVestingPercentage = useCallback((year: number) => {
    if (schemeId === 'pioneer') {
      if (year === 0) return 25;
      if (year === 1) return 25;
      if (year === 2) return 25;
      if (year === 3) return 25;
      return 0;
    } else if (schemeId === 'stacker') {
      return year < 4 ? 25 : 0;
    } else {
      return year < 4 ? 25 : 0;
    }
  }, [schemeId]);

  // Memoize vesting milestone years
  const vestingMilestoneYears = useMemo(() => {
    const years: number[] = [];
    for (let year = 0; year < 20; year++) {
      if (getVestingPercentage(year) > 0) {
        years.push(year);
      }
    }
    return years;
  }, [getVestingPercentage]);

  // Memoize growth calculations
  const monthlyGrowthRate = useMemo(() => 
    Math.pow(1 + projectedBitcoinGrowth / 100, 1 / 12) - 1,
    [projectedBitcoinGrowth]
  );

  // Memoize extended timeline
  const extendedTimeline = useMemo(() => {
    const extended = [...sortedEvents];
    let lastMonth = sortedEvents.length > 0 ? sortedEvents[sortedEvents.length - 1].month : -1;
    
    for (let year = 5; year < 20; year++) {
      const monthsInYear = year === 5 ? Math.max(0, 60 - lastMonth - 1) : 12;
      const startMonth = year === 5 ? lastMonth + 1 : (year - 1) * 12;
      
      for (let m = 0; m < monthsInYear; m++) {
        const month = startMonth + m;
        if (month >= 240) break;
        
        extended.push({
          month,
          btcAmount: 0,
          vestingPercentage: 0,
          type: 'projected' as const,
          description: `Year ${Math.floor(month / 12) + 1} projection`
        });
      }
    }
    
    return extended;
  }, [sortedEvents]);

  // Memoize grant rules
  const grantRules = useMemo(() => {
    const rules: Record<number, number> = {};
    
    grants.forEach(grant => {
      const grantYear = grant.year || 0;
      rules[grantYear] = (rules[grantYear] || 0) + grant.btcAmount;
    });
    
    if (grants.length > 0 && grants[0].isAnnual) {
      const annualAmount = grants[0].btcAmount;
      for (let year = 1; year < 20; year++) {
        if (!rules[year]) {
          rules[year] = annualAmount;
        }
      }
    }
    
    return rules;
  }, [grants]);

  // Memoize yearly data calculation
  const yearlyData = useMemo(() => {
    const data: any[] = [];
    let cumulativeBTC = 0;
    let lastYearBTC = 0;
    
    for (let year = 0; year < 20; year++) {
      const yearEvents = extendedTimeline.filter(e => 
        Math.floor(e.month / 12) === year
      );
      
      const yearBTC = yearEvents.reduce((sum, e) => sum + e.btcAmount, 0);
      const grantBTC = grantRules[year] || 0;
      const totalYearBTC = yearBTC + grantBTC;
      
      cumulativeBTC += totalYearBTC;
      
      const projectedPrice = deferredBitcoinPrice * Math.pow(1 + projectedBitcoinGrowth / 100, year);
      
      const dataPoint = {
        year,
        month: year * 12,
        btcAccumulated: cumulativeBTC,
        btcThisYear: totalYearBTC,
        usdValue: cumulativeBTC * projectedPrice,
        bitcoinPrice: projectedPrice,
        vestingComplete: year >= 4,
        isVestingYear: vestingMilestoneYears.includes(year),
        isGrantYear: !!grantRules[year],
        grantAmount: grantRules[year] || 0,
        yoyGrowth: lastYearBTC > 0 ? ((totalYearBTC - lastYearBTC) / lastYearBTC) * 100 : 0
      };
      
      data.push(dataPoint);
      lastYearBTC = totalYearBTC;
    }
    
    return data;
  }, [extendedTimeline, grantRules, deferredBitcoinPrice, projectedBitcoinGrowth, vestingMilestoneYears]);

  // Memoize cost basis calculation
  const costBasis = useMemo(() => {
    let totalCost = 0;
    let totalBTC = 0;
    
    sortedEvents.forEach(event => {
      if (event.btcAmount > 0) {
        const monthsSinceStart = event.month;
        const projectedPrice = deferredBitcoinPrice * Math.pow(1 + monthlyGrowthRate, monthsSinceStart);
        totalCost += event.btcAmount * projectedPrice;
        totalBTC += event.btcAmount;
      }
    });
    
    return { totalCost, totalBTC, avgPrice: totalBTC > 0 ? totalCost / totalBTC : 0 };
  }, [sortedEvents, deferredBitcoinPrice, monthlyGrowthRate]);

  // Memoize chart metrics
  const currentYear = useMemo(() => yearlyData[0], [yearlyData]);
  const finalYear = useMemo(() => yearlyData[yearlyData.length - 1], [yearlyData]);
  
  const growthMultiple = useMemo(() => {
    if (!currentYear || !finalYear || currentYear.usdValue === 0) return 0;
    return finalYear.usdValue / currentYear.usdValue;
  }, [currentYear, finalYear]);

  // Memoize domain and ticks
  const { usdDomain, usdTicks } = useMemo(() => {
    const maxValue = Math.max(...yearlyData.map(d => d.usdValue));
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    const normalizedMax = Math.ceil(maxValue / magnitude) * magnitude;
    
    const domain = [0, normalizedMax];
    const ticks = [];
    const step = normalizedMax / 5;
    
    for (let i = 0; i <= 5; i++) {
      ticks.push(Math.round(i * step));
    }
    
    return { usdDomain: domain, usdTicks: ticks };
  }, [yearlyData]);

  // Memoize chart config
  const chartConfig = useMemo<ChartConfig>(() => ({
    usdValue: {
      label: "USD Value",
      color: "hsl(var(--chart-1))",
    }
  }), []);

  // Memoize mouse handlers
  const handleMouseMove = useCallback((e: any) => {
    if (e && e.activeLabel !== undefined) {
      setHoveredYear(e.activeLabel);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredYear(null);
  }, []);

  if (!projectionData || yearlyData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500">
        <p>Enter your vesting details to see projections</p>
      </div>
    );
  }

  const chartContent = (
    <LazyChartContainer config={chartConfig}>
      <LazyResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
        <LazyLineChart
          data={yearlyData}
          margin={{ 
            top: 20, 
            right: isMobile ? 20 : 30, 
            bottom: 60, 
            left: isMobile ? 60 : 80 
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="colorUsdValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02}/>
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9}/>
            </linearGradient>
          </defs>
          
          <LazyCartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb"
            vertical={false}
          />
          
          <LazyXAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            ticks={[0, 5, 10, 15, 19]}
            label={{ 
              value: 'Year', 
              position: 'insideBottom', 
              offset: -10,
              style: { fontSize: 14, fill: '#6b7280' }
            }}
          />
          
          <LazyYAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            domain={usdDomain}
            ticks={usdTicks}
            tickFormatter={formatUSDCompact}
            label={{ 
              value: 'Portfolio Value (USD)', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 14, fill: '#6b7280' }
            }}
          />
          
          <LazyTooltip
            content={
              <CustomTooltip
                yearlyData={yearlyData}
                hoveredYear={hoveredYear}
                vestingMilestoneYears={vestingMilestoneYears}
                grantRules={grantRules}
                extendedTimeline={extendedTimeline}
                formatBTC={formatBTC}
                formatUSD={formatUSD}
              />
            }
            cursor={{ strokeDasharray: '3 3' }}
          />
          
          <LazyLine
            type="monotone"
            dataKey="usdValue"
            stroke="url(#lineGradient)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: '#3b82f6' }}
            animationDuration={500}
          />
          
          {/* Vesting milestone markers */}
          {vestingMilestoneYears.map(year => (
            <LazyReferenceLine
              key={`vesting-${year}`}
              x={year}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              strokeOpacity={0.5}
            />
          ))}
          
          {/* Grant markers */}
          {Object.keys(grantRules).map(year => (
            <LazyReferenceLine
              key={`grant-${year}`}
              x={Number(year)}
              stroke="#10b981"
              strokeDasharray="2 2"
              strokeOpacity={0.3}
            />
          ))}
          
          <LazyLegend 
            content={<CustomLegend />}
            wrapperStyle={{ paddingTop: '20px' }}
          />
        </LazyLineChart>
      </LazyResponsiveContainer>
    </LazyChartContainer>
  );

  return (
    <div className="w-full">
      <Suspense fallback={<ChartSkeleton />}>
        {chartContent}
      </Suspense>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">Total BTC</p>
          <p className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">
            {formatBTC(finalYear?.btcAccumulated || 0)}
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">Final Value</p>
          <p className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">
            {formatUSD(finalYear?.usdValue || 0)}
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">Growth Multiple</p>
          <p className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">
            {growthMultiple.toFixed(1)}x
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">Avg Cost Basis</p>
          <p className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">
            {formatUSD(costBasis.avgPrice)}
          </p>
        </div>
      </div>
    </div>
  );
});

VestingTimelineChartRechartsOptimized.displayName = 'VestingTimelineChartRechartsOptimized';

export default VestingTimelineChartRechartsOptimized;
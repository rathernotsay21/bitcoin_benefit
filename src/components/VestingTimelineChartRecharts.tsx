'use client';

import React, { useState, useEffect, useMemo, useCallback, startTransition, useDeferredValue } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  ComposedChart
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { VestingTimelinePoint } from '@/types/vesting';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

interface VestingTimelineChartProps {
  timeline: VestingTimelinePoint[];
  initialGrant: number;
  annualGrant?: number;
  projectedBitcoinGrowth: number;
  currentBitcoinPrice: number;
  schemeId?: string;
  customVestingEvents?: import('@/types/vesting').CustomVestingEvent[];
}

function formatBTC(amount: number): string {
  return `₿${amount.toFixed(3)}`;
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatUSDCompact(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return formatUSD(amount);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
  }>;
  label?: string | number;
  yearlyData?: Array<{
    year: number;
    btcBalance: number;
    usdValue: number;
    vestingPercent: number;
    grantSize: number;
  }>;
}

// Simplified tooltip showing only essential information (no growth rate)
const CustomTooltip = React.memo(({ active, payload, label, yearlyData }: CustomTooltipProps) => {
  // Early returns for performance
  if (!active || !payload?.length || !yearlyData?.length) return null;
  
  const year = typeof label === 'string' ? parseInt(label, 10) : (label as number);
  // Optimized bounds check
  if (!Number.isInteger(year) || year < 0 || year >= yearlyData.length) return null;
  
  // Direct array access - O(1) instead of O(n) find()
  const yearData = yearlyData[year];
  if (!yearData) return null;
  
  const vestingPercent = yearData.vestingPercent || 0;
    
    // Calculate vested BTC amount
    const vestedBTC = yearData.btcBalance * (vestingPercent / 100);
    const unvestedBTC = yearData.btcBalance * ((100 - vestingPercent) / 100);

    return (
      <div className="bg-background/95 backdrop-blur-lg p-4 border border-border/50 rounded-sm shadow-md min-w-[240px]">
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-foreground text-base">Year {year}</p>
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
            vestingPercent === 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
            vestingPercent >= 75 ? 'bg-gradient-to-r from-lime-400 to-green-500 text-white' :
            vestingPercent >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' :
            vestingPercent >= 25 ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white' :
            vestingPercent > 0 ? 'bg-gradient-to-r from-orange-400 to-yellow-500 text-white' :
            'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
          }`}>
            {vestingPercent}% Unlocked
          </span>
        </div>
        
        {/* Bitcoin Holdings Section */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-bitcoin">Total BTC Balance:</span>
            <span className="text-sm font-bold text-bitcoin">{formatBTC(yearData.btcBalance)}</span>
          </div>

          {vestingPercent > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Unlocked BTC:</span>
                <span className="text-sm font-bold text-green-700 dark:text-green-300">{formatBTC(vestedBTC)}</span>
              </div>
              {vestingPercent < 100 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Unvested BTC:</span>
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{formatBTC(unvestedBTC)}</span>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Grant Info for this year if applicable */}
        {yearData.grantSize > 0 && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="inline-flex px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-400 to-amber-500 text-white">
                New Award
              </span>
              <span className="text-sm font-bold text-bitcoin">+{formatBTC(yearData.grantSize)}</span>
            </div>
          </div>
        )}
      </div>
    );
});

CustomTooltip.displayName = 'CustomTooltip';

interface CustomGrantDotProps {
  cx?: number;
  cy?: number;
  payload?: {
    grantSize: number;
    year: number;
    btcBalance: number;
    usdValue: number;
  };
}

const CustomGrantDot = React.memo(({ cx, cy, payload }: CustomGrantDotProps) => {
  // Only render if we have valid coordinates and grant data
  if (!cx || !cy || !payload || payload.grantSize <= 0) return null;

  // Calculate dot size based on grant size with min/max constraints
  const minRadius = 4;
  const maxRadius = 12;
  const maxGrant = Math.max(0.02, payload.grantSize * 1.2); // Dynamic scaling
  
  // Scale the radius based on grant size
  const normalizedSize = Math.min(Math.max(0, payload.grantSize / maxGrant), 1);
  const radius = minRadius + (maxRadius - minRadius) * normalizedSize;

  return (
    <g>
      {/* Glow effect */}
      <circle
        cx={cx}
        cy={cy}
        r={radius + 4}
        fill="#F7931A"
        opacity={0.15}
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius + 2}
        fill="#F7931A"
        opacity={0.25}
      />
      {/* Main dot */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="#F7931A"
        stroke="white"
        strokeWidth={2}
        opacity={0.9}
      />
    </g>
  );
});

CustomGrantDot.displayName = 'CustomGrantDot';






function VestingTimelineChartRecharts({
  timeline,
  initialGrant,
  annualGrant,
  projectedBitcoinGrowth,
  currentBitcoinPrice,
  schemeId,
  customVestingEvents
}: VestingTimelineChartProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  // Defer expensive timeline processing to prevent blocking UI
  const deferredTimeline = useDeferredValue(timeline);
  const deferredBitcoinPrice = useDeferredValue(currentBitcoinPrice);

  // Memoize sorted events to prevent re-sorting on every call
  const sortedEvents = useMemo(() => {
    if (!customVestingEvents?.length) return null;
    return [...customVestingEvents].sort((a, b) => a.timePeriod - b.timePeriod);
  }, [customVestingEvents]);
  
  // Helper function to get vesting percentage for a given month (optimized)
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

  // Get vesting milestone years from custom events
  const vestingMilestoneYears = useMemo(() => {
    if (!sortedEvents) {
      return [5, 10]; // Default milestones
    }
    return sortedEvents.map(event => Math.floor(event.timePeriod / 12));
  }, [sortedEvents]);

  useEffect(() => {
    const handleResize = () => {
      // Use startTransition for non-urgent UI updates
      startTransition(() => {
        setIsMobile(window.innerWidth < 768);
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memoize growth rate calculation separately
  const monthlyGrowthRate = useMemo(() => projectedBitcoinGrowth / 1200, [projectedBitcoinGrowth]);
  
  // Extend timeline to 10 years (120 months) if needed
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

  // Pre-calculate grant rules to avoid repeated switch statements
  const grantRules = useMemo(() => {
    const rules = { hasAnnualGrants: true, maxYears: 10 };
    
    // CRITICAL FIX: Respect custom vesting events for grant limits
    if (customVestingEvents && customVestingEvents.length > 0) {
      const lastEventMonth = Math.max(...customVestingEvents.map(e => e.timePeriod));
      const lastEventYear = Math.floor(lastEventMonth / 12);
      rules.maxYears = lastEventYear;
      
      // For accelerator scheme, still no annual grants even with custom events
      if (schemeId === 'accelerator') {
        rules.hasAnnualGrants = false;
        rules.maxYears = 0;
      }
    } else {
      // Fallback to scheme defaults if no custom vesting events
      switch (schemeId) {
        case 'accelerator':
          rules.hasAnnualGrants = false;
          rules.maxYears = 0;
          break;
        case 'steady-builder':
          rules.maxYears = 5;
          break;
        case 'slow-burn':
          rules.maxYears = 9;
          break;
      }
    }
    return rules;
  }, [schemeId, customVestingEvents]);
  
  // Data processing for yearly points with grant information
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

  // Calculate cost basis based on scheme - all at current price (what employer actually pays)
  const costBasis = useMemo(() => {
    let totalCost = 0;
    
    // Initial award cost at current price
    if (initialGrant > 0) {
      totalCost += initialGrant * deferredBitcoinPrice;
    }
    
    // Annual award costs at current price (employer's actual cost)
    if (annualGrant && annualGrant > 0) {
      // CRITICAL FIX: Use grant rules that respect custom vesting events
      const numberOfGrants = grantRules.hasAnnualGrants ? grantRules.maxYears : 0;
      totalCost += annualGrant * deferredBitcoinPrice * numberOfGrants;
    }
    
    return totalCost;
  }, [initialGrant, annualGrant, deferredBitcoinPrice, grantRules]);

  // Calculate current year for vesting display
  const currentYear = new Date().getFullYear();

  const finalYear = yearlyData[10]; // Year 10 is the final year
  
  const growthMultiple = useMemo(() => {
    if (!finalYear || !yearlyData || yearlyData.length === 0) return 0;
    
    const finalValue = finalYear.btcBalance * finalYear.bitcoinPrice;
    
    // Use the cost basis we already calculated
    return costBasis > 0 ? finalValue / costBasis : 0;
  }, [finalYear, yearlyData, costBasis]);

  // Calculate Y-axis domain and ticks for USD only - emphasize growth by starting at 90% of min
  const { usdDomain, usdTicks } = useMemo(() => {
    if (!yearlyData || yearlyData.length === 0) {
      return { 
        usdDomain: [0, 12000],
        usdTicks: [0, 2000, 4000, 6000, 8000, 10000, 12000]
      };
    }
    
    // Get min and max values from USD values
    const usdValues = yearlyData.map(d => d.usdValue || 0).filter(v => isFinite(v));
    
    if (usdValues.length === 0) {
      return { 
        usdDomain: [0, 12000],
        usdTicks: [0, 2000, 4000, 6000, 8000, 10000, 12000]
      };
    }
    
    const maxUsd = Math.max(...usdValues);
    const minUsd = Math.min(...usdValues);
    
    // Start Y-axis at 90% of minimum value to emphasize growth
    // But ensure we don't go below 0 and have a reasonable minimum
    let minDomain: number;
    if (minUsd <= 0) {
      minDomain = 0;
    } else {
      minDomain = Math.floor(minUsd * 0.9);
      // Round down to nearest nice number for cleaner axis
      if (minDomain < 1000) {
        minDomain = Math.floor(minDomain / 100) * 100;
      } else if (minDomain < 10000) {
        minDomain = Math.floor(minDomain / 1000) * 1000;
      } else {
        minDomain = Math.floor(minDomain / 5000) * 5000;
      }
    }
    
    // Calculate nice round maximum for the scale with less headroom (15% instead of default)
    const paddedMax = maxUsd * 1.15;
    let maxDomain: number;
    let ticks: number[];
    
    // Adjust tick calculation based on the new minimum
    const range = paddedMax - minDomain;
    
    if (paddedMax <= 12000) {
      maxDomain = Math.ceil(paddedMax / 2000) * 2000;
      const step = Math.ceil((maxDomain - minDomain) / 6 / 500) * 500;
      ticks = [];
      for (let i = 0; i <= 6; i++) {
        const tick = minDomain + i * step;
        if (tick <= maxDomain) ticks.push(tick);
      }
    } else if (paddedMax <= 20000) {
      maxDomain = Math.ceil(paddedMax / 4000) * 4000;
      const step = Math.ceil((maxDomain - minDomain) / 5 / 1000) * 1000;
      ticks = [];
      for (let i = 0; i <= 5; i++) {
        const tick = minDomain + i * step;
        if (tick <= maxDomain) ticks.push(tick);
      }
    } else if (paddedMax <= 50000) {
      maxDomain = Math.ceil(paddedMax / 10000) * 10000;
      const step = Math.ceil((maxDomain - minDomain) / 5 / 2000) * 2000;
      ticks = [];
      for (let i = 0; i <= 5; i++) {
        const tick = minDomain + i * step;
        if (tick <= maxDomain) ticks.push(tick);
      }
    } else if (paddedMax <= 100000) {
      maxDomain = Math.ceil(paddedMax / 20000) * 20000;
      const step = Math.ceil((maxDomain - minDomain) / 5 / 5000) * 5000;
      ticks = [];
      for (let i = 0; i <= 5; i++) {
        const tick = minDomain + i * step;
        if (tick <= maxDomain) ticks.push(tick);
      }
    } else if (paddedMax <= 200000) {
      maxDomain = Math.ceil(paddedMax / 40000) * 40000;
      const step = Math.ceil((maxDomain - minDomain) / 5 / 10000) * 10000;
      ticks = [];
      for (let i = 0; i <= 5; i++) {
        const tick = minDomain + i * step;
        if (tick <= maxDomain) ticks.push(tick);
      }
    } else if (paddedMax <= 500000) {
      maxDomain = Math.ceil(paddedMax / 100000) * 100000;
      const step = Math.ceil((maxDomain - minDomain) / 5 / 20000) * 20000;
      ticks = [];
      for (let i = 0; i <= 5; i++) {
        const tick = minDomain + i * step;
        if (tick <= maxDomain) ticks.push(tick);
      }
    } else {
      // For very large values, round up to nearest 100K
      maxDomain = Math.ceil(maxUsd / 100000) * 100000;
      const step = Math.ceil((maxDomain - minDomain) / 5 / 50000) * 50000;
      ticks = [];
      for (let i = 0; i <= 5; i++) {
        const tick = minDomain + i * step;
        if (tick <= maxDomain) ticks.push(tick);
      }
    }
    
    // Ensure we have at least the min and max in our ticks
    if (ticks.length > 0 && ticks[0] > minDomain) {
      ticks[0] = minDomain;
    }
    if (ticks.length > 0 && ticks[ticks.length - 1] < maxDomain) {
      ticks[ticks.length - 1] = maxDomain;
    }
    
    return { usdDomain: [minDomain, maxDomain], usdTicks: ticks };
  }, [yearlyData]);

  // Chart configuration for shadcn/ui
  const chartConfig = useMemo(() => ({
    usdValue: {
      label: "Total Value (USD)",
      color: "hsl(var(--chart-1))",
    },
  }) satisfies ChartConfig, []);


  // Early return if no valid data - after all hooks
  if (!yearlyData || yearlyData.length === 0 || !timeline || timeline.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Benefit's Growth Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-sm flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">📊</div>
              <div>Loading chart data...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Benefit's Growth Projection</CardTitle>
        <CardDescription>
          10-year potential value based on the awards plan and unlock schedule you have selected or customized
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <ComposedChart
            data={yearlyData}
            margin={{
              top: isMobile ? 15 : 20,
              left: isMobile ? 15 : 20,
              right: isMobile ? 8 : 12,
              bottom: isMobile ? 8 : 12
            }}
            accessibilityLayer
          >

            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis
              dataKey="year"
              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
              domain={[0, 10]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={(props: { x: number; y: number; payload: { value: number } }) => {
                const { x, y, payload } = props;
                // Ensure we're comparing numbers properly
                const year = Number(payload.value);
                const isVestingMilestone = vestingMilestoneYears.some(y => Number(y) === year);
                
                // Don't render label for year 0
                if (year === 0) {
                  return <g></g>;
                }
                
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={16}
                      textAnchor="middle"
                      style={{ 
                        fill: isVestingMilestone ? '#eab308' : '#6b7280',
                        fontWeight: isVestingMilestone ? 700 : 400 
                      }}
                      fontSize={12}
                    >
                      {year}
                    </text>
                  </g>
                );
              }}
            />

            <YAxis
              yAxisId="usd"
              orientation="left"
              tickFormatter={(value) => formatUSDCompact(value)}
              domain={usdDomain}
              ticks={usdTicks}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: isMobile ? 10 : 12, dx: isMobile ? -15 : -25 }}
              className="fill-muted-foreground"
            />

            <ChartTooltip 
              content={<CustomTooltip yearlyData={yearlyData} />}
              cursor={false}
              position={isMobile ? { x: 20, y: 20 } : { x: 80, y: 40 }}
              wrapperStyle={{
                position: 'absolute',
                pointerEvents: 'none',
                transition: 'opacity 0.2s ease-out'
              }}
              isAnimationActive={false}
              // Enable better touch interaction on mobile
              allowEscapeViewBox={{ x: true, y: true }}
            />



            {/* USD Value line with BTC grant labels on dots */}
            <Line
              yAxisId="usd"
              type="natural"
              dataKey="usdValue"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2.5}
              name="USD Value"
              dot={<CustomGrantDot />}
              activeDot={{ r: 6 }}
            >
              {/* Hide Bitcoin grant value labels on mobile to reduce clutter */}
              {!isMobile && (
                <LabelList
                  position="top"
                  offset={15}
                  className="fill-bitcoin font-bold"
                  fontSize={11}
                  content={(props: any) => {
                    const { x, y, index } = props;
                    const data = yearlyData[index];
                    
                    // Only show label if there's a grant this year
                    if (data && data.grantSize > 0) {
                      // Calculate slope to next point for horizontal adjustment
                      let xOffset = 0;
                      
                      // Special handling for the last point (year 10)
                      if (index === yearlyData.length - 1) {
                        xOffset = -25; // Move left to avoid collision with year 10 label
                      } else if (index < yearlyData.length - 1) {
                        const nextData = yearlyData[index + 1];
                        const currentValue = data.usdValue;
                        const nextValue = nextData.usdValue;
                        
                        // Use relative position in the value range for better slope detection
                        const maxValue = yearlyData[yearlyData.length - 1].usdValue;
                        const valueRange = maxValue - yearlyData[0].usdValue;
                        const slopeRatio = (nextValue - currentValue) / valueRange;
                        
                        // Adjusted thresholds based on visual observation
                        if (slopeRatio > 0.15) {
                          xOffset = -30; // Extreme slope: move left significantly
                        } else if (slopeRatio > 0.08) {
                          xOffset = -20; // Steep slope: move left more
                        } else if (slopeRatio > 0.04) {
                          xOffset = -10; // Moderate slope: move left a bit
                        } else if (slopeRatio > 0.02) {
                          xOffset = -4;  // Slight slope: tiny offset
                        }
                        // Gentle slope (< 0.02): no offset needed
                      }
                      
                      return (
                        <text
                          x={x + xOffset}
                          y={y - 12}
                          textAnchor="middle"
                          className="fill-black dark:fill-white"
                          fontSize={11}
                        >
                          {data.grantSize.toFixed(3)}
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              )}
            </Line>
          </ComposedChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className={`flex-col items-start gap-2 text-sm ${isMobile ? 'px-4 pb-4' : ''}`}>
        {/* On mobile, show simplified footer with essential info only */}
        {isMobile ? (
          <>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Initial Award:</span>
                <span className="text-bitcoin font-bold">{formatBTC(initialGrant)}</span>
              </div>
              {annualGrant && annualGrant > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Annual Award:</span>
                  <span className="text-bitcoin font-bold">{formatBTC(annualGrant)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Cost Basis:</span>
                <span className="text-green-600 dark:text-green-400 font-bold">{formatUSD(costBasis)}</span>
              </div>
            </div>
            {growthMultiple > 1 && (
              <div className="flex items-center justify-between w-full pt-2 border-t font-medium">
                <span>Projected Return:</span>
                <span className="flex items-center gap-1">
                  {growthMultiple.toFixed(1)}x over 10 years
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </span>
              </div>
            )}
            {/* Simplified vesting info on mobile */}
            <div className="text-xs text-muted-foreground leading-tight">
              {customVestingEvents && customVestingEvents.length > 0 ? (
                <span>Custom vesting schedule applied</span>
              ) : (
                <span>Standard unlocking: 50% at year 5, 100% at year 10</span>
              )}
            </div>
          </>
        ) : (
          /* Desktop layout - unchanged */
          <>
            <div className="flex gap-2 leading-none font-medium">
              <span className="flex items-center gap-1">
                <span className="text-muted-foreground">Initial:</span>
                <span className="text-bitcoin font-bold">{formatBTC(initialGrant)}</span>
              </span>
              {annualGrant && annualGrant > 0 && (
                <span className="flex items-center gap-1">
                  <span className="text-muted-foreground">• Annual:</span>
                  <span className="text-bitcoin font-bold">{formatBTC(annualGrant)}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <span className="text-muted-foreground">• Cost Basis:</span>
                <span className="text-green-600 dark:text-green-400 font-bold">{formatUSD(costBasis)}</span>
              </span>
            </div>
            <div className="text-muted-foreground leading-none">
              {customVestingEvents && customVestingEvents.length > 0 ? (
                <span><span style={{color: '#eab308', fontWeight: 500}}>Vesting milestones:</span> {customVestingEvents.map(e => `${e.percentageVested}% at ${e.label}`).join(', ')}</span>
              ) : (
                <span><span style={{color: '#eab308', fontWeight: 500}}>Standard unlocking:</span> 50% at year 5, 100% at year 10</span>
              )}
            </div>
            {growthMultiple > 1 && (
              <div className="flex gap-2 leading-none font-medium pt-2 border-t w-full">
                Projected {growthMultiple.toFixed(1)}x return over 10 years
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}

// Export without memoization to ensure updates when props change
// Wrap with React.memo to prevent unnecessary re-renders
export default React.memo(VestingTimelineChartRecharts, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return JSON.stringify(prevProps.timeline) === JSON.stringify(nextProps.timeline) &&
         prevProps.initialGrant === nextProps.initialGrant &&
         prevProps.annualGrant === nextProps.annualGrant &&
         prevProps.projectedBitcoinGrowth === nextProps.projectedBitcoinGrowth &&
         prevProps.currentBitcoinPrice === nextProps.currentBitcoinPrice &&
         prevProps.schemeId === nextProps.schemeId &&
         JSON.stringify(prevProps.customVestingEvents) === JSON.stringify(nextProps.customVestingEvents);
});

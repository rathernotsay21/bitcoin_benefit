'use client';

import React, { useState, useEffect, useMemo, useCallback, startTransition, useDeferredValue } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { getMobileChartConfig, optimizeChartData } from '@/components/charts/RechartsOptimized';
import { VestingTimelinePoint } from '@/types/vesting';
import VirtualizedAnnualBreakdown from './VirtualizedAnnualBreakdownOptimized';

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
  payload?: any[];
  label?: string;
  yearlyData?: any[];
}

const CustomTooltip = ({ active, payload, label, yearlyData }: CustomTooltipProps) => {
  if (active && payload && payload.length && yearlyData) {
    const year = Number(label);
    if (!isFinite(year) || year < 0 || year > 10) return null;
    
    // Get vesting percent from payload data
    const vestingPercent = yearlyData.find(d => d.year === year)?.vestingPercent || 0;
    
    // Find the data point for this year
    const yearData = yearlyData.find(d => d.year === year);
    if (!yearData) return null;
    
    // Calculate vested BTC amount
    const vestedBTC = yearData.btcBalance * (vestingPercent / 100);
    const unvestedBTC = yearData.btcBalance * ((100 - vestingPercent) / 100);
    
    // Calculate year-over-year growth if not year 0
    let yoyGrowth = null;
    if (year > 0 && yearlyData[year - 1]) {
      const prevYearValue = yearlyData[year - 1].usdValue;
      if (prevYearValue > 0) {
        yoyGrowth = ((yearData.usdValue - prevYearValue) / prevYearValue) * 100;
      }
    }

    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg p-4 border border-gray-200/50 dark:border-slate-700/50 rounded-xl shadow-2xl min-w-[240px]">
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-gray-900 dark:text-white text-base">Year {year}</p>
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
            vestingPercent === 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
            vestingPercent >= 75 ? 'bg-gradient-to-r from-lime-400 to-green-500 text-white' :
            vestingPercent >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' :
            vestingPercent >= 25 ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white' :
            vestingPercent > 0 ? 'bg-gradient-to-r from-orange-400 to-yellow-500 text-white' :
            'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
          }`}>
            {vestingPercent}% Vested
          </span>
        </div>
        
        {/* Bitcoin Holdings Section */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-bitcoin dark:text-bitcoin">Total BTC Balance:</span>
            <span className="text-sm font-bold text-bitcoin dark:text-bitcoin">{formatBTC(yearData.btcBalance)}</span>
          </div>

          {vestingPercent > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Vested BTC:</span>
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
        
        {/* Value Section */}
        <div className="pt-3 border-t border-gray-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Total USD Value:</span>
            <span className="text-sm font-bold text-green-700 dark:text-green-300">{formatUSD(yearData.usdValue)}</span>
          </div>

        </div>
        
        {/* Year-over-year growth */}
        {yoyGrowth !== null && (
          <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">YoY Growth:</span>
              <span className={`text-sm font-bold ${
                yoyGrowth >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {yoyGrowth >= 0 ? '+' : ''}{yoyGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
        
        {/* Grant Info for this year if applicable */}
        {yearData.grantSize > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="inline-flex px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-400 to-amber-500 text-white">
                New Grant
              </span>
              <span className="text-sm font-bold text-bitcoin dark:text-bitcoin">+{formatBTC(yearData.grantSize)}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

interface CustomGrantDotProps {
  cx?: number;
  cy?: number;
  payload?: any;
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



interface CustomLegendProps {
  schemeId?: string;
  initialGrant: number;
  annualGrant?: number;
}

const CustomLegend = ({ schemeId, initialGrant, annualGrant }: CustomLegendProps) => {
  return (
    <div className="flex flex-col items-center gap-4 mt-4">
      <div className="flex justify-center gap-8">
        <div className="flex items-center gap-3">
          <svg width="24" height="12" className="overflow-visible">
            <circle cx="12" cy="6" r="6" fill="#F7931A" stroke="white" strokeWidth="2" opacity="0.9" />
          </svg>
          <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
            Grant Events
          </span>
        </div>
        <div className="flex items-center gap-3">
          <svg width="24" height="3" className="overflow-visible">
            <line
              x1="0"
              y1="1.5"
              x2="24"
              y2="1.5"
              stroke="#10b981"
              strokeWidth="3"
              filter="drop-shadow(0 0 4px #10b98140)"
            />
          </svg>
          <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
            Total Value (USD)
          </span>
        </div>
      </div>
      {/* Grant schedule subtitle */}
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {schemeId === 'accelerator' && `One award of ${formatBTC(initialGrant)} given upfront`}
        {schemeId === 'steady-builder' && `Starting ${formatBTC(initialGrant)} + ${formatBTC(annualGrant || 0)} yearly for 5 years`}
        {schemeId === 'slow-burn' && `Starting ${formatBTC(initialGrant)} + ${formatBTC(annualGrant || 0)} yearly for 9 years`}
      </div>
    </div>
  );
};

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
  const [, setHoveredYear] = useState<number | null>(null);
  
  // Defer expensive timeline processing to prevent blocking UI
  const deferredTimeline = useDeferredValue(timeline);
  const deferredBitcoinPrice = useDeferredValue(currentBitcoinPrice);

  // Helper function to get vesting percentage for a given month
  const getVestingPercentage = useCallback((months: number) => {
    if (!customVestingEvents || customVestingEvents.length === 0) {
      // Fallback to default vesting schedule
      if (months >= 120) return 100;
      if (months >= 60) return 50;
      return 0;
    }
    
    // Find the highest vesting percentage that has been reached
    const sortedEvents = [...customVestingEvents].sort((a, b) => a.timePeriod - b.timePeriod);
    for (let i = sortedEvents.length - 1; i >= 0; i--) {
      if (months >= sortedEvents[i].timePeriod) {
        return sortedEvents[i].percentageVested;
      }
    }
    return 0;
  }, [customVestingEvents]);

  // Get vesting milestone years from custom events
  const vestingMilestoneYears = useMemo(() => {
    if (!customVestingEvents || customVestingEvents.length === 0) {
      return [5, 10]; // Default milestones
    }
    return customVestingEvents.map(event => Math.floor(event.timePeriod / 12));
  }, [customVestingEvents]);

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

  // Extend timeline to 10 years (120 months) if needed
  const extendedTimeline = useMemo(() => {
    if (!deferredTimeline || deferredTimeline.length === 0) return [];
    
    const extended = [...deferredTimeline];
    const maxMonth = Math.max(...deferredTimeline.map(p => p.month));
    const targetMonths = 120; // 10 years

    if (maxMonth < targetMonths) {
      const monthlyGrowthRate = projectedBitcoinGrowth / 12 / 100;
      const lastPoint = timeline[timeline.length - 1];

      for (let month = maxMonth + 1; month <= targetMonths; month++) {
        const bitcoinPrice = deferredBitcoinPrice * Math.pow(1 + monthlyGrowthRate, month);
        const employerBalance = lastPoint.employerBalance || 0;

        extended.push({
          month,
          employeeBalance: lastPoint.employeeBalance,
          employerBalance: employerBalance,
          vestedAmount: lastPoint.vestedAmount,
          totalBalance: lastPoint.totalBalance,
          bitcoinPrice,
          usdValue: employerBalance * bitcoinPrice,
        });
      }
    }
    return extended;
  }, [timeline, deferredTimeline, projectedBitcoinGrowth, deferredBitcoinPrice]);

  // Data processing for yearly points with grant information
  const yearlyData = useMemo(() => {
    if (!extendedTimeline || extendedTimeline.length === 0) {
      return []; // Return empty array if no timeline data
    }
    
    const data = extendedTimeline
      .filter((_, index) => index % 12 === 0)
      .slice(0, 11) // Only 11 points for 0-10 years
      .map((point, index) => {
        const year = index;
        let grantSize = 0;
        let grantCost = 0; // Annual cost to employer
        let isInitialGrant = false;
        
        // Determine if this year has a grant and its cost
        if (year === 0 && initialGrant > 0) {
          grantSize = initialGrant;
          grantCost = initialGrant * deferredBitcoinPrice; // Cost at today's price
          isInitialGrant = true;
        } else if (annualGrant && annualGrant > 0 && year > 0) {
          // Check scheme-specific grant rules with explicit logic
          switch (schemeId) {
            case 'accelerator':
              // Pioneer scheme: No annual grants, only initial
              grantSize = 0;
              grantCost = 0;
              break;
            case 'steady-builder':
              // Stacker scheme: Annual grants for years 1-5
              if (year <= 5) {
                grantSize = annualGrant;
                grantCost = annualGrant * deferredBitcoinPrice;
              }
              break;
            case 'slow-burn':
              // Builder scheme: Annual grants for years 1-9
              if (year <= 9) {
                grantSize = annualGrant;
                grantCost = annualGrant * deferredBitcoinPrice;
              }
              break;
            default:
              // Custom or unknown scheme
              grantSize = annualGrant;
              grantCost = annualGrant * deferredBitcoinPrice;
          }
        }
        
        // Ensure all values are valid numbers with additional safety
        const btcBalance = (isFinite(point.employerBalance) && point.employerBalance >= 0) ? point.employerBalance : 0;
        const bitcoinPrice = (isFinite(point.bitcoinPrice) && point.bitcoinPrice > 0) ? point.bitcoinPrice : deferredBitcoinPrice;
        const usdValue = btcBalance * bitcoinPrice;
        
        // Calculate vesting percentage for this year
        const vestingPercent = getVestingPercentage(year * 12);
        
        return {
          year,
          btcBalance,
          usdValue: isFinite(usdValue) ? usdValue : 0,
          bitcoinPrice,
          vestedAmount: isFinite(point.vestedAmount) ? point.vestedAmount : 0,
          vestingPercent,
          grantSize: isFinite(grantSize) ? grantSize : 0,
          grantCost: isFinite(grantCost) ? grantCost : 0,
          isInitialGrant
        };
      });
      
    return data;
  }, [extendedTimeline, initialGrant, annualGrant, schemeId, deferredBitcoinPrice, getVestingPercentage]);

  // Calculate cost basis based on scheme - all at current price (what employer actually pays)
  const costBasis = useMemo(() => {
    let totalCost = 0;
    
    // Initial grant cost at current price
    if (initialGrant > 0) {
      totalCost += initialGrant * deferredBitcoinPrice;
    }
    
    // Annual grant costs at current price (employer's actual cost)
    if (annualGrant && annualGrant > 0) {
      if (schemeId === 'slow-burn') {
        // 9 years of annual grants at current price
        totalCost += annualGrant * deferredBitcoinPrice * 9;
      } else if (schemeId === 'steady-builder') {
        // 5 years of annual grants at current price  
        totalCost += annualGrant * deferredBitcoinPrice * 5;
      }
    }
    
    return totalCost;
  }, [initialGrant, annualGrant, deferredBitcoinPrice, schemeId]);

  // Calculate current year for vesting display
  const currentYear = new Date().getFullYear();

  const finalYear = yearlyData[10]; // Year 10 is the final year
  
  const growthMultiple = useMemo(() => {
    if (!finalYear || !yearlyData || yearlyData.length === 0) return 0;
    
    const finalValue = finalYear.btcBalance * finalYear.bitcoinPrice;
    
    // Use the cost basis we already calculated
    return costBasis > 0 ? finalValue / costBasis : 0;
  }, [finalYear, yearlyData, costBasis]);

  // Calculate Y-axis domain and ticks for USD only - similar to old graph
  const { usdDomain, usdTicks } = useMemo(() => {
    if (!yearlyData || yearlyData.length === 0) {
      return { 
        usdDomain: [0, 12000],
        usdTicks: [0, 2000, 4000, 6000, 8000, 10000, 12000]
      };
    }
    
    // Get max value from USD values
    const usdValues = yearlyData.map(d => d.usdValue || 0).filter(v => isFinite(v));
    
    if (usdValues.length === 0) {
      return { 
        usdDomain: [0, 12000],
        usdTicks: [0, 2000, 4000, 6000, 8000, 10000, 12000]
      };
    }
    
    const maxUsd = Math.max(...usdValues);
    
    // Calculate nice round maximum for the scale
    let maxDomain: number;
    let ticks: number[];
    
    if (maxUsd <= 12000) {
      maxDomain = 12000;
      ticks = [0, 2000, 4000, 6000, 8000, 10000, 12000];
    } else if (maxUsd <= 20000) {
      maxDomain = 20000;
      ticks = [0, 4000, 8000, 12000, 16000, 20000];
    } else if (maxUsd <= 50000) {
      maxDomain = 50000;
      ticks = [0, 10000, 20000, 30000, 40000, 50000];
    } else if (maxUsd <= 100000) {
      maxDomain = 100000;
      ticks = [0, 20000, 40000, 60000, 80000, 100000];
    } else if (maxUsd <= 200000) {
      maxDomain = 200000;
      ticks = [0, 40000, 80000, 120000, 160000, 200000];
    } else if (maxUsd <= 500000) {
      maxDomain = 500000;
      ticks = [0, 100000, 200000, 300000, 400000, 500000];
    } else {
      // For very large values, round up to nearest 100K
      maxDomain = Math.ceil(maxUsd / 100000) * 100000;
      const tickInterval = maxDomain / 5;
      ticks = Array.from({length: 6}, (_, i) => i * tickInterval);
    }
    
    return { usdDomain: [0, maxDomain], usdTicks: ticks };
  }, [yearlyData]);

  // Optimized mobile configuration
  const chartConfig = useMemo(() => getMobileChartConfig(isMobile), [isMobile]);
  
  // Callbacks for mouse events with performance optimization
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

  // Early return if no valid data - after all hooks
  if (!yearlyData || yearlyData.length === 0 || !timeline || timeline.length === 0) {
    return (
      <div className="w-full max-w-full overflow-hidden">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            10-Year Projection
          </h3>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-3 sm:p-6 shadow-xl w-full overflow-hidden">
          <div className="h-64 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-slate-400">
              <div className="text-4xl mb-2">📊</div>
              <div>Loading chart data...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          10-Year Projection
        </h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="font-medium">Initial:</span>
            <span className="text-bitcoin dark:text-bitcoin font-bold">{formatBTC(initialGrant)}</span>
          </span>
          {annualGrant && annualGrant > 0 && (
            <span className="flex items-center gap-1">
              <span className="font-medium">• Annual:</span>
              <span className="text-bitcoin dark:text-bitcoin font-bold">{formatBTC(annualGrant)} per year</span>
            </span>
          )}
          {customVestingEvents && customVestingEvents.length > 0 ? (
            customVestingEvents.slice(0, 2).map((event, index) => (
              <span key={event.id} className="flex items-center gap-1">
                <span className="font-medium">• {event.percentageVested}% vests:</span>
                <span className="text-gray-600 dark:text-gray-400 font-bold">
                  {event.timePeriod < 12 ? event.label : currentYear + Math.floor(event.timePeriod / 12)}
                </span>
              </span>
            ))
          ) : (
            <>
              <span className="flex items-center gap-1">
                <span className="font-medium">• 50% vests:</span>
                <span className="text-gray-600 dark:text-gray-400 font-bold">{currentYear + 5}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="font-medium">• 100% vests:</span>
                <span className="text-gray-600 dark:text-gray-400 font-bold">{currentYear + 10}</span>
              </span>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
          <span className="flex items-center gap-1">
            <span className="font-medium">Cost Basis:</span>
            <span className="text-green-600 dark:text-green-400 font-bold">{formatUSD(costBasis)}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium">• Projected Growth:</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">{projectedBitcoinGrowth}% annually</span>
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-3 sm:p-6 shadow-xl w-full overflow-hidden">
        <ResponsiveContainer 
          width="100%" 
          height={chartConfig.height} 
          minHeight={300}
          debounce={150}
        >
          <ComposedChart
            data={yearlyData}
            throttleDelay={100}
            margin={chartConfig.margin}
            maxBarSize={isMobile ? 20 : undefined}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              {/* Gradient for USD line (green) */}
              <linearGradient id="usdGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
              </linearGradient>

              {/* Area gradient for USD (green) */}
              <linearGradient id="usdAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>

              {/* Glow filters */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Bar gradient for cost */}
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F7931A" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#F7931A" stopOpacity={0.9} />
              </linearGradient>
            </defs>

            <CartesianGrid 
              stroke="transparent" 
              vertical={false}
            />

            <XAxis
              dataKey="year"
              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
              domain={[0, 10]}
              axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
              tickLine={false}
              tick={(props: any) => {
                const { x, y, payload } = props;
                const isVestingMilestone = vestingMilestoneYears.includes(payload.value);
                
                // Don't render label for year 0 - return empty group instead of null
                if (payload.value === 0) {
                  return <g></g>;
                }
                
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={16}
                      textAnchor="middle"
                      fill={isVestingMilestone ? '#eab308' : '#6b7280'}
                      fontSize={14}
                      fontWeight={isVestingMilestone ? 700 : 500}
                    >
                      {payload.value}
                    </text>
                  </g>
                );
              }}
            />

            <YAxis
              yAxisId="usd"
              orientation="left"
              tickFormatter={(value) => formatUSDCompact(value)}
              stroke="#10b981"
              domain={usdDomain}
              ticks={usdTicks}
              axisLine={{ stroke: '#10b981', strokeWidth: 2 }}
              tick={{ fill: '#10b981', fontSize: 15, fontWeight: 600 }}
              tickLine={false}
            />

            <Tooltip 
              content={(props) => (
                <CustomTooltip 
                  {...props}
                  yearlyData={yearlyData} 
                />
              )} 
              cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }}
              isAnimationActive={false}
              wrapperStyle={{ 
                pointerEvents: 'none', 
                zIndex: 1000,
                outline: 'none'
              }}
            />

            <Legend
              content={<CustomLegend schemeId={schemeId} initialGrant={initialGrant} annualGrant={annualGrant} />}
              wrapperStyle={{ paddingTop: '20px' }}
            />


            {/* USD Value line - optimized for performance */}
            <Line
              yAxisId="usd"
              type="natural"
              dataKey="usdValue"
              stroke="url(#usdGradient)"
              strokeWidth={chartConfig.strokeWidth}
              name="USD Value"
              dot={<CustomGrantDot />}
              isAnimationActive={!isMobile} // Disable animation on mobile for better performance
              animationDuration={chartConfig.animationDuration}
              filter="url(#glow)"
              connectNulls={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Key Insights Cards */}


      {/* Virtualized Annual Breakdown Table */}
      <div className="mt-6 mb-3">
        <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
          Here are the same projections, but broken down year by year. You can see the potential cash value of the grant each year and what percentage of it the employee officially owns (has "vested").
        </p>
      </div>
      <VirtualizedAnnualBreakdown
        yearlyData={yearlyData}
        initialGrant={initialGrant}
        annualGrant={annualGrant}
        currentBitcoinPrice={currentBitcoinPrice}
        schemeId={schemeId}
        maxDisplayYears={11}
        customVestingEvents={customVestingEvents}
      />
    </div>
  );
}

// Export without memoization to ensure updates when props change
export default VestingTimelineChartRecharts;

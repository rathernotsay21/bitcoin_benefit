'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  ReferenceDot,
  AreaChart
} from 'recharts';
import { VestingTimelinePoint } from '@/types/vesting';
import VirtualizedAnnualBreakdown from './VirtualizedAnnualBreakdown';

interface VestingTimelineChartProps {
  timeline: VestingTimelinePoint[];
  initialGrant: number;
  annualGrant?: number;
  projectedBitcoinGrowth: number;
  currentBitcoinPrice: number;
  schemeId?: string;
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
  coordinate?: { x?: number; y?: number };
}

const CustomTooltip = ({ active, payload, label, yearlyData, coordinate }: CustomTooltipProps) => {
  if (active && payload && payload.length && yearlyData) {
    const year = Number(label);
    const vestingPercent = year >= 10 ? 100 : year >= 5 ? 50 : 0;
    
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
            vestingPercent === 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' :
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

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: any;
  dataKey?: string;
}

const CustomDot = ({ cx, cy, payload, dataKey }: CustomDotProps) => {
  const year = payload.year;
  const isVestingMilestone = year === 5 || year === 10;

  if (!isVestingMilestone) return null;

  const color = dataKey === 'btcBalance' ? '#3b82f6' : '#F7931A';
  const glowColor = year === 5 ? '#fbbf24' : '#10b981';

  return (
    <g>
      {/* Glow effect */}
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill={glowColor}
        opacity={0.2}
      />
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={glowColor}
        opacity={0.3}
      />
      {/* Main dot */}
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={color}
        stroke="white"
        strokeWidth={2}
      />
    </g>
  );
};



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
            <rect x="0" y="0" width="24" height="12" fill="#F7931A" opacity="0.9" stroke="#F7931A" strokeWidth="1" rx="2" />
          </svg>
          <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
            Annual Grant Cost
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
              strokeWidth="4"
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
        {schemeId === 'accelerator' && `Single grant of ${formatBTC(initialGrant)} at year 0`}
        {schemeId === 'steady-builder' && `Initial ${formatBTC(initialGrant)} + ${formatBTC(annualGrant || 0)} annually for 5 years`}
        {schemeId === 'slow-burn' && `${formatBTC(annualGrant || 0)} annually for 10 years`}
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
  schemeId
}: VestingTimelineChartProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Extend timeline to 10 years (120 months) if needed
  const extendedTimeline = useMemo(() => {
    const extended = [...timeline];
    const maxMonth = Math.max(...timeline.map(p => p.month));
    const targetMonths = 120; // 10 years

    if (maxMonth < targetMonths) {
      const monthlyGrowthRate = projectedBitcoinGrowth / 12 / 100;
      const lastPoint = timeline[timeline.length - 1];

      for (let month = maxMonth + 1; month <= targetMonths; month++) {
        const bitcoinPrice = currentBitcoinPrice * Math.pow(1 + monthlyGrowthRate, month);
        const employerBalance = lastPoint.employerBalance;

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
  }, [timeline, projectedBitcoinGrowth, currentBitcoinPrice]);

  // Data processing for yearly points with grant information
  const yearlyData = useMemo(() => {
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
          grantCost = initialGrant * currentBitcoinPrice; // Cost at today's price
          isInitialGrant = true;
        } else if (annualGrant && annualGrant > 0 && year > 0) {
          // Check scheme-specific grant rules
          if (schemeId === 'slow-burn' && year <= 10) {
            grantSize = annualGrant;
            grantCost = annualGrant * currentBitcoinPrice;
          } else if (schemeId === 'steady-builder' && year <= 5) {
            grantSize = annualGrant;
            grantCost = annualGrant * currentBitcoinPrice;
          }
        }
        
        return {
          year,
          btcBalance: point.employerBalance,
          usdValue: point.employerBalance * point.bitcoinPrice,
          bitcoinPrice: point.bitcoinPrice,
          vestedAmount: point.vestedAmount,
          grantSize,
          grantCost, // Annual grant cost in USD
          isInitialGrant
        };
      });
      
    return data;
  }, [extendedTimeline, initialGrant, annualGrant, schemeId, currentBitcoinPrice]);

  // Calculate cost basis based on scheme
  const costBasis = useMemo(() => {
    let totalCost = 0;
    const annualGrowthRate = 1 + (projectedBitcoinGrowth / 100);
    
    // Initial grant cost (year 0 at current price)
    if (initialGrant > 0) {
      totalCost += initialGrant * currentBitcoinPrice;
    }
    
    // Annual grant costs at projected future prices
    if (annualGrant && annualGrant > 0) {
      if (schemeId === 'slow-burn') {
        // 10 years of annual grants at projected prices
        for (let year = 1; year <= 10; year++) {
          const projectedPrice = currentBitcoinPrice * Math.pow(annualGrowthRate, year);
          totalCost += annualGrant * projectedPrice;
        }
      } else if (schemeId === 'steady-builder') {
        // 5 years of annual grants at projected prices
        for (let year = 1; year <= 5; year++) {
          const projectedPrice = currentBitcoinPrice * Math.pow(annualGrowthRate, year);
          totalCost += annualGrant * projectedPrice;
        }
      }
    }
    
    return totalCost;
  }, [initialGrant, annualGrant, currentBitcoinPrice, schemeId, projectedBitcoinGrowth]);

  // Calculate current year for vesting display
  const currentYear = new Date().getFullYear();

  const finalYear = yearlyData[10]; // Year 10 is the final year
  
  const growthMultiple = useMemo(() => {
    if (!finalYear) return 0;
    
    const finalValue = finalYear.btcBalance * finalYear.bitcoinPrice;
    
    // Calculate total cost invested (sum of all grant costs)
    let totalCostInvested = 0;
    yearlyData.forEach((point) => {
      if (point.grantCost > 0) {
        totalCostInvested += point.grantCost;
      }
    });
    
    return totalCostInvested > 0 ? finalValue / totalCostInvested : 0;
  }, [finalYear, yearlyData]);

  // Calculate Y-axis domain for USD only
  const usdDomain = useMemo(() => {
    // Get max value from either grant cost or USD value
    const maxUsd = Math.max(...yearlyData.map(d => d.usdValue));
    const maxCost = Math.max(...yearlyData.map(d => d.grantCost));
    const maxValue = Math.max(maxUsd, maxCost);
    
    // Add 20% padding for visual clarity
    const padding = maxValue * 0.20;
    
    return [0, maxValue + padding];
  }, [yearlyData]);

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
          {annualGrant && (
            <span className="flex items-center gap-1">
              <span className="font-medium">• Annual:</span>
              <span className="text-bitcoin dark:text-bitcoin font-bold">{formatBTC(annualGrant)} per year</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="font-medium">• 50% vests:</span>
            <span className="text-gray-600 dark:text-gray-400 font-bold">{currentYear + 5}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium">• 100% vests:</span>
            <span className="text-gray-600 dark:text-gray-400 font-bold">{currentYear + 10}</span>
          </span>
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
          height={isMobile ? 320 : 420} 
          minHeight={280}
          debounce={100}
        >
          <ComposedChart
            data={yearlyData}
            throttleDelay={50}
            margin={isMobile
              ? { top: 20, right: 15, bottom: 25, left: 25 }
              : { top: 30, right: 30, bottom: 40, left: 45 }
            }
            maxBarSize={isMobile ? 20 : undefined}
            onMouseMove={useCallback((e: any) => {
              if (e && e.activeLabel !== undefined) {
                setHoveredYear(e.activeLabel);
              }
            }, [])}
            onMouseLeave={useCallback(() => setHoveredYear(null), [])}
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
              ticks={[0, 2, 4, 6, 8, 10]}
              domain={[0, 10]}
              axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
              tickLine={false}
              tick={(props: any) => {
                const { x, y, payload } = props;
                const isVestingMilestone = payload.value === 5 || payload.value === 10;
                
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={16}
                      textAnchor="middle"
                      fill={isVestingMilestone ? '#059669' : '#6b7280'}
                      fontSize={12}
                      fontWeight={isVestingMilestone ? 600 : 500}
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
              axisLine={{ stroke: '#10b981', strokeWidth: 2 }}
              tick={{ fill: '#10b981', fontSize: 13, fontWeight: 600 }}
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


            {/* Bar chart for annual grant costs */}
            <Bar
              yAxisId="usd"
              dataKey="grantCost"
              fill="url(#costGradient)"
              name="Annual Grant Cost"
              isAnimationActive={!isMobile}
              animationDuration={1500}
              radius={[4, 4, 0, 0]}
              maxBarSize={15}
            />

            {/* Add subtle area fills */}
            <Area
              yAxisId="usd"
              type="monotone"
              dataKey="usdValue"
              fill="url(#usdAreaGradient)"
              stroke="none"
              isAnimationActive={!isMobile}
              animationDuration={2000}
              name="" // Hide from legend
            />

            {/* USD Value line only - no BTC line */}

            <Line
              yAxisId="usd"
              type="monotone"
              dataKey="usdValue"
              stroke="url(#usdGradient)"
              strokeWidth={4}
              name="USD Value"
              dot={false}
              isAnimationActive={!isMobile}
              animationDuration={2000}
              animationEasing="ease-in-out"
              filter="url(#glow)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Key Insights Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2 uppercase tracking-wide">10-Year Projection</div>
          <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">
            {formatUSDCompact(finalYear?.usdValue || 0)}
          </div>
          <div className="text-xs text-green-700 dark:text-green-400">
            Based on {projectedBitcoinGrowth}% annual growth
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border border-orange-200 dark:border-orange-800 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-sm font-semibold text-bitcoin dark:text-bitcoin mb-2 uppercase tracking-wide">Total BTC Grants</div>
          <div className="text-3xl font-bold text-bitcoin dark:text-bitcoin mb-1">
            {formatBTC(yearlyData[10]?.btcBalance || 0)}
          </div>
          <div className="text-xs text-orange-700 dark:text-orange-400">
            Employer grants only
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 uppercase tracking-wide">Growth Multiple</div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
            {isNaN(growthMultiple) || !isFinite(growthMultiple) || growthMultiple <= 0 
              ? 'N/A' 
              : `${growthMultiple.toFixed(1)}x`
            }
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-400">
            From total cost invested
          </div>
        </div>
      </div>

      {/* Virtualized Annual Breakdown Table */}
      <VirtualizedAnnualBreakdown
        yearlyData={yearlyData}
        initialGrant={initialGrant}
        annualGrant={annualGrant}
        currentBitcoinPrice={currentBitcoinPrice}
        schemeId={schemeId}
        maxDisplayYears={11}
      />
    </div>
  );
}

// Export without memoization to ensure updates when props change
export default VestingTimelineChartRecharts;

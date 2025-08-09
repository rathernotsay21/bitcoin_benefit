'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  Area,
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
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const year = Number(label);
    const vestingPercent = year >= 10 ? 100 : year >= 5 ? 50 : 0;

    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg p-4 border border-gray-200/50 dark:border-slate-700/50 rounded-xl shadow-2xl">
        <p className="font-bold text-gray-900 dark:text-white mb-3 text-base">Year {year}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-2">
            <span className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}:
            </span>
            <span className="text-sm font-bold" style={{ color: entry.color }}>
              {entry.name.includes('BTC') ? formatBTC(entry.value) : formatUSDCompact(entry.value)}
            </span>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
            vestingPercent === 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
            vestingPercent === 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' :
            'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
          }`}>
            {vestingPercent}% Vested
          </span>
        </div>
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

  const color = dataKey === 'btcBalance' ? '#3b82f6' : '#f97316';
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

const CustomLegend = () => {
  return (
    <div className="flex justify-center gap-8 mt-4">
      <div className="flex items-center gap-3">
        <svg width="24" height="3" className="overflow-visible">
          <line
            x1="0"
            y1="1.5"
            x2="24"
            y2="1.5"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeDasharray="8 4"
            filter="drop-shadow(0 0 4px #3b82f640)"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          BTC Balance
        </span>
      </div>
      <div className="flex items-center gap-3">
        <svg width="24" height="3" className="overflow-visible">
          <line
            x1="0"
            y1="1.5"
            x2="24"
            y2="1.5"
            stroke="#f97316"
            strokeWidth="4"
            filter="drop-shadow(0 0 4px #f9731640)"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          USD Value
        </span>
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

  // Extend timeline to 20 years (240 months) if needed
  const extendedTimeline = useMemo(() => {
    const extended = [...timeline];
    const maxMonth = Math.max(...timeline.map(p => p.month));
    const targetMonths = 240; // 20 years

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

  // Data processing for yearly points
  const yearlyData = useMemo(() => 
    extendedTimeline
      .filter((_, index) => index % 12 === 0)
      .slice(0, 21)
      .map((point, index) => ({
        year: index,
        btcBalance: point.employerBalance,
        usdValue: point.employerBalance * point.bitcoinPrice,
        bitcoinPrice: point.bitcoinPrice,
        vestedAmount: point.vestedAmount
      })),
    [extendedTimeline]
  );

  const vestingMilestones = useMemo(() => [
    { year: 5, label: '50% Vested', color: '#fbbf24' },
    { year: 10, label: '100% Vested', color: '#10b981' }
  ], []);

  const finalYear = yearlyData[20];
  
  const growthMultiple = useMemo(() => {
    if (!finalYear) return 0;
    
    const finalValue = finalYear.btcBalance * finalYear.bitcoinPrice;
    
    if (initialGrant === 0) {
      let totalCostInvested = 0;
      yearlyData.slice(0, 11).forEach((point) => {
        const year = point.year;
        if (year > 0 && annualGrant && annualGrant > 0) {
          const maxAnnualYears = schemeId === 'slow-burn' ? 10 : 5;
          if (year <= maxAnnualYears) {
            totalCostInvested += annualGrant * point.bitcoinPrice;
          }
        }
      });
      
      return totalCostInvested > 0 ? finalValue / totalCostInvested : 0;
    }
    
    const initialInvestment = initialGrant * currentBitcoinPrice;
    return initialInvestment > 0 ? finalValue / initialInvestment : 0;
  }, [finalYear, initialGrant, annualGrant, schemeId, yearlyData, currentBitcoinPrice]);

  // Calculate Y-axis domains with better padding
  const { btcDomain, usdDomain } = useMemo(() => {
    const btcValues = yearlyData.map(d => d.btcBalance);
    const usdValues = yearlyData.map(d => d.usdValue);

    const minBtc = Math.min(...btcValues);
    const maxBtc = Math.max(...btcValues);
    const minUsd = Math.min(...usdValues);
    const maxUsd = Math.max(...usdValues);

    // Improved padding calculation
    const btcRange = maxBtc - minBtc;
    const usdRange = maxUsd - minUsd;
    
    // Use 15% padding for better visual balance
    const btcPadding = btcRange > 0 ? btcRange * 0.15 : maxBtc * 0.15;
    const usdPadding = usdRange > 0 ? usdRange * 0.15 : maxUsd * 0.15;

    return {
      btcDomain: [
        Math.max(0, minBtc - btcPadding),
        maxBtc + btcPadding
      ],
      usdDomain: [
        Math.max(0, minUsd - usdPadding),
        maxUsd + usdPadding
      ]
    };
  }, [yearlyData]);

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          20-Year Vesting Timeline Projection
        </h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="font-medium">Initial:</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">{formatBTC(initialGrant)}</span>
          </span>
          {annualGrant && (
            <span className="flex items-center gap-1">
              <span className="font-medium">• Annual:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{formatBTC(annualGrant)} per year</span>
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
          <span className="flex items-center gap-1">
            <span className="font-medium">Current BTC Price:</span>
            <span className="text-orange-600 dark:text-orange-400 font-bold">{formatUSD(currentBitcoinPrice)}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium">• Projected Growth:</span>
            <span className="text-green-600 dark:text-green-400 font-bold">{projectedBitcoinGrowth}% annually</span>
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
              ? { top: 20, right: 20, bottom: 25, left: 30 }
              : { top: 40, right: 70, bottom: 40, left: 70 }
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
              {/* Gradient for BTC line */}
              <linearGradient id="btcGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={1} />
              </linearGradient>
              
              {/* Gradient for USD line */}
              <linearGradient id="usdGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fb923c" stopOpacity={1} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={1} />
              </linearGradient>

              {/* Area gradients */}
              <linearGradient id="btcAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>

              <linearGradient id="usdAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
              </linearGradient>

              {/* Glow filters */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb30" 
              vertical={false}
            />

            <XAxis
              dataKey="year"
              ticks={[0, 5, 10, 15, 20]}
              domain={[0, 20]}
              axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
              label={{ value: 'Years', position: 'insideBottom', offset: -5, style: { fill: '#6b7280', fontSize: 11 } }}
            />

            <YAxis
              yAxisId="btc"
              orientation="left"
              tickFormatter={(value) => formatBTC(value)}
              stroke="#3b82f6"
              domain={btcDomain}
              axisLine={{ stroke: '#3b82f6', strokeWidth: 2 }}
              tick={{ fill: '#3b82f6', fontSize: 11, fontWeight: 500 }}
              tickLine={false}
            />

            <YAxis
              yAxisId="usd"
              orientation="right"
              tickFormatter={(value) => formatUSDCompact(value)}
              stroke="#f97316"
              domain={usdDomain}
              axisLine={{ stroke: '#f97316', strokeWidth: 2 }}
              tick={{ fill: '#f97316', fontSize: 11, fontWeight: 500 }}
              tickLine={false}
            />

            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }}
            />

            <Legend
              content={<CustomLegend />}
              wrapperStyle={{ paddingTop: '20px' }}
            />

            {/* Vesting milestone reference lines with enhanced styling */}
            {vestingMilestones.map(milestone => (
              <ReferenceLine
                key={milestone.year}
                x={milestone.year}
                stroke={milestone.color}
                strokeDasharray="8 4"
                strokeWidth={2}
                strokeOpacity={0.5}
                yAxisId="btc"
                label={!isMobile ? {
                  value: milestone.label,
                  position: 'top',
                  fill: milestone.color,
                  style: { 
                    fontSize: 13, 
                    fontWeight: 'bold',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                  }
                } : undefined}
              />
            ))}

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

            {/* Lines with enhanced styling */}
            <Line
              yAxisId="btc"
              type="monotone"  // Using monotone for accurate representation without weird bends
              dataKey="btcBalance"
              stroke="url(#btcGradient)"
              strokeWidth={3}
              strokeDasharray="8 4"
              name="BTC Balance"
              dot={<CustomDot />}
              isAnimationActive={!isMobile}
              animationDuration={2000}
              animationEasing="ease-in-out"
              filter="url(#glow)"
            />

            <Line
              yAxisId="usd"
              type="monotone"  // Using monotone for consistency
              dataKey="usdValue"
              stroke="url(#usdGradient)"
              strokeWidth={4}
              name="USD Value"
              dot={<CustomDot />}
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
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border border-orange-200 dark:border-orange-800 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-2 uppercase tracking-wide">20-Year Projection</div>
          <div className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-1">
            {formatUSDCompact(finalYear?.usdValue || 0)}
          </div>
          <div className="text-xs text-orange-700 dark:text-orange-400">
            Based on {projectedBitcoinGrowth}% annual growth
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 uppercase tracking-wide">Total BTC Grants</div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
            {formatBTC(yearlyData[10]?.btcBalance || 0)}
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-400">
            Employer grants only
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2 uppercase tracking-wide">Growth Multiple</div>
          <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">
            {isNaN(growthMultiple) || !isFinite(growthMultiple) || growthMultiple <= 0 
              ? 'N/A' 
              : `${growthMultiple.toFixed(1)}x`
            }
          </div>
          <div className="text-xs text-green-700 dark:text-green-400">
            {initialGrant > 0 ? 'From initial investment' : 'From total cost invested'}
          </div>
        </div>
      </div>

      {/* Annual Breakdown Table - keeping the original table but with enhanced styling */}
      <div className="mt-6 w-full overflow-hidden">
      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Annual Breakdown</h4>
      <div className="overflow-x-auto rounded-xl shadow-lg w-full">
          <table className="min-w-full w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700">
              <tr>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Year</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Grant Cost</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">BTC</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">BTC Price</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">USD Value</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {yearlyData.slice(0, 11).map((point) => {
                const year = point.year;
                const vestingPercent = year >= 10 ? 100 : year >= 5 ? 50 : 0;

                let grantCost = 0;
                if (year === 0 && initialGrant > 0) {
                  grantCost = initialGrant * currentBitcoinPrice;
                } else if (year > 0 && annualGrant && annualGrant > 0) {
                  const maxAnnualYears = schemeId === 'slow-burn' ? 10 : 5;
                  if (year <= maxAnnualYears) {
                    grantCost = annualGrant * point.bitcoinPrice;
                  }
                }

                return (
                  <tr key={year} className={`
                    hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors
                    ${year === 10 ? 'bg-green-50/50 dark:bg-green-900/20' : 
                    year === 5 ? 'bg-yellow-50/50 dark:bg-yellow-900/20' : ''}
                  `}>
                    <td className="px-2 sm:px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{year}</td>
                    <td className="px-2 sm:px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                      {grantCost > 0 ? (
                        <span className="font-semibold text-orange-600 dark:text-orange-400">{formatUSD(grantCost)}</span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">{formatBTC(point.btcBalance)}</td>
                    <td className="px-2 sm:px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hidden md:table-cell">{formatUSD(point.bitcoinPrice)}</td>
                    <td className="px-2 sm:px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{formatUSD(point.usdValue)}</td>
                    <td className="px-2 sm:px-4 py-3 text-sm">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                        vestingPercent === 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md' :
                        vestingPercent === 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md' :
                        'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                      }`}>
                        {vestingPercent}% Vested
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Enhanced Total Grant Cost Summary */}
        <div className="mt-6 p-5 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border border-orange-200 dark:border-orange-800 rounded-xl shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h5 className="text-base font-bold text-orange-900 dark:text-orange-200 mb-1">Total Grant Cost</h5>
              <p className="text-xs text-orange-700 dark:text-orange-400">
                Based on projected Bitcoin price for each grant year
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-1">
                {(() => {
                  let totalCost = 0;
                  yearlyData.slice(0, 11).forEach((point) => {
                    const year = point.year;
                    if (year === 0 && initialGrant > 0) {
                      totalCost += initialGrant * currentBitcoinPrice;
                    } else if (year > 0 && annualGrant && annualGrant > 0) {
                      const maxAnnualYears = schemeId === 'slow-burn' ? 10 : 5;
                      if (year <= maxAnnualYears) {
                        totalCost += annualGrant * point.bitcoinPrice;
                      }
                    }
                  });
                  return formatUSD(totalCost);
                })()}
              </div>
              <div className="text-sm font-medium text-orange-700 dark:text-orange-300">
                {(() => {
                  let totalBTC = 0;
                  if (initialGrant > 0) totalBTC += initialGrant;
                  if (annualGrant && annualGrant > 0) {
                    const maxAnnualYears = schemeId === 'slow-burn' ? 10 : 5;
                    totalBTC += annualGrant * maxAnnualYears;
                  }
                  return `${formatBTC(totalBTC)} total grants`;
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoize the component with custom comparison
export default React.memo(VestingTimelineChartRecharts, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render), false if different (re-render)
  return (
    prevProps.initialGrant === nextProps.initialGrant &&
    prevProps.annualGrant === nextProps.annualGrant &&
    prevProps.projectedBitcoinGrowth === nextProps.projectedBitcoinGrowth &&
    prevProps.currentBitcoinPrice === nextProps.currentBitcoinPrice &&
    prevProps.schemeId === nextProps.schemeId &&
    // Check timeline array
    prevProps.timeline.length === nextProps.timeline.length &&
    // Check first and last timeline points for changes
    (prevProps.timeline.length === 0 || 
      (prevProps.timeline[0].month === nextProps.timeline[0].month &&
       prevProps.timeline[0].bitcoinPrice === nextProps.timeline[0].bitcoinPrice &&
       prevProps.timeline[prevProps.timeline.length - 1].month === 
       nextProps.timeline[nextProps.timeline.length - 1].month &&
       prevProps.timeline[prevProps.timeline.length - 1].bitcoinPrice === 
       nextProps.timeline[nextProps.timeline.length - 1].bitcoinPrice))
  );
});

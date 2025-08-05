'use client';

import { useState, useEffect } from 'react';
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
  ComposedChart
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
  return `₿${amount.toFixed(6)}`;
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
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">Year {year}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name.includes('BTC') ? formatBTC(entry.value) : formatUSDCompact(entry.value)}
          </p>
        ))}
        <p className="text-sm mt-2 font-medium">
          <span className={`px-2 py-1 rounded-full text-xs ${vestingPercent === 100 ? 'bg-green-100 text-green-800' :
            vestingPercent === 50 ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
            {vestingPercent}% Vested
          </span>
        </p>
      </div>
    );
  }
  return null;
};

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: any;
}

const CustomDot = ({ cx, cy, payload }: CustomDotProps) => {
  const year = payload.year;
  const isVestingMilestone = year === 5 || year === 10;

  if (!isVestingMilestone) return null;

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={3}
        fill={year === 5 ? '#f59e0b' : '#10b981'}
        stroke="white"
        strokeWidth={1}
      />
    </g>
  );
};

export default function VestingTimelineChartRecharts({
  timeline,
  initialGrant,
  annualGrant,
  projectedBitcoinGrowth,
  currentBitcoinPrice,
  schemeId
}: VestingTimelineChartProps) {
  // Hook to detect mobile screen size
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  // Extend timeline to 20 years (240 months) if needed
  const extendedTimeline = [...timeline];
  const maxMonth = Math.max(...timeline.map(p => p.month));
  const targetMonths = 240; // 20 years

  if (maxMonth < targetMonths) {
    const monthlyGrowthRate = projectedBitcoinGrowth / 12 / 100;
    const lastPoint = timeline[timeline.length - 1];

    for (let month = maxMonth + 1; month <= targetMonths; month++) {
      const bitcoinPrice = currentBitcoinPrice * Math.pow(1 + monthlyGrowthRate, month);
      const employerBalance = lastPoint.employerBalance;

      extendedTimeline.push({
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

  // Data processing for yearly points (every 12 months)
  const yearlyData = extendedTimeline
    .filter((_, index) => index % 12 === 0)
    .slice(0, 21) // 0-20 years
    .map((point, index) => ({
      year: index,
      btcBalance: point.employerBalance,
      usdValue: point.employerBalance * point.bitcoinPrice,
      bitcoinPrice: point.bitcoinPrice,
      vestedAmount: point.vestedAmount
    }));

  // Key milestones
  const vestingMilestones = [
    { year: 5, label: '50% Vested', color: '#f59e0b' },
    { year: 10, label: '100% Vested', color: '#10b981' }
  ];

  const finalYear = yearlyData[20];
  
  // Calculate growth multiple properly for all scheme types
  const calculateGrowthMultiple = () => {
    if (!finalYear) return 0;
    
    const finalValue = finalYear.btcBalance * finalYear.bitcoinPrice;
    
    // For schemes with no initial grant (like Wealth Builder), calculate against total cost invested
    if (initialGrant === 0) {
      // Calculate total cost invested over the vesting period
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
    
    // For schemes with initial grant, use traditional calculation
    const initialInvestment = initialGrant * currentBitcoinPrice;
    return initialInvestment > 0 ? finalValue / initialInvestment : 0;
  };
  
  const growthMultiple = calculateGrowthMultiple();

  // Calculate Y-axis domains with padding for better readability
  const btcValues = yearlyData.map(d => d.btcBalance);
  const usdValues = yearlyData.map(d => d.usdValue);

  const minBtc = Math.min(...btcValues);
  const maxBtc = Math.max(...btcValues);
  const minUsd = Math.min(...usdValues);
  const maxUsd = Math.max(...usdValues);

  // Add 20% padding to the ranges
  const btcPadding = (maxBtc - minBtc) * 0.2;
  const usdPadding = (maxUsd - minUsd) * 0.2;

  // For flat lines (like Bitcoin Pioneer), ensure minimum padding
  const minBtcPadding = maxBtc * 0.1; // 10% of max value
  const minUsdPadding = maxUsd * 0.1;

  const btcDomain = [
    Math.max(0, minBtc - Math.max(btcPadding, minBtcPadding)),
    maxBtc + Math.max(btcPadding, minBtcPadding)
  ];

  const usdDomain = [
    Math.max(0, minUsd - Math.max(usdPadding, minUsdPadding)),
    maxUsd + Math.max(usdPadding, minUsdPadding)
  ];

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          20-Year Vesting Timeline Projection
        </h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            Initial: {formatBTC(initialGrant)}
            {annualGrant && ` • Annual: ${formatBTC(annualGrant)} per year`}
          </p>
          <p>Current BTC Price: {formatUSD(currentBitcoinPrice)} • Projected Bitcoin Growth: {projectedBitcoinGrowth}% annually</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-hidden">
        <ResponsiveContainer width="100%" height={480}>
          <ComposedChart
            data={yearlyData}
            margin={isMobile
              ? { top: 10, right: 40, bottom: 40, left: 40 }
              : { top: 20, right: 80, bottom: 60, left: 80 }
            }
          >


            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} horizontal={false} />

            <XAxis
              dataKey="year"
              ticks={[0, 5, 10, 15, 20]}
              domain={[0, 20]}
              axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
              tickLine={false}
              tick={{ dy: 10 }}
            />

            <YAxis
              yAxisId="btc"
              orientation="left"
              tickFormatter={(value) => formatBTC(value)}
              stroke="#3b82f6"
              domain={btcDomain}
            />

            <YAxis
              yAxisId="usd"
              orientation="right"
              tickFormatter={(value) => formatUSDCompact(value)}
              stroke="#f97316"
              domain={usdDomain}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="line"
              wrapperStyle={{
                paddingTop: '20px'
              }}
            />

            {/* Vesting milestone reference lines */}
            {vestingMilestones.map(milestone => (
              <ReferenceLine
                key={milestone.year}
                x={milestone.year}
                stroke={milestone.color}
                strokeDasharray="1 2"
                strokeWidth={1}
                yAxisId="btc"
                label={!isMobile ? {
                  value: milestone.label,
                  position: 'top',
                  fill: milestone.color,
                  style: { fontSize: 12, fontWeight: 'bold' }
                } : undefined}
              />
            ))}



            {/* Lines */}
            <Line
              yAxisId="btc"
              type="monotone"
              dataKey="btcBalance"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="BTC Balance"
              dot={<CustomDot />}
              isAnimationActive={true}
              animationDuration={1500}
            />

            <Line
              yAxisId="usd"
              type="monotone"
              dataKey="usdValue"
              stroke="#f97316"
              strokeWidth={3}
              name="USD Value"
              dot={<CustomDot />}
              isAnimationActive={true}
              animationDuration={1500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Key Insights */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm font-medium text-orange-800 mb-1">20-Year Projection</div>
          <div className="text-2xl font-bold text-orange-900">
            {formatUSDCompact(finalYear?.usdValue || 0)}
          </div>
          <div className="text-xs text-orange-700">
            Based on {projectedBitcoinGrowth}% annual growth
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-800 mb-1">Total BTC Grants</div>
          <div className="text-2xl font-bold text-blue-900">
            {formatBTC(yearlyData[10]?.btcBalance || 0)}
          </div>
          <div className="text-xs text-blue-700">
            Employer grants only
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-800 mb-1">Growth Multiple</div>
          <div className="text-2xl font-bold text-green-900">
            {isNaN(growthMultiple) || !isFinite(growthMultiple) || growthMultiple <= 0 
              ? 'N/A' 
              : `${growthMultiple.toFixed(1)}x`
            }
          </div>
          <div className="text-xs text-green-700">
            {initialGrant > 0 ? 'From initial investment' : 'From total cost invested'}
          </div>
        </div>
      </div>

      {/* Annual Breakdown Table */}
      <div className="mt-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Annual Breakdown</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grant Cost</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">BTC Balance</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">BTC Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">USD Value</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vesting Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {yearlyData.slice(0, 11).map((point) => {
                const year = point.year;
                const vestingPercent = year >= 10 ? 100 : year >= 5 ? 50 : 0;

                // Calculate grant cost based on each year's projected Bitcoin price
                let grantCost = 0;
                if (year === 0 && initialGrant > 0) {
                  // Initial grant cost - use current price for year 0
                  grantCost = initialGrant * currentBitcoinPrice;
                } else if (year > 0 && annualGrant && annualGrant > 0) {
                  // Annual grant cost (for schemes with annual grants)
                  // For Wealth Builder: years 1-10, for Dollar Cost Advantage: years 1-5
                  const maxAnnualYears = schemeId === 'slow-burn' ? 10 : 5;
                  if (year <= maxAnnualYears) {
                    // Use the projected Bitcoin price for this specific year
                    grantCost = annualGrant * point.bitcoinPrice;
                  }
                }

                return (
                  <tr key={year} className={
                    year === 10 ? 'bg-green-50' : 
                    year === 5 ? 'bg-yellow-50' : ''
                  }>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{year}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {grantCost > 0 ? (
                        <span className="font-medium text-orange-600">{formatUSD(grantCost)}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">{formatBTC(point.btcBalance)}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{formatUSD(point.bitcoinPrice)}</td>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">{formatUSD(point.usdValue)}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${vestingPercent === 100 ? 'bg-green-100 text-green-800' :
                        vestingPercent === 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
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

        {/* Total Grant Cost Summary */}
        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h5 className="text-sm font-semibold text-orange-900">Total Grant Cost</h5>
              <p className="text-xs text-orange-700 mt-1">
                Based on projected Bitcoin price for each grant year
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-orange-900">
                {(() => {
                  let totalCost = 0;
                  // Calculate total cost using projected prices for each year
                  yearlyData.slice(0, 11).forEach((point) => {
                    const year = point.year;
                    if (year === 0 && initialGrant > 0) {
                      // Initial grant cost - use current price for year 0
                      totalCost += initialGrant * currentBitcoinPrice;
                    } else if (year > 0 && annualGrant && annualGrant > 0) {
                      // Annual grant costs using projected prices
                      const maxAnnualYears = schemeId === 'slow-burn' ? 10 : 5;
                      if (year <= maxAnnualYears) {
                        totalCost += annualGrant * point.bitcoinPrice;
                      }
                    }
                  });
                  return formatUSD(totalCost);
                })()}
              </div>
              <div className="text-xs text-orange-700">
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

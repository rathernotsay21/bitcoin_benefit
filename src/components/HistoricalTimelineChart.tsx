'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import { HistoricalCalculationResult } from '@/types/vesting';

interface HistoricalTimelineChartProps {
  results: HistoricalCalculationResult;
  startingYear: number;
  currentBitcoinPrice: number;
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
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return formatUSD(amount);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  startingYear?: number;
}

const CustomTooltip = ({ active, payload, label, startingYear = 2020 }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const year = Number(label);
    const yearsFromStart = year - startingYear; // Calculate years from the actual starting year
    const vestingPercent = yearsFromStart >= 10 ? 100 : yearsFromStart >= 5 ? 50 : 0;

    return (
      <div className="bg-slate-800 p-4 border border-slate-700 rounded-sm shadow-sm">
        <p className="font-semibold text-white mb-2">Year {year}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-white" style={{ color: entry.color }}>
            {entry.name}: {entry.name.includes('BTC') ? formatBTC(entry.value) : formatUSDCompact(entry.value)}
          </p>
        ))}
        <p className="text-sm mt-2 font-medium">
          <span className={`px-2 py-1 rounded-full text-xs ${
            vestingPercent === 100 ? 'bg-green-100 text-green-800' :
            vestingPercent === 50 ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {vestingPercent}% Unlocked
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
  startingYear?: number;
}

const CustomDot = ({ cx, cy, payload, startingYear = 2020 }: CustomDotProps) => {
  const year = payload.year;
  const yearsFromStart = year - startingYear; // Calculate years from the actual starting year
  const isVestingMilestone = yearsFromStart === 5 || yearsFromStart === 10;

  if (!isVestingMilestone) return null;

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={3}
        fill={yearsFromStart === 5 ? '#f59e0b' : '#10b981'}
        stroke="white"
        strokeWidth={1}
      />
    </g>
  );
};

function HistoricalTimelineChart({
  results,
  startingYear,
  currentBitcoinPrice
}: HistoricalTimelineChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Transform historical timeline data for the chart - filter to yearly data points (December of each year)
  const chartData = useMemo(() => 
    results.timeline
      .filter((point) => point.month === 12 || (point.year === new Date().getFullYear() && point.month === new Date().getMonth() + 1))
      .map((point) => ({
        year: point.year, // Use the actual year from the timeline point
        btcBalance: point.cumulativeBitcoin,
        usdValue: point.currentValue,
        costBasis: point.cumulativeCostBasis,
        vestedAmount: point.vestedAmount
      })),
    [results.timeline]
  );

  // Calculate vesting milestones
  const vestingMilestones = useMemo(() => [
    { year: startingYear + 5, label: '50% Unlocked', color: '#f59e0b' },
    { year: startingYear + 10, label: '100% Unlocked', color: '#10b981' }
  ], [startingYear]);

  const currentYear = new Date().getFullYear();
  const finalPoint = chartData[chartData.length - 1];
  const totalYears = results.summary.yearsAnalyzed;

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Historical Performance Timeline ({startingYear}-{currentYear})
        </h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            Total Bitcoin Granted: {formatBTC(results.totalBitcoinGranted)} • 
            Cost Basis Method: Historical {results.summary.costBasisMethod} prices
          </p>
          <p>
            Analysis Period: {totalYears} years • 
            Annualized Return: {(results.annualizedReturn * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm p-4 overflow-hidden">
        <ResponsiveContainer width="100%" height={480} debounce={100}>
          <ComposedChart
            data={chartData}
            throttleDelay={50}
            margin={isMobile
              ? { top: 10, right: 40, bottom: 40, left: 40 }
              : { top: 20, right: 80, bottom: 60, left: 80 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} horizontal={false} />

            <XAxis
              dataKey="year"
              axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
              tickLine={false}
              tick={{ dy: 10 }}
            />

            <YAxis
              yAxisId="btc"
              orientation="left"
              tickFormatter={(value) => formatBTC(value)}
              stroke="#3b82f6"
            />

            <YAxis
              yAxisId="usd"
              orientation="right"
              tickFormatter={(value) => formatUSDCompact(value)}
              stroke="#f97316"
            />

            <Tooltip content={<CustomTooltip startingYear={startingYear} />} />

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
              dot={<CustomDot startingYear={startingYear} />}
              isAnimationActive={!isMobile}
              animationDuration={1500}
            />

            <Line
              yAxisId="usd"
              type="monotone"
              dataKey="usdValue"
              stroke="#f97316"
              strokeWidth={3}
              name="USD Value"
              dot={<CustomDot startingYear={startingYear} />}
              isAnimationActive={!isMobile}
              animationDuration={1500}
            />

            <Line
              yAxisId="usd"
              type="monotone"
              dataKey="costBasis"
              stroke="#6b7280"
              strokeWidth={2}
              strokeDasharray="3 3"
              name="Cost Basis"
              dot={false}
              isAnimationActive={!isMobile}
              animationDuration={1500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Key Insights */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-sm p-4">
          <div className="text-sm font-medium text-orange-800 mb-1">Current Value</div>
          <div className="text-2xl font-bold text-orange-900">
            {formatUSDCompact(results.currentTotalValue)}
          </div>
          <div className="text-xs text-bitcoin">
            {formatBTC(results.totalBitcoinGranted)} total
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
          <div className="text-sm font-medium text-blue-800 mb-1">Total Cost Basis</div>
          <div className="text-2xl font-bold text-blue-900">
            {formatUSDCompact(results.totalCostBasis)}
          </div>
          <div className="text-xs text-blue-700">
            Historical {results.summary.costBasisMethod} prices
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-sm p-4">
          <div className="text-sm font-medium text-green-800 mb-1">Total Return</div>
          <div className="text-2xl font-bold text-green-900">
            {formatUSDCompact(results.totalReturn)}
          </div>
          <div className="text-xs text-green-700">
            {((results.totalReturn / results.totalCostBasis) * 100).toFixed(0)}% gain
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoize the component with custom comparison
export default React.memo(HistoricalTimelineChart, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render), false if different (re-render)
  return (
    prevProps.startingYear === nextProps.startingYear &&
    prevProps.currentBitcoinPrice === nextProps.currentBitcoinPrice &&
    // Deep comparison for results object
    prevProps.results.totalBitcoinGranted === nextProps.results.totalBitcoinGranted &&
    prevProps.results.totalCostBasis === nextProps.results.totalCostBasis &&
    prevProps.results.currentTotalValue === nextProps.results.currentTotalValue &&
    prevProps.results.totalReturn === nextProps.results.totalReturn &&
    prevProps.results.annualizedReturn === nextProps.results.annualizedReturn &&
    prevProps.results.summary.yearsAnalyzed === nextProps.results.summary.yearsAnalyzed &&
    prevProps.results.summary.costBasisMethod === nextProps.results.summary.costBasisMethod &&
    prevProps.results.timeline.length === nextProps.results.timeline.length &&
    // Check first and last timeline points for changes
    (prevProps.results.timeline.length === 0 || 
      (prevProps.results.timeline[0].month === nextProps.results.timeline[0].month &&
       prevProps.results.timeline[prevProps.results.timeline.length - 1].month === 
       nextProps.results.timeline[nextProps.results.timeline.length - 1].month))
  );
});
'use client';

import React, { memo, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Dot
} from 'recharts';
import { VestingChartTooltip } from './VestingChartTooltip';
import { VestingChartLegend } from './VestingChartLegend';
import { useChartFormatters } from './VestingChartData';

interface VestingChartCoreProps {
  data: Array<{
    year: number;
    btcBalance: number;
    usdValue: number;
    bitcoinPrice: number;
    vestedAmount: number;
    vestingPercent: number;
    grantSize: number;
    grantCost: number;
    isInitialGrant: boolean;
  }>;
  usdDomain: [number, number];
  usdTicks: number[];
  vestingMilestoneYears: number[];
  chartConfig: {
    height: number;
    margin: { top: number; right: number; bottom: number; left: number };
  };
  schemeId?: string;
  onMouseMove?: (e: any) => void;
  onMouseLeave?: () => void;
  hoveredYear?: number | null;
}

// Custom dot for grant events
const CustomGrantDot = memo((props: any) => {
  const { cx, cy, payload } = props;
  
  if (!payload.grantSize || payload.grantSize <= 0) return null;
  
  const isInitialGrant = payload.isInitialGrant;
  const radius = isInitialGrant ? 6 : 4;
  const fill = isInitialGrant ? '#3b82f6' : '#10b981';
  
  return (
    <g>
      <circle 
        cx={cx} 
        cy={cy} 
        r={radius + 2} 
        fill="white" 
        stroke={fill} 
        strokeWidth="2"
      />
      <circle 
        cx={cx} 
        cy={cy} 
        r={radius} 
        fill={fill}
      />
    </g>
  );
});

CustomGrantDot.displayName = 'CustomGrantDot';

export const VestingChartCore = memo<VestingChartCoreProps>(({
  data,
  usdDomain,
  usdTicks,
  vestingMilestoneYears,
  chartConfig,
  schemeId = 'Vesting',
  onMouseMove,
  onMouseLeave,
  hoveredYear
}) => {
  const { formatUSD, formatUSDCompact, formatBTC } = useChartFormatters();

  // Memoize chart props
  const chartProps = useMemo(() => ({
    data,
    margin: chartConfig.margin,
    onMouseMove,
    onMouseLeave
  }), [data, chartConfig.margin, onMouseMove, onMouseLeave]);

  // Memoize axis props
  const xAxisProps = useMemo(() => ({
    dataKey: 'year',
    tick: { fontSize: 12 },
    tickLine: false,
    axisLine: { stroke: '#e5e7eb' }
  }), []);

  const yAxisProps = useMemo(() => ({
    domain: usdDomain,
    ticks: usdTicks,
    tick: { fontSize: 12 },
    tickLine: false,
    axisLine: { stroke: '#e5e7eb' },
    tickFormatter: formatUSDCompact
  }), [usdDomain, usdTicks, formatUSDCompact]);

  return (
    <ResponsiveContainer width="100%" height={chartConfig.height}>
      <ComposedChart {...chartProps}>
        <defs>
          <linearGradient id="colorUsd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorBtc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f2a900" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#f2a900" stopOpacity={0.1}/>
          </linearGradient>
        </defs>

        <CartesianGrid 
          strokeDasharray="3 3" 
          vertical={false}
          stroke="#e5e7eb"
          opacity={0.5}
        />

        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />

        <Tooltip
          content={
            <VestingChartTooltip
              formatUSD={formatUSD}
              formatBTC={formatBTC}
              schemeId={schemeId}
            />
          }
          cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
        />

        <Legend content={<VestingChartLegend />} />

        {/* Vesting milestone reference lines */}
        {vestingMilestoneYears.map((year) => (
          <ReferenceLine
            key={`vesting-${year}`}
            x={year}
            stroke="#f2a900"
            strokeDasharray="5 5"
            strokeWidth={2}
            opacity={0.6}
          />
        ))}

        {/* USD Value Bar */}
        <Bar
          dataKey="usdValue"
          fill="url(#colorUsd)"
          stroke="#3b82f6"
          strokeWidth={1}
          radius={[4, 4, 0, 0]}
          name="USD Value"
          animationDuration={800}
          animationBegin={0}
        />

        {/* Bitcoin Price Line */}
        <Line
          type="monotone"
          dataKey="bitcoinPrice"
          stroke="#f2a900"
          strokeWidth={2}
          dot={false}
          name="Bitcoin Price"
          yAxisId={0}
          animationDuration={1000}
          animationBegin={200}
        />

        {/* Grant Events Dots */}
        <Line
          type="monotone"
          dataKey="usdValue"
          stroke="transparent"
          dot={<CustomGrantDot />}
          name="Grant Events"
          animationDuration={1200}
          animationBegin={400}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
});

VestingChartCore.displayName = 'VestingChartCore';
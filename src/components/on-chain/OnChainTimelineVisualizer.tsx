'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { ExpectedGrant, AnnotatedTransaction } from '@/types/on-chain';
import { formatBTC, formatUSD, formatUSDCompact } from '@/lib/utils';

interface OnChainTimelineVisualizerProps {
  expectedGrants: ExpectedGrant[];
  actualTransactions: AnnotatedTransaction[];
  vestingStartDate: string;
}

interface TimelineDataPoint {
  year: number;
  expectedAmount: number;
  actualAmount: number | null;
  expectedDate: string;
  actualDate: string | null;
  status: 'matched' | 'unmatched' | 'other';
  matchedTxid?: string;
  actualValueUSD: number | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const year = Number(label);
    const data = payload[0]?.payload as TimelineDataPoint;
    
    if (!data) return null;

    return (
      <div 
        className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg p-4 border border-gray-200/50 dark:border-slate-700/50 rounded-xl shadow-2xl"
        role="tooltip"
        aria-live="polite"
      >
        <p className="font-bold text-gray-900 dark:text-white mb-3 text-base">
          Year {year}
        </p>
        
        {/* Expected Grant Info */}
        <div className="mb-3">
          <div className="flex items-center justify-between gap-4 mb-1">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Expected Grant:
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {formatBTC(data.expectedAmount)}
            </span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Due: {new Date(data.expectedDate).toLocaleDateString()}
          </div>
        </div>

        {/* Actual Transaction Info */}
        {data.status === 'matched' && data.actualAmount !== null ? (
          <div className="mb-3">
            <div className="flex items-center justify-between gap-4 mb-1">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Actual Grant:
              </span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {formatBTC(data.actualAmount)}
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Received: {data.actualDate ? new Date(data.actualDate).toLocaleDateString() : 'N/A'}
            </div>
            {data.actualValueUSD && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Value: {formatUSD(data.actualValueUSD)}
              </div>
            )}
          </div>
        ) : (
          <div className="mb-3">
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              No matching transaction found
            </span>
          </div>
        )}

        {/* Status Badge */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
            data.status === 'matched' 
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
              : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
          }`}>
            {/* Visual indicator for accessibility */}
            {data.status === 'matched' ? (
              <>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Grant Received
              </>
            ) : (
              <>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Grant Missing
              </>
            )}
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
  payload?: TimelineDataPoint;
  dataKey?: string;
}

const CustomExpectedDot = ({ cx, cy, payload }: CustomDotProps) => {
  if (!payload || cx === undefined || cy === undefined) return null;

  return (
    <g role="img" aria-label={`Expected grant year ${payload.year}: ${formatBTC(payload.expectedAmount)}`}>
      {/* Glow effect */}
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill="#3b82f6"
        opacity={0.2}
      />
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#3b82f6"
        opacity={0.3}
      />
      {/* Main dot */}
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#3b82f6"
        stroke="white"
        strokeWidth={2}
      />
    </g>
  );
};

const CustomActualDot = ({ cx, cy, payload }: CustomDotProps) => {
  if (!payload || cx === undefined || cy === undefined || payload.actualAmount === null) return null;

  const color = payload.status === 'matched' ? '#10b981' : '#ef4444';
  const statusText = payload.status === 'matched' ? 'received' : 'missing';

  return (
    <g role="img" aria-label={`Year ${payload.year} grant ${statusText}: ${formatBTC(payload.actualAmount)}`}>
      {/* Glow effect */}
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill={color}
        opacity={0.2}
      />
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={color}
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
      {/* Status indicator icon for accessibility */}
      {payload.status === 'matched' ? (
        <path
          d={`M${cx-2} ${cy}l1 1 2-2`}
          stroke="white"
          strokeWidth={1}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <line
            x1={cx-2}
            y1={cy-2}
            x2={cx+2}
            y2={cy+2}
            stroke="white"
            strokeWidth={1}
            strokeLinecap="round"
          />
          <line
            x1={cx-2}
            y1={cy+2}
            x2={cx+2}
            y2={cy-2}
            stroke="white"
            strokeWidth={1}
            strokeLinecap="round"
          />
        </>
      )}
    </g>
  );
};

const CustomLegend = () => {
  return (
    <div 
      className="flex justify-center gap-8 mt-4"
      role="img" 
      aria-label="Chart legend"
    >
      <div className="flex items-center gap-3">
        <svg width="24" height="3" className="overflow-visible" aria-hidden="true">
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
          Expected Grants
        </span>
      </div>
      <div className="flex items-center gap-3">
        <svg width="24" height="3" className="overflow-visible" aria-hidden="true">
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
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Actual Grants
        </span>
      </div>
    </div>
  );
};

export default function OnChainTimelineVisualizer({
  expectedGrants,
  actualTransactions,
  vestingStartDate
}: OnChainTimelineVisualizerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [focusedYear, setFocusedYear] = useState<number | null>(null);
  const [announceData, setAnnounceData] = useState<string>('');
  
  // Refs for keyboard navigation
  const chartRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Responsive breakpoint detection
  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkBreakpoints();
    window.addEventListener('resize', checkBreakpoints);

    return () => window.removeEventListener('resize', checkBreakpoints);
  }, []);

  // Process data for visualization
  const timelineData: TimelineDataPoint[] = expectedGrants.map(grant => {
    // Find matching actual transaction
    const matchedTransaction = actualTransactions.find(tx => 
      tx.grantYear === grant.year && tx.type === 'Annual Grant'
    );

    return {
      year: grant.year,
      expectedAmount: grant.expectedAmountBTC,
      actualAmount: matchedTransaction?.amountBTC || null,
      expectedDate: grant.expectedDate,
      actualDate: matchedTransaction?.date || null,
      status: matchedTransaction ? 'matched' : 'unmatched',
      matchedTxid: matchedTransaction?.txid,
      actualValueUSD: matchedTransaction?.valueAtTimeOfTx || null,
    };
  });

  // Calculate statistics
  const totalExpected = expectedGrants.reduce((sum, grant) => sum + grant.expectedAmountBTC, 0);
  const totalReceived = timelineData.reduce((sum, point) => sum + (point.actualAmount || 0), 0);
  const matchedGrants = timelineData.filter(point => point.status === 'matched').length;
  const totalExpectedValue = timelineData.reduce((sum, point) => sum + (point.actualValueUSD || 0), 0);

  // Calculate Y-axis domain with padding
  const allAmounts = [
    ...timelineData.map(d => d.expectedAmount),
    ...timelineData.map(d => d.actualAmount).filter(Boolean) as number[]
  ];
  
  const minAmount = Math.min(...allAmounts);
  const maxAmount = Math.max(...allAmounts);
  const range = maxAmount - minAmount;
  const padding = range > 0 ? range * 0.15 : maxAmount * 0.15;

  const yDomain = [
    Math.max(0, minAmount - padding),
    maxAmount + padding
  ];

  // Keyboard navigation for chart
  const handleChartKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!timelineData.length) return;
    
    const currentIndex = focusedYear ? timelineData.findIndex(d => d.year === focusedYear) : -1;
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        newIndex = currentIndex < timelineData.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : timelineData.length - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = timelineData.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedYear) {
          const data = timelineData.find(d => d.year === focusedYear);
          if (data) {
            announceDataPoint(data);
          }
        }
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < timelineData.length) {
      const newYear = timelineData[newIndex].year;
      setFocusedYear(newYear);
      announceDataPoint(timelineData[newIndex]);
    }
  }, [focusedYear, timelineData]);

  // Announce data point for screen readers
  const announceDataPoint = useCallback((data: TimelineDataPoint) => {
    const status = data.status === 'matched' ? 'received' : 'not received';
    const expectedText = `Year ${data.year}: Expected ${formatBTC(data.expectedAmount)}`;
    const actualText = data.actualAmount 
      ? `, actual ${formatBTC(data.actualAmount)} ${status}`
      : `, grant ${status}`;
    const valueText = data.actualValueUSD 
      ? `, valued at ${formatUSD(data.actualValueUSD)}`
      : '';
    
    const announcement = expectedText + actualText + valueText;
    setAnnounceData(announcement);
    
    // Clear announcement after brief delay
    setTimeout(() => setAnnounceData(''), 1000);
  }, []);

  // Skip to table functionality
  const skipToTable = useCallback(() => {
    if (tableRef.current) {
      tableRef.current.focus();
    }
  }, []);

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Screen reader announcements */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {announceData}
      </div>

      {/* Skip link for keyboard users */}
      <button
        onClick={skipToTable}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-bitcoin text-white px-4 py-2 rounded z-50 focus:outline-none focus:ring-2 focus:ring-bitcoin-light"
      >
        Skip to data table
      </button>

      <div className="mb-6">
        <h3 
          className="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight"
          id="timeline-heading"
        >
          10-Year Vesting Grant Timeline
        </h3>
        <div 
          className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400"
          aria-describedby="timeline-heading"
        >
          <span className="flex items-center gap-1">
            <span className="font-medium">Start Date:</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {new Date(vestingStartDate).toLocaleDateString()}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium">• Expected Total:</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">{formatBTC(totalExpected)}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium">• Received:</span>
            <span className="text-green-600 dark:text-green-400 font-bold">{formatBTC(totalReceived)}</span>
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl">
        {/* Chart accessibility instructions */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
            Chart Navigation Instructions
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Use arrow keys to navigate data points, Enter/Space to announce details, Home/End for first/last year.
            Green dots (✓) = grants received, Red dots (✗) = grants missing.
          </p>
        </div>

        <div
          ref={chartRef}
          tabIndex={0}
          role="img"
          aria-labelledby="timeline-heading"
          aria-describedby="chart-description"
          onKeyDown={handleChartKeyDown}
          onFocus={() => {
            if (!focusedYear && timelineData.length > 0) {
              setFocusedYear(timelineData[0].year);
            }
          }}
          className="focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-2 rounded"
        >
          <div id="chart-description" className="sr-only">
            Timeline chart showing expected versus actual Bitcoin vesting grants over 10 years. 
            {matchedGrants} out of {expectedGrants.length} grants have been received. 
            Use keyboard navigation to explore individual data points.
          </div>

          <ResponsiveContainer width="100%" height={420}>
            <ComposedChart
              data={timelineData}
              margin={isMobile
                ? { top: 25, right: 45, bottom: 25, left: 45 }
                : { top: 40, right: 70, bottom: 40, left: 70 }
              }
            >
              <defs>
                {/* Gradients for lines */}
                <linearGradient id="expectedGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={1} />
                </linearGradient>
                
                <linearGradient id="actualGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
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
                domain={[1, 10]}
                type="number"
                ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                label={{ 
                  value: 'Grant Year', 
                  position: 'insideBottom', 
                  offset: -5, 
                  style: { fill: '#6b7280', fontSize: 11 } 
                }}
              />

              <YAxis
                tickFormatter={(value) => formatBTC(value)}
                domain={yDomain}
                axisLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                label={{ 
                  value: 'BTC Amount', 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { fill: '#6b7280', fontSize: 11 } 
                }}
              />

              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }}
              />

              <Legend
                content={<CustomLegend />}
                wrapperStyle={{ paddingTop: '20px' }}
              />

              {/* Vesting milestone reference lines */}
              <ReferenceLine
                x={5}
                stroke="#fbbf24"
                strokeDasharray="8 4"
                strokeWidth={2}
                strokeOpacity={0.5}
                label={!isMobile ? {
                  value: '50% Vested',
                  position: 'top',
                  fill: '#fbbf24',
                  style: { 
                    fontSize: 13, 
                    fontWeight: 'bold',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                  }
                } : undefined}
              />

              <ReferenceLine
                x={10}
                stroke="#10b981"
                strokeDasharray="8 4"
                strokeWidth={2}
                strokeOpacity={0.5}
                label={!isMobile ? {
                  value: '100% Vested',
                  position: 'top',
                  fill: '#10b981',
                  style: { 
                    fontSize: 13, 
                    fontWeight: 'bold',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                  }
                } : undefined}
              />

              {/* Focused year indicator */}
              {focusedYear && (
                <ReferenceLine
                  x={focusedYear}
                  stroke="#f59e0b"
                  strokeWidth={3}
                  strokeOpacity={0.8}
                />
              )}

              {/* Expected grants line */}
              <Line
                type="monotone"
                dataKey="expectedAmount"
                stroke="url(#expectedGradient)"
                strokeWidth={3}
                strokeDasharray="8 4"
                name="Expected Grants"
                dot={<CustomExpectedDot />}
                isAnimationActive={true}
                animationDuration={2000}
                animationEasing="ease-in-out"
                filter="url(#glow)"
              />

              {/* Actual grants scatter plot */}
              <Scatter
                dataKey="actualAmount"
                fill="url(#actualGradient)"
                name="Actual Grants"
                shape={<CustomActualDot />}
                isAnimationActive={true}
                animationDuration={2000}
                animationEasing="ease-in-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div className="text-sm font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wide">
              Expected Total
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
            {formatBTC(totalExpected)}
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-400">
            Over 10 years
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="text-sm font-semibold text-green-800 dark:text-green-300 uppercase tracking-wide">
              Received
            </div>
          </div>
          <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">
            {formatBTC(totalReceived)}
          </div>
          <div className="text-xs text-green-700 dark:text-green-400">
            {totalExpected > 0 ? `${((totalReceived / totalExpected) * 100).toFixed(1)}% of expected` : 'N/A'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 border border-purple-200 dark:border-purple-800 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wide">
              Grants Matched
            </div>
          </div>
          <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">
            {matchedGrants}/{expectedGrants.length}
          </div>
          <div className="text-xs text-purple-700 dark:text-purple-400">
            {expectedGrants.length > 0 ? `${((matchedGrants / expectedGrants.length) * 100).toFixed(1)}% success rate` : 'N/A'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border border-orange-200 dark:border-orange-800 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <div className="text-sm font-semibold text-orange-800 dark:text-orange-300 uppercase tracking-wide">
              Total Value
            </div>
          </div>
          <div className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-1">
            {totalExpectedValue > 0 ? formatUSDCompact(totalExpectedValue) : 'N/A'}
          </div>
          <div className="text-xs text-orange-700 dark:text-orange-400">
            At time of receipt
          </div>
        </div>
      </div>

      {/* Grant Status Table */}
      <div className="mt-6">
        <h4 
          className="text-lg font-bold text-gray-900 dark:text-white mb-4"
          id="table-heading"
        >
          Grant Status Breakdown
        </h4>
        <div className="overflow-x-auto rounded-xl shadow-lg">
          <table 
            ref={tableRef}
            className="min-w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700"
            role="table"
            aria-labelledby="table-heading"
            aria-describedby="table-summary"
            tabIndex={0}
          >
            <caption id="table-summary" className="sr-only">
              Table showing {timelineData.length} vesting grant years with expected amounts, 
              actual received amounts, dates, USD values, and status. 
              {matchedGrants} grants have been received successfully.
              Navigate with arrow keys between cells.
            </caption>
            
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700">
              <tr role="row">
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                >
                  Year
                </th>
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                >
                  Expected
                </th>
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                >
                  Actual
                </th>
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                >
                  Date Received
                </th>
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                >
                  USD Value
                </th>
                <th 
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {timelineData.map((point) => (
                <tr 
                  key={point.year} 
                  className={`
                    hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors focus-within:bg-gray-50 dark:focus-within:bg-slate-800
                    ${point.year === 10 ? 'bg-green-50/50 dark:bg-green-900/20' : 
                    point.year === 5 ? 'bg-yellow-50/50 dark:bg-yellow-900/20' : ''}
                  `}
                  role="row"
                >
                  <td 
                    className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white"
                    role="gridcell"
                    tabIndex={0}
                  >
                    {point.year}
                    {point.year === 5 && (
                      <span className="sr-only"> (50% vesting milestone)</span>
                    )}
                    {point.year === 10 && (
                      <span className="sr-only"> (100% vesting milestone)</span>
                    )}
                  </td>
                  <td 
                    className="px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400"
                    role="gridcell"
                    tabIndex={0}
                  >
                    {formatBTC(point.expectedAmount)}
                  </td>
                  <td 
                    className="px-4 py-3 text-sm font-medium"
                    role="gridcell"
                    tabIndex={0}
                  >
                    {point.actualAmount !== null ? (
                      <span className="text-green-600 dark:text-green-400">
                        {formatBTC(point.actualAmount)}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">
                        — <span className="sr-only">No amount received</span>
                      </span>
                    )}
                  </td>
                  <td 
                    className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
                    role="gridcell"
                    tabIndex={0}
                  >
                    {point.actualDate ? (
                      new Date(point.actualDate).toLocaleDateString()
                    ) : (
                      <>
                        — <span className="sr-only">No date available</span>
                      </>
                    )}
                  </td>
                  <td 
                    className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
                    role="gridcell"
                    tabIndex={0}
                  >
                    {point.actualValueUSD ? (
                      formatUSD(point.actualValueUSD)
                    ) : (
                      <>
                        — <span className="sr-only">No USD value available</span>
                      </>
                    )}
                  </td>
                  <td 
                    className="px-4 py-3 text-sm"
                    role="gridcell"
                    tabIndex={0}
                  >
                    <span 
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        point.status === 'matched' 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md' 
                          : 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md'
                      }`}
                      aria-label={`Grant status: ${point.status === 'matched' ? 'Received' : 'Missing'}`}
                    >
                      {/* Status icon for accessibility */}
                      {point.status === 'matched' ? (
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {point.status === 'matched' ? 'Received' : 'Missing'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
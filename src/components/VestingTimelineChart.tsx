'use client';

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

export default function VestingTimelineChart({
  timeline,
  initialGrant,
  annualGrant,
  projectedBitcoinGrowth,
  currentBitcoinPrice,
  schemeId
}: VestingTimelineChartProps) {
  // Extend timeline to 20 years (240 months) if needed
  const extendedTimeline = [...timeline];
  const maxMonth = Math.max(...timeline.map(p => p.month));
  const targetMonths = 240; // 20 years

  if (maxMonth < targetMonths) {
    const monthlyGrowthRate = projectedBitcoinGrowth / 12 / 100;
    const lastPoint = timeline[timeline.length - 1];

    for (let month = maxMonth + 1; month <= targetMonths; month++) {
      const bitcoinPrice = currentBitcoinPrice * Math.pow(1 + monthlyGrowthRate, month);
      // Employer balance stays the same after vesting period ends
      const employerBalance = lastPoint.employerBalance;

      extendedTimeline.push({
        month,
        employeeBalance: lastPoint.employeeBalance,
        employerBalance: employerBalance,
        vestedAmount: lastPoint.vestedAmount,
        totalBalance: lastPoint.totalBalance,
        bitcoinPrice,
        usdValue: employerBalance * bitcoinPrice, // Use employer balance for USD value
      });
    }
  }

  // Chart dimensions
  const width = 800;
  const height = 480;
  const margin = { top: 70, right: 80, bottom: 60, left: 80 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Data processing for yearly points (every 12 months)
  const yearlyData = extendedTimeline.filter((_, index) => index % 12 === 0).slice(0, 21); // 0-20 years

  // Scales - fixed BTC scale (larger for High Roller), dynamic USD scale
  const maxBTCBalance = schemeId === 'custom' ? 1.0 : 0.025; // High Roller: 1 BTC scale, Others: 0.025 BTC scale (to accommodate 0.02 BTC)
  const maxUSDValue = Math.max(...yearlyData.map(d => d.employerBalance * d.bitcoinPrice)); // Dynamic USD scale

  const xScale = (year: number) => (year / 20) * chartWidth;
  const yScaleUSD = (value: number) => chartHeight - (value / maxUSDValue) * chartHeight;
  const yScaleBTC = (value: number) => chartHeight - (value / maxBTCBalance) * chartHeight;

  // Generate path for USD value line (employer balance only)
  const usdPath = yearlyData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScaleUSD(d.employerBalance * d.bitcoinPrice)}`)
    .join(' ');

  // Generate path for BTC balance line (employer balance only)
  const btcPath = yearlyData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScaleBTC(d.employerBalance)}`)
    .join(' ');

  // Key milestones
  const vestingMilestones = [
    { year: 5, label: '50% Vested', color: '#f59e0b' },
    { year: 10, label: '100% Vested', color: '#10b981' }
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
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-w-full"
        >
          <defs>
            <linearGradient id="usdGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="btcGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Grid lines */}
            {[0, 5, 10, 15, 20].map(year => (
              <line
                key={year}
                x1={xScale(year)}
                y1={0}
                x2={xScale(year)}
                y2={chartHeight}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray={year % 5 === 0 ? "none" : "2,2"}
              />
            ))}

            {/* USD Value Area */}
            <path
              d={`${usdPath} L ${xScale(20)} ${chartHeight} L ${xScale(0)} ${chartHeight} Z`}
              fill="url(#usdGradient)"
            />

            {/* USD Value Line */}
            <path
              d={usdPath}
              fill="none"
              stroke="#f97316"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* BTC Balance Area */}
            <path
              d={`${btcPath} L ${xScale(20)} ${chartHeight} L ${xScale(0)} ${chartHeight} Z`}
              fill="url(#btcGradient)"
            />

            {/* BTC Balance Line */}
            <path
              d={btcPath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="5,5"
            />

            {/* Vesting Milestone Lines */}
            {vestingMilestones.map(milestone => (
              <g key={milestone.year}>
                <line
                  x1={xScale(milestone.year)}
                  y1={0}
                  x2={xScale(milestone.year)}
                  y2={chartHeight}
                  stroke={milestone.color}
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
                <rect
                  x={xScale(milestone.year) - 50}
                  y={-50}
                  width="100"
                  height="25"
                  fill={milestone.color}
                  rx="12"
                />
                <text
                  x={xScale(milestone.year)}
                  y={-32}
                  textAnchor="middle"
                  className="text-sm font-semibold fill-white"
                >
                  {milestone.label}
                </text>
              </g>
            ))}

            {/* Data Points */}
            {yearlyData.map((d, i) => (
              <g key={i}>
                {/* USD Value Point */}
                <circle
                  cx={xScale(i)}
                  cy={yScaleUSD(d.employerBalance * d.bitcoinPrice)}
                  r="4"
                  fill="#f97316"
                  stroke="white"
                  strokeWidth="2"
                />

                {/* BTC Balance Point */}
                <circle
                  cx={xScale(i)}
                  cy={yScaleBTC(d.employerBalance)}
                  r="3"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                />


              </g>
            ))}

            {/* X-axis */}
            <line
              x1={0}
              y1={chartHeight}
              x2={chartWidth}
              y2={chartHeight}
              stroke="#374151"
              strokeWidth="2"
            />

            {/* X-axis labels */}
            {[0, 5, 10, 15, 20].map(year => (
              <text
                key={year}
                x={xScale(year)}
                y={chartHeight + 20}
                textAnchor="middle"
                className="text-sm font-medium fill-gray-700"
              >
                Year {year}
              </text>
            ))}

            {/* X-axis title */}
            <text
              x={chartWidth / 2}
              y={chartHeight + 45}
              textAnchor="middle"
              className="text-sm font-semibold fill-gray-700"
            >
              Years
            </text>

            {/* Left Y-axis (USD) */}
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={chartHeight}
              stroke="#374151"
              strokeWidth="2"
            />

            {/* Right Y-axis (BTC) */}
            <line
              x1={chartWidth}
              y1={0}
              x2={chartWidth}
              y2={chartHeight}
              stroke="#374151"
              strokeWidth="2"
            />

            {/* Left Y-axis labels (BTC) */}
            {[0.25, 0.5, 0.75, 1].map(ratio => {
              const value = maxBTCBalance * ratio;
              const y = yScaleBTC(value);
              return (
                <g key={ratio}>
                  <line
                    x1={-5}
                    y1={y}
                    x2={0}
                    y2={y}
                    stroke="#374151"
                    strokeWidth="1"
                  />
                  <text
                    x={-10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-blue-600 font-medium"
                  >
                    {formatBTC(value)}
                  </text>
                </g>
              );
            })}

            {/* Right Y-axis labels (USD) */}
            {[0.25, 0.5, 0.75, 1].map(ratio => {
              const value = maxUSDValue * ratio;
              const y = yScaleUSD(value);
              return (
                <g key={ratio}>
                  <line
                    x1={chartWidth}
                    y1={y}
                    x2={chartWidth + 5}
                    y2={y}
                    stroke="#374151"
                    strokeWidth="1"
                  />
                  <text
                    x={chartWidth + 10}
                    y={y + 4}
                    textAnchor="start"
                    className="text-xs fill-orange-600 font-medium"
                  >
                    {formatUSDCompact(value)}
                  </text>
                </g>
              );
            })}


          </g>
        </svg>

        {/* Legend */}
        <div className="flex justify-center mt-4 space-x-8">
          <div className="flex items-center">
            <div className="w-6 h-1 bg-blue-500 mr-2 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #3b82f6 0, #3b82f6 3px, transparent 3px, transparent 6px)' }}></div>
            <span className="text-sm text-gray-700 font-medium">BTC Balance (Left Axis)</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-1 bg-orange-500 mr-2 rounded"></div>
            <span className="text-sm text-gray-700 font-medium">USD Value (Right Axis)</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-1 bg-amber-500 mr-2 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 2px, transparent 2px, transparent 4px)' }}></div>
            <span className="text-sm text-gray-700 font-medium">Vesting Milestones</span>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm font-medium text-orange-800 mb-1">20-Year Projection</div>
          <div className="text-2xl font-bold text-orange-900">
            {formatUSDCompact((yearlyData[20]?.employerBalance || 0) * (yearlyData[20]?.bitcoinPrice || 0))}
          </div>
          <div className="text-xs text-orange-700">
            Based on {projectedBitcoinGrowth}% annual growth
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-800 mb-1">Total BTC Grants</div>
          <div className="text-2xl font-bold text-blue-900">
            {formatBTC(yearlyData[10]?.employerBalance || 0)}
          </div>
          <div className="text-xs text-blue-700">
            Employer grants only
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-800 mb-1">Growth Multiple</div>
          <div className="text-2xl font-bold text-green-900">
            {(((yearlyData[20]?.employerBalance || 0) * (yearlyData[20]?.bitcoinPrice || 0)) / (initialGrant * currentBitcoinPrice)).toFixed(1)}x
          </div>
          <div className="text-xs text-green-700">
            From initial investment
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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">BTC Balance</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">BTC Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">USD Value</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vesting Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {yearlyData.slice(0, 11).map((point, index) => {
                const year = index;
                const vestingPercent = year >= 10 ? 100 : year >= 5 ? 50 : 0;

                return (
                  <tr key={year} className={year === 5 || year === 10 ? 'bg-yellow-50' : ''}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{year}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{formatBTC(point.employerBalance)}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{formatUSD(point.bitcoinPrice)}</td>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-900">{formatUSD(point.employerBalance * point.bitcoinPrice)}</td>
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
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { HistoricalCalculationResult } from '@/types/vesting';
import { SatoshiIcon } from '@/components/icons';

interface HistoricalTimelineVisualizationProps {
  results: HistoricalCalculationResult;
  startingYear: number;
  currentBitcoinPrice: number;
  historicalPrices: Record<number, any>;
  costBasisMethod: 'high' | 'low' | 'average';
}

// Memoized formatting functions
const formatBTC = (amount: number): string => {
  if (amount === 0) return '₿0';
  if (amount >= 1) return `₿${amount.toFixed(2)}`;
  return `₿${amount.toFixed(3)}`;
};

const formatBTCCompact = (amount: number): string => {
  if (amount === 0) return '0';
  if (amount >= 1) return amount.toFixed(2);
  return amount.toFixed(3);
};

const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatUSDCompact = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return formatUSD(amount);
};

const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

// Memoized performance card component
const PerformanceCard = memo(({ 
  title, 
  value, 
  subtitle, 
  gradient, 
  textColor 
}: {
  title: string;
  value: string;
  subtitle: string;
  gradient: string;
  textColor: string;
}) => (
  <div className={`${gradient} border border-opacity-50 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow`}>
    <div className={`text-sm font-semibold ${textColor} mb-2 uppercase tracking-wide`}>{title}</div>
    <div className={`text-3xl font-bold ${textColor.replace('800', '900').replace('300', '100')} mb-1`}>
      {value}
    </div>
    <div className={`text-xs ${textColor.replace('800', '700').replace('300', '400')}`}>
      {subtitle}
    </div>
  </div>
));

PerformanceCard.displayName = 'PerformanceCard';

// Memoized timeline marker component
const TimelineMarker = memo(({ 
  yearData, 
  isSelected, 
  onClick 
}: {
  yearData: any;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const markerClass = yearData.isCurrent
    ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-600'
    : yearData.isVestingMilestone && yearData.vestingPercent === 100
    ? 'bg-gradient-to-br from-green-400 to-emerald-600 border-green-600'
    : yearData.isVestingMilestone && yearData.vestingPercent === 50
    ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-yellow-600'
    : yearData.hasGrants
    ? 'bg-gradient-to-br from-bitcoin to-bitcoin-600 border-bitcoin-600'
    : 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-400';

  return (
    <div
      className="flex flex-col items-center cursor-pointer transition-all min-w-0 flex-1 group"
      onClick={onClick}
    >
      <div className={`text-sm font-bold mb-4 transition-colors ${
        isSelected ? 'text-bitcoin' : 'text-gray-600 dark:text-gray-400 group-hover:text-bitcoin'
      }`}>
        {yearData.year}
      </div>

      <div className="relative">
        <div className={`absolute inset-0 rounded-full blur-sm transition-opacity duration-300 ${
          isSelected ? 'opacity-60' : 'opacity-0 group-hover:opacity-30'
        } ${markerClass.replace('gradient-to-br from-', '').split(' ')[0]}`}></div>

        <div className={`relative w-10 h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${markerClass} shadow-md hover:shadow-lg ${
          isSelected ? 'ring-3 ring-bitcoin/40 ring-offset-2' : ''
        }`}>
          {yearData.hasGrants && <SatoshiIcon className="w-5 h-5 text-white" />}
        </div>

        {yearData.hasGrants && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-bitcoin rounded-full border border-white shadow-sm animate-pulse"></div>
        )}
      </div>

      <div className="mt-8 text-center space-y-2">
        <div className="text-sm font-medium text-bitcoin dark:text-bitcoin">
          {formatBTCCompact(yearData.btcBalance)}
        </div>
        <div className="text-sm font-medium text-orange-600 dark:text-orange-400 h-5">
          {yearData.grantCost > 0 ? formatUSDCompact(yearData.grantCost) : ''}
        </div>
        <div className="text-sm font-bold text-green-600 dark:text-green-400">
          {formatUSDCompact(yearData.historicalValue > 0 ? yearData.historicalValue : yearData.usdValue)}
        </div>
      </div>
    </div>
  );
});

TimelineMarker.displayName = 'TimelineMarker';

// Main component with optimizations
function HistoricalTimelineVisualizationOptimized({
  results,
  startingYear,
  currentBitcoinPrice,
  historicalPrices,
  costBasisMethod
}: HistoricalTimelineVisualizationProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const currentYear = new Date().getFullYear();
  const totalYears = currentYear - startingYear;

  // Memoize expensive calculations
  const yearlyGrantCosts = useMemo(() => {
    const costs = new Map<number, number>();
    for (const grant of results.grantBreakdown) {
      const yearPrices = historicalPrices[grant.year];
      if (yearPrices) {
        let grantPrice = 0;
        switch (costBasisMethod) {
          case 'high':
            grantPrice = yearPrices.high;
            break;
          case 'low':
            grantPrice = yearPrices.low;
            break;
          case 'average':
            grantPrice = yearPrices.average;
            break;
        }
        const grantCost = grant.amount * grantPrice;
        costs.set(grant.year, (costs.get(grant.year) || 0) + grantCost);
      }
    }
    return costs;
  }, [results.grantBreakdown, historicalPrices, costBasisMethod]);

  // Memoize yearly data processing
  const yearlyData = useMemo(() => {
    const data = [];
    for (let year = startingYear; year <= currentYear; year++) {
      const yearPoints = results.timeline.filter(p => p.year === year);
      const lastPoint = yearPoints.length > 0 ? yearPoints[yearPoints.length - 1] : null;
      const grants = results.grantBreakdown.filter(g => g.year === year);
      const yearsFromStart = year - startingYear;
      const vestingPercent = yearsFromStart >= 10 ? 100 : yearsFromStart >= 5 ? 50 : 0;

      const grantCost = yearlyGrantCosts.get(year) || 0;
      
      let historicalCumulativeValue = 0;
      if (lastPoint && historicalPrices[year]) {
        let yearPrice = 0;
        const yearPrices = historicalPrices[year];
        switch (costBasisMethod) {
          case 'high':
            yearPrice = yearPrices.high;
            break;
          case 'low':
            yearPrice = yearPrices.low;
            break;
          case 'average':
            yearPrice = yearPrices.average;
            break;
        }
        historicalCumulativeValue = lastPoint.cumulativeBitcoin * yearPrice;
      }

      data.push({
        year,
        yearsFromStart,
        grants,
        hasGrants: grants.length > 0,
        btcBalance: lastPoint?.cumulativeBitcoin || 0,
        usdValue: lastPoint?.currentValue || 0,
        historicalValue: historicalCumulativeValue,
        costBasis: lastPoint?.cumulativeCostBasis || 0,
        grantCost,
        grantAmount: grants.reduce((sum, g) => sum + g.amount, 0),
        vestingPercent,
        isVestingMilestone: yearsFromStart === 5 || yearsFromStart === 10,
        isCurrent: year === currentYear
      });
    }
    return data;
  }, [results, startingYear, currentYear, yearlyGrantCosts, historicalPrices, costBasisMethod]);

  // Memoize mobile data filtering
  const mobileData = useMemo(() => {
    return isMobile ? yearlyData.filter(d =>
      d.year === startingYear || d.hasGrants || d.isVestingMilestone || d.isCurrent
    ) : yearlyData;
  }, [isMobile, yearlyData, startingYear]);

  // Memoize selected year data
  const selectedYearData = useMemo(() => {
    return selectedYear ? yearlyData.find(y => y.year === selectedYear) : null;
  }, [selectedYear, yearlyData]);

  // Optimize click handlers
  const handleYearClick = useCallback((year: number) => {
    setSelectedYear(prev => prev === year ? null : year);
  }, []);

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          Historical Performance ({startingYear}-{currentYear})
        </h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="font-medium">Total Granted:</span>
            <span className="text-bitcoin dark:text-bitcoin font-bold">{formatBTC(results.totalBitcoinGranted)}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium">• Cost Basis:</span>
            <span className="text-orange-600 dark:text-orange-400 font-bold capitalize">{results.summary.costBasisMethod} prices</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium">• Annualized Return:</span>
            <span className="text-green-600 dark:text-green-400 font-bold">{formatPercent(results.annualizedReturn)}</span>
          </span>
        </div>
      </div>

      {/* Performance Cards - Memoized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <PerformanceCard
          title="Current Value"
          value={formatUSDCompact(results.currentTotalValue)}
          subtitle={`${formatBTC(results.totalBitcoinGranted)} total Bitcoin`}
          gradient="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border-orange-200 dark:border-orange-800"
          textColor="text-orange-800 dark:text-orange-300"
        />
        <PerformanceCard
          title="Cost Basis"
          value={formatUSDCompact(results.totalCostBasis)}
          subtitle={`Historical ${results.summary.costBasisMethod} prices`}
          gradient="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800"
          textColor="text-blue-800 dark:text-blue-300"
        />
        <PerformanceCard
          title="Return"
          value={formatUSDCompact(Math.max(0, results.totalReturn))}
          subtitle={`${results.totalCostBasis > 0 ? ((results.totalReturn / results.totalCostBasis) * 100).toFixed(0) : '0'}% gain over ${totalYears} years`}
          gradient="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-200 dark:border-green-800"
          textColor="text-green-800 dark:text-green-300"
        />
        <PerformanceCard
          title="Annualized"
          value={formatPercent(results.annualizedReturn)}
          subtitle="Compound annual growth rate"
          gradient="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 border-purple-200 dark:border-purple-800"
          textColor="text-purple-800 dark:text-purple-300"
        />
      </div>

      {/* Interactive Timeline */}
      <div className="mt-10">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          Interactive Timeline Explorer
        </h4>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-slate-700/60 rounded-2xl p-8 shadow-lg">
          {isMobile ? (
            /* Mobile: Vertical Cards */
            <div className="space-y-4">
              {mobileData.map((yearData) => {
                const isSelected = selectedYear === yearData.year;
                return (
                  <div
                    key={yearData.year}
                    className={`relative flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 cursor-pointer transition-all min-h-[120px] ${
                      isSelected
                        ? 'border-bitcoin bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-slate-700 dark:to-slate-600 shadow-lg'
                        : 'border-gray-200 dark:border-slate-600 hover:border-bitcoin hover:shadow-md'
                    }`}
                    onClick={() => handleYearClick(yearData.year)}
                  >
                    <div className="flex-shrink-0 relative self-start sm:self-center">
                      <div className={`w-12 h-12 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                        yearData.isCurrent
                          ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-600 shadow-md'
                          : yearData.isVestingMilestone && yearData.vestingPercent === 100
                          ? 'bg-gradient-to-br from-green-400 to-emerald-600 border-green-600 shadow-md'
                          : yearData.isVestingMilestone && yearData.vestingPercent === 50
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-yellow-600 shadow-md'
                          : yearData.hasGrants
                          ? 'bg-gradient-to-br from-bitcoin to-bitcoin-600 border-bitcoin-600 shadow-md'
                          : 'bg-gradient-to-br from-gray-300 to-gray-400 border-gray-400 shadow-sm'
                      }`}>
                        {yearData.hasGrants && <SatoshiIcon className="w-6 h-6 sm:w-5 sm:h-5 text-white" />}
                      </div>
                      {yearData.hasGrants && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full border-2 border-white animate-pulse"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <h4 className="text-xl sm:text-lg font-bold text-gray-900 dark:text-white">{yearData.year}</h4>
                        {yearData.vestingPercent > 0 && (
                          <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold shadow-md whitespace-nowrap ${
                            yearData.vestingPercent === 100
                              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                              : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                          }`}>
                            {yearData.vestingPercent}% Vested
                          </span>
                        )}
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                          <div>
                            <div className="text-gray-600 dark:text-white/80 text-xs font-medium">BTC Balance</div>
                            <div className="font-bold text-bitcoin dark:text-bitcoin text-base">{formatBTC(yearData.btcBalance)}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                          <div>
                            <div className="text-gray-600 dark:text-white/80 text-xs font-medium">
                              {yearData.historicalValue > 0 ? 'Historical Value' : 'Current Value'}
                            </div>
                            <div className="font-bold text-green-600 dark:text-green-400 text-base">
                              {formatUSDCompact(yearData.historicalValue > 0 ? yearData.historicalValue : yearData.usdValue)}
                            </div>
                          </div>
                        </div>
                        {yearData.grantCost > 0 && (
                          <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                            <div>
                              <div className="text-gray-600 dark:text-white/80 text-xs font-medium">Grant Cost</div>
                              <div className="font-bold text-orange-600 dark:text-orange-400 text-base">{formatUSDCompact(yearData.grantCost)}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {yearData.hasGrants && (
                        <div className="mt-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gradient-to-r from-orange-100 to-amber-100 text-bitcoin font-bold">
                            <SatoshiIcon className="w-3 h-3 mr-1" />
                            {formatBTC(yearData.grants.reduce((sum: number, g: any) => sum + g.amount, 0))} granted
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Desktop: Horizontal Timeline */
            <div className="relative py-8">
              <div className="absolute top-28 left-8 right-8 h-1 bg-gradient-to-r from-gray-300 via-bitcoin to-gray-300 rounded-full"></div>
              <div className="flex justify-between items-start relative overflow-x-auto min-w-full">
                {yearlyData.map((yearData) => (
                  <TimelineMarker
                    key={yearData.year}
                    yearData={yearData}
                    isSelected={selectedYear === yearData.year}
                    onClick={() => handleYearClick(yearData.year)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Selected Year Details */}
          {selectedYearData && (
            <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-gray-200 dark:border-slate-600">
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedYear} Detailed Analysis
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {selectedYearData.hasGrants && (
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 p-4 rounded-xl border border-orange-200 dark:border-orange-800 shadow-md">
                    <div className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1 flex items-center">
                      <SatoshiIcon className="w-4 h-4 mr-1" />
                      This Year
                    </div>
                    <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {formatBTC(selectedYearData.grants.reduce((sum: number, g: any) => sum + g.amount, 0))}
                    </div>
                    <div className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                      {selectedYearData.grants.map((g: any) => g.type).join(', ')} grant
                    </div>
                  </div>
                )}

                {selectedYearData.grantCost > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 p-4 rounded-xl border border-purple-200 dark:border-purple-800 shadow-md">
                    <div className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-1">
                      Grant Cost
                    </div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {formatUSD(selectedYearData.grantCost)}
                    </div>
                    <div className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                      Cost basis
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800 shadow-md">
                  <div className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                    Total BTC
                  </div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatBTC(selectedYearData.btcBalance)}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Cumulative grants
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-xl border border-green-200 dark:border-green-800 shadow-md">
                  <div className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                    Current Value
                  </div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatUSD(selectedYearData.usdValue)}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                    At today's price
                  </div>
                </div>
              </div>

              {selectedYearData.isVestingMilestone && (
                <div className={`mt-6 p-4 rounded-xl ${
                  selectedYearData.vestingPercent === 100
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-300 dark:border-green-700'
                    : 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 border border-yellow-300 dark:border-yellow-700'
                } shadow-md`}>
                  <div className={`text-base font-bold mb-1 ${
                    selectedYearData.vestingPercent === 100
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-yellow-800 dark:text-yellow-200'
                  }`}>
                    🎉 Vesting Milestone Reached!
                  </div>
                  <div className={`text-sm ${
                    selectedYearData.vestingPercent === 100
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {selectedYearData.vestingPercent === 100
                      ? 'All Bitcoin grants are now fully vested and available to the employee.'
                      : 'Half of all Bitcoin grants are now vested and available to the employee.'
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800 rounded-xl shadow-md">
          <div className="text-sm text-blue-800 dark:text-blue-200 font-medium">
            💡 <strong>Interactive Timeline:</strong> Click on any year marker to explore detailed grant information, vesting status, and portfolio performance for that specific year.
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(HistoricalTimelineVisualizationOptimized);

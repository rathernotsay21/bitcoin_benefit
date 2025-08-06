'use client';

import { useState, useEffect } from 'react';
import { HistoricalCalculationResult } from '@/types/vesting';

interface HistoricalTimelineVisualizationProps {
  results: HistoricalCalculationResult;
  startingYear: number;
  currentBitcoinPrice: number;
}

function formatBTC(amount: number): string {
  // Format to up to 3 decimal places, removing trailing zeros
  const formatted = amount.toFixed(3).replace(/\.?0+$/, '');
  return `₿${formatted}`;
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

export default function HistoricalTimelineVisualization({
  results,
  startingYear,
  currentBitcoinPrice
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
  
  // Calculate grant costs by year using actual historical prices
  const yearlyGrantCosts = new Map<number, number>();
  for (const grant of results.grantBreakdown) {
    // Find the historical price for this grant year from the timeline data
    const yearTimelinePoints = results.timeline.filter(p => p.year === grant.year);
    if (yearTimelinePoints.length > 0) {
      // Calculate the historical price from the cost basis and bitcoin amount
      const timelinePoint = yearTimelinePoints[0];
      const historicalPrice = timelinePoint.cumulativeCostBasis / timelinePoint.cumulativeBitcoin;
      const grantCost = grant.amount * historicalPrice;
      yearlyGrantCosts.set(grant.year, (yearlyGrantCosts.get(grant.year) || 0) + grantCost);
    }
  }
  
  // Create yearly data points
  const yearlyData = [];
  for (let year = startingYear; year <= currentYear; year++) {
    const yearPoints = results.timeline.filter(p => p.year === year);
    const lastPoint = yearPoints.length > 0 ? yearPoints[yearPoints.length - 1] : null;
    const grants = results.grantBreakdown.filter(g => g.year === year);
    const yearsFromStart = year - startingYear;
    const vestingPercent = yearsFromStart >= 10 ? 100 : yearsFromStart >= 5 ? 50 : 0;
    
    // Get grant cost for this year
    const grantCost = yearlyGrantCosts.get(year) || 0;
    
    yearlyData.push({
      year,
      yearsFromStart,
      grants,
      hasGrants: grants.length > 0,
      btcBalance: lastPoint?.cumulativeBitcoin || 0,
      usdValue: lastPoint?.currentValue || 0,
      costBasis: lastPoint?.cumulativeCostBasis || 0,
      grantCost,
      vestingPercent,
      isVestingMilestone: yearsFromStart === 5 || yearsFromStart === 10,
      isCurrent: year === currentYear
    });
  }

  // For mobile, show key milestones only
  const mobileData = isMobile ? yearlyData.filter(d => 
    d.year === startingYear || d.hasGrants || d.isVestingMilestone || d.isCurrent
  ) : yearlyData;

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Historical Performance Timeline ({startingYear}-{currentYear})
        </h3>
        <div className="text-sm text-gray-600 dark:text-white/80 space-y-1">
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

      {/* Timeline Container */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 md:p-8 overflow-hidden">
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 md:gap-6 mb-6 md:mb-8 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-orange-500 rounded-full"></div>
            <span className="dark:text-white">Bitcoin Grant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-yellow-500 rounded-full border-2 border-yellow-600"></div>
            <span className="dark:text-white">50% Vested</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-green-600"></div>
            <span className="dark:text-white">100% Vested</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full border-2 border-blue-600"></div>
            <span className="dark:text-white">Current Year</span>
          </div>
        </div>

        {isMobile ? (
          /* Mobile: Vertical Timeline */
          <div className="space-y-4">
            {mobileData.map((yearData, index) => {
              const isSelected = selectedYear === yearData.year;
              
              return (
                <div 
                  key={yearData.year}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                  onClick={() => setSelectedYear(isSelected ? null : yearData.year)}
                >
                  {/* Timeline Marker */}
                  <div className="flex-shrink-0 relative">
                    <div className={`w-8 h-8 rounded-full border-2 transition-all ${
                      yearData.isCurrent 
                        ? 'bg-blue-500 border-blue-600' :
                      yearData.isVestingMilestone && yearData.vestingPercent === 100
                        ? 'bg-green-500 border-green-600' :
                      yearData.isVestingMilestone && yearData.vestingPercent === 50
                        ? 'bg-yellow-500 border-yellow-600' :
                      yearData.hasGrants
                        ? 'bg-orange-500 border-orange-600' :
                        'bg-gray-300 border-gray-400'
                    }`}></div>
                    
                    {yearData.hasGrants && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-600 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  {/* Year Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{yearData.year}</h4>
                      {yearData.vestingPercent > 0 && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          yearData.vestingPercent === 100 ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {yearData.vestingPercent}% Vested
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600 dark:text-white/80">BTC Balance</div>
                        <div className="font-medium dark:text-white">{formatBTC(yearData.btcBalance)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-white/80">USD Value</div>
                        <div className="font-medium text-green-600 dark:text-green-400">{formatUSDCompact(yearData.usdValue)}</div>
                      </div>
                      {yearData.grantCost > 0 && (
                        <div className="col-span-2">
                          <div className="text-gray-600 dark:text-white/80">Grant Cost</div>
                          <div className="font-medium text-blue-600 dark:text-blue-400">{formatUSDCompact(yearData.grantCost)}</div>
                        </div>
                      )}
                    </div>
                    
                    {yearData.hasGrants && (
                      <div className="mt-2 text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                          {formatBTC(yearData.grants.reduce((sum, g) => sum + g.amount, 0))} granted
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
          <div className="relative">
            {/* Main Timeline Line */}
            <div className="absolute top-14 left-8 right-8 h-0.5 bg-gray-300"></div>
            
            {/* Year Markers */}
            <div className="flex justify-between items-start relative">
              {yearlyData.map((yearData, index) => {
                const isSelected = selectedYear === yearData.year;
                
                return (
                  <div 
                    key={yearData.year}
                    className="flex flex-col items-center cursor-pointer transition-all hover:scale-105 min-w-0 flex-1"
                    onClick={() => setSelectedYear(isSelected ? null : yearData.year)}
                  >
                    {/* Year Label */}
                    <div className={`text-xs font-medium mb-2 transition-colors ${
                      isSelected ? 'text-orange-600' : 'text-gray-600'
                    }`}>
                      {yearData.year}
                    </div>
                    
                    {/* Timeline Marker */}
                    <div className="relative">
                      {/* Main Dot */}
                      <div className={`w-6 h-6 rounded-full border-2 transition-all ${
                        yearData.isCurrent 
                          ? 'bg-blue-500 border-blue-600 ring-2 ring-blue-200' :
                        yearData.isVestingMilestone && yearData.vestingPercent === 100
                          ? 'bg-green-500 border-green-600 ring-2 ring-green-200' :
                        yearData.isVestingMilestone && yearData.vestingPercent === 50
                          ? 'bg-yellow-500 border-yellow-600 ring-2 ring-yellow-200' :
                        yearData.hasGrants
                          ? 'bg-orange-500 border-orange-600 ring-2 ring-orange-200' :
                          'bg-gray-300 border-gray-400'
                      } ${isSelected ? 'ring-4' : ''}`}>
                      </div>
                      
                      {/* Grant Indicator */}
                      {yearData.hasGrants && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-600 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    {/* Year Info */}
                    <div className="mt-3 text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {formatBTC(yearData.btcBalance)}
                      </div>
                      {yearData.grantCost > 0 && (
                        <div className="text-xs text-blue-600 mb-1">
                          Cost: {formatUSDCompact(yearData.grantCost)}
                        </div>
                      )}
                      <div className="text-xs font-medium text-green-600">
                        {formatUSDCompact(yearData.usdValue)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Year Details */}
        {selectedYear && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border dark:border-slate-700">
            {(() => {
              const yearData = yearlyData.find(y => y.year === selectedYear);
              if (!yearData) return null;
              
              return (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Year {selectedYear} Details
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Grants This Year */}
                    <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border dark:border-slate-600">
                      <div className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">Grants This Year</div>
                      <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                        {yearData.hasGrants ? formatBTC(yearData.grants.reduce((sum, g) => sum + g.amount, 0)) : 'None'}
                      </div>
                      {yearData.hasGrants && (
                        <div className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                          {yearData.grants.map(g => g.type).join(', ')} grant
                        </div>
                      )}
                    </div>
                    
                    {/* Grant Cost This Year */}
                    {yearData.grantCost > 0 && (
                      <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border dark:border-slate-600">
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Grant Cost This Year</div>
                        <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                          {formatUSD(yearData.grantCost)}
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          Cost basis for grants
                        </div>
                      </div>
                    )}
                    
                    {/* Total BTC Balance */}
                    <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border dark:border-slate-600">
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Total BTC Balance</div>
                      <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                        {formatBTC(yearData.btcBalance)}
                      </div>
                      <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Cumulative grants
                      </div>
                    </div>
                    
                    {/* USD Value */}
                    <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border dark:border-slate-600">
                      <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Current USD Value</div>
                      <div className="text-xl font-bold text-green-900 dark:text-green-100">
                        {formatUSD(yearData.usdValue)}
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                        At today's price
                      </div>
                    </div>
                    
                    {/* Vesting Status */}
                    <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border dark:border-slate-600">
                      <div className="text-sm font-medium text-gray-800 dark:text-white mb-1">Vesting Status</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {yearData.vestingPercent}%
                      </div>
                      <div className="text-xs text-gray-700 dark:text-white/80 mt-1">
                        {yearData.yearsFromStart} years from start
                      </div>
                    </div>
                  </div>
                  
                  {/* Special Milestones */}
                  {yearData.isVestingMilestone && (
                    <div className={`mt-4 p-3 rounded-lg ${
                      yearData.vestingPercent === 100 
                        ? 'bg-green-100 border border-green-200' 
                        : 'bg-yellow-100 border border-yellow-200'
                    }`}>
                      <div className={`text-sm font-semibold ${
                        yearData.vestingPercent === 100 ? 'text-green-800' : 'text-yellow-800'
                      }`}>
                        🎉 Vesting Milestone Reached!
                      </div>
                      <div className={`text-sm ${
                        yearData.vestingPercent === 100 ? 'text-green-700' : 'text-yellow-700'
                      }`}>
                        {yearData.vestingPercent === 100 
                          ? 'All Bitcoin grants are now fully vested and available to the employee.'
                          : 'Half of all Bitcoin grants are now vested and available to the employee.'
                        }
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Performance Summary Cards */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">Current Value</div>
          <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
            {formatUSDCompact(results.currentTotalValue)}
          </div>
          <div className="text-xs text-orange-700 dark:text-orange-300">
            {formatBTC(results.totalBitcoinGranted)} total Bitcoin
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Total Cost Basis</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatUSDCompact(results.totalCostBasis)}
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300">
            Historical {results.summary.costBasisMethod} prices
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Total Return</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {formatUSDCompact(results.totalReturn)}
          </div>
          <div className="text-xs text-green-700 dark:text-green-300">
            {((results.totalReturn / results.totalCostBasis) * 100).toFixed(0)}% gain over {totalYears} years
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>Click on any year</strong> to see detailed information about grants, vesting status, and portfolio value for that year.
        </div>
      </div>
    </div>
  );
}

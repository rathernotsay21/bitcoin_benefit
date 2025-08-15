'use client';

import React, { useMemo, memo } from 'react';
import { FixedSizeList as List } from 'react-window';

interface YearlyDataPoint {
  year: number;
  btcBalance: number;
  usdValue: number;
  bitcoinPrice: number;
  vestedAmount: number;
  grantSize: number;
  grantCost: number;
  isInitialGrant?: boolean;
}

interface VirtualizedAnnualBreakdownProps {
  yearlyData: YearlyDataPoint[];
  initialGrant: number;
  annualGrant?: number;
  currentBitcoinPrice: number;
  schemeId?: string;
  maxDisplayYears?: number;
}

// Memoized formatting functions
const formatBTC = (amount: number): string => {
  if (amount === 0) return '₿0';
  if (amount >= 1) return `₿${amount.toFixed(2)}`;
  return `₿${amount.toFixed(3)}`;
};

const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

// Memoized Row Component
const Row = memo(({ 
  index, 
  style, 
  data 
}: { 
  index: number; 
  style: React.CSSProperties; 
  data: { 
    yearlyData: YearlyDataPoint[]; 
    currentYear: number;
    schemeId?: string;
  } 
}) => {
  const yearData = data.yearlyData[index];
  const { currentYear, schemeId } = data;
  const vestingPercent = yearData.year >= 10 ? 100 : yearData.year >= 5 ? 50 : 0;
  const isCurrentYear = yearData.year === new Date().getFullYear() - currentYear + index;
  
  // Calculate growth metrics
  let yoyGrowth = null;
  if (index > 0 && data.yearlyData[index - 1]) {
    const prevYearValue = data.yearlyData[index - 1].usdValue;
    if (prevYearValue > 0) {
      yoyGrowth = ((yearData.usdValue - prevYearValue) / prevYearValue);
    }
  }

  const rowClass = vestingPercent === 100 
    ? 'bg-green-50 dark:bg-green-900/20' 
    : vestingPercent === 50 
    ? 'bg-yellow-50 dark:bg-yellow-900/20' 
    : '';

  return (
    <div style={style}>
      <div className={`flex items-center px-2 sm:px-4 py-3 border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${rowClass}`}>
        {/* Year */}
        <div className="flex-none w-12 sm:w-16 text-sm font-medium text-gray-900 dark:text-white">
          {yearData.year}
        </div>
        
        {/* BTC Balance */}
        <div className="flex-none w-20 sm:w-24 text-sm text-gray-700 dark:text-white/90">
          {formatBTC(yearData.btcBalance)}
        </div>
        
        {/* USD Value */}
        <div className="flex-1 min-w-0 text-sm font-semibold text-green-600 dark:text-green-400">
          {formatUSD(yearData.usdValue)}
        </div>
        
        {/* Status - simplified on mobile */}
        <div className="flex-none w-20 sm:w-32 text-sm">
          <span className={`px-1 sm:px-2 py-1 rounded-full text-xs font-medium ${
            vestingPercent === 100 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
            vestingPercent === 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
          }`}>
            <span className="hidden sm:inline">{vestingPercent}% Vested</span>
            <span className="sm:hidden">{vestingPercent}%</span>
          </span>
        </div>
        
        {/* Desktop-only columns */}
        <div className="hidden lg:block flex-none w-28 text-sm text-gray-700 dark:text-white/90">
          {yearData.grantSize > 0 ? (
            <span className="font-medium text-bitcoin">{formatBTC(yearData.grantSize)}</span>
          ) : (
            <span className="text-gray-400 dark:text-white/50">—</span>
          )}
        </div>
        
        <div className="hidden lg:block flex-none w-24 text-sm text-gray-700 dark:text-white/90">
          {formatUSD(yearData.bitcoinPrice)}
        </div>
        
        <div className="hidden lg:block flex-none w-20 text-sm">
          {yoyGrowth !== null ? (
            <span className={`font-medium ${yoyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {yoyGrowth >= 0 ? '+' : ''}{formatPercent(yoyGrowth)}
            </span>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </div>
      </div>
    </div>
  );
});

Row.displayName = 'VirtualizedRow';

// Main component with optimizations
function VirtualizedAnnualBreakdownOptimized({
  yearlyData,
  initialGrant,
  annualGrant,
  currentBitcoinPrice,
  schemeId,
  maxDisplayYears = 11
}: VirtualizedAnnualBreakdownProps) {
  
  // Calculate total invested
  const totalInvested = useMemo(() => {
    let total = initialGrant * currentBitcoinPrice;
    if (annualGrant) {
      if (schemeId === 'slow-burn') {
        total += annualGrant * currentBitcoinPrice * 10;
      } else if (schemeId === 'steady-builder') {
        total += annualGrant * currentBitcoinPrice * 5;
      }
    }
    return total;
  }, [initialGrant, annualGrant, currentBitcoinPrice, schemeId]);

  // Calculate final metrics
  const finalMetrics = useMemo(() => {
    const finalYear = yearlyData[yearlyData.length - 1];
    if (!finalYear) return { value: 0, roi: 0, cagr: 0 };
    
    const finalValue = finalYear.usdValue;
    const roi = totalInvested > 0 ? ((finalValue - totalInvested) / totalInvested) : 0;
    const years = yearlyData.length - 1;
    const cagr = years > 0 && totalInvested > 0 
      ? Math.pow(finalValue / totalInvested, 1 / years) - 1 
      : 0;
    
    return { value: finalValue, roi, cagr };
  }, [yearlyData, totalInvested]);

  const currentYear = new Date().getFullYear();
  
  // Prepare data for virtualized list
  const listData = useMemo(() => ({
    yearlyData,
    currentYear,
    schemeId
  }), [yearlyData, currentYear, schemeId]);

  // Only show table if we have data
  if (!yearlyData || yearlyData.length === 0) {
    return null;
  }

  const displayYears = Math.min(yearlyData.length, maxDisplayYears);
  const shouldVirtualize = displayYears > 5;

  return (
    <div className="mt-8">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Annual Breakdown
      </h4>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="flex items-center bg-gray-50 dark:bg-slate-700 px-2 sm:px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/80 uppercase tracking-wider border-b border-gray-200 dark:border-slate-600">
          <div className="flex-none w-12 sm:w-16">Year</div>
          <div className="flex-none w-20 sm:w-24">BTC</div>
          <div className="flex-1 min-w-0">USD Value</div>
          <div className="flex-none w-20 sm:w-32">Status</div>
          
          {/* Desktop-only headers */}
          <div className="hidden lg:block flex-none w-28">Grant</div>
          <div className="hidden lg:block flex-none w-24">BTC Price</div>
          <div className="hidden lg:block flex-none w-20">YoY Growth</div>
        </div>

        {/* Table Body - Virtualized for performance */}
        {shouldVirtualize ? (
          <List
            height={Math.min(400, displayYears * 60)}
            itemCount={displayYears}
            itemSize={60}
            width="100%"
            itemData={listData}
          >
            {Row}
          </List>
        ) : (
          // Non-virtualized for small datasets
          <div>
            {yearlyData.slice(0, displayYears).map((_, index) => (
              <Row
                key={index}
                index={index}
                style={{ height: 60 }}
                data={listData}
              />
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">Total Invested</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatUSD(totalInvested)}
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">
            At current BTC price
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-xl border border-green-200 dark:border-green-800">
          <div className="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">Return on Investment</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {formatPercent(finalMetrics.roi)}
          </div>
          <div className="text-xs text-green-700 dark:text-green-400 mt-1">
            Total gain
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-1">Annualized Return</div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {formatPercent(finalMetrics.cagr)}
          </div>
          <div className="text-xs text-purple-700 dark:text-purple-400 mt-1">
            CAGR over {displayYears} years
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(VirtualizedAnnualBreakdownOptimized);

'use client';

import React, { useMemo, CSSProperties } from 'react';
import { FixedSizeList as List } from 'react-window';

interface YearlyDataPoint {
  year: number;
  btcBalance: number;
  usdValue: number;
  bitcoinPrice: number;
  vestedAmount: number;
}

interface VirtualizedAnnualBreakdownProps {
  yearlyData: YearlyDataPoint[];
  initialGrant: number;
  annualGrant?: number;
  currentBitcoinPrice: number;
  schemeId?: string;
  maxDisplayYears?: number; // Number of years to display (default 11)
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

interface RowData {
  yearlyData: YearlyDataPoint[];
  initialGrant: number;
  annualGrant?: number;
  currentBitcoinPrice: number;
  schemeId?: string;
}

const Row = ({ index, style, data }: { index: number; style: CSSProperties; data: RowData }) => {
  const { yearlyData, initialGrant, annualGrant, currentBitcoinPrice, schemeId } = data;
  const point = yearlyData[index];
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

  const isEvenRow = index % 2 === 0;
  const isMilestone = year === 5 || year === 10;

  return (
    <div 
      style={style} 
      className={`
        flex items-center px-2 sm:px-4 border-b border-gray-200 dark:border-slate-700
        ${isEvenRow ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800/50'}
        ${isMilestone ? (year === 10 ? 'bg-green-50/50 dark:bg-green-900/20' : 'bg-yellow-50/50 dark:bg-yellow-900/20') : ''}
        hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors
      `}
    >
      {/* Mobile-first layout with essential columns */}
      <div className="flex-none w-12 sm:w-16 text-sm font-bold text-gray-900 dark:text-white">
        {year}
      </div>
      
      {/* BTC column */}
      <div className="flex-none w-20 sm:w-24 text-sm font-medium text-blue-600 dark:text-blue-400">
        {formatBTC(point.btcBalance)}
      </div>
      
      {/* USD Value column - Fixed width to prevent overflow */}
      <div className="flex-none w-24 sm:w-32 lg:w-36 text-sm font-bold text-gray-900 dark:text-white truncate">
        {formatUSD(point.usdValue)}
      </div>
      
      {/* Status column - Adjusted width for better spacing */}
      <div className="flex-none w-16 sm:w-24 lg:w-28 text-sm">
        <span className={`inline-flex px-1 sm:px-3 py-1 rounded-full text-xs font-bold ${
          vestingPercent === 100 ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-md' :
          vestingPercent === 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md' :
          'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
        }`}>
          <span className="hidden sm:inline">{vestingPercent}% Unlocked</span>
          <span className="sm:hidden">{vestingPercent}%</span>
        </span>
      </div>
      
      {/* Desktop-only columns - Adjusted spacing */}
      <div className="flex-none w-24 text-sm text-gray-700 dark:text-gray-300 hidden lg:block">
        {grantCost > 0 ? (
          <span className="font-semibold text-orange-600 dark:text-orange-400">
            {formatUSD(grantCost)}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-600">—</span>
        )}
      </div>
      
      <div className="flex-none w-20 text-sm text-gray-700 dark:text-gray-300 hidden lg:block truncate">
        {formatUSD(point.bitcoinPrice)}
      </div>
    </div>
  );
};

function VirtualizedAnnualBreakdown({
  yearlyData,
  initialGrant,
  annualGrant,
  currentBitcoinPrice,
  schemeId,
  maxDisplayYears = 11
}: VirtualizedAnnualBreakdownProps) {
  // Slice data to display only the specified number of years
  const displayData = useMemo(() => 
    yearlyData.slice(0, maxDisplayYears),
    [yearlyData, maxDisplayYears]
  );

  // Calculate total grant cost
  const totalCost = useMemo(() => {
    let total = 0;
    displayData.forEach((point) => {
      const year = point.year;
      if (year === 0 && initialGrant > 0) {
        total += initialGrant * currentBitcoinPrice;
      } else if (year > 0 && annualGrant && annualGrant > 0) {
        const maxAnnualYears = schemeId === 'slow-burn' ? 10 : 5;
        if (year <= maxAnnualYears) {
          total += annualGrant * point.bitcoinPrice;
        }
      }
    });
    return total;
  }, [displayData, initialGrant, annualGrant, currentBitcoinPrice, schemeId]);

  const totalBTC = useMemo(() => {
    let total = 0;
    if (initialGrant > 0) total += initialGrant;
    if (annualGrant && annualGrant > 0) {
      const maxAnnualYears = schemeId === 'slow-burn' ? 10 : 5;
      total += annualGrant * Math.min(maxAnnualYears, maxDisplayYears - 1);
    }
    return total;
  }, [initialGrant, annualGrant, schemeId, maxDisplayYears]);

  const itemData: RowData = {
    yearlyData: displayData,
    initialGrant,
    annualGrant,
    currentBitcoinPrice,
    schemeId
  };

  // Calculate optimal row height based on screen size
  const rowHeight = 56; // Height for each row in pixels

  // Calculate container height - show up to 10 rows without scrolling, then virtualize
  const visibleRows = Math.min(displayData.length, 10);
  const containerHeight = Math.min(rowHeight * displayData.length, rowHeight * visibleRows);

  return (
    <div className="mt-6 w-full overflow-hidden">
      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Annual Breakdown</h4>
      <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
        Here are the same projections, but broken down year by year. You can see the potential cash value of the grant each year and what percentage of it the employee officially owns (has "unlocked").
      </p>
      
      {/* Header */}
      <div className="overflow-x-auto rounded-t-xl shadow-lg w-full bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 border-x border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center px-2 sm:px-4 py-3 min-w-[300px] sm:min-w-[500px]">
          <div className="flex-none w-12 sm:w-16 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            Year
          </div>
          <div className="flex-none w-20 sm:w-24 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            BTC
          </div>
          <div className="flex-none w-24 sm:w-32 lg:w-36 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            USD Value
          </div>
          <div className="flex-none w-16 sm:w-24 lg:w-28 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            Status
          </div>
          
          {/* Desktop-only columns */}
          <div className="flex-none w-24 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden lg:block">
            Award Cost
          </div>
          <div className="flex-none w-20 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider hidden lg:block">
            BTC Price
          </div>
        </div>
      </div>

      {/* Virtualized Table Body */}
      <div className="overflow-x-auto rounded-b-xl shadow-lg w-full bg-white dark:bg-slate-900 border-x border-b border-gray-200 dark:border-slate-700">
        <div className="min-w-[300px] lg:min-w-[500px]">
          {displayData.length > 10 ? (
            // Use virtualization for large datasets
            <List
              height={containerHeight}
              itemCount={displayData.length}
              itemSize={rowHeight}
              width="100%"
              itemData={itemData}
            >
              {Row}
            </List>
          ) : (
            // For small datasets, render directly without virtualization
            displayData.map((_, index) => (
              <Row 
                key={index} 
                index={index} 
                style={{ height: rowHeight }} 
                data={itemData} 
              />
            ))
          )}
        </div>
      </div>

      {/* Total Award Cost Summary */}
      <div className="mt-6 p-5 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30 border border-orange-200 dark:border-orange-800 rounded-xl shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h5 className="text-base font-bold text-orange-900 dark:text-orange-200 mb-1">
              Total Award Cost
            </h5>
            <p className="text-xs text-orange-700 dark:text-orange-400">
              Based on projected Bitcoin price for each grant year
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-1">
              {formatUSD(totalCost)}
            </div>
            <div className="text-sm font-medium text-orange-700 dark:text-orange-300">
              {formatBTC(totalBTC)} total awards
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(VirtualizedAnnualBreakdown);

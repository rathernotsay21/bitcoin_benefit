'use client';

import { useState, useEffect, useRef } from 'react';
import { ExpectedGrant, AnnotatedTransaction } from '@/types/on-chain';
import { formatBTC, formatBTCSummary, formatUSD, formatUSDCompact } from '@/lib/utils';

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

export default function OnChainTimelineVisualizer({
  expectedGrants,
  actualTransactions,
  vestingStartDate
}: OnChainTimelineVisualizerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Refs for form elements
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
      tx.grantYear === grant.year && tx.type === 'Annual Award'
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

  // Skip to table functionality
  const skipToTable = () => {
    if (tableRef.current) {
      tableRef.current.focus();
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden">

      {/* Skip link for keyboard users */}
      <button
        onClick={skipToTable}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-bitcoin text-white px-4 py-2 rounded z-50 focus:outline-none focus:ring-2 focus:ring-bitcoin-light"
      >
        Skip to data table
      </button>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div className="text-sm font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wide">
              Expected
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
            {formatBTCSummary(totalExpected)}
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
            {formatBTCSummary(totalReceived)}
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
              Grants
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
      <div className="mb-6">
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
            <span className="text-blue-600 dark:text-blue-400 font-bold">{formatBTCSummary(totalExpected)}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="font-medium">• Received:</span>
            <span className="text-green-600 dark:text-green-400 font-bold">{formatBTCSummary(totalReceived)}</span>
          </span>
        </div>
      </div>


    </div>
  );
}
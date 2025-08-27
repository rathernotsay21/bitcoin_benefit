'use client';

import React, { useState, useMemo, memo, useCallback } from 'react';
import { AnnotatedTransaction, ExpectedGrant } from '@/types/on-chain';
import { formatBTC, formatUSD } from '@/lib/utils';
import ManualAnnotationOverride from './ManualAnnotationOverride';
import { OnChainErrorBoundary, TimelineErrorBoundary } from './OnChainErrorBoundaries';

interface VestingTrackerResultsProps {
  transactions: AnnotatedTransaction[];
  expectedGrants: ExpectedGrant[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onUpdateAnnotation: (txid: string, grantYear: number | null) => void;
  originalAnnotations?: Map<string, number | null>;
  partialDataAvailable?: boolean;
  onContinueWithPartialData?: () => void;
}

type SortField = 'date' | 'grantYear' | 'type' | 'amountBTC' | 'valueAtTimeOfTx';
type SortDirection = 'asc' | 'desc';

/**
 * Optimized transaction row component with memoization
 */
const TransactionRow = memo(function TransactionRow({
  transaction,
  expectedGrants,
  onUpdateAnnotation,
  originalAnnotations,
  formatDate,
  formatGrantYear,
  getTransactionLink
}: {
  transaction: AnnotatedTransaction;
  expectedGrants: ExpectedGrant[];
  onUpdateAnnotation: (txid: string, grantYear: number | null) => void;
  originalAnnotations: Map<string, number | null>;
  formatDate: (date: string) => string;
  formatGrantYear: (year: number | null) => string;
  getTransactionLink: (txid: string) => string;
}) {
  // Memoize expensive calculations
  const memoizedGrantYear = useMemo(() => formatGrantYear(transaction.grantYear), [transaction.grantYear, formatGrantYear]);
  const memoizedDate = useMemo(() => formatDate(transaction.date), [transaction.date, formatDate]);
  const memoizedAmount = useMemo(() => transaction.amountBTC.toFixed(3), [transaction.amountBTC]);
  const memoizedValue = useMemo(() => {
    return transaction.valueAtTimeOfTx !== null ? formatUSD(transaction.valueAtTimeOfTx) : null;
  }, [transaction.valueAtTimeOfTx]);
  const memoizedTxLink = useMemo(() => getTransactionLink(transaction.txid), [transaction.txid, getTransactionLink]);
  const memoizedShortTxid = useMemo(() => {
    return `${transaction.txid.slice(0, 8)}...${transaction.txid.slice(-6)}`;
  }, [transaction.txid]);
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="py-3 px-2 sm:px-4">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
              transaction.grantYear !== null
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-700'
            }`}
          >
            {memoizedGrantYear}
          </span>
          {transaction.isManuallyAnnotated && (
            <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              Manual
            </span>
          )}
        </div>
      </td>
      <td className="py-3 px-2 sm:px-4 text-gray-900 dark:text-white font-medium">
        <a
          href={memoizedTxLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-bitcoin hover:text-bitcoin-dark transition-colors underline decoration-dotted underline-offset-2"
          title="View on Mempool.space"
        >
          {memoizedDate}
        </a>
      </td>
      <td className="py-3 px-2 sm:px-4">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            transaction.type === 'Annual Award'
              ? 'bg-bitcoin-100 text-bitcoin-700 dark:bg-bitcoin/20 dark:text-bitcoin'
              : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-700'
          }`}
        >
          {transaction.type}
        </span>
      </td>
      <td className="py-3 px-2 sm:px-4 text-gray-900 dark:text-white font-mono text-sm">
        {memoizedAmount}
      </td>
      <td className="py-3 px-2 sm:px-4 text-gray-900 dark:text-white font-medium">
        {memoizedValue || (
          <span className="text-gray-400 dark:text-slate-500 italic">
            N/A
          </span>
        )}
      </td>
      <td className="py-3 px-2 sm:px-4">
        <ManualAnnotationOverride
          transaction={transaction}
          availableGrants={expectedGrants}
          onUpdate={onUpdateAnnotation}
          originalAnnotation={originalAnnotations.get(transaction.txid) ?? null}
        />
      </td>
    </tr>
  );
});

/**
 * Optimized summary statistics component
 */
const SummaryStatistics = memo(function SummaryStatistics({
  transactions
}: {
  transactions: AnnotatedTransaction[];
}) {
  // Memoize expensive calculations
  const stats = useMemo(() => {
    const matchedGrantsCount = transactions.filter(t => t.type === 'Annual Award').length;
    const totalBTC = transactions.reduce((sum, t) => sum + t.amountBTC, 0);
    const totalValue = transactions.reduce((sum, t) => sum + (t.valueAtTimeOfTx || 0), 0);
    const hasUnavailablePrices = transactions.some(t => t.valueAtTimeOfTx === null);
    
    return {
      matchedGrantsCount,
      totalBTC,
      totalValue,
      hasUnavailablePrices
    };
  }, [transactions]);
  
  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.matchedGrantsCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-slate-400">
            Vesting Awards Matched
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatBTC(stats.totalBTC)}
          </div>
          <div className="text-sm text-gray-600 dark:text-slate-400">
            Total BTC Received
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalValue > 0 ? formatUSD(stats.totalValue) : 'N/A'}
          </div>
          <div className="text-sm text-gray-600 dark:text-slate-400">
            Total USD Value at Time
            {stats.hasUnavailablePrices && (
              <span className="block text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                Some price data unavailable
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Optimized sort header component
 */
const SortHeader = memo(function SortHeader({
  field,
  currentSortField,
  sortDirection,
  onSort,
  children
}: {
  field: SortField;
  currentSortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
}) {
  const handleClick = useCallback(() => {
    onSort(field);
  }, [field, onSort]);
  
  const SortIcon = useMemo(() => {
    if (currentSortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-bitcoin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-bitcoin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  }, [currentSortField, field, sortDirection]);
  
  return (
    <th className="text-left py-3 px-4">
      <button
        onClick={handleClick}
        className="flex items-center gap-2 font-medium text-gray-700 dark:text-slate-700 hover:text-bitcoin transition-colors"
      >
        {children}
        {SortIcon}
      </button>
    </th>
  );
});

/**
 * Performance-optimized main component
 */
const VestingTrackerResultsOptimized = memo(function VestingTrackerResultsOptimized({
  transactions,
  expectedGrants,
  isLoading,
  error,
  onRetry,
  onUpdateAnnotation,
  originalAnnotations = new Map(),
  partialDataAvailable,
  onContinueWithPartialData
}: VestingTrackerResultsProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Memoized sorting function
  const sortedTransactions = useMemo(() => {
    if (!transactions.length) return [];

    return [...transactions].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'grantYear':
          aValue = a.grantYear ?? -1;
          bValue = b.grantYear ?? -1;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'amountBTC':
          aValue = a.amountBTC;
          bValue = b.amountBTC;
          break;
        case 'valueAtTimeOfTx':
          aValue = a.valueAtTimeOfTx ?? 0;
          bValue = b.valueAtTimeOfTx ?? 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [transactions, sortField, sortDirection]);

  // Memoized utility functions
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }, []);

  const formatGrantYear = useCallback((grantYear: number | null) => {
    if (grantYear === null) return 'Unmatched';
    return `Year ${grantYear}`;
  }, []);

  const getTransactionLink = useCallback((txid: string) => {
    return `https://mempool.space/tx/${txid}`;
  }, []);

  // Memoized sort handler
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField, sortDirection]);

  // Memoized loading skeleton
  const LoadingSkeleton = useMemo(() => (
    <div className="space-y-4">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ), []);

  // Memoized empty state
  const EmptyState = useMemo(() => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No transactions found
      </h3>
      <p className="text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
        No transactions were found for this Bitcoin address. Please verify the address is correct and has transaction history.
      </p>
    </div>
  ), []);

  // Enhanced error state component with more specific error messages
  const ErrorState = useMemo(() => {
    const isNetworkError = error?.includes('Network') || error?.includes('connection') || error?.includes('timeout');
    const isValidationError = error?.includes('Invalid') || error?.includes('address') || error?.includes('format');
    const isPartialDataError = error?.includes('partial') || error?.includes('Price data unavailable');

    return (
      <div className="text-center py-12">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isPartialDataError 
            ? 'bg-yellow-100 dark:bg-yellow-900/30'
            : 'bg-red-100 dark:bg-red-900/30'
        }`}>
          <svg 
            className={`w-8 h-8 ${
              isPartialDataError 
                ? 'text-yellow-500 dark:text-yellow-400'
                : 'text-red-500 dark:text-red-400'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {isPartialDataError ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            )}
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {isPartialDataError 
            ? 'Partial Data Available' 
            : isNetworkError 
            ? 'Connection Error'
            : isValidationError
            ? 'Invalid Input'
            : 'Error Loading Transactions'
          }
        </h3>
        <p className="text-gray-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
          {error}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="btn-primary inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
          {isNetworkError && (
            <button
              onClick={() => window.open('https://mempool.space', '_blank')}
              className="btn-secondary inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Check Mempool.space
            </button>
          )}
        </div>
      </div>
    );
  }, [error, onRetry]);

  if (isLoading) {
    return (
      <div className="card">
        {LoadingSkeleton}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        {ErrorState}
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="card">
        {EmptyState}
      </div>
    );
  }

  return (
    <OnChainErrorBoundary onRetry={onRetry}>
      <div className="card" style={{ overflow: 'visible' }}>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Transaction Analysis Results
          </h3>
          <p className="text-gray-600 dark:text-slate-400">
            Found {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} • 
            {' '}{transactions.filter(t => t.type === 'Annual Award').length} matched to vesting awards
          </p>
        </div>

        <div className="overflow-x-auto w-full" style={{ overflowY: 'visible' }}>
          <table className="min-w-full w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <SortHeader
                  field="grantYear"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Year
                </SortHeader>
                <SortHeader
                  field="date"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Date
                </SortHeader>
                <SortHeader
                  field="type"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  <span className="hidden sm:inline">Type</span>
                  <span className="sm:hidden">T</span>
                </SortHeader>
                <SortHeader
                  field="amountBTC"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  BTC
                </SortHeader>
                <SortHeader
                  field="valueAtTimeOfTx"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  <span className="hidden sm:inline">USD</span>
                  <span className="sm:hidden">$</span>
                </SortHeader>
                <th className="text-left py-3 px-4">
                  <span className="font-medium text-gray-700 dark:text-slate-700">
                    <span className="hidden sm:inline">Match</span>
                    <span className="sm:hidden">M</span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {sortedTransactions.map((transaction) => (
                <TransactionRow
                  key={transaction.txid}
                  transaction={transaction}
                  expectedGrants={expectedGrants}
                  onUpdateAnnotation={onUpdateAnnotation}
                  originalAnnotations={originalAnnotations}
                  formatDate={formatDate}
                  formatGrantYear={formatGrantYear}
                  getTransactionLink={getTransactionLink}
                />
              ))}
            </tbody>
          </table>
        </div>

        <SummaryStatistics transactions={transactions} />
      </div>
    </OnChainErrorBoundary>
  );
});

export default VestingTrackerResultsOptimized;

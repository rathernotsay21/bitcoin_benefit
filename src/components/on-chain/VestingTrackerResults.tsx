'use client';

import { useState, useMemo, useEffect } from 'react';
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

export default function VestingTrackerResults({
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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isMobile, setIsMobile] = useState(false);
  const [announceSort, setAnnounceSort] = useState('');

  // Check for mobile view
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-switch to cards on mobile for better UX
      if (mobile && viewMode === 'table') {
        setViewMode('cards');
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [viewMode]);

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    if (!transactions.length) return [];

    const sorted = [...transactions].sort((a, b) => {
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

    return sorted;
  }, [transactions, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    // Announce sort change to screen readers
    const fieldLabels = {
      'date': 'Date',
      'grantYear': 'Award Year', 
      'type': 'Type',
      'amountBTC': 'Bitcoin Amount',
      'valueAtTimeOfTx': 'USD Value'
    };
    
    const announcement = `Table sorted by ${fieldLabels[field]} in ${newDirection}ending order`;
    setAnnounceSort(announcement);
    setTimeout(() => setAnnounceSort(''), 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatGrantYear = (grantYear: number | null) => {
    if (grantYear === null) return 'Unmatched';
    return `Year ${grantYear}`;
  };

  const getTransactionLink = (txid: string) => {
    return `https://mempool.space/tx/${txid}`;
  };

  const getStatusColor = (type: string) => {
    return type === 'Annual Award' 
      ? 'bg-bitcoin-100 text-bitcoin-700 dark:bg-bitcoin/20 dark:text-bitcoin'
      : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-700';
  };

  const getGrantYearColor = (grantYear: number | null, isManual: boolean) => {
    if (grantYear === null) {
      return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-700';
    }
    return isManual 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4" role="status" aria-label="Loading transaction data">
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
      <span className="sr-only">Loading transaction analysis results...</span>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
        <svg 
          className="w-8 h-8 text-gray-400 dark:text-slate-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
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
  );

  // Enhanced error state
  const ErrorState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <svg 
          className="w-8 h-8 text-red-500 dark:text-red-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Error Loading Transactions
      </h3>
      <p className="text-gray-500 dark:text-slate-400 max-w-sm mx-auto mb-6" role="alert">
        {error}
      </p>
      <button
        onClick={onRetry}
        className="btn-primary inline-flex items-center"
        aria-label="Retry loading transaction data"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Try Again
      </button>
    </div>
  );

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    const isActive = sortField === field;
    
    if (!isActive) {
      return (
        <svg 
          className="w-4 h-4 text-gray-600 dark:text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg 
        className="w-4 h-4 text-bitcoin" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg 
        className="w-4 h-4 text-bitcoin" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // Card view for mobile/responsive
  const CardView = () => (
    <div className="space-y-4">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announceSort}
      </div>
      
      {sortedTransactions.map((transaction, index) => (
        <div 
          key={transaction.txid}
          className="card p-4 hover:shadow-md transition-shadow duration-200"
          role="article"
          aria-labelledby={`transaction-${index}-summary`}
        >
          {/* Transaction summary for screen readers */}
          <h3 
            id={`transaction-${index}-summary`} 
            className="sr-only"
          >
            Transaction from {formatDate(transaction.date)}, 
            {formatBTC(transaction.amountBTC)} Bitcoin, 
            {formatGrantYear(transaction.grantYear)}
          </h3>

          <div className="flex flex-col space-y-3">
            {/* Header row */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span 
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium w-fit ${getGrantYearColor(transaction.grantYear, transaction.isManuallyAnnotated)}`}
                  aria-label={`Grant year: ${formatGrantYear(transaction.grantYear)}${transaction.isManuallyAnnotated ? ' (manually assigned)' : ''}`}
                >
                  {formatGrantYear(transaction.grantYear)}
                  {transaction.isManuallyAnnotated && (
                    <span className="ml-1 text-xs">✎</span>
                  )}
                </span>
              </div>
              
              <span 
                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.type)}`}
                aria-label={`Transaction type: ${transaction.type}`}
              >
                {transaction.type}
              </span>
            </div>

            {/* Main content */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gray-500 dark:text-slate-400 mb-1">Date</dt>
                <dd className="text-gray-900 dark:text-white font-medium">
                  <a
                    href={getTransactionLink(transaction.txid)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bitcoin hover:text-bitcoin-dark transition-colors underline decoration-dotted underline-offset-2 focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-2 rounded"
                    aria-label={`View transaction on Mempool.space (opens in new tab)`}
                  >
                    {formatDate(transaction.date)}
                  </a>
                </dd>
              </div>
              
              <div>
                <dt className="font-medium text-gray-500 dark:text-slate-400 mb-1">Amount</dt>
                <dd className="text-gray-900 dark:text-white font-mono font-bold">
                  {transaction.amountBTC.toFixed(3)}
                </dd>
              </div>
              
              <div>
                <dt className="font-medium text-gray-500 dark:text-slate-400 mb-1">USD Value</dt>
                <dd className="text-gray-900 dark:text-white font-medium">
                  {transaction.valueAtTimeOfTx !== null
                    ? formatUSD(transaction.valueAtTimeOfTx)
                    : (
                      <span className="text-gray-400 dark:text-slate-500 italic">
                        N/A
                      </span>
                    )
                  }
                </dd>
              </div>
              

            </div>

            {/* Manual override */}
            <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                  Match
                </span>
                <ManualAnnotationOverride
                  transaction={transaction}
                  availableGrants={expectedGrants}
                  onUpdate={onUpdateAnnotation}
                  originalAnnotation={originalAnnotations.get(transaction.txid) ?? null}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Table view for desktop
  const TableView = () => (
    <div className="overflow-x-auto rounded-sm border border-gray-200 dark:border-slate-700">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announceSort}
      </div>
      
      <table 
        className="min-w-full bg-white dark:bg-slate-900"
        role="table"
        aria-label="Transaction analysis results"
        aria-describedby="table-summary"
      >
        <caption id="table-summary" className="sr-only">
          Table showing {transactions.length} transactions with their grant year assignments, 
          dates, types, amounts, and manual override options. 
          {transactions.filter(t => t.type === 'Annual Award').length} transactions matched to vesting awards.
        </caption>
        
        <thead className="bg-gray-50 dark:bg-slate-800">
          <tr role="row">
            <th 
              className="text-left py-3 px-4"
              scope="col"
            >
              <button
                onClick={() => handleSort('grantYear')}
                className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 dark:text-slate-700 dark:text-slate-300 hover:text-bitcoin transition-colors focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-2 rounded"
                aria-label={`Sort by Grant Year ${sortField === 'grantYear' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : ''}`}
              >
                Year
                <SortIcon field="grantYear" />
              </button>
            </th>
            
            <th 
              className="text-left py-3 px-4"
              scope="col"
            >
              <button
                onClick={() => handleSort('date')}
                className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 dark:text-slate-700 dark:text-slate-300 hover:text-bitcoin transition-colors focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-2 rounded"
                aria-label={`Sort by Date ${sortField === 'date' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : ''}`}
              >
                Date
                <SortIcon field="date" />
              </button>
            </th>
            
            <th 
              className="text-left py-3 px-4"
              scope="col"
            >
              <button
                onClick={() => handleSort('type')}
                className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 dark:text-slate-700 dark:text-slate-300 hover:text-bitcoin transition-colors focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-2 rounded"
                aria-label={`Sort by Type ${sortField === 'type' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : ''}`}
              >
                Type
                <SortIcon field="type" />
              </button>
            </th>
            
            <th 
              className="text-left py-3 px-4"
              scope="col"
            >
              <button
                onClick={() => handleSort('amountBTC')}
                className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 dark:text-slate-700 dark:text-slate-300 hover:text-bitcoin transition-colors focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-2 rounded"
                aria-label={`Sort by Bitcoin Amount ${sortField === 'amountBTC' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : ''}`}
              >
                BTC
                <SortIcon field="amountBTC" />
              </button>
            </th>
            
            <th 
              className="text-left py-3 px-4"
              scope="col"
            >
              <button
                onClick={() => handleSort('valueAtTimeOfTx')}
                className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 dark:text-slate-700 dark:text-slate-300 hover:text-bitcoin transition-colors focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-2 rounded"
                aria-label={`Sort by USD Value ${sortField === 'valueAtTimeOfTx' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : ''}`}
              >
                USD
                <SortIcon field="valueAtTimeOfTx" />
              </button>
            </th>
            
            <th 
              className="text-left py-3 px-4"
              scope="col"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300 dark:text-slate-700 dark:text-slate-300">
                Match
              </span>
            </th>
          </tr>
        </thead>
        
        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
          {sortedTransactions.map((transaction) => (
            <tr
              key={transaction.txid}
              className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              role="row"
            >
              <td className="py-4 px-4" role="gridcell">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getGrantYearColor(transaction.grantYear, transaction.isManuallyAnnotated)}`}
                    aria-label={`Grant year: ${formatGrantYear(transaction.grantYear)}${transaction.isManuallyAnnotated ? ' (manually assigned)' : ''}`}
                  >
                    {formatGrantYear(transaction.grantYear)}
                  </span>
                  {transaction.isManuallyAnnotated && (
                    <span 
                      className="inline-flex px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      aria-label="Manually modified"
                    >
                      Manual
                    </span>
                  )}
                </div>
              </td>
              
              <td className="py-4 px-4 text-gray-900 dark:text-white font-medium" role="gridcell">
                <a
                  href={getTransactionLink(transaction.txid)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bitcoin hover:text-bitcoin-dark transition-colors underline decoration-dotted underline-offset-2 focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-2 rounded"
                  aria-label={`View transaction on Mempool.space (opens in new tab)`}
                >
                  {formatDate(transaction.date)}
                </a>
              </td>
              
              <td className="py-4 px-4" role="gridcell">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.type)}`}
                  aria-label={`Transaction type: ${transaction.type}`}
                >
                  {transaction.type}
                </span>
              </td>
              
              <td className="py-4 px-4 text-gray-900 dark:text-white font-mono font-medium" role="gridcell">
                {transaction.amountBTC.toFixed(3)}
              </td>
              
              <td className="py-4 px-4 text-gray-900 dark:text-white font-medium" role="gridcell">
                {transaction.valueAtTimeOfTx !== null
                  ? formatUSD(transaction.valueAtTimeOfTx)
                  : (
                    <span className="text-gray-400 dark:text-slate-500 italic">
                      N/A
                    </span>
                  )
                }
              </td>
              
              <td className="py-4 px-4" role="gridcell">
                <ManualAnnotationOverride
                  transaction={transaction}
                  availableGrants={expectedGrants}
                  onUpdate={onUpdateAnnotation}
                  originalAnnotation={originalAnnotations.get(transaction.txid) ?? null}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (isLoading) {
    return (
      <div className="card">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <ErrorState />
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="card">
        <EmptyState />
      </div>
    );
  }

  return (
    <OnChainErrorBoundary onRetry={onRetry}>
      <div className="card">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Transaction Analysis Results
              </h3>
              <p 
                className="text-gray-600 dark:text-gray-400 dark:text-slate-400"
                role="status"
                aria-live="polite"
              >
                Found {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} • 
                {' '}{transactions.filter(t => t.type === 'Annual Award').length} matched to vesting awards
              </p>
            </div>

            {/* View toggle for tablet/desktop */}
            {!isMobile && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-slate-400">View:</span>
                <div 
                  className="flex rounded-sm border border-gray-300 dark:border-slate-600 overflow-hidden"
                  role="tablist"
                  aria-label="View mode selection"
                >
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-inset ${
                      viewMode === 'table'
                        ? 'bg-bitcoin text-white'
                        : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 dark:text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                    role="tab"
                    aria-selected={viewMode === 'table'}
                    aria-label="Table view"
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-inset ${
                      viewMode === 'cards'
                        ? 'bg-bitcoin text-white'
                        : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 dark:text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                    role="tab"
                    aria-selected={viewMode === 'cards'}
                    aria-label="Cards view"
                  >
                    Cards
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Render the appropriate view */}
          <div role="tabpanel" aria-label={`${viewMode} view of transaction results`}>
            {viewMode === 'cards' || isMobile ? <CardView /> : <TableView />}
          </div>
        </div>

        {/* Summary statistics */}
        <div 
          className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700"
          aria-labelledby="summary-heading"
        >
          <h4 id="summary-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Summary Statistics
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-sm">
              <div className="text-2xl font-bold text-green-900 dark:text-green-300 mb-1">
                {transactions.filter(t => t.type === 'Annual Award').length}
              </div>
              <div className="text-sm text-green-700 dark:text-green-400 font-medium">
                Vesting Awards Matched
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-sm">
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-300 mb-1">
                {formatBTC(transactions.reduce((sum, t) => sum + t.amountBTC, 0))}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                Total BTC Received
              </div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 dark:bg-bitcoin-900/20 rounded-sm">
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-300 mb-1">
                {(() => {
                  const totalValue = transactions.reduce((sum, t) => 
                    sum + (t.valueAtTimeOfTx || 0), 0
                  );
                  return totalValue > 0 ? formatUSD(totalValue) : 'N/A';
                })()}
              </div>
              <div className="text-sm text-bitcoin-700 dark:text-orange-400 font-medium">
                Total USD Value at Time
                {transactions.some(t => t.valueAtTimeOfTx === null) && (
                  <div className="text-xs mt-1 text-yellow-600 dark:text-yellow-400">
                    Some price data unavailable
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </OnChainErrorBoundary>
  );
}

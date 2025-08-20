'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useBitcoinToolsStore } from '@/stores/bitcoinToolsStore';
import { TransactionService } from '@/lib/services/transactionService';
import { createToolError } from '@/types/bitcoin-tools';
import { usePrivacyProtection } from '@/hooks/usePrivacyProtection';
import ToolSkeleton from './ToolSkeleton';
import { BitcoinTooltip } from './Tooltip';
import ToolErrorBoundary from './ToolErrorBoundary';

interface TransactionLookupToolProps {
  initialTxid?: string;
}

function TransactionLookupTool({ initialTxid }: TransactionLookupToolProps) {
  const {
    tools: { transactionLookup },
    setTransactionLoading,
    setTransactionData,
    setTransactionError,
    checkRateLimit,
    recordRequest
  } = useBitcoinToolsStore();

  const { clearToolDataSecurely } = usePrivacyProtection({
    toolName: 'transaction-lookup',
    clearOnUnmount: true,
    clearOnNavigation: true
  });

  const [txidInput, setTxidInput] = useState(initialTxid || '');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLookup = useCallback(async (txid: string) => {
    const cleanTxid = txid.trim();

    // Validate format before making API call
    if (!TransactionService.validateTxid(cleanTxid)) {
      setTransactionError(createToolError('validation', 'INVALID_TXID'));
      return;
    }

    // Check rate limit
    if (!checkRateLimit('transaction-lookup')) {
      setTransactionError(createToolError('rate_limit', 'RATE_LIMIT_EXCEEDED'));
      return;
    }

    setTransactionLoading({
      isLoading: true,
      loadingMessage: 'Looking up transaction on the Bitcoin blockchain...'
    });

    try {
      recordRequest('transaction-lookup');
      const transactionData = await TransactionService.getTransactionDetails(cleanTxid);
      setTransactionData(transactionData);
    } catch (error) {
      console.error('Transaction lookup error:', error);
      setTransactionError(error as any);
    }
  }, [checkRateLimit, recordRequest, setTransactionLoading, setTransactionData, setTransactionError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (txidInput.trim()) {
      handleLookup(txidInput.trim());
    }
  };

  const handleCopy = async (text: string, item: string) => {
    const success = await TransactionService.copyToClipboard(text);
    if (success) {
      setCopiedItem(item);
      // Clear any existing timeout
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      // Set new timeout with cleanup reference
      copyTimeoutRef.current = setTimeout(() => setCopiedItem(null), 2000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'failed':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Clear sensitive data when component unmounts
  useEffect(() => {
    return () => {
      if (txidInput) {
        clearToolDataSecurely();
      }
    };
  }, [txidInput, clearToolDataSecurely]);

  if (transactionLookup.loading.isLoading) {
    return <ToolSkeleton variant="transaction" showProgress progressMessage={transactionLookup.loading.loadingMessage} />;
  }

  return (
    <div className="space-y-4">
      {/* Transaction ID Input */}
      <form onSubmit={handleSubmit} className="space-y-3" role="search" aria-label="Transaction lookup">
        <div>
          <label htmlFor="txid-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Transaction ID
            <BitcoinTooltip term="TRANSACTION_ID">
              <span className="ml-1 cursor-help text-bitcoin" role="button" tabIndex={0} aria-label="Get help about transaction IDs">ⓘ</span>
            </BitcoinTooltip>
          </label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              id="txid-input"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              value={txidInput}
              onChange={(e) => setTxidInput(e.target.value)}
              placeholder="Enter Bitcoin transaction ID (64 characters)"
              className="flex-1 px-3 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-mono focus:ring-2 focus:ring-bitcoin focus:border-bitcoin transition-colors"
              maxLength={64}
              spellCheck={false}
              aria-describedby="txid-help"
              aria-invalid={transactionLookup.error ? 'true' : 'false'}
            />
            <button
              type="submit"
              disabled={!txidInput.trim() || transactionLookup.loading.isLoading}
              className="px-6 py-3 sm:py-2 sm:px-4 bg-bitcoin text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bitcoin-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bitcoin transition-colors min-h-[44px] sm:min-h-[auto]"
              aria-describedby={transactionLookup.loading.isLoading ? 'lookup-status' : undefined}
            >
              {transactionLookup.loading.isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Looking up...
                </span>
              ) : (
                'Lookup'
              )}
            </button>
          </div>
          <div id="txid-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Transaction IDs are 64-character strings containing only letters (a-f) and numbers (0-9)
          </div>
          {txidInput && !TransactionService.validateTxid(txidInput.trim()) && (
            <p 
              className="mt-1 text-sm text-red-600 dark:text-red-400" 
              role="alert"
              aria-live="polite"
            >
              Transaction ID must be exactly 64 hexadecimal characters
            </p>
          )}
        </div>
      </form>

      {/* Loading Status for Screen Readers */}
      {transactionLookup.loading.isLoading && (
        <div 
          id="lookup-status" 
          className="sr-only" 
          aria-live="polite" 
          aria-atomic="true"
        >
          {transactionLookup.loading.loadingMessage}
        </div>
      )}

      {/* Error Display */}
      {transactionLookup.error && (
        <div 
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg"
          role="alert"
          aria-labelledby="error-title"
        >
          <div className="flex items-start">
            <span className="text-red-500 text-xl mr-3 flex-shrink-0" aria-hidden="true">❌</span>
            <div className="flex-1 min-w-0">
              <h4 id="error-title" className="font-medium text-red-800 dark:text-red-200">
                {transactionLookup.error.userFriendlyMessage}
              </h4>
              {transactionLookup.error.suggestions && (
                <ul className="mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
                  {transactionLookup.error.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2 flex-shrink-0">•</span>
                      <span className="flex-1">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              )}
              {transactionLookup.error.retryable && (
                <button
                  onClick={() => handleLookup(txidInput)}
                  className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors min-h-[44px] sm:min-h-[auto]"
                  aria-describedby="retry-help"
                >
                  Try Again
                </button>
              )}
              <div id="retry-help" className="sr-only">
                Retry the transaction lookup with the same transaction ID
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details */}
      {transactionLookup.data && (
        <div 
          className="space-y-4" 
          role="region" 
          aria-labelledby="transaction-results"
          aria-live="polite"
        >
          <div id="transaction-results" className="sr-only">
            Transaction lookup results loaded
          </div>
          
          {/* Status Header */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl flex-shrink-0" aria-hidden="true">
                  {getStatusIcon(transactionLookup.data.status)}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg font-semibold ${getStatusColor(transactionLookup.data.status)}`}>
                    {transactionLookup.data.humanReadable.status}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {transactionLookup.data.humanReadable.timeDescription}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={() => handleCopy(transactionLookup.data!.txid, 'txid')}
                  className="text-sm text-bitcoin hover:text-bitcoin-600 underline transition-colors"
                >
                  {copiedItem === 'txid' ? 'Copied!' : 'Copy TXID'}
                </button>
              </div>
            </div>

            {/* Transaction ID Display */}
            <div className="bg-white dark:bg-gray-700 rounded p-3 border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Transaction ID</span>
                <span className="text-xs font-mono text-gray-600 dark:text-gray-300">
                  {TransactionService.formatTxidForDisplay(transactionLookup.data.txid)}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Confirmations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Confirmations
                    <BitcoinTooltip term="CONFIRMATION">
                      <span className="ml-1 cursor-help text-bitcoin text-sm">ⓘ</span>
                    </BitcoinTooltip>
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {transactionLookup.data.confirmations === 0 
                      ? 'Waiting for first confirmation' 
                      : `${transactionLookup.data.confirmations} confirmations`}
                  </p>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {transactionLookup.data.confirmations}
                </div>
              </div>
            </div>

            {/* Block Info */}
            {transactionLookup.data.blockHeight && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Block Height
                      <BitcoinTooltip term="BLOCK_HEIGHT">
                        <span className="ml-1 cursor-help text-bitcoin text-sm">ⓘ</span>
                      </BitcoinTooltip>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transactionLookup.data.blockTime 
                        ? new Date(transactionLookup.data.blockTime * 1000).toLocaleDateString()
                        : 'Included in blockchain'}
                    </p>
                  </div>
                  <div className="text-lg font-mono text-gray-900 dark:text-gray-100">
                    {transactionLookup.data.blockHeight.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Fee Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Transaction Fee
              <BitcoinTooltip term="FEE_RATE">
                <span className="ml-1 cursor-help text-bitcoin text-sm">ⓘ</span>
              </BitcoinTooltip>
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Fee</span>
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {transactionLookup.data.fee.total.toLocaleString()} sats
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    ${transactionLookup.data.fee.usd.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm text-gray-600 dark:text-gray-400">Fee Rate</span>
                <div className="text-right">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {transactionLookup.data.fee.rate} sat/vB
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {transactionLookup.data.humanReadable.feeDescription.split(' • ')[1] || 'Standard Fee'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estimated Confirmation Time */}
          {transactionLookup.data.estimatedConfirmation && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-blue-500 text-lg">⏰</span>
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Estimated Confirmation
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {transactionLookup.data.estimatedConfirmation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Explorer Links */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              View on Block Explorers
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(TransactionService.getExplorerUrls(transactionLookup.data.txid)).map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 hover:border-bitcoin hover:bg-bitcoin/5 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {name === 'btc' ? 'BTC.com' : name}
                  </span>
                  <span className="text-bitcoin text-sm">→</span>
                </a>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default function TransactionLookupToolWithErrorBoundary(props: TransactionLookupToolProps) {
  return (
    <ToolErrorBoundary toolName="Transaction Lookup">
      <TransactionLookupTool {...props} />
    </ToolErrorBoundary>
  );
}
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useBitcoinToolsStore } from '@/stores/bitcoinToolsStore';
import { TransactionService } from '@/lib/services/transactionService';
import { createToolError } from '@/types/bitcoin-tools';
import { usePrivacyProtection } from '@/hooks/usePrivacyProtection';
import ToolSkeleton from './ToolSkeleton';
import { BitcoinTooltip } from './Tooltip';
import ToolErrorBoundary from './ToolErrorBoundary';
import { EducationalSidebar } from './educational/EducationalSidebar';
import { transactionEducation } from './educational/educationalContent';
import { CheckCircleIcon, ClockIcon, XCircleIcon, QuestionMarkCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
    console.log('handleLookup called with:', cleanTxid);

    // Validate format before making API call
    if (!TransactionService.validateTxid(cleanTxid)) {
      console.error('TXID validation failed:', cleanTxid);
      setTransactionError(createToolError('validation', 'INVALID_TXID'));
      return;
    }

    // Check rate limit
    if (!checkRateLimit('transaction-lookup')) {
      console.warn('Rate limit exceeded');
      setTransactionError(createToolError('rate_limit', 'RATE_LIMIT_EXCEEDED'));
      return;
    }

    setTransactionLoading({
      isLoading: true,
      loadingMessage: 'Looking up transaction on the Bitcoin blockchain...'
    });

    try {
      console.log('Calling TransactionService.getTransactionDetails...');
      recordRequest('transaction-lookup');
      const transactionData = await TransactionService.getTransactionDetails(cleanTxid);
      console.log('Transaction data received:', transactionData);
      setTransactionData(transactionData);
      console.log('Transaction data set in store');
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
        return <CheckCircleIcon className="w-6 h-6 text-bitcoin inline" />;
      case 'pending':
        return <ClockIcon className="w-6 h-6 text-bitcoin inline" />;
      case 'failed':
        return <XCircleIcon className="w-6 h-6 text-bitcoin inline" />;
      default:
        return <QuestionMarkCircleIcon className="w-6 h-6 text-bitcoin inline" />;
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
        return 'text-gray-600 dark:text-gray-600';
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
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8">
      {/* Main Tool Content - 60% width */}
      <div className="lg:flex-[1.5] w-full min-w-0 space-y-6">
        {/* Transaction ID Input */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white dark:text-slate-100 mb-6 flex items-center">
            <MagnifyingGlassIcon className="w-6 h-6 text-bitcoin mr-3" />
            Transaction Lookup
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6" role="search" aria-label="Transaction lookup">
            <div>
              <label htmlFor="txid-input" className="block text-lg font-semibold text-gray-900 dark:text-white dark:text-slate-100 mb-3">
              Transaction ID (Tracking Number)
              <BitcoinTooltip term="TRANSACTION_ID">
                <span className="ml-2 cursor-help text-bitcoin" role="button" tabIndex={0} aria-label="Get help about transaction IDs">ⓘ</span>
              </BitcoinTooltip>
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
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
                className="input-field flex-1 font-mono text-lg"
                maxLength={64}
                spellCheck={false}
                aria-describedby="txid-help"
                aria-invalid={transactionLookup.error ? 'true' : 'false'}
              />
              <button
                type="submit"
                disabled={!txidInput.trim() || transactionLookup.loading.isLoading}
                className="btn-primary px-8 py-4 text-lg min-w-[120px]"
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
            <div id="txid-help" className="mt-3 text-base text-gray-600 dark:text-gray-400 dark:text-slate-400">
              Transaction IDs are 64-character strings containing only letters (a-f) and numbers (0-9)
            </div>
            {txidInput && !TransactionService.validateTxid(txidInput.trim()) && (
              <p 
                className="mt-2 text-base text-red-600 dark:text-red-400 font-medium" 
                role="alert"
                aria-live="polite"
              >
                Transaction ID must be exactly 64 hexadecimal characters
              </p>
            )}
            </div>
          </form>
        </div>

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
          <div className="card mb-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700" role="alert" aria-labelledby="error-title">
            <div className="flex items-start">
              <XCircleIcon className="w-6 h-6 text-bitcoin mr-4 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <h4 id="error-title" className="text-xl font-bold text-red-800 dark:text-red-200">
                  {transactionLookup.error.userFriendlyMessage}
                </h4>
                {transactionLookup.error.suggestions && (
                  <ul className="mt-4 text-base text-red-700 dark:text-red-300 space-y-2">
                    {transactionLookup.error.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-3 flex-shrink-0 text-lg">•</span>
                        <span className="flex-1 font-medium">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {transactionLookup.error.retryable && (
                  <button
                    onClick={() => handleLookup(txidInput)}
                    className="mt-4 px-6 py-3 bg-red-600 text-white text-base font-semibold rounded-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-md hover:shadow-sm"
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
          <div className="space-y-6" role="region" aria-labelledby="transaction-results" aria-live="polite">
            <div id="transaction-results" className="sr-only">
              Transaction lookup results loaded
            </div>

            
            {/* Status Header */}
            <div className="card mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl flex-shrink-0" aria-hidden="true">
                    {getStatusIcon(transactionLookup.data.status)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-2xl font-bold ${getStatusColor(transactionLookup.data.status)}`}>
                      {transactionLookup.data.humanReadable.status}
                    </h3>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                      {transactionLookup.data.humanReadable.timeDescription}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => handleCopy(String(transactionLookup.data!.txid), 'txid')}
                    className="btn-secondary"
                  >
                    {copiedItem === 'txid' ? 'Copied!' : 'Copy TXID'}
                  </button>
                </div>
              </div>

              {/* Transaction ID Display */}
              <div className="bg-gray-50 dark:bg-slate-800 rounded-sm p-5 border border-gray-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-gray-500 dark:text-slate-400">Transaction ID</span>
                  <span className="text-base font-mono text-gray-700 dark:text-slate-300">
                    {TransactionService.formatTxidForDisplay(String(transactionLookup.data.txid))}
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction Verification Status - Clean Design */}
            <div className="card mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-bitcoin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Transaction Verification Status
              </h3>
              <div className={`grid grid-cols-1 ${transactionLookup.data.blockHeight ? 'lg:grid-cols-2' : ''} gap-6`}>
              
                {/* Network Verifications Card */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-sm p-6 transition-all duration-200 flex flex-col">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 flex items-center">
                        Network Verifications
                        <BitcoinTooltip term="CONFIRMATION">
                          <span className="ml-2 cursor-help text-bitcoin opacity-70 hover:opacity-100">ⓘ</span>
                        </BitcoinTooltip>
                      </h4>
                    </div>
                  </div>
                  
                  {/* Confirmation Count */}
                  <div className="text-center py-4 flex-grow">
                    <div className="text-4xl font-bold text-green-700 dark:text-green-300 mb-2">
                      {transactionLookup.data.confirmations}
                    </div>
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">
                      {transactionLookup.data.confirmations === 0 
                        ? 'Waiting for verification' 
                        : transactionLookup.data.confirmations === 1
                        ? 'Verified once'
                        : `Verified ${transactionLookup.data.confirmations} times`}
                    </div>
                  </div>
                  
                  {/* Status Badge - Simplified, no background */}
                  <div className="text-sm mt-auto">
                    <span className={`font-medium ${
                      transactionLookup.data.confirmations === 0 
                        ? 'text-yellow-700 dark:text-yellow-300' 
                        : transactionLookup.data.confirmations === 1
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-green-700 dark:text-green-300'
                    }`}>
                      Security Status: {transactionLookup.data.confirmations === 0 
                        ? 'Pending' 
                        : transactionLookup.data.confirmations === 1
                        ? 'Nearly Complete'
                        : transactionLookup.data.confirmations < 6
                        ? 'Very Secure'
                        : 'Fully Secured'}
                    </span>
                  </div>
                </div>

                
                {/* Block Height Card */}
                {transactionLookup.data.blockHeight && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-sm p-6 transition-all duration-200 flex flex-col">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 flex items-center">
                          Record Number
                          <BitcoinTooltip term="BLOCK_HEIGHT">
                            <span className="ml-2 cursor-help text-bitcoin opacity-70 hover:opacity-100">ⓘ</span>
                          </BitcoinTooltip>
                        </h4>
                      </div>
                    </div>
                    
                    {/* Block Height Display */}
                    <div className="text-center py-4 flex-grow">
                      <div className="text-4xl font-mono font-bold text-blue-700 dark:text-blue-300 mb-2">
                        #{transactionLookup.data.blockHeight.toLocaleString()}
                      </div>
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Block Height
                      </div>
                    </div>
                    
                    {/* Date Badge - Simplified, matching Security Status style */}
                    <div className="text-sm mt-auto">
                      <span className="font-medium text-blue-700 dark:text-blue-300">
                        Recorded Date: {transactionLookup.data.blockTime 
                          ? new Date(transactionLookup.data.blockTime * 1000).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })
                          : 'Permanently recorded'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fee Information */}
            <div className="card mb-6">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Processing Cost
                <BitcoinTooltip term="FEE_RATE">
                  <span className="ml-2 cursor-help text-bitcoin text-lg">ⓘ</span>
                </BitcoinTooltip>
              </h4>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                The sender paid this fee to have their transaction processed by the network
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-slate-800 rounded-sm border border-gray-200 dark:border-slate-600">
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Fee</span>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      ${transactionLookup.data.fee.usd.toFixed(2)} USD
                    </div>
                    <div className="text-base text-gray-600 dark:text-gray-400">
                      {transactionLookup.data.fee.total.toLocaleString()} satoshis
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-slate-800 rounded-sm border border-gray-200 dark:border-slate-600">
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Fee Rate</span>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {transactionLookup.data.fee.rate} sat/vB
                    </div>
                    <div className="text-base text-gray-500 dark:text-slate-400">
                      {transactionLookup.data.humanReadable.feeDescription.split(' • ')[1] || 'Standard Fee'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimated Confirmation Time */}
            {transactionLookup.data.estimatedConfirmation && (
              <div className="card mb-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-4">
                  <ClockIcon className="w-6 h-6 text-bitcoin" />
                  <div>
                    <h4 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      Estimated Confirmation
                    </h4>
                    <p className="text-lg text-blue-700 dark:text-blue-300">
                      {transactionLookup.data.estimatedConfirmation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Explorer Links */}
            <div className="card">
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                View on Block Explorers
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(TransactionService.getExplorerUrls(String(transactionLookup.data.txid))).map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-sm border border-gray-200 dark:border-slate-600 hover:border-bitcoin/50 transition-all duration-200 hover:shadow-sm"
                  >
                    <span className="text-base font-semibold text-gray-900 dark:text-white capitalize">
                      {name === 'btc' ? 'BTC.com' : name}
                    </span>
                    <span className="text-bitcoin text-lg font-bold">→</span>
                  </a>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Educational Sidebar - 40% width */}
      <div className="lg:flex-[1] lg:max-w-md">
        <div className="lg:sticky lg:top-6 space-y-6">
          {/* What This Means Section - Moved from left column */}
          {transactionLookup.data && (
            <div className="card bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700">
              <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-4 flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-bitcoin mr-2" />
                What This Means
              </h3>
              <p className="text-base text-green-800 dark:text-green-200 leading-relaxed">
                {transactionLookup.data.status === 'confirmed' 
                  ? `This transaction is complete! The Bitcoin has been successfully sent and received. It has been verified ${transactionLookup.data.confirmations} time${transactionLookup.data.confirmations !== 1 ? 's' : ''} by the network, making it permanent and secure.`
                  : transactionLookup.data.status === 'pending'
                  ? 'This transaction is still being processed. The Bitcoin has been sent but is waiting to be verified by the network. This usually takes 10-60 minutes.'
                  : 'This transaction status is being determined. Please check back in a few moments.'}
              </p>
            </div>
          )}
          
          {/* Educational content */}
          <EducationalSidebar sections={transactionEducation} />
        </div>
      </div>
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

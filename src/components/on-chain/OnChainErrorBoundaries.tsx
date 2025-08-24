'use client';

import React, { ReactNode } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { OnChainTrackingError, errorHandler } from '@/lib/on-chain/error-handler';

/**
 * Specialized error boundary for on-chain vesting tracker components
 * Extends existing ErrorBoundary patterns with tracker-specific error handling
 */
export function OnChainErrorBoundary({ 
  children,
  onRetry
}: { 
  children: ReactNode;
  onRetry?: () => void;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm p-6">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-grow">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                Tracker Error
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                The vesting tracker encountered an error. This might be due to network connectivity or invalid data.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={onRetry || (() => window.location.reload())}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-200 dark:bg-red-800 dark:hover:bg-red-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        // Log on-chain specific errors with context
        const context = {
          operation: 'component_render',
          step: 'ui_display',
          timestamp: new Date().toISOString()
        };
        
        const processedError = errorHandler.processError(error, context);
        console.error('OnChain component error:', processedError, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Error boundary specifically for transaction fetching operations
 */
export function TransactionFetchErrorBoundary({ 
  children,
  onRetry
}: { 
  children: ReactNode;
  onRetry?: () => void;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-sm p-6">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-grow">
              <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                Transaction Fetch Failed
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Unable to fetch transaction data from the blockchain. This could be due to network issues or API unavailability.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 dark:text-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Retry Fetch
                  </button>
                )}
                <button
                  onClick={() => window.open('https://mempool.space', '_blank')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Check Mempool.space
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        const context = {
          operation: 'transaction_fetch',
          step: 'api_request',
          timestamp: new Date().toISOString()
        };
        
        const processedError = errorHandler.processError(error, context);
        console.error('Transaction fetch error:', processedError, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Error boundary specifically for price fetching operations
 */
export function PriceFetchErrorBoundary({ 
  children,
  onRetry,
  allowPartialData = true
}: { 
  children: ReactNode;
  onRetry?: () => void;
  allowPartialData?: boolean;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-sm p-6">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-grow">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
                Price Data Unavailable
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                {allowPartialData 
                  ? 'Historical price data could not be retrieved, but transaction data is still available without USD values.'
                  : 'Unable to fetch historical price data for your transactions.'
                }
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Retry Price Fetch
                  </button>
                )}
                {allowPartialData && (
                  <button
                    onClick={() => {
                      // This would continue with partial data - implement based on your needs
                      console.log('Continuing with partial data...');
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Continue Without Prices
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        const context = {
          operation: 'price_fetch',
          step: 'historical_data',
          timestamp: new Date().toISOString()
        };
        
        const processedError = errorHandler.processError(error, context);
        console.error('Price fetch error:', processedError, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Error boundary specifically for timeline visualization
 */
export function TimelineErrorBoundary({ 
  children,
  fallbackMessage = "Timeline visualization is currently unavailable"
}: { 
  children: ReactNode;
  fallbackMessage?: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-sm p-8 text-center">
          <svg
            className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            Timeline Unavailable
          </h3>
          <p className="text-sm text-gray-600 dark:text-white/80 mb-4">
            {fallbackMessage}
          </p>
          <p className="text-xs text-gray-500 dark:text-white/60">
            The data table below still shows your complete transaction history.
          </p>
        </div>
      }
      onError={(error, errorInfo) => {
        const context = {
          operation: 'timeline_render',
          step: 'visualization',
          timestamp: new Date().toISOString()
        };
        
        const processedError = errorHandler.processError(error, context);
        console.error('Timeline visualization error:', processedError, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Higher-order component for adding error recovery to any component
 */
export function withErrorRecovery<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundary: React.ComponentType<{ children: ReactNode; onRetry?: () => void }> = OnChainErrorBoundary
) {
  return function ComponentWithErrorRecovery(props: P & { onRetry?: () => void }) {
    const { onRetry, ...componentProps } = props;
    const ErrorBoundaryComponent = errorBoundary;
    
    return (
      <ErrorBoundaryComponent onRetry={onRetry}>
        <Component {...(componentProps as P)} />
      </ErrorBoundaryComponent>
    );
  };
}

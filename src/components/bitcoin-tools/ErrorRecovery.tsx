/**
 * Comprehensive Error Recovery Component for Bitcoin Tools
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Clear error messages with actionable steps
 * - Circuit breaker status monitoring
 * - Fallback to cached data when available
 * - Manual recovery options
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { unifiedBitcoinAPI } from '@/lib/api/unifiedBitcoinAPI';
import type { BitcoinToolError } from '@/types/bitcoin-tools';

interface ErrorRecoveryProps {
  error: BitcoinToolError | Error | null;
  onRetry: () => void;
  onClearError?: () => void;
  toolName: string;
  children?: React.ReactNode;
}

interface RecoveryState {
  isRecovering: boolean;
  retryAttempts: number;
  lastRetryTime: number;
  circuitBreakerStatus: Record<string, string>;
  apiMetrics: any;
}

export function ErrorRecovery({ 
  error, 
  onRetry, 
  onClearError,
  toolName,
  children 
}: ErrorRecoveryProps) {
  const [recoveryState, setRecoveryState] = useState<RecoveryState>({
    isRecovering: false,
    retryAttempts: 0,
    lastRetryTime: 0,
    circuitBreakerStatus: {},
    apiMetrics: {}
  });

  const [showDetails, setShowDetails] = useState(false);
  const [autoRetryEnabled, setAutoRetryEnabled] = useState(true);
  const [nextRetryIn, setNextRetryIn] = useState(0);

  // Update circuit breaker status periodically
  useEffect(() => {
    const updateStatus = () => {
      const status = unifiedBitcoinAPI.getCircuitBreakerStatus();
      const metrics = unifiedBitcoinAPI.getMetrics();
      
      setRecoveryState(prev => ({
        ...prev,
        circuitBreakerStatus: status,
        apiMetrics: metrics
      }));
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-retry logic with exponential backoff
  useEffect(() => {
    if (!error || !autoRetryEnabled || recoveryState.isRecovering) {
      return;
    }

    const timeSinceLastRetry = Date.now() - recoveryState.lastRetryTime;
    const backoffTime = Math.min(1000 * Math.pow(2, recoveryState.retryAttempts), 30000); // Max 30 seconds

    if (timeSinceLastRetry < backoffTime) {
      const timeToWait = backoffTime - timeSinceLastRetry;
      setNextRetryIn(Math.ceil(timeToWait / 1000));

      const countdown = setInterval(() => {
        setNextRetryIn(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            handleRetry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    } else {
      handleRetry();
    }
  }, [error, autoRetryEnabled, recoveryState.retryAttempts, recoveryState.isRecovering, recoveryState.lastRetryTime, handleRetry]);

  const handleRetry = useCallback(async () => {
    setRecoveryState(prev => ({
      ...prev,
      isRecovering: true,
      retryAttempts: prev.retryAttempts + 1,
      lastRetryTime: Date.now()
    }));

    // Check if any circuit breakers need to be reset
    Object.entries(recoveryState.circuitBreakerStatus).forEach(([endpoint, state]) => {
      if (state === 'OPEN' && recoveryState.retryAttempts > 2) {
        // Try to reset circuit breaker after 3 attempts
        unifiedBitcoinAPI.resetCircuitBreaker(endpoint);
      }
    });

    // Small delay to show recovery state
    await new Promise(resolve => setTimeout(resolve, 500));

    onRetry();

    setRecoveryState(prev => ({
      ...prev,
      isRecovering: false
    }));
  }, [onRetry, recoveryState.circuitBreakerStatus, recoveryState.retryAttempts]);

  const handleManualRetry = () => {
    setRecoveryState(prev => ({
      ...prev,
      retryAttempts: 0,
      lastRetryTime: Date.now()
    }));
    handleRetry();
  };

  const handleClearCache = () => {
    unifiedBitcoinAPI.clearCache();
    handleManualRetry();
  };

  const handleResetAll = () => {
    // Reset all circuit breakers
    Object.keys(recoveryState.circuitBreakerStatus).forEach(endpoint => {
      unifiedBitcoinAPI.resetCircuitBreaker(endpoint);
    });
    
    // Clear cache
    unifiedBitcoinAPI.clearCache();
    
    // Reset metrics
    unifiedBitcoinAPI.resetMetrics();
    
    // Reset recovery state
    setRecoveryState({
      isRecovering: false,
      retryAttempts: 0,
      lastRetryTime: 0,
      circuitBreakerStatus: {},
      apiMetrics: {}
    });
    
    // Clear error and retry
    if (onClearError) {
      onClearError();
    }
    onRetry();
  };

  if (!error) {
    return <>{children}</>;
  }

  const errorType = (error as any).type || 'unknown';
  const errorCode = (error as any).code || 'UNKNOWN_ERROR';
  const isNetworkError = errorType === 'network' || errorType === 'timeout';
  const isRateLimited = errorType === 'rate_limit';
  const isCircuitBreakerOpen = error.message?.includes('Circuit breaker is open');

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className={`rounded-lg border ${
          recoveryState.isRecovering 
            ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' 
            : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
        } p-6`}>
          {/* Header */}
          <div className="flex items-start space-x-3">
            {recoveryState.isRecovering ? (
              <ArrowPathIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
            ) : (
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {recoveryState.isRecovering 
                  ? 'Recovering...' 
                  : `${toolName} Error`}
              </h3>
              
              {/* Error Message */}
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                {recoveryState.isRecovering 
                  ? `Attempting to restore service (Attempt ${recoveryState.retryAttempts})...`
                  : error.message}
              </p>

              {/* Circuit Breaker Status */}
              {isCircuitBreakerOpen && (
                <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-md">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Service temporarily unavailable due to multiple failures. 
                    The system will automatically attempt recovery.
                  </p>
                </div>
              )}

              {/* Rate Limit Info */}
              {isRateLimited && (
                <div className="mt-3 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-md">
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    Too many requests. Please wait a moment before trying again.
                  </p>
                </div>
              )}

              {/* Auto-retry Status */}
              {autoRetryEnabled && nextRetryIn > 0 && !recoveryState.isRecovering && (
                <div className="mt-3 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${((30 - nextRetryIn) / 30) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Retrying in {nextRetryIn}s
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={handleManualRetry}
                  disabled={recoveryState.isRecovering}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {recoveryState.isRecovering ? 'Retrying...' : 'Retry Now'}
                </button>

                <button
                  onClick={handleClearCache}
                  disabled={recoveryState.isRecovering}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Clear Cache & Retry
                </button>

                <button
                  onClick={handleResetAll}
                  disabled={recoveryState.isRecovering}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Reset Everything
                </button>

                <button
                  onClick={() => setAutoRetryEnabled(!autoRetryEnabled)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {autoRetryEnabled ? 'Disable' : 'Enable'} Auto-retry
                </button>
              </div>

              {/* Advanced Details */}
              <div className="mt-4">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showDetails ? 'Hide' : 'Show'} Technical Details
                </button>

                {showDetails && (
                  <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <div className="space-y-2 text-xs font-mono">
                      <div>Error Type: {errorType}</div>
                      <div>Error Code: {errorCode}</div>
                      <div>Retry Attempts: {recoveryState.retryAttempts}</div>
                      
                      {/* Circuit Breaker Status */}
                      <div className="mt-2">
                        <div className="font-semibold">Circuit Breakers:</div>
                        {Object.entries(recoveryState.circuitBreakerStatus).map(([endpoint, state]) => (
                          <div key={endpoint} className="ml-2 flex items-center space-x-2">
                            <span>{endpoint}:</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              state === 'CLOSED' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : state === 'OPEN'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {state}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* API Metrics */}
                      <div className="mt-2">
                        <div className="font-semibold">API Metrics:</div>
                        <div className="ml-2">
                          <div>Success Rate: {
                            recoveryState.apiMetrics.totalRequests > 0 
                              ? ((recoveryState.apiMetrics.successfulRequests / recoveryState.apiMetrics.totalRequests) * 100).toFixed(1)
                              : 0
                          }%</div>
                          <div>Cache Hit Rate: {
                            (recoveryState.apiMetrics.cacheHits + recoveryState.apiMetrics.cacheMisses) > 0
                              ? ((recoveryState.apiMetrics.cacheHits / (recoveryState.apiMetrics.cacheHits + recoveryState.apiMetrics.cacheMisses)) * 100).toFixed(1)
                              : 0
                          }%</div>
                          <div>Avg Response Time: {recoveryState.apiMetrics.averageResponseTime || 0}ms</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>Common solutions:</p>
          <ul className="mt-1 list-disc list-inside space-y-1">
            <li>Check your internet connection</li>
            <li>Wait a few moments if rate limited</li>
            <li>Clear cache if data seems outdated</li>
            <li>Reset everything if the problem persists</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
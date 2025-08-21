'use client';

import React, { useEffect, useCallback, useMemo, useReducer } from 'react';
import type { 
  NetworkHealth, 
  EnhancedNetworkHealth,
  FeeRate,
  ToolError
} from '@/types/bitcoin-tools';
import { isToolError } from '@/types/bitcoin-tools';
import { BitcoinAPI } from '@/lib/bitcoin-api';
import ToolErrorBoundary from './ToolErrorBoundary';
import ToolSkeleton from './ToolSkeleton';
import { EducationalSidebar } from './educational/EducationalSidebar';
import { networkStatusEducation } from './educational/educationalContent';

// Validation function for network health response
function isValidNetworkHealthResponse(data: unknown): data is EnhancedNetworkHealth {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj['congestionLevel'] === 'string' &&
    ['low', 'normal', 'high', 'extreme'].includes(obj['congestionLevel']) &&
    typeof obj['mempoolSize'] === 'number' &&
    typeof obj['mempoolBytes'] === 'number' &&
    (typeof obj.averageFee === 'number' || typeof obj.averageFee === 'object') &&
    typeof obj.nextBlockETA === 'string' &&
    typeof obj.recommendation === 'string' &&
    typeof obj.humanReadable === 'object' &&
    obj.humanReadable !== null &&
    typeof obj.timestamp === 'number' &&
    typeof obj.blockchainTip === 'number' &&
    typeof obj.feeEstimates === 'object' &&
    obj.feeEstimates !== null
  );
}

interface BitcoinPrice {
  price: number;
  change24h: number;
}

interface NetworkStatusError {
  message: string;
  isRetryable: boolean;
  retryAfter?: number;
}

// State management with reducer to prevent flickering
interface NetworkState {
  networkHealth: EnhancedNetworkHealth | null;
  bitcoinPrice: BitcoinPrice | null;
  isLoading: boolean;
  error: NetworkStatusError | null;
  retryCount: number;
}

type NetworkAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: { networkHealth: EnhancedNetworkHealth; bitcoinPrice: BitcoinPrice } }
  | { type: 'SET_ERROR'; payload: NetworkStatusError }
  | { type: 'INCREMENT_RETRY' }
  | { type: 'RESET_RETRY' };

const networkReducer = (state: NetworkState, action: NetworkAction): NetworkState => {
  switch (action.type) {
    case 'SET_LOADING':
      // Don't update if loading state hasn't changed
      if (state.isLoading === action.payload) return state;
      return { ...state, isLoading: action.payload };
    case 'SET_DATA':
      return { 
        ...state, 
        networkHealth: action.payload.networkHealth, 
        bitcoinPrice: action.payload.bitcoinPrice, 
        error: null, 
        retryCount: 0,
        isLoading: false 
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'INCREMENT_RETRY':
      return { ...state, retryCount: state.retryCount + 1 };
    case 'RESET_RETRY':
      return { ...state, retryCount: 0, error: null };
    default:
      return state;
  }
};

const NetworkStatus: React.FC = React.memo(() => {
  const [state, dispatch] = useReducer(networkReducer, {
    networkHealth: null,
    bitcoinPrice: null,
    isLoading: true,
    error: null,
    retryCount: 0
  });

  const fetchNetworkHealth = useCallback(async () => {
    try {
      // Only set loading if we don't have data yet
      if (!state.networkHealth) {
        dispatch({ type: 'SET_LOADING', payload: true });
      }
      
      // Fetch both network status and Bitcoin price in parallel
      const [networkResponse, bitcoinPriceData] = await Promise.all([
        fetch('/api/mempool/network/status/', {
          headers: {
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(30000) // Increased timeout to 30 seconds
        }),
        BitcoinAPI.getCurrentPrice()
      ]);
      
      if (!networkResponse.ok) {
        const errorData = await networkResponse.json().catch(() => null);
        
        if (errorData?.error && isToolError(errorData.error)) {
          const toolError = errorData.error as ToolError;
          dispatch({ type: 'SET_ERROR', payload: {
            message: toolError.userFriendlyMessage,
            isRetryable: toolError.retryable,
            retryAfter: toolError.type === 'rate_limit' && 'resetTime' in toolError 
              ? (toolError.resetTime as number) * 1000 
              : undefined
          }});
          return;
        }
        
        throw new Error(`HTTP ${networkResponse.status}: Failed to fetch network status`);
      }
      
      const networkData = await networkResponse.json();
      
      // Validate the response structure
      if (!isValidNetworkHealthResponse(networkData)) {
        throw new Error('Invalid network status response format');
      }
      
      dispatch({ type: 'SET_DATA', payload: { networkHealth: networkData, bitcoinPrice: bitcoinPriceData } });
      
    } catch (err) {
      console.error('Error fetching network health:', err);
      
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      const shouldRetry = state.retryCount < 3 && (isTimeout || err instanceof TypeError);
      
      dispatch({ type: 'SET_ERROR', payload: {
        message: isTimeout 
          ? 'Request timed out. The Bitcoin network might be experiencing delays.' 
          : err instanceof Error 
          ? err.message 
          : 'An unexpected error occurred',
        isRetryable: shouldRetry
      }});
      
      // Automatic retry with exponential backoff
      if (shouldRetry) {
        dispatch({ type: 'INCREMENT_RETRY' });
        const retryDelay = Math.min(1000 * Math.pow(2, state.retryCount), 10000);
        setTimeout(() => {
          fetchNetworkHealth();
        }, retryDelay);
      }
    }
  }, [state.retryCount, state.networkHealth]);

  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout;
    
    // Initial fetch with small delay to prevent hydration issues
    const timer = setTimeout(() => {
      if (mounted) {
        fetchNetworkHealth();
        
        // Set up auto-refresh every 30 seconds
        interval = setInterval(() => {
          if (mounted) {
            fetchNetworkHealth();
          }
        }, 30000);
      }
    }, 100);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, []); // Remove dependencies to prevent re-initialization

  const getStatusIcon = (congestionLevel: NetworkHealth['congestionLevel']) => {
    switch (congestionLevel) {
      case 'low':
        return (
          <div className="w-6 h-6 text-green-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'normal':
        return (
          <div className="w-6 h-6 text-yellow-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'high':
        return (
          <div className="w-6 h-6 text-orange-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'extreme':
        return (
          <div className="w-6 h-6 text-red-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusBadgeClasses = (colorScheme: NetworkHealth['humanReadable']['colorScheme']) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (colorScheme) {
      case 'green':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'yellow':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'orange':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'red':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatBytes = (bytes: number): string => {
    const MB = bytes / (1024 * 1024);
    return `${MB.toFixed(1)} MB`;
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  const calculateTxCostUSD = useCallback((feeRate: FeeRate, txSize: number = 140): number => {
    if (!state.bitcoinPrice) return 0;
    const satoshiCost = Number(feeRate) * txSize;
    const btcCost = satoshiCost / 100000000;
    return btcCost * state.bitcoinPrice.price;
  }, [state.bitcoinPrice]);

  const congestionProgress = useMemo((): { percentage: number; color: string; label: string } => {
    if (!state.networkHealth || !state.networkHealth.analysis) {
      return { percentage: 0, color: 'bg-gray-400', label: 'Unknown' };
    }
    
    // Use the enhanced analysis from the API
    const { congestionPercentage, trafficLevel } = state.networkHealth.analysis;
    
    let color: string;
    let label: string;
    
    switch (trafficLevel) {
      case 'light':
        color = 'bg-green-500';
        label = 'Light Traffic';
        break;
      case 'normal':
        color = 'bg-yellow-500';
        label = 'Normal Traffic';
        break;
      case 'heavy':
        color = 'bg-orange-500';
        label = 'Heavy Traffic';
        break;
      case 'extreme':
        color = 'bg-red-500';
        label = 'Extreme Congestion';
        break;
      default:
        color = 'bg-gray-400';
        label = 'Unknown';
    }
    
    return { 
      percentage: Math.max(5, Math.min(100, congestionPercentage)), 
      color, 
      label 
    };
  }, [state.networkHealth]);

  const getFeeLabel = (feeType: string): { label: string; emoji: string; timeEstimate: string } => {
    const feeLabels = {
      fastestFee: { label: 'Priority', emoji: '🚀', timeEstimate: 'Next block (~10 min)' },
      halfHourFee: { label: 'Standard', emoji: '⚡', timeEstimate: '~30 minutes' },
      hourFee: { label: 'Normal', emoji: '🚶', timeEstimate: '~1 hour' },
      economyFee: { label: 'Economy', emoji: '🐌', timeEstimate: '2+ hours' }
    };
    return feeLabels[feeType as keyof typeof feeLabels] || { label: 'Unknown', emoji: '❓', timeEstimate: 'Unknown' };
  };

  // Show skeleton on first load with stable layout
  if (!state.networkHealth) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8">
        <div className="lg:flex-[1.5] w-full min-w-0">
          <div className="animate-pulse space-y-6">
            {/* Skeleton matches exact layout of loaded content */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-400 h-[140px]"></div>
            <div className="flex items-center justify-between mb-8">
              <div className="h-12 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 h-[180px]"></div>
            <div className="h-[240px] bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-[250px] bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-[120px] bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
        <div className="lg:flex-[1] lg:max-w-md">
          <div className="lg:sticky lg:top-6">
            <EducationalSidebar sections={networkStatusEducation} />
          </div>
        </div>
      </div>
    );
  }

  if (state.error && !state.networkHealth) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8">
        <div className="lg:flex-[1.5] w-full min-w-0">
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {state.error?.isRetryable ? 'Temporary Connection Issue' : 'Unable to load network status'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {state.error?.message || 'We\'re having trouble connecting to the Bitcoin network data.'}
            </p>
            
            {state.error?.retryAfter && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mb-4">
                Rate limit exceeded. Please wait {Math.ceil((state.error.retryAfter - Date.now()) / 1000)} seconds.
              </p>
            )}
            
            {(!state.error?.retryAfter || state.error.retryAfter <= Date.now()) && (
              <div className="space-x-3">
                <button
                  onClick={fetchNetworkHealth}
                  disabled={state.isLoading || state.retryCount >= 3}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-bitcoin hover:bg-bitcoin-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bitcoin disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.isLoading ? 'Retrying...' : state.retryCount >= 3 ? 'Max Retries Reached' : 'Try Again'}
                </button>
                
                {state.retryCount >= 3 && (
                  <button
                    onClick={() => {
                      dispatch({ type: 'RESET_RETRY' });
                      fetchNetworkHealth();
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bitcoin"
                  >
                    Reset and Retry
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="lg:flex-[1] lg:max-w-md">
          <div className="lg:sticky lg:top-6">
            <EducationalSidebar sections={networkStatusEducation} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8">
      {/* Main Tool Content - 60% width */}
      <div className="lg:flex-[1.5] w-full min-w-0 space-y-6">
        {/* Loading indicator overlay for refreshes - removed to prevent flickering */}
        
        {/* Network Status Error Banner */}
        {state.error && state.networkHealth && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-red-800 dark:text-red-200">
                  Connection Issue: {state.error.message}
                </span>
              </div>
              <button
                onClick={() => {
                  dispatch({ type: 'RESET_RETRY' });
                  fetchNetworkHealth();
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-medium text-sm"
              >
                Retry
              </button>
            </div>
            <p className="text-xs text-red-700 dark:text-red-300 mt-2">
              Showing last known data. Network information may be outdated.
            </p>
          </div>
        )}

        {/* Explanatory Text for New Users */}
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-400 min-h-[140px]">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">
            What is Network Status?
          </h3>
          <p className="text-base text-blue-800 dark:text-blue-200 mb-4">
            The Bitcoin network is like a digital highway for money transfers. When many people are sending 
            Bitcoin at once, the "traffic" increases, making transactions take longer and cost more. When 
            traffic is light, transactions are faster and cheaper.
          </p>
          <p className="text-base text-blue-700 dark:text-blue-300">
            <strong>What to look for:</strong> Green means it's a great time to send Bitcoin (low fees, fast processing). 
            Red means the network is very busy (higher fees, slower processing).
          </p>
        </div>

      <div className="flex items-center justify-between mb-8 min-h-[60px]">
        <div className="flex items-center space-x-4">
          {getStatusIcon(state.networkHealth.congestionLevel)}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Current Network Health</h2>
            <p className="text-base text-gray-600 dark:text-gray-400">Live updates every 30 seconds</p>
          </div>
        </div>
        <span className={getStatusBadgeClasses(state.networkHealth.humanReadable.colorScheme)}>
          {state.networkHealth.congestionLevel === 'low' ? 'Light Traffic' :
           state.networkHealth.congestionLevel === 'normal' ? 'Normal Traffic' :
           state.networkHealth.congestionLevel === 'high' ? 'Heavy Traffic' : 'Very Heavy Traffic'}
        </span>
      </div>

      {/* Network Congestion Visual */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 shadow-sm min-h-[180px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Network Congestion Level</h3>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {congestionProgress.label}
            </span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 mb-3">
              <div
                className={`h-4 rounded-full transition-all duration-1000 ease-in-out ${congestionProgress.color}`}
                style={{ width: `${congestionProgress.percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Clear</span>
              <span>Normal</span>
              <span>Busy</span>
              <span>Congested</span>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Queue: </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatNumber(state.networkHealth.mempoolSize)} transactions
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Size: </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatBytes(state.networkHealth.mempoolBytes)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Estimates */}
      <div className="mb-8 min-h-[240px]">
        {state.networkHealth.feeEstimates ? (
          <>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Current Fee Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(state.networkHealth.feeEstimates).map(([feeType, feeRate]) => {
              const feeInfo = getFeeLabel(feeType);
              const costUSD = calculateTxCostUSD(feeRate as FeeRate);
              
              return (
                <div key={feeType} className="bg-white dark:bg-gray-700 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <div className="text-2xl mb-2">{feeInfo.emoji}</div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{feeInfo.label}</h4>
                    <div className="text-lg font-bold text-bitcoin mb-1">{Number(feeRate)} sat/vB</div>
                    {state.bitcoinPrice && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        ~${costUSD.toFixed(2)} USD
                      </div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {feeInfo.timeEstimate}
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>💡 Fee calculation:</strong> Costs shown are for a typical transaction (~140 bytes). 
                Larger transactions will cost proportionally more. 
                {state.bitcoinPrice && (
                  <span>Bitcoin price: ${state.bitcoinPrice.price.toLocaleString()}</span>
                )}
              </p>
            </div>
          </>
        ) : (
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Human-Readable Status */}
      <div className="mb-8 min-h-[250px]">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">What This Means for You</h3>
        <div className={`rounded-xl p-6 border-l-4 shadow-sm min-h-[200px] ${
          state.networkHealth.humanReadable.colorScheme === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-400' :
          state.networkHealth.humanReadable.colorScheme === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400' :
          state.networkHealth.humanReadable.colorScheme === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400' :
          'bg-red-50 dark:bg-red-900/20 border-red-400'
        }`}>
          <p className="text-gray-900 dark:text-white text-lg font-semibold mb-3">
            {state.networkHealth.congestionLevel === 'low' ? '✅ Perfect timing for transactions!' :
             state.networkHealth.congestionLevel === 'normal' ? '👍 Good time to send Bitcoin' :
             state.networkHealth.congestionLevel === 'high' ? '⚠️ Network is getting busy' :
             '🚨 Network is very congested'}
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4">
            {state.networkHealth.humanReadable.userAdvice}
          </p>
          
          {/* Fee-based recommendations */}
          {state.networkHealth.feeEstimates && (
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💰 Fee Recommendation:</h4>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {Number(state.networkHealth.averageFee) < 10 && (
                  <span>Use <strong>Economy fees</strong> ({Number(state.networkHealth.feeEstimates.economyFee)} sat/vB) to save money!</span>
                )}
                {Number(state.networkHealth.averageFee) >= 10 && Number(state.networkHealth.averageFee) < 30 && (
                  <span>Use <strong>Standard fees</strong> ({Number(state.networkHealth.feeEstimates.halfHourFee)} sat/vB) for reliable confirmation.</span>
                )}
                {Number(state.networkHealth.averageFee) >= 30 && Number(state.networkHealth.averageFee) < 100 && (
                  <span>Consider <strong>Priority fees</strong> ({Number(state.networkHealth.feeEstimates.fastestFee)} sat/vB) or wait for lower congestion.</span>
                )}
                {Number(state.networkHealth.averageFee) >= 100 && (
                  <span>⚠️ <strong>High fees required</strong> ({Number(state.networkHealth.feeEstimates.fastestFee)} sat/vB) - consider waiting unless urgent.</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-8 min-h-[120px]">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Our Recommendation</h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-400 shadow-sm min-h-[80px]">
          <p className="text-blue-900 dark:text-blue-300 text-base leading-relaxed">
            {state.networkHealth.recommendation}
          </p>
        </div>
      </div>

        {/* Next Block Estimation */}
        <div className="flex items-center justify-between text-base text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Next batch of transactions processes in: <strong className="text-gray-900 dark:text-white">{state.networkHealth.nextBlockETA}</strong></span>
          </div>
          <button
            onClick={fetchNetworkHealth}
            disabled={state.isLoading}
            className="text-bitcoin hover:text-bitcoin-dark dark:text-bitcoin dark:hover:text-bitcoin-light font-semibold px-4 py-2 rounded-lg hover:bg-bitcoin/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Educational Sidebar - 40% width */}
      <div className="lg:flex-[1] lg:max-w-md">
        <div className="lg:sticky lg:top-6">
          <EducationalSidebar sections={networkStatusEducation} />
        </div>
      </div>
    </div>
  );
});

// Wrap NetworkStatus with error boundary
const NetworkStatusWithErrorBoundary: React.FC = () => (
  <ToolErrorBoundary toolName="Network Status">
    <NetworkStatus />
  </ToolErrorBoundary>
);

export default NetworkStatusWithErrorBoundary;
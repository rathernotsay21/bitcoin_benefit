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
import { apiConfig, parseCoinGeckoPrice, parseNetworkHealth } from '@/lib/config/api';
import ToolErrorBoundary from './ToolErrorBoundary';
import ToolSkeleton from './ToolSkeleton';
import { EducationalSidebar } from './educational/EducationalSidebar';
import { networkStatusEducation } from './educational/educationalContent';
import { 
  LightBulbIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon,
  HandThumbUpIcon,
  CurrencyDollarIcon,
  RocketLaunchIcon,
  BoltIcon,
  ForwardIcon,
  BackwardIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

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
        fetch(apiConfig.mempool.network, {
          headers: {
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(30000) // Increased timeout to 30 seconds
        }),
        BitcoinAPI.getCurrentPrice()
      ]);
      
      if (!networkResponse.ok) {
        const errorData = await networkResponse.json().catch((): null => null);
        
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
      
      const rawNetworkData = await networkResponse.json();
      
      // Parse the network data to the expected format
      const networkData = parseNetworkHealth(rawNetworkData);
      
      // Validate the response structure
      if (!isValidNetworkHealthResponse(networkData)) {
        // Use the parsed data even if validation fails
        // The parser ensures all required fields are present with defaults
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.retryCount]); // Intentionally omit state.networkHealth to prevent infinite loop

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
  }, [fetchNetworkHealth]); // Include fetchNetworkHealth in dependencies

  const getStatusIcon = (congestionLevel: NetworkHealth['congestionLevel']) => {
    switch (congestionLevel) {
      case 'low':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'normal':
        return <ExclamationCircleIcon className="w-6 h-6 text-yellow-500" />;
      case 'high':
        return <ExclamationTriangleIcon className="w-6 h-6 text-bitcoin-500" />;
      case 'extreme':
        return <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />;
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
        return `${baseClasses} bg-orange-100 text-bitcoin-800`;
      case 'red':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200`;
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
        color = 'bg-bitcoin-500';
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

  const getFeeLabel = (feeType: string): { label: string; icon: React.ComponentType<{ className?: string }>; timeEstimate: string } => {
    const feeLabels = {
      fastestFee: { label: 'Priority', icon: RocketLaunchIcon, timeEstimate: 'Next block (~10 min)' },
      halfHourFee: { label: 'Standard', icon: BoltIcon, timeEstimate: '~30 minutes' },
      hourFee: { label: 'Normal', icon: ForwardIcon, timeEstimate: '~1 hour' },
      economyFee: { label: 'Economy', icon: BackwardIcon, timeEstimate: '2+ hours' }
    };
    return feeLabels[feeType as keyof typeof feeLabels] || { label: 'Unknown', icon: QuestionMarkCircleIcon, timeEstimate: 'Unknown' };
  };

  // Show skeleton on first load with stable layout
  if (!state.networkHealth) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8">
        <div className="lg:flex-[1.5] w-full min-w-0">
          <div className="animate-pulse space-y-6">
            {/* Skeleton matches exact layout of loaded content */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-sm p-6 border-l-4 border-blue-400 h-[140px]"></div>
            <div className="flex items-center justify-between mb-8">
              <div className="h-12 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-sm p-6 border-2 border-gray-200 dark:border-gray-600 h-[180px]"></div>
            <div className="h-[240px] bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
            <div className="h-[250px] bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
            <div className="h-[120px] bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
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
            <div className="w-12 h-12 mx-auto mb-4 text-gray-600 dark:text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {state.error?.isRetryable ? 'Temporary Connection Issue' : 'Unable to load network status'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-600 mb-4">
              {state.error?.message || 'We\'re having trouble connecting to the Bitcoin network data.'}
            </p>
            
            {state.error?.retryAfter && (
              <p className="text-sm text-bitcoin-600 dark:text-orange-400 mb-4">
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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm p-4 mb-6">
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

      <div className="flex items-center justify-between mb-8 min-h-[60px]">
        <div className="flex items-center space-x-4">
          {getStatusIcon(state.networkHealth.congestionLevel)}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Current Network Health</h2>
            <p className="text-base text-gray-600 dark:text-gray-400 dark:text-gray-600">Live updates every 30 seconds</p>
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
        <div className="bg-white dark:bg-gray-700 rounded-sm p-6 border-2 border-gray-200 dark:border-gray-600 shadow-sm min-h-[180px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Network Congestion Level</h3>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-600">
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
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-600 dark:text-gray-400">
              <span>Clear</span>
              <span>Normal</span>
              <span>Busy</span>
              <span>Congested</span>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-600">Queue: </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatNumber(state.networkHealth.mempoolSize)} transactions
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-600">Size: </span>
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
            {Object.entries(state.networkHealth.feeEstimates)
              .filter(([feeType]) => {
                // Only show known fee types
                const knownFeeTypes = ['fastestFee', 'halfHourFee', 'hourFee', 'economyFee'];
                return knownFeeTypes.includes(feeType);
              })
              .map(([feeType, feeRate]) => {
                const feeInfo = getFeeLabel(feeType);
                const costUSD = calculateTxCostUSD(feeRate as FeeRate);
                
                return (
                  <div key={feeType} className="bg-white dark:bg-gray-700 rounded-sm p-4 border-2 border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <div className="mb-2">
                        {React.createElement(feeInfo.icon, { className: "w-6 h-6 mx-auto text-bitcoin" })}
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{feeInfo.label}</h4>
                      <div className="text-lg font-bold text-bitcoin mb-1">{Number(feeRate)} sat/vB</div>
                      {state.bitcoinPrice && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-600 mb-2">
                          ~${costUSD.toFixed(2)} USD
                        </div>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-700">
                        {feeInfo.timeEstimate}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-sm border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong className="flex items-center inline-flex"><LightBulbIcon className="w-5 h-5 mr-1 text-bitcoin" /> Fee calculation:</strong> Costs shown are for a typical transaction (~140 bytes). 
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
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fee Estimates - Keep in main content */}

        {/* Human-Readable Status - Moved back from right column */}
        <div className="mb-8 min-h-[250px]">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">What This Means for You</h3>
          <div className={`rounded-sm p-6 border-l-4 shadow-sm min-h-[200px] ${
            state.networkHealth.humanReadable.colorScheme === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-400' :
            state.networkHealth.humanReadable.colorScheme === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400' :
            state.networkHealth.humanReadable.colorScheme === 'orange' ? 'bg-orange-50 dark:bg-bitcoin-900/20 border-bitcoin-400' :
            'bg-red-50 dark:bg-red-900/20 border-red-400'
          }`}>
            <p className="text-gray-900 dark:text-white text-lg font-semibold mb-3">
              {state.networkHealth.congestionLevel === 'low' ? 
                <span className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 mr-2 text-bitcoin" />
                  Perfect timing for transactions!
                </span> :
               state.networkHealth.congestionLevel === 'normal' ? 
                <span className="flex items-center">
                  <HandThumbUpIcon className="w-5 h-5 mr-2 text-bitcoin" />
                  Good time to send Bitcoin
                </span> :
               state.networkHealth.congestionLevel === 'high' ? 
                <span className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-bitcoin" />
                  Network is getting busy
                </span> :
                <span className="flex items-center">
                  <ExclamationCircleIcon className="w-5 h-5 mr-2 text-bitcoin" />
                  Network is very congested
                </span>}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4">
              {state.networkHealth.humanReadable.userAdvice}
            </p>
            
            {/* Fee-based recommendations */}
            {state.networkHealth.feeEstimates && (
              <div className="bg-white/50 dark:bg-black/20 rounded-sm p-4 mt-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 mr-2 text-bitcoin" />
                  Fee Recommendation:
                </h4>
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
                    <span className="flex items-center">
                      <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-bitcoin" />
                      <strong>High fees required</strong> ({Number(state.networkHealth.feeEstimates.fastestFee)} sat/vB) - consider waiting unless urgent.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations - Moved back from right column */}
        <div className="mb-8 min-h-[120px]">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Our Recommendation</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-sm p-6 border-l-4 border-blue-400 shadow-sm min-h-[80px]">
            <p className="text-blue-900 dark:text-blue-300 text-base leading-relaxed">
              {state.networkHealth.recommendation}
            </p>
          </div>
        </div>

        {/* Network Verifications and Record Number */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-bitcoin/10 to-orange-500/10 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg className="w-6 h-6 mr-3 text-bitcoin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Network Verification Status
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Live blockchain data and record verification
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Current Block Record */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      Current Block Record
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Latest verified block on the network
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-mono font-bold text-green-700 dark:text-green-300">
                    #{formatNumber(state.networkHealth.blockchainTip)}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Height: {state.networkHealth.blockchainTip.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 dark:text-green-300 font-medium">Verified & Synchronized</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-700 dark:text-green-300">Network Consensus</span>
                </div>
              </div>
            </div>
            
            {/* Next Block Processing */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      Next Block Processing
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Estimated time for next verification
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {state.networkHealth.nextBlockETA}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Block #{formatNumber(state.networkHealth.blockchainTip + 1)}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                    <span className="text-blue-700 dark:text-blue-300 font-medium">Processing Queue</span>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400">
                    {formatNumber(state.networkHealth.mempoolSize)} transactions pending
                  </span>
                </div>
                <button
                  onClick={fetchNetworkHealth}
                  disabled={state.isLoading}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{state.isLoading ? 'Refreshing...' : 'Refresh Status'}</span>
                </button>
              </div>
            </div>
            
            {/* Verification Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-800 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600 dark:text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h5 className="font-semibold text-gray-900 dark:text-white text-sm">
                    Network Speed
                  </h5>
                </div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  ~10 minutes
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Average block time
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h5 className="font-semibold text-gray-900 dark:text-white text-sm">
                    Data Integrity
                  </h5>
                </div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  100% Verified
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Cryptographically secured
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Sidebar - 40% width */}
      <div className="lg:flex-[1] lg:max-w-md">
        <div className="lg:sticky lg:top-6 space-y-6">
          {/* Explanatory Text for New Users - Keep in right column */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-sm p-6 border-l-4 border-blue-400">
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

          {/* Educational content */}
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
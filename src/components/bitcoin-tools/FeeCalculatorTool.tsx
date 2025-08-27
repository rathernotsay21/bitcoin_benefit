'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useBitcoinToolsStore } from '@/stores/bitcoinToolsStore';
import { FeeRecommendation, createToolError, FeeCostBreakdown, FeeSavings, FeeLevel, FeeEmoji, FeeRate, SatoshiAmount, BTCAmount, USDAmount } from '@/types/bitcoin-tools';
import { secureApiClient } from '@/lib/secure-fetch-wrapper';
import { toToolError } from '@/lib/type-safe-error-handler';
import { z } from 'zod';
import ToolSkeleton from './ToolSkeleton';
import { BitcoinTooltip } from './Tooltip';
import ToolErrorBoundary from './ToolErrorBoundary';
import { EducationalSidebar } from './educational/EducationalSidebar';
import { feeEducation } from './educational/educationalContent';

// Enhanced Zod schema for fee API response validation with strict types
const FeeApiResponseSchema = z.object({
  recommendations: z.array(z.object({
    level: z.enum(['economy', 'balanced', 'priority']),
    emoji: z.string().min(1),
    label: z.string().min(1),
    timeEstimate: z.string().min(1),
    satPerVByte: z.number().positive(),
    description: z.string().min(1),
    savings: z.object({
      percent: z.number().min(0).max(100),
      comparedTo: z.string().min(1)
    }).optional()
  })).min(1),
  networkConditions: z.object({
    congestionLevel: z.enum(['low', 'normal', 'high', 'extreme']),
    mempoolSize: z.number().int().nonnegative(),
    recommendation: z.string().min(1)
  }),
  lastUpdated: z.string().datetime(),
  txSize: z.number().int().positive().min(140).max(100000),
  warning: z.string().optional(),
  error: z.string().optional()
});

type FeeApiResponse = z.infer<typeof FeeApiResponseSchema>;

// Transform API response to our internal FeeRecommendation format
const transformToFeeRecommendations = (apiData: FeeApiResponse, btcPrice: number): FeeRecommendation[] => {
  return apiData.recommendations.map((rec) => {
    const totalSats = rec.satPerVByte * apiData.txSize;
    const totalBtc = totalSats / 100000000;
    const totalUsd = totalBtc * btcPrice;
    
    const totalCost: FeeCostBreakdown = {
      sats: totalSats as SatoshiAmount,
      btc: totalBtc as BTCAmount,
      usd: totalUsd as USDAmount
    };
    
    const savings: FeeSavings = rec.savings ? {
      percent: rec.savings.percent,
      usd: 0 as USDAmount, // Calculate based on comparison
      comparedTo: rec.savings.comparedTo as FeeLevel
    } : {
      percent: 0,
      usd: 0 as USDAmount
    };
    
    return {
      level: rec.level,
      emoji: rec.emoji as FeeEmoji,
      label: rec.label,
      timeEstimate: rec.timeEstimate,
      satPerVByte: rec.satPerVByte as FeeRate,
      totalCost,
      savings,
      description: rec.description,
      priority: rec.level === 'priority' ? 3 : rec.level === 'balanced' ? 2 : 1,
      reliability: rec.level === 'priority' ? 95 : rec.level === 'balanced' ? 85 : 70
    } as FeeRecommendation;
  });
};

const TRANSACTION_PRESETS = [
  { label: 'Simple Send', size: 150, description: '1 input, 2 outputs (typical wallet transfer)' },
  { label: 'Standard', size: 250, description: 'Average transaction size' },
  { label: 'Complex', size: 400, description: 'Multiple inputs/outputs' },
  { label: 'Multi-sig', size: 300, description: 'Multi-signature transaction' }
];

export function FeeCalculatorTool() {
  const feeCalculator = useBitcoinToolsStore((state) => state.tools.feeCalculator);
  const setFeeCalculatorLoading = useBitcoinToolsStore((state) => state.setFeeCalculatorLoading);
  const setFeeCalculatorData = useBitcoinToolsStore((state) => state.setFeeCalculatorData);
  const setFeeCalculatorError = useBitcoinToolsStore((state) => state.setFeeCalculatorError);
  const setFeeCalculatorTxSize = useBitcoinToolsStore((state) => state.setFeeCalculatorTxSize);
  const setFeeCalculatorSelectedTier = useBitcoinToolsStore((state) => state.setFeeCalculatorSelectedTier);
  
  // Rate limiting hooks wrapped in useCallback to prevent recreation
  const checkRateLimit = useCallback(() => true, []); // Placeholder - always allow for now
  const recordRequest = useCallback(() => {}, []); // Placeholder - no-op for now
  
  const [customSize, setCustomSize] = useState('');
  const [networkData, setNetworkData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchFeeRecommendations = useCallback(async (txSize: number) => {
    // Validate transaction size before making request
    if (!txSize || txSize < 140 || txSize > 100000) {
      setFeeCalculatorError(createToolError('validation', 'INVALID_TX_SIZE', undefined, {
        providedSize: txSize,
        validRange: '140-100,000 vBytes'
      }));
      return;
    }

    // Move rate limit check inline
    if (!checkRateLimit()) {
      setFeeCalculatorError(createToolError('rate_limit', 'RATE_LIMIT_EXCEEDED'));
      return;
    }

    setFeeCalculatorLoading({
      isLoading: true,
      loadingMessage: 'Fetching current Bitcoin network fees...',
      startTime: Date.now() as any,
      estimatedCompletion: (Date.now() + 10000) as any
    });

    recordRequest();
    
    try {
      const result = await secureApiClient.get(
        `/api/mempool/fees/recommended?txSize=${txSize}`,
        FeeApiResponseSchema,
        {
          timeout: 20000, // Increased timeout for SSL recovery
          retries: 3, // Increased retries with exponential backoff
          retryDelay: 2000, // Start with 2 second delay
          retryCondition: (error, attempt) => {
            // Custom retry logic for fee calculator
            if ('type' in error) {
              const toolError = error as any;
              // Always retry network and SSL errors
              if (toolError.type === 'network' || toolError.type === 'fetch_error') {
                return attempt <= 3;
              }
              // Retry timeouts with longer delays
              if (toolError.type === 'timeout') {
                return attempt <= 2;
              }
            }
            return false;
          }
        }
      );
      
      if (result.success) {
        const validatedData = result.data;
        
        const transformedRecommendations = transformToFeeRecommendations(validatedData, 30000); // Default fallback BTC price
        setFeeCalculatorData(transformedRecommendations);
        setNetworkData(validatedData.networkConditions);
        setLastUpdated(validatedData.lastUpdated);

        // Handle warnings from API
        if (validatedData.warning) {
          console.warn('Fee Calculator Warning:', validatedData.warning);
          // Could optionally show a toast notification here
        }
        
        // Handle fallback data notification
        if (validatedData.error) {
          console.info('Fee Calculator using fallback data:', validatedData.error);
        }
        
        // Log successful recovery if it took multiple attempts
        if (result.attempts > 1) {
          console.info(`Fee data retrieved successfully after ${result.attempts} attempts`);
        }
      } else {
        console.error('Fee calculator API error:', 'error' in result ? result.error.message : 'Unknown error');
        setFeeCalculatorError('error' in result ? result.error : createToolError('unknown', 'UNKNOWN_ERROR'));
      }
    } catch (error) {
      console.error('Unexpected fee calculator error:', error);
      
      // This should rarely happen with the secure fetch wrapper,
      // but handle it gracefully just in case
      const toolError = toToolError(error, 'unknown', {
        endpoint: `/api/mempool/fees/recommended?txSize=${txSize}`,
        operation: 'fetchFeeRecommendations',
        txSize,
        timestamp: new Date().toISOString(),
        note: 'Unexpected error bypass - should investigate'
      });
      
      setFeeCalculatorError(toolError);
    }
  }, [checkRateLimit, recordRequest, setFeeCalculatorLoading, setFeeCalculatorData, setFeeCalculatorError]);

  // Initial load
  useEffect(() => {
    if (!feeCalculator.data) {
      fetchFeeRecommendations(feeCalculator.txSize);
    }
  }, [feeCalculator.data, feeCalculator.txSize, fetchFeeRecommendations]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!autoRefresh) return undefined;
    
    const interval = setInterval(() => {
      if (!feeCalculator.loading.isLoading) {
        fetchFeeRecommendations(feeCalculator.txSize);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [autoRefresh, feeCalculator.data, feeCalculator.loading.isLoading, fetchFeeRecommendations, feeCalculator.txSize]);

  const handleSizeChange = (size: number) => {
    setFeeCalculatorTxSize(size);
    setFeeCalculatorSelectedTier(null);
    fetchFeeRecommendations(size);
  };

  const handleCustomSizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const size = parseInt(customSize);
    if (size && size >= 140 && size <= 100000) {
      handleSizeChange(size);
      setCustomSize('');
      
      // Custom size applied successfully
    } else {
      // Could show an error message
      setFeeCalculatorError(createToolError('validation', 'INVALID_TX_SIZE', undefined, {
        providedSize: size,
        validRange: '140-100,000 vBytes'
      }));
    }
  };

  const formatBTC = (sats: number): string => {
    return (sats / 100000000).toFixed(8);
  };

  const [btcPrice, setBtcPrice] = useState<number | null>(null);

  // Fetch BTC price on mount
  useEffect(() => {
    const fetchBtcPrice = async (): Promise<void> => {
      try {
        const response = await fetch('/api/bitcoin/price', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.price) {
            setBtcPrice(data.price);
          }
        }
      } catch (error) {
        console.error('Failed to fetch BTC price:', error);
        // Use fallback price from transformToFeeRecommendations if fetch fails
      }
    };

    fetchBtcPrice();
    
    // Refresh price every 5 minutes
    const interval = setInterval(fetchBtcPrice, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Re-transform recommendations when BTC price updates
  useEffect(() => {
    if (btcPrice && feeCalculator.data && networkData && lastUpdated) {
      const apiData: FeeApiResponse = {
        recommendations: feeCalculator.data.map((rec: FeeRecommendation) => ({
          level: rec.level as 'economy' | 'balanced' | 'priority',
          emoji: rec.emoji,
          label: rec.label,
          timeEstimate: rec.timeEstimate,
          satPerVByte: rec.satPerVByte,
          description: rec.description,
          savings: rec.savings.percent > 0 ? {
            percent: rec.savings.percent,
            comparedTo: rec.savings.comparedTo
          } : undefined
        })),
        networkConditions: networkData,
        lastUpdated: lastUpdated,
        txSize: feeCalculator.txSize
      };
      const updatedRecommendations = transformToFeeRecommendations(apiData, btcPrice);
      setFeeCalculatorData(updatedRecommendations);
    }
  }, [btcPrice, feeCalculator.data, feeCalculator.txSize, lastUpdated, networkData, setFeeCalculatorData]);

  const formatUSD = (satoshis: number): string => {
    const actualBtcPrice = btcPrice || 30000; // Fallback price
    const btcAmount = satoshis / 100000000;
    return (btcAmount * actualBtcPrice).toFixed(2);
  };

  const getTierColor = (level: string, isSelected: boolean) => {
    if (isSelected) {
      return 'border-bitcoin bg-bitcoin/10';
    }
    return 'border-gray-200 dark:border-slate-600 hover:border-bitcoin/50';
  };

  const getNetworkStatusColor = () => {
    if (!networkData) return 'text-gray-600';
    switch (networkData.congestionLevel) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'normal': return 'text-blue-600 dark:text-blue-400';
      case 'high': return 'text-bitcoin-600 dark:text-orange-400';
      case 'extreme': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600';
    }
  };

  // Loading state
  if (feeCalculator.loading.isLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8">
        <div className="lg:flex-[1.5] w-full min-w-0">
          <ToolSkeleton variant="default" />
        </div>
      </div>
    );
  }

  // Error state
  if (feeCalculator.error) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8">
        <div className="lg:flex-[1.5] w-full min-w-0">
          <div className="card border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-start space-x-3">
              <span className="text-4xl">⚠️</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
                  Fee Calculator Error
                </h3>
                <p className="text-red-600 dark:text-red-400 text-lg mb-4">
                  {feeCalculator.error.message}
                </p>
                
                {feeCalculator.error.type === 'rate_limit' && (
                  <p className="text-sm text-red-500 dark:text-red-400 mb-4">
                    Too many requests. Please wait a moment before trying again.
                  </p>
                )}
                
                {feeCalculator.error.type === 'validation' && (
                  <p className="text-sm text-red-500 dark:text-red-400 mb-4">
                    Please check your input and try again.
                  </p>
                )}
                
                {(feeCalculator.error.type === 'network' || feeCalculator.error.type === 'fetch_error') && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setFeeCalculatorError(null);
                        fetchFeeRecommendations(feeCalculator.txSize);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => setFeeCalculatorError(null)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
                
                <details className="mt-4">
                  <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer font-medium">
                    Technical Details
                  </summary>
                  <pre className="mt-2 text-xs text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/40 p-3 rounded border overflow-auto">
                    {JSON.stringify({
                      type: feeCalculator.error.type,
                      message: feeCalculator.error.message,
                      context: feeCalculator.error.context
                    }, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 p-4 sm:p-6 lg:p-8">
      {/* Main Tool Content - 60% width */}
      <div className="lg:flex-[1.5] w-full min-w-0 space-y-6">
        {/* Network Status Banner */}
        {networkData && (
          <div className={`card mb-6 border-l-4 ${
            networkData.congestionLevel === 'low' ? 'bg-green-50 border-green-400 dark:bg-green-900/20' :
            networkData.congestionLevel === 'normal' ? 'bg-blue-50 border-blue-400 dark:bg-blue-900/20' :
            networkData.congestionLevel === 'high' ? 'bg-bitcoin-50 border-bitcoin-400 dark:bg-bitcoin-900/20' :
            'bg-red-50 border-red-400 dark:bg-red-900/20'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xl font-bold ${getNetworkStatusColor()}`}>
                  Network Traffic: {networkData.congestionLevel === 'low' ? 'Light' : 
                                   networkData.congestionLevel === 'normal' ? 'Moderate' :
                                   networkData.congestionLevel === 'high' ? 'Busy' : 'Very Busy'}
                </p>
                <p className="text-lg text-gray-600 dark:text-slate-700 mt-2">
                  {networkData.congestionLevel === 'low' ? 'Great time to send - fees are low!' :
                   networkData.congestionLevel === 'normal' ? 'Normal fees apply for transactions' :
                   networkData.congestionLevel === 'high' ? 'Network is busy - fees are higher than usual' :
                   'Network very congested - consider waiting if not urgent'}
                </p>
              </div>
              <div className="text-sm text-gray-700">
                {networkData.mempoolSize > 0 && `${networkData.mempoolSize.toLocaleString()} transactions waiting`}
              </div>
            </div>
          </div>
        )}

        {/* Transaction Size Selection */}
        <div className="card mb-6" id="fee-calculator-section">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6 flex items-center">
            <span className="text-bitcoin text-3xl mr-3">💰</span>
            Fee Calculator
          </h2>
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-xl font-bold text-gray-900 dark:text-slate-100">
                What Type of Transaction?
                <BitcoinTooltip term="VBYTE">
                  <span className="ml-2 cursor-help text-bitcoin">ⓘ</span>
                </BitcoinTooltip>
              </label>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`text-xs px-2 py-1 rounded ${
                  autoRefresh 
                    ? 'bg-bitcoin text-white' 
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-slate-400 mb-6">
              Select your transaction type to see current fee recommendations
            </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TRANSACTION_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleSizeChange(preset.size)}
                className={`p-4 text-left rounded-sm border-2 transition-all duration-300 shadow-md hover:shadow-sm hover:scale-[1.02] ${
                  feeCalculator.txSize === preset.size
                    ? 'border-bitcoin bg-bitcoin/10 shadow-sm transform scale-105'
                    : 'border-gray-200 dark:border-slate-600 hover:border-bitcoin/50'
                }`}
              >
                <div className="font-bold text-base text-gray-900 dark:text-slate-100">
                  {preset.label === 'Simple Send' ? 'Basic Transfer' :
                   preset.label === 'Multi-sig' ? 'Shared Wallet' : preset.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-slate-400 mt-2">
                  {preset.label === 'Simple Send' ? 'Sending to one person' :
                   preset.label === 'Standard' ? 'Most common transaction type' :
                   preset.label === 'Complex' ? 'Sending to multiple people' :
                   'Requires multiple approvals'}
                </div>
              </button>
            ))}
          </div>

          {/* Custom Size Input - Hidden by default for simplicity */}
          <details className="mt-4">
            <summary className="text-sm text-gray-500 dark:text-gray-600 cursor-pointer hover:text-bitcoin font-medium">
              Advanced: Set custom transaction size
            </summary>
            <form onSubmit={handleCustomSizeSubmit} className="flex gap-3 mt-3">
              <input
                type="number"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                placeholder={`Custom size (current: ${feeCalculator.txSize} vBytes)`}
                min="1"
                max="10000"
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-base"
              />
              <button
                type="submit"
                disabled={!customSize || parseInt(customSize) <= 0}
                className="px-6 py-3 bg-bitcoin text-white rounded-sm text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bitcoin-600 transition-colors"
              >
                Set
              </button>
            </form>
          </details>
          </div>
        </div>

        {/* Fee Recommendations */}
        {feeCalculator.data && (
          <div className="card mb-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 flex items-center">
                <span className="text-bitcoin text-3xl mr-3">⚡</span>
                Choose Your Speed & Cost
              </h3>
              <p className="text-lg text-gray-600 dark:text-slate-400 mt-3">
                Click an option to see detailed breakdown
              </p>
            </div>
            
            <div className="space-y-6">
              {feeCalculator.data.map((recommendation: FeeRecommendation) => {
                const totalCostSats = recommendation.satPerVByte * feeCalculator.txSize;
                const isSelected = feeCalculator.selectedTier === recommendation.level;
                
                return (
                  <div
                    key={recommendation.level}
                    onClick={() => setFeeCalculatorSelectedTier(isSelected ? null : recommendation.level)}
                    className={`p-6 rounded-sm border-2 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-sm ${getTierColor(recommendation.level, isSelected)} ${isSelected ? 'transform scale-[1.02]' : 'hover:scale-[1.01]'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl">{recommendation.emoji}</span>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                            {recommendation.label}
                          </h4>
                          <p className="text-lg text-gray-600 dark:text-slate-400">
                            {recommendation.timeEstimate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-bitcoin">
                          ${formatUSD(totalCostSats)}
                        </div>
                        <div className="text-lg text-gray-600 dark:text-slate-400">
                          {totalCostSats < 1000 ? totalCostSats : `${(totalCostSats/1000).toFixed(1)}k`} satoshis
                        </div>
                      </div>
                    </div>

                    <div className="text-lg text-gray-700 dark:text-slate-700 mb-4">
                      {recommendation.description}
                    </div>

                    <div className="flex items-center justify-between text-base text-gray-500 dark:text-slate-400">
                      <span className="font-medium">
                        {recommendation.satPerVByte} sat/vB
                      </span>
                      {recommendation.savings && (
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          Save {recommendation.savings.percent}% vs {recommendation.savings.comparedTo}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <div className="mt-6 p-5 bg-white dark:bg-slate-700 rounded-sm border-2 shadow-sm">
                        <h5 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-3">
                          What You're Paying For
                        </h5>
                        <p className="text-base text-gray-600 dark:text-slate-400 mb-4">
                          This fee incentivizes network operators to process your transaction
                        </p>
                        <div className="space-y-4 text-base">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-600">Total Cost:</span>
                            <span className="font-semibold">${formatUSD(totalCostSats)} USD</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-600">In Bitcoin:</span>
                            <span className="font-mono font-medium">{formatBTC(totalCostSats)} BTC</span>
                          </div>
                          <div className="flex justify-between text-gray-600 dark:text-gray-600">
                            <span>In Satoshis:</span>
                            <span className="font-mono font-medium">{totalCostSats.toLocaleString()} sats</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <div className="card bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700">
            <div className="text-center">
              <p className="text-base text-gray-600 dark:text-slate-400 mb-4">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </p>
              <button
                onClick={() => {
                  fetchFeeRecommendations(feeCalculator.txSize);
                  // Smooth scroll to the Fee Calculator section
                  const feeCalcSection = document.getElementById('fee-calculator-section');
                  if (feeCalcSection) {
                    feeCalcSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="btn-secondary px-6 py-3"
              >
                Refresh Fees
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Educational Sidebar - 40% width */}
      <div className="lg:flex-[1] lg:max-w-md">
        <div className="lg:sticky lg:top-6">
          <EducationalSidebar sections={feeEducation} />
        </div>
      </div>
    </div>
  );
}

export default function FeeCalculatorToolWithErrorBoundary(props: any) {
  return (
    <ToolErrorBoundary toolName="Fee Calculator">
      <FeeCalculatorTool {...props} />
    </ToolErrorBoundary>
  );
}

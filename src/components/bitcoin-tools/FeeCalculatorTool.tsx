'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useBitcoinToolsStore } from '@/stores/bitcoinToolsStore';
import { FeeRecommendation, createToolError, FeeCostBreakdown, FeeSavings, FeeLevel, FeeEmoji, FeeRate, SatoshiAmount, BTCAmount, USDAmount } from '@/types/bitcoin-tools';
import { apiClient, isSuccessWithData } from '@/lib/api-client';
import { toToolError } from '@/lib/type-safe-error-handler';
import { z } from 'zod';
import ToolSkeleton from './ToolSkeleton';
import { BitcoinTooltip } from './Tooltip';
import ToolErrorBoundary from './ToolErrorBoundary';
import { EducationalSidebar } from './educational/EducationalSidebar';
import { feeEducation } from './educational/educationalContent';

// Zod schema for fee API response validation
const FeeApiResponseSchema = z.object({
  recommendations: z.array(z.object({
    level: z.enum(['economy', 'balanced', 'priority']),
    emoji: z.string(),
    label: z.string(),
    timeEstimate: z.string(),
    satPerVByte: z.number(),
    description: z.string(),
    savings: z.object({
      percent: z.number(),
      comparedTo: z.string()
    }).optional()
  })),
  networkConditions: z.object({
    congestionLevel: z.enum(['low', 'normal', 'high', 'extreme']),
    mempoolSize: z.number(),
    recommendation: z.string()
  }),
  lastUpdated: z.string(),
  txSize: z.number(),
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

function FeeCalculatorTool() {
  const {
    tools: { feeCalculator },
    setFeeCalculatorLoading,
    setFeeCalculatorData,
    setFeeCalculatorError,
    setFeeCalculatorTxSize,
    setFeeCalculatorSelectedTier,
    checkRateLimit,
    recordRequest
  } = useBitcoinToolsStore();

  const [customSize, setCustomSize] = useState('');
  const [networkData, setNetworkData] = useState<FeeApiResponse['networkConditions'] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchFeeRecommendations = useCallback(async (txSize: number) => {
    if (!checkRateLimit('fee-calculator')) {
      setFeeCalculatorError(createToolError('rate_limit', 'RATE_LIMIT_EXCEEDED'));
      return;
    }

    setFeeCalculatorLoading({
      isLoading: true,
      loadingMessage: 'Fetching current Bitcoin network fees...'
    });

    recordRequest('fee-calculator');
    
    try {
      const response = await apiClient.get(
        `/api/mempool/fees/recommended?txSize=${txSize}`,
        FeeApiResponseSchema,
        {
          timeout: 15000,
          retries: 2
        }
      );
      
      if (isSuccessWithData(response)) {
        const transformedRecommendations = transformToFeeRecommendations(response.data, btcPrice);
        setFeeCalculatorData(transformedRecommendations);
        setNetworkData(response.data.networkConditions);
        setLastUpdated(response.data.lastUpdated);

        if (response.data.warning) {
          console.warn('Fee Calculator Warning:', response.data.warning);
        }
      } else {
        console.error('Fee calculator API error:', response.error);
        setFeeCalculatorError(
          createToolError('api', 'API_ERROR', undefined, {
            apiError: response.error,
            endpoint: `/api/mempool/fees/recommended?txSize=${txSize}`
          })
        );
      }
    } catch (error) {
      console.error('Fee calculator error:', error);
      setFeeCalculatorError(
        toToolError(error, 'api', {
          endpoint: `/api/mempool/fees/recommended?txSize=${txSize}`,
          operation: 'fetchFeeRecommendations'
        })
      );
    }
  }, [checkRateLimit, recordRequest, setFeeCalculatorLoading, setFeeCalculatorData, setFeeCalculatorError]);

  // Initialize with default transaction size
  useEffect(() => {
    if (feeCalculator.data === null) {
      fetchFeeRecommendations(feeCalculator.txSize);
    }
  }, [feeCalculator.data, feeCalculator.txSize, fetchFeeRecommendations]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (feeCalculator.data && !feeCalculator.loading.isLoading) {
        fetchFeeRecommendations(feeCalculator.txSize);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [autoRefresh, feeCalculator.data, feeCalculator.loading.isLoading, fetchFeeRecommendations, feeCalculator.txSize]);

  const handleSizeChange = (newSize: number) => {
    setFeeCalculatorTxSize(newSize);
    setCustomSize('');
    fetchFeeRecommendations(newSize);
  };

  const handleCustomSizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const size = parseInt(customSize);
    if (size && size > 0 && size <= 10000) {
      handleSizeChange(size);
    }
  };

  const formatBTC = (sats: number): string => {
    return (sats / 100000000).toFixed(8);
  };

  const [btcPrice, setBtcPrice] = useState<number>(30000); // Default fallback price

  // Fetch Bitcoin price on component mount
  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        const response = await fetch('/api/coingecko');
        if (response.ok) {
          const data = await response.json();
          setBtcPrice(data.bitcoin.usd);
        }
      } catch (error) {
        console.warn('Failed to fetch Bitcoin price, using fallback');
      }
    };

    fetchBtcPrice();
  }, []);

  const formatUSD = (sats: number): string => {
    const btc = sats / 100000000;
    const usd = btc * btcPrice;
    return usd.toFixed(2);
  };

  const getTierColor = (level: FeeRecommendation['level'], isSelected: boolean) => {
    const colors = {
      economy: isSelected ? 'bg-green-100 border-green-500 dark:bg-green-900/30 dark:border-green-400' : 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-700',
      balanced: isSelected ? 'bg-yellow-100 border-yellow-500 dark:bg-yellow-900/30 dark:border-yellow-400' : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-700',
      priority: isSelected ? 'bg-red-100 border-red-500 dark:bg-red-900/30 dark:border-red-400' : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-700'
    };
    return colors[level];
  };

  const getNetworkStatusColor = () => {
    if (!networkData) return 'text-gray-500';
    
    const colors = {
      low: 'text-green-600 dark:text-green-400',
      normal: 'text-blue-600 dark:text-blue-400',
      high: 'text-orange-600 dark:text-orange-400',
      extreme: 'text-red-600 dark:text-red-400'
    };
    return colors[networkData.congestionLevel];
  };

  if (feeCalculator.loading.isLoading) {
    return <ToolSkeleton variant="fee" showProgress progressMessage={feeCalculator.loading.loadingMessage} />;
  }

  if (feeCalculator.error) {
    throw feeCalculator.error; // Will be caught by error boundary
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
            networkData.congestionLevel === 'high' ? 'bg-orange-50 border-orange-400 dark:bg-orange-900/20' :
            'bg-red-50 border-red-400 dark:bg-red-900/20'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xl font-bold ${getNetworkStatusColor()}`}>
                  Network Traffic: {networkData.congestionLevel === 'low' ? 'Light' : 
                                   networkData.congestionLevel === 'normal' ? 'Moderate' :
                                   networkData.congestionLevel === 'high' ? 'Busy' : 'Very Busy'}
                </p>
                <p className="text-lg text-gray-600 dark:text-slate-300 mt-2">
                  {networkData.congestionLevel === 'low' ? 'Great time to send - fees are low!' :
                   networkData.congestionLevel === 'normal' ? 'Normal fees apply for transactions' :
                   networkData.congestionLevel === 'high' ? 'Network is busy - fees are higher than usual' :
                   'Network very congested - consider waiting if not urgent'}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {networkData.mempoolSize > 0 && `${networkData.mempoolSize.toLocaleString()} transactions waiting`}
              </div>
            </div>
          </div>
        )}

        {/* Transaction Size Selection */}
        <div className="card mb-6">
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

            <p className="text-lg text-gray-600 dark:text-slate-400 mb-6">
              Different transactions cost different amounts based on their complexity
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TRANSACTION_PRESETS.map((preset) => (
              <button
                key={preset.size}
                onClick={() => handleSizeChange(preset.size)}
                className={`p-4 text-left rounded-xl border-2 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] ${
                  feeCalculator.txSize === preset.size
                    ? 'border-bitcoin bg-bitcoin/10 shadow-xl transform scale-105'
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
            <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-bitcoin font-medium">
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
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-base"
              />
              <button
                type="submit"
                disabled={!customSize || parseInt(customSize) <= 0}
                className="px-6 py-3 bg-bitcoin text-white rounded-lg text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bitcoin-600 transition-colors"
              >
                Set
              </button>
            </form>
          </details>
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
              {feeCalculator.data.map((recommendation) => {
                const totalCostSats = recommendation.satPerVByte * feeCalculator.txSize;
                const isSelected = feeCalculator.selectedTier === recommendation.level;
                
                return (
                  <div
                    key={recommendation.level}
                    onClick={() => setFeeCalculatorSelectedTier(isSelected ? null : recommendation.level)}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl ${getTierColor(recommendation.level, isSelected)} ${isSelected ? 'transform scale-[1.02]' : 'hover:scale-[1.01]'}`}
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

                    <div className="text-lg text-gray-700 dark:text-slate-300 mb-4">
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
                      <div className="mt-6 p-5 bg-white dark:bg-slate-700 rounded-xl border-2 shadow-sm">
                        <h5 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-3">
                          What You're Paying For
                        </h5>
                        <p className="text-base text-gray-600 dark:text-slate-400 mb-4">
                          This fee incentivizes network operators to process your transaction
                        </p>
                        <div className="space-y-4 text-base">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Cost:</span>
                            <span className="font-semibold">${formatUSD(totalCostSats)} USD</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">In Bitcoin:</span>
                            <span className="font-mono font-medium">{formatBTC(totalCostSats)} BTC</span>
                          </div>
                          <div className="flex justify-between text-gray-600 dark:text-gray-400">
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
                onClick={() => fetchFeeRecommendations(feeCalculator.txSize)}
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

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useBitcoinToolsStore } from '@/stores/bitcoinToolsStore';
import { FeeRecommendation, createToolError } from '@/types/bitcoin-tools';
import ToolSkeleton from './ToolSkeleton';
import { BitcoinTooltip } from './Tooltip';
import ToolErrorBoundary from './ToolErrorBoundary';

interface FeeApiResponse {
  recommendations: FeeRecommendation[];
  networkConditions: {
    congestionLevel: 'low' | 'normal' | 'high' | 'extreme';
    mempoolSize: number;
    recommendation: string;
  };
  lastUpdated: string;
  txSize: number;
  warning?: string;
  error?: string;
}

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

    try {
      recordRequest('fee-calculator');
      
      const response = await fetch(`/api/mempool/fees/recommended?txSize=${txSize}`);
      const data: FeeApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch fee recommendations');
      }

      setFeeCalculatorData(data.recommendations);
      setNetworkData(data.networkConditions);
      setLastUpdated(data.lastUpdated);

      if (data.warning) {
        console.warn('Fee Calculator Warning:', data.warning);
      }

    } catch (error) {
      console.error('Fee calculator error:', error);
      setFeeCalculatorError(
        createToolError(
          'api',
          'API_ERROR',
          error instanceof Error ? error : undefined
        )
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
    <div className="space-y-6">
      {/* Network Status Banner */}
      {networkData && (
        <div className={`p-3 rounded-lg border-l-4 ${
          networkData.congestionLevel === 'low' ? 'bg-green-50 border-green-400 dark:bg-green-900/20' :
          networkData.congestionLevel === 'normal' ? 'bg-blue-50 border-blue-400 dark:bg-blue-900/20' :
          networkData.congestionLevel === 'high' ? 'bg-orange-50 border-orange-400 dark:bg-orange-900/20' :
          'bg-red-50 border-red-400 dark:bg-red-900/20'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-medium ${getNetworkStatusColor()}`}>
                Network: {networkData.congestionLevel.charAt(0).toUpperCase() + networkData.congestionLevel.slice(1)} Activity
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {networkData.recommendation}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {networkData.mempoolSize > 0 && `${networkData.mempoolSize.toLocaleString()} pending transactions`}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Size Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Transaction Size
            <BitcoinTooltip term="VBYTE">
              <span className="ml-1 cursor-help text-bitcoin">ⓘ</span>
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

        {/* Preset Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {TRANSACTION_PRESETS.map((preset) => (
            <button
              key={preset.size}
              onClick={() => handleSizeChange(preset.size)}
              className={`p-3 text-left rounded-lg border-2 transition-all ${
                feeCalculator.txSize === preset.size
                  ? 'border-bitcoin bg-bitcoin/10'
                  : 'border-gray-200 dark:border-gray-600 hover:border-bitcoin/50'
              }`}
            >
              <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {preset.label}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {preset.size} vBytes
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {preset.description}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Size Input */}
        <form onSubmit={handleCustomSizeSubmit} className="flex gap-2">
          <input
            type="number"
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value)}
            placeholder={`Custom size (current: ${feeCalculator.txSize} vBytes)`}
            min="1"
            max="10000"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          />
          <button
            type="submit"
            disabled={!customSize || parseInt(customSize) <= 0}
            className="px-4 py-2 bg-bitcoin text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bitcoin-600 transition-colors"
          >
            Set
          </button>
        </form>
      </div>

      {/* Fee Recommendations */}
      {feeCalculator.data && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Fee Recommendations
          </h3>
          
          <div className="grid gap-3">
            {feeCalculator.data.map((recommendation) => {
              const totalCostSats = recommendation.satPerVByte * feeCalculator.txSize;
              const isSelected = feeCalculator.selectedTier === recommendation.level;
              
              return (
                <div
                  key={recommendation.level}
                  onClick={() => setFeeCalculatorSelectedTier(isSelected ? null : recommendation.level)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${getTierColor(recommendation.level, isSelected)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{recommendation.emoji}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {recommendation.label}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {recommendation.timeEstimate}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-gray-100">
                        {totalCostSats} sats
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        ${formatUSD(totalCostSats)}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {recommendation.description}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {recommendation.satPerVByte} sat/vB
                    </span>
                    {recommendation.savings && (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Save {recommendation.savings.percent}% vs {recommendation.savings.comparedTo}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded border">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Fee Breakdown
                      </h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Transaction Size:</span>
                          <span className="font-mono">{feeCalculator.txSize} vBytes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Fee Rate:</span>
                          <span className="font-mono">{recommendation.satPerVByte} sat/vB</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total Fee:</span>
                          <span className="font-mono">{totalCostSats} sats</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>In BTC:</span>
                          <span className="font-mono">{formatBTC(totalCostSats)} BTC</span>
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
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          <button
            onClick={() => fetchFeeRecommendations(feeCalculator.txSize)}
            className="ml-2 text-bitcoin hover:text-bitcoin-600 underline"
          >
            Refresh
          </button>
        </div>
      )}
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
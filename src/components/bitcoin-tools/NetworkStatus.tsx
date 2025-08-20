'use client';

import React, { useState, useEffect } from 'react';
import type { NetworkHealth } from '@/types/bitcoin-tools';
import { BitcoinAPI } from '@/lib/bitcoin-api';
import ToolErrorBoundary from './ToolErrorBoundary';

interface FeeEstimates {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
}

interface EnhancedNetworkHealth extends NetworkHealth {
  feeEstimates?: FeeEstimates;
}

interface BitcoinPrice {
  price: number;
  change24h: number;
}

const NetworkStatus: React.FC = () => {
  const [networkHealth, setNetworkHealth] = useState<EnhancedNetworkHealth | null>(null);
  const [bitcoinPrice, setBitcoinPrice] = useState<BitcoinPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNetworkHealth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch both network status and Bitcoin price in parallel
      const [networkResponse, bitcoinPriceData] = await Promise.all([
        fetch('/api/mempool/network/status/', {
          headers: {
            'Accept': 'application/json'
          }
        }),
        BitcoinAPI.getCurrentPrice()
      ]);
      
      if (!networkResponse.ok) {
        throw new Error('Failed to fetch network status');
      }
      
      const networkData = await networkResponse.json();
      
      // Fetch detailed fee estimates
      try {
        const feeResponse = await fetch('https://mempool.space/api/v1/fees/recommended', {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (feeResponse.ok) {
          const feeData = await feeResponse.json();
          networkData.feeEstimates = {
            fastestFee: feeData.fastestFee,
            halfHourFee: feeData.halfHourFee,
            hourFee: feeData.hourFee,
            economyFee: feeData.economyFee
          };
        }
      } catch (feeError) {
        console.warn('Failed to fetch fee estimates:', feeError);
      }
      
      setNetworkHealth(networkData);
      setBitcoinPrice(bitcoinPriceData);
    } catch (err) {
      console.error('Error fetching network health:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkHealth();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchNetworkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

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

  const calculateTxCostUSD = (feeRate: number, txSize: number = 140): number => {
    if (!bitcoinPrice) return 0;
    const satoshiCost = feeRate * txSize;
    const btcCost = satoshiCost / 100000000;
    return btcCost * bitcoinPrice.price;
  };

  const getCongestionProgress = (): { percentage: number; color: string; label: string } => {
    if (!networkHealth) return { percentage: 0, color: 'bg-gray-400', label: 'Unknown' };
    
    // Base congestion on fee rates rather than just transaction count
    const avgFee = networkHealth.averageFee;
    const mempoolSize = networkHealth.mempoolSize;
    
    // Low congestion: fees < 10 sat/vB
    // Normal: 10-30 sat/vB
    // High: 30-100 sat/vB  
    // Extreme: 100+ sat/vB
    
    let percentage: number;
    let color: string;
    let label: string;
    
    if (avgFee < 10) {
      percentage = Math.min(25, (mempoolSize / 10000) * 25);
      color = 'bg-green-500';
      label = 'Low Congestion';
    } else if (avgFee < 30) {
      percentage = 25 + Math.min(25, ((avgFee - 10) / 20) * 25);
      color = 'bg-yellow-500';
      label = 'Normal Congestion';
    } else if (avgFee < 100) {
      percentage = 50 + Math.min(25, ((avgFee - 30) / 70) * 25);
      color = 'bg-orange-500';
      label = 'High Congestion';
    } else {
      percentage = 75 + Math.min(25, Math.min(avgFee / 200, 1) * 25);
      color = 'bg-red-500';
      label = 'Extreme Congestion';
    }
    
    return { percentage: Math.round(percentage), color, label };
  };

  const getFeeLabel = (feeType: string): { label: string; emoji: string; timeEstimate: string } => {
    const feeLabels = {
      fastestFee: { label: 'Priority', emoji: '🚀', timeEstimate: 'Next block (~10 min)' },
      halfHourFee: { label: 'Standard', emoji: '⚡', timeEstimate: '~30 minutes' },
      hourFee: { label: 'Normal', emoji: '🚶', timeEstimate: '~1 hour' },
      economyFee: { label: 'Economy', emoji: '🐌', timeEstimate: '2+ hours' }
    };
    return feeLabels[feeType as keyof typeof feeLabels] || { label: 'Unknown', emoji: '❓', timeEstimate: 'Unknown' };
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-bitcoin border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading network status...</p>
      </div>
    );
  }

  if (error || !networkHealth) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Unable to load network status</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">We're having trouble connecting to the Bitcoin network data.</p>
        <button
          onClick={fetchNetworkHealth}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-bitcoin hover:bg-bitcoin-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bitcoin"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Explanatory Text for New Users */}
      <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700 shadow-sm">
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

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          {getStatusIcon(networkHealth.congestionLevel)}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Current Network Health</h2>
            <p className="text-base text-gray-600 dark:text-gray-400">Live updates every 30 seconds</p>
          </div>
        </div>
        <span className={getStatusBadgeClasses(networkHealth.humanReadable.colorScheme)}>
          {networkHealth.congestionLevel === 'low' ? 'Light Traffic' :
           networkHealth.congestionLevel === 'normal' ? 'Normal Traffic' :
           networkHealth.congestionLevel === 'high' ? 'Heavy Traffic' : 'Very Heavy Traffic'}
        </span>
      </div>

      {/* Network Congestion Visual */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Network Congestion Level</h3>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {getCongestionProgress().label}
            </span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4 mb-3">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${getCongestionProgress().color}`}
                style={{ width: `${getCongestionProgress().percentage}%` }}
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
                {formatNumber(networkHealth.mempoolSize)} transactions
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Size: </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatBytes(networkHealth.mempoolBytes)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Estimates */}
      {networkHealth.feeEstimates && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Current Fee Rates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(networkHealth.feeEstimates).map(([feeType, feeRate]) => {
              const feeInfo = getFeeLabel(feeType);
              const costUSD = calculateTxCostUSD(feeRate);
              
              return (
                <div key={feeType} className="bg-white dark:bg-gray-700 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-center">
                    <div className="text-2xl mb-2">{feeInfo.emoji}</div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{feeInfo.label}</h4>
                    <div className="text-lg font-bold text-bitcoin mb-1">{feeRate} sat/vB</div>
                    {bitcoinPrice && (
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
              {bitcoinPrice && (
                <span>Bitcoin price: ${bitcoinPrice.price.toLocaleString()}</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Human-Readable Status */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">What This Means for You</h3>
        <div className={`rounded-xl p-6 border-l-4 shadow-sm ${
          networkHealth.humanReadable.colorScheme === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-400' :
          networkHealth.humanReadable.colorScheme === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400' :
          networkHealth.humanReadable.colorScheme === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400' :
          'bg-red-50 dark:bg-red-900/20 border-red-400'
        }`}>
          <p className="text-gray-900 dark:text-white text-lg font-semibold mb-3">
            {networkHealth.congestionLevel === 'low' ? '✅ Perfect timing for transactions!' :
             networkHealth.congestionLevel === 'normal' ? '👍 Good time to send Bitcoin' :
             networkHealth.congestionLevel === 'high' ? '⚠️ Network is getting busy' :
             '🚨 Network is very congested'}
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4">
            {networkHealth.congestionLevel === 'low' 
              ? 'Fees are at their lowest and transactions will confirm quickly. This is the best time to send Bitcoin if you want to save on fees.'
              : networkHealth.congestionLevel === 'normal'
              ? 'Standard fees apply and transactions will confirm at normal speed. Most transactions will be processed within 10-30 minutes.'
              : networkHealth.congestionLevel === 'high'
              ? 'Fees are higher than usual due to increased demand. Consider waiting if your transaction is not urgent, or pay higher fees for faster processing.'
              : 'Fees are very high right now. Unless your transaction is urgent, consider waiting a few hours for the network to clear up.'}
          </p>
          
          {/* Fee-based recommendations */}
          {networkHealth.feeEstimates && (
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💰 Fee Recommendation:</h4>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {networkHealth.averageFee < 10 && (
                  <span>Use <strong>Economy fees</strong> ({networkHealth.feeEstimates.economyFee} sat/vB) to save money!</span>
                )}
                {networkHealth.averageFee >= 10 && networkHealth.averageFee < 30 && (
                  <span>Use <strong>Standard fees</strong> ({networkHealth.feeEstimates.halfHourFee} sat/vB) for reliable confirmation.</span>
                )}
                {networkHealth.averageFee >= 30 && networkHealth.averageFee < 100 && (
                  <span>Consider <strong>Priority fees</strong> ({networkHealth.feeEstimates.fastestFee} sat/vB) or wait for lower congestion.</span>
                )}
                {networkHealth.averageFee >= 100 && (
                  <span>⚠️ <strong>High fees required</strong> ({networkHealth.feeEstimates.fastestFee} sat/vB) - consider waiting unless urgent.</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Our Recommendation</h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-400 shadow-sm">
          <p className="text-blue-900 dark:text-blue-300 text-base leading-relaxed">
            {networkHealth.congestionLevel === 'low' 
              ? '💡 Send your transactions now to take advantage of low fees. This is the ideal time for non-urgent transfers.'
              : networkHealth.congestionLevel === 'normal'
              ? '💡 Network conditions are normal. Feel free to send transactions with standard fee settings.'
              : networkHealth.congestionLevel === 'high'
              ? '💡 If possible, wait a few hours for lower fees. If you must send now, use priority fees to ensure confirmation.'
              : '💡 We strongly recommend waiting unless absolutely necessary. Fees could be 5-10x higher than normal right now.'}
          </p>
        </div>
      </div>

      {/* Next Block Estimation */}
      <div className="flex items-center justify-between text-base text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Next batch of transactions processes in: <strong className="text-gray-900 dark:text-white">{networkHealth.nextBlockETA}</strong></span>
        </div>
        <button
          onClick={fetchNetworkHealth}
          className="text-bitcoin hover:text-bitcoin-dark dark:text-bitcoin dark:hover:text-bitcoin-light font-semibold px-4 py-2 rounded-lg hover:bg-bitcoin/10 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

// Wrap NetworkStatus with error boundary
const NetworkStatusWithErrorBoundary: React.FC = () => (
  <ToolErrorBoundary toolName="Network Status">
    <NetworkStatus />
  </ToolErrorBoundary>
);

export default NetworkStatusWithErrorBoundary;
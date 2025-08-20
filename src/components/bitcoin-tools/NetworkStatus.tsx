'use client';

import React, { useState, useEffect } from 'react';
import type { NetworkHealth } from '@/types/bitcoin-tools';
import ToolErrorBoundary from './ToolErrorBoundary';

const NetworkStatus: React.FC = () => {
  const [networkHealth, setNetworkHealth] = useState<NetworkHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNetworkHealth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/mempool/network/status/', {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch network status');
      }
      
      const data = await response.json();
      setNetworkHealth(data);
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

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-gray-700 dark:text-gray-300">Waiting to Process</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(networkHealth.mempoolSize)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">transactions in line</p>
            </div>
            <div className="w-10 h-10 text-gray-400 flex-shrink-0">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-gray-700 dark:text-gray-300">Queue Size</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatBytes(networkHealth.mempoolBytes)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">of transaction data</p>
            </div>
            <div className="w-10 h-10 text-gray-400 flex-shrink-0">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-gray-700 dark:text-gray-300">Typical Cost</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{networkHealth.averageFee}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">satoshis per byte</p>
            </div>
            <div className="w-10 h-10 text-gray-400 flex-shrink-0">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

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
          <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
            {networkHealth.congestionLevel === 'low' 
              ? 'Fees are at their lowest and transactions will confirm quickly. This is the best time to send Bitcoin if you want to save on fees.'
              : networkHealth.congestionLevel === 'normal'
              ? 'Standard fees apply and transactions will confirm at normal speed. Most transactions will be processed within 10-30 minutes.'
              : networkHealth.congestionLevel === 'high'
              ? 'Fees are higher than usual due to increased demand. Consider waiting if your transaction is not urgent, or pay higher fees for faster processing.'
              : 'Fees are very high right now. Unless your transaction is urgent, consider waiting a few hours for the network to clear up.'}
          </p>
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
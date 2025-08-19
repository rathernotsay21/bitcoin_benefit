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
      
      const response = await fetch('/api/mempool/network', {
        next: { revalidate: 30 }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon(networkHealth.congestionLevel)}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Network Status</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Real-time Bitcoin network conditions</p>
          </div>
        </div>
        <span className={getStatusBadgeClasses(networkHealth.humanReadable.colorScheme)}>
          {networkHealth.congestionLevel.charAt(0).toUpperCase() + networkHealth.congestionLevel.slice(1)} Activity
        </span>
      </div>

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Transactions</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(networkHealth.mempoolSize)}</p>
            </div>
            <div className="w-8 h-8 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mempool Size</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatBytes(networkHealth.mempoolBytes)}</p>
            </div>
            <div className="w-8 h-8 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Fee</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{networkHealth.averageFee}<span className="text-sm font-normal"> sat/vB</span></p>
            </div>
            <div className="w-8 h-8 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Human-Readable Status */}
      <div>
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Current Conditions</h3>
        <div className={`rounded-lg p-4 border-l-4 ${
          networkHealth.humanReadable.colorScheme === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-400' :
          networkHealth.humanReadable.colorScheme === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400' :
          networkHealth.humanReadable.colorScheme === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400' :
          'bg-red-50 dark:bg-red-900/20 border-red-400'
        }`}>
          <p className="text-gray-900 dark:text-white font-medium mb-2">{networkHealth.humanReadable.congestionDescription}</p>
          <p className="text-gray-700 dark:text-gray-300">{networkHealth.humanReadable.userAdvice}</p>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Recommendation</h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-400">
          <p className="text-blue-900 dark:text-blue-300">{networkHealth.recommendation}</p>
        </div>
      </div>

      {/* Next Block Estimation */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Next block estimated: <strong>{networkHealth.nextBlockETA}</strong></span>
        </div>
        <button
          onClick={fetchNetworkHealth}
          className="text-bitcoin hover:text-bitcoin-dark dark:text-bitcoin dark:hover:text-bitcoin-light font-medium"
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
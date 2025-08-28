'use client';

import React, { useState } from 'react';
import { useServiceWorkerCache } from '@/hooks/useServiceWorkerCache';

interface CacheManagerProps {
  showInProduction?: boolean;
  className?: string;
}

// Phase 3.2: Advanced cache management component for monitoring and debugging
export function CacheManager({ showInProduction = false, className = '' }: CacheManagerProps) {
  const {
    isSupported,
    isRegistered,
    cacheStats,
    isLoading,
    error,
    getCacheStats,
    clearCache,
    preloadRoute,
    updateBitcoinData,
    getFormattedCacheSize,
    getCacheHealthScore
  } = useServiceWorkerCache();

  const [isExpanded, setIsExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Don't show in production unless explicitly allowed
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  // Don't show if service worker not supported
  if (!isSupported) {
    return null;
  }

  const handleGetStats = async () => {
    setActionLoading('stats');
    await getCacheStats();
    setActionLoading(null);
  };

  const handleClearCache = async () => {
    if (!window.confirm('Are you sure you want to clear all caches? This will impact performance on the next visit.')) {
      return;
    }
    
    setActionLoading('clear');
    const success = await clearCache();
    if (success) {
      alert('Cache cleared successfully!');
    } else {
      alert('Failed to clear cache.');
    }
    setActionLoading(null);
  };

  const handlePreloadRoute = async (route: string) => {
    setActionLoading(`preload-${route}`);
    const success = await preloadRoute(route);
    if (success) {
      console.log(`Route ${route} preloaded successfully`);
    }
    setActionLoading(null);
  };

  const handleUpdateBitcoinData = async () => {
    setActionLoading('bitcoin');
    const success = await updateBitcoinData();
    if (success) {
      alert('Bitcoin data updated successfully!');
    } else {
      alert('Failed to update Bitcoin data.');
    }
    setActionLoading(null);
  };

  const healthScore = getCacheHealthScore();
  const totalSize = getFormattedCacheSize();

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Cache Health Indicator */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          mb-2 px-3 py-2 rounded-lg text-xs font-medium shadow-lg transition-all duration-200
          ${healthScore >= 75 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : healthScore >= 50 
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }
        `}
        title={`Cache Health: ${healthScore}/100 | Size: ${totalSize}`}
      >
        🚀 SW {healthScore}% ({totalSize})
      </button>

      {/* Expanded Cache Management Panel */}
      {isExpanded && (
        <div className="bg-slate-800 text-white rounded-lg shadow-2xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Cache Manager</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Service Worker Status */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${isRegistered ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm font-medium">
                Service Worker {isRegistered ? 'Active' : 'Inactive'}
              </span>
            </div>
            {error && (
              <div className="text-red-400 text-xs bg-red-900/30 px-2 py-1 rounded">
                {error}
              </div>
            )}
          </div>

          {/* Cache Statistics */}
          {cacheStats && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2 text-orange-400">Cache Statistics</h4>
              <div className="space-y-2">
                {Object.entries(cacheStats).map(([name, stats]) => (
                  <div key={name} className="bg-slate-700 rounded p-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium capitalize">{name}</span>
                      <span className="text-xs text-slate-300">
                        {stats.itemCount} items
                      </span>
                    </div>
                    {stats.error ? (
                      <div className="text-red-400 text-xs">{stats.error}</div>
                    ) : (
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{(stats.totalSize / 1024).toFixed(1)} KB</span>\n                        <span>Limit: {stats.limit}</span>
                      </div>
                    )}
                  </div>
                ))}\n              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleGetStats}
              disabled={isLoading || actionLoading === 'stats'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              {actionLoading === 'stats' ? 'Loading...' : '📊 Refresh Stats'}
            </button>

            <button
              onClick={handleUpdateBitcoinData}
              disabled={isLoading || actionLoading === 'bitcoin'}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              {actionLoading === 'bitcoin' ? 'Updating...' : '₿ Update Bitcoin Data'}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handlePreloadRoute('/calculator')}
                disabled={actionLoading?.startsWith('preload')}
                className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-2 py-1 rounded text-xs font-medium transition-colors"
              >
                🧮 Calculator
              </button>
              <button
                onClick={() => handlePreloadRoute('/bitcoin-tools')}
                disabled={actionLoading?.startsWith('preload')}
                className="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-2 py-1 rounded text-xs font-medium transition-colors"
              >
                🔧 Tools
              </button>
            </div>

            <button
              onClick={handleClearCache}
              disabled={isLoading || actionLoading === 'clear'}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              {actionLoading === 'clear' ? 'Clearing...' : '🗑️ Clear All Cache'}
            </button>
          </div>

          {/* Cache Health Score */}
          <div className="mt-4 pt-3 border-t border-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cache Health</span>
              <span className={`text-sm font-bold ${
                healthScore >= 75 ? 'text-green-400' : 
                healthScore >= 50 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {healthScore}/100
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  healthScore >= 75 ? 'bg-green-400' :
                  healthScore >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>

          {/* Performance Tips */}
          <div className="mt-3 p-2 bg-slate-700/50 rounded text-xs">
            <div className="font-medium text-orange-400 mb-1">💡 Performance Tips:</div>
            <ul className="text-slate-300 space-y-1">
              <li>• Higher cache health = faster repeat visits</li>
              <li>• Clear cache only when debugging issues</li>
              <li>• Preload routes you'll visit soon</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// Phase 3.2: Lightweight cache status indicator for production
export function CacheStatusIndicator() {
  const { isSupported, isRegistered, getCacheHealthScore, getFormattedCacheSize } = useServiceWorkerCache();
  
  if (process.env.NODE_ENV === 'development' || !isSupported || !isRegistered) {
    return null;
  }

  const healthScore = getCacheHealthScore();
  const totalSize = getFormattedCacheSize();

  if (healthScore === 0) return null;

  return (
    <div 
      className={`
        fixed bottom-4 right-4 px-2 py-1 rounded text-xs font-medium shadow-lg z-40
        ${healthScore >= 75 
          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
          : healthScore >= 50 
            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
            : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }
      `}
      title="Service Worker Cache Status"
    >
      🚀 {totalSize}
    </div>
  );
}
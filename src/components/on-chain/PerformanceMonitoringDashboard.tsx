/**
 * Performance Monitoring Dashboard Component
 * Real-time display of optimization effectiveness and system performance
 */

'use client';

import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { useOnChainStore } from '@/stores/onChainStore';
import { PerformanceMonitor, MemoryOptimizer } from '@/lib/on-chain/concurrentProcessing';
import { OnChainPriceFetcher } from '@/lib/on-chain/price-fetcher';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'error';
  threshold?: number;
  improvement?: number;
}

interface PerformanceDashboardProps {
  className?: string;
  showDetailedMetrics?: boolean;
}

/**
 * Performance metric card component
 */
const MetricCard = memo(function MetricCard({ 
  metric 
}: { 
  metric: PerformanceMetric 
}) {
  const statusColors = {
    good: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
  };

  const statusIcons = {
    good: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    warning: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  };

  return (
    <div className={`p-4 rounded-sm border ${statusColors[metric.status]}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm">{metric.name}</h4>
        {statusIcons[metric.status]}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold">
            {typeof metric.value === 'number' ? metric.value.toFixed(2) : metric.value}
            <span className="text-sm font-normal ml-1">{metric.unit}</span>
          </div>
          {metric.improvement && (
            <div className="text-xs mt-1">
              {metric.improvement > 0 ? '↑' : '↓'} {Math.abs(metric.improvement).toFixed(1)}% vs baseline
            </div>
          )}
        </div>
        {metric.threshold && (
          <div className="text-xs text-right">
            Threshold: {metric.threshold}{metric.unit}
          </div>
        )}
      </div>
    </div>
  );
});

/**
 * Performance chart component for trends
 */
const PerformanceChart = memo(function PerformanceChart({
  data,
  title
}: {
  data: Array<{ time: number; value: number }>;
  title: string;
}) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-sm border border-gray-200 dark:border-slate-700">
      <h4 className="font-medium text-sm mb-4 text-gray-900 dark:text-white">{title}</h4>
      <div className="h-24 relative">
        <svg className="w-full h-full" viewBox="0 0 300 100">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 280 + 10;
              const y = 90 - ((d.value - minValue) / range) * 80;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 280 + 10;
            const y = 90 - ((d.value - minValue) / range) * 80;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2"
                fill="#f59e0b"
              />
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mt-2">
        <span>Min: {minValue.toFixed(1)}</span>
        <span>Max: {maxValue.toFixed(1)}</span>
      </div>
    </div>
  );
});

/**
 * Main performance dashboard component
 */
const PerformanceMonitoringDashboard = memo(function PerformanceMonitoringDashboard({
  className = '',
  showDetailedMetrics = false
}: PerformanceDashboardProps) {
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [historicalData, setHistoricalData] = useState<Array<{ time: number; value: number }>>([]);
  const [isCollapsed, setIsCollapsed] = useState(!showDetailedMetrics);
  
  const { 
    performanceMetrics, 
    lastProcessingTimeMs, 
    enablePerformanceOptimizations,
    togglePerformanceOptimizations,
    clearPerformanceCaches,
    getPerformanceStats 
  } = useOnChainStore();

  // Update performance data periodically
  useEffect(() => {
    const updateMetrics = () => {
      const stats = getPerformanceStats();
      const memoryInfo = MemoryOptimizer.getMemoryInfo();
      const cacheStats = OnChainPriceFetcher.getCacheStats();
      
      const newMetrics: PerformanceMetric[] = [
        {
          name: 'Last Processing Time',
          value: lastProcessingTimeMs,
          unit: 'ms',
          status: lastProcessingTimeMs < 5000 ? 'good' : lastProcessingTimeMs < 10000 ? 'warning' : 'error',
          threshold: 5000
        },
        {
          name: 'Memory Usage',
          value: memoryInfo?.usedJSHeapSize ? memoryInfo.usedJSHeapSize / (1024 * 1024) : 0,
          unit: 'MB',
          status: (memoryInfo?.usedJSHeapSize || 0) < 100 * 1024 * 1024 ? 'good' : 'warning',
          threshold: 100
        },
        {
          name: 'Cache Size',
          value: cacheStats.size,
          unit: ' entries',
          status: cacheStats.size > 0 ? 'good' : 'warning',
          threshold: 10
        },
        {
          name: 'Concurrent Operations',
          value: performanceMetrics?.concurrentOperationsUsed ? 1 : 0,
          unit: '',
          status: (performanceMetrics?.concurrentOperationsUsed || false) ? 'good' : 'warning',
          threshold: 1
        }
      ];

      if (performanceMetrics) {
        newMetrics.push(
          {
            name: 'Batching Efficiency',
            value: (performanceMetrics.batchingEfficiency || 0) * 100,
            unit: '%',
            status: (performanceMetrics.batchingEfficiency || 0) > 0.7 ? 'good' : 'warning',
            threshold: 70
          },
          {
            name: 'Total Processing Time',
            value: performanceMetrics.totalOperationTimeMs || 0,
            unit: 'ms',
            status: (performanceMetrics.totalOperationTimeMs || 0) < 10000 ? 'good' : 'warning',
            threshold: 10000
          }
        );
      }

      setPerformanceData(newMetrics);
      
      // Update historical data
      if (lastProcessingTimeMs > 0) {
        setHistoricalData(prev => {
          const newData = [...prev, { time: Date.now(), value: lastProcessingTimeMs }];
          return newData.slice(-20); // Keep last 20 data points
        });
      }
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [lastProcessingTimeMs, performanceMetrics, getPerformanceStats]);

  // Memoized summary stats
  const summaryStats = useMemo(() => {
    if (performanceData.length === 0) return null;

    const goodMetrics = performanceData.filter(m => m.status === 'good').length;
    const totalMetrics = performanceData.length;
    const healthScore = Math.round((goodMetrics / totalMetrics) * 100);

    return {
      healthScore,
      goodMetrics,
      totalMetrics,
      status: healthScore > 80 ? 'good' : healthScore > 60 ? 'warning' : 'error'
    };
  }, [performanceData]);

  // Handlers
  const handleToggleOptimizations = useCallback(() => {
    togglePerformanceOptimizations();
  }, [togglePerformanceOptimizations]);

  const handleClearCaches = useCallback(() => {
    clearPerformanceCaches();
  }, [clearPerformanceCaches]);

  const handleToggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  if (!summaryStats) {
    return (
      <div className={`p-4 bg-gray-50 dark:bg-slate-900 rounded-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Performance Monitor
            </h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              summaryStats.status === 'good' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : summaryStats.status === 'warning'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {summaryStats.healthScore}% Health
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleOptimizations}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                enablePerformanceOptimizations
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-700 dark:text-slate-300'
              }`}
            >
              Optimizations {enablePerformanceOptimizations ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={handleClearCaches}
              className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 transition-colors"
            >
              Clear Caches
            </button>
            <button
              onClick={handleToggleCollapsed}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg 
                className={`w-5 h-5 transform transition-transform ${isCollapsed ? '' : 'rotate-180'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-slate-400 mt-1">
          {summaryStats.goodMetrics} of {summaryStats.totalMetrics} metrics performing well
        </p>
      </div>

      {/* Collapsed state */}
      {isCollapsed && (
        <div className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-slate-400">
              Last processing: {lastProcessingTimeMs.toFixed(0)}ms
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-slate-400">
              Optimizations: {enablePerformanceOptimizations ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      )}

      {/* Expanded state */}
      {!isCollapsed && (
        <div className="p-4 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {performanceData.map((metric, index) => (
              <MetricCard key={index} metric={metric} />
            ))}
          </div>

          {/* Performance Chart */}
          {historicalData.length > 1 && (
            <PerformanceChart 
              data={historicalData} 
              title="Processing Time Trend" 
            />
          )}

          {/* Detailed Performance Metrics */}
          {performanceMetrics && showDetailedMetrics && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Detailed Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-sm">
                  <h5 className="font-medium text-sm mb-3">Concurrent Processing</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Operations Used:</span>
                      <span>{performanceMetrics.concurrentOperationsUsed ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Batching Efficiency:</span>
                      <span>{(performanceMetrics.batchingEfficiency * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory Usage:</span>
                      <span>{performanceMetrics.memoryUsageMB || 0} MB</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-sm">
                  <h5 className="font-medium text-sm mb-3">Cache Performance</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Cache Size:</span>
                      <span>{OnChainPriceFetcher.getCacheStats().size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cached Dates:</span>
                      <span>{OnChainPriceFetcher.getCacheStats().dates.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Tips */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-sm border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Performance Tips</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Enable optimizations for better performance on large datasets</li>
              <li>• Clear caches if experiencing memory issues</li>
              <li>• Processing times under 5 seconds indicate good performance</li>
              <li>• Cache size shows effective price data storage</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
});

export default PerformanceMonitoringDashboard;

'use client';

import React, { memo, useMemo } from 'react';
import { useCalculatorOptimized } from '@/hooks/useCalculatorOptimized';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

// Individual metric card with memoization
const MetricCard = memo(function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = ''
}: MetricCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-sm shadow-sm p-6 transition-all hover:shadow-sm ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-600">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={`mt-2 flex items-center text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span className="ml-1">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-4 flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
});

// Main metric cards component with optimizations
const MemoizedMetricCards = memo(function MemoizedMetricCards() {
  const { totals, currentBitcoinPrice, inputs } = useCalculatorOptimized();
  const bitcoinChange24h = 0; // Placeholder for 24h change
  
  // Memoize formatted values
  const formattedMetrics = useMemo(() => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
    
    const btcFormatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
    
    return {
      totalValue: formatter.format(totals.total),
      vestedValue: formatter.format(totals.vested),
      unvestedValue: formatter.format(totals.unvested),
      bitcoinPrice: formatter.format(currentBitcoinPrice || 0),
      bitcoinAmount: btcFormatter.format((totals.total / (currentBitcoinPrice || 1)) || 0),
      roi: `${((totals.total / (inputs?.salary || 1) - 1) * 100).toFixed(1)}%`,
    };
  }, [totals, currentBitcoinPrice, inputs]);
  
  // Define metrics with memoization
  const metrics = useMemo(() => [
    {
      title: 'Total Projected Value',
      value: formattedMetrics.totalValue,
      subtitle: `≈ ${formattedMetrics.bitcoinAmount} BTC`,
      icon: (
        <svg className="w-8 h-8 text-bitcoin" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          <path d="M12.89 11.1c0-1.78-1.09-2.1-2.89-2.1V7h-1v2h-1V7H7v2H6v1h.5c.28 0 .5.22.5.5v5c0 .28-.22.5-.5.5H6v1h1v2h1v-2h1v2h1v-2c2 0 3.89-.4 3.89-2.9 0-1.33-.59-1.9-1.89-2.1.8-.3 1.89-.7 1.89-2z"/>
        </svg>
      ),
      trend: currentBitcoinPrice && bitcoinChange24h ? {
        value: bitcoinChange24h,
        isPositive: bitcoinChange24h > 0
      } : undefined,
    },
    {
      title: 'Unlocked Amount',
      value: formattedMetrics.vestedValue,
      subtitle: 'Available now',
      icon: (
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Unvested Amount',
      value: formattedMetrics.unvestedValue,
      subtitle: 'Locked for vesting',
      icon: (
        <svg className="w-8 h-8 text-bitcoin-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: 'Return on Investment',
      value: formattedMetrics.roi,
      subtitle: 'vs. cash compensation',
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ], [formattedMetrics, currentBitcoinPrice, bitcoinChange24h]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard
          key={metric.title}
          {...metric}
          className={`transition-all duration-300 animation-delay-${index * 100}`}
        />
      ))}
    </div>
  );
});

export default MemoizedMetricCards;
'use client';

import React, { memo } from 'react';
import { TooltipProps } from 'recharts';

interface CustomTooltipProps extends TooltipProps<number, string> {
  formatUSD: (value: number) => string;
  formatBTC: (value: number) => string;
  schemeId?: string;
}

export const VestingChartTooltip = memo<CustomTooltipProps>(({ 
  active, 
  payload, 
  label,
  formatUSD,
  formatBTC,
  schemeId = 'Vesting'
}) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const year = label;
  const btcBalance = data.btcBalance || 0;
  const usdValue = data.usdValue || 0;
  const bitcoinPrice = data.bitcoinPrice || 0;
  const vestingPercent = data.vestingPercent || 0;
  const grantSize = data.grantSize || 0;
  const isInitialGrant = data.isInitialGrant || false;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 min-w-[250px]">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-900 dark:text-gray-100">
          Year {year}
        </p>
        {vestingPercent > 0 && (
          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
            {vestingPercent}% Unlocked
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">BTC Balance:</span>
          <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatBTC(btcBalance)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">USD Value:</span>
          <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
            {formatUSD(usdValue)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">BTC Price:</span>
          <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
            {formatUSD(bitcoinPrice)}
          </span>
        </div>

        {grantSize > 0 && (
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isInitialGrant ? 'Initial Award:' : 'Annual Award:'}
              </span>
              <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                {formatBTC(grantSize / bitcoinPrice)} BTC
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Award Value:</span>
              <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                {formatUSD(grantSize)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

VestingChartTooltip.displayName = 'VestingChartTooltip';
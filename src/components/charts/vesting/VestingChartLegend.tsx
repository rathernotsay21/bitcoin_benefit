'use client';

import React, { memo } from 'react';

interface CustomLegendProps {
  payload?: Array<{
    value: string;
    type: string;
    id: string;
    color: string;
  }>;
}

export const VestingChartLegend = memo<CustomLegendProps>(({ payload }) => {
  if (!payload || payload.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => {
        const isGrant = entry.value.includes('Grant');
        const isVesting = entry.value.includes('Vesting');
        
        return (
          <div
            key={`item-${index}`}
            className="flex items-center gap-2"
          >
            {isGrant ? (
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            ) : isVesting ? (
              <svg width="12" height="12" className="text-yellow-500">
                <rect x="0" y="0" width="12" height="12" fill="currentColor" />
              </svg>
            ) : (
              <div className="w-3 h-3" style={{ backgroundColor: entry.color }} />
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
});

VestingChartLegend.displayName = 'VestingChartLegend';
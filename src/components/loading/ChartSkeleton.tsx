'use client';

import React from 'react';

interface ChartSkeletonProps {
  height?: number;
  showLegend?: boolean;
  showDetails?: boolean;
  className?: string;
}

export function ChartSkeleton({ 
  height = 540, 
  showLegend = true, 
  showDetails = true,
  className = ""
}: ChartSkeletonProps) {
  return (
    <div className={`w-full animate-pulse ${className}`}>
      {/* Chart Header */}
      <div className="mb-6">
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-md w-48 mb-3"></div>
        <div className="flex flex-wrap gap-4 mb-2">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-40"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-36"></div>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-28"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-44"></div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-gray-200 dark:border-slate-700 rounded-sm p-6 shadow-sm overflow-hidden">
        {/* Chart Area */}
        <div className="relative" style={{ height: `${height}px` }}>
          {/* Y-Axis */}
          <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between py-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-12"></div>
            ))}
          </div>
          
          {/* Chart Grid */}
          <div className="ml-16 mr-8 h-full relative">
            {/* Grid Lines */}
            <div className="absolute inset-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-full border-t border-gray-200 dark:border-slate-700" 
                  style={{ top: `${(i + 1) * 20}%` }}
                ></div>
              ))}
            </div>
            
            {/* Chart Line Path */}
            <div className="absolute inset-0 flex items-end justify-between px-4">
              {Array.from({ length: 11 }).map((_, i) => {
                const height = Math.random() * 80 + 20;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div 
                      className="w-3 h-3 bg-bitcoin-300 dark:bg-bitcoin-600 rounded-full mb-2"
                      style={{ marginBottom: `${height}%` }}
                    ></div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-6 mt-4"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Legend */}
        {showLegend && (
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-bitcoin-300 dark:bg-bitcoin-600 rounded-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-green-300 dark:bg-green-600 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Details Table */}
      {showDetails && (
        <div className="mt-6">
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-40 mb-4"></div>
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-sm overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center bg-gray-50 dark:bg-slate-700 px-4 py-3 border-b border-gray-200 dark:border-slate-600">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`${i === 0 ? 'w-16' : i === 2 ? 'flex-1' : 'w-24'} mr-4`}>
                  <div className="h-3 bg-gray-300 dark:bg-slate-600 rounded"></div>
                </div>
              ))}
            </div>
            {/* Table Rows */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className={`${j === 0 ? 'w-16' : j === 2 ? 'flex-1' : 'w-24'} mr-4`}>
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CompactChartSkeleton({ height = 300, className = "" }: { height?: number; className?: string }) {
  return (
    <div className={`w-full animate-pulse ${className}`}>
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-sm p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
        </div>
        
        <div className="relative" style={{ height: `${height}px` }}>
          <div className="absolute inset-0 flex items-end justify-between">
            {Array.from({ length: 7 }).map((_, i) => {
              const height = Math.random() * 60 + 20;
              return (
                <div key={i} className="flex flex-col items-center w-8">
                  <div 
                    className="w-2 bg-bitcoin-300 dark:bg-bitcoin-600 rounded-t" 
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HistoricalChartSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full animate-pulse ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-56 mb-3"></div>
        <div className="flex flex-wrap gap-4">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-36"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-40"></div>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="bg-white/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-sm p-8">
        {/* Desktop Timeline */}
        <div className="hidden md:block">
          <div className="relative py-8">
            <div className="absolute top-20 left-8 right-8 h-1 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
            <div className="flex justify-between items-start relative">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center min-w-0 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-12 mb-4"></div>
                  <div className="w-10 h-10 bg-gray-300 dark:bg-slate-600 rounded-full mb-8"></div>
                  <div className="space-y-2 text-center">
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-8 mx-auto"></div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-12 mx-auto"></div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-10 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-gray-200 dark:border-slate-600 rounded-sm p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-slate-600 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="bg-gray-50 dark:bg-slate-700 rounded-sm p-3">
                        <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-16 mb-2"></div>
                        <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChartSkeleton;
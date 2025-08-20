'use client';

import { Skeleton } from "@/components/ui/skeleton";

export function MetricCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 rounded-xl border-2 border-gray-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800">
          <Skeleton className="h-6 w-20 mb-3" />
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="relative h-[400px] bg-gray-50 dark:bg-slate-700/50 rounded-lg overflow-hidden">
        <Skeleton className="absolute inset-0" />
        {/* Fake chart elements */}
        <div className="absolute inset-0 p-4">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-12" />
            ))}
          </div>
          
          {/* X-axis labels */}
          <div className="absolute bottom-0 left-12 right-0 flex justify-between items-end pb-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-8" />
            ))}
          </div>
          
          {/* Chart lines/bars */}
          <div className="absolute inset-0 flex items-end justify-between p-4 pl-16 pb-8 space-x-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center space-y-1">
                <Skeleton 
                  className="w-full opacity-60"
                  style={{ height: `${Math.random() * 60 + 20}%` }}
                />
                <Skeleton 
                  className="w-full opacity-40"
                  style={{ height: `${Math.random() * 40 + 10}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center">
            <Skeleton className="h-6 w-16 mx-auto mb-1" />
            <Skeleton className="h-3 w-12 mx-auto" />
          </div>
        ))}
      </div>
      
      <div className="space-y-3 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        
        {/* Rows */}
        {[...Array(8)].map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100 dark:border-slate-700/50 last:border-b-0">
            {[...Array(6)].map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="card">
      <Skeleton className="h-6 w-40 mb-6" />
      
      <div className="space-y-6">
        {/* Form fields */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        
        {/* Button */}
        <div className="flex justify-end pt-4">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}

export function CalculatorSkeleton() {
  return (
    <div className="space-y-6">
      {/* Scheme selection */}
      <div className="card">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
        <div className="p-4 border border-bitcoin/20 rounded-xl">
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      
      {/* Configuration */}
      <div className="card">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FullPageSkeleton() {
  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Navigation skeleton */}
      <div className="sticky top-0 z-50 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Skeleton className="h-12 w-64" />
            <div className="hidden md:flex space-x-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-16" />
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-lg md:hidden" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <MetricCardsSkeleton />
          <ChartSkeleton />
          <TableSkeleton />
        </div>
      </div>
    </div>
  );
}
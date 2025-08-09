import Navigation from '@/components/Navigation';

export function ChartSkeleton() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/3 animate-pulse"></div>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
      <div className="h-96 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center animate-pulse">
        <div className="text-center text-gray-400 dark:text-slate-500">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-sm">Loading chart...</div>
        </div>
      </div>
    </div>
  );
}

export function CalculatorSkeleton() {
  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel Skeleton */}
          <div className="lg:col-span-1">
            <div className="card glass animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded mb-6 w-2/3"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border-2 rounded-xl p-5 border-gray-200 dark:border-slate-600">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-2 w-1/2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Customization Panel Skeleton */}
            <div className="card mt-6 glass animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded mb-4 w-1/2"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i}>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded mb-1 w-1/3"></div>
                    <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Panel Skeleton */}
          <div className="lg:col-span-2">
            {/* Bitcoin Price Banner Skeleton */}
            <div className="card mb-6 animate-pulse bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-slate-600 rounded-full mr-3"></div>
                  <div>
                    <div className="h-8 bg-gray-300 dark:bg-slate-600 rounded w-32 mb-1"></div>
                    <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded w-24"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-6 bg-gray-300 dark:bg-slate-600 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-300 dark:bg-slate-600 rounded w-12"></div>
                </div>
              </div>
            </div>
            
            {/* Summary Cards Skeleton */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="card text-center animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
            
            {/* Chart Skeleton */}
            <div className="card animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded mb-4 w-1/3"></div>
              <div className="h-96 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400 dark:text-slate-500">
                  <div className="text-4xl mb-2">📊</div>
                  <div className="text-sm">Loading chart...</div>
                </div>
              </div>
            </div>
            
            {/* Details Skeleton */}
            <div className="card mt-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded mb-4 w-1/4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex justify-between items-center py-2">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HistoricalSkeleton() {
  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card glass animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded mb-6 w-2/3"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border-2 rounded-xl p-5 border-gray-200 dark:border-slate-600">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-2 w-1/2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Config Panel Skeleton */}
            <div className="card glass animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded mb-4 w-2/3"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i}>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded mb-1 w-1/3"></div>
                    <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Panel Skeleton */}
          <div className="lg:col-span-2">
            {/* Summary Cards Skeleton */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="card text-center animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
            
            {/* Chart Skeleton */}
            <div className="card mb-6 animate-pulse">
              <div className="h-96 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400 dark:text-slate-500">
                  <div className="text-4xl mb-2">📈</div>
                  <div className="text-sm">Loading historical data...</div>
                </div>
              </div>
            </div>
            
            {/* Table Skeleton */}
            <div className="card animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded mb-4 w-1/4"></div>
              <div className="space-y-3">
                {/* Table header */}
                <div className="grid grid-cols-7 gap-4">
                  {[1,2,3,4,5,6,7].map(i => (
                    <div key={i} className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
                  ))}
                </div>
                {/* Table rows */}
                {[1,2,3,4,5].map(row => (
                  <div key={row} className="grid grid-cols-7 gap-4">
                    {[1,2,3,4,5,6,7].map(col => (
                      <div key={col} className="h-3 bg-gray-200 dark:bg-slate-700 rounded"></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          {/* Hero section skeleton */}
          <div className="text-center space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded w-2/3 mx-auto"></div>
            <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mx-auto"></div>
          </div>
          
          {/* Content cards skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6"></div>
                <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

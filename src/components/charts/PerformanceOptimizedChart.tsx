'use client';

import React, { 
  memo, 
  useMemo, 
  useCallback, 
  useRef, 
  useEffect, 
  useState,
  startTransition 
} from 'react';
import { useDebounce } from '@/lib/utils/debounce';
import { optimizeChartData, RECHARTS_BUNDLE_CONFIG } from './RechartsOptimized';

interface PerformanceOptimizedChartProps {
  data: any[];
  currentBitcoinPrice: number;
  isLoading?: boolean;
  height?: number;
  maxDataPoints?: number;
}

// Memoized data processing with advanced optimizations
const useOptimizedChartData = (data: any[], maxDataPoints: number = 50) => {
  return useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Use web workers for large datasets if available
    if (data.length > 1000 && 'Worker' in window) {
      // TODO: Implement web worker for data processing
      console.log('Large dataset detected, consider implementing web worker');
    }
    
    // Optimize data points based on viewport and performance
    const optimizedData = optimizeChartData(data, maxDataPoints);
    
    // Pre-calculate derived values to reduce chart re-computation
    return optimizedData.map((item, index) => ({
      ...item,
      index,
      // Pre-calculate display values
      formattedValue: item.value ? `$${(item.value / 1000).toFixed(0)}K` : '',
      // Add performance hints
      isKeyPoint: index === 0 || index === optimizedData.length - 1 || item.isSignificant,
    }));
  }, [data, maxDataPoints]);
};

// Performance-optimized chart with virtual rendering
const PerformanceOptimizedChart = memo(({
  data,
  currentBitcoinPrice,
  isLoading = false,
  height = 400,
  maxDataPoints = 50,
}: PerformanceOptimizedChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null);
  
  // Debounce expensive operations
  const debouncedData = useDebounce(data, 100);
  const optimizedData = useOptimizedChartData(debouncedData, maxDataPoints);
  
  // Intersection Observer for lazy rendering
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startTransition(() => {
            setIsVisible(true);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  // Canvas setup for high-performance rendering
  useEffect(() => {
    if (!isVisible) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = height;
    canvas.style.width = '100%';
    canvas.style.height = `${height}px`;
    
    const ctx = canvas.getContext('2d', {
      alpha: false, // Disable alpha for better performance
      desynchronized: true, // Allow desynchronized rendering
    });
    
    if (ctx && containerRef.current) {
      setCanvasContext(ctx);
      containerRef.current.appendChild(canvas);
    }
    
    return () => {
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [isVisible, height]);
  
  // Canvas rendering function
  const renderChart = useCallback(() => {
    if (!canvasContext || !optimizedData.length) return;
    
    const canvas = canvasContext.canvas;
    const { width, height } = canvas;
    
    // Clear canvas with performance optimization
    canvasContext.fillStyle = '#ffffff';
    canvasContext.fillRect(0, 0, width, height);
    
    // Calculate scales
    const maxValue = Math.max(...optimizedData.map(d => d.value || 0));
    const minValue = Math.min(...optimizedData.map(d => d.value || 0));
    const valueRange = maxValue - minValue;
    
    // Draw chart line with performance optimizations
    canvasContext.beginPath();
    canvasContext.strokeStyle = '#f7931a';
    canvasContext.lineWidth = 3;
    canvasContext.lineCap = 'round';
    canvasContext.lineJoin = 'round';
    
    optimizedData.forEach((point, index) => {
      const x = (index / (optimizedData.length - 1)) * (width - 60) + 30;
      const y = height - 30 - ((point.value - minValue) / valueRange) * (height - 60);
      
      if (index === 0) {
        canvasContext.moveTo(x, y);
      } else {
        canvasContext.lineTo(x, y);
      }
    });
    
    canvasContext.stroke();
    
    // Draw key points
    optimizedData
      .filter(d => d.isKeyPoint)
      .forEach((point, index) => {
        const x = (optimizedData.indexOf(point) / (optimizedData.length - 1)) * (width - 60) + 30;
        const y = height - 30 - ((point.value - minValue) / valueRange) * (height - 60);
        
        canvasContext.beginPath();
        canvasContext.arc(x, y, 4, 0, 2 * Math.PI);
        canvasContext.fillStyle = '#f7931a';
        canvasContext.fill();
      });
  }, [canvasContext, optimizedData]);
  
  // Trigger render when data changes
  useEffect(() => {
    if (canvasContext && isVisible) {
      // Use requestAnimationFrame for smooth rendering
      const frame = requestAnimationFrame(renderChart);
      return () => cancelAnimationFrame(frame);
    }
  }, [canvasContext, renderChart, isVisible]);
  
  // Loading state with skeleton
  if (isLoading || !isVisible) {
    return (
      <div 
        ref={containerRef}
        className="w-full bg-gray-50 dark:bg-slate-800 rounded-sm flex items-center justify-center"
        style={{ height }}
      >
        {isLoading ? (
          <div className="animate-pulse space-y-4 w-full p-8">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mx-auto"></div>
            <div className="space-y-2">
              <div className="h-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400">Chart loading...</div>
        )}
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className="w-full relative"
      style={{ height }}
    >
      {/* Chart will be rendered via canvas */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Overlay information */}
        <div className="absolute top-4 right-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-sm px-3 py-2">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Current: ${currentBitcoinPrice.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {optimizedData.length} points
          </div>
        </div>
      </div>
    </div>
  );
});

PerformanceOptimizedChart.displayName = 'PerformanceOptimizedChart';

// HOC for performance monitoring
export const withChartPerformanceTracking = (ChartComponent: React.ComponentType<any>) => {
  return memo((props: any) => {
    const [renderTime, setRenderTime] = useState(0);
    
    useEffect(() => {
      const start = performance.now();
      
      return () => {
        const end = performance.now();
        const duration = end - start;
        setRenderTime(duration);
        
        // Log slow renders in development
        if (process.env.NODE_ENV === 'development' && duration > 16) {
          console.warn(`Chart render took ${duration.toFixed(2)}ms (>16ms threshold)`);
        }
        
        // Report to analytics if available
        if (duration > 100 && typeof window !== 'undefined' && 'gtag' in window) {
          (window as any).gtag('event', 'slow_chart_render', {
            event_category: 'Performance',
            value: Math.round(duration),
          });
        }
      };
    });
    
    return (
      <>
        <ChartComponent {...props} />
        {process.env.NODE_ENV === 'development' && renderTime > 0 && (
          <div className="text-xs text-gray-400 mt-1">
            Render time: {renderTime.toFixed(2)}ms
          </div>
        )}
      </>
    );
  });
};

export default PerformanceOptimizedChart;
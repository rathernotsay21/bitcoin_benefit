// Performance monitoring utility for Bitcoin Benefit platform
// Optimized for minimal runtime overhead

import React from 'react';
// Performance monitoring types
interface PerformanceMetrics {
  value: number;
  type: 'timing' | 'count' | 'size' | 'cumulative';
  timestamp: number;
  count: number;
}

interface MemoryUsage {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor | null = null;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: Set<PerformanceObserver> = new Set();
  private isEnabled: boolean = process.env.NODE_ENV === 'development';
  // Timer tracking for proper cleanup
  private reportingIntervalId: NodeJS.Timeout | null = null;
  private intervals: Set<NodeJS.Timeout> = new Set();
  private timeouts: Set<NodeJS.Timeout> = new Set();

  private constructor() {
    if (this.isEnabled) {
      this.initializeObservers();
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers(): void {
    // Monitor for layout shifts (CLS)
    try {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift') {
            const layoutShift = entry as any;
            if (!layoutShift.hadRecentInput) {
              this.recordMetric('CLS', layoutShift.value, 'cumulative');
            }
          }
        }
      });
      layoutShiftObserver.observe({ type: 'layout-shift', buffered: true });
      this.observers.add(layoutShiftObserver);
    } catch (e) {
      // PerformanceObserver may not be available in all environments
    }

    // Monitor for Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.recordMetric('LCP', lastEntry.renderTime || lastEntry.loadTime, 'timing');
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.add(lcpObserver);
    } catch (e) {
      // PerformanceObserver may not be available in all environments
    }

    // Monitor for First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            const firstInput = entry as any;
            this.recordMetric('FID', firstInput.processingStart - firstInput.startTime, 'timing');
          }
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      this.observers.add(fidObserver);
    } catch (e) {
      // PerformanceObserver may not be available in all environments
    }
  }

  // Record a performance metric
  recordMetric(
    name: string,
    value: number,
    type: 'timing' | 'count' | 'size' | 'cumulative'
  ): void {
    if (!this.isEnabled) return;

    this.metrics.set(name, {
      value,
      type,
      timestamp: Date.now(),
      count: type === 'cumulative' ? (this.metrics.get(name)?.count || 0) + 1 : 1
    });
  }

  // Measure function execution time
  measureFunction<T extends (...args: any[]) => any>(
    fn: T,
    name: string
  ): T {
    if (!this.isEnabled) return fn;

    return ((...args: Parameters<T>) => {
      const start = performance.now();
      try {
        const result = fn(...args);
        const duration = performance.now() - start;
        this.recordMetric(`${name}_duration`, duration, 'timing');
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        this.recordMetric(`${name}_error_duration`, duration, 'timing');
        throw error;
      }
    }) as T;
  }

  // Measure async function execution time
  measureAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    name: string
  ): T {
    if (!this.isEnabled) return fn;

    return (async (...args: Parameters<T>) => {
      const start = performance.now();
      try {
        const result = await fn(...args);
        const duration = performance.now() - start;
        this.recordMetric(`${name}_duration`, duration, 'timing');
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        this.recordMetric(`${name}_error_duration`, duration, 'timing');
        throw error;
      }
    }) as T;
  }

  // Get current memory usage
  static getCurrentMemoryUsage(): MemoryUsage | null {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }

  // Get specific metric
  getMetrics(name: string): PerformanceMetrics | undefined {
    return this.metrics.get(name);
  }

  // Get all metrics
  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Start periodic reporting of metrics
   */
  startReporting(intervalMs: number = 30000): void {
    if (!this.isEnabled || this.reportingIntervalId) return;
    
    this.reportingIntervalId = setInterval(() => {
      this.reportToAnalytics();
      this.cleanupOldMetrics();
    }, intervalMs);
    
    this.intervals.add(this.reportingIntervalId);
  }

  /**
   * Stop periodic reporting
   */
  stopReporting(): void {
    if (this.reportingIntervalId) {
      clearInterval(this.reportingIntervalId);
      this.intervals.delete(this.reportingIntervalId);
      this.reportingIntervalId = null;
    }
  }

  /**
   * Clean up old metrics to prevent memory bloat
   */
  private cleanupOldMetrics(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    for (const [name, metrics] of this.metrics.entries()) {
      if (now - metrics.timestamp > maxAge) {
        this.metrics.delete(name);
      }
    }
  }

  // Clean up observers and resources
  cleanup(): void {
    // Stop periodic reporting
    this.stopReporting();
    
    // Clear all intervals
    this.intervals.forEach(intervalId => {
      clearInterval(intervalId);
    });
    this.intervals.clear();
    
    // Clear all timeouts
    this.timeouts.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    this.timeouts.clear();
    
    // Clean up observers
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    this.metrics.clear();
  }

  // Report metrics to analytics service
  reportToAnalytics(): void {
    if (!this.isEnabled || this.metrics.size === 0) return;

    // In production, this would send metrics to an analytics service
    console.log('[Performance Monitor] Current metrics:', Object.fromEntries(this.metrics));
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// High-order component decorator for measuring component performance
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  const MemoizedComponent = React.memo(WrappedComponent);
  
  return React.memo((props: P) => {
    React.useEffect(() => {
      const start = performance.now();
      
      return () => {
        const end = performance.now();
        performanceMonitor.recordMetric(`component-${componentName}`, end - start, 'timing');
      };
    });
    
    return React.createElement(MemoizedComponent, props as any);
  });
}

// Hook for measuring custom performance metrics
export function usePerformanceMetric(name: string) {
  const start = React.useRef<number>(0);
  
  const startMeasurement = React.useCallback(() => {
    start.current = performance.now();
  }, []);
  
  const endMeasurement = React.useCallback(() => {
    if (start.current > 0) {
      const end = performance.now();
      performanceMonitor.recordMetric(name, end - start.current, 'timing');
      start.current = 0;
    }
  }, [name]);
  
  return { startMeasurement, endMeasurement };
}

// Cleanup function for app unmount
export const cleanupPerformanceMonitoring = () => {
  performanceMonitor.cleanup();
};
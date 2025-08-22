// Performance monitoring utility for Bitcoin Benefit platform
// Optimized for minimal runtime overhead

import { PerformanceMetrics, PerformanceThreshold, PERFORMANCE_THRESHOLDS } from '@/types/performance-optimized';

class PerformanceMonitor {
  private static instance: PerformanceMonitor | null = null;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: Set<PerformanceObserver> = new Set();
  private isEnabled: boolean = process.env.NODE_ENV === 'development';
  
  private constructor() {
    if (typeof window !== 'undefined' && this.isEnabled) {
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
    // Monitor long tasks that block the main thread
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((entries) => {
          entries.getEntries().forEach((entry) => {
            if (entry.duration > PERFORMANCE_THRESHOLDS.renderTime) {
              this.recordMetric('long-task', {
                renderTime: entry.duration,
                bundleSize: 0,
                memoryUsage: 0,
                timestamp: Date.now()
              });
              
              if (this.isEnabled) {
                console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
              }
            }
          });
        });
        
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.add(longTaskObserver);
      } catch (e) {
        // Long task observation not supported
      }
      
      // Monitor layout shifts
      try {
        const clsObserver = new PerformanceObserver((entries) => {
          entries.getEntries().forEach((entry: any) => {
            if (entry.value > 0.1) { // CLS threshold
              this.recordMetric('layout-shift', {
                renderTime: entry.value * 1000, // Convert to ms equivalent
                bundleSize: 0,
                memoryUsage: 0,
                timestamp: Date.now()
              });
            }
          });
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.add(clsObserver);
      } catch (e) {
        // Layout shift observation not supported
      }
    }
  }
  
  /**
   * Record a performance metric with minimal overhead
   */
  recordMetric(name: string, metrics: PerformanceMetrics): void {
    if (!this.isEnabled) return;
    
    this.metrics.set(name, metrics);
    
    // Check thresholds and warn if exceeded
    if (metrics.renderTime > PERFORMANCE_THRESHOLDS.renderTime) {
      console.warn(`Performance threshold exceeded for ${name}: ${metrics.renderTime.toFixed(2)}ms render time`);
    }
    
    if (metrics.bundleSize > PERFORMANCE_THRESHOLDS.bundleSize) {
      console.warn(`Bundle size threshold exceeded for ${name}: ${(metrics.bundleSize / 1024).toFixed(2)}KB`);
    }
  }
  
  /**
   * Measure function execution time with minimal overhead
   */
  measureFunction<T extends (...args: any[]) => any>(
    name: string,
    fn: T
  ): T {
    if (!this.isEnabled) return fn;
    
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      this.recordMetric(name, {
        renderTime: end - start,
        bundleSize: 0,
        memoryUsage: this.getCurrentMemoryUsage(),
        timestamp: Date.now()
      });
      
      return result;
    }) as T;
  }
  
  /**
   * Measure async function execution time
   */
  measureAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    name: string,
    fn: T
  ): T {
    if (!this.isEnabled) return fn;
    
    return (async (...args: Parameters<T>) => {
      const start = performance.now();
      const result = await fn(...args);
      const end = performance.now();
      
      this.recordMetric(name, {
        renderTime: end - start,
        bundleSize: 0,
        memoryUsage: this.getCurrentMemoryUsage(),
        timestamp: Date.now()
      });
      
      return result;
    }) as T;
  }
  
  /**
   * Get current memory usage (if available)
   */
  private getCurrentMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }
  
  /**
   * Get performance metrics for a specific operation
   */
  getMetrics(name: string): PerformanceMetrics | null {
    return this.metrics.get(name) || null;
  }
  
  /**
   * Get all recorded metrics
   */
  getAllMetrics(): Record<string, PerformanceMetrics> {
    const result: Record<string, PerformanceMetrics> = {};
    this.metrics.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
  
  /**
   * Clear all recorded metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }
  
  /**
   * Cleanup observers
   */
  cleanup(): void {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    this.metrics.clear();
  }
  
  /**
   * Report performance metrics to analytics (if configured)
   */
  reportToAnalytics(): void {
    if (!this.isEnabled || this.metrics.size === 0) return;
    
    const metrics = this.getAllMetrics();
    
    // Report to Google Analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      Object.entries(metrics).forEach(([name, metric]) => {
        if (metric.renderTime > PERFORMANCE_THRESHOLDS.renderTime) {
          (window as any).gtag('event', 'performance_issue', {
            event_category: 'Performance',
            event_label: name,
            value: Math.round(metric.renderTime),
            custom_map: { 
              metric_name: 'render_time',
              timestamp: metric.timestamp 
            }
          });
        }
      });
    }
    
    // Report to Microsoft Clarity if available
    if (typeof window !== 'undefined' && 'clarity' in window) {
      Object.entries(metrics).forEach(([name, metric]) => {
        if (metric.renderTime > PERFORMANCE_THRESHOLDS.renderTime) {
          (window as any).clarity('event', 'performance_slow_render', {
            operation: name,
            duration: metric.renderTime,
            memory: metric.memoryUsage
          });
        }
      });
    }
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
        performanceMonitor.recordMetric(`component-${componentName}`, {
          renderTime: end - start,
          bundleSize: 0,
          memoryUsage: performanceMonitor['getCurrentMemoryUsage'](),
          timestamp: Date.now()
        });
      };
    });
    
    return React.createElement(MemoizedComponent, props);
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
      performanceMonitor.recordMetric(name, {
        renderTime: end - start.current,
        bundleSize: 0,
        memoryUsage: 0,
        timestamp: Date.now()
      });
      start.current = 0;
    }
  }, [name]);
  
  return { startMeasurement, endMeasurement };
}

// Cleanup function for app unmount
export const cleanupPerformanceMonitoring = () => {
  performanceMonitor.cleanup();
};
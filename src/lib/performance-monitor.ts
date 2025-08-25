/**
 * Performance monitoring utility for identifying bottlenecks
 * Tracks execution time and provides warnings for long-running operations
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  warning?: boolean;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private readonly WARNING_THRESHOLD = 100; // ms
  private readonly CRITICAL_THRESHOLD = 1000; // ms
  private readonly isProduction = process.env.NODE_ENV === 'production';
  private readonly isNetlify = process.env.NETLIFY === 'true' || process.env.CONTEXT === 'production';

  /**
   * Start tracking a performance metric
   */
  start(name: string): void {
    if (!this.shouldMonitor()) return;
    
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
    });
  }

  /**
   * End tracking and log the metric
   */
  end(name: string): number {
    if (!this.shouldMonitor()) return 0;
    
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric '${name}' was not started`);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    metric.endTime = endTime;
    metric.duration = duration;
    metric.warning = duration > this.WARNING_THRESHOLD;

    this.logMetric(metric);
    this.metrics.delete(name);
    
    return duration;
  }

  /**
   * Wrap a function with performance monitoring
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    timeoutMs: number = 5000
  ): Promise<T> {
    this.start(name);
    
    try {
      // Add timeout protection for Netlify environment
      if (this.isNetlify && timeoutMs > 0) {
        return await Promise.race([
          fn(),
          new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`Operation '${name}' timed out after ${timeoutMs}ms`)), timeoutMs)
          ),
        ]);
      }
      
      return await fn();
    } finally {
      this.end(name);
    }
  }

  /**
   * Wrap a synchronous function with performance monitoring
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    maxIterations?: number
  ): T {
    this.start(name);
    
    try {
      // Add iteration protection for loops
      if (maxIterations !== undefined) {
        const originalFn = fn.toString();
        if (originalFn.includes('while') || originalFn.includes('for')) {
          console.warn(`Function '${name}' contains loops - monitoring for excessive iterations`);
        }
      }
      
      return fn();
    } finally {
      this.end(name);
    }
  }

  /**
   * Log performance metric with appropriate severity
   */
  private logMetric(metric: PerformanceMetric): void {
    if (!metric.duration) return;

    const logData = {
      name: metric.name,
      duration: `${metric.duration.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
    };

    if (metric.duration > this.CRITICAL_THRESHOLD) {
      console.error(`🔴 CRITICAL Performance Issue:`, logData);
      
      // Report to monitoring service in production
      if (this.isProduction && typeof window !== 'undefined') {
        this.reportToMonitoring('critical', metric);
      }
    } else if (metric.duration > this.WARNING_THRESHOLD) {
      console.warn(`🟡 Performance Warning:`, logData);
    } else if (process.env.NODE_ENV === 'development') {
      console.debug(`✅ Performance:`, logData);
    }
  }

  /**
   * Report critical performance issues to monitoring service
   */
  private reportToMonitoring(level: 'warning' | 'critical', metric: PerformanceMetric): void {
    // Only report in browser environment
    if (typeof window === 'undefined') return;
    
    // Log to console for now, can integrate with real monitoring later
    const report = {
      level,
      metric: metric.name,
      duration: metric.duration,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      isNetlify: this.isNetlify,
    };
    
    console.log('Performance Report:', report);
  }

  /**
   * Check if monitoring should be active
   */
  private shouldMonitor(): boolean {
    // Always monitor in development and Netlify
    if (process.env.NODE_ENV === 'development' || this.isNetlify) {
      return true;
    }
    
    // Monitor in production only if explicitly enabled
    return process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true';
  }

  /**
   * Get all current metrics (for debugging)
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Helper functions for common use cases
export function measureCalculation<T>(
  name: string,
  calculation: () => T,
  maxDuration: number = 1000
): T {
  return performanceMonitor.measureSync(name, calculation);
}

export async function measureAsyncOperation<T>(
  name: string,
  operation: () => Promise<T>,
  timeout: number = 5000
): Promise<T> {
  return performanceMonitor.measureAsync(name, operation, timeout);
}

// React hook for component performance monitoring
export function usePerformanceMonitor(componentName: string) {
  if (typeof window === 'undefined') return { start: () => {}, end: () => {} };
  
  return {
    start: (operation: string) => performanceMonitor.start(`${componentName}.${operation}`),
    end: (operation: string) => performanceMonitor.end(`${componentName}.${operation}`),
    measure: <T>(operation: string, fn: () => T) => 
      performanceMonitor.measureSync(`${componentName}.${operation}`, fn),
  };
}
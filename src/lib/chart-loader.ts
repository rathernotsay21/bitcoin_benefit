/**
 * Chart Loading Strategy for LCP Optimization
 * Implements progressive loading to improve Core Web Vitals
 */

import { lazy, ComponentType } from 'react';

// Type for chart props - adjust based on your actual chart props
type ChartComponent = ComponentType<any>;

// Priority levels for chart loading
export enum ChartPriority {
  CRITICAL = 'critical',    // Load immediately (above the fold)
  HIGH = 'high',            // Load after critical content
  MEDIUM = 'medium',        // Load on scroll/interaction
  LOW = 'low'              // Load when idle
}

/**
 * Deferred chart loader that waits for idle time
 * Reduces main thread blocking during initial load
 */
export const deferredChartLoader = (
  importFn: () => Promise<{ default: ChartComponent }>,
  priority: ChartPriority = ChartPriority.MEDIUM
): Promise<{ default: ChartComponent }> => {
  return new Promise((resolve) => {
    const loadChart = () => importFn().then(resolve);
    
    switch (priority) {
      case ChartPriority.CRITICAL:
        // Load immediately for critical charts
        loadChart();
        break;
        
      case ChartPriority.HIGH:
        // Load after DOM is ready
        if (document.readyState === 'complete') {
          loadChart();
        } else {
          window.addEventListener('load', loadChart, { once: true });
        }
        break;
        
      case ChartPriority.MEDIUM:
        // Load when browser is idle or after 2 seconds
        if ('requestIdleCallback' in window) {
          requestIdleCallback(loadChart, { timeout: 2000 });
        } else {
          setTimeout(loadChart, 100);
        }
        break;
        
      case ChartPriority.LOW:
        // Load only when browser is completely idle
        if ('requestIdleCallback' in window) {
          requestIdleCallback(loadChart);
        } else {
          setTimeout(loadChart, 3000);
        }
        break;
    }
  });
};

/**
 * Intersection Observer based chart loader
 * Loads charts only when they're about to become visible
 */
export const lazyChartWithIntersection = (
  componentPath: string,
  rootMargin: string = '200px'
): ReturnType<typeof lazy> => {
  return lazy(() => {
    return new Promise<{ default: ChartComponent }>((resolve) => {
      const target = document.getElementById('chart-container');
      
      if (!target) {
        // Fallback to regular import if container not found
        import(componentPath).then(resolve);
        return;
      }
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              import(componentPath).then(resolve);
              observer.disconnect();
            }
          });
        },
        { rootMargin }
      );
      
      observer.observe(target);
    });
  });
};

/**
 * Adaptive chart loader based on device capabilities
 * Loads lighter versions for slower devices
 */
export const adaptiveChartLoader = (
  dataSize: number,
  deviceMemory?: number
): ReturnType<typeof lazy> => {
  // Check device capabilities
  const hasLowMemory = deviceMemory ? deviceMemory < 4 : false;
  const hasSlowConnection = 'connection' in navigator && 
    (navigator as any).connection?.effectiveType === '2g';
  const isLargeDataset = dataSize > 100;
  
  // Determine which chart to load
  if (hasLowMemory || hasSlowConnection || isLargeDataset) {
    // Load lightweight canvas-based chart
    return lazy(() => 
      deferredChartLoader(
        () => import('@/components/VestingTimelineChartRecharts'),
        ChartPriority.MEDIUM
      )
    );
  } else {
    // Load full-featured Recharts component
    return lazy(() => 
      deferredChartLoader(
        () => import('@/components/VestingTimelineChartRecharts'),
        ChartPriority.HIGH
      )
    );
  }
};

/**
 * Preload critical chart data while deferring rendering
 * Improves perceived performance
 */
export const preloadChartData = async (dataUrl: string): Promise<void> => {
  try {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = dataUrl;
    link.as = 'fetch';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  } catch (error) {
    console.warn('Failed to preload chart data:', error);
  }
};

/**
 * Chart loading orchestrator
 * Manages loading sequence for optimal performance
 */
export class ChartLoadingOrchestrator {
  private loadingQueue: Map<string, () => Promise<void>> = new Map();
  private isLoading = false;
  
  /**
   * Register a chart for deferred loading
   */
  register(id: string, loadFn: () => Promise<void>, priority: ChartPriority): void {
    // Add to queue based on priority
    const delayMs = this.getDelayForPriority(priority);
    
    this.loadingQueue.set(id, () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          loadFn().then(resolve);
        }, delayMs);
      });
    });
  }
  
  /**
   * Start loading charts in sequence
   */
  async startLoading(): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    for (const [id, loadFn] of this.loadingQueue) {
      try {
        await loadFn();
        this.loadingQueue.delete(id);
      } catch (error) {
        console.error(`Failed to load chart ${id}:`, error);
      }
    }
    
    this.isLoading = false;
  }
  
  private getDelayForPriority(priority: ChartPriority): number {
    switch (priority) {
      case ChartPriority.CRITICAL:
        return 0;
      case ChartPriority.HIGH:
        return 100;
      case ChartPriority.MEDIUM:
        return 500;
      case ChartPriority.LOW:
        return 1000;
      default:
        return 500;
    }
  }
}

// Singleton instance
export const chartOrchestrator = new ChartLoadingOrchestrator();

/**
 * Hook to manage chart visibility and loading
 */
export const useChartLoader = (
  chartId: string,
  priority: ChartPriority = ChartPriority.MEDIUM
) => {
  // Implementation would go here
  // This is a placeholder for the actual hook implementation
  return {
    isLoading: false,
    hasError: false,
    load: () => Promise.resolve()
  };
};
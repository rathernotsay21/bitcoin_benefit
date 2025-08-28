// Phase 3.2: Cache performance metrics tracking
export interface CacheMetrics {
  timestamp: number;
  url: string;
  cacheHit: boolean;
  loadTime: number;
  cacheType: 'static' | 'api' | 'data' | 'image' | 'font' | 'bitcoin';
  responseSize?: number;
}

export interface CachePerformanceStats {
  hitRate: number;
  avgLoadTimeWithCache: number;
  avgLoadTimeWithoutCache: number;
  totalSavings: number;
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
}

class CacheMetricsCollector {
  private metrics: CacheMetrics[] = [];
  private maxMetrics = 1000; // Store last 1000 requests
  
  // Track a cache event
  recordCacheEvent(
    url: string, 
    cacheHit: boolean, 
    loadTime: number, 
    cacheType: CacheMetrics['cacheType'],
    responseSize?: number
  ) {
    const metric: CacheMetrics = {
      timestamp: Date.now(),
      url,
      cacheHit,
      loadTime,
      cacheType,
      responseSize
    };
    
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
    
    // Log significant cache hits (for debugging in development)
    if (process.env.NODE_ENV === 'development' && cacheHit && loadTime < 50) {
      console.log(`🚀 Fast cache hit: ${url} (${loadTime}ms)`);
    }
  }
  
  // Get performance statistics
  getStats(timeWindowMs: number = 5 * 60 * 1000): CachePerformanceStats {
    const cutoffTime = Date.now() - timeWindowMs;
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoffTime);
    
    if (recentMetrics.length === 0) {
      return {
        hitRate: 0,
        avgLoadTimeWithCache: 0,
        avgLoadTimeWithoutCache: 0,
        totalSavings: 0,
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0
      };
    }
    
    const cacheHits = recentMetrics.filter(m => m.cacheHit);
    const cacheMisses = recentMetrics.filter(m => !m.cacheHit);
    
    const avgLoadTimeWithCache = cacheHits.length > 0 
      ? cacheHits.reduce((sum, m) => sum + m.loadTime, 0) / cacheHits.length
      : 0;
      
    const avgLoadTimeWithoutCache = cacheMisses.length > 0
      ? cacheMisses.reduce((sum, m) => sum + m.loadTime, 0) / cacheMisses.length
      : 0;
    
    // Calculate total time savings from cache hits
    const estimatedTimeWithoutCache = cacheHits.length * avgLoadTimeWithoutCache;
    const actualTimeWithCache = cacheHits.reduce((sum, m) => sum + m.loadTime, 0);
    const totalSavings = Math.max(0, estimatedTimeWithoutCache - actualTimeWithCache);
    
    return {
      hitRate: recentMetrics.length > 0 ? (cacheHits.length / recentMetrics.length) * 100 : 0,
      avgLoadTimeWithCache,
      avgLoadTimeWithoutCache,
      totalSavings,
      totalRequests: recentMetrics.length,
      cacheHits: cacheHits.length,
      cacheMisses: cacheMisses.length
    };
  }
  
  // Get metrics by cache type
  getStatsByType(cacheType: CacheMetrics['cacheType'], timeWindowMs: number = 5 * 60 * 1000): CachePerformanceStats {
    const cutoffTime = Date.now() - timeWindowMs;
    const relevantMetrics = this.metrics.filter(
      m => m.timestamp > cutoffTime && m.cacheType === cacheType
    );
    
    if (relevantMetrics.length === 0) {
      return {
        hitRate: 0,
        avgLoadTimeWithCache: 0,
        avgLoadTimeWithoutCache: 0,
        totalSavings: 0,
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0
      };
    }
    
    const cacheHits = relevantMetrics.filter(m => m.cacheHit);
    const cacheMisses = relevantMetrics.filter(m => !m.cacheHit);
    
    const avgLoadTimeWithCache = cacheHits.length > 0 
      ? cacheHits.reduce((sum, m) => sum + m.loadTime, 0) / cacheHits.length
      : 0;
      
    const avgLoadTimeWithoutCache = cacheMisses.length > 0
      ? cacheMisses.reduce((sum, m) => sum + m.loadTime, 0) / cacheMisses.length
      : 0;
    
    const estimatedTimeWithoutCache = cacheHits.length * avgLoadTimeWithoutCache;
    const actualTimeWithCache = cacheHits.reduce((sum, m) => sum + m.loadTime, 0);
    const totalSavings = Math.max(0, estimatedTimeWithoutCache - actualTimeWithCache);
    
    return {
      hitRate: (cacheHits.length / relevantMetrics.length) * 100,
      avgLoadTimeWithCache,
      avgLoadTimeWithoutCache,
      totalSavings,
      totalRequests: relevantMetrics.length,
      cacheHits: cacheHits.length,
      cacheMisses: cacheMisses.length
    };
  }
  
  // Export metrics for analysis
  exportMetrics(format: 'json' | 'csv' = 'json') {
    if (format === 'csv') {
      const headers = 'timestamp,url,cacheHit,loadTime,cacheType,responseSize';
      const rows = this.metrics.map(m => 
        `${m.timestamp},${m.url},${m.cacheHit},${m.loadTime},${m.cacheType},${m.responseSize || ''}`
      );
      return [headers, ...rows].join('\\n');
    }
    
    return JSON.stringify(this.metrics, null, 2);
  }
  
  // Clear metrics
  clear() {
    this.metrics = [];
  }
  
  // Get recent cache performance summary
  getPerformanceSummary() {
    const stats = this.getStats();
    const bitcoinStats = this.getStatsByType('bitcoin');
    const staticStats = this.getStatsByType('static');
    
    return {
      overall: stats,
      bitcoin: bitcoinStats,
      static: staticStats,
      improved300ms: stats.avgLoadTimeWithCache > 0 && 
                    stats.avgLoadTimeWithoutCache > 0 && 
                    (stats.avgLoadTimeWithoutCache - stats.avgLoadTimeWithCache) >= 300
    };
  }
}

// Global instance
export const cacheMetrics = new CacheMetricsCollector();

// Utility functions for measuring cache performance
export function measureCachePerformance<T>(
  operation: () => Promise<T>,
  url: string,
  cacheType: CacheMetrics['cacheType'],
  fromCache: boolean = false
): Promise<T> {
  const startTime = performance.now();
  
  return operation().then(result => {
    const loadTime = performance.now() - startTime;
    cacheMetrics.recordCacheEvent(url, fromCache, loadTime, cacheType);
    return result;
  }).catch(error => {
    const loadTime = performance.now() - startTime;
    cacheMetrics.recordCacheEvent(url, false, loadTime, cacheType);
    throw error;
  });
}

// Hook to automatically track fetch requests for cache performance
export function instrumentFetchForCacheMetrics() {
  if (typeof window === 'undefined') return;
  
  const originalFetch = window.fetch;
  
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const startTime = performance.now();
    
    return originalFetch(input, init).then(response => {
      const loadTime = performance.now() - startTime;
      
      // Determine if response came from cache
      const fromCache = response.headers.get('sw-fetch-time') !== null;
      
      // Determine cache type based on URL
      let cacheType: CacheMetrics['cacheType'] = 'api';
      if (url.includes('/api/bitcoin') || url.includes('coingecko') || url.includes('mempool')) {
        cacheType = 'bitcoin';
      } else if (url.includes('/_next/static/') || url.endsWith('.js') || url.endsWith('.css')) {
        cacheType = 'static';
      } else if (url.includes('/data/')) {
        cacheType = 'data';
      } else if (url.match(/\\.(jpg|jpeg|png|gif|svg|webp|ico|avif)$/i)) {
        cacheType = 'image';
      } else if (url.includes('fonts.') || url.match(/\\.(woff|woff2|ttf|eot)$/i)) {
        cacheType = 'font';
      }
      
      // Get response size if available
      const responseSize = response.headers.get('content-length') 
        ? parseInt(response.headers.get('content-length')!)
        : undefined;
      
      cacheMetrics.recordCacheEvent(url, fromCache, loadTime, cacheType, responseSize);
      
      return response;
    });
  };
}

// Initialize cache metrics tracking in browser
if (typeof window !== 'undefined') {
  // Add global function for debugging cache performance
  (window as any).getCacheMetrics = () => cacheMetrics.getPerformanceSummary();
  (window as any).exportCacheMetrics = (format?: 'json' | 'csv') => cacheMetrics.exportMetrics(format);
  (window as any).clearCacheMetrics = () => cacheMetrics.clear();
  
  // Auto-instrument fetch if not in development
  if (process.env.NODE_ENV !== 'development') {
    instrumentFetchForCacheMetrics();
  }
}
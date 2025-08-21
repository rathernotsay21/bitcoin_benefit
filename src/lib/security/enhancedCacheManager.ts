import { LRUCache } from 'lru-cache';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  etag?: string;
  staleWhileRevalidate?: number;
  revalidating?: boolean;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  staleWhileRevalidate: number;
  compressionThreshold?: number;
}

export class EnhancedCacheManager {
  private caches: Map<string, LRUCache<string, CacheEntry<any>>> = new Map();
  private configs: Map<string, CacheConfig> = new Map();
  private revalidationQueue: Set<string> = new Set();

  constructor() {
    // Initialize default cache configurations
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs(): void {
    // Bitcoin price cache - short TTL for real-time data
    this.configs.set('bitcoin-price', {
      maxSize: 100,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      staleWhileRevalidate: 10 * 60 * 1000 // 10 minutes
    });

    // Historical price cache - longer TTL for static data
    this.configs.set('historical-price', {
      maxSize: 1000,
      defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
      staleWhileRevalidate: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Transaction cache - medium TTL
    this.configs.set('transactions', {
      maxSize: 500,
      defaultTTL: 10 * 60 * 1000, // 10 minutes
      staleWhileRevalidate: 30 * 60 * 1000 // 30 minutes
    });

    // Network status cache - very short TTL
    this.configs.set('network-status', {
      maxSize: 50,
      defaultTTL: 30 * 1000, // 30 seconds
      staleWhileRevalidate: 60 * 1000 // 1 minute
    });

    // Fee recommendations cache
    this.configs.set('fee-recommendations', {
      maxSize: 50,
      defaultTTL: 60 * 1000, // 1 minute
      staleWhileRevalidate: 5 * 60 * 1000 // 5 minutes
    });
  }

  /**
   * Get or create a cache for a specific namespace
   */
  private getCache(namespace: string): LRUCache<string, CacheEntry<any>> {
    if (!this.caches.has(namespace)) {
      const config = this.configs.get(namespace) || {
        maxSize: 100,
        defaultTTL: 5 * 60 * 1000,
        staleWhileRevalidate: 10 * 60 * 1000
      };

      const cache = new LRUCache<string, CacheEntry<any>>({
        max: config.maxSize,
        ttl: config.defaultTTL,
        updateAgeOnGet: false,
        updateAgeOnHas: false
      });

      this.caches.set(namespace, cache);
    }

    return this.caches.get(namespace)!;
  }

  /**
   * Get cached data with stale-while-revalidate support
   */
  async get<T>(
    namespace: string,
    key: string,
    fetcher?: () => Promise<T>,
    options?: {
      ttl?: number;
      staleWhileRevalidate?: number;
      force?: boolean;
    }
  ): Promise<T | null> {
    const cache = this.getCache(namespace);
    const config = this.configs.get(namespace) || this.configs.get('bitcoin-price')!;
    
    // Force refresh if requested
    if (options?.force) {
      cache.delete(key);
    }

    const entry = cache.get(key);
    const now = Date.now();

    // No entry found
    if (!entry) {
      if (!fetcher) return null;
      
      // Fetch and cache new data
      try {
        const data = await fetcher();
        this.set(namespace, key, data, options);
        return data;
      } catch (error) {
        console.error(`Failed to fetch data for ${namespace}:${key}`, error);
        return null;
      }
    }

    const age = now - entry.timestamp;
    const isStale = age > entry.ttl;
    const isWithinSWR = age < (entry.staleWhileRevalidate || config.staleWhileRevalidate);

    // Data is fresh
    if (!isStale) {
      return entry.data;
    }

    // Data is stale but within stale-while-revalidate window
    if (isWithinSWR && fetcher) {
      // Return stale data immediately
      const staleData = entry.data;

      // Revalidate in background if not already revalidating
      const revalidationKey = `${namespace}:${key}`;
      if (!this.revalidationQueue.has(revalidationKey) && !entry.revalidating) {
        this.revalidationQueue.add(revalidationKey);
        entry.revalidating = true;

        // Background revalidation
        fetcher()
          .then(freshData => {
            this.set(namespace, key, freshData, options);
          })
          .catch(error => {
            console.error(`Background revalidation failed for ${namespace}:${key}`, error);
          })
          .finally(() => {
            this.revalidationQueue.delete(revalidationKey);
            entry.revalidating = false;
          });
      }

      return staleData;
    }

    // Data is too stale, fetch new data
    if (fetcher) {
      try {
        const data = await fetcher();
        this.set(namespace, key, data, options);
        return data;
      } catch (error) {
        console.error(`Failed to fetch fresh data for ${namespace}:${key}`, error);
        // Return stale data as fallback if available
        return entry.data;
      }
    }

    // No fetcher provided and data is stale
    return null;
  }

  /**
   * Set cached data
   */
  set<T>(
    namespace: string,
    key: string,
    data: T,
    options?: {
      ttl?: number;
      staleWhileRevalidate?: number;
      etag?: string;
    }
  ): void {
    const cache = this.getCache(namespace);
    const config = this.configs.get(namespace) || this.configs.get('bitcoin-price')!;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: options?.ttl || config.defaultTTL,
      staleWhileRevalidate: options?.staleWhileRevalidate || config.staleWhileRevalidate,
      etag: options?.etag
    };

    cache.set(key, entry);
  }

  /**
   * Delete cached data
   */
  delete(namespace: string, key?: string): void {
    const cache = this.getCache(namespace);
    
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  }

  /**
   * Clear all caches or a specific namespace
   */
  clear(namespace?: string): void {
    if (namespace) {
      const cache = this.caches.get(namespace);
      if (cache) {
        cache.clear();
      }
    } else {
      for (const cache of this.caches.values()) {
        cache.clear();
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(namespace?: string): Record<string, any> {
    if (namespace) {
      const cache = this.caches.get(namespace);
      if (!cache) return {};

      return {
        namespace,
        size: cache.size,
        maxSize: cache.max,
        calculatedSize: cache.calculatedSize
      };
    }

    const stats: Record<string, any> = {};
    
    for (const [ns, cache] of this.caches) {
      stats[ns] = {
        size: cache.size,
        maxSize: cache.max,
        calculatedSize: cache.calculatedSize
      };
    }
    
    return stats;
  }

  /**
   * Preload cache with data
   */
  async preload<T>(
    namespace: string,
    entries: Array<{
      key: string;
      fetcher: () => Promise<T>;
      options?: {
        ttl?: number;
        staleWhileRevalidate?: number;
      };
    }>
  ): Promise<void> {
    const promises = entries.map(async ({ key, fetcher, options }) => {
      try {
        const data = await fetcher();
        this.set(namespace, key, data, options);
      } catch (error) {
        console.error(`Failed to preload ${namespace}:${key}`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Check if data exists and is fresh
   */
  isFresh(namespace: string, key: string): boolean {
    const cache = this.getCache(namespace);
    const entry = cache.get(key);
    
    if (!entry) return false;
    
    const age = Date.now() - entry.timestamp;
    return age <= entry.ttl;
  }

  /**
   * Get remaining TTL for cached data
   */
  getTTL(namespace: string, key: string): number {
    const cache = this.getCache(namespace);
    const entry = cache.get(key);
    
    if (!entry) return 0;
    
    const age = Date.now() - entry.timestamp;
    const remaining = entry.ttl - age;
    
    return Math.max(0, remaining);
  }

  /**
   * Update cache configuration
   */
  updateConfig(namespace: string, config: Partial<CacheConfig>): void {
    const currentConfig = this.configs.get(namespace) || {
      maxSize: 100,
      defaultTTL: 5 * 60 * 1000,
      staleWhileRevalidate: 10 * 60 * 1000
    };
    
    this.configs.set(namespace, {
      ...currentConfig,
      ...config
    });

    // If cache exists and maxSize changed, recreate the cache
    if (config.maxSize && this.caches.has(namespace)) {
      const oldCache = this.caches.get(namespace)!;
      const newCache = new LRUCache<string, CacheEntry<any>>({
        max: config.maxSize,
        ttl: currentConfig.defaultTTL,
        updateAgeOnGet: false,
        updateAgeOnHas: false
      });
      
      // Transfer existing entries to new cache
      for (const [key, value] of oldCache.entries()) {
        newCache.set(key, value);
      }
      
      this.caches.set(namespace, newCache);
    }
  }
}

// Export singleton instance
export const enhancedCacheManager = new EnhancedCacheManager();

// Export convenience functions
export async function getCachedData<T>(
  namespace: string,
  key: string,
  fetcher?: () => Promise<T>,
  options?: {
    ttl?: number;
    staleWhileRevalidate?: number;
    force?: boolean;
  }
): Promise<T | null> {
  return enhancedCacheManager.get(namespace, key, fetcher, options);
}

export function setCachedData<T>(
  namespace: string,
  key: string,
  data: T,
  options?: {
    ttl?: number;
    staleWhileRevalidate?: number;
    etag?: string;
  }
): void {
  enhancedCacheManager.set(namespace, key, data, options);
}

export function clearCache(namespace?: string): void {
  enhancedCacheManager.clear(namespace);
}

export function getCacheStats(namespace?: string): Record<string, any> {
  return enhancedCacheManager.getStats(namespace);
}
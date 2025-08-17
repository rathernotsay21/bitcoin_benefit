interface BitcoinPriceResponse {
  bitcoin: {
    usd: number;
    usd_24h_change: number;
  };
}

interface CachedPrice {
  price: number;
  change24h: number;
  timestamp: number;
}

export class OptimizedBitcoinAPI {
  private static readonly BASE_URL = 'https://api.coingecko.com/api/v3';
  private static readonly CACHE_KEY = 'btc_price_cache';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static readonly FALLBACK_PRICE = 45000;
  
  // In-memory cache for server-side requests
  private static memoryCache: CachedPrice | null = null;

  static async getCurrentPrice(): Promise<{ price: number; change24h: number }> {
    // Try to get cached price first (stale-while-revalidate pattern)
    const cached = this.getCachedPrice();
    
    if (cached) {
      // Return cached immediately and fetch in background if stale
      if (this.isCacheStale(cached)) {
        this.fetchAndUpdatePrice().catch(error => {
          console.warn('Background price update failed:', error);
        });
      }
      return { price: cached.price, change24h: cached.change24h };
    }
    
    // No cache available, fetch synchronously
    return this.fetchAndUpdatePrice();
  }

  private static getCachedPrice(): CachedPrice | null {
    // Try memory cache first (for server-side)
    if (this.memoryCache && !this.isCacheStale(this.memoryCache)) {
      return this.memoryCache;
    }

    // Try localStorage (for client-side)
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(this.CACHE_KEY);
        if (cached) {
          const data: CachedPrice = JSON.parse(cached);
          // Update memory cache
          this.memoryCache = data;
          return data;
        }
      } catch (error) {
        console.warn('Failed to read price cache:', error);
      }
    }

    return null;
  }

  private static isCacheStale(cached: CachedPrice): boolean {
    return Date.now() - cached.timestamp > this.CACHE_DURATION;
  }

  private static async fetchAndUpdatePrice(): Promise<{ price: number; change24h: number }> {
    // Create abort controller for timeout support across all browsers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000); // 10 second timeout

    try {
      const response = await fetch(
        `${this.BASE_URL}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        }
      );

      // Clear timeout on successful response
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BitcoinPriceResponse = await response.json();
      const priceData: CachedPrice = {
        price: data.bitcoin.usd,
        change24h: data.bitcoin.usd_24h_change,
        timestamp: Date.now(),
      };

      // Update both memory and localStorage cache
      this.updateCache(priceData);

      return { price: priceData.price, change24h: priceData.change24h };
    } catch (error) {
      // Clear timeout on error
      clearTimeout(timeoutId);
      
      // Handle specific abort error
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Bitcoin price fetch timed out after 10 seconds');
      } else {
        console.warn('Failed to fetch Bitcoin price:', error);
      }
      
      // Try to return cached data even if stale
      const staleCache = this.getCachedPrice();
      if (staleCache) {
        console.warn('Using stale cache data due to fetch failure');
        return { price: staleCache.price, change24h: staleCache.change24h };
      }

      // Return fallback price if all else fails
      return { price: this.FALLBACK_PRICE, change24h: 0 };
    }
  }

  private static updateCache(priceData: CachedPrice): void {
    // Update memory cache
    this.memoryCache = priceData;

    // Update localStorage cache (client-side only)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(priceData));
      } catch (error) {
        console.warn('Failed to update price cache:', error);
      }
    }
  }

  /**
   * Get the build-time Bitcoin price from static data as fallback
   */
  static async getStaticPrice(): Promise<{ price: number; change24h: number }> {
    try {
      const response = await fetch('/data/bitcoin-price.json', {
        credentials: 'same-origin',
        mode: 'cors'
      });
      if (response.ok) {
        const data = await response.json();
        return { price: data.price, change24h: data.change24h };
      }
    } catch (error) {
      console.warn('Failed to load static price data:', error);
    }
    
    return { price: this.FALLBACK_PRICE, change24h: 0 };
  }

  /**
   * Initialize with static data then upgrade to live data
   */
  static async initializeWithStaticData(): Promise<{ price: number; change24h: number }> {
    // Load static data first for instant display
    const staticData = await this.getStaticPrice();
    
    // Cache static data temporarily
    this.updateCache({
      ...staticData,
      timestamp: Date.now() - this.CACHE_DURATION + 1000, // Mark as slightly stale
    });

    // Start background fetch for live data
    this.getCurrentPrice().catch(error => {
      console.warn('Background live price fetch failed:', error);
    });

    return staticData;
  }

  /**
   * Clear all caches (useful for testing)
   */
  static clearCache(): void {
    this.memoryCache = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.CACHE_KEY);
      } catch (error) {
        console.warn('Failed to clear price cache:', error);
      }
    }
  }

  /**
   * Get cache stats for debugging
   */
  static getCacheStats(): {
    hasMemoryCache: boolean;
    hasLocalStorageCache: boolean;
    isStale: boolean;
    age: number;
  } {
    const memoryCache = this.memoryCache;
    let localStorageCache = null;
    
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(this.CACHE_KEY);
        if (cached) {
          localStorageCache = JSON.parse(cached);
        }
      } catch (error) {
        // Ignore
      }
    }

    const newestCache = memoryCache || localStorageCache;
    
    return {
      hasMemoryCache: !!memoryCache,
      hasLocalStorageCache: !!localStorageCache,
      isStale: newestCache ? this.isCacheStale(newestCache) : true,
      age: newestCache ? Date.now() - newestCache.timestamp : 0,
    };
  }
}

// Re-export the original API for backwards compatibility
export { BitcoinAPI } from './bitcoin-api';

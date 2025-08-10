import { RawTransaction } from '@/types/on-chain';
import { HistoricalBitcoinAPI } from '@/lib/historical-bitcoin-api';

interface CoinGeckoHistoricalResponse {
  prices: [number, number][];
}

interface CachedPriceData {
  price: number;
  timestamp: number;
}

interface BatchPriceRequest {
  date: string;
  resolve: (price: number) => void;
  reject: (error: Error) => void;
}

export class OnChainPriceFetcher {
  private static readonly BASE_URL = '/api/coingecko';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly BATCH_DELAY = 100; // 100ms delay for batching
  private static readonly MAX_BATCH_SIZE = 5; // Reduced batch size to avoid rate limits
  private static readonly MIN_REQUEST_INTERVAL = 1000; // Minimum 1 second between API calls
  private static lastRequestTime = 0;
  
  // Session-based cache for price data
  private static cache: Map<string, CachedPriceData> = new Map();
  
  // Batching mechanism
  private static batchQueue: BatchPriceRequest[] = [];
  private static batchTimeout: NodeJS.Timeout | null = null;

  /**
   * Fetches historical Bitcoin prices for multiple dates in batch
   * Optimizes API calls by combining requests for unique dates
   */
  static async fetchBatchPrices(dates: string[]): Promise<Record<string, number>> {
    const uniqueDates = Array.from(new Set(dates));
    const results: Record<string, number> = {};
    const uncachedDates: string[] = [];

    // Check cache first for each date
    for (const date of uniqueDates) {
      const cached = this.getCachedPrice(date);
      if (cached !== null) {
        results[date] = cached;
      } else {
        uncachedDates.push(date);
      }
    }

    // If all dates are cached, return immediately
    if (uncachedDates.length === 0) {
      return results;
    }

    // Fetch uncached dates in batches
    const batchPromises: Promise<void>[] = [];
    for (let i = 0; i < uncachedDates.length; i += this.MAX_BATCH_SIZE) {
      const batch = uncachedDates.slice(i, i + this.MAX_BATCH_SIZE);
      batchPromises.push(
        this.fetchBatchFromAPI(batch).then(batchResults => {
          Object.assign(results, batchResults);
        })
      );
    }

    await Promise.all(batchPromises);
    return results;
  }

  /**
   * Fetches historical Bitcoin price for a specific date
   */
  static async fetchPriceForDate(date: string): Promise<number> {
    // Check cache first
    const cached = this.getCachedPrice(date);
    if (cached !== null) {
      return cached;
    }

    // Use batch mechanism for single requests to optimize potential concurrent calls
    return new Promise<number>((resolve, reject) => {
      this.batchQueue.push({ date, resolve, reject });
      
      // Set up batch processing if not already scheduled
      if (this.batchTimeout === null) {
        this.batchTimeout = setTimeout(() => {
          this.processBatch();
        }, this.BATCH_DELAY);
      }
    });
  }

  /**
   * Optimizes price requests by extracting unique dates from transactions
   */
  static optimizePriceRequests(transactions: RawTransaction[]): string[] {
    const uniqueDates = new Set<string>();
    
    for (const tx of transactions) {
      if (tx.status.confirmed && tx.status.block_time) {
        const date = new Date(tx.status.block_time * 1000).toISOString().split('T')[0];
        uniqueDates.add(date);
      }
    }
    
    return Array.from(uniqueDates).sort();
  }

  /**
   * Processes the current batch queue
   */
  private static async processBatch(): Promise<void> {
    const currentBatch = [...this.batchQueue];
    this.batchQueue = [];
    this.batchTimeout = null;

    if (currentBatch.length === 0) {
      return;
    }

    // Group by unique dates
    const dateMap = new Map<string, BatchPriceRequest[]>();
    for (const request of currentBatch) {
      if (!dateMap.has(request.date)) {
        dateMap.set(request.date, []);
      }
      dateMap.get(request.date)!.push(request);
    }

    const uniqueDates = Array.from(dateMap.keys());

    // Process each date individually to handle partial failures
    for (const date of uniqueDates) {
      const requests = dateMap.get(date)!;
      try {
        const price = await this.fetchSingleDateFromAPI(date);
        this.setCachedPrice(date, price);
        requests.forEach(req => req.resolve(price));
      } catch (error) {
        requests.forEach(req => req.reject(error as Error));
      }
    }
  }

  /**
   * Fetches prices for a batch of dates from the API
   */
  private static async fetchBatchFromAPI(dates: string[]): Promise<Record<string, number>> {
    const results: Record<string, number> = {};
    
    // Process dates in smaller chunks to avoid overwhelming the API
    for (const date of dates) {
      try {
        const price = await this.fetchSingleDateFromAPI(date);
        results[date] = price;
        this.setCachedPrice(date, price);
      } catch (error) {
        console.error(`Error fetching price for date ${date}:`, error);
        // Try to get fallback price
        const fallbackPrice = this.getFallbackPrice(date);
        if (fallbackPrice !== null) {
          results[date] = fallbackPrice;
          this.setCachedPrice(date, fallbackPrice);
        }
        // If no fallback available, skip this date (don't add to results)
      }
    }

    return results;
  }

  /**
   * Fetches price for a single date from CoinGecko API with rate limiting
   */
  private static async fetchSingleDateFromAPI(date: string, retryCount = 0): Promise<number> {
    // Implement rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();

    const targetDate = new Date(date);
    const dayBefore = new Date(targetDate);
    dayBefore.setDate(dayBefore.getDate() - 1);
    const dayAfter = new Date(targetDate);
    dayAfter.setDate(dayAfter.getDate() + 1);

    // Convert to Unix timestamps (seconds)
    const fromTimestamp = Math.floor(dayBefore.getTime() / 1000);
    const toTimestamp = Math.floor(dayAfter.getTime() / 1000);

    const url = `${this.BASE_URL}?vs_currency=usd&from=${fromTimestamp}&to=${toTimestamp}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.status === 429 && retryCount < 3) {
      // Rate limited - use exponential backoff
      const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.warn(`Rate limited, retrying after ${backoffTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      return this.fetchSingleDateFromAPI(date, retryCount + 1);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CoinGeckoHistoricalResponse = await response.json();
    
    if (!data.prices || data.prices.length === 0) {
      throw new Error(`No price data available for date ${date}`);
    }

    // Find the price closest to the target date
    const targetTimestamp = targetDate.getTime();
    let closestPrice = data.prices[0][1];
    let closestDiff = Math.abs(data.prices[0][0] - targetTimestamp);

    for (const [timestamp, price] of data.prices) {
      const diff = Math.abs(timestamp - targetTimestamp);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestPrice = price;
      }
    }

    return Math.round(closestPrice * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Gets cached price for a date if available and not expired
   */
  private static getCachedPrice(date: string): number | null {
    const cached = this.cache.get(date);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.price;
    }
    return null;
  }

  /**
   * Sets cached price for a date
   */
  private static setCachedPrice(date: string, price: number): void {
    this.cache.set(date, {
      price,
      timestamp: Date.now()
    });
  }

  /**
   * Gets fallback price for a date when API fails
   * Uses consistent fallback data with HistoricalBitcoinAPI
   */
  private static getFallbackPrice(date: string): number | null {
    // Parse year directly from the date string to avoid timezone issues
    const year = parseInt(date.split('-')[0], 10);

    // Use the same fallback prices as HistoricalBitcoinAPI for consistency
    const fallbackPrices: Record<number, number> = {
      2015: 264,
      2016: 574,
      2017: 4951,
      2018: 7532,
      2019: 7179,
      2020: 11111,
      2021: 47686,
      2022: 31717,
      2023: 29234,
      2024: 65000,
      2025: 105000,
    };

    return fallbackPrices[year] || null;
  }

  /**
   * Clears the price cache (useful for testing)
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Gets cache statistics for debugging
   */
  static getCacheStats(): { size: number; dates: string[] } {
    return {
      size: this.cache.size,
      dates: Array.from(this.cache.keys()).sort()
    };
  }

  /**
   * Clears any pending batch operations (useful for testing)
   */
  static clearBatchQueue(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    this.batchQueue = [];
    this.lastRequestTime = 0; // Reset rate limiting
  }
}
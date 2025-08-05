import { BitcoinYearlyPrices } from '@/types/vesting';

interface CoinGeckoHistoricalResponse {
  prices: [number, number][];
}

interface CachedYearlyData {
  data: BitcoinYearlyPrices;
  timestamp: number;
}

export class HistoricalBitcoinAPI {
  private static readonly BASE_URL = 'https://api.coingecko.com/api/v3';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static cache: Map<number, CachedYearlyData> = new Map();

  /**
   * Fetches yearly price data for a range of years
   */
  static async getYearlyPrices(startYear: number, endYear: number): Promise<Record<number, BitcoinYearlyPrices>> {
    const currentYear = new Date().getFullYear();
    const validStartYear = Math.max(2015, Math.min(startYear, currentYear));
    const validEndYear = Math.max(validStartYear, Math.min(endYear, currentYear));

    const results: Record<number, BitcoinYearlyPrices> = {};
    const promises: Promise<void>[] = [];

    for (let year = validStartYear; year <= validEndYear; year++) {
      promises.push(
        this.getYearlyPrice(year).then(yearlyPrice => {
          results[year] = yearlyPrice;
        })
      );
    }

    await Promise.all(promises);
    return results;
  }

  /**
   * Fetches yearly price data for a specific year
   */
  static async getYearlyPrice(year: number): Promise<BitcoinYearlyPrices> {
    const currentYear = new Date().getFullYear();
    
    // Validate year range
    if (year < 2015 || year > currentYear) {
      throw new Error(`Year ${year} is outside the valid range (2015-${currentYear})`);
    }

    // Check cache first
    const cached = this.cache.get(year);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const yearlyData = await this.fetchYearlyDataFromAPI(year);
      
      // Cache the result
      this.cache.set(year, {
        data: yearlyData,
        timestamp: Date.now()
      });

      return yearlyData;
    } catch (error) {
      console.error(`Error fetching Bitcoin price data for year ${year}:`, error);
      
      // Try to return cached data even if expired
      if (cached) {
        console.warn(`Using expired cache data for year ${year}`);
        return cached.data;
      }

      // Return fallback data if no cache available
      return this.getFallbackData(year);
    }
  }

  /**
   * Fetches historical data from CoinGecko API for a specific year
   */
  private static async fetchYearlyDataFromAPI(year: number): Promise<BitcoinYearlyPrices> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    // Convert to Unix timestamps (seconds)
    const fromTimestamp = Math.floor(startDate.getTime() / 1000);
    const toTimestamp = Math.floor(endDate.getTime() / 1000);

    const url = `${this.BASE_URL}/coins/bitcoin/market_chart/range?vs_currency=usd&from=${fromTimestamp}&to=${toTimestamp}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CoinGeckoHistoricalResponse = await response.json();
    return this.formatCoinGeckoData(data, year);
  }

  /**
   * Formats CoinGecko API response into our BitcoinYearlyPrices format
   */
  private static formatCoinGeckoData(data: CoinGeckoHistoricalResponse, year: number): BitcoinYearlyPrices {
    if (!data.prices || data.prices.length === 0) {
      throw new Error(`No price data available for year ${year}`);
    }

    const prices = data.prices.map(([, price]) => price);
    
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    // First and last prices of the year
    const open = data.prices[0][1];
    const close = data.prices[data.prices.length - 1][1];

    return {
      year,
      high: Math.round(high * 100) / 100, // Round to 2 decimal places
      low: Math.round(low * 100) / 100,
      average: Math.round(average * 100) / 100,
      open: Math.round(open * 100) / 100,
      close: Math.round(close * 100) / 100,
    };
  }

  /**
   * Returns fallback data when API is unavailable
   */
  private static getFallbackData(year: number): BitcoinYearlyPrices {
    // Approximate historical Bitcoin prices for fallback
    const fallbackPrices: Record<number, Partial<BitcoinYearlyPrices>> = {
      2015: { high: 504, low: 152, average: 264, open: 314, close: 430 },
      2016: { high: 975, low: 365, average: 574, open: 430, close: 963 },
      2017: { high: 19783, low: 775, average: 4951, open: 963, close: 13880 },
      2018: { high: 17527, low: 3191, average: 7532, open: 13880, close: 3742 },
      2019: { high: 13016, low: 3391, average: 7179, open: 3742, close: 7179 },
      2020: { high: 28994, low: 4106, average: 11111, open: 7179, close: 28994 },
      2021: { high: 68789, low: 28994, average: 47686, open: 28994, close: 46306 },
      2022: { high: 48086, low: 15460, average: 31717, open: 46306, close: 16547 },
      2023: { high: 44700, low: 15460, average: 29234, open: 16547, close: 42258 },
    };

    const fallback = fallbackPrices[year];
    if (fallback) {
      return {
        year,
        high: fallback.high!,
        low: fallback.low!,
        average: fallback.average!,
        open: fallback.open!,
        close: fallback.close!,
      };
    }

    // For years not in fallback data, estimate based on current year
    const currentYear = new Date().getFullYear();
    const estimatedPrice = year <= currentYear ? 30000 : 50000; // Conservative estimates
    
    return {
      year,
      high: estimatedPrice * 1.5,
      low: estimatedPrice * 0.5,
      average: estimatedPrice,
      open: estimatedPrice,
      close: estimatedPrice,
    };
  }

  /**
   * Clears the cache (useful for testing or forcing fresh data)
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Gets cache statistics for debugging
   */
  static getCacheStats(): { size: number; years: number[] } {
    return {
      size: this.cache.size,
      years: Array.from(this.cache.keys()).sort()
    };
  }
}
interface BitcoinPriceResponse {
  bitcoin: {
    usd: number;
    usd_24h_change: number;
  };
}

export class BitcoinAPI {
  private static readonly BASE_URL = 'https://api.coingecko.com/api/v3';
  private static cache: { price: number; change24h: number; timestamp: number } | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async getCurrentPrice(): Promise<{ price: number; change24h: number }> {
    // Check cache first
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_DURATION) {
      return { price: this.cache.price, change24h: this.cache.change24h };
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            'Accept': 'application/json',
          },
          // Add timeout for better error handling
          ...(typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? 
            { signal: AbortSignal.timeout(10000) } : {})
        }
      );

      if (!response.ok) {
        console.warn(`Bitcoin API returned ${response.status}, using fallback price`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BitcoinPriceResponse = await response.json();
      const price = data.bitcoin.usd;
      const change24h = data.bitcoin.usd_24h_change;

      // Validate the data
      if (typeof price !== 'number' || price <= 0) {
        throw new Error('Invalid price data received from API');
      }

      // Update cache
      this.cache = {
        price,
        change24h: change24h || 0,
        timestamp: Date.now(),
      };

      return { price, change24h: change24h || 0 };
    } catch (error) {
      console.warn('Using fallback Bitcoin price due to API error:', error);
      
      // Use a reasonable current fallback price (as of early 2025)
      const fallbackPrice = 105000;
      const fallbackChange = 2.5;
      
      // Update cache with fallback to avoid repeated API calls
      this.cache = {
        price: fallbackPrice,
        change24h: fallbackChange,
        timestamp: Date.now(),
      };
      
      return { price: fallbackPrice, change24h: fallbackChange };
    }
  }
}
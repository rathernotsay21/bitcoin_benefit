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
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BitcoinPriceResponse = await response.json();
      const price = data.bitcoin.usd;
      const change24h = data.bitcoin.usd_24h_change;

      // Update cache
      this.cache = {
        price,
        change24h,
        timestamp: Date.now(),
      };

      return { price, change24h };
    } catch (error) {
      console.error('Error fetching Bitcoin price:', error);
      // Return fallback price if API fails
      return { price: 45000, change24h: 0 };
    }
  }
}
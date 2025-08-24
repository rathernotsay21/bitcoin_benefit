import { NextRequest, NextResponse } from 'next/server';
import { withCachedResponse, CACHE_CONFIGS } from '@/lib/api/cache-wrapper';

// Optimized Bitcoin price API with memory caching
export async function GET(_request: NextRequest): Promise<Response> {
  return withCachedResponse(
    'bitcoin-price',
    async () => {
      // Fetch current price from CoinGecko simple price API
      const coinGeckoUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
      
      const response = await fetch(coinGeckoUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Bitcoin-Benefit/1.0'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        console.warn('CoinGecko API failed with status:', response.status);
        throw new Error(`CoinGecko API returned status ${response.status}`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data || !data.bitcoin || typeof data.bitcoin.usd !== 'number') {
        console.warn('Invalid CoinGecko response format');
        throw new Error('Invalid response format from CoinGecko');
      }

      // Return structured data
      return {
        bitcoin: { usd: data.bitcoin.usd },
        source: 'coingecko',
        timestamp: Date.now()
      };
    },
    CACHE_CONFIGS.bitcoinPrice
  ).catch((error) => {

    console.error('Bitcoin price API error:', error);
    
    // Always return a fallback price to prevent transaction lookup failures
    return NextResponse.json(
      { 
        bitcoin: { usd: 100000 },
        source: 'fallback',
        timestamp: Date.now(),
        error: 'Price fetch failed, using fallback'
      },
      { 
        status: 200, // Return 200 so transaction lookup continues
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
          'Content-Type': 'application/json',
          'X-Data-Source': 'fallback',
          'X-Error': 'true'
        }
      }
    );
  });
}
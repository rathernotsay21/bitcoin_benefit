import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from '@/lib/security/rateLimiter';

// Force this route to be dynamically rendered
export const dynamic = 'force-dynamic';

const rateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.'
});

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const CACHE_DURATION = 60; // 60 seconds cache

let priceCache: {
  price: number;
  timestamp: number;
} | null = null;

export async function GET(request: NextRequest) {
  try {
    // Check rate limiting
    const rateLimitResult = await rateLimiter.checkLimit(request);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error || 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: rateLimitResult.headers
        }
      );
    }

    // Check cache
    if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION * 1000) {
      return NextResponse.json(
        { 
          price: priceCache.price,
          cached: true,
          timestamp: priceCache.timestamp 
        },
        {
          headers: {
            'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=120`,
          }
        }
      );
    }

    // Fetch fresh price from CoinGecko
    const params = new URLSearchParams({
      ids: 'bitcoin',
      vs_currencies: 'usd',
      include_24hr_change: 'true',
      include_last_updated_at: 'true'
    });

    const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    if (apiKey) {
      headers['x-cg-demo-api-key'] = apiKey;
    }

    const response = await fetch(`${COINGECKO_API_URL}?${params}`, {
      headers,
      next: { revalidate: CACHE_DURATION }
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const price = data.bitcoin?.usd;

    if (!price) {
      throw new Error('Invalid response from CoinGecko API');
    }

    // Update cache
    priceCache = {
      price,
      timestamp: Date.now()
    };

    return NextResponse.json(
      { 
        price,
        change24h: data.bitcoin?.usd_24h_change || 0,
        lastUpdated: data.bitcoin?.last_updated_at || Date.now() / 1000,
        cached: false,
        timestamp: priceCache.timestamp
      },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=120`,
        }
      }
    );

  } catch (error) {
    console.error('Bitcoin price API error:', error);
    
    // Return cached price if available during errors
    if (priceCache) {
      return NextResponse.json(
        { 
          price: priceCache.price,
          cached: true,
          stale: true,
          timestamp: priceCache.timestamp,
          error: 'Using cached price due to API error'
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch Bitcoin price',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
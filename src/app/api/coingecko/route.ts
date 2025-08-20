import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting for server-side requests
class ServerRateLimit {
  private static requests: number[] = [];
  private static readonly MAX_REQUESTS_PER_MINUTE = 10; // Match client-side limit (conservative)
  private static readonly WINDOW_MS = 60000; // 1 minute

  static async checkRateLimit(): Promise<boolean> {
    const now = Date.now();
    
    // Clean up old requests
    this.requests = this.requests.filter(time => now - time < this.WINDOW_MS);
    
    // Check if we're at the limit
    if (this.requests.length >= this.MAX_REQUESTS_PER_MINUTE) {
      return false; // Rate limited
    }
    
    // Add current request
    this.requests.push(now);
    return true; // Allow request
  }
}

export async function GET(_request: NextRequest) {
  const searchParams = _request.nextUrl.searchParams;
  const fromTimestamp = searchParams.get('from');
  const toTimestamp = searchParams.get('to');
  const vsCurrency = searchParams.get('vs_currency') || 'usd';

  // Validate required parameters
  if (!fromTimestamp || !toTimestamp) {
    return NextResponse.json(
      { error: 'Missing required parameters: from and to timestamps' },
      { status: 400 }
    );
  }

  // Validate timestamp format (should be Unix timestamps)
  const fromNum = parseInt(fromTimestamp, 10);
  const toNum = parseInt(toTimestamp, 10);
  
  if (isNaN(fromNum) || isNaN(toNum) || fromNum <= 0 || toNum <= 0) {
    return NextResponse.json(
      { error: 'Invalid timestamp format. Use Unix timestamps.' },
      { status: 400 }
    );
  }

  if (fromNum >= toNum) {
    return NextResponse.json(
      { error: 'From timestamp must be before to timestamp' },
      { status: 400 }
    );
  }

  // Check if date range is reasonable (not more than 1 year)
  const maxRange = 365 * 24 * 60 * 60; // 1 year in seconds
  if (toNum - fromNum > maxRange) {
    return NextResponse.json(
      { error: 'Date range too large. Maximum 1 year allowed.' },
      { status: 400 }
    );
  }

  // Check server-side rate limit
  const rateLimitOk = await ServerRateLimit.checkRateLimit();
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: 'Server rate limit exceeded. Please wait before making another request.' },
      { status: 429 }
    );
  }

  try {
    // Build CoinGecko API URL
    const coinGeckoUrl = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=${vsCurrency}&from=${fromTimestamp}&to=${toTimestamp}`;
    
    // Add a small delay to be extra conservative with CoinGecko's rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch(coinGeckoUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Bitcoin-Vesting-Tracker/1.0'
      },
      // Add timeout
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: `CoinGecko API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Validate response structure
    if (!data.prices || !Array.isArray(data.prices)) {
      return NextResponse.json(
        { error: 'Invalid response format from CoinGecko API' },
        { status: 502 }
      );
    }

    // Add cache headers (cache for 5 minutes for historical data)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('CoinGecko API proxy error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - CoinGecko API is not responding' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch price data from CoinGecko API' },
      { status: 500 }
    );
  }
}

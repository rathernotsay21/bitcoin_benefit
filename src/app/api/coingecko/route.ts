import { NextRequest, NextResponse } from 'next/server';
import { withSizeLimit } from '@/lib/security/requestSizeLimiter';
import { withAPISecurityMiddleware } from '@/lib/security/apiMiddleware';
import { makeSecureAPICall } from '@/lib/security/apiKeyManager';

// Force this route to be dynamically rendered
export const dynamic = 'force-dynamic';

// Internal handler function
async function handleCoinGeckoRequest(request: NextRequest): Promise<Response> {
  return withSizeLimit(request, async (_request: NextRequest) => {
    const searchParams = _request.nextUrl.searchParams;
    const fromTimestamp = searchParams.get('from');
    const toTimestamp = searchParams.get('to');
    const vsCurrency = searchParams.get('vs_currency') || 'usd';

    // Validate required parameters
    if (!fromTimestamp || !toTimestamp) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters: from and to timestamps',
          code: 'MISSING_PARAMETERS'
        },
        { status: 400 }
      );
    }

    // Validate timestamp format (should be Unix timestamps)
    const fromNum = parseInt(fromTimestamp, 10);
    const toNum = parseInt(toTimestamp, 10);
    
    if (isNaN(fromNum) || isNaN(toNum) || fromNum <= 0 || toNum <= 0) {
      return NextResponse.json(
        { 
          error: 'Invalid timestamp format. Use Unix timestamps.',
          code: 'INVALID_TIMESTAMP'
        },
        { status: 400 }
      );
    }

    if (fromNum >= toNum) {
      return NextResponse.json(
        { 
          error: 'From timestamp must be before to timestamp',
          code: 'INVALID_RANGE'
        },
        { status: 400 }
      );
    }

    // Check if date range is reasonable (not more than 1 year)
    const maxRange = 365 * 24 * 60 * 60; // 1 year in seconds
    if (toNum - fromNum > maxRange) {
      return NextResponse.json(
        { 
          error: 'Date range too large. Maximum 1 year allowed.',
          code: 'RANGE_TOO_LARGE',
          maxRangeSeconds: maxRange
        },
        { status: 400 }
      );
    }

    try {
      // Build CoinGecko API URL
      const coinGeckoUrl = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=${vsCurrency}&from=${fromTimestamp}&to=${toTimestamp}`;
      
      // Use secure API call with automatic retries and fallback
      const apiResult = await makeSecureAPICall('coingecko', coinGeckoUrl, {
        method: 'GET'
      });

      if (!apiResult.success) {
        return NextResponse.json(
          { 
            error: apiResult.error || 'Failed to fetch data from CoinGecko',
            code: 'EXTERNAL_API_ERROR',
            source: apiResult.source
          },
          { 
            status: apiResult.retryAfter ? 429 : 502,
            headers: apiResult.retryAfter ? 
              { 'Retry-After': Math.ceil(apiResult.retryAfter / 1000).toString() } : 
              {}
          }
        );
      }

      const data = apiResult.data;

      // Validate response structure
      if (!data || !data.prices || !Array.isArray(data.prices)) {
        return NextResponse.json(
          { 
            error: 'Invalid response format from CoinGecko API',
            code: 'INVALID_RESPONSE_FORMAT'
          },
          { status: 502 }
        );
      }

      // Calculate cache duration based on data age
      const latestTimestamp = Math.max(...data.prices.map((p: [number, number]) => p[0]));
      const dataAge = Date.now() - latestTimestamp;
      const cacheMaxAge = dataAge > 86400000 ? 3600 : 300; // 1 hour for old data, 5 minutes for recent

      // Add comprehensive response headers
      const responseHeaders: Record<string, string> = {
        'Cache-Control': `public, max-age=${cacheMaxAge}, stale-while-revalidate=${cacheMaxAge * 2}`,
        'Content-Type': 'application/json',
        'X-Data-Source': apiResult.source,
        'X-Cache-Duration': cacheMaxAge.toString(),
        'X-API-Provider': 'CoinGecko'
      };

      // Add rate limit info if available
      if (apiResult.rateLimitRemaining !== undefined) {
        responseHeaders['X-External-Rate-Limit-Remaining'] = apiResult.rateLimitRemaining.toString();
      }

      return NextResponse.json(data, {
        headers: responseHeaders
      });

    } catch (error) {
      console.error('CoinGecko API proxy error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      
      return NextResponse.json(
        { 
          error: isTimeout ? 
            'Request timeout - CoinGecko API is not responding' : 
            'Failed to fetch price data from CoinGecko API',
          code: isTimeout ? 'TIMEOUT' : 'INTERNAL_ERROR',
          details: process.env['NODE_ENV'] === 'development' ? errorMessage : undefined
        },
        { status: isTimeout ? 408 : 500 }
      );
    }
  });
}

// Export the secured endpoint
export const GET = withAPISecurityMiddleware(handleCoinGeckoRequest, {
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: parseInt(process.env['COINGECKO_RATE_LIMIT'] || '10', 10),
    message: 'CoinGecko API rate limit exceeded. Please wait before making another request.'
  },
  allowedOrigins: [
    'http://localhost:3000',
    'https://localhost:3000', 
    'https://bitcoin-benefit.netlify.app',
    process.env['NEXT_PUBLIC_SITE_URL']
  ].filter(Boolean) as string[],
  enableRequestLogging: true,
  enableMetrics: true
});

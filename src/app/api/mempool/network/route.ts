import { NextRequest, NextResponse } from 'next/server';
import { withAPISecurityMiddleware } from '@/lib/security/apiMiddleware';
import { makeSecureAPICall } from '@/lib/security/apiKeyManager';

async function handleMempoolNetworkRequest(_request: NextRequest): Promise<Response> {
  try {
    // Check if API calls should be skipped (development mode)
    if (process.env.NEXT_PUBLIC_SKIP_API_CALLS === 'true') {
      return NextResponse.json(
        {
          healthy: true,
          message: 'API calls disabled in development mode - returning mock data',
          timestamp: new Date().toISOString()
        },
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
          }
        }
      );
    }

    // Use secure API call with automatic retries and fallback
    const apiResult = await makeSecureAPICall('mempool', 'https://mempool.space/api/v1/network-health', {
      method: 'GET'
    });

    if (!apiResult.success) {
      return NextResponse.json(
        { 
          error: apiResult.error || 'Failed to fetch network health data',
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

    const networkHealthData = apiResult.data;

    // Validate response structure
    if (!networkHealthData || typeof networkHealthData !== 'object') {
      return NextResponse.json(
        { 
          error: 'Invalid response format from Mempool API',
          code: 'INVALID_RESPONSE_FORMAT'
        },
        { status: 502 }
      );
    }

    // Return the data with appropriate headers
    const responseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      'X-Data-Source': apiResult.source,
      'X-API-Provider': 'Mempool.space'
    };

    // Add rate limit info if available
    if (apiResult.rateLimitRemaining !== undefined) {
      responseHeaders['X-External-Rate-Limit-Remaining'] = apiResult.rateLimitRemaining.toString();
    }

    return NextResponse.json(networkHealthData, {
      status: 200,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('Network health API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Internal server error while fetching network health',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// Export the secured endpoint
export const GET = withAPISecurityMiddleware(handleMempoolNetworkRequest, {
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: parseInt(process.env['MEMPOOL_RATE_LIMIT'] || '30', 10),
    message: 'Mempool API rate limit exceeded. Please wait before making another request.'
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

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
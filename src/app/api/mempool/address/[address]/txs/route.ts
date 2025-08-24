import { NextRequest, NextResponse } from 'next/server';
import { validateBitcoinAddress } from '@/lib/on-chain/validation';
import { makeSecureAPICall } from '@/lib/security/apiKeyManager';
import { executeWithCircuitBreaker } from '@/lib/security/circuitBreaker';

interface RouteParams {
  params: {
    address: string;
  };
}

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { address } = params;

  // Validate Bitcoin address
  if (!validateBitcoinAddress(address)) {
    return NextResponse.json(
      { 
        error: 'Invalid Bitcoin address format',
        code: 'INVALID_ADDRESS'
      },
      { 
        status: 400,
        headers: corsHeaders
      }
    );
  }

  // Check if API calls should be skipped (development mode)
  if (process.env.NEXT_PUBLIC_SKIP_API_CALLS === 'true') {
    return NextResponse.json(
      [],
      { 
        status: 200,
        headers: {
          ...corsHeaders,
          'Cache-Control': 'public, max-age=60',
          'Content-Type': 'application/json',
          'X-Data-Source': 'mock',
          'X-Note': 'API calls disabled in development mode'
        }
      }
    );
  }

  try {
    // Use circuit breaker for mempool.space API calls
    const result = await executeWithCircuitBreaker(
      'mempool',
      async () => {
        // Use secure API call with automatic retries and fallback
        const apiResult = await makeSecureAPICall('mempool',
          `https://mempool.space/api/address/${address}/txs`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Bitcoin-Benefit/1.0'
            },
            signal: AbortSignal.timeout(30000)
          }
        );

        if (!apiResult.success) {
          // Handle specific error cases
          if (apiResult.error?.includes('404')) {
            throw { status: 404, message: 'Address not found or has no transactions' };
          }
          
          throw new Error(apiResult.error || 'Failed to fetch transactions from mempool.space');
        }

        return apiResult.data;
      }
    );

    // Check if we have valid transaction data
    const hasTransactions = Array.isArray(result) && result.length > 0;
    
    // Adaptive caching based on transaction presence
    const cacheMaxAge = hasTransactions ? 60 : 10; // 1 minute if has txs, 10 seconds if empty

    return NextResponse.json(result, {
      headers: {
        ...corsHeaders,
        'Cache-Control': `public, max-age=${cacheMaxAge}, stale-while-revalidate=${cacheMaxAge * 5}`,
        'Content-Type': 'application/json',
        'X-Data-Source': 'mempool.space',
        'X-Transaction-Count': hasTransactions ? result.length.toString() : '0'
      }
    });

  } catch (error: any) {
    console.error('Mempool address API error:', error);
    
    // Handle 404 specifically
    if (error?.status === 404) {
      // Return empty array for addresses with no transactions (graceful degradation)
      return NextResponse.json(
        [],
        { 
          status: 200,
          headers: {
            ...corsHeaders,
            'Cache-Control': 'public, max-age=10, stale-while-revalidate=60',
            'X-Data-Source': 'mempool.space',
            'X-Note': 'No transactions found for address'
          }
        }
      );
    }

    // Handle circuit breaker open
    if (error?.message?.includes('Circuit breaker is open')) {
      return NextResponse.json(
        { 
          error: 'Mempool.space service temporarily unavailable. Please try again later.',
          code: 'SERVICE_UNAVAILABLE',
          retryAfter: 60
        },
        { 
          status: 503,
          headers: { 
            ...corsHeaders,
            'Retry-After': '60' 
          }
        }
      );
    }

    // Handle timeout
    if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
      return NextResponse.json(
        { 
          error: 'Request timeout - mempool.space is not responding',
          code: 'TIMEOUT'
        },
        { 
          status: 408,
          headers: corsHeaders
        }
      );
    }

    // Generic error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch transaction data',
        code: 'INTERNAL_ERROR',
        details: process.env['NODE_ENV'] === 'development' ? error?.message : undefined
      },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}

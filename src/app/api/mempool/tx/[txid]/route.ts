import { NextRequest, NextResponse } from 'next/server';
import { makeSecureAPICall } from '@/lib/security/apiKeyManager';
import { executeWithCircuitBreaker } from '@/lib/security/circuitBreaker';

interface RouteParams {
  params: {
    txid: string;
  };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { txid } = params;

  // Validate transaction ID (should be 64 hex characters)
  if (!txid || typeof txid !== 'string' || txid.length !== 64 || !/^[a-fA-F0-9]+$/.test(txid)) {
    return NextResponse.json(
      { 
        error: 'Invalid transaction ID format',
        code: 'INVALID_TXID'
      },
      { status: 400 }
    );
  }

  try {
    // Use circuit breaker for mempool.space API calls
    const result = await executeWithCircuitBreaker(
      'mempool',
      async () => {
        // Use secure API call with automatic retries and fallback
        const apiResult = await makeSecureAPICall('mempool', 
          `https://mempool.space/api/tx/${txid}`,
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
            throw { status: 404, message: 'Transaction not found' };
          }
          
          throw new Error(apiResult.error || 'Failed to fetch transaction from mempool.space');
        }

        return apiResult.data;
      }
    );

    // Add comprehensive cache headers based on transaction status
    const isConfirmed = result.status?.confirmed || false;
    const cacheMaxAge = isConfirmed ? 86400 : 300; // 24 hours for confirmed, 5 minutes for unconfirmed

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': `public, max-age=${cacheMaxAge}, stale-while-revalidate=${cacheMaxAge * 2}`,
        'Content-Type': 'application/json',
        'X-Data-Source': 'mempool.space',
        'X-Transaction-Status': isConfirmed ? 'confirmed' : 'unconfirmed'
      }
    });

  } catch (error: any) {
    console.error('Mempool transaction API error:', error);
    
    // Handle 404 specifically
    if (error?.status === 404) {
      return NextResponse.json(
        { 
          error: 'Transaction not found',
          code: 'TX_NOT_FOUND',
          txid: txid
        },
        { status: 404 }
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
          headers: { 'Retry-After': '60' }
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
        { status: 408 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch transaction details',
        code: 'INTERNAL_ERROR',
        details: process.env['NODE_ENV'] === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

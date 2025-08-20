import { NextRequest, NextResponse } from 'next/server';
import { validateBitcoinAddress } from '@/lib/on-chain/validation';

interface RouteParams {
  params: {
    address: string;
  };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { address } = params;

  // Validate Bitcoin address
  if (!validateBitcoinAddress(address)) {
    return NextResponse.json(
      { error: 'Invalid Bitcoin address format' },
      { status: 400 }
    );
  }

  try {
    // Fetch from mempool.space API
    const mempoolUrl = `https://mempool.space/api/address/${address}/txs`;
    
    const response = await fetch(mempoolUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Bitcoin-Vesting-Tracker/1.0'
      },
      // Add timeout
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Address not found or has no transactions' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `Mempool API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Add cache headers (cache for 1 minute)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Mempool API proxy error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - mempool.space is not responding' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch transaction data from mempool.space' },
      { status: 500 }
    );
  }
}

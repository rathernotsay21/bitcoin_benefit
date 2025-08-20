import { NextRequest, NextResponse } from 'next/server';

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
      { error: 'Invalid transaction ID format' },
      { status: 400 }
    );
  }

  try {
    // Fetch from mempool.space API
    const mempoolUrl = `https://mempool.space/api/tx/${txid}`;
    
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
          { error: 'Transaction not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `Mempool API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Add cache headers (cache for 5 minutes for transaction details)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Mempool transaction API proxy error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - mempool.space is not responding' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch transaction details from mempool.space' },
      { status: 500 }
    );
  }
}

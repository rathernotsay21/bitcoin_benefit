import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        mempool: 'proxy available at /api/mempool/address/[address]/txs',
        coingecko: 'proxy available at /api/coingecko',
        note: 'These endpoints proxy requests to external APIs to avoid CORS issues'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    );
  }
}

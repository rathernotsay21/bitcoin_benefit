import { NextRequest, NextResponse } from 'next/server';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const COINGECKO_API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build the CoinGecko URL based on the query parameters
    // Support both simple price endpoint and market chart endpoint
    let endpoint = '/simple/price';
    let params = 'ids=bitcoin&vs_currencies=usd';
    
    // Check if this is a historical data request
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    
    if (from && to) {
      // Historical market chart endpoint
      endpoint = '/coins/bitcoin/market_chart/range';
      params = `vs_currency=${searchParams.get('vs_currency') || 'usd'}&from=${from}&to=${to}`;
    } else if (searchParams.get('endpoint')) {
      // Custom endpoint support
      endpoint = searchParams.get('endpoint') || '';
      params = searchParams.get('params') || '';
    }
    
    const url = `${COINGECKO_API_BASE}${endpoint}?${params}`;
    
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };
    
    // Add API key if available
    if (COINGECKO_API_KEY) {
      headers['x-cg-pro-api-key'] = COINGECKO_API_KEY;
    }
    
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });
    
    if (!response.ok) {
      console.error('CoinGecko API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `CoinGecko API error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Add CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    };
    
    return NextResponse.json(data, { headers: corsHeaders });
    
  } catch (error) {
    console.error('Error fetching from CoinGecko:', error);
    
    // Return a fallback response for simple price requests
    if (!request.url.includes('from=')) {
      return NextResponse.json({
        bitcoin: { usd: 30000 } // Fallback price
      }, { 
        headers: {
          'Cache-Control': 'public, max-age=60' // Cache fallback for 1 minute
        }
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch data from CoinGecko' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }
    
    // Validate Bitcoin address format
    const legacyRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const bech32Regex = /^(bc1|tb1)[a-z0-9]{39,59}$/;
    
    if (!legacyRegex.test(address) && !bech32Regex.test(address)) {
      return NextResponse.json(
        { error: 'Invalid Bitcoin address format' },
        { status: 400 }
      );
    }
    
    const url = `https://mempool.space/api/address/${address}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Bitcoin-Tools/1.0'
      },
      signal: AbortSignal.timeout(30000)
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Address not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `Mempool API error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      }
    });
    
  } catch (error) {
    console.error('Error fetching address data:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch address data' },
      { status: 500 }
    );
  }
}
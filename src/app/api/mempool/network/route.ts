import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch Bitcoin network health data from mempool.space API
    const response = await fetch('https://mempool.space/api/v1/network-health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Bitcoin-Benefit-Calculator/1.0',
      },
      // Add cache control for performance
      next: { revalidate: 30 }, // Cache for 30 seconds
    });

    // Check if the external API request was successful
    if (!response.ok) {
      console.error(`Mempool API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { 
          error: 'Failed to fetch network health data',
          status: response.status 
        },
        { status: 502 } // Bad Gateway - external service error
      );
    }

    // Parse the JSON response
    const networkHealthData = await response.json();

    // Return the data with appropriate headers
    return NextResponse.json(networkHealthData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // CORS headers for client-side access
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        // Cache headers
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });

  } catch (error) {
    console.error('Network health API error:', error);
    
    // Return appropriate error response
    return NextResponse.json(
      { 
        error: 'Internal server error while fetching network health',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Export named export for other HTTP methods if needed in the future
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
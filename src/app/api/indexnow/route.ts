import { NextRequest, NextResponse } from 'next/server';

const INDEXNOW_KEY = 'a22a916ab0474727b6815e40d4ade00a';
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow'
];

interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation?: string;
  urlList: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty URL list' },
        { status: 400 }
      );
    }

    // Prepare the payload
    const payload: IndexNowPayload = {
      host: 'bitcoinbenefits.me',
      key: INDEXNOW_KEY,
      keyLocation: `https://bitcoinbenefits.me/${INDEXNOW_KEY}.txt`,
      urlList: urls
    };

    // Submit to all IndexNow endpoints
    const submissions = await Promise.allSettled(
      INDEXNOW_ENDPOINTS.map(async (endpoint) => {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        return {
          endpoint,
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        };
      })
    );

    // Process results
    const results = submissions.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          endpoint: INDEXNOW_ENDPOINTS[index],
          status: 'error',
          error: result.reason?.message || 'Unknown error'
        };
      }
    });

    // Check if at least one submission was successful
    const hasSuccess = results.some(r => 
      'ok' in r && typeof r.ok === 'boolean' && r.ok
    );

    return NextResponse.json({
      success: hasSuccess,
      results,
      submittedUrls: urls,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('IndexNow submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit URLs to IndexNow' },
      { status: 500 }
    );
  }
}

// GET endpoint to verify the setup
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    key: INDEXNOW_KEY,
    keyLocation: `https://bitcoinbenefits.me/${INDEXNOW_KEY}.txt`,
    endpoints: INDEXNOW_ENDPOINTS
  });
}
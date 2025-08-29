// Netlify Function for IndexNow submissions
// This works with static site deployments

const INDEXNOW_KEY = 'a22a916ab0474727b6815e40d4ade00a';
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow'
];

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { urls } = JSON.parse(event.body);
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid or empty URL list' })
      };
    }

    // Prepare the payload
    const payload = {
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
      typeof r.ok === 'boolean' && r.ok
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: hasSuccess,
        results,
        submittedUrls: urls,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('IndexNow submission error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to submit URLs to IndexNow' })
    };
  }
};
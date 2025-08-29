// API configuration for development and production
export const apiConfig = {
  // Use local API routes in development, direct APIs in production
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // API endpoints
  bitcoin: {
    price: process.env.NODE_ENV === 'development' 
      ? '/api/bitcoin-price'
      : 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
  },
  
  mempool: {
    baseUrl: process.env.NODE_ENV === 'development'
      ? '/api/mempool'
      : 'https://mempool.space/api',
    
    network: process.env.NODE_ENV === 'development'
      ? '/api/mempool/network/status/'
      : 'https://mempool.space/api/v1/fees/recommended',
    
    mempoolStats: 'https://mempool.space/api/mempool',
    blockHeight: 'https://mempool.space/api/blocks/tip/height',
    
    fees: process.env.NODE_ENV === 'development'
      ? '/api/mempool/fees/recommended'
      : 'https://mempool.space/api/v1/fees/recommended',
    
    transaction: (txid: string) => process.env.NODE_ENV === 'development'
      ? `/api/mempool/tx/${txid}`
      : `https://mempool.space/api/tx/${txid}`,
    
    address: (address: string) => process.env.NODE_ENV === 'development'
      ? `/api/mempool/address/${address}/txs`
      : `https://mempool.space/api/address/${address}/txs`
  }
};

// Helper to handle CoinGecko response format
export function parseCoinGeckoPrice(data: any): number {
  if (data?.bitcoin?.usd) {
    return data.bitcoin.usd;
  }
  if (data?.price) {
    return data.price;
  }
  return 95000; // Fallback price
}

// Helper to handle network status response
export async function parseNetworkHealth(data: any): Promise<any> {
  // If it's already in the expected format (from dev API), return it
  if (data.congestionLevel && data.mempoolSize && data.nextBlockETA) {
    return data;
  }
  
  // Otherwise, construct it from raw mempool.space data
  const fastestFee = data.fastestFee || data.fastest || 50;
  const congestionLevel = getCongestionLevel(fastestFee);
  
  // Try to fetch additional mempool stats if needed
  let mempoolSize = 150000;
  let mempoolBytes = 75000000;
  
  try {
    const mempoolResponse = await fetch(apiConfig.mempool.mempoolStats);
    if (mempoolResponse.ok) {
      const mempoolData = await mempoolResponse.json();
      mempoolSize = mempoolData.count || mempoolSize;
      mempoolBytes = mempoolData.vsize || mempoolBytes;
    }
  } catch (e) {
    // Use defaults if fetch fails
  }
  
  return {
    congestionLevel,
    mempoolSize,
    mempoolBytes,
    averageFee: data.halfHourFee || 20,
    nextBlockETA: '~10 minutes',
    recommendation: getRecommendation(fastestFee),
    humanReadable: {
      mempoolSize: `${(mempoolSize / 1000).toFixed(1)}k`,
      mempoolBytes: `${(mempoolBytes / 1000000).toFixed(1)} MB`,
      averageFee: `${data.halfHourFee || 20} sat/vB`
    },
    timestamp: Date.now(),
    blockchainTip: 875000, // Will be updated dynamically
    feeEstimates: {
      fastest: fastestFee,
      halfHour: data.halfHourFee || 20,
      hour: data.hourFee || 10,
      economy: data.economyFee || 5,
      minimum: data.minimumFee || 1
    }
  };
}

// Helper to handle mempool fee response
export function parseMempoolFees(data: any) {
  if (process.env.NODE_ENV === 'development') {
    // Development API returns formatted data
    return data;
  }
  
  // Production: parse raw mempool.space response
  return {
    recommendations: [
      {
        level: 'economy',
        emoji: '🐢',
        label: 'Economy',
        timeEstimate: '~60+ minutes',
        satPerVByte: data.economyFee || 10,
        description: 'Lowest fee option. May take longer during busy periods.',
        savings: {
          percent: 60,
          comparedTo: 'priority'
        }
      },
      {
        level: 'balanced',
        emoji: '⚖️',
        label: 'Balanced',
        timeEstimate: '~30 minutes',
        satPerVByte: data.halfHourFee || 20,
        description: 'Good balance between speed and cost.',
        savings: {
          percent: 30,
          comparedTo: 'priority'
        }
      },
      {
        level: 'priority',
        emoji: '🚀',
        label: 'Priority',
        timeEstimate: '~10 minutes',
        satPerVByte: data.fastestFee || 50,
        description: 'Fastest confirmation. Ideal for urgent transactions.'
      }
    ],
    networkConditions: {
      congestionLevel: getCongestionLevel(data.fastestFee || 50),
      mempoolSize: 150000,
      recommendation: getRecommendation(data.fastestFee || 50)
    },
    lastUpdated: new Date().toISOString(),
    txSize: 250
  };
}

function getCongestionLevel(fastestFee: number): 'low' | 'normal' | 'high' | 'extreme' {
  if (fastestFee < 20) return 'low';
  if (fastestFee < 50) return 'normal';
  if (fastestFee < 100) return 'high';
  return 'extreme';
}

function getRecommendation(fastestFee: number): string {
  const level = getCongestionLevel(fastestFee);
  switch (level) {
    case 'low':
      return 'Network is not congested. Lower fees will confirm quickly.';
    case 'normal':
      return 'Network conditions are normal. Standard fees should confirm promptly.';
    case 'high':
      return 'Network is busy. Consider using higher fees for faster confirmation.';
    case 'extreme':
      return 'Network is extremely congested. High fees recommended for timely confirmation.';
    default:
      return 'Network conditions are normal.';
  }
}
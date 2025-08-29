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
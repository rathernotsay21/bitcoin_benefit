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
      ? '/api/mempool/fees/recommended'
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
export function parseNetworkHealth(data: any): any {
  // If it's already in the expected format (from dev API), return it
  if (data.congestionLevel && data.mempoolSize && data.nextBlockETA) {
    return data;
  }
  
  // Otherwise, construct it from raw mempool.space data
  // Handle various possible field names and provide defaults
  const fastestFee = Number(data.fastestFee) || Number(data.fastest) || 50;
  const halfHourFee = Number(data.halfHourFee) || Number(data.halfHour) || 20;
  const hourFee = Number(data.hourFee) || Number(data.hour) || 10;
  const economyFee = Number(data.economyFee) || Number(data.economy) || 5;
  const minimumFee = Number(data.minimumFee) || Number(data.minimum) || 1;
  
  // Ensure we have valid numbers
  const validFastestFee = isNaN(fastestFee) ? 50 : fastestFee;
  const validHalfHourFee = isNaN(halfHourFee) ? 20 : halfHourFee;
  const validHourFee = isNaN(hourFee) ? 10 : hourFee;
  const validEconomyFee = isNaN(economyFee) ? 5 : economyFee;
  const validMinimumFee = isNaN(minimumFee) ? 1 : minimumFee;
  
  const congestionLevel = getCongestionLevel(validFastestFee);
  
  // Calculate congestion percentage based on fee levels
  const congestionPercentage = Math.min(100, Math.max(5, (validFastestFee / 150) * 100));
  
  // Determine traffic level for analysis
  let trafficLevel: 'light' | 'normal' | 'heavy' | 'extreme';
  if (validFastestFee < 20) trafficLevel = 'light';
  else if (validFastestFee < 50) trafficLevel = 'normal';
  else if (validFastestFee < 100) trafficLevel = 'heavy';
  else trafficLevel = 'extreme';
  
  // Use reasonable defaults for mempool stats
  const mempoolSize = 68258; // Average mempool size
  const mempoolBytes = 23600000; // ~23.6 MB average
  
  // Determine color scheme based on congestion
  let colorScheme: 'green' | 'yellow' | 'orange' | 'red';
  if (congestionLevel === 'low') colorScheme = 'green';
  else if (congestionLevel === 'normal') colorScheme = 'yellow';
  else if (congestionLevel === 'high') colorScheme = 'orange';
  else colorScheme = 'red';
  
  // Generate user advice based on congestion
  let userAdvice: string;
  if (congestionLevel === 'low') {
    userAdvice = 'The network has low activity right now. Your transactions will confirm quickly with minimal fees. This is an ideal time to send Bitcoin if you want to save on transaction costs.';
  } else if (congestionLevel === 'normal') {
    userAdvice = 'Network activity is moderate. Standard fee rates will get your transaction confirmed within 30 minutes. You can use economy fees if you\'re not in a hurry.';
  } else if (congestionLevel === 'high') {
    userAdvice = 'The network is experiencing heavy traffic. Consider using priority fees for time-sensitive transactions, or wait for congestion to decrease if you want to save on fees.';
  } else {
    userAdvice = 'The network is extremely congested. Only send urgent transactions now, as fees are very high. Consider waiting a few hours for better conditions if possible.';
  }
  
  return {
    congestionLevel,
    mempoolSize,
    mempoolBytes,
    averageFee: validHalfHourFee,
    nextBlockETA: '~10 minutes',
    recommendation: getRecommendation(validFastestFee),
    humanReadable: {
      mempoolSize: `${(mempoolSize / 1000).toFixed(1)}k`,
      mempoolBytes: `${(mempoolBytes / 1000000).toFixed(1)} MB`,
      averageFee: `${validHalfHourFee} sat/vB`,
      colorScheme,
      userAdvice
    },
    timestamp: Date.now(),
    blockchainTip: 875000,
    feeEstimates: {
      fastest: validFastestFee,
      fastestFee: validFastestFee,  // Include both formats for compatibility
      halfHour: validHalfHourFee,
      halfHourFee: validHalfHourFee,
      hour: validHourFee,
      hourFee: validHourFee,
      economy: validEconomyFee,
      economyFee: validEconomyFee,
      minimum: validMinimumFee,
      minimumFee: validMinimumFee
    },
    analysis: {
      congestionPercentage,
      trafficLevel,
      isCongested: congestionLevel === 'high' || congestionLevel === 'extreme',
      estimatedWaitTime: congestionLevel === 'low' ? '10-20 minutes' :
                        congestionLevel === 'normal' ? '20-40 minutes' :
                        congestionLevel === 'high' ? '40-60 minutes' : '60+ minutes'
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
import { NextRequest, NextResponse } from 'next/server';
import type { 
  NetworkHealth, 
  FeeRate, 
  EnhancedNetworkHealth,
  MempoolInfo,
  MempoolFeeEstimates
} from '@/types/bitcoin-tools';
import { 
  toFeeRateUnsafe, 
  toUnixTimestamp, 
  toBlockHeight,
  toSatoshiAmount,
  validateAndConvertMempoolInfo,
  validateAndConvertMempoolFeeEstimates,
  createToolError,
  isToolError,
  getStatusCodeFromError
} from '@/types/bitcoin-tools';
import { executeWithCircuitBreaker } from '@/lib/security/circuitBreaker';
import { makeSecureAPICall } from '@/lib/security/apiKeyManager';

// Simple in-memory cache for network status
let networkStatusCache: {
  data: EnhancedNetworkHealth | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

const CACHE_TTL = 30 * 1000; // 30 seconds cache
const STALE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes for stale data

// Default fallback data for when everything fails
const DEFAULT_NETWORK_STATUS: EnhancedNetworkHealth = {
  congestionLevel: 'normal',
  mempoolSize: 150000,
  mempoolBytes: 50000000,
  averageFee: toFeeRateUnsafe(15),
  nextBlockETA: '~10 minutes',
  recommendation: 'Network conditions are typical. Standard fees recommended.',
  humanReadable: {
    congestionDescription: 'Normal network activity',
    userAdvice: 'Good time to send Bitcoin with standard fees',
    colorScheme: 'green'
  },
  timestamp: toUnixTimestamp(Math.floor(Date.now() / 1000)),
  blockchainTip: toBlockHeight(870000),
  feeEstimates: {
    fastestFee: toFeeRateUnsafe(20),
    halfHourFee: toFeeRateUnsafe(15),
    hourFee: toFeeRateUnsafe(12),
    economyFee: toFeeRateUnsafe(8)
  },
  analysis: {
    congestionPercentage: 45,
    feeSpreadRatio: 2.5,
    mempoolEfficiency: 80,
    trafficLevel: 'normal'
  }
};

async function fetchMempoolData() {
  try {
    const response = await fetch('https://mempool.space/api/mempool', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Bitcoin-Benefits-Tools/1.0'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`Mempool API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Try blockstream as fallback
    try {
      const response = await fetch('https://blockstream.info/api/mempool', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Bitcoin-Benefits-Tools/1.0'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) {
        throw new Error(`Blockstream API error: ${response.status}`);
      }

      return await response.json();
    } catch {
      throw error; // Re-throw original error
    }
  }
}

async function fetchFeeData() {
  try {
    const response = await fetch('https://mempool.space/api/v1/fees/recommended', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Bitcoin-Benefits-Tools/1.0'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`Fee API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Try blockstream as fallback
    try {
      const response = await fetch('https://blockstream.info/api/fee-estimates', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Bitcoin-Benefits-Tools/1.0'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) {
        throw new Error(`Blockstream fee API error: ${response.status}`);
      }

      const data = await response.json();
      // Convert blockstream format to mempool format
      return {
        fastestFee: Math.round(data['1'] || 25),
        halfHourFee: Math.round(data['3'] || 20),
        hourFee: Math.round(data['6'] || 15),
        economyFee: Math.round(data['144'] || 10),
        minimumFee: 1
      };
    } catch {
      // Return sensible defaults
      return {
        fastestFee: 25,
        halfHourFee: 20,
        hourFee: 15,
        economyFee: 10,
        minimumFee: 1
      };
    }
  }
}

export async function GET(_request: NextRequest) {
  // Check if API calls should be skipped (development mode)
  if (process.env.NEXT_PUBLIC_SKIP_API_CALLS === 'true') {
    return NextResponse.json(DEFAULT_NETWORK_STATUS, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
        'Content-Type': 'application/json',
        'X-Data-Source': 'mock',
        'X-Skip-API': 'true'
      }
    });
  }

  // Check cache first
  const now = Date.now();
  if (networkStatusCache.data) {
    // Return fresh cache if within TTL
    if (now - networkStatusCache.timestamp < CACHE_TTL) {
      return NextResponse.json(networkStatusCache.data, {
        headers: {
          'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
          'Content-Type': 'application/json',
          'X-Data-Source': 'cache',
          'X-Cache-Hit': 'true'
        }
      });
    }
    
    // Return stale cache if within stale TTL (but trigger background refresh)
    if (now - networkStatusCache.timestamp < STALE_CACHE_TTL) {
      // Trigger background refresh (don't await)
      refreshNetworkStatus();
      
      return NextResponse.json({
        ...networkStatusCache.data,
        _stale: true,
        _staleAge: Math.round((now - networkStatusCache.timestamp) / 1000)
      }, {
        headers: {
          'Cache-Control': 'public, max-age=10, stale-while-revalidate=30',
          'Content-Type': 'application/json',
          'X-Data-Source': 'stale-cache',
          'X-Cache-Hit': 'stale'
        }
      });
    }
  }

  try {
    // Fetch data with fallbacks
    const [mempoolData, feeData] = await Promise.all([
      fetchMempoolData().catch(() => null),
      fetchFeeData().catch(() => null)
    ]);

    // If both failed, return cached data or defaults
    if (!mempoolData && !feeData) {
      if (networkStatusCache.data) {
        return NextResponse.json({
          ...networkStatusCache.data,
          _warning: 'Using cached data - services temporarily unavailable'
        }, {
          headers: {
            'Cache-Control': 'public, max-age=10, stale-while-revalidate=30',
            'Content-Type': 'application/json',
            'X-Data-Source': 'fallback-cache'
          }
        });
      }
      
      // Return default data
      return NextResponse.json({
        ...DEFAULT_NETWORK_STATUS,
        _warning: 'Using default values - services temporarily unavailable'
      }, {
        headers: {
          'Cache-Control': 'public, max-age=10, stale-while-revalidate=30',
          'Content-Type': 'application/json',
          'X-Data-Source': 'default'
        }
      });
    }

    // Create fallback mempool data if needed
    const fallbackMempool: MempoolInfo = mempoolData ? {
      count: mempoolData.count || 0,
      vsize: mempoolData.vsize || 0,
      total_fee: toSatoshiAmount(mempoolData.total_fee || 0),
      fee_histogram: mempoolData.fee_histogram || [],
      timestamp: toUnixTimestamp(Math.floor(Date.now() / 1000))
    } : {
      count: 150000,
      vsize: 50000000,
      total_fee: toSatoshiAmount(1000000),
      fee_histogram: [],
      timestamp: toUnixTimestamp(Math.floor(Date.now() / 1000))
    };

    // Create fallback fee data if needed
    const fallbackFees: MempoolFeeEstimates = feeData ? {
      fastestFee: toFeeRateUnsafe(feeData.fastestFee || 25),
      halfHourFee: toFeeRateUnsafe(feeData.halfHourFee || 20),
      hourFee: toFeeRateUnsafe(feeData.hourFee || 15),
      economyFee: toFeeRateUnsafe(feeData.economyFee || 10),
      minimumFee: toFeeRateUnsafe(feeData.minimumFee || 1)
    } : {
      fastestFee: toFeeRateUnsafe(25),
      halfHourFee: toFeeRateUnsafe(20),
      hourFee: toFeeRateUnsafe(15),
      economyFee: toFeeRateUnsafe(10),
      minimumFee: toFeeRateUnsafe(1)
    };

    // Analyze network health
    const networkHealth = analyzeNetworkHealth(fallbackMempool, fallbackFees);
    
    // Create enhanced response
    const enhancedNetworkHealth: EnhancedNetworkHealth = {
      ...networkHealth,
      feeEstimates: {
        fastestFee: fallbackFees.fastestFee,
        halfHourFee: fallbackFees.halfHourFee,
        hourFee: fallbackFees.hourFee,
        economyFee: fallbackFees.economyFee
      },
      analysis: {
        congestionPercentage: calculateCongestionPercentage(fallbackMempool, fallbackFees),
        feeSpreadRatio: calculateFeeSpreadRatio(fallbackFees),
        mempoolEfficiency: calculateMempoolEfficiency(fallbackMempool),
        trafficLevel: determineTrafficLevel(fallbackMempool, fallbackFees)
      }
    };

    // Update cache
    networkStatusCache = {
      data: enhancedNetworkHealth,
      timestamp: Date.now()
    };

    return NextResponse.json(enhancedNetworkHealth, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
        'Content-Type': 'application/json',
        'X-Data-Source': mempoolData && feeData ? 'live' : 'partial'
      }
    });

  } catch (error: any) {
    console.error('Network status API error:', error);
    
    // Always return something useful
    const fallbackData = networkStatusCache.data || DEFAULT_NETWORK_STATUS;
    
    return NextResponse.json({
      ...fallbackData,
      _error: 'Service degraded - showing approximate values',
      _timestamp: Date.now()
    }, {
      status: 200, // Return 200 with degraded data instead of error
      headers: {
        'Cache-Control': 'public, max-age=10, stale-while-revalidate=30',
        'Content-Type': 'application/json',
        'X-Data-Source': 'fallback',
        'X-Degraded': 'true'
      }
    });
  }
}

// Background refresh function
async function refreshNetworkStatus(): Promise<void> {
  try {
    const [mempoolData, feeData] = await Promise.all([
      fetchMempoolData().catch(() => null),
      fetchFeeData().catch(() => null)
    ]);

    if (mempoolData || feeData) {
      // Update cache with fresh data
      const fallbackMempool: MempoolInfo = mempoolData ? {
        count: mempoolData.count || 0,
        vsize: mempoolData.vsize || 0,
        total_fee: toSatoshiAmount(mempoolData.total_fee || 0),
        fee_histogram: mempoolData.fee_histogram || [],
        timestamp: toUnixTimestamp(Math.floor(Date.now() / 1000))
      } : networkStatusCache.data ? {
        count: networkStatusCache.data.mempoolSize,
        vsize: networkStatusCache.data.mempoolBytes,
        total_fee: toSatoshiAmount(1000000),
        fee_histogram: [],
        timestamp: toUnixTimestamp(Math.floor(Date.now() / 1000))
      } : {
        count: 150000,
        vsize: 50000000,
        total_fee: toSatoshiAmount(1000000),
        fee_histogram: [],
        timestamp: toUnixTimestamp(Math.floor(Date.now() / 1000))
      };

      const fallbackFees: MempoolFeeEstimates = feeData ? {
        fastestFee: toFeeRateUnsafe(feeData.fastestFee || 25),
        halfHourFee: toFeeRateUnsafe(feeData.halfHourFee || 20),
        hourFee: toFeeRateUnsafe(feeData.hourFee || 15),
        economyFee: toFeeRateUnsafe(feeData.economyFee || 10),
        minimumFee: toFeeRateUnsafe(feeData.minimumFee || 1)
      } : networkStatusCache.data?.feeEstimates || {
        fastestFee: toFeeRateUnsafe(25),
        halfHourFee: toFeeRateUnsafe(20),
        hourFee: toFeeRateUnsafe(15),
        economyFee: toFeeRateUnsafe(10),
        minimumFee: toFeeRateUnsafe(1)
      };

      const networkHealth = analyzeNetworkHealth(fallbackMempool, fallbackFees);
      const enhancedNetworkHealth: EnhancedNetworkHealth = {
        ...networkHealth,
        feeEstimates: {
          fastestFee: fallbackFees.fastestFee,
          halfHourFee: fallbackFees.halfHourFee,
          hourFee: fallbackFees.hourFee,
          economyFee: fallbackFees.economyFee
        },
        analysis: {
          congestionPercentage: calculateCongestionPercentage(fallbackMempool, fallbackFees),
          feeSpreadRatio: calculateFeeSpreadRatio(fallbackFees),
          mempoolEfficiency: calculateMempoolEfficiency(fallbackMempool),
          trafficLevel: determineTrafficLevel(fallbackMempool, fallbackFees)
        }
      };

      networkStatusCache = {
        data: enhancedNetworkHealth,
        timestamp: Date.now()
      };
    }
  } catch (error) {
    console.warn('Background refresh failed:', error);
  }
}

function analyzeNetworkHealth(mempoolData: MempoolInfo, feeData: MempoolFeeEstimates): NetworkHealth {
  const mempoolSize = mempoolData.count;
  const mempoolBytes = mempoolData.vsize;
  const averageFee = feeData.halfHourFee;
  
  let congestionLevel: NetworkHealth['congestionLevel'];
  let colorScheme: NetworkHealth['humanReadable']['colorScheme'];
  let congestionDescription: string;
  let userAdvice: string;
  let recommendation: string;

  const halfHourFeeValue = Number(feeData.halfHourFee);
  if (halfHourFeeValue <= 5) {
    congestionLevel = 'low';
    colorScheme = 'green';
    congestionDescription = 'Low network congestion - excellent fee rates';
    userAdvice = 'Perfect time to send Bitcoin! Fees are extremely low right now.';
    recommendation = `Excellent conditions - use Economy fees (${Number(feeData.economyFee)} sat/vB) for maximum savings`;
  } else if (halfHourFeeValue <= 20) {
    congestionLevel = 'normal';
    colorScheme = 'green';
    congestionDescription = 'Normal network congestion - reasonable fees';
    userAdvice = 'Good time to send Bitcoin. Fees are at typical levels.';
    recommendation = `Good conditions - Standard fees (${halfHourFeeValue} sat/vB) recommended`;
  } else if (halfHourFeeValue <= 50) {
    congestionLevel = 'high';
    colorScheme = 'orange';
    congestionDescription = 'High network congestion - elevated fees';
    userAdvice = 'Network is busier than usual. Fees are elevated but manageable.';
    recommendation = `Network busy - Consider Priority fees (${Number(feeData.fastestFee)} sat/vB) or wait for calmer periods`;
  } else {
    congestionLevel = 'extreme';
    colorScheme = 'red';
    congestionDescription = 'Extreme network congestion - very high fees';
    userAdvice = 'Network extremely busy! Very high fees required unless you can wait.';
    recommendation = `CAUTION: Extreme congestion - High fees (${Number(feeData.fastestFee)} sat/vB) required or wait several hours`;
  }

  const nextBlockETA = calculateNextBlockETA(congestionLevel, feeData.halfHourFee);
  
  if (mempoolSize > 50000 && halfHourFeeValue <= 5) {
    congestionDescription += ' (many low-priority transactions queued)';
    userAdvice += ' The high transaction count consists mostly of low-fee transactions that will clear over time.';
  }

  return {
    congestionLevel,
    mempoolSize,
    mempoolBytes,
    averageFee,
    nextBlockETA,
    recommendation,
    humanReadable: {
      congestionDescription,
      userAdvice,
      colorScheme
    },
    timestamp: toUnixTimestamp(Math.floor(Date.now() / 1000)),
    blockchainTip: toBlockHeight(870000)
  };
}

function calculateNextBlockETA(
  congestionLevel: NetworkHealth['congestionLevel'], 
  _averageFee: FeeRate
): string {
  const baseMinutes = 10;
  let multiplier = 1;

  switch (congestionLevel) {
    case 'low':
      multiplier = 0.8;
      break;
    case 'normal':
      multiplier = 1.0;
      break;
    case 'high':
      multiplier = 1.2;
      break;
    case 'extreme':
      multiplier = 1.5;
      break;
  }

  const estimatedMinutes = Math.round(baseMinutes * multiplier);
  
  if (estimatedMinutes <= 5) {
    return '< 5 minutes';
  } else if (estimatedMinutes <= 15) {
    return `~${estimatedMinutes} minutes`;
  } else {
    return `${Math.round(estimatedMinutes / 5) * 5} minutes`;
  }
}

function calculateCongestionPercentage(mempool: MempoolInfo, fees: MempoolFeeEstimates): number {
  const feeWeight = Number(fees.halfHourFee) / 100 * 70;
  const sizeWeight = Math.min(mempool.count / 500000, 1) * 30;
  return Math.round(feeWeight + sizeWeight);
}

function calculateFeeSpreadRatio(fees: MempoolFeeEstimates): number {
  return Number(fees.fastestFee) / Number(fees.economyFee);
}

function calculateMempoolEfficiency(mempool: MempoolInfo): number {
  if (mempool.count === 0) return 100;
  const avgTxSize = mempool.vsize / mempool.count;
  const idealSize = 250;
  return Math.round(Math.max(0, Math.min(100, (idealSize / avgTxSize) * 100)));
}

function determineTrafficLevel(mempool: MempoolInfo, fees: MempoolFeeEstimates): 'light' | 'normal' | 'heavy' | 'extreme' {
  const halfHourFee = Number(fees.halfHourFee);
  if (halfHourFee <= 5) return 'light';
  if (halfHourFee <= 20) return 'normal';
  if (halfHourFee <= 50) return 'heavy';
  return 'extreme';
}
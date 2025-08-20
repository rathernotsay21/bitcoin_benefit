import { NextRequest, NextResponse } from 'next/server';
import type { NetworkHealth, FeeRate } from '@/types/bitcoin-tools';
import { toFeeRate, toUnixTimestamp, toBlockHeight } from '@/types/bitcoin-tools';

interface MempoolInfo {
  count: number;
  vsize: number;
  total_fee: number;
  fee_histogram: number[][];
}

interface MempoolFeeEstimates {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

interface EnhancedNetworkHealth extends NetworkHealth {
  feeEstimates: {
    fastestFee: FeeRate;
    halfHourFee: FeeRate;
    hourFee: FeeRate;
    economyFee: FeeRate;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Fetch mempool info and fee estimates in parallel
    const [mempoolResponse, feeResponse] = await Promise.all([
      fetch('https://mempool.space/api/mempool', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Bitcoin-Benefits-Tools/1.0'
        },
        signal: AbortSignal.timeout(15000)
      }),
      fetch('https://mempool.space/api/v1/fees/recommended', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Bitcoin-Benefits-Tools/1.0'
        },
        signal: AbortSignal.timeout(15000)
      })
    ]);

    if (!mempoolResponse.ok || !feeResponse.ok) {
      throw new Error(`API error: ${mempoolResponse.status} / ${feeResponse.status}`);
    }

    const [mempoolData, feeData]: [MempoolInfo, MempoolFeeEstimates] = await Promise.all([
      mempoolResponse.json(),
      feeResponse.json()
    ]);

    // Analyze network health
    const networkHealth = analyzeNetworkHealth(mempoolData, feeData);
    
    // Add detailed fee estimates to response
    const enhancedNetworkHealth: EnhancedNetworkHealth = {
      ...networkHealth,
      feeEstimates: {
        fastestFee: toFeeRate(feeData.fastestFee),
        halfHourFee: toFeeRate(feeData.halfHourFee),
        hourFee: toFeeRate(feeData.hourFee),
        economyFee: toFeeRate(feeData.economyFee)
      }
    };

    return NextResponse.json(enhancedNetworkHealth, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Network status API error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - mempool.space is not responding' },
        { status: 408 }
      );
    }

    // Return fallback network status
    const fallbackStatus: EnhancedNetworkHealth = {
      congestionLevel: 'normal',
      mempoolSize: 0,
      mempoolBytes: 0,
      averageFee: toFeeRate(20),
      nextBlockETA: 'Unknown',
      recommendation: 'Unable to determine current network conditions',
      humanReadable: {
        congestionDescription: 'Network status unavailable',
        userAdvice: 'Consider waiting a few minutes and trying again',
        colorScheme: 'yellow'
      },
      timestamp: toUnixTimestamp(Date.now() / 1000),
      blockchainTip: toBlockHeight(800000), // Placeholder value
      feeEstimates: {
        fastestFee: toFeeRate(25),
        halfHourFee: toFeeRate(20),
        hourFee: toFeeRate(15),
        economyFee: toFeeRate(10)
      }
    };

    return NextResponse.json(fallbackStatus, {
      status: 503,
      headers: {
        'Cache-Control': 'public, max-age=10, stale-while-revalidate=30',
        'Content-Type': 'application/json'
      }
    });
  }
}

function analyzeNetworkHealth(mempoolData: MempoolInfo, feeData: MempoolFeeEstimates): NetworkHealth {
  const mempoolSize = mempoolData.count;
  const mempoolBytes = mempoolData.vsize;
  const averageFee = feeData.halfHourFee;
  
  // Determine congestion level based primarily on fee rates rather than transaction count
  let congestionLevel: NetworkHealth['congestionLevel'];
  let colorScheme: NetworkHealth['humanReadable']['colorScheme'];
  let congestionDescription: string;
  let userAdvice: string;
  let recommendation: string;

  // Focus PRIMARILY on fee rates as the indicator of congestion
  // Fee rates are the most accurate measure of how congested the network actually is for users
  // Updated thresholds based on real Bitcoin network behavior:
  // - Low: halfHourFee <= 5 sat/vByte (excellent conditions)
  // - Normal: halfHourFee 6-20 sat/vByte (typical usage)
  // - High: halfHourFee 21-50 sat/vByte (busy periods)
  // - Extreme: halfHourFee > 50 sat/vByte (high demand events)
  if (feeData.halfHourFee <= 5) {
    congestionLevel = 'low';
    colorScheme = 'green';
    congestionDescription = 'Low network congestion - excellent fee rates';
    userAdvice = 'Perfect time to send Bitcoin! Fees are extremely low right now.';
    recommendation = `Excellent conditions - use Economy fees (${feeData.economyFee} sat/vB) for maximum savings`;
  } else if (feeData.halfHourFee <= 20) {
    congestionLevel = 'normal';
    colorScheme = 'green';
    congestionDescription = 'Normal network congestion - reasonable fees';
    userAdvice = 'Good time to send Bitcoin. Fees are at typical levels.';
    recommendation = `Good conditions - Standard fees (${feeData.halfHourFee} sat/vB) recommended`;
  } else if (feeData.halfHourFee <= 50) {
    congestionLevel = 'high';
    colorScheme = 'orange';
    congestionDescription = 'High network congestion - elevated fees';
    userAdvice = 'Network is busier than usual. Fees are elevated but manageable.';
    recommendation = `Network busy - Consider Priority fees (${feeData.fastestFee} sat/vB) or wait for calmer periods`;
  } else {
    congestionLevel = 'extreme';
    colorScheme = 'red';
    congestionDescription = 'Extreme network congestion - very high fees';
    userAdvice = 'Network extremely busy! Very high fees required unless you can wait.';
    recommendation = `CAUTION: Extreme congestion - High fees (${feeData.fastestFee} sat/vB) required or wait several hours`;
  }

  // Calculate next block ETA (rough estimate)
  const nextBlockETA = calculateNextBlockETA(congestionLevel, feeData.halfHourFee);
  
  // Add context about why there might be many transactions but low fees
  // This is common and normal - many low-fee transactions queue during low congestion periods
  if (mempoolSize > 50000 && feeData.halfHourFee <= 5) {
    congestionDescription += ' (many low-priority transactions queued)';
    userAdvice += ' The high transaction count consists mostly of low-fee transactions that will clear over time.';
  }

  return {
    congestionLevel,
    mempoolSize,
    mempoolBytes,
    averageFee: toFeeRate(averageFee),
    nextBlockETA,
    recommendation,
    humanReadable: {
      congestionDescription,
      userAdvice,
      colorScheme
    },
    timestamp: toUnixTimestamp(Date.now() / 1000),
    blockchainTip: toBlockHeight(800000) // Placeholder - could be enhanced with actual tip from mempool.space
  };
}

function calculateNextBlockETA(
  congestionLevel: NetworkHealth['congestionLevel'], 
  averageFee: number
): string {
  // Bitcoin blocks are mined approximately every 10 minutes on average
  // But actual times can vary significantly
  
  const baseMinutes = 10;
  let multiplier = 1;

  switch (congestionLevel) {
    case 'low':
      multiplier = 0.8; // Slightly faster than average
      break;
    case 'normal':
      multiplier = 1.0; // Average
      break;
    case 'high':
      multiplier = 1.2; // Slightly slower
      break;
    case 'extreme':
      multiplier = 1.5; // Much slower for lower fee transactions
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
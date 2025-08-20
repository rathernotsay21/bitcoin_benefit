import { NextRequest, NextResponse } from 'next/server';

interface MempoolFeeResponse {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

interface FeeRecommendation {
  level: 'economy' | 'balanced' | 'priority';
  emoji: string;
  label: string;
  timeEstimate: string;
  satPerVByte: number;
  description: string;
  savings?: {
    percent: number;
    comparedTo: string;
  };
}

interface NetworkConditions {
  congestionLevel: 'low' | 'normal' | 'high' | 'extreme';
  mempoolSize: number;
  recommendation: string;
}

export async function GET(_request: NextRequest) {
  const { searchParams } = new URL(_request.url);
  const txSize = parseInt(searchParams.get('txSize') || '250');

  try {
    // Fetch fee recommendations from mempool.space
    const feeResponse = await fetch('https://mempool.space/api/v1/fees/recommended', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Bitcoin-Benefits-Tools/1.0'
      },
      signal: AbortSignal.timeout(30000)
    });

    if (!feeResponse.ok) {
      throw new Error(`Mempool API error: ${feeResponse.status}`);
    }

    const feeData: MempoolFeeResponse = await feeResponse.json();

    // Fetch mempool info for network conditions
    let networkConditions: NetworkConditions = {
      congestionLevel: 'normal',
      mempoolSize: 0,
      recommendation: 'Network conditions are normal'
    };

    try {
      const mempoolResponse = await fetch('https://mempool.space/api/mempool', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Bitcoin-Benefits-Tools/1.0'
        },
        signal: AbortSignal.timeout(15000)
      });

      if (mempoolResponse.ok) {
        const mempoolData = await mempoolResponse.json();
        networkConditions = analyzeNetworkConditions(mempoolData, feeData);
      }
    } catch (error) {
      // Non-critical error - continue with default network conditions
      console.warn('Failed to fetch mempool data:', error);
    }

    // Build fee recommendations
    const recommendations = buildFeeRecommendations(feeData, txSize, networkConditions);

    return NextResponse.json({
      recommendations,
      networkConditions,
      lastUpdated: new Date().toISOString(),
      txSize
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Fee recommendation API error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - mempool.space is not responding' },
        { status: 408 }
      );
    }

    // Return fallback fee recommendations
    const fallbackRecommendations = getFallbackFeeRecommendations(txSize);
    
    return NextResponse.json({
      recommendations: fallbackRecommendations,
      networkConditions: {
        congestionLevel: 'unknown' as const,
        mempoolSize: 0,
        recommendation: 'Unable to determine current network conditions'
      },
      lastUpdated: new Date().toISOString(),
      txSize,
      warning: 'Using fallback fee estimates - network data unavailable'
    }, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
        'Content-Type': 'application/json'
      }
    });
  }
}

function analyzeNetworkConditions(mempoolData: any, feeData: MempoolFeeResponse): NetworkConditions {
  const mempoolSize = mempoolData.count || 0;
  const averageFee = feeData.halfHourFee;
  
  let congestionLevel: NetworkConditions['congestionLevel'];
  let recommendation: string;

  // Determine congestion level based on mempool size and fees
  if (mempoolSize < 5000 && averageFee < 10) {
    congestionLevel = 'low';
    recommendation = 'Great time to send! Low fees and fast confirmation.';
  } else if (mempoolSize < 20000 && averageFee < 50) {
    congestionLevel = 'normal';
    recommendation = 'Normal network conditions. Standard fees recommended.';
  } else if (mempoolSize < 50000 && averageFee < 200) {
    congestionLevel = 'high';
    recommendation = 'Network is busy. Consider waiting or using higher fees.';
  } else {
    congestionLevel = 'extreme';
    recommendation = 'Network extremely congested! High fees required or wait for off-peak hours.';
  }

  return {
    congestionLevel,
    mempoolSize,
    recommendation
  };
}

function buildFeeRecommendations(
  feeData: MempoolFeeResponse, 
  txSize: number, 
  networkConditions: NetworkConditions
): FeeRecommendation[] {
  const recommendations: FeeRecommendation[] = [
    {
      level: 'economy',
      emoji: '🐢',
      label: 'Economy',
      timeEstimate: getTimeEstimate(feeData.economyFee || feeData.hourFee, networkConditions.congestionLevel),
      satPerVByte: feeData.economyFee || feeData.hourFee,
      description: 'Cheapest option - use when not in a hurry'
    },
    {
      level: 'balanced',
      emoji: '⚖️',
      label: 'Balanced',
      timeEstimate: getTimeEstimate(feeData.halfHourFee, networkConditions.congestionLevel),
      satPerVByte: feeData.halfHourFee,
      description: 'Good balance of speed and cost'
    },
    {
      level: 'priority',
      emoji: '🚀',
      label: 'Priority',
      timeEstimate: getTimeEstimate(feeData.fastestFee, networkConditions.congestionLevel),
      satPerVByte: feeData.fastestFee,
      description: 'Fastest confirmation - use for urgent transactions'
    }
  ];

  // Calculate savings and add warnings
  const priorityCost = feeData.fastestFee * txSize;
  
  recommendations.forEach((rec) => {
    const cost = rec.satPerVByte * txSize;
    
    if (rec.level !== 'priority') {
      const savings = priorityCost - cost;
      const percent = Math.round((savings / priorityCost) * 100);
      
      rec.savings = {
        percent,
        comparedTo: 'Priority'
      };
    }

    // Add network-specific warnings
    if (networkConditions.congestionLevel === 'extreme' && rec.level === 'economy') {
      rec.description += ' ⚠️ May take several hours due to high congestion';
    } else if (networkConditions.congestionLevel === 'high' && rec.level === 'economy') {
      rec.description += ' ⚠️ Longer delays expected';
    }
  });

  return recommendations;
}

function getTimeEstimate(feeRate: number, congestionLevel: NetworkConditions['congestionLevel']): string {
  // Base time estimates
  let baseTime: string;
  
  if (feeRate >= 50) {
    baseTime = '~10 minutes';
  } else if (feeRate >= 20) {
    baseTime = '~30 minutes';
  } else if (feeRate >= 10) {
    baseTime = '1-2 hours';
  } else {
    baseTime = '2-6 hours';
  }

  // Adjust for network congestion
  switch (congestionLevel) {
    case 'extreme':
      if (baseTime.includes('minutes')) return baseTime.replace('minutes', 'minutes+');
      if (baseTime.includes('hours')) return baseTime.replace(/\d+-?/, (match) => `${parseInt(match) * 2}-`);
      break;
    case 'high':
      if (baseTime.includes('minutes')) return baseTime.replace('10', '15-30');
      break;
    case 'low':
      if (baseTime.includes('hours')) return baseTime.replace(/\d+-?/, (match) => `${Math.max(1, Math.floor(parseInt(match) / 2))}-`);
      break;
  }

  return baseTime;
}

function getFallbackFeeRecommendations(_txSize: number): FeeRecommendation[] {
  // Conservative fallback estimates when API is unavailable
  return [
    {
      level: 'economy',
      emoji: '🐢',
      label: 'Economy',
      timeEstimate: '2-6 hours',
      satPerVByte: 5,
      description: 'Conservative estimate - network data unavailable',
      savings: {
        percent: 75,
        comparedTo: 'Priority'
      }
    },
    {
      level: 'balanced',
      emoji: '⚖️',
      label: 'Balanced',
      timeEstimate: '30-60 minutes',
      satPerVByte: 15,
      description: 'Moderate estimate - network data unavailable',
      savings: {
        percent: 50,
        comparedTo: 'Priority'
      }
    },
    {
      level: 'priority',
      emoji: '🚀',
      label: 'Priority',
      timeEstimate: '10-20 minutes',
      satPerVByte: 30,
      description: 'Higher estimate for reliability - network data unavailable'
    }
  ];
}
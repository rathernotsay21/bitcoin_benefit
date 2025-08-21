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

export async function GET(_request: NextRequest) {
  try {
    // Use circuit breaker for resilient API calls
    const [mempoolData, feeData] = await Promise.all([
      executeWithCircuitBreaker('mempool', async () => {
        const apiResult = await makeSecureAPICall('mempool',
          'https://mempool.space/api/mempool',
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Bitcoin-Benefits-Tools/1.0'
            },
            signal: AbortSignal.timeout(15000)
          }
        );

        if (!apiResult.success) {
          throw new Error(apiResult.error || 'Failed to fetch mempool data');
        }

        return apiResult.data;
      }),
      
      executeWithCircuitBreaker('mempool', async () => {
        const apiResult = await makeSecureAPICall('mempool',
          'https://mempool.space/api/v1/fees/recommended',
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Bitcoin-Benefits-Tools/1.0'
            },
            signal: AbortSignal.timeout(15000)
          }
        );

        if (!apiResult.success) {
          throw new Error(apiResult.error || 'Failed to fetch fee data');
        }

        return apiResult.data;
      })
    ]);

    // Log raw data for debugging during build
    if (process.env.NODE_ENV === 'development') {
      console.log('Raw mempool data keys:', Object.keys(mempoolData as any));
      console.log('Raw fee data:', feeData);
    }

    // Validate and convert API responses
    const validatedMempoolData = validateAndConvertMempoolInfo(mempoolData);
    const validatedFeeData = validateAndConvertMempoolFeeEstimates(feeData);

    if (!validatedMempoolData || !validatedFeeData) {
      // Try a more lenient fallback for mempool data
      if (!validatedMempoolData && mempoolData && typeof mempoolData === 'object') {
        const raw = mempoolData as any;
        // Check if it has the required fields but maybe in different format
        if ('count' in raw && 'vsize' in raw) {
          // Use a fallback conversion
          const fallbackMempool: MempoolInfo = {
            count: Number(raw.count) || 0,
            vsize: Number(raw.vsize) || 0,
            total_fee: toSatoshiAmount(Number(raw.total_fee) || Number(raw.totalFee) || 0),
            fee_histogram: Array.isArray(raw.fee_histogram) ? raw.fee_histogram : [],
            timestamp: toUnixTimestamp(Math.floor(Date.now() / 1000))
          };
          
          // Use the fallback if it seems valid
          if (fallbackMempool.count >= 0 && fallbackMempool.vsize >= 0) {
            const fallbackFees: MempoolFeeEstimates = validatedFeeData || {
              fastestFee: toFeeRateUnsafe(25),
              halfHourFee: toFeeRateUnsafe(20),
              hourFee: toFeeRateUnsafe(15),
              economyFee: toFeeRateUnsafe(10),
              minimumFee: toFeeRateUnsafe(1)
            };
            
            // Continue with fallback data
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
            
            return NextResponse.json(enhancedNetworkHealth, {
              headers: {
                'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
                'Content-Type': 'application/json',
                'X-Data-Source': 'mempool.space'
              }
            });
          }
        }
      }
      
      const error = createToolError(
        'validation',
        'API_ERROR',
        new Error('Invalid API response format'),
        {
          field: !validatedMempoolData ? 'mempoolData' : 'feeData',
          invalidValue: !validatedMempoolData ? mempoolData : feeData
        }
      );
      throw error;
    }

    // Analyze network health
    const networkHealth = analyzeNetworkHealth(validatedMempoolData, validatedFeeData);
    
    // Add detailed fee estimates to response
    const enhancedNetworkHealth: EnhancedNetworkHealth = {
      ...networkHealth,
      feeEstimates: {
        fastestFee: validatedFeeData.fastestFee,
        halfHourFee: validatedFeeData.halfHourFee,
        hourFee: validatedFeeData.hourFee,
        economyFee: validatedFeeData.economyFee
      },
      analysis: {
        congestionPercentage: calculateCongestionPercentage(validatedMempoolData, validatedFeeData),
        feeSpreadRatio: calculateFeeSpreadRatio(validatedFeeData),
        mempoolEfficiency: calculateMempoolEfficiency(validatedMempoolData),
        trafficLevel: determineTrafficLevel(validatedMempoolData, validatedFeeData)
      }
    };

    return NextResponse.json(enhancedNetworkHealth, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
        'Content-Type': 'application/json',
        'X-Data-Source': 'mempool.space'
      }
    });

  } catch (error: any) {
    console.error('Network status API error:', error);
    
    // Handle circuit breaker open
    if (error?.message?.includes('Circuit breaker is open')) {
      // Return gracefully degraded data
      const fallbackStatus: EnhancedNetworkHealth = {
        congestionLevel: 'normal',
        mempoolSize: 0,
        mempoolBytes: 0,
        averageFee: toFeeRateUnsafe(20),
        nextBlockETA: 'Service temporarily unavailable',
        recommendation: 'Mempool.space is temporarily unavailable. Using default values.',
        humanReadable: {
          congestionDescription: 'Service temporarily unavailable',
          userAdvice: 'The mempool monitoring service is temporarily down. Please try again in a few minutes.',
          colorScheme: 'yellow'
        },
        timestamp: toUnixTimestamp(Math.floor(Date.now() / 1000)),
        blockchainTip: toBlockHeight(800000),
        feeEstimates: {
          fastestFee: toFeeRateUnsafe(25),
          halfHourFee: toFeeRateUnsafe(20),
          hourFee: toFeeRateUnsafe(15),
          economyFee: toFeeRateUnsafe(10)
        },
        analysis: {
          congestionPercentage: 50,
          feeSpreadRatio: 2.5,
          mempoolEfficiency: 75,
          trafficLevel: 'normal'
        }
      };

      return NextResponse.json(fallbackStatus, {
        status: 503,
        headers: {
          'Cache-Control': 'public, max-age=10, stale-while-revalidate=30',
          'Content-Type': 'application/json',
          'Retry-After': '60',
          'X-Fallback': 'true'
        }
      });
    }
    
    // Handle timeout
    if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
      const timeoutError = createToolError(
        'timeout',
        'API_TIMEOUT',
        error,
        {
          timeoutMs: 15000,
          operation: 'fetch network status'
        }
      );
      
      return NextResponse.json(
        { error: timeoutError },
        { status: 408 }
      );
    }

    // Handle specific ToolError types
    if (isToolError(error)) {
      const statusCode = getStatusCodeFromError(error);
      return NextResponse.json(
        { error },
        { status: statusCode }
      );
    }

    // Return fallback network status for unknown errors
    const fallbackStatus: EnhancedNetworkHealth = {
      congestionLevel: 'normal',
      mempoolSize: 0,
      mempoolBytes: 0,
      averageFee: toFeeRateUnsafe(20),
      nextBlockETA: 'Unknown',
      recommendation: 'Unable to determine current network conditions',
      humanReadable: {
        congestionDescription: 'Network status unavailable',
        userAdvice: 'Consider waiting a few minutes and trying again',
        colorScheme: 'yellow'
      },
      timestamp: toUnixTimestamp(Math.floor(Date.now() / 1000)),
      blockchainTip: toBlockHeight(800000),
      feeEstimates: {
        fastestFee: toFeeRateUnsafe(25),
        halfHourFee: toFeeRateUnsafe(20),
        hourFee: toFeeRateUnsafe(15),
        economyFee: toFeeRateUnsafe(10)
      },
      analysis: {
        congestionPercentage: 50,
        feeSpreadRatio: 2.5,
        mempoolEfficiency: 75,
        trafficLevel: 'normal'
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

  // Calculate next block ETA (rough estimate)
  const nextBlockETA = calculateNextBlockETA(congestionLevel, feeData.halfHourFee);
  
  // Add context about why there might be many transactions but low fees
  // This is common and normal - many low-fee transactions queue during low congestion periods
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
    blockchainTip: toBlockHeight(800000) // Placeholder - could be enhanced with actual tip from mempool.space
  };
}

function calculateNextBlockETA(
  congestionLevel: NetworkHealth['congestionLevel'], 
  _averageFee: FeeRate
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

// Additional analysis functions for enhanced network health
function calculateCongestionPercentage(
  mempoolData: MempoolInfo, 
  feeData: MempoolFeeEstimates
): number {
  // Calculate congestion based on both mempool size and fee pressure
  const sizeWeight = Math.min(mempoolData.count / 100000, 1) * 40; // 40% weight
  const feeWeight = Math.min(Number(feeData.halfHourFee) / 100, 1) * 60; // 60% weight
  return Math.round(sizeWeight + feeWeight);
}

function calculateFeeSpreadRatio(feeData: MempoolFeeEstimates): number {
  // Ratio between fastest and economy fees indicates fee pressure
  return Number((Number(feeData.fastestFee) / Number(feeData.economyFee)).toFixed(2));
}

function calculateMempoolEfficiency(mempoolData: MempoolInfo): number {
  // Efficiency based on average transaction size vs total vsize
  const avgTxSize = mempoolData.count > 0 ? mempoolData.vsize / mempoolData.count : 250;
  const efficiency = Math.max(0, Math.min(100, 100 - ((avgTxSize - 200) / 10)));
  return Math.round(efficiency);
}

function determineTrafficLevel(
  mempoolData: MempoolInfo, 
  feeData: MempoolFeeEstimates
): 'light' | 'normal' | 'heavy' | 'extreme' {
  const totalTrafficScore = (
    (mempoolData.count / 50000) * 0.3 +
    (Number(feeData.halfHourFee) / 20) * 0.7
  );

  if (totalTrafficScore <= 0.5) return 'light';
  if (totalTrafficScore <= 1.5) return 'normal';
  if (totalTrafficScore <= 3.0) return 'heavy';
  return 'extreme';
}
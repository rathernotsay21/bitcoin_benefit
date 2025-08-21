import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createFetchError, createToolError } from '@/types/bitcoin-tools';
import { safeAsync, TypeSafeRateLimiter } from '@/lib/type-safe-error-handler';
import { executeWithCircuitBreaker } from '@/lib/security/circuitBreaker';
import { makeSecureAPICall } from '@/lib/security/apiKeyManager';

// Rate limiter for external API calls
const apiRateLimiter = new TypeSafeRateLimiter(30, 60000); // 30 requests per minute

// Zod schemas for runtime validation
const MempoolFeeResponseSchema = z.object({
  fastestFee: z.number().positive(),
  halfHourFee: z.number().positive(),
  hourFee: z.number().positive(),
  economyFee: z.number().positive(),
  minimumFee: z.number().positive(),
});

const MempoolInfoSchema = z.object({
  count: z.number().int().nonnegative(),
  vsize: z.number().int().nonnegative(),
  total_fee: z.number().nonnegative(),
  fee_histogram: z.array(z.array(z.number())).optional(),
});

type MempoolFeeResponse = z.infer<typeof MempoolFeeResponseSchema>;
type MempoolInfo = z.infer<typeof MempoolInfoSchema>;

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

interface ApiResponse {
  recommendations: FeeRecommendation[];
  networkConditions: NetworkConditions;
  lastUpdated: string;
  txSize: number;
  warning?: string;
  error?: string;
}

export async function GET(_request: NextRequest) {
  const { searchParams } = new URL(_request.url);
  const txSize = parseInt(searchParams.get('txSize') || '250');
  
  // Validate transaction size
  if (isNaN(txSize) || txSize < 140 || txSize > 100000) {
    return NextResponse.json(
      { error: 'Invalid transaction size. Must be between 140 and 100,000 vBytes' },
      { status: 400 }
    );
  }

  // Check rate limits
  const rateLimitError = apiRateLimiter.checkAndRecord('mempool-fees');
  if (rateLimitError) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded. Please wait before making another request.',
        retryAfter: Math.ceil(((rateLimitError.context?.['resetTime'] as number) - Date.now()) / 1000)
      },
      { status: 429 }
    );
  }

  // Fetch fee data with comprehensive error handling
  const feeResult = await safeAsync(
    () => fetchMempoolFeeData(),
    'network',
    { endpoint: 'mempool-fees' }
  );

  if (!feeResult.success) {
    console.error('Fee data fetch failed:', feeResult.error);
    return handleFallbackResponse(txSize, feeResult.error.userFriendlyMessage);
  }

  const feeData = feeResult.data;

  // Fetch network conditions (non-critical)
  const networkResult = await safeAsync(
    () => fetchMempoolInfo(),
    'network',
    { endpoint: 'mempool-info' }
  );

  let networkConditions: NetworkConditions = {
    congestionLevel: 'normal',
    mempoolSize: 0,
    recommendation: 'Network conditions are normal'
  };

  if (networkResult.success) {
    networkConditions = analyzeNetworkConditions(networkResult.data, feeData);
  } else {
    console.warn('Network conditions fetch failed (non-critical):', networkResult.error.userFriendlyMessage);
  }

  // Build fee recommendations
  const recommendations = buildFeeRecommendations(feeData, txSize, networkConditions);

  const response: ApiResponse = {
    recommendations,
    networkConditions,
    lastUpdated: new Date().toISOString(),
    txSize
  };

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Type-safe fetch function for mempool fee data with SSL error handling
 */
async function fetchMempoolFeeData(): Promise<MempoolFeeResponse> {
  // Use circuit breaker and secure API wrapper for resilience
  const result = await executeWithCircuitBreaker(
    'mempool',
    async () => {
      const apiResult = await makeSecureAPICall('mempool',
        'https://mempool.space/api/v1/fees/recommended',
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Bitcoin-Benefits-Tools/1.0',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
          },
          signal: AbortSignal.timeout(20000)
        }
      );

      if (!apiResult.success) {
        throw new Error(apiResult.error || 'Failed to fetch fee data from mempool.space');
      }

      const parseResult = MempoolFeeResponseSchema.safeParse(apiResult.data);
      
      if (!parseResult.success) {
        throw createToolError('parse_error', 'JSON_PARSE_ERROR', 
          new Error('Invalid fee data format'), 
          { validationErrors: parseResult.error.issues }
        );
      }
      
      return parseResult.data;
    }
  );

  return result as MempoolFeeResponse;
}

/**
 * Fetch mempool info with error handling
 */
async function fetchMempoolInfo(): Promise<MempoolInfo> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch('https://mempool.space/api/mempool', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Bitcoin-Benefits-Tools/1.0'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw createFetchError('https://mempool.space/api/mempool', response);
    }
    
    const rawData = await response.json();
    const parseResult = MempoolInfoSchema.safeParse(rawData);
    
    if (!parseResult.success) {
      throw createToolError('parse_error', 'JSON_PARSE_ERROR', 
        new Error('Invalid mempool data format'),
        { validationErrors: parseResult.error.issues }
      );
    }
    
    return parseResult.data;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: Error): boolean {
  const retryableMessages = [
    'fetch',
    'network',
    'timeout',
    'ECONNRESET',
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNREFUSED'
  ];
  
  return retryableMessages.some(msg => 
    error.message.toLowerCase().includes(msg.toLowerCase())
  );
}

/**
 * Handle fallback response when primary API fails
 */
function handleFallbackResponse(txSize: number, errorMessage: string): NextResponse {
  const fallbackRecommendations = getFallbackFeeRecommendations(txSize);
  
  const response: ApiResponse = {
    recommendations: fallbackRecommendations,
    networkConditions: {
      congestionLevel: 'normal', // Conservative assumption
      mempoolSize: 0,
      recommendation: 'Unable to determine current network conditions'
    },
    lastUpdated: new Date().toISOString(),
    txSize,
    warning: 'Using fallback fee estimates - live data unavailable',
    error: errorMessage
  };
  
  return NextResponse.json(response, {
    status: 200, // Still return success with fallback data
    headers: {
      'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
      'Content-Type': 'application/json'
    }
  });
}

function analyzeNetworkConditions(mempoolData: MempoolInfo, feeData: MempoolFeeResponse): NetworkConditions {
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
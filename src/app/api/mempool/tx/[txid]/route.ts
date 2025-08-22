import { NextRequest, NextResponse } from 'next/server';
import { makeSecureAPICall } from '@/lib/security/apiKeyManager';
import { executeWithCircuitBreaker } from '@/lib/security/circuitBreaker';

interface RouteParams {
  params: {
    txid: string;
  };
}

// Simple in-memory cache for transaction data
const transactionCache = new Map<string, { data: any; timestamp: number; isConfirmed: boolean }>();
const CACHE_TTL_UNCONFIRMED = 60 * 1000; // 1 minute for unconfirmed
const CACHE_TTL_CONFIRMED = 10 * 60 * 1000; // 10 minutes for confirmed

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of transactionCache.entries()) {
    const ttl = value.isConfirmed ? CACHE_TTL_CONFIRMED : CACHE_TTL_UNCONFIRMED;
    if (now - value.timestamp > ttl) {
      transactionCache.delete(key);
    }
  }
}, 60 * 1000); // Clean every minute

async function fetchFromMempool(txid: string) {
  const apiResult = await makeSecureAPICall('mempool', 
    `https://mempool.space/api/tx/${txid}`,
    {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Bitcoin-Benefit/1.0'
      },
      signal: AbortSignal.timeout(10000) // Reduced timeout for faster fallback
    }
  );

  if (!apiResult.success) {
    if (apiResult.error?.includes('404')) {
      throw { status: 404, message: 'Transaction not found' };
    }
    throw new Error(apiResult.error || 'Mempool.space request failed');
  }

  return apiResult.data;
}

async function fetchFromBlockstream(txid: string) {
  try {
    const response = await fetch(
      `https://blockstream.info/api/tx/${txid}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Bitcoin-Benefit/1.0'
        },
        signal: AbortSignal.timeout(10000)
      }
    );

    if (response.status === 404) {
      throw { status: 404, message: 'Transaction not found' };
    }

    if (!response.ok) {
      throw new Error(`Blockstream API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Convert Blockstream format to mempool.space format
    return {
      txid: data.txid,
      version: data.version,
      locktime: data.locktime,
      vin: data.vin,
      vout: data.vout,
      size: data.size,
      weight: data.weight,
      fee: data.fee || 0,
      status: {
        confirmed: data.status?.confirmed || false,
        block_height: data.status?.block_height,
        block_hash: data.status?.block_hash,
        block_time: data.status?.block_time
      }
    };
  } catch (error: any) {
    if (error?.status === 404) {
      throw error;
    }
    throw new Error(`Blockstream API failed: ${error?.message}`);
  }
}

async function fetchFromBlockchainInfo(txid: string) {
  try {
    const response = await fetch(
      `https://blockchain.info/rawtx/${txid}?format=json`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Bitcoin-Benefit/1.0'
        },
        signal: AbortSignal.timeout(10000)
      }
    );

    if (response.status === 404 || response.status === 500) {
      throw { status: 404, message: 'Transaction not found' };
    }

    if (!response.ok) {
      throw new Error(`Blockchain.info API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Convert blockchain.info format to mempool.space format
    const isConfirmed = data.block_height && data.block_height > 0;
    return {
      txid: data.hash,
      version: data.ver,
      locktime: data.lock_time,
      vin: data.inputs?.map((input: any) => ({
        txid: input.prev_out?.hash,
        vout: input.prev_out?.n,
        sequence: input.sequence,
        scriptSig: input.script
      })) || [],
      vout: data.out?.map((output: any) => ({
        value: output.value,
        n: output.n,
        scriptPubKey: {
          hex: output.script,
          address: output.addr
        }
      })) || [],
      size: data.size,
      weight: data.weight || data.size * 4,
      fee: data.fee || 0,
      status: {
        confirmed: isConfirmed,
        block_height: data.block_height || undefined,
        block_hash: data.block_hash || undefined,
        block_time: data.time || undefined
      }
    };
  } catch (error: any) {
    if (error?.status === 404) {
      throw error;
    }
    throw new Error(`Blockchain.info API failed: ${error?.message}`);
  }
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { txid } = params;

  // Validate transaction ID (should be 64 hex characters)
  if (!txid || typeof txid !== 'string' || txid.length !== 64 || !/^[a-fA-F0-9]+$/.test(txid)) {
    return NextResponse.json(
      { 
        error: 'Invalid transaction ID format',
        code: 'INVALID_TXID'
      },
      { status: 400 }
    );
  }

  // Check cache first
  const cached = transactionCache.get(txid);
  if (cached) {
    const ttl = cached.isConfirmed ? CACHE_TTL_CONFIRMED : CACHE_TTL_UNCONFIRMED;
    if (Date.now() - cached.timestamp < ttl) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': `public, max-age=${Math.floor(ttl / 1000)}, stale-while-revalidate=${Math.floor(ttl / 500)}`,
          'Content-Type': 'application/json',
          'X-Data-Source': 'cache',
          'X-Cache-Hit': 'true',
          'X-Transaction-Status': cached.isConfirmed ? 'confirmed' : 'unconfirmed'
        }
      });
    }
  }

  // Try each provider in sequence
  const providers = [
    { name: 'mempool.space', fn: () => executeWithCircuitBreaker('mempool', () => fetchFromMempool(txid)) },
    { name: 'blockstream.info', fn: () => fetchFromBlockstream(txid) },
    { name: 'blockchain.info', fn: () => fetchFromBlockchainInfo(txid) }
  ];

  let lastError: any = null;
  let notFoundCount = 0;

  for (const provider of providers) {
    try {
      const result = await provider.fn();
      
      // Cache the successful result
      const isConfirmed = result.status?.confirmed || false;
      transactionCache.set(txid, {
        data: result,
        timestamp: Date.now(),
        isConfirmed
      });

      // Add comprehensive cache headers based on transaction status
      const cacheMaxAge = isConfirmed ? 600 : 60; // 10 minutes for confirmed, 1 minute for unconfirmed

      return NextResponse.json(result, {
        headers: {
          'Cache-Control': `public, max-age=${cacheMaxAge}, stale-while-revalidate=${cacheMaxAge * 2}`,
          'Content-Type': 'application/json',
          'X-Data-Source': provider.name,
          'X-Transaction-Status': isConfirmed ? 'confirmed' : 'unconfirmed'
        }
      });
    } catch (error: any) {
      console.warn(`Provider ${provider.name} failed:`, error?.message || error);
      
      // If transaction not found, count it
      if (error?.status === 404) {
        notFoundCount++;
      }
      
      lastError = error;
      // Continue to next provider
    }
  }

  // If all providers returned 404, the transaction likely doesn't exist
  if (notFoundCount === providers.length) {
    return NextResponse.json(
      { 
        error: 'Transaction not found',
        code: 'TX_NOT_FOUND',
        txid: txid,
        message: 'Transaction not found in any blockchain explorer'
      },
      { status: 404 }
    );
  }

  // If we have stale cached data, return it with a warning
  if (cached) {
    return NextResponse.json(
      { 
        ...cached.data,
        _warning: 'Data may be stale - all providers are currently unavailable'
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
          'Content-Type': 'application/json',
          'X-Data-Source': 'stale-cache',
          'X-Fallback': 'true'
        }
      }
    );
  }

  // All providers failed and no cache available
  console.error('All transaction lookup providers failed:', lastError);
  
  return NextResponse.json(
    { 
      error: 'All blockchain explorers are currently unavailable. Please try again later.',
      code: 'SERVICE_UNAVAILABLE',
      retryAfter: 30,
      providers_tried: providers.map(p => p.name)
    },
    { 
      status: 503,
      headers: { 'Retry-After': '30' }
    }
  );
}
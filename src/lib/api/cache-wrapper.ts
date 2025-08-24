import { NextResponse } from 'next/server';

interface CacheConfig {
  maxAge?: number; // seconds
  staleWhileRevalidate?: number; // seconds
  immutable?: boolean;
  private?: boolean;
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxAge: 300, // 5 minutes
  staleWhileRevalidate: 600, // 10 minutes
  immutable: false,
  private: false
};

// Cache configurations for different API endpoints
export const CACHE_CONFIGS = {
  bitcoinPrice: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 900 // 15 minutes
  },
  networkStatus: {
    maxAge: 30, // 30 seconds
    staleWhileRevalidate: 60 // 1 minute
  },
  historicalData: {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 7200, // 2 hours
    immutable: false // Historical data changes rarely
  },
  staticData: {
    maxAge: 86400, // 24 hours
    staleWhileRevalidate: 172800, // 48 hours
    immutable: true // Static data doesn't change
  },
  transactionData: {
    maxAge: 60, // 1 minute for fresh tx data
    staleWhileRevalidate: 300 // 5 minutes
  }
} as const;

/**
 * Creates cache control header string from config
 */
function buildCacheControlHeader(config: CacheConfig): string {
  const parts: string[] = [];
  
  if (config.private) {
    parts.push('private');
  } else {
    parts.push('public');
  }
  
  if (config.immutable) {
    parts.push('immutable');
  }
  
  if (config.maxAge !== undefined) {
    parts.push(`max-age=${config.maxAge}`);
    parts.push(`s-maxage=${config.maxAge}`); // CDN cache
  }
  
  if (config.staleWhileRevalidate !== undefined) {
    parts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }
  
  return parts.join(', ');
}

/**
 * Wraps a response with optimized caching headers
 */
export function withCache(
  data: any,
  config: CacheConfig = DEFAULT_CACHE_CONFIG,
  additionalHeaders?: Record<string, string>
): NextResponse {
  const cacheControl = buildCacheControlHeader(config);
  
  const headers: Record<string, string> = {
    'Cache-Control': cacheControl,
    'Content-Type': 'application/json',
    'X-Cache-Config': JSON.stringify({ maxAge: config.maxAge, swr: config.staleWhileRevalidate }),
    ...additionalHeaders
  };
  
  // Add ETag for conditional requests
  const etag = generateETag(data);
  if (etag) {
    headers['ETag'] = etag;
  }
  
  // Add timestamp
  headers['X-Timestamp'] = new Date().toISOString();
  
  return NextResponse.json(data, { headers });
}

/**
 * Simple ETag generation for JSON data
 */
function generateETag(data: any): string {
  try {
    const content = JSON.stringify(data);
    // Simple hash for ETag (in production, use crypto.createHash)
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `"${Math.abs(hash).toString(36)}"`;
  } catch {
    return '';
  }
}

/**
 * Memory cache for API responses
 */
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();
  
  set(key: string, data: any, ttl: number): void {
    const expires = Date.now() + (ttl * 1000);
    this.cache.set(key, { data, expires });
  }
  
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expires) {
        this.cache.delete(key);
      }
    }
  }
}

// Global memory cache instance
export const apiCache = new MemoryCache();

// Cleanup expired cache entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => apiCache.cleanup(), 5 * 60 * 1000);
}

/**
 * Wrapper for cached API responses
 */
export async function withCachedResponse<T>(
  key: string,
  fetcher: () => Promise<T>,
  cacheConfig: CacheConfig = DEFAULT_CACHE_CONFIG
): Promise<NextResponse> {
  // Check memory cache first
  const cached = apiCache.get(key);
  if (cached) {
    return withCache(cached, cacheConfig, {
      'X-Cache-Hit': 'memory',
      'X-Cache-Key': key
    });
  }
  
  try {
    // Fetch fresh data
    const data = await fetcher();
    
    // Store in memory cache
    if (cacheConfig.maxAge) {
      apiCache.set(key, data, cacheConfig.maxAge);
    }
    
    return withCache(data, cacheConfig, {
      'X-Cache-Hit': 'miss',
      'X-Cache-Key': key
    });
  } catch (error) {
    // Return stale data if available during error
    const stale = apiCache.get(key);
    if (stale) {
      return withCache(stale, cacheConfig, {
        'X-Cache-Hit': 'stale',
        'X-Cache-Key': key,
        'X-Error': 'true'
      });
    }
    
    throw error;
  }
}
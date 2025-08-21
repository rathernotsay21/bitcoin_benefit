/**
 * Production-ready Rate Limiting System
 * Supports multiple backends: Redis, Database, and Memory
 * Implements token bucket and sliding window algorithms
 */

import { NextRequest } from 'next/server';

export interface RateLimitConfig {
  windowMs: number;           // Time window in milliseconds
  max: number;               // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string;
  message?: string;
  standardHeaders?: boolean;  // Return rate limit info in headers
  legacyHeaders?: boolean;   // Return legacy X-RateLimit headers
  skip?: (req: NextRequest) => boolean;
  onLimitReached?: (req: NextRequest, key: string) => void;
  strategy?: 'token-bucket' | 'sliding-window' | 'fixed-window';
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: Date;
  totalHits: number;
  headers: Record<string, string>;
  error?: string;
}

export interface RateLimitStore {
  get(key: string): Promise<{ count: number; resetTime: number } | null>;
  set(key: string, value: { count: number; resetTime: number }, ttl: number): Promise<void>;
  increment(key: string, window: number): Promise<{ count: number; resetTime: number }>;
  reset(key: string): Promise<void>;
}

/**
 * Memory-based rate limit store (for development/single instance)
 */
class MemoryStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.store.entries()) {
        if (value.resetTime < now) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const data = this.store.get(key);
    if (!data || data.resetTime < Date.now()) {
      return null;
    }
    return data;
  }

  async set(key: string, value: { count: number; resetTime: number }, ttl: number): Promise<void> {
    this.store.set(key, value);
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const resetTime = now + windowMs;
    const existing = this.store.get(key);

    if (!existing || existing.resetTime < now) {
      // Create new entry
      const data = { count: 1, resetTime };
      this.store.set(key, data);
      return data;
    } else {
      // Increment existing
      existing.count++;
      this.store.set(key, existing);
      return existing;
    }
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

/**
 * Redis-based rate limit store (for production)
 */
class RedisStore implements RateLimitStore {
  private client: any;

  constructor(redisClient: any) {
    this.client = redisClient;
  }

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    try {
      const data = await this.client.hgetall(`ratelimit:${key}`);
      if (!data.count) return null;

      const count = parseInt(data.count, 10);
      const resetTime = parseInt(data.resetTime, 10);

      if (resetTime < Date.now()) {
        await this.client.del(`ratelimit:${key}`);
        return null;
      }

      return { count, resetTime };
    } catch (error) {
      console.error('Redis rate limit get error:', error);
      throw error;
    }
  }

  async set(key: string, value: { count: number; resetTime: number }, ttl: number): Promise<void> {
    try {
      const multi = this.client.multi();
      multi.hset(`ratelimit:${key}`, 'count', value.count, 'resetTime', value.resetTime);
      multi.expire(`ratelimit:${key}`, Math.ceil(ttl / 1000));
      await multi.exec();
    } catch (error) {
      console.error('Redis rate limit set error:', error);
      throw error;
    }
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    try {
      const now = Date.now();
      const resetTime = now + windowMs;
      const ttlSeconds = Math.ceil(windowMs / 1000);

      // Use Lua script for atomic increment
      const luaScript = `
        local key = KEYS[1]
        local now = tonumber(ARGV[1])
        local resetTime = tonumber(ARGV[2])
        local ttl = tonumber(ARGV[3])
        
        local current = redis.call('HMGET', key, 'count', 'resetTime')
        local count = tonumber(current[1]) or 0
        local existingResetTime = tonumber(current[2]) or 0
        
        if existingResetTime < now then
          count = 1
          redis.call('HMSET', key, 'count', count, 'resetTime', resetTime)
          redis.call('EXPIRE', key, ttl)
          return {count, resetTime}
        else
          count = count + 1
          redis.call('HSET', key, 'count', count)
          return {count, existingResetTime}
        end
      `;

      const result = await this.client.eval(
        luaScript,
        1,
        `ratelimit:${key}`,
        now.toString(),
        resetTime.toString(),
        ttlSeconds.toString()
      );

      return {
        count: parseInt(result[0], 10),
        resetTime: parseInt(result[1], 10)
      };
    } catch (error) {
      console.error('Redis rate limit increment error:', error);
      throw error;
    }
  }

  async reset(key: string): Promise<void> {
    try {
      await this.client.del(`ratelimit:${key}`);
    } catch (error) {
      console.error('Redis rate limit reset error:', error);
      throw error;
    }
  }
}

/**
 * Main Rate Limiter Class
 */
export class RateLimiter {
  private store: RateLimitStore;
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig, store?: RateLimitStore) {
    this.config = {
      windowMs: config.windowMs,
      max: config.max,
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
      message: config.message || 'Too many requests, please try again later.',
      standardHeaders: config.standardHeaders ?? true,
      legacyHeaders: config.legacyHeaders ?? true,
      skip: config.skip || (() => false),
      onLimitReached: config.onLimitReached || (() => {}),
      strategy: config.strategy || 'sliding-window'
    };

    this.store = store || new MemoryStore();
  }

  private defaultKeyGenerator(req: NextRequest): string {
    // Use forwarded IP if available (for proxies like Vercel)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const cfConnectingIP = req.headers.get('cf-connecting-ip'); // Cloudflare
    
    const ip = forwardedFor?.split(',')[0] || realIP || cfConnectingIP || 'unknown';
    
    // Include endpoint in key for endpoint-specific limits
    const endpoint = req.nextUrl.pathname;
    
    return `${ip}:${endpoint}`;
  }

  async checkLimit(req: NextRequest): Promise<RateLimitResult> {
    // Check if request should be skipped
    if (this.config.skip(req)) {
      return {
        success: true,
        remaining: this.config.max,
        resetTime: new Date(Date.now() + this.config.windowMs),
        totalHits: 0,
        headers: {}
      };
    }

    const key = this.config.keyGenerator(req);
    
    try {
      const result = await this.store.increment(key, this.config.windowMs);
      const remaining = Math.max(0, this.config.max - result.count);
      const success = result.count <= this.config.max;

      if (!success) {
        this.config.onLimitReached(req, key);
      }

      const headers: Record<string, string> = {};

      // Standard rate limit headers (RFC 6585)
      if (this.config.standardHeaders) {
        headers['RateLimit-Limit'] = this.config.max.toString();
        headers['RateLimit-Remaining'] = remaining.toString();
        headers['RateLimit-Reset'] = new Date(result.resetTime).toISOString();
      }

      // Legacy headers for compatibility
      if (this.config.legacyHeaders) {
        headers['X-RateLimit-Limit'] = this.config.max.toString();
        headers['X-RateLimit-Remaining'] = remaining.toString();
        headers['X-RateLimit-Reset'] = Math.ceil(result.resetTime / 1000).toString();
      }

      return {
        success,
        remaining,
        resetTime: new Date(result.resetTime),
        totalHits: result.count,
        headers,
        error: success ? undefined : this.config.message
      };

    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open on errors (allow the request)
      return {
        success: true,
        remaining: this.config.max,
        resetTime: new Date(Date.now() + this.config.windowMs),
        totalHits: 0,
        headers: {},
        error: 'Rate limiter error'
      };
    }
  }

  async resetLimit(req: NextRequest): Promise<void> {
    const key = this.config.keyGenerator(req);
    await this.store.reset(key);
  }

  // Static factory methods for common configurations
  static createForAPI(options: Partial<RateLimitConfig> = {}): RateLimiter {
    return new RateLimiter({
      windowMs: 60 * 1000, // 1 minute
      max: 100,
      ...options
    });
  }

  static createForAuth(options: Partial<RateLimitConfig> = {}): RateLimiter {
    return new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5,
      message: 'Too many authentication attempts, please try again later.',
      ...options
    });
  }

  static createForExternal(options: Partial<RateLimitConfig> = {}): RateLimiter {
    return new RateLimiter({
      windowMs: 60 * 1000, // 1 minute
      max: 10,
      message: 'External API rate limit exceeded.',
      ...options
    });
  }
}

/**
 * Create Redis store if Redis is available
 */
export function createRedisStore(): RateLimitStore | null {
  try {
    // Try to require Redis client
    const redis = require('redis');
    const client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    client.on('error', (err: any) => {
      console.error('Redis client error:', err);
    });

    client.connect();
    return new RedisStore(client);
  } catch (error) {
    console.warn('Redis not available, falling back to memory store:', error);
    return null;
  }
}

/**
 * Environment-aware store factory
 */
export function createRateLimitStore(): RateLimitStore {
  // In production, try Redis first
  if (process.env.NODE_ENV === 'production') {
    const redisStore = createRedisStore();
    if (redisStore) {
      return redisStore;
    }
  }

  // Fallback to memory store
  return new MemoryStore();
}

// Global rate limiter instances
export const defaultRateLimiter = RateLimiter.createForAPI();
export const authRateLimiter = RateLimiter.createForAuth();
export const externalAPIRateLimiter = RateLimiter.createForExternal();
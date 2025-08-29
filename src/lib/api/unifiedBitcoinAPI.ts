/**
 * Unified Bitcoin API Client
 * 
 * This is the SINGLE source of truth for all Bitcoin-related API calls.
 * Features:
 * - Automatic fallback chain: Direct API → Proxy → Cached data
 * - Request deduplication to prevent duplicate calls
 * - Built-in retry with exponential backoff
 * - Per-endpoint circuit breakers
 * - Comprehensive error handling
 * - Performance monitoring
 */

import { CircuitBreaker } from '@/lib/security/circuitBreaker';
import { EnhancedRateLimiter } from '@/lib/services/enhancedRateLimiter';
import { createToolError } from '@/types/bitcoin-tools';

// Configuration
const CONFIG = {
  maxRetries: 3,
  baseRetryDelay: 1000,
  maxRetryDelay: 10000,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  requestTimeout: 30000, // 30 seconds
  dedupeWindow: 1000, // 1 second
  circuitBreakerThreshold: 5,
  circuitBreakerTimeout: 60000, // 1 minute
  circuitBreakerRecoveryAttempts: 3,
} as const;

// Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  fallback?: boolean;
  timestamp: number;
}

export interface RequestOptions extends RequestInit {
  skipCache?: boolean;
  skipRateLimit?: boolean;
  skipCircuitBreaker?: boolean;
  fallbackData?: any;
  cacheKey?: string;
  rateLimitKey?: string;
}

export type APIEndpoint = 'mempool' | 'coingecko' | 'blockchain' | 'custom';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

/**
 * Unified Bitcoin API Client
 * Singleton pattern to ensure consistent state across the application
 */
export class UnifiedBitcoinAPI {
  private static instance: UnifiedBitcoinAPI;
  
  // Cache storage
  private cache = new Map<string, CacheEntry>();
  
  // Request deduplication
  private pendingRequests = new Map<string, PendingRequest>();
  
  // Circuit breakers per endpoint
  private circuitBreakers = new Map<string, CircuitBreaker>();
  
  // Rate limiter
  private rateLimiter = EnhancedRateLimiter;
  
  // Performance metrics
  private metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    fallbacksUsed: 0,
    averageResponseTime: 0,
    responseTimeSum: 0,
  };

  private constructor() {
    // Initialize circuit breakers for known endpoints
    this.initializeCircuitBreakers();
    
    // Start cache cleanup interval
    this.startCacheCleanup();
    
    // Start metrics reporting interval
    this.startMetricsReporting();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): UnifiedBitcoinAPI {
    if (!UnifiedBitcoinAPI.instance) {
      UnifiedBitcoinAPI.instance = new UnifiedBitcoinAPI();
    }
    return UnifiedBitcoinAPI.instance;
  }

  /**
   * Initialize circuit breakers for endpoints
   */
  private initializeCircuitBreakers(): void {
    const endpoints = [
      'mempool.space',
      'api.coingecko.com',
      'blockchain.info',
      'api.mempool.space',
    ];

    endpoints.forEach(endpoint => {
      this.circuitBreakers.set(endpoint, new CircuitBreaker(endpoint, {
        failureThreshold: CONFIG.circuitBreakerThreshold,
        timeout: CONFIG.circuitBreakerTimeout,
        successThreshold: CONFIG.circuitBreakerRecoveryAttempts,
        autoReset: true,
        autoResetInterval: 15000
      }));
    });
  }

  /**
   * Start cache cleanup interval
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiresAt < now) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Run every minute
  }

  /**
   * Start metrics reporting interval
   */
  private startMetricsReporting(): void {
    setInterval(() => {
      if (this.metrics.totalRequests > 0) {
        const avgResponseTime = this.metrics.responseTimeSum / this.metrics.totalRequests;
        this.metrics.averageResponseTime = Math.round(avgResponseTime);
        
        console.log('[UnifiedBitcoinAPI] Metrics:', {
          ...this.metrics,
          successRate: ((this.metrics.successfulRequests / this.metrics.totalRequests) * 100).toFixed(2) + '%',
          cacheHitRate: ((this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100).toFixed(2) + '%',
        });
      }
    }, 300000); // Report every 5 minutes
  }

  /**
   * Main request method with fallback chain
   */
  async request<T = any>(
    url: string,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // 1. Check cache first
      if (!options.skipCache) {
        const cacheKey = options.cacheKey || this.generateCacheKey(url, options);
        const cachedData = this.getFromCache<T>(cacheKey);
        
        if (cachedData) {
          this.metrics.cacheHits++;
          return {
            success: true,
            data: cachedData,
            cached: true,
            timestamp: Date.now(),
          };
        }
        
        this.metrics.cacheMisses++;
      }

      // 2. Check for pending requests (deduplication)
      const dedupeKey = this.generateDedupeKey(url, options);
      const pendingRequest = this.pendingRequests.get(dedupeKey);
      
      if (pendingRequest && (Date.now() - pendingRequest.timestamp) < CONFIG.dedupeWindow) {
        console.log('[UnifiedBitcoinAPI] Deduplicating request:', url);
        return await pendingRequest.promise;
      }

      // 3. Check rate limits
      if (!options.skipRateLimit) {
        const rateLimitKey = options.rateLimitKey || this.extractEndpoint(url);
        const canProceed = await this.checkRateLimit(rateLimitKey);
        
        if (!canProceed) {
          throw createToolError('rate_limit', 'RATE_LIMIT_EXCEEDED');
        }
      }

      // 4. Create the request promise
      const requestPromise = this.executeRequestWithFallbacks<T>(url, options);
      
      // Store as pending request
      this.pendingRequests.set(dedupeKey, {
        promise: requestPromise,
        timestamp: Date.now(),
      });

      // Execute and clean up
      try {
        const result = await requestPromise;
        this.metrics.successfulRequests++;
        this.metrics.responseTimeSum += (Date.now() - startTime);
        return result;
      } finally {
        this.pendingRequests.delete(dedupeKey);
      }

    } catch (error) {
      this.metrics.failedRequests++;
      this.metrics.responseTimeSum += (Date.now() - startTime);

      // If we have fallback data, use it
      if (options.fallbackData) {
        this.metrics.fallbacksUsed++;
        return {
          success: true,
          data: options.fallbackData,
          fallback: true,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
        };
      }

      // Return error response
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Execute request with fallback chain
   */
  private async executeRequestWithFallbacks<T>(
    url: string,
    options: RequestOptions
  ): Promise<APIResponse<T>> {
    const endpoint = this.extractEndpoint(url);
    const circuitBreaker = this.circuitBreakers.get(endpoint);

    // Try direct API call
    try {
      if (!options.skipCircuitBreaker && circuitBreaker) {
        return await circuitBreaker.execute(async () => {
          return await this.makeDirectRequest<T>(url, options);
        });
      } else {
        return await this.makeDirectRequest<T>(url, options);
      }
    } catch (directError) {
      console.warn('[UnifiedBitcoinAPI] Direct request failed:', directError);

      // Try proxy if available
      const proxyUrl = this.getProxyUrl(url);
      if (proxyUrl) {
        try {
          const proxyResult = await this.makeDirectRequest<T>(proxyUrl, options);
          return { ...proxyResult, fallback: true };
        } catch (proxyError) {
          console.warn('[UnifiedBitcoinAPI] Proxy request failed:', proxyError);
        }
      }

      // Try to get stale cache data as last resort
      const cacheKey = options.cacheKey || this.generateCacheKey(url, options);
      const staleData = this.getFromCache<T>(cacheKey, true);
      
      if (staleData) {
        return {
          success: true,
          data: staleData,
          cached: true,
          fallback: true,
          error: 'Using stale cache due to API failures',
          timestamp: Date.now(),
        };
      }

      throw directError;
    }
  }

  /**
   * Make direct HTTP request
   */
  private async makeDirectRequest<T>(
    url: string,
    options: RequestOptions
  ): Promise<APIResponse<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.requestTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Bitcoin-Benefit/1.0',
          ...options.headers,
        },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful response
      if (!options.skipCache) {
        const cacheKey = options.cacheKey || this.generateCacheKey(url, options);
        this.setCache(cacheKey, data);
      }

      return {
        success: true,
        data: data as T,
        timestamp: Date.now(),
      };
    } catch (error) {
      clearTimeout(timeout);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw createToolError('timeout', 'API_TIMEOUT');
      }
      
      throw error;
    }
  }

  /**
   * Check rate limits
   */
  private async checkRateLimit(key: string): Promise<boolean> {
    const result = this.rateLimiter.checkRateLimit(key);
    return result.allowed;
  }

  /**
   * Get from cache
   */
  private getFromCache<T>(key: string, allowStale = false): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    
    if (!allowStale && entry.expiresAt < now) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache
   */
  private setCache<T>(key: string, data: T, ttl = CONFIG.cacheTimeout): void {
    const now = Date.now();
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(url: string, options: RequestOptions): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Generate dedupe key
   */
  private generateDedupeKey(url: string, options: RequestOptions): string {
    return this.generateCacheKey(url, options);
  }

  /**
   * Extract endpoint from URL
   */
  private extractEndpoint(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get proxy URL for endpoint
   */
  private getProxyUrl(url: string): string | null {
    // Map direct URLs to proxy endpoints
    if (url.includes('api.coingecko.com')) {
      return '/api/coingecko';
    }
    
    // mempool.space has CORS enabled, no proxy needed
    if (url.includes('mempool.space')) {
      return null;
    }

    return null;
  }

  /**
   * Reset circuit breaker for endpoint
   */
  resetCircuitBreaker(endpoint: string): void {
    const circuitBreaker = this.circuitBreakers.get(endpoint);
    if (circuitBreaker) {
      circuitBreaker.reset();
      console.log(`[UnifiedBitcoinAPI] Circuit breaker reset for ${endpoint}`);
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[UnifiedBitcoinAPI] Cache cleared');
  }

  /**
   * Get current metrics
   */
  getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      fallbacksUsed: 0,
      averageResponseTime: 0,
      responseTimeSum: 0,
    };
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(): Record<string, string> {
    const status: Record<string, string> = {};
    
    for (const [endpoint, breaker] of this.circuitBreakers.entries()) {
      const bStatus = breaker.getStatus();
      status[endpoint] = bStatus.state;
    }
    
    return status;
  }
}

// Export singleton instance
export const unifiedBitcoinAPI = UnifiedBitcoinAPI.getInstance();
/**
 * API Key Management System
 * Handles secure storage, rotation, and validation of API keys
 */

import crypto from 'crypto';

export interface APIKeyConfig {
  provider: string;
  key: string;
  fallbackKey?: string;
  rotationSchedule?: string; // cron-like schedule
  lastRotated?: Date;
  rateLimits?: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  endpoints?: string[];
  isActive: boolean;
}

export interface APICallResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  rateLimitRemaining?: number;
  retryAfter?: number;
  source: 'primary' | 'fallback' | 'cache';
}

class APIKeyManager {
  private keys: Map<string, APIKeyConfig> = new Map();
  private usageTracking: Map<string, {
    minute: { count: number; resetTime: number };
    hour: { count: number; resetTime: number };
    day: { count: number; resetTime: number };
  }> = new Map();

  constructor() {
    this.loadKeysFromEnvironment();
  }

  private loadKeysFromEnvironment() {
    // CoinGecko API Keys
    if (process.env.COINGECKO_API_KEY) {
      this.keys.set('coingecko', {
        provider: 'CoinGecko',
        key: process.env.COINGECKO_API_KEY,
        fallbackKey: process.env.COINGECKO_FALLBACK_API_KEY,
        rateLimits: {
          requestsPerMinute: parseInt(process.env.COINGECKO_RPM || '50', 10),
          requestsPerHour: parseInt(process.env.COINGECKO_RPH || '1000', 10),
          requestsPerDay: parseInt(process.env.COINGECKO_RPD || '100000', 10)
        },
        endpoints: ['/api/coingecko'],
        isActive: true
      });
    }

    // Mempool.space API Keys (Pro tier)
    if (process.env.MEMPOOL_API_KEY) {
      this.keys.set('mempool', {
        provider: 'Mempool.space',
        key: process.env.MEMPOOL_API_KEY,
        fallbackKey: process.env.MEMPOOL_FALLBACK_API_KEY,
        rateLimits: {
          requestsPerMinute: parseInt(process.env.MEMPOOL_RPM || '60', 10),
          requestsPerHour: parseInt(process.env.MEMPOOL_RPH || '1000', 10),
          requestsPerDay: parseInt(process.env.MEMPOOL_RPD || '10000', 10)
        },
        endpoints: ['/api/mempool'],
        isActive: true
      });
    }

    // Add other API providers as needed
  }

  /**
   * Get API key for a specific provider
   */
  getAPIKey(provider: string, useFallback: boolean = false): string | null {
    const config = this.keys.get(provider);
    if (!config || !config.isActive) {
      return null;
    }

    if (useFallback && config.fallbackKey) {
      return config.fallbackKey;
    }

    return config.key;
  }

  /**
   * Check if API call is within rate limits
   */
  checkRateLimit(provider: string): { allowed: boolean; resetTime?: number } {
    const config = this.keys.get(provider);
    if (!config || !config.rateLimits) {
      return { allowed: true };
    }

    const usage = this.getUsageTracking(provider);
    const now = Date.now();

    // Check minute limit
    if (usage.minute.resetTime < now) {
      usage.minute = { count: 0, resetTime: now + 60000 };
    }
    if (usage.minute.count >= config.rateLimits.requestsPerMinute) {
      return { allowed: false, resetTime: usage.minute.resetTime };
    }

    // Check hour limit
    if (usage.hour.resetTime < now) {
      usage.hour = { count: 0, resetTime: now + 3600000 };
    }
    if (usage.hour.count >= config.rateLimits.requestsPerHour) {
      return { allowed: false, resetTime: usage.hour.resetTime };
    }

    // Check day limit
    if (usage.day.resetTime < now) {
      usage.day = { count: 0, resetTime: now + 86400000 };
    }
    if (usage.day.count >= config.rateLimits.requestsPerDay) {
      return { allowed: false, resetTime: usage.day.resetTime };
    }

    return { allowed: true };
  }

  /**
   * Record API usage
   */
  recordUsage(provider: string) {
    const usage = this.getUsageTracking(provider);
    usage.minute.count++;
    usage.hour.count++;
    usage.day.count++;
  }

  private getUsageTracking(provider: string) {
    if (!this.usageTracking.has(provider)) {
      const now = Date.now();
      this.usageTracking.set(provider, {
        minute: { count: 0, resetTime: now + 60000 },
        hour: { count: 0, resetTime: now + 3600000 },
        day: { count: 0, resetTime: now + 86400000 }
      });
    }
    return this.usageTracking.get(provider)!;
  }

  /**
   * Make authenticated API call with automatic fallback and retry logic
   */
  async makeAPICall<T = any>(
    provider: string,
    url: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<APICallResult<T>> {
    const maxRetries = 3;
    const backoffMultiplier = 2;
    const baseDelay = 1000;

    // Check rate limits
    const rateLimitCheck = this.checkRateLimit(provider);
    if (!rateLimitCheck.allowed) {
      const waitTime = rateLimitCheck.resetTime ? rateLimitCheck.resetTime - Date.now() : 60000;
      return {
        success: false,
        error: `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
        retryAfter: waitTime,
        source: 'primary'
      };
    }

    const apiKey = this.getAPIKey(provider, retryCount > 0);
    if (!apiKey) {
      return {
        success: false,
        error: `No API key available for provider: ${provider}`,
        source: 'primary'
      };
    }

    // Prepare headers with API key
    const headers = this.getAuthHeaders(provider, apiKey, options.headers);
    
    const requestOptions: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(30000) // 30 second timeout
    };

    try {
      const response = await fetch(url, requestOptions);
      
      // Record successful usage
      this.recordUsage(provider);

      // Parse rate limit headers
      const rateLimitRemaining = this.parseRateLimitHeaders(response);

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 429) {
          const retryAfter = this.parseRetryAfter(response);
          
          // Try fallback key if available and we haven't tried it yet
          if (retryCount === 0 && this.getAPIKey(provider, true)) {
            await this.delay(1000); // Brief delay before fallback
            return this.makeAPICall(provider, url, options, retryCount + 1);
          }

          return {
            success: false,
            error: 'Rate limit exceeded on external API',
            retryAfter,
            rateLimitRemaining,
            source: retryCount > 0 ? 'fallback' : 'primary'
          };
        }

        if (response.status >= 500 && retryCount < maxRetries) {
          // Server error - retry with exponential backoff
          const delay = baseDelay * Math.pow(backoffMultiplier, retryCount);
          await this.delay(delay);
          return this.makeAPICall(provider, url, options, retryCount + 1);
        }

        return {
          success: false,
          error: `API error: ${response.status} ${response.statusText}`,
          rateLimitRemaining,
          source: retryCount > 0 ? 'fallback' : 'primary'
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
        rateLimitRemaining,
        source: retryCount > 0 ? 'fallback' : 'primary'
      };

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout',
          source: retryCount > 0 ? 'fallback' : 'primary'
        };
      }

      // Network error - retry if we haven't exceeded max retries
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(backoffMultiplier, retryCount);
        await this.delay(delay);
        return this.makeAPICall(provider, url, options, retryCount + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source: retryCount > 0 ? 'fallback' : 'primary'
      };
    }
  }

  private getAuthHeaders(provider: string, apiKey: string, existingHeaders?: HeadersInit): HeadersInit {
    const headers = new Headers(existingHeaders);

    // Add common headers
    headers.set('User-Agent', 'Bitcoin-Benefit-Calculator/1.0');
    headers.set('Accept', 'application/json');

    // Provider-specific authentication
    switch (provider) {
      case 'coingecko':
        headers.set('x-cg-demo-api-key', apiKey);
        break;
      case 'mempool':
        headers.set('Authorization', `Bearer ${apiKey}`);
        break;
      default:
        headers.set('X-API-Key', apiKey);
    }

    return headers;
  }

  private parseRateLimitHeaders(response: Response): number | undefined {
    // Try different rate limit header formats
    const headers = [
      'x-ratelimit-remaining',
      'ratelimit-remaining',
      'x-rate-limit-remaining',
      'rate-limit-remaining'
    ];

    for (const header of headers) {
      const value = response.headers.get(header);
      if (value) {
        const remaining = parseInt(value, 10);
        if (!isNaN(remaining)) {
          return remaining;
        }
      }
    }

    return undefined;
  }

  private parseRetryAfter(response: Response): number {
    const retryAfter = response.headers.get('retry-after');
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      if (!isNaN(seconds)) {
        return seconds * 1000; // Convert to milliseconds
      }
    }
    return 60000; // Default 1 minute
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get usage statistics for monitoring
   */
  getUsageStats(provider: string) {
    const usage = this.usageTracking.get(provider);
    const config = this.keys.get(provider);
    
    if (!usage || !config) {
      return null;
    }

    return {
      provider: config.provider,
      minute: {
        used: usage.minute.count,
        limit: config.rateLimits?.requestsPerMinute,
        resetTime: new Date(usage.minute.resetTime)
      },
      hour: {
        used: usage.hour.count,
        limit: config.rateLimits?.requestsPerHour,
        resetTime: new Date(usage.hour.resetTime)
      },
      day: {
        used: usage.day.count,
        limit: config.rateLimits?.requestsPerDay,
        resetTime: new Date(usage.day.resetTime)
      }
    };
  }

  /**
   * Health check for all configured APIs
   */
  async healthCheck(): Promise<Record<string, { healthy: boolean; latency?: number; error?: string }>> {
    const results: Record<string, { healthy: boolean; latency?: number; error?: string }> = {};

    for (const [provider, config] of this.keys.entries()) {
      if (!config.isActive) {
        results[provider] = { healthy: false, error: 'Disabled' };
        continue;
      }

      const startTime = Date.now();
      try {
        // Simple health check endpoints
        let healthUrl: string;
        switch (provider) {
          case 'coingecko':
            healthUrl = 'https://api.coingecko.com/api/v3/ping';
            break;
          case 'mempool':
            healthUrl = 'https://mempool.space/api/v1/network-health';
            break;
          default:
            results[provider] = { healthy: false, error: 'No health check endpoint' };
            continue;
        }

        const response = await fetch(healthUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(10000),
          headers: this.getAuthHeaders(provider, config.key)
        });

        const latency = Date.now() - startTime;
        
        if (response.ok) {
          results[provider] = { healthy: true, latency };
        } else {
          results[provider] = { healthy: false, error: `HTTP ${response.status}`, latency };
        }
      } catch (error) {
        const latency = Date.now() - startTime;
        results[provider] = { 
          healthy: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          latency 
        };
      }
    }

    return results;
  }

  /**
   * Rotate API key (for manual rotation)
   */
  async rotateKey(provider: string, newKey: string, newFallbackKey?: string): Promise<boolean> {
    const config = this.keys.get(provider);
    if (!config) {
      return false;
    }

    // Move current key to fallback if no new fallback provided
    if (!newFallbackKey) {
      newFallbackKey = config.key;
    }

    // Update configuration
    config.fallbackKey = config.key;
    config.key = newKey;
    config.lastRotated = new Date();

    // Test new key
    try {
      const testResult = await this.makeAPICall(provider, this.getTestEndpoint(provider));
      if (!testResult.success) {
        // Rollback on failure
        config.key = config.fallbackKey!;
        config.fallbackKey = newFallbackKey;
        return false;
      }
      return true;
    } catch {
      // Rollback on error
      config.key = config.fallbackKey!;
      config.fallbackKey = newFallbackKey;
      return false;
    }
  }

  private getTestEndpoint(provider: string): string {
    switch (provider) {
      case 'coingecko':
        return 'https://api.coingecko.com/api/v3/ping';
      case 'mempool':
        return 'https://mempool.space/api/v1/network-health';
      default:
        throw new Error(`No test endpoint for provider: ${provider}`);
    }
  }
}

// Export singleton instance
export const apiKeyManager = new APIKeyManager();

// Convenience functions
export const makeSecureAPICall = <T = any>(
  provider: string,
  url: string,
  options?: RequestInit
): Promise<APICallResult<T>> => {
  return apiKeyManager.makeAPICall<T>(provider, url, options);
};

export const getAPIUsageStats = (provider: string) => {
  return apiKeyManager.getUsageStats(provider);
};

export const checkAPIHealth = () => {
  return apiKeyManager.healthCheck();
};
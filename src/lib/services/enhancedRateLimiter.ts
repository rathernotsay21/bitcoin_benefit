/**
 * Enhanced Rate Limiter for Bitcoin Tools
 * 
 * Provides sophisticated client-side rate limiting with:
 * - Multiple rate limiting strategies (fixed window, sliding window, token bucket)
 * - Adaptive rate limiting based on user behavior
 * - Protection against malicious usage patterns
 * - User-friendly feedback and progressive delays
 * - Integration with privacy manager for logging
 */

import { PrivacyManager } from './privacyManager';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  strategy: 'fixed_window' | 'sliding_window' | 'token_bucket';
  burstAllowance?: number;
  backoffMultiplier?: number;
  maxBackoffMs?: number;
  whitelistPatterns?: RegExp[];
  blacklistPatterns?: RegExp[];
}

export interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: number;
  retryAfterMs?: number;
  reason?: string;
  warningMessage?: string;
}

export interface RequestAttempt {
  timestamp: number;
  endpoint: string;
  success: boolean;
  blocked: boolean;
  userAgent: string;
  sessionId: string;
}

export interface BehaviorPattern {
  rapidFireAttempts: number;
  totalAttempts: number;
  uniqueEndpoints: Set<string>;
  timeSpan: number;
  suspiciousScore: number;
}

class EnhancedRateLimiterService {
  private static instance: EnhancedRateLimiterService;
  
  // Rate limiting state
  private fixedWindowCounters = new Map<string, { count: number; resetTime: number }>();
  private slidingWindowRequests = new Map<string, number[]>();
  private tokenBuckets = new Map<string, { tokens: number; lastRefill: number }>();
  
  // Behavioral analysis
  private requestHistory: RequestAttempt[] = [];
  private suspiciousPatterns = new Map<string, BehaviorPattern>();
  private blockedSessions = new Set<string>();
  private userWarnings = new Map<string, number>();

  // Default configurations for different endpoints
  private readonly DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
    'transaction-lookup': {
      maxRequests: 10,
      windowMs: 60000, // 1 minute
      strategy: 'sliding_window',
      burstAllowance: 3,
      backoffMultiplier: 2,
      maxBackoffMs: 300000 // 5 minutes
    },
    'address-explorer': {
      maxRequests: 5,
      windowMs: 60000,
      strategy: 'sliding_window',
      burstAllowance: 2,
      backoffMultiplier: 3,
      maxBackoffMs: 600000, // 10 minutes (addresses are more sensitive)
      blacklistPatterns: [/^(1{10,}|3{10,})/] // Obvious test addresses
    },
    'fee-calculator': {
      maxRequests: 30,
      windowMs: 60000,
      strategy: 'token_bucket',
      burstAllowance: 10
    },
    'network-status': {
      maxRequests: 20,
      windowMs: 60000,
      strategy: 'fixed_window',
      burstAllowance: 5
    },
    'document-timestamp': {
      maxRequests: 3,
      windowMs: 300000, // 5 minutes (more intensive operation)
      strategy: 'fixed_window',
      burstAllowance: 1,
      backoffMultiplier: 5,
      maxBackoffMs: 1800000 // 30 minutes
    }
  };

  static getInstance(): EnhancedRateLimiterService {
    if (!EnhancedRateLimiterService.instance) {
      EnhancedRateLimiterService.instance = new EnhancedRateLimiterService();
    }
    return EnhancedRateLimiterService.instance;
  }

  private constructor() {
    // Clean up old data periodically
    setInterval(() => {
      this.cleanupOldData();
    }, 60000); // Every minute
  }

  /**
   * Check if a request is allowed
   */
  checkRateLimit(
    endpoint: string, 
    sessionId: string = 'anonymous',
    additionalData?: any
  ): RateLimitResult {
    const config = this.DEFAULT_CONFIGS[endpoint] || this.DEFAULT_CONFIGS['transaction-lookup'];
    const now = Date.now();
    const key = `${endpoint}:${sessionId}`;

    // Check if session is blocked
    if (this.blockedSessions.has(sessionId)) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: now + 3600000, // 1 hour block
        retryAfterMs: 3600000,
        reason: 'session_blocked',
        warningMessage: 'Session blocked due to suspicious activity'
      };
    }

    // Check behavioral patterns
    const behaviorCheck = this.analyzeBehaviorPattern(endpoint, sessionId, additionalData);
    if (behaviorCheck.suspicious) {
      this.handleSuspiciousActivity(sessionId, endpoint);
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: now + 600000, // 10 minute timeout
        retryAfterMs: 600000,
        reason: 'suspicious_pattern',
        warningMessage: behaviorCheck.message
      };
    }

    // Apply rate limiting strategy
    let result: RateLimitResult;
    
    switch (config.strategy) {
      case 'fixed_window':
        result = this.checkFixedWindow(key, config, now);
        break;
      case 'sliding_window':
        result = this.checkSlidingWindow(key, config, now);
        break;
      case 'token_bucket':
        result = this.checkTokenBucket(key, config, now);
        break;
      default:
        result = this.checkFixedWindow(key, config, now);
    }

    // Log the attempt
    this.logRequestAttempt(endpoint, sessionId, result.allowed, now);

    // Apply progressive backoff for repeated violations
    if (!result.allowed) {
      const backoffMs = this.calculateBackoff(endpoint, sessionId, config);
      if (backoffMs > (result.retryAfterMs || 0)) {
        result.retryAfterMs = backoffMs;
        result.resetTime = now + backoffMs;
      }
    }

    return result;
  }

  /**
   * Record a successful request
   */
  recordRequest(endpoint: string, sessionId: string = 'anonymous'): void {
    const key = `${endpoint}:${sessionId}`;
    const config = this.DEFAULT_CONFIGS[endpoint] || this.DEFAULT_CONFIGS['transaction-lookup'];
    const now = Date.now();

    // Update counters based on strategy
    switch (config.strategy) {
      case 'fixed_window':
        this.updateFixedWindowCounter(key, now, config);
        break;
      case 'sliding_window':
        this.updateSlidingWindowHistory(key, now);
        break;
      case 'token_bucket':
        this.consumeToken(key, config, now);
        break;
    }

    // Log successful request
    this.logRequestAttempt(endpoint, sessionId, true, now);
    
    PrivacyManager.logDataUsage('rate-limiter', 'request_recorded', endpoint);
  }

  /**
   * Fixed window rate limiting
   */
  private checkFixedWindow(key: string, config: RateLimitConfig, now: number): RateLimitResult {
    const counter = this.fixedWindowCounters.get(key) || { count: 0, resetTime: now + config.windowMs };
    
    // Reset window if expired
    if (now >= counter.resetTime) {
      counter.count = 0;
      counter.resetTime = now + config.windowMs;
    }

    const allowed = counter.count < config.maxRequests;
    
    return {
      allowed,
      remainingRequests: Math.max(0, config.maxRequests - counter.count),
      resetTime: counter.resetTime,
      retryAfterMs: allowed ? undefined : counter.resetTime - now
    };
  }

  /**
   * Sliding window rate limiting
   */
  private checkSlidingWindow(key: string, config: RateLimitConfig, now: number): RateLimitResult {
    const requests = this.slidingWindowRequests.get(key) || [];
    
    // Remove requests outside the window
    const windowStart = now - config.windowMs;
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);
    
    const allowed = recentRequests.length < config.maxRequests;
    
    return {
      allowed,
      remainingRequests: Math.max(0, config.maxRequests - recentRequests.length),
      resetTime: recentRequests.length > 0 ? recentRequests[0] + config.windowMs : now + config.windowMs,
      retryAfterMs: allowed ? undefined : Math.max(1000, (recentRequests[0] + config.windowMs) - now)
    };
  }

  /**
   * Token bucket rate limiting
   */
  private checkTokenBucket(key: string, config: RateLimitConfig, now: number): RateLimitResult {
    const bucket = this.tokenBuckets.get(key) || { 
      tokens: config.maxRequests, 
      lastRefill: now 
    };

    // Refill tokens based on elapsed time
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(timePassed / config.windowMs) * config.maxRequests;
    
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(config.maxRequests, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }

    const allowed = bucket.tokens > 0;

    return {
      allowed,
      remainingRequests: bucket.tokens,
      resetTime: now + config.windowMs,
      retryAfterMs: allowed ? undefined : Math.max(1000, config.windowMs - (timePassed % config.windowMs))
    };
  }

  /**
   * Update fixed window counter
   */
  private updateFixedWindowCounter(key: string, now: number, config: RateLimitConfig): void {
    const counter = this.fixedWindowCounters.get(key) || { count: 0, resetTime: now + config.windowMs };
    
    if (now >= counter.resetTime) {
      counter.count = 1;
      counter.resetTime = now + config.windowMs;
    } else {
      counter.count++;
    }
    
    this.fixedWindowCounters.set(key, counter);
  }

  /**
   * Update sliding window history
   */
  private updateSlidingWindowHistory(key: string, now: number): void {
    const requests = this.slidingWindowRequests.get(key) || [];
    requests.push(now);
    this.slidingWindowRequests.set(key, requests);
  }

  /**
   * Consume token from bucket
   */
  private consumeToken(key: string, config: RateLimitConfig, now: number): void {
    const bucket = this.tokenBuckets.get(key) || { 
      tokens: config.maxRequests, 
      lastRefill: now 
    };
    
    if (bucket.tokens > 0) {
      bucket.tokens--;
      this.tokenBuckets.set(key, bucket);
    }
  }

  /**
   * Analyze user behavior patterns for suspicious activity
   */
  private analyzeBehaviorPattern(
    endpoint: string, 
    sessionId: string, 
    additionalData?: any
  ): { suspicious: boolean; message?: string } {
    const now = Date.now();
    const recentHistory = this.requestHistory
      .filter(req => req.sessionId === sessionId && now - req.timestamp < 300000) // Last 5 minutes
      .sort((a, b) => b.timestamp - a.timestamp);

    if (recentHistory.length === 0) {
      return { suspicious: false };
    }

    // Check for rapid-fire requests
    const rapidFireWindow = 10000; // 10 seconds
    const rapidFireAttempts = recentHistory.filter(req => now - req.timestamp < rapidFireWindow).length;
    
    if (rapidFireAttempts > 10) {
      return {
        suspicious: true,
        message: 'Too many requests in a short time period. Please slow down.'
      };
    }

    // Check for address scanning patterns (for address explorer)
    if (endpoint === 'address-explorer' && additionalData?.address) {
      const addressRequests = recentHistory.filter(req => req.endpoint === 'address-explorer');
      if (addressRequests.length > 20) {
        return {
          suspicious: true,
          message: 'Excessive address lookups detected. This tool is for occasional use.'
        };
      }
    }

    // Check for systematic scanning (multiple different endpoints)
    const uniqueEndpoints = new Set(recentHistory.map(req => req.endpoint));
    if (uniqueEndpoints.size > 3 && recentHistory.length > 30) {
      return {
        suspicious: true,
        message: 'Automated scanning detected. Please use tools responsibly.'
      };
    }

    // Check for repeated failed attempts
    const failedAttempts = recentHistory.filter(req => req.blocked).length;
    if (failedAttempts > 5) {
      return {
        suspicious: true,
        message: 'Multiple rate limit violations. Extended cooldown applied.'
      };
    }

    return { suspicious: false };
  }

  /**
   * Handle suspicious activity
   */
  private handleSuspiciousActivity(sessionId: string, endpoint: string): void {
    const warningCount = this.userWarnings.get(sessionId) || 0;
    
    if (warningCount >= 2) {
      // Block session after multiple warnings
      this.blockedSessions.add(sessionId);
      PrivacyManager.logDataUsage('rate-limiter', 'session_blocked', endpoint);
    } else {
      this.userWarnings.set(sessionId, warningCount + 1);
      PrivacyManager.logDataUsage('rate-limiter', 'suspicious_activity_warning', endpoint);
    }
  }

  /**
   * Calculate progressive backoff for repeated violations
   */
  private calculateBackoff(endpoint: string, sessionId: string, config: RateLimitConfig): number {
    if (!config.backoffMultiplier) return 0;

    const violations = this.requestHistory.filter(req => 
      req.sessionId === sessionId && 
      req.endpoint === endpoint && 
      req.blocked &&
      Date.now() - req.timestamp < 3600000 // Last hour
    ).length;

    const backoffMs = Math.min(
      config.windowMs * Math.pow(config.backoffMultiplier, violations),
      config.maxBackoffMs || 300000
    );

    return backoffMs;
  }

  /**
   * Log request attempt for analysis
   */
  private logRequestAttempt(
    endpoint: string, 
    sessionId: string, 
    allowed: boolean, 
    timestamp: number
  ): void {
    const attempt: RequestAttempt = {
      timestamp,
      endpoint,
      success: allowed,
      blocked: !allowed,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      sessionId
    };

    this.requestHistory.push(attempt);

    // Keep only last 1000 entries to prevent memory bloat
    if (this.requestHistory.length > 1000) {
      this.requestHistory = this.requestHistory.slice(-1000);
    }
  }

  /**
   * Clean up old data
   */
  private cleanupOldData(): void {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    // Clean up fixed window counters
    const fixedWindowEntries = Array.from(this.fixedWindowCounters.entries());
    for (const [key, counter] of fixedWindowEntries) {
      if (counter.resetTime < now) {
        this.fixedWindowCounters.delete(key);
      }
    }

    // Clean up sliding window requests
    const slidingWindowEntries = Array.from(this.slidingWindowRequests.entries());
    for (const [key, requests] of slidingWindowEntries) {
      const recentRequests = requests.filter((timestamp: number) => timestamp > oneHourAgo);
      if (recentRequests.length === 0) {
        this.slidingWindowRequests.delete(key);
      } else if (recentRequests.length < requests.length) {
        this.slidingWindowRequests.set(key, recentRequests);
      }
    }

    // Clean up request history
    this.requestHistory = this.requestHistory.filter(req => req.timestamp > oneHourAgo);

    // Clean up old warnings
    const activeSessions = new Set(this.requestHistory.map(req => req.sessionId));
    const warningKeys = Array.from(this.userWarnings.keys());
    for (const sessionId of warningKeys) {
      if (!activeSessions.has(sessionId)) {
        this.userWarnings.delete(sessionId);
      }
    }
  }

  /**
   * Get rate limiting statistics
   */
  getRateLimitStats(): {
    totalRequests: number;
    blockedRequests: number;
    blockedSessions: number;
    topEndpoints: Array<{ endpoint: string; requests: number }>;
    recentActivity: RequestAttempt[];
  } {
    const totalRequests = this.requestHistory.length;
    const blockedRequests = this.requestHistory.filter(req => req.blocked).length;
    
    const endpointCounts = new Map<string, number>();
    this.requestHistory.forEach(req => {
      endpointCounts.set(req.endpoint, (endpointCounts.get(req.endpoint) || 0) + 1);
    });
    
    const topEndpoints = Array.from(endpointCounts.entries())
      .map(([endpoint, requests]) => ({ endpoint, requests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5);

    return {
      totalRequests,
      blockedRequests,
      blockedSessions: this.blockedSessions.size,
      topEndpoints,
      recentActivity: this.requestHistory.slice(-10)
    };
  }

  /**
   * Reset rate limits for a session (admin function)
   */
  resetSessionLimits(sessionId: string): void {
    this.blockedSessions.delete(sessionId);
    this.userWarnings.delete(sessionId);
    
    // Remove from all rate limit counters
    const fixedWindowKeys = Array.from(this.fixedWindowCounters.keys());
    for (const key of fixedWindowKeys) {
      if (key.includes(sessionId)) {
        this.fixedWindowCounters.delete(key);
      }
    }
    
    const slidingWindowKeys = Array.from(this.slidingWindowRequests.keys());
    for (const key of slidingWindowKeys) {
      if (key.includes(sessionId)) {
        this.slidingWindowRequests.delete(key);
      }
    }
    
    const tokenBucketKeys = Array.from(this.tokenBuckets.keys());
    for (const key of tokenBucketKeys) {
      if (key.includes(sessionId)) {
        this.tokenBuckets.delete(key);
      }
    }

    PrivacyManager.logDataUsage('rate-limiter', 'session_limits_reset', sessionId);
  }
}

// Export singleton instance
export const EnhancedRateLimiter = EnhancedRateLimiterService.getInstance();

// Export types for external use
export type {
  RateLimitResult as EnhancedRateLimitResult,
  RateLimitConfig as EnhancedRateLimitConfig,
  RequestAttempt as EnhancedRequestAttempt,
  BehaviorPattern as EnhancedBehaviorPattern
};
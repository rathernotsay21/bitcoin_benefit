/**
 * API Security Middleware
 * Combines rate limiting, authentication, monitoring, and security headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter, RateLimitConfig } from './rateLimiter';
import { apiKeyManager } from './apiKeyManager';
import { recordAPIMetric } from './apiMonitoring';
import { executeWithCircuitBreaker } from './circuitBreaker';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export interface SecurityConfig {
  rateLimit?: RateLimitConfig;
  requireAuth?: boolean;
  allowedOrigins?: string[];
  enableCSRF?: boolean;
  enableSignatureValidation?: boolean;
  enableRequestLogging?: boolean;
  enableMetrics?: boolean;
  customValidation?: (req: NextRequest) => Promise<{ valid: boolean; error?: string }>;
}

export interface RequestMetrics {
  timestamp: number;
  method: string;
  path: string;
  ip: string;
  userAgent: string;
  duration: number;
  statusCode: number;
  error?: string;
  rateLimited: boolean;
}

class APISecurityMiddleware {
  private rateLimiters: Map<string, RateLimiter> = new Map();
  private metrics: RequestMetrics[] = [];
  private maxMetricsEntries = 10000;

  constructor() {
    // Initialize default rate limiters
    this.setupDefaultRateLimiters();
    
    // Clean up old metrics every hour
    setInterval(() => {
      this.cleanupMetrics();
    }, 3600000);
  }

  private setupDefaultRateLimiters() {
    // API endpoint rate limiters
    this.rateLimiters.set('coingecko', new RateLimiter({
      windowMs: 60 * 1000, // 1 minute
      max: parseInt(process.env.COINGECKO_RATE_LIMIT || '10', 10),
      message: 'CoinGecko API rate limit exceeded'
    }));

    this.rateLimiters.set('mempool', new RateLimiter({
      windowMs: 60 * 1000, // 1 minute  
      max: parseInt(process.env.MEMPOOL_RATE_LIMIT || '30', 10),
      message: 'Mempool API rate limit exceeded'
    }));

    this.rateLimiters.set('timestamps', new RateLimiter({
      windowMs: 60 * 1000, // 1 minute
      max: parseInt(process.env.TIMESTAMP_RATE_LIMIT || '5', 10),
      message: 'Timestamp API rate limit exceeded'
    }));

    this.rateLimiters.set('general', new RateLimiter({
      windowMs: 60 * 1000, // 1 minute
      max: parseInt(process.env.GENERAL_RATE_LIMIT || '100', 10),
      message: 'API rate limit exceeded'
    }));
  }

  /**
   * Main security middleware function
   */
  async secureEndpoint(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<Response>,
    config: SecurityConfig = {}
  ): Promise<Response> {
    const startTime = Date.now();
    const path = request.nextUrl.pathname;
    const ip = this.getClientIP(request);
    
    try {
      // 1. Security Headers
      const securityHeaders = this.getSecurityHeaders(request, config);

      // 2. CORS Check
      const corsResult = this.checkCORS(request, config);
      if (!corsResult.valid) {
        return this.createErrorResponse(corsResult.error!, 403, securityHeaders);
      }

      // 3. Rate Limiting
      const rateLimiter = this.getRateLimiter(path, config);
      const rateLimitResult = await rateLimiter.checkLimit(request);
      
      if (!rateLimitResult.success) {
        this.recordMetrics(request, startTime, 429, rateLimitResult.error, true);
        return this.createErrorResponse(
          rateLimitResult.error!,
          429,
          { ...securityHeaders, ...rateLimitResult.headers }
        );
      }

      // 4. Authentication (if required)
      if (config.requireAuth) {
        const authResult = this.validateAuthentication(request);
        if (!authResult.valid) {
          this.recordMetrics(request, startTime, 401, authResult.error);
          return this.createErrorResponse(authResult.error!, 401, securityHeaders);
        }
      }

      // 5. CSRF Protection
      if (config.enableCSRF && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        const csrfResult = this.validateCSRF(request);
        if (!csrfResult.valid) {
          this.recordMetrics(request, startTime, 403, csrfResult.error);
          return this.createErrorResponse(csrfResult.error!, 403, securityHeaders);
        }
      }

      // 6. Request Signature Validation
      if (config.enableSignatureValidation) {
        const signatureResult = await this.validateRequestSignature(request);
        if (!signatureResult.valid) {
          this.recordMetrics(request, startTime, 401, signatureResult.error);
          return this.createErrorResponse(signatureResult.error!, 401, securityHeaders);
        }
      }

      // 7. Custom Validation
      if (config.customValidation) {
        const customResult = await config.customValidation(request);
        if (!customResult.valid) {
          this.recordMetrics(request, startTime, 400, customResult.error);
          return this.createErrorResponse(customResult.error!, 400, securityHeaders);
        }
      }

      // 8. Execute handler with circuit breaker protection
      const serviceName = this.getServiceNameFromPath(path);
      const response = await executeWithCircuitBreaker(
        serviceName,
        () => handler(request),
        {
          failureThreshold: 3,
          successThreshold: 2,
          timeout: 30000
        }
      );
      
      // 9. Add security headers to response
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // 10. Add rate limit headers
      Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // 11. Record metrics
      this.recordMetrics(request, startTime, response.status);
      
      // 12. Record API monitoring metric
      recordAPIMetric({
        timestamp: startTime,
        endpoint: path,
        method: request.method,
        statusCode: response.status,
        responseTime: Date.now() - startTime,
        ip: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        provider: this.getProviderFromPath(path)
      });

      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      this.recordMetrics(request, startTime, 500, errorMessage);
      
      // Record error metric
      recordAPIMetric({
        timestamp: startTime,
        endpoint: path,
        method: request.method,
        statusCode: 500,
        responseTime: Date.now() - startTime,
        ip: this.getClientIP(request),
        userAgent: request.headers.get('user-agent') || undefined,
        error: errorMessage,
        provider: this.getProviderFromPath(path)
      });
      
      return this.createErrorResponse(
        'Internal server error',
        500,
        this.getSecurityHeaders(request, config)
      );
    }
  }

  private getClientIP(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
    return forwardedFor?.split(',')[0] || realIP || cfConnectingIP || 'unknown';
  }

  private getRateLimiter(path: string, config: SecurityConfig): RateLimiter {
    // Custom rate limiter from config
    if (config.rateLimit) {
      return new RateLimiter(config.rateLimit);
    }

    // Path-specific rate limiters
    if (path.includes('/coingecko')) {
      return this.rateLimiters.get('coingecko')!;
    }
    if (path.includes('/mempool')) {
      return this.rateLimiters.get('mempool')!;
    }
    if (path.includes('/timestamps')) {
      return this.rateLimiters.get('timestamps')!;
    }

    // Default rate limiter
    return this.rateLimiters.get('general')!;
  }

  private getSecurityHeaders(request: NextRequest, config: SecurityConfig): Record<string, string> {
    const headers: Record<string, string> = {
      // Basic security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      
      // API-specific headers
      'X-API-Version': '1.0',
      'X-Rate-Limit-Policy': 'standard',
      'X-Request-ID': crypto.randomUUID(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    // CORS headers
    const origin = request.headers.get('origin');
    if (origin && this.isOriginAllowed(origin, config)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
      headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, X-API-Key';
      headers['Access-Control-Max-Age'] = '86400'; // 24 hours
    }

    return headers;
  }

  private checkCORS(request: NextRequest, config: SecurityConfig): { valid: boolean; error?: string } {
    const origin = request.headers.get('origin');
    
    // Allow same-origin requests
    if (!origin) {
      return { valid: true };
    }

    // Check allowed origins
    if (!this.isOriginAllowed(origin, config)) {
      return { valid: false, error: 'CORS: Origin not allowed' };
    }

    return { valid: true };
  }

  private isOriginAllowed(origin: string, config: SecurityConfig): boolean {
    const allowedOrigins = config.allowedOrigins || [
      'http://localhost:3000',
      'https://localhost:3000',
      'https://bitcoin-benefit.netlify.app',
      process.env.NEXT_PUBLIC_SITE_URL
    ].filter(Boolean);

    return allowedOrigins.includes(origin) || allowedOrigins.includes('*');
  }

  private validateAuthentication(request: NextRequest): { valid: boolean; error?: string } {
    const authHeader = request.headers.get('authorization');
    const apiKey = request.headers.get('x-api-key');

    if (!authHeader && !apiKey) {
      return { valid: false, error: 'Authentication required' };
    }

    // Validate API key
    if (apiKey) {
      const validAPIKeys = process.env.VALID_API_KEYS?.split(',') || [];
      if (!validAPIKeys.includes(apiKey)) {
        return { valid: false, error: 'Invalid API key' };
      }
    }

    // Validate Bearer token
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      if (!this.validateJWT(token)) {
        return { valid: false, error: 'Invalid token' };
      }
    }

    return { valid: true };
  }

  private validateJWT(token: string): boolean {
    // SECURITY FIX: Proper JWT verification with signature validation
    try {
      // Get JWT secret from environment variables
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT_SECRET not configured in environment variables');
        throw new Error('JWT_SECRET environment variable is required');
      }

      // Verify JWT with proper signature validation
      const decoded = jwt.verify(token, jwtSecret, {
        algorithms: ['HS256'], // Specify allowed algorithms to prevent algorithm confusion
        issuer: process.env.JWT_ISSUER || 'bitcoin-benefit-app',
        audience: process.env.JWT_AUDIENCE || 'bitcoin-benefit-api',
        maxAge: '24h', // Maximum token age
        clockTolerance: 30 // Allow 30 seconds clock skew
      });

      // Additional custom validation
      if (typeof decoded === 'object' && decoded !== null) {
        const payload = decoded as jwt.JwtPayload;
        
        // Check if token is not expired (additional check)
        if (payload.exp && payload.exp < Date.now() / 1000) {
          return false;
        }

        // Check if token has required claims
        if (!payload.sub || !payload.iat) {
          console.warn('JWT missing required claims (sub, iat)');
          return false;
        }

        // Check if token is not used before its time
        if (payload.nbf && payload.nbf > Date.now() / 1000) {
          console.warn('JWT not yet valid (nbf claim)');
          return false;
        }

        return true;
      }

      return false;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.error('JWT validation error:', error.message);
      } else if (error instanceof jwt.TokenExpiredError) {
        console.error('JWT expired:', error.message);
      } else if (error instanceof jwt.NotBeforeError) {
        console.error('JWT not active yet:', error.message);
      } else {
        console.error('JWT validation error:', error);
      }
      return false;
    }
  }

  private validateCSRF(request: NextRequest): { valid: boolean; error?: string } {
    const csrfToken = request.headers.get('x-csrf-token');
    const cookieCSRF = request.headers.get('cookie')?.match(/csrfToken=([^;]+)/)?.[1];

    if (!csrfToken || !cookieCSRF) {
      return { valid: false, error: 'CSRF token required' };
    }

    if (csrfToken !== cookieCSRF) {
      return { valid: false, error: 'CSRF token mismatch' };
    }

    return { valid: true };
  }

  private async validateRequestSignature(request: NextRequest): Promise<{ valid: boolean; error?: string }> {
    const signature = request.headers.get('x-signature');
    const timestamp = request.headers.get('x-timestamp');

    if (!signature || !timestamp) {
      return { valid: false, error: 'Request signature required' };
    }

    // Check timestamp (prevent replay attacks)
    const timestampNum = parseInt(timestamp, 10);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (Math.abs(now - timestampNum) > fiveMinutes) {
      return { valid: false, error: 'Request timestamp too old' };
    }

    // Validate signature
    try {
      const body = await request.clone().text();
      const expectedSignature = this.generateSignature(request.method, request.url, body, timestamp);
      
      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid request signature' };
      }

      return { valid: true };
    } catch {
      return { valid: false, error: 'Signature validation failed' };
    }
  }

  private generateSignature(method: string, url: string, body: string, timestamp: string): string {
    const secret = process.env.REQUEST_SIGNATURE_SECRET;
    if (!secret) {
      throw new Error('REQUEST_SIGNATURE_SECRET environment variable is required');
    }
    const message = `${method}|${url}|${body}|${timestamp}`;
    
    return crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');
  }

  private recordMetrics(
    request: NextRequest,
    startTime: number,
    statusCode: number,
    error?: string,
    rateLimited: boolean = false
  ) {
    const duration = Date.now() - startTime;
    const ip = this.getClientIP(request);
    
    const metrics: RequestMetrics = {
      timestamp: startTime,
      method: request.method,
      path: request.nextUrl.pathname,
      ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
      duration,
      statusCode,
      error,
      rateLimited
    };

    this.metrics.push(metrics);

    // Log significant events
    if (statusCode >= 400 || rateLimited) {
      console.warn('API Security Event:', {
        timestamp: new Date(startTime).toISOString(),
        ip,
        path: metrics.path,
        method: metrics.method,
        statusCode,
        error,
        rateLimited,
        duration
      });
    }
  }

  private cleanupMetrics() {
    const oneHourAgo = Date.now() - 3600000;
    this.metrics = this.metrics.filter(metric => metric.timestamp > oneHourAgo);
    
    // Keep only the most recent entries if we have too many
    if (this.metrics.length > this.maxMetricsEntries) {
      this.metrics = this.metrics.slice(-this.maxMetricsEntries);
    }
  }

  private createErrorResponse(
    message: string,
    status: number,
    headers: Record<string, string> = {}
  ): NextResponse {
    return NextResponse.json(
      {
        error: message,
        timestamp: new Date().toISOString(),
        status
      },
      { status, headers }
    );
  }

  /**
   * Get security metrics for monitoring
   */
  getMetrics(timeWindow: number = 3600000): {
    totalRequests: number;
    errorRate: number;
    rateLimitedRequests: number;
    averageResponseTime: number;
    topIPs: Array<{ ip: string; count: number }>;
    topPaths: Array<{ path: string; count: number }>;
    statusCodes: Record<number, number>;
  } {
    const since = Date.now() - timeWindow;
    const relevantMetrics = this.metrics.filter(m => m.timestamp > since);

    const totalRequests = relevantMetrics.length;
    const errorRequests = relevantMetrics.filter(m => m.statusCode >= 400).length;
    const rateLimitedRequests = relevantMetrics.filter(m => m.rateLimited).length;
    const averageResponseTime = totalRequests > 0 
      ? relevantMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests 
      : 0;

    // Top IPs
    const ipCounts = relevantMetrics.reduce((acc, m) => {
      acc[m.ip] = (acc[m.ip] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topIPs = Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top paths
    const pathCounts = relevantMetrics.reduce((acc, m) => {
      acc[m.path] = (acc[m.path] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topPaths = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Status codes
    const statusCodes = relevantMetrics.reduce((acc, m) => {
      acc[m.statusCode] = (acc[m.statusCode] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalRequests,
      errorRate: totalRequests > 0 ? errorRequests / totalRequests : 0,
      rateLimitedRequests,
      averageResponseTime,
      topIPs,
      topPaths,
      statusCodes
    };
  }

  /**
   * Get service name from API path for circuit breaker
   */
  private getServiceNameFromPath(path: string): string {
    if (path.includes('/coingecko')) return 'coingecko';
    if (path.includes('/mempool')) return 'mempool';
    if (path.includes('/timestamps')) return 'timestamps';
    return 'general';
  }

  /**
   * Get provider name from API path for monitoring
   */
  private getProviderFromPath(path: string): string | undefined {
    if (path.includes('/coingecko')) return 'CoinGecko';
    if (path.includes('/mempool')) return 'Mempool.space';
    return undefined;
  }

  /**
   * Block an IP address temporarily
   */
  blockIP(ip: string, durationMs: number = 3600000) {
    // Implementation would depend on your infrastructure
    console.warn(`IP ${ip} blocked for ${durationMs}ms`);
  }
}

// Export singleton instance
export const apiSecurityMiddleware = new APISecurityMiddleware();

// Convenience wrapper function
export const withAPISecurityMiddleware = (
  handler: (req: NextRequest) => Promise<Response>,
  config: SecurityConfig = {}
) => {
  return async (request: NextRequest) => {
    return apiSecurityMiddleware.secureEndpoint(request, handler, config);
  };
};
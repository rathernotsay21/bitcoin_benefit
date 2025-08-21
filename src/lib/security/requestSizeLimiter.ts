/**
 * Request Size Limiter Middleware
 * Prevents DoS attacks by limiting request body sizes
 */

import { NextRequest, NextResponse } from 'next/server';

interface SizeLimitConfig {
  maxBodySize?: number; // in bytes
  maxUrlLength?: number; // URL length limit
  maxHeaderSize?: number; // Total headers size
}

const DEFAULT_LIMITS: SizeLimitConfig = {
  maxBodySize: 1048576, // 1MB default
  maxUrlLength: 2048, // 2KB for URL
  maxHeaderSize: 16384, // 16KB for headers
};

export class RequestSizeLimiter {
  /**
   * Check request size limits
   */
  static async checkRequestSize(
    request: NextRequest,
    config: SizeLimitConfig = {}
  ): Promise<{ valid: boolean; error?: string }> {
    const limits = { ...DEFAULT_LIMITS, ...config };

    // Check URL length
    if (request.url.length > limits.maxUrlLength!) {
      return {
        valid: false,
        error: `URL length exceeds maximum of ${limits.maxUrlLength} characters`,
      };
    }

    // Check headers size
    const headersSize = Array.from(request.headers.entries()).reduce(
      (acc, [key, value]) => acc + key.length + value.length,
      0
    );
    
    if (headersSize > limits.maxHeaderSize!) {
      return {
        valid: false,
        error: `Headers size exceeds maximum of ${limits.maxHeaderSize} bytes`,
      };
    }

    // Check body size for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentLength = request.headers.get('content-length');
      
      if (contentLength) {
        const bodySize = parseInt(contentLength, 10);
        if (bodySize > limits.maxBodySize!) {
          return {
            valid: false,
            error: `Request body exceeds maximum size of ${limits.maxBodySize} bytes`,
          };
        }
      }

      // For requests without content-length, check actual body
      try {
        const body = await request.clone().text();
        if (body.length > limits.maxBodySize!) {
          return {
            valid: false,
            error: `Request body exceeds maximum size of ${limits.maxBodySize} bytes`,
          };
        }
      } catch (error) {
        // If we can't read the body, allow it through but log warning
        console.warn('Could not check request body size:', error);
      }
    }

    return { valid: true };
  }

  /**
   * Create middleware for size limiting
   */
  static middleware(config: SizeLimitConfig = {}) {
    return async (request: NextRequest): Promise<NextResponse | null> => {
      const sizeCheck = await this.checkRequestSize(request, config);
      
      if (!sizeCheck.valid) {
        return NextResponse.json(
          { 
            error: 'Request too large',
            message: sizeCheck.error,
          },
          { 
            status: 413, // Payload Too Large
            headers: {
              'X-RateLimit-Limit': String(config.maxBodySize || DEFAULT_LIMITS.maxBodySize),
              'Content-Type': 'application/json',
            }
          }
        );
      }

      return null; // Continue processing
    };
  }

  /**
   * Get appropriate size limit for different API endpoints
   */
  static getEndpointLimits(path: string): SizeLimitConfig {
    // File upload endpoints get larger limits
    if (path.includes('/timestamps/create') || path.includes('/timestamps/verify')) {
      return {
        maxBodySize: 5242880, // 5MB for file uploads
        maxUrlLength: 2048,
        maxHeaderSize: 16384,
      };
    }

    // Transaction endpoints
    if (path.includes('/mempool/tx') || path.includes('/mempool/address')) {
      return {
        maxBodySize: 102400, // 100KB
        maxUrlLength: 2048,
        maxHeaderSize: 8192,
      };
    }

    // Simple GET endpoints
    if (path.includes('/coingecko') || path.includes('/mempool/fees')) {
      return {
        maxBodySize: 1024, // 1KB
        maxUrlLength: 1024,
        maxHeaderSize: 4096,
      };
    }

    // Health check endpoint
    if (path.includes('/health')) {
      return {
        maxBodySize: 0, // No body expected
        maxUrlLength: 512,
        maxHeaderSize: 2048,
      };
    }

    // Default limits
    return DEFAULT_LIMITS;
  }
}

/**
 * Express-style middleware wrapper for API routes
 */
export async function withSizeLimit(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<Response>,
  config?: SizeLimitConfig
): Promise<Response> {
  // Get appropriate limits based on path
  const limits = config || RequestSizeLimiter.getEndpointLimits(request.nextUrl.pathname);
  
  // Check request size
  const sizeCheck = await RequestSizeLimiter.checkRequestSize(request, limits);
  
  if (!sizeCheck.valid) {
    return NextResponse.json(
      { 
        error: 'Request too large',
        message: sizeCheck.error,
      },
      { 
        status: 413,
        headers: {
          'X-Size-Limit': String(limits.maxBodySize),
        }
      }
    );
  }

  // Continue with handler
  return handler(request);
}
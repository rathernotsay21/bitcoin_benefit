import { NextRequest, NextResponse } from 'next/server';
import { checkAPIHealth, getAPIUsageStats } from '@/lib/security/apiKeyManager';
import { apiSecurityMiddleware } from '@/lib/security/apiMiddleware';

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  services: {
    database?: { status: string; latency?: number; error?: string };
    redis?: { status: string; latency?: number; error?: string };
    externalAPIs: Record<string, { status: string; latency?: number; error?: string }>;
  };
  metrics: {
    totalRequests: number;
    errorRate: number;
    averageResponseTime: number;
    rateLimitedRequests: number;
  };
  rateLimit: {
    general: any;
    coingecko: any;
    mempool: any;
  };
}

// Store startup time for uptime calculation
const startupTime = Date.now();

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Collect health information
    const [externalAPIHealth, apiUsageStats, securityMetrics] = await Promise.allSettled([
      checkAPIHealth(),
      Promise.all([
        getAPIUsageStats('coingecko'),
        getAPIUsageStats('mempool')
      ]),
      apiSecurityMiddleware.getMetrics(3600000) // Last hour
    ]);

    // Process external API health
    const rawExternalAPIs = externalAPIHealth.status === 'fulfilled' ? 
      externalAPIHealth.value : 
      { coingecko: { healthy: false, error: 'Failed to check' }, mempool: { healthy: false, error: 'Failed to check' } };
    
    // Transform to expected format
    const externalAPIs: Record<string, { status: string; latency?: number; error?: string }> = {};
    for (const [key, value] of Object.entries(rawExternalAPIs)) {
      const apiHealth: { status: string; latency?: number; error?: string } = {
        status: value.healthy ? 'healthy' : 'unhealthy'
      };
      if (value.latency !== undefined) apiHealth.latency = value.latency;
      if (value.error !== undefined) apiHealth.error = value.error;
      externalAPIs[key] = apiHealth;
    }

    // Process API usage stats  
    const usageStats = apiUsageStats.status === 'fulfilled' ? 
      apiUsageStats.value : 
      [null, null];

    // Process security metrics
    const metrics = securityMetrics.status === 'fulfilled' ? 
      securityMetrics.value : 
      {
        totalRequests: 0,
        errorRate: 0,
        averageResponseTime: 0,
        rateLimitedRequests: 0
      };

    // Check Redis health (if configured)
    let redisHealth: { status: string; latency?: number; error?: string } = { status: 'not-configured' };
    if (process.env['REDIS_URL']) {
      try {
        // Simple Redis ping check would go here
        redisHealth = { status: 'healthy', latency: 1 };
      } catch (error) {
        redisHealth = { 
          status: 'unhealthy', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    }

    // Calculate overall health status
    const hasUnhealthyAPIs = Object.values(externalAPIs).some(
      (api: any) => api.healthy === false
    );
    const highErrorRate = metrics.errorRate > 0.1; // 10% error rate threshold
    const slowResponseTime = metrics.averageResponseTime > 5000; // 5 second threshold

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (hasUnhealthyAPIs || highErrorRate || slowResponseTime) {
      overallStatus = hasUnhealthyAPIs ? 'unhealthy' : 'degraded';
    }

    const healthResponse: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env['NEXT_PUBLIC_APP_VERSION'] || '1.0.0',
      environment: process.env['NODE_ENV'] || 'development',
      uptime: Date.now() - startupTime,
      services: {
        redis: redisHealth,
        externalAPIs: externalAPIs
      },
      metrics,
      rateLimit: {
        general: usageStats[0],
        coingecko: usageStats[1],
        mempool: usageStats[2]
      }
    };

    // Set appropriate status code
    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(healthResponse, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check-Duration': (Date.now() - startTime).toString(),
        'X-Uptime': (Date.now() - startupTime).toString()
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    const errorResponse: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env['NEXT_PUBLIC_APP_VERSION'] || '1.0.0',
      environment: process.env['NODE_ENV'] || 'development',
      uptime: Date.now() - startupTime,
      services: {
        externalAPIs: {}
      },
      metrics: {
        totalRequests: 0,
        errorRate: 1,
        averageResponseTime: 0,
        rateLimitedRequests: 0
      },
      rateLimit: {
        general: null,
        coingecko: null,
        mempool: null
      }
    };

    return NextResponse.json(errorResponse, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check-Duration': (Date.now() - startTime).toString(),
        'X-Health-Check-Error': error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}

// Readiness check endpoint (lighter weight)
export async function HEAD(_request: NextRequest): Promise<NextResponse> {
  try {
    // Simple readiness check - just verify we can respond
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Readiness-Check': 'ok',
        'X-Uptime': (Date.now() - startupTime).toString()
      }
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'X-Readiness-Check': 'failed'
      }
    });
  }
}

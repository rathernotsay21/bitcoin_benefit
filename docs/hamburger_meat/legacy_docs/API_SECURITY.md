# API Security & Rate Limiting Documentation

## Overview

The Bitcoin Benefit platform implements comprehensive API security measures including rate limiting, authentication, monitoring, and circuit breaker patterns to ensure reliable and secure operation in production environments.

## Security Features

### 1. Rate Limiting

#### Implementation
- **Multi-tier rate limiting**: IP-based, endpoint-specific, and global limits
- **Persistent storage**: Redis-backed for production, memory fallback for development
- **Progressive backoff**: Automatic retry delays for violated limits
- **Header transparency**: Rate limit status in response headers

#### Configuration
```bash
# Rate limits (requests per minute)
GENERAL_RATE_LIMIT=100
COINGECKO_RATE_LIMIT=10
MEMPOOL_RATE_LIMIT=30
TIMESTAMP_RATE_LIMIT=5

# Redis for persistent rate limiting (optional)
REDIS_URL=redis://localhost:6379
```

#### Rate Limit Headers
```
RateLimit-Limit: 100
RateLimit-Remaining: 85
RateLimit-Reset: 2024-01-15T10:30:00Z
X-RateLimit-Limit: 100          # Legacy compatibility
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1705314600
```

### 2. API Key Management

#### External API Authentication
- **CoinGecko API**: Automatic key rotation and fallback
- **Mempool.space API**: Pro tier support with rate limit awareness
- **Retry logic**: Exponential backoff with circuit breaker integration

#### Configuration
```bash
# Primary and fallback API keys
COINGECKO_API_KEY=your-primary-key
COINGECKO_FALLBACK_API_KEY=your-fallback-key

# Rate limits per provider
COINGECKO_RPM=50     # Requests per minute
COINGECKO_RPH=1000   # Requests per hour
COINGECKO_RPD=100000 # Requests per day
```

### 3. Request Authentication

#### API Key Authentication
```bash
# Set valid API keys (comma-separated)
VALID_API_KEYS=key1,key2,key3
```

#### Request Headers
```http
# API Key authentication
X-API-Key: your-api-key

# Or Bearer token
Authorization: Bearer your-jwt-token
```

#### Request Signing (Optional)
```bash
# Enable request signature validation
ENABLE_SIGNATURE_VALIDATION=true
REQUEST_SIGNATURE_SECRET=your-secret-key
```

### 4. Circuit Breaker Pattern

#### Automatic Failure Handling
- **Failure threshold**: 3-5 failures before opening circuit
- **Recovery testing**: Automatic half-open state testing
- **Service isolation**: Per-service circuit breakers

#### Configuration
```javascript
// Circuit breaker settings
const circuitBreakerConfig = {
  failureThreshold: 3,     // Failures before opening
  successThreshold: 2,     // Successes to close circuit
  timeout: 30000          // Recovery attempt delay (ms)
};
```

### 5. Security Headers

#### Standard Security Headers
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'
```

#### API-Specific Headers
```http
X-API-Version: 1.0
X-Rate-Limit-Policy: standard
X-Request-ID: uuid-v4
Cache-Control: no-cache, no-store, must-revalidate
```

### 6. CORS Configuration

#### Allowed Origins
```bash
# Configure allowed origins
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
CORS_ALLOW_CREDENTIALS=true
CORS_MAX_AGE=86400
```

## Monitoring & Alerting

### 1. Performance Monitoring

#### Metrics Collected
- Request count and response times
- Error rates and status codes
- Rate limit violations
- External API health
- Circuit breaker states

#### Access Monitoring Data
```bash
# Health check endpoint
GET /api/health

# Returns comprehensive system status
{
  "status": "healthy",
  "services": {
    "externalAPIs": {
      "coingecko": { "healthy": true, "latency": 120 },
      "mempool": { "healthy": true, "latency": 85 }
    }
  },
  "metrics": {
    "totalRequests": 1234,
    "errorRate": 0.02,
    "averageResponseTime": 145
  }
}
```

### 2. Alert Rules

#### Default Alert Conditions
- **High Error Rate**: >10% error rate
- **Slow Response**: >5 second average response time
- **External API Failures**: >20% failure rate
- **Rate Limit Violations**: >10 violations in 5 minutes
- **Circuit Breaker Open**: Any service circuit open

#### Custom Alerts
```javascript
// Add custom alert rule
apiMonitoring.addAlertRule({
  id: 'custom-rule',
  name: 'Custom Performance Alert',
  condition: (metrics, timeWindow) => {
    // Custom logic here
    return metrics.length > 100 && 
           metrics.filter(m => m.responseTime > 1000).length > 10;
  },
  severity: 'medium',
  cooldown: 300000, // 5 minutes
  enabled: true
});
```

### 3. Webhook Notifications

#### Configuration
```bash
# Slack/Discord webhook for critical alerts
ALERT_WEBHOOK_URL=https://hooks.slack.com/your-webhook

# Email notifications (if using email service)
ALERT_EMAIL_ENDPOINT=https://api.emailservice.com/send
```

#### Alert Payload Example
```json
{
  "text": "🚨 Critical API Alert: High Error Rate",
  "attachments": [{
    "color": "danger",
    "fields": [
      { "title": "Severity", "value": "critical" },
      { "title": "Error Rate", "value": "15.2%" },
      { "title": "Time Window", "value": "Last 5 minutes" }
    ]
  }]
}
```

## API Endpoints

### 1. CoinGecko Proxy (`/api/coingecko`)

#### Request
```http
GET /api/coingecko?from=1640995200&to=1672531200&vs_currency=usd
```

#### Response
```json
{
  "prices": [
    [1640995200000, 47000.12],
    [1641081600000, 47500.34]
  ]
}
```

#### Headers
```http
X-Data-Source: primary
X-API-Provider: CoinGecko
X-External-Rate-Limit-Remaining: 45
Cache-Control: public, max-age=300
```

### 2. Mempool Proxy (`/api/mempool/network`)

#### Request
```http
GET /api/mempool/network
```

#### Response
```json
{
  "difficulty": "23137439666472",
  "hashrate": "180000000000000000000",
  "blockHeight": 820000
}
```

### 3. Health Check (`/api/health`)

#### Request
```http
GET /api/health
HEAD /api/health  # Lightweight readiness check
```

#### Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600000,
  "services": {
    "redis": { "status": "healthy", "latency": 2 },
    "externalAPIs": {
      "coingecko": { "healthy": true, "latency": 120 },
      "mempool": { "healthy": true, "latency": 85 }
    }
  },
  "metrics": {
    "totalRequests": 1234,
    "errorRate": 0.02,
    "averageResponseTime": 145,
    "rateLimitedRequests": 0
  }
}
```

## Error Handling

### 1. Rate Limit Exceeded (429)
```json
{
  "error": "Rate limit exceeded. Please wait before making another request.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

### 2. External API Error (502)
```json
{
  "error": "Failed to fetch data from CoinGecko",
  "code": "EXTERNAL_API_ERROR",
  "source": "primary"
}
```

### 3. Circuit Breaker Open (503)
```json
{
  "error": "Circuit breaker is OPEN for coingecko. Service unavailable.",
  "code": "CIRCUIT_BREAKER_OPEN",
  "retryAfter": 30
}
```

## Production Deployment

### 1. Required Environment Variables
```bash
# Essential configuration
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# API Keys
COINGECKO_API_KEY=your-coingecko-key
MEMPOOL_API_KEY=your-mempool-key

# Rate Limiting
REDIS_URL=redis://your-redis-instance:6379
GENERAL_RATE_LIMIT=100

# Security
VALID_API_KEYS=your-api-keys
REQUEST_SIGNATURE_SECRET=your-secret

# Monitoring
ALERT_WEBHOOK_URL=your-webhook-url
ENABLE_REQUEST_LOGGING=true
```

### 2. Infrastructure Requirements

#### Redis (Recommended)
- **Purpose**: Persistent rate limiting across instances
- **Configuration**: Redis 6.0+ with persistence enabled
- **Scaling**: Redis Cluster for high availability

#### Load Balancer
- **Rate Limiting**: Can be handled at application level
- **SSL Termination**: HTTPS enforcement
- **Health Checks**: Use `/api/health` endpoint

#### Monitoring Integration
- **Metrics**: Prometheus-compatible metrics available
- **Logs**: Structured JSON logging
- **Alerts**: Webhook-based notifications

### 3. Performance Optimization

#### Caching Strategy
```javascript
// API response caching
Cache-Control: public, max-age=300, stale-while-revalidate=600

// Static data caching
Cache-Control: public, max-age=3600, immutable
```

#### Request Optimization
- Connection pooling for external APIs
- Request batching where possible
- Gzip compression for responses
- CDN integration for static assets

## Development & Testing

### 1. Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Check API monitoring
npm run api:monitor

# Test health endpoint
npm run api:health
```

### 2. Testing Rate Limits
```bash
# Test rate limiting with curl
for i in {1..15}; do
  curl -w "%{http_code}\n" http://localhost:3000/api/coingecko?from=1640995200&to=1641081600
  sleep 1
done
```

### 3. Circuit Breaker Testing
```javascript
// Force circuit breaker open for testing
import { circuitBreakerRegistry } from '@/lib/security/circuitBreaker';
circuitBreakerRegistry.getBreaker('coingecko').forceOpen();
```

## Security Best Practices

### 1. API Key Management
- Use environment variables, never hardcode keys
- Implement key rotation procedures
- Monitor key usage and set up alerts
- Use different keys for different environments

### 2. Rate Limiting Strategy
- Set conservative limits initially
- Monitor and adjust based on usage patterns
- Implement progressive penalties for violations
- Use Redis for production deployments

### 3. Monitoring & Alerting
- Set up comprehensive monitoring
- Configure alert thresholds appropriately
- Implement escalation procedures
- Regular security audits and reviews

### 4. Error Handling
- Never expose internal system details
- Log security events comprehensively
- Implement graceful degradation
- Provide clear error messages to users

## Troubleshooting

### Common Issues

1. **High Error Rates**
   - Check external API status
   - Verify API key validity
   - Review rate limit configuration

2. **Circuit Breaker Stuck Open**
   - Check external service health
   - Manually reset if needed: `circuitBreakerRegistry.reset('service')`

3. **Rate Limiting Not Working**
   - Verify Redis connection
   - Check environment configuration
   - Confirm IP detection is working

4. **Performance Issues**
   - Review monitoring dashboard
   - Check external API latency
   - Optimize caching strategies

### Support & Maintenance

- Monitor `/api/health` endpoint regularly
- Review alert notifications promptly
- Update API keys before expiration
- Regular security updates and patches
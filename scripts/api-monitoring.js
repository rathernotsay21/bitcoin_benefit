#!/usr/bin/env node

/**
 * API Monitoring Dashboard Script
 * Provides real-time monitoring of API performance and security metrics
 */

const fs = require('fs');
const path = require('path');

// Check if we're in development and can run monitoring
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  console.log('🔍 API Monitoring Dashboard');
  console.log('==========================');
  console.log('');
  console.log('To enable real-time monitoring, start your application with:');
  console.log('  npm run dev');
  console.log('');
  console.log('Then access the monitoring endpoints:');
  console.log('  Health Check: http://localhost:3000/api/health');
  console.log('  Metrics: Available via API monitoring system');
  console.log('');
  console.log('For production monitoring, configure:');
  console.log('  - Redis for persistent rate limiting');
  console.log('  - External monitoring services (Datadog, New Relic, etc.)');
  console.log('  - Alert webhooks for critical issues');
  console.log('');
} else {
  console.log('API monitoring is active in production mode.');
  console.log('Use health check endpoint: /api/health');
}

// Create monitoring configuration template
const monitoringConfig = {
  rateLimiting: {
    enabled: true,
    backend: process.env.REDIS_URL ? 'redis' : 'memory',
    limits: {
      general: process.env.GENERAL_RATE_LIMIT || 100,
      coingecko: process.env.COINGECKO_RATE_LIMIT || 10,
      mempool: process.env.MEMPOOL_RATE_LIMIT || 30,
      timestamps: process.env.TIMESTAMP_RATE_LIMIT || 5
    }
  },
  apiKeys: {
    coingecko: process.env.COINGECKO_API_KEY ? 'configured' : 'missing',
    mempool: process.env.MEMPOOL_API_KEY ? 'configured' : 'missing'
  },
  security: {
    requestSigning: process.env.REQUEST_SIGNATURE_SECRET ? 'enabled' : 'disabled',
    corsOrigins: process.env.ALLOWED_ORIGINS ? 'configured' : 'default'
  },
  monitoring: {
    alertWebhook: process.env.ALERT_WEBHOOK_URL ? 'configured' : 'disabled',
    requestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',
    performanceTracking: true
  }
};

console.log('Configuration Status:');
console.log('====================');
console.log(JSON.stringify(monitoringConfig, null, 2));

// Check for missing critical configuration
const warnings = [];

if (!process.env.COINGECKO_API_KEY) {
  warnings.push('⚠️  CoinGecko API key not configured - using free tier limits');
}

if (!process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
  warnings.push('⚠️  Redis not configured - using in-memory rate limiting');
}

if (!process.env.ALERT_WEBHOOK_URL) {
  warnings.push('⚠️  Alert webhook not configured - no external notifications');
}

if (warnings.length > 0) {
  console.log('\nWarnings:');
  console.log('=========');
  warnings.forEach(warning => console.log(warning));
}

console.log('\nFor complete setup, see .env.example file');
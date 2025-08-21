/**
 * API Monitoring and Alerting System
 * Tracks API performance, errors, and triggers alerts for anomalies
 */

import { CircuitBreakerEvent, CircuitState } from './circuitBreaker';

export interface APIMetric {
  timestamp: number;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ip: string;
  error?: string;
  provider?: string;
  retryAttempt?: number;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: APIMetric[], timeWindow: number) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cooldown: number; // Minimum time between alerts (ms)
  enabled: boolean;
  description: string;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
  metadata?: Record<string, any>;
}

export interface PerformanceStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  requestsPerMinute: number;
  topErrors: Array<{ error: string; count: number }>;
  slowestEndpoints: Array<{ endpoint: string; averageTime: number }>;
}

class APIMonitoring {
  private metrics: APIMetric[] = [];
  private alerts: Alert[] = [];
  private alertRules: AlertRule[] = [];
  private lastAlertTimes: Map<string, number> = new Map();
  private maxMetricsRetention = 100000; // Keep last 100k metrics
  private maxAlertsRetention = 10000;   // Keep last 10k alerts

  constructor() {
    this.setupDefaultAlertRules();
    this.startCleanupScheduler();
  }

  /**
   * Record API metric
   */
  recordMetric(metric: APIMetric): void {
    this.metrics.push(metric);
    
    // Check if cleanup is needed
    if (this.metrics.length > this.maxMetricsRetention) {
      this.cleanupOldMetrics();
    }

    // Check alert rules
    this.checkAlertRules();
  }

  /**
   * Get performance statistics for a time window
   */
  getPerformanceStats(timeWindow: number = 3600000): PerformanceStats {
    const cutoff = Date.now() - timeWindow;
    const relevantMetrics = this.metrics.filter(m => m.timestamp > cutoff);

    if (relevantMetrics.length === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        errorRate: 0,
        requestsPerMinute: 0,
        topErrors: [],
        slowestEndpoints: []
      };
    }

    const successfulRequests = relevantMetrics.filter(m => m.statusCode < 400).length;
    const failedRequests = relevantMetrics.length - successfulRequests;
    const responseTimes = relevantMetrics.map(m => m.responseTime).sort((a, b) => a - b);

    // Calculate percentiles
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);

    // Top errors
    const errorCounts = new Map<string, number>();
    relevantMetrics.filter(m => m.error).forEach(m => {
      const error = m.error!;
      errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
    });

    const topErrors = Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Slowest endpoints
    const endpointTimes = new Map<string, number[]>();
    relevantMetrics.forEach(m => {
      if (!endpointTimes.has(m.endpoint)) {
        endpointTimes.set(m.endpoint, []);
      }
      endpointTimes.get(m.endpoint)!.push(m.responseTime);
    });

    const slowestEndpoints = Array.from(endpointTimes.entries())
      .map(([endpoint, times]) => ({
        endpoint,
        averageTime: times.reduce((a, b) => a + b, 0) / times.length
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 10);

    return {
      totalRequests: relevantMetrics.length,
      successfulRequests,
      failedRequests,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      p95ResponseTime: responseTimes[p95Index] || 0,
      p99ResponseTime: responseTimes[p99Index] || 0,
      errorRate: failedRequests / relevantMetrics.length,
      requestsPerMinute: (relevantMetrics.length / timeWindow) * 60000,
      topErrors,
      slowestEndpoints
    };
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(timeWindow: number = 3600000): Alert[] {
    const cutoff = Date.now() - timeWindow;
    return this.alerts.filter(a => a.timestamp > cutoff);
  }

  /**
   * Get active (unresolved) alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Setup default alert rules
   */
  private setupDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        condition: (metrics, timeWindow) => {
          if (metrics.length < 10) return false; // Need minimum requests
          const errorRate = metrics.filter(m => m.statusCode >= 400).length / metrics.length;
          return errorRate > 0.1; // 10% error rate
        },
        severity: 'high',
        cooldown: 300000, // 5 minutes
        enabled: true,
        description: 'Error rate exceeded 10% threshold'
      },
      {
        id: 'slow-response-time',
        name: 'Slow Response Time',
        condition: (metrics, timeWindow) => {
          if (metrics.length === 0) return false;
          const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
          return avgResponseTime > 5000; // 5 seconds
        },
        severity: 'medium',
        cooldown: 600000, // 10 minutes
        enabled: true,
        description: 'Average response time exceeded 5 seconds'
      }
    ];
  }

  /**
   * Check alert rules against recent metrics
   */
  private checkAlertRules(): void {
    const timeWindow = 300000; // 5 minutes
    const cutoff = Date.now() - timeWindow;
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff);

    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      // Check cooldown
      const lastAlertTime = this.lastAlertTimes.get(rule.id) || 0;
      if (Date.now() - lastAlertTime < rule.cooldown) continue;

      // Check condition
      if (rule.condition(recentMetrics, timeWindow)) {
        this.triggerAlert(rule, recentMetrics);
      }
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(rule: AlertRule, triggeringMetrics: APIMetric[]): void {
    const alertId = `${rule.id}-${Date.now()}`;
    
    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      message: rule.description,
      timestamp: Date.now(),
      resolved: false,
      metadata: {
        triggeringMetricsCount: triggeringMetrics.length,
        timeWindow: 300000
      }
    };

    this.alerts.push(alert);
    this.lastAlertTimes.set(rule.id, Date.now());

    // Log the alert
    const logLevel = rule.severity === 'critical' ? 'error' : 
                    rule.severity === 'high' ? 'error' : 
                    rule.severity === 'medium' ? 'warn' : 'info';
    
    console[logLevel](`API Alert [${rule.severity.toUpperCase()}]:`, {
      rule: rule.name,
      message: rule.description,
      alertId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Cleanup old metrics and alerts
   */
  private cleanupOldMetrics(): void {
    // Keep only the most recent metrics
    this.metrics = this.metrics.slice(-this.maxMetricsRetention);
    
    // Keep only recent alerts (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(a => a.timestamp > thirtyDaysAgo);
  }

  /**
   * Start cleanup scheduler
   */
  private startCleanupScheduler(): void {
    // Run cleanup every hour
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 3600000);
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboardData(timeWindow: number = 3600000) {
    return {
      performanceStats: this.getPerformanceStats(timeWindow),
      recentAlerts: this.getRecentAlerts(timeWindow),
      activeAlerts: this.getActiveAlerts(),
      alertRules: this.alertRules.map(rule => ({
        id: rule.id,
        name: rule.name,
        severity: rule.severity,
        enabled: rule.enabled,
        description: rule.description
      }))
    };
  }
}

// Export singleton instance
export const apiMonitoring = new APIMonitoring();

// Convenience functions
export const recordAPIMetric = (metric: APIMetric) => {
  apiMonitoring.recordMetric(metric);
};

export const getAPIPerformanceStats = (timeWindow?: number) => {
  return apiMonitoring.getPerformanceStats(timeWindow);
};

export const getActiveAPIAlerts = () => {
  return apiMonitoring.getActiveAlerts();
};

export const getAPIMonitoringDashboard = (timeWindow?: number) => {
  return apiMonitoring.getDashboardData(timeWindow);
};
/**
 * Logger utility for Bitcoin Benefit platform
 * Provides secure, environment-aware logging with sensitive data protection
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private sanitizeData(data: any): any {
    if (!data) return data;
    
    // Handle strings
    if (typeof data === 'string') {
      // Sanitize Bitcoin addresses (keep first 6 and last 4 chars)
      if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(data) || /^bc1[a-z0-9]{39,59}$/.test(data)) {
        return `${data.slice(0, 6)}...${data.slice(-4)}`;
      }
      
      // Sanitize API keys and tokens
      if (data.includes('secret') || data.includes('key') || data.includes('token')) {
        return '[REDACTED]';
      }
      
      return data;
    }
    
    // Handle objects
    if (typeof data === 'object') {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizeData(item));
      }
      
      const sanitized: LogContext = {};
      for (const [key, value] of Object.entries(data)) {
        // Skip sensitive keys entirely
        if (/password|secret|key|token|jwt|bearer/i.test(key)) {
          sanitized[key] = '[REDACTED]';
        } else if (key === 'address' || key === 'btcAddress' || key === 'bitcoinAddress') {
          sanitized[key] = this.sanitizeData(value);
        } else {
          sanitized[key] = this.sanitizeData(value);
        }
      }
      return sanitized;
    }
    
    return data;
  }

  private formatMessage(level: string, message: string, context?: LogContext, error?: Error | unknown): string {
    const timestamp = new Date().toISOString();
    const sanitizedContext = context ? this.sanitizeData(context) : undefined;
    
    let formattedMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (sanitizedContext) {
      formattedMessage += ` | Context: ${JSON.stringify(sanitizedContext)}`;
    }
    
    if (error) {
      if (error instanceof Error) {
        formattedMessage += ` | Error: ${error.message}`;
        if (isDevelopment && error.stack) {
          formattedMessage += ` | Stack: ${error.stack}`;
        }
      } else {
        formattedMessage += ` | Error: ${JSON.stringify(this.sanitizeData(error))}`;
      }
    }
    
    return formattedMessage;
  }

  debug(message: string, context?: LogContext): void {
    if (isDevelopment && !isTest) {
      console.log(this.formatMessage('DEBUG', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (isDevelopment && !isTest) {
      console.info(this.formatMessage('INFO', message, context));
    }
    // In production, send to monitoring service
    if (!isDevelopment) {
      this.sendToMonitoring('info', message, context);
    }
  }

  warn(message: string, context?: LogContext, error?: Error | unknown): void {
    if (isDevelopment && !isTest) {
      console.warn(this.formatMessage('WARN', message, context, error));
    }
    // In production, send to monitoring service
    if (!isDevelopment) {
      this.sendToMonitoring('warn', message, context, error);
    }
  }

  error(message: string, context?: LogContext, error?: Error | unknown): void {
    if (isDevelopment && !isTest) {
      console.error(this.formatMessage('ERROR', message, context, error));
    }
    // In production, send to error tracking service
    if (!isDevelopment) {
      this.sendToErrorTracking(message, context, error);
    }
  }

  /**
   * Performance logging for metrics
   */
  perf(metric: string, value: number, context?: LogContext): void {
    if (isDevelopment && !isTest) {
      console.log(this.formatMessage('PERF', `${metric}: ${value}ms`, context));
    }
    // Send to performance monitoring
    if (!isDevelopment) {
      this.sendToPerformanceMonitoring(metric, value, context);
    }
  }

  /**
   * Security event logging
   */
  security(event: string, context?: LogContext): void {
    const sanitizedContext = this.sanitizeData(context);
    if (isDevelopment && !isTest) {
      console.warn(this.formatMessage('SECURITY', event, sanitizedContext));
    }
    // Always send security events to monitoring
    this.sendToSecurityMonitoring(event, sanitizedContext);
  }

  /**
   * Placeholder for production monitoring service integration
   */
  private sendToMonitoring(level: string, message: string, context?: LogContext, error?: Error | unknown): void {
    // TODO: Integrate with production logging service (e.g., Datadog, LogRocket, Sentry)
    // Example:
    // monitoringService.log({ level, message, context: this.sanitizeData(context), error });
  }

  /**
   * Placeholder for error tracking service integration
   */
  private sendToErrorTracking(message: string, context?: LogContext, error?: Error | unknown): void {
    // TODO: Integrate with error tracking service (e.g., Sentry, Rollbar)
    // Example:
    // Sentry.captureException(error, { extra: { message, context: this.sanitizeData(context) } });
  }

  /**
   * Placeholder for performance monitoring service integration
   */
  private sendToPerformanceMonitoring(metric: string, value: number, context?: LogContext): void {
    // TODO: Integrate with performance monitoring (e.g., New Relic, Datadog)
    // Example:
    // performanceService.recordMetric(metric, value, this.sanitizeData(context));
  }

  /**
   * Placeholder for security monitoring service integration
   */
  private sendToSecurityMonitoring(event: string, context?: LogContext): void {
    // TODO: Integrate with security monitoring service
    // Example:
    // securityService.logEvent(event, this.sanitizeData(context));
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing
export { Logger };
/**
 * Circuit Breaker Pattern Implementation
 * Provides resilience for external API calls with automatic recovery
 */

export interface CircuitBreakerConfig {
  failureThreshold: number;     // Number of failures before opening circuit
  successThreshold: number;     // Number of successes to close circuit
  timeout: number;              // Initial timeout before attempting recovery (ms)
  maxTimeout?: number;          // Maximum timeout for exponential backoff (ms)
  monitor?: (event: CircuitBreakerEvent) => void;
  autoReset?: boolean;          // Enable automatic reset attempts
  autoResetInterval?: number;   // Interval for auto-reset checks (ms)
}

export interface CircuitBreakerEvent {
  service: string;
  state: CircuitState;
  error?: string;
  timestamp: Date;
  failureCount: number;
  successCount: number;
}

export enum CircuitState {
  CLOSED = 'closed',     // Normal operation
  OPEN = 'open',         // Circuit is open, rejecting calls
  HALF_OPEN = 'half_open' // Testing if service has recovered
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private config: CircuitBreakerConfig;
  private serviceName: string;
  private resetAttempts = 0;
  private currentTimeout: number;
  private autoResetTimer?: NodeJS.Timeout;

  constructor(serviceName: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.serviceName = serviceName;
    this.config = {
      failureThreshold: 3,      // Lowered from 5
      successThreshold: 2,      // Lowered from 3
      timeout: 30000,           // 30 seconds (reduced from 60)
      maxTimeout: 300000,       // 5 minutes max
      autoReset: true,          // Enable auto-reset by default
      autoResetInterval: 15000, // Check every 15 seconds
      ...config
    };
    this.currentTimeout = this.config.timeout;

    // Start auto-reset timer if enabled
    if (this.config.autoReset) {
      this.startAutoResetTimer();
    }
  }

  /**
   * Start automatic reset timer
   */
  private startAutoResetTimer(): void {
    if (this.autoResetTimer) {
      clearInterval(this.autoResetTimer);
    }

    this.autoResetTimer = setInterval(() => {
      if (this.state === CircuitState.OPEN) {
        const timeSinceFailure = Date.now() - this.lastFailureTime;
        if (timeSinceFailure >= this.currentTimeout) {
          // Automatically move to half-open to test recovery
          this.state = CircuitState.HALF_OPEN;
          this.successCount = 0;
          this.emitEvent('Circuit breaker auto-moved to HALF_OPEN state for recovery test');
        }
      }
    }, this.config.autoResetInterval!);
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if circuit should be opened
    if (this.state === CircuitState.OPEN) {
      const timeSinceFailure = Date.now() - this.lastFailureTime;
      if (timeSinceFailure < this.currentTimeout) {
        const remainingTime = Math.ceil((this.currentTimeout - timeSinceFailure) / 1000);
        throw new Error(`Circuit breaker is open for ${this.serviceName}. Retry in ${remainingTime}s`);
      } else {
        // Move to half-open state to test recovery
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        this.emitEvent('Circuit breaker moved to HALF_OPEN state');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Handle successful operation
   */
  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        this.resetAttempts = 0;
        this.currentTimeout = this.config.timeout; // Reset timeout to initial value
        this.emitEvent('Circuit breaker CLOSED - service recovered');
      }
    }
  }

  /**
   * Handle failed operation
   */
  private onFailure(error: unknown): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Return to open state if failure occurs during testing
      this.state = CircuitState.OPEN;
      this.resetAttempts++;
      
      // Implement exponential backoff
      const maxTimeout = this.config.maxTimeout || (this.config.timeout * 10);
      this.currentTimeout = Math.min(
        this.config.timeout * Math.pow(2, this.resetAttempts),
        maxTimeout
      );
      
      this.emitEvent(`Circuit breaker returned to OPEN state (attempt ${this.resetAttempts}, next retry in ${Math.round(this.currentTimeout/1000)}s)`, error);
    } else if (this.failureCount >= this.config.failureThreshold) {
      // Open circuit if failure threshold exceeded
      this.state = CircuitState.OPEN;
      this.resetAttempts = 0;
      this.currentTimeout = this.config.timeout;
      this.emitEvent('Circuit breaker OPENED due to failures', error);
    }
  }

  /**
   * Emit circuit breaker events for monitoring
   */
  private emitEvent(message: string, error?: unknown): void {
    const event: CircuitBreakerEvent = {
      service: this.serviceName,
      state: this.state,
      error: error instanceof Error ? error.message : undefined,
      timestamp: new Date(),
      failureCount: this.failureCount,
      successCount: this.successCount
    };

    if (this.config.monitor) {
      this.config.monitor(event);
    }

    // Log significant events (reduced logging level for normal operations)
    const logLevel = this.state === CircuitState.OPEN ? 'warn' : 'debug';
    if (logLevel === 'warn' || process.env.NODE_ENV === 'development') {
      console[logLevel === 'debug' ? 'log' : logLevel](`Circuit Breaker [${this.serviceName}]:`, message, {
        state: this.state,
        failures: this.failureCount,
        successes: this.successCount,
        timeout: Math.round(this.currentTimeout / 1000) + 's'
      });
    }
  }

  /**
   * Get current circuit breaker status
   */
  getStatus() {
    return {
      service: this.serviceName,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      isHealthy: this.state === CircuitState.CLOSED,
      currentTimeout: this.currentTimeout,
      resetAttempts: this.resetAttempts,
      nextRetryTime: this.state === CircuitState.OPEN ? 
        new Date(this.lastFailureTime + this.currentTimeout) : null
    };
  }

  /**
   * Manually reset circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
    this.resetAttempts = 0;
    this.currentTimeout = this.config.timeout;
    this.emitEvent('Circuit breaker manually reset');
  }

  /**
   * Force circuit open (for maintenance)
   */
  forceOpen(): void {
    this.state = CircuitState.OPEN;
    this.lastFailureTime = Date.now();
    this.emitEvent('Circuit breaker forced OPEN');
  }

  /**
   * Cleanup timers
   */
  destroy(): void {
    if (this.autoResetTimer) {
      clearInterval(this.autoResetTimer);
      this.autoResetTimer = undefined;
    }
  }
}

/**
 * Circuit Breaker Registry
 * Manages multiple circuit breakers for different services
 */
class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>();
  private globalConfig: Partial<CircuitBreakerConfig> = {};
  private healthCheckInterval?: NodeJS.Timer;

  constructor(globalConfig: Partial<CircuitBreakerConfig> = {}) {
    this.globalConfig = globalConfig;
    
    // Start periodic health check
    this.startHealthCheck();
  }

  /**
   * Start periodic health check
   */
  private startHealthCheck(): void {
    // Check every 30 seconds for stuck open circuits
    this.healthCheckInterval = setInterval(() => {
      const unhealthyServices = [];
      
      for (const [name, breaker] of this.breakers) {
        const status = breaker.getStatus();
        if (!status.isHealthy && status.lastFailureTime) {
          const timeSinceFailure = Date.now() - status.lastFailureTime;
          // If circuit has been open for more than 5 minutes, try to reset
          if (timeSinceFailure > 300000) {
            console.log(`Auto-resetting stuck circuit breaker for ${name}`);
            breaker.reset();
          } else {
            unhealthyServices.push(name);
          }
        }
      }
      
      if (unhealthyServices.length > 0) {
        console.log('Unhealthy services:', unhealthyServices);
      }
    }, 30000);
  }

  /**
   * Get or create circuit breaker for a service
   */
  getBreaker(serviceName: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(serviceName)) {
      const finalConfig = { ...this.globalConfig, ...config };
      this.breakers.set(serviceName, new CircuitBreaker(serviceName, finalConfig));
    }
    return this.breakers.get(serviceName)!;
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async execute<T>(
    serviceName: string, 
    operation: () => Promise<T>,
    config?: Partial<CircuitBreakerConfig>
  ): Promise<T> {
    const breaker = this.getBreaker(serviceName, config);
    return breaker.execute(operation);
  }

  /**
   * Get status of all circuit breakers
   */
  getAllStatus() {
    const status: Record<string, any> = {};
    for (const [name, breaker] of this.breakers) {
      status[name] = breaker.getStatus();
    }
    return status;
  }

  /**
   * Get health summary
   */
  getHealthSummary() {
    const statuses = this.getAllStatus();
    const services = Object.keys(statuses);
    const healthyServices = services.filter(name => statuses[name].isHealthy);
    const unhealthyServices = services.filter(name => !statuses[name].isHealthy);

    return {
      totalServices: services.length,
      healthyServices: healthyServices.length,
      unhealthyServices: unhealthyServices.length,
      healthyServiceNames: healthyServices,
      unhealthyServiceNames: unhealthyServices,
      overallHealthy: unhealthyServices.length === 0,
      details: unhealthyServices.map(name => ({
        service: name,
        state: statuses[name].state,
        nextRetryTime: statuses[name].nextRetryTime,
        failureCount: statuses[name].failureCount
      }))
    };
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Reset specific circuit breaker
   */
  reset(serviceName: string): boolean {
    const breaker = this.breakers.get(serviceName);
    if (breaker) {
      breaker.reset();
      return true;
    }
    return false;
  }

  /**
   * Cleanup all resources
   */
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    for (const breaker of this.breakers.values()) {
      breaker.destroy();
    }
    
    this.breakers.clear();
  }
}

// Global circuit breaker registry with improved defaults
export const circuitBreakerRegistry = new CircuitBreakerRegistry({
  failureThreshold: 3,    // Reduced from 5
  successThreshold: 2,    // Reduced from 3
  timeout: 30000,         // 30 seconds (reduced from 60)
  maxTimeout: 180000,     // 3 minutes max
  autoReset: true,
  autoResetInterval: 10000, // Check every 10 seconds
  monitor: (event) => {
    // Only log significant events
    if (event.state === CircuitState.OPEN || process.env.NODE_ENV === 'development') {
      console.log('Circuit Breaker Event:', {
        service: event.service,
        state: event.state,
        timestamp: event.timestamp.toISOString(),
        failureCount: event.failureCount,
        error: event.error
      });
    }
  }
});

// Convenience functions for common external services
export const executeWithCircuitBreaker = <T>(
  serviceName: string,
  operation: () => Promise<T>,
  config?: Partial<CircuitBreakerConfig>
): Promise<T> => {
  return circuitBreakerRegistry.execute(serviceName, operation, config);
};

// Pre-configured circuit breakers for external APIs with optimized settings
export const coingeckoCircuitBreaker = circuitBreakerRegistry.getBreaker('coingecko', {
  failureThreshold: 2,    // More sensitive
  successThreshold: 1,    // Easier recovery
  timeout: 20000,         // 20 seconds
  maxTimeout: 60000       // 1 minute max
});

export const mempoolCircuitBreaker = circuitBreakerRegistry.getBreaker('mempool', {
  failureThreshold: 2,    // More sensitive
  successThreshold: 1,    // Easier recovery
  timeout: 20000,         // 20 seconds
  maxTimeout: 60000       // 1 minute max
});

// Health check function
export const getCircuitBreakerHealth = () => {
  return circuitBreakerRegistry.getHealthSummary();
};

// Manual reset function for stuck circuits
export const resetCircuitBreaker = (serviceName?: string) => {
  if (serviceName) {
    return circuitBreakerRegistry.reset(serviceName);
  } else {
    circuitBreakerRegistry.resetAll();
    return true;
  }
};
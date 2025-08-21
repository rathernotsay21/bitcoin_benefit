/**
 * Circuit Breaker Pattern Implementation
 * Provides resilience for external API calls with automatic recovery
 */

export interface CircuitBreakerConfig {
  failureThreshold: number;     // Number of failures before opening circuit
  successThreshold: number;     // Number of successes to close circuit
  timeout: number;              // Timeout before attempting recovery (ms)
  monitor?: (event: CircuitBreakerEvent) => void;
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

  constructor(serviceName: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.serviceName = serviceName;
    this.config = {
      failureThreshold: 5,
      successThreshold: 3,
      timeout: 60000, // 1 minute
      ...config
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if circuit should be opened
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime < this.config.timeout) {
        throw new Error(`Circuit breaker is OPEN for ${this.serviceName}. Service unavailable.`);
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
      this.emitEvent('Circuit breaker returned to OPEN state', error);
    } else if (this.failureCount >= this.config.failureThreshold) {
      // Open circuit if failure threshold exceeded
      this.state = CircuitState.OPEN;
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

    // Log significant events
    const logLevel = this.state === CircuitState.OPEN ? 'error' : 'info';
    console[logLevel](`Circuit Breaker [${this.serviceName}]:`, message, {
      state: this.state,
      failures: this.failureCount,
      successes: this.successCount
    });
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
      nextRetryTime: this.state === CircuitState.OPEN ? 
        new Date(this.lastFailureTime + this.config.timeout) : null
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
}

/**
 * Circuit Breaker Registry
 * Manages multiple circuit breakers for different services
 */
class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>();
  private globalConfig: Partial<CircuitBreakerConfig> = {};

  constructor(globalConfig: Partial<CircuitBreakerConfig> = {}) {
    this.globalConfig = globalConfig;
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
      overallHealthy: unhealthyServices.length === 0
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
}

// Global circuit breaker registry
export const circuitBreakerRegistry = new CircuitBreakerRegistry({
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 60000,
  monitor: (event) => {
    // Log circuit breaker events for monitoring
    console.log('Circuit Breaker Event:', {
      service: event.service,
      state: event.state,
      timestamp: event.timestamp.toISOString(),
      failureCount: event.failureCount,
      error: event.error
    });
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

// Pre-configured circuit breakers for external APIs
export const coingeckoCircuitBreaker = circuitBreakerRegistry.getBreaker('coingecko', {
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 30000 // 30 seconds
});

export const mempoolCircuitBreaker = circuitBreakerRegistry.getBreaker('mempool', {
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 30000 // 30 seconds
});

// Health check function
export const getCircuitBreakerHealth = () => {
  return circuitBreakerRegistry.getHealthSummary();
};
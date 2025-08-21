interface QueuedRequest<T> {
  id: string;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  priority: number;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface QueueConfig {
  maxConcurrent: number;
  maxQueueSize: number;
  requestTimeout: number;
  retryDelay: number;
  priorityLevels: {
    HIGH: number;
    NORMAL: number;
    LOW: number;
  };
}

export class RequestQueueManager {
  private queues: Map<string, QueuedRequest<any>[]> = new Map();
  private activeRequests: Map<string, Set<string>> = new Map();
  private processingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private configs: Map<string, QueueConfig> = new Map();

  constructor() {
    // Initialize default configurations for different services
    this.configs.set('mempool', {
      maxConcurrent: 3,
      maxQueueSize: 100,
      requestTimeout: 30000,
      retryDelay: 2000,
      priorityLevels: {
        HIGH: 3,
        NORMAL: 2,
        LOW: 1
      }
    });

    this.configs.set('coingecko', {
      maxConcurrent: 2,
      maxQueueSize: 50,
      requestTimeout: 30000,
      retryDelay: 5000,
      priorityLevels: {
        HIGH: 3,
        NORMAL: 2,
        LOW: 1
      }
    });
  }

  /**
   * Add a request to the queue
   */
  async queueRequest<T>(
    service: string,
    execute: () => Promise<T>,
    options: {
      priority?: number;
      maxRetries?: number;
      signal?: AbortSignal;
    } = {}
  ): Promise<T> {
    const config = this.configs.get(service) || this.configs.get('mempool')!;
    const queue = this.queues.get(service) || [];
    
    // Check queue size limit
    if (queue.length >= config.maxQueueSize) {
      throw new Error(`Request queue for ${service} is full (max: ${config.maxQueueSize})`);
    }

    const requestId = `${service}-${Date.now()}-${Math.random()}`;
    
    return new Promise<T>((resolve, reject) => {
      const queuedRequest: QueuedRequest<T> = {
        id: requestId,
        execute,
        resolve,
        reject,
        priority: options.priority || config.priorityLevels.NORMAL,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: options.maxRetries || 3
      };

      // Handle abort signal
      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          this.removeFromQueue(service, requestId);
          reject(new Error('Request aborted'));
        });
      }

      // Add to queue
      queue.push(queuedRequest);
      
      // Sort by priority (higher priority first) and timestamp (older first)
      queue.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.timestamp - b.timestamp;
      });

      this.queues.set(service, queue);

      // Start processing if not already running
      if (!this.processingIntervals.has(service)) {
        this.startProcessing(service);
      }
    });
  }

  /**
   * Start processing requests for a service
   */
  private startProcessing(service: string): void {
    const interval = setInterval(() => {
      this.processQueue(service);
    }, 100);

    this.processingIntervals.set(service, interval);
    
    // Process immediately
    this.processQueue(service);
  }

  /**
   * Process queued requests
   */
  private async processQueue(service: string): Promise<void> {
    const config = this.configs.get(service) || this.configs.get('mempool')!;
    const queue = this.queues.get(service) || [];
    const activeRequests = this.activeRequests.get(service) || new Set();

    // Check if we can process more requests
    if (activeRequests.size >= config.maxConcurrent || queue.length === 0) {
      // Stop processing if queue is empty
      if (queue.length === 0 && activeRequests.size === 0) {
        const interval = this.processingIntervals.get(service);
        if (interval) {
          clearInterval(interval);
          this.processingIntervals.delete(service);
        }
      }
      return;
    }

    // Get next request from queue
    const request = queue.shift();
    if (!request) return;

    this.queues.set(service, queue);
    activeRequests.add(request.id);
    this.activeRequests.set(service, activeRequests);

    try {
      // Execute request with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), config.requestTimeout);
      });

      const result = await Promise.race([
        request.execute(),
        timeoutPromise
      ]);

      request.resolve(result);
    } catch (error) {
      // Handle retry logic
      if (request.retryCount < request.maxRetries && this.isRetryableError(error)) {
        request.retryCount++;
        
        // Re-queue with delay
        setTimeout(() => {
          const currentQueue = this.queues.get(service) || [];
          currentQueue.push(request);
          
          // Re-sort queue
          currentQueue.sort((a, b) => {
            if (a.priority !== b.priority) {
              return b.priority - a.priority;
            }
            return a.timestamp - b.timestamp;
          });
          
          this.queues.set(service, currentQueue);
        }, config.retryDelay * Math.pow(2, request.retryCount - 1));
      } else {
        request.reject(error);
      }
    } finally {
      activeRequests.delete(request.id);
      this.activeRequests.set(service, activeRequests);
    }
  }

  /**
   * Remove a request from the queue
   */
  private removeFromQueue(service: string, requestId: string): void {
    const queue = this.queues.get(service) || [];
    const index = queue.findIndex(r => r.id === requestId);
    
    if (index !== -1) {
      queue.splice(index, 1);
      this.queues.set(service, queue);
    }
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (!error) return false;
    
    const message = error.message || '';
    const status = error.status || error.statusCode;
    
    // Retry on network errors
    if (message.includes('ECONNRESET') || 
        message.includes('ETIMEDOUT') ||
        message.includes('ENOTFOUND') ||
        message.includes('timeout')) {
      return true;
    }
    
    // Retry on specific HTTP status codes
    if (status === 429 || status === 502 || status === 503 || status === 504) {
      return true;
    }
    
    return false;
  }

  /**
   * Get queue statistics
   */
  getQueueStats(service?: string): Record<string, any> {
    if (service) {
      const queue = this.queues.get(service) || [];
      const activeRequests = this.activeRequests.get(service) || new Set();
      
      return {
        service,
        queueLength: queue.length,
        activeRequests: activeRequests.size,
        isProcessing: this.processingIntervals.has(service)
      };
    }

    const stats: Record<string, any> = {};
    
    for (const [svc, queue] of this.queues) {
      const activeRequests = this.activeRequests.get(svc) || new Set();
      stats[svc] = {
        queueLength: queue.length,
        activeRequests: activeRequests.size,
        isProcessing: this.processingIntervals.has(svc)
      };
    }
    
    return stats;
  }

  /**
   * Clear all queues
   */
  clearQueues(service?: string): void {
    if (service) {
      const queue = this.queues.get(service) || [];
      queue.forEach(request => {
        request.reject(new Error('Queue cleared'));
      });
      
      this.queues.delete(service);
      this.activeRequests.delete(service);
      
      const interval = this.processingIntervals.get(service);
      if (interval) {
        clearInterval(interval);
        this.processingIntervals.delete(service);
      }
    } else {
      // Clear all queues
      for (const [svc, queue] of this.queues) {
        queue.forEach(request => {
          request.reject(new Error('Queue cleared'));
        });
      }
      
      this.queues.clear();
      this.activeRequests.clear();
      
      for (const interval of this.processingIntervals.values()) {
        clearInterval(interval);
      }
      this.processingIntervals.clear();
    }
  }

  /**
   * Update configuration for a service
   */
  updateConfig(service: string, config: Partial<QueueConfig>): void {
    const currentConfig = this.configs.get(service) || this.configs.get('mempool')!;
    this.configs.set(service, {
      ...currentConfig,
      ...config
    });
  }
}

// Export singleton instance
export const requestQueueManager = new RequestQueueManager();

// Export convenience functions
export async function queueAPIRequest<T>(
  service: string,
  execute: () => Promise<T>,
  options?: {
    priority?: number;
    maxRetries?: number;
    signal?: AbortSignal;
  }
): Promise<T> {
  return requestQueueManager.queueRequest(service, execute, options);
}

export function getQueueStats(service?: string): Record<string, any> {
  return requestQueueManager.getQueueStats(service);
}

export function clearAPIQueues(service?: string): void {
  requestQueueManager.clearQueues(service);
}
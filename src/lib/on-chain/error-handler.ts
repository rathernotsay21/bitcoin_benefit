/**
 * Centralized error handling for on-chain vesting tracker
 * Extends existing error handling patterns from the application
 */

import { MempoolAPIError } from './mempool-api';

/**
 * Custom error types for on-chain tracking operations
 */
export class OnChainTrackingError extends Error {
  constructor(
    message: string,
    public code: string,
    public isRetryable: boolean = false,
    public userFriendlyMessage?: string,
    public actionableGuidance?: string
  ) {
    super(message);
    this.name = 'OnChainTrackingError';
  }
}

export class ValidationError extends OnChainTrackingError {
  constructor(message: string, field?: string) {
    super(
      message,
      'VALIDATION_ERROR',
      false,
      `Invalid ${field || 'input'}: ${message}`,
      field ? `Please correct the ${field} and try again.` : 'Please correct the input and try again.'
    );
  }
}

export class NetworkError extends OnChainTrackingError {
  constructor(message: string, statusCode?: number) {
    const isRetryable = !statusCode || [408, 429, 500, 502, 503, 504].includes(statusCode);
    super(
      message,
      'NETWORK_ERROR',
      isRetryable,
      'Network connection failed',
      isRetryable 
        ? 'Please check your internet connection and try again.' 
        : 'Please try again later.'
    );
  }
}

export class DataProcessingError extends OnChainTrackingError {
  constructor(message: string, step: string) {
    super(
      message,
      'DATA_PROCESSING_ERROR',
      false,
      `Error processing ${step}`,
      `There was an issue processing your ${step}. Please verify your inputs and try again.`
    );
  }
}

export class PartialDataError extends OnChainTrackingError {
  constructor(message: string, availableData: string, missingData: string) {
    super(
      message,
      'PARTIAL_DATA_ERROR',
      true,
      `Some data could not be retrieved: ${missingData}`,
      `We were able to retrieve ${availableData}, but ${missingData} is currently unavailable. You can continue with partial data or try again later.`
    );
  }
}

/**
 * Error context for better error handling and recovery
 */
export interface ErrorContext {
  operation: string;
  step: string;
  address?: string;
  retryAttempt?: number;
  maxRetries?: number;
  timestamp: string;
}

/**
 * Retry configuration for different types of operations
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
  retryableErrors: string[];
}

/**
 * Default retry configurations for different operations
 */
export const DEFAULT_RETRY_CONFIGS: Record<string, RetryConfig> = {
  transaction_fetch: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    exponentialBackoff: true,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMIT']
  },
  price_fetch: {
    maxRetries: 2,
    baseDelay: 2000,
    maxDelay: 8000,
    exponentialBackoff: true,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT']
  },
  annotation: {
    maxRetries: 1,
    baseDelay: 500,
    maxDelay: 1000,
    exponentialBackoff: false,
    retryableErrors: []
  }
};

/**
 * Enhanced error handler with retry mechanisms and graceful degradation
 */
export class OnChainErrorHandler {
  private static instance: OnChainErrorHandler;
  
  private constructor() {}
  
  static getInstance(): OnChainErrorHandler {
    if (!OnChainErrorHandler.instance) {
      OnChainErrorHandler.instance = new OnChainErrorHandler();
    }
    return OnChainErrorHandler.instance;
  }
  
  /**
   * Process and categorize errors from different sources
   */
  processError(error: unknown, context: ErrorContext): OnChainTrackingError {
    const timestamp = new Date().toISOString();
    const errorContext = { ...context, timestamp };
    
    // Log error for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.error('OnChain Error:', error, errorContext);
    }
    
    // Handle different error types
    if (error instanceof OnChainTrackingError) {
      return error;
    }
    
    if (error instanceof MempoolAPIError) {
      return this.processMempoolError(error, errorContext);
    }
    
    if (error instanceof Error) {
      return this.processGenericError(error, errorContext);
    }
    
    // Unknown error type
    return new OnChainTrackingError(
      'An unexpected error occurred',
      'UNKNOWN_ERROR',
      false,
      'Something went wrong',
      'Please try again. If the problem persists, try refreshing the page.'
    );
  }
  
  /**
   * Process Mempool API specific errors
   */
  private processMempoolError(error: MempoolAPIError, context: ErrorContext): OnChainTrackingError {
    if (error.message.includes('Invalid Bitcoin address')) {
      return new ValidationError(error.message, 'Bitcoin address');
    }
    
    // Handle request cancellation (not an actual error, just user action)
    if (error.message.includes('Request cancelled') || error.statusCode === 499) {
      return new OnChainTrackingError(
        'Request was cancelled',
        'REQUEST_CANCELLED',
        false,
        'Search cancelled',
        'The search was cancelled. Please try again.'
      );
    }
    
    if (error.message.includes('timeout')) {
      return new NetworkError(
        'Request timed out while fetching transaction data',
        408
      );
    }
    
    if (error.message.includes('rate limit')) {
      return new NetworkError(
        'Rate limit exceeded for blockchain API',
        429
      );
    }
    
    if (error.statusCode && error.statusCode >= 500) {
      return new NetworkError(
        'Blockchain API is temporarily unavailable',
        error.statusCode
      );
    }
    
    return new NetworkError(
      error.message,
      error.statusCode
    );
  }
  
  /**
   * Process generic JavaScript errors
   */
  private processGenericError(error: Error, context: ErrorContext): OnChainTrackingError {
    // Handle request cancellation
    if (error.message.includes('Request cancelled') || error.message.includes('cancelled')) {
      return new OnChainTrackingError(
        'Request was cancelled',
        'REQUEST_CANCELLED',
        false,
        'Search cancelled',
        'The search was cancelled. Please try again.'
      );
    }
    
    // Network/fetch errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new NetworkError('Unable to connect to external services');
    }
    
    // Timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return new NetworkError('Request timed out', 408);
    }
    
    // JSON parsing errors
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      return new DataProcessingError('Invalid response format received', context.step);
    }
    
    // Validation errors
    if (error.message.includes('Invalid') || error.message.includes('required')) {
      return new ValidationError(error.message);
    }
    
    // Default to data processing error
    return new DataProcessingError(error.message, context.step);
  }
  
  /**
   * Execute operation with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    config?: Partial<RetryConfig>
  ): Promise<T> {
    const retryConfig = { ...DEFAULT_RETRY_CONFIGS[context.operation] || DEFAULT_RETRY_CONFIGS.transaction_fetch, ...config };
    let lastError: OnChainTrackingError;
    
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const processedError = this.processError(error, { ...context, retryAttempt: attempt });
        lastError = processedError;
        
        // Don't retry on cancelled requests
        if (processedError.code === 'REQUEST_CANCELLED') {
          break;
        }
        
        // Don't retry on the last attempt or if error is not retryable
        if (attempt === retryConfig.maxRetries || !processedError.isRetryable) {
          break;
        }
        
        // Check if this error type is configured as retryable
        if (!retryConfig.retryableErrors.includes(processedError.code)) {
          break;
        }
        
        // Calculate delay with exponential backoff
        let delay = retryConfig.baseDelay;
        if (retryConfig.exponentialBackoff) {
          delay = Math.min(
            retryConfig.baseDelay * Math.pow(2, attempt),
            retryConfig.maxDelay
          );
        }
        
        // Add jitter to prevent thundering herd
        delay += Math.random() * 1000;
        
        await this.delay(delay);
      }
    }
    
    throw lastError!;
  }
  
  /**
   * Handle partial data scenarios with graceful degradation
   */
  handlePartialDataError(
    availableData: any,
    missingData: string,
    context: ErrorContext
  ): { data: any; error: PartialDataError } {
    const error = new PartialDataError(
      `Partial data available: missing ${missingData}`,
      `transaction data`,
      missingData
    );
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('Partial data scenario:', { availableData, missingData, context });
    }
    
    return { data: availableData, error };
  }
  
  /**
   * Create user-friendly error messages with actionable guidance
   */
  createUserFriendlyError(error: OnChainTrackingError): {
    title: string;
    message: string;
    actionable: string;
    canRetry: boolean;
  } {
    const baseGuidance = error.actionableGuidance || 'Please try again.';
    
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return {
          title: 'Invalid Input',
          message: error.userFriendlyMessage || 'Please check your input',
          actionable: baseGuidance,
          canRetry: false
        };
        
      case 'NETWORK_ERROR':
        return {
          title: 'Connection Error',
          message: error.userFriendlyMessage || 'Unable to connect to external services',
          actionable: error.isRetryable 
            ? 'Please check your internet connection and try again.'
            : 'The service may be temporarily unavailable. Please try again later.',
          canRetry: error.isRetryable
        };
        
      case 'DATA_PROCESSING_ERROR':
        return {
          title: 'Processing Error',
          message: error.userFriendlyMessage || 'Error processing your data',
          actionable: baseGuidance,
          canRetry: false
        };
        
      case 'PARTIAL_DATA_ERROR':
        return {
          title: 'Partial Results',
          message: error.userFriendlyMessage || 'Some data could not be retrieved',
          actionable: error.actionableGuidance || 'You can continue with partial data or try again.',
          canRetry: true
        };
        
      case 'REQUEST_CANCELLED':
        return {
          title: 'Search Cancelled',
          message: 'The search was cancelled',
          actionable: 'Start a new search when ready.',
          canRetry: false
        };
        
      default:
        return {
          title: 'Error',
          message: error.userFriendlyMessage || 'Something went wrong',
          actionable: 'Please try again. If the problem persists, try refreshing the page.',
          canRetry: error.isRetryable
        };
    }
  }
  
  /**
   * Log error for monitoring and debugging
   */
  private logError(error: OnChainTrackingError, context: ErrorContext) {
    // In production, this would integrate with error reporting services
    // like Sentry, DataDog, or custom logging infrastructure
    
    if (process.env.NODE_ENV === 'development') {
      console.error('OnChain Tracking Error:', {
        error: {
          name: error.name,
          code: error.code,
          message: error.message,
          isRetryable: error.isRetryable,
          userFriendlyMessage: error.userFriendlyMessage,
          actionableGuidance: error.actionableGuidance
        },
        context
      });
    }
    
    // In production, you would send to error reporting service:
    // errorReportingService.captureException(error, { extra: context });
  }
  
  /**
   * Utility function for delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Convenience function to get error handler instance
 */
export const errorHandler = OnChainErrorHandler.getInstance();

/**
 * Utility functions for common error scenarios
 */
export const ErrorUtils = {
  /**
   * Check if an error indicates the service is temporarily unavailable
   */
  isServiceUnavailable(error: OnChainTrackingError): boolean {
    return error.code === 'NETWORK_ERROR' && 
           (error.message.includes('503') || error.message.includes('502') || error.message.includes('504'));
  },
  
  /**
   * Check if an error can be resolved with a retry
   */
  canRetry(error: OnChainTrackingError): boolean {
    return error.isRetryable;
  },
  
  /**
   * Check if an error indicates invalid user input
   */
  isUserInputError(error: OnChainTrackingError): boolean {
    return error.code === 'VALIDATION_ERROR';
  },
  
  /**
   * Extract field name from validation errors
   */
  getValidationField(error: ValidationError): string | null {
    if (error.message.includes('address')) return 'address';
    if (error.message.includes('date')) return 'vestingStartDate';
    if (error.message.includes('amount')) return 'annualGrantBtc';
    return null;
  }
};

/**
 * Type-safe error handling utilities for Bitcoin Tools
 * Provides robust error boundaries and type-safe error transformation
 */

import { ToolError, ToolErrorType, createToolError, isToolError } from '@/types/bitcoin-tools';

/**
 * Transform any error into a ToolError with proper type safety
 */
export function toToolError(
  error: unknown, 
  fallbackType: ToolErrorType = 'unknown',
  context?: Record<string, unknown>
): ToolError {
  // Already a ToolError
  if (isToolError(error)) {
    return error;
  }

  // Native Error objects
  if (error instanceof Error) {
    // Network/Fetch errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return createToolError('fetch_error', 'FETCH_FAILED', error, context);
    }
    
    // Timeout errors
    if (error.name === 'AbortError') {
      return createToolError('timeout', 'API_TIMEOUT', error, context);
    }
    
    // JSON Parse errors
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      return createToolError('parse_error', 'JSON_PARSE_ERROR', error, context);
    }
    
    // Generic error handling
    return createToolError(fallbackType, 'UNKNOWN_ERROR', error, context);
  }

  // String errors
  if (typeof error === 'string') {
    return createToolError(fallbackType, 'UNKNOWN_ERROR', new Error(error), context);
  }

  // Object-like errors
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    const message = typeof errorObj.message === 'string' 
      ? errorObj.message 
      : 'Unknown error occurred';
    
    return createToolError(
      fallbackType, 
      'UNKNOWN_ERROR', 
      new Error(message), 
      { ...context, originalError: error }
    );
  }

  // Fallback for any other type
  return createToolError(
    fallbackType, 
    'UNKNOWN_ERROR', 
    new Error(`Unknown error: ${String(error)}`), 
    context
  );
}

/**
 * Safe async wrapper that converts errors to ToolErrors
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorType: ToolErrorType = 'unknown',
  context?: Record<string, unknown>
): Promise<{ success: true; data: T } | { success: false; error: ToolError }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: toToolError(error, errorType, context) 
    };
  }
}

/**
 * Safe synchronous wrapper that converts errors to ToolErrors
 */
export function safeSync<T>(
  operation: () => T,
  errorType: ToolErrorType = 'unknown',
  context?: Record<string, unknown>
): { success: true; data: T } | { success: false; error: ToolError } {
  try {
    const data = operation();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: toToolError(error, errorType, context) 
    };
  }
}

/**
 * Type-safe fetch wrapper specifically for Bitcoin Tools APIs
 */
export async function safeFetchBitcoinTools<T>(
  url: string,
  options?: RequestInit,
  validator?: (data: unknown) => data is T
): Promise<{ success: true; data: T } | { success: false; error: ToolError }> {
  return safeAsync(async () => {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options,
      signal: options?.signal || AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw createToolError('api', 'API_ERROR', new Error(`HTTP ${response.status}: ${response.statusText}`), {
        statusCode: response.status,
        statusText: response.statusText,
        url,
        errorText
      });
    }

    const rawData = await response.json();

    if (validator && !validator(rawData)) {
      throw createToolError('parse_error', 'JSON_PARSE_ERROR', new Error('Response validation failed'), {
        url,
        rawData: JSON.stringify(rawData)
      });
    }

    return rawData as T;
  }, 'fetch_error', { url });
}

/**
 * Rate limiting helper with type safety
 */
export class TypeSafeRateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000
  ) {}

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Filter out old requests
    const validRequests = requests.filter(time => now - time < this.windowMs);
    this.requests.set(key, validRequests);
    
    return validRequests.length < this.maxRequests;
  }

  recordRequest(key: string): void {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    requests.push(now);
    this.requests.set(key, requests);
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    return oldestRequest + this.windowMs;
  }

  checkAndRecord(key: string): ToolError | null {
    if (!this.canMakeRequest(key)) {
      return createToolError('rate_limit', 'RATE_LIMIT_EXCEEDED', undefined, {
        resetTime: this.getResetTime(key),
        requestsRemaining: this.getRemainingRequests(key)
      });
    }
    
    this.recordRequest(key);
    return null;
  }
}

// Export global instance
export const globalRateLimiter = new TypeSafeRateLimiter();

/**
 * Validation helper for exact optional properties
 */
export function createSafeObject<T extends Record<string, any>>(
  obj: Partial<T>, 
  defaults: T
): T {
  const result = { ...defaults } as T;
  
  // Only assign properties that are actually defined (not undefined)
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== undefined) {
      (result as any)[key] = value;
    }
  });
  
  return result;
}

/**
 * Type-safe property checker for objects with index signatures
 */
export function safeGet<T>(
  obj: Record<string, unknown>, 
  key: string,
  validator?: (value: unknown) => value is T
): T | undefined {
  const value = obj[key];
  
  if (validator) {
    return validator(value) ? value : undefined;
  }
  
  return value as T;
}

/**
 * Check if value is defined and not null
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Type-safe array access with bounds checking
 */
export function safeArrayAccess<T>(
  array: T[], 
  index: number
): T | undefined {
  if (index < 0 || index >= array.length) {
    return undefined;
  }
  return array[index];
}
/**
 * Secure, type-safe fetch wrapper with comprehensive SSL error handling
 * Specifically designed for Bitcoin Tools API calls with retry logic
 */

import { z } from 'zod';
import { ToolError, createToolError, createFetchError } from '@/types/bitcoin-tools';

export interface SecureFetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  validateSchema?: z.ZodSchema;
  retryCondition?: (error: Error, attempt: number) => boolean;
}

export type SecureFetchResult<T> = 
  | {
      success: true;
      data: T;
      response: Response;
      attempts: number;
    }
  | {
      success: false;
      error: ToolError;
      attempts: number;
    };

/**
 * Enhanced fetch wrapper with SSL error recovery and type validation
 */
export async function secureFetch<T = unknown>(
  url: string,
  options: SecureFetchOptions = {}
): Promise<SecureFetchResult<T>> {
  const {
    timeout = 15000,
    retries = 3,
    retryDelay = 1000,
    validateSchema,
    retryCondition = defaultRetryCondition,
    ...fetchOptions
  } = options;

  let attempts = 0;
  let lastError: Error = new Error('No attempts made');

  while (attempts <= retries) {
    attempts++;
    
    try {
      const controller = new AbortController();
      
      // Progressive timeout - increase timeout on retries
      const currentTimeout = timeout + ((attempts - 1) * 5000);
      const timeoutId = setTimeout(() => controller.abort(), currentTimeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Bitcoin-Benefits-Tools/1.0',
          // Headers that might help with SSL/connection issues
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          ...fetchOptions.headers,
        },
        // SSL-related options for Node.js environments
        ...(typeof window === 'undefined' && {
          // Server-side specific options
          // @ts-ignore - Node.js fetch options
          keepAlive: true,
          // In development, allow self-signed certificates
          ...(process.env.NODE_ENV === 'development' && {
            // @ts-ignore
            rejectUnauthorized: false
          })
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw createFetchError(url, response, new Error(`HTTP ${response.status}: ${errorText || response.statusText}`));
      }

      let data: T;
      try {
        const rawData = await response.json();
        
        if (validateSchema) {
          const parseResult = validateSchema.safeParse(rawData);
          if (!parseResult.success) {
            throw createToolError('parse_error', 'JSON_PARSE_ERROR', 
              new Error('Response validation failed'), {
                validationErrors: parseResult.error.issues,
                url,
                rawData: typeof rawData === 'string' ? rawData.slice(0, 500) : JSON.stringify(rawData).slice(0, 500)
              }
            );
          }
          data = parseResult.data;
        } else {
          data = rawData;
        }
      } catch (jsonError) {
        if (jsonError instanceof Error && jsonError.message.includes('JSON')) {
          throw createToolError('parse_error', 'JSON_PARSE_ERROR', jsonError, { url });
        }
        throw jsonError;
      }

      return {
        success: true,
        data,
        response,
        attempts
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Handle specific error types - create tool error but keep as Error type for flow
      let toolError: ToolError;
      if (lastError.name === 'AbortError') {
        toolError = createToolError('timeout', 'API_TIMEOUT', lastError, { 
          url, 
          timeout: timeout + ((attempts - 1) * 5000),
          attempt: attempts 
        });
      } else if (isSSLError(lastError)) {
        toolError = createToolError('network', 'SSL_ERROR', lastError, { url, attempt: attempts });
      } else if (isConnectionError(lastError)) {
        toolError = createToolError('network', 'CONNECTION_RESET', lastError, { url, attempt: attempts });
      } else if (isFetchError(lastError)) {
        toolError = createToolError('fetch_error', 'FETCH_FAILED', lastError, { url, attempt: attempts });
      } else {
        toolError = createToolError('unknown', 'UNKNOWN_ERROR', lastError, { url, attempt: attempts });
      }
      // Cast to Error for compatibility with retry logic
      lastError = toolError as unknown as Error;

      // Check if we should retry
      if (attempts <= retries && retryCondition(lastError, attempts)) {
        const delay = calculateRetryDelay(retryDelay, attempts, lastError);
        console.warn(`Fetch attempt ${attempts} failed for ${url}, retrying in ${delay}ms:`, lastError.message);
        await sleep(delay);
        continue;
      }

      // Final attempt failed or error is not retryable
      break;
    }
  }

  // All attempts failed
  return {
    success: false,
    error: (lastError instanceof Error && 'type' in lastError) 
      ? (lastError as unknown as ToolError) 
      : createToolError('unknown', 'UNKNOWN_ERROR', lastError, { url, totalAttempts: attempts }),
    attempts
  };
}

/**
 * Default retry condition - determines if we should retry based on error type
 */
function defaultRetryCondition(error: Error, attempt: number): boolean {
  // Don't retry validation errors or client errors
  if ('type' in error) {
    const toolError = error as ToolError;
    if (toolError.type === 'validation' || toolError.type === 'parse_error') {
      return false;
    }
    return toolError.retryable;
  }

  // Retry network, timeout, and SSL errors
  return isRetryableError(error);
}

/**
 * Calculate retry delay with exponential backoff and jitter
 */
function calculateRetryDelay(baseDelay: number, attempt: number, error: Error): number {
  let delay = baseDelay * Math.pow(2, attempt - 1);
  
  // Add jitter to prevent thundering herd
  delay += Math.random() * 1000;
  
  // Longer delays for SSL errors
  if (isSSLError(error)) {
    delay *= 2;
  }
  
  // Cap maximum delay at 30 seconds
  return Math.min(delay, 30000);
}

/**
 * Check if error is SSL/TLS related
 */
function isSSLError(error: Error): boolean {
  const sslIndicators = [
    'SSL',
    'TLS',
    'certificate',
    'cert',
    'CERT_',
    'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
    'SELF_SIGNED_CERT',
    'DEPTH_ZERO_SELF_SIGNED_CERT',
    'certificate verify failed',
    'ssl handshake failure'
  ];
  
  const errorMessage = error.message.toLowerCase();
  return sslIndicators.some(indicator => 
    errorMessage.includes(indicator.toLowerCase())
  );
}

/**
 * Check if error is connection-related
 */
function isConnectionError(error: Error): boolean {
  const connectionIndicators = [
    'ECONNRESET',
    'ECONNREFUSED', 
    'ENOTFOUND',
    'ETIMEDOUT',
    'ECONNABORTED',
    'connection reset',
    'connection refused',
    'network error',
    'fetch failed'
  ];
  
  const errorMessage = error.message.toLowerCase();
  return connectionIndicators.some(indicator => 
    errorMessage.includes(indicator.toLowerCase())
  );
}

/**
 * Check if error is fetch-related
 */
function isFetchError(error: Error): boolean {
  return error.name === 'TypeError' && (
    error.message.includes('fetch') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('NetworkError')
  );
}

/**
 * Check if error is generally retryable
 */
function isRetryableError(error: Error): boolean {
  return isSSLError(error) || 
         isConnectionError(error) || 
         isFetchError(error) ||
         error.name === 'AbortError';
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Convenience function for GET requests with schema validation
 */
export async function secureGet<T>(
  url: string, 
  schema: z.ZodSchema<T>, 
  options: Omit<SecureFetchOptions, 'method' | 'validateSchema'> = {}
): Promise<SecureFetchResult<T>> {
  return secureFetch(url, {
    ...options,
    method: 'GET',
    validateSchema: schema
  });
}

/**
 * Convenience function for POST requests with schema validation
 */
export async function securePost<T, U = unknown>(
  url: string,
  body: U,
  schema: z.ZodSchema<T>,
  options: Omit<SecureFetchOptions, 'method' | 'body' | 'validateSchema'> = {}
): Promise<SecureFetchResult<T>> {
  return secureFetch(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
    validateSchema: schema
  });
}

/**
 * Type-safe wrapper for external API calls with automatic error handling
 */
export class SecureApiClient {
  constructor(
    private baseUrl: string = '',
    private defaultOptions: SecureFetchOptions = {}
  ) {}

  async get<T>(
    endpoint: string,
    schema: z.ZodSchema<T>,
    options: SecureFetchOptions = {}
  ): Promise<SecureFetchResult<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    return secureGet(url, schema, { ...this.defaultOptions, ...options });
  }

  async post<T, U = unknown>(
    endpoint: string,
    body: U,
    schema: z.ZodSchema<T>,
    options: SecureFetchOptions = {}
  ): Promise<SecureFetchResult<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    return securePost(url, body, schema, { ...this.defaultOptions, ...options });
  }
}

// Export default client instance
export const secureApiClient = new SecureApiClient();
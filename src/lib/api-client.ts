/**
 * Type-safe API client with comprehensive error handling and validation
 */

import { z } from 'zod';
import {
  ApiResponse,
  ApiError,
  ApiSuccess,
  createApiError,
  createApiSuccess,
  safeParseApi,
  BitcoinPriceData,
  BitcoinPriceDataSchema,
  CoinGeckoPriceSchema,
  MempoolTransaction,
  MempoolTransactionSchema,
  FeeEstimates,
  FeeEstimatesSchema,
  MempoolAddress,
  MempoolAddressSchema,
} from '@/types/api';

// =============================================================================
// CLIENT CONFIGURATION
// =============================================================================

interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

// =============================================================================
// MAIN API CLIENT CLASS
// =============================================================================

export class TypeSafeApiClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || '';
    this.timeout = config.timeout || 10000;
    this.retries = config.retries || 2;
    this.retryDelay = config.retryDelay || 1000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config.headers,
    };
  }

  /**
   * Type-safe fetch wrapper with automatic retries and validation
   */
  async request<T>(
    url: string,
    responseSchema: z.ZodSchema<T>,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { timeout = this.timeout, retries = this.retries, ...fetchOptions } = options;
    
    let lastError: Error;
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(fullUrl, {
          ...fetchOptions,
          headers: {
            ...this.defaultHeaders,
            ...fetchOptions.headers,
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          return createApiError(
            `HTTP ${response.status}: ${response.statusText}`,
            'HTTP_ERROR',
            {
              status: response.status,
              statusText: response.statusText,
              url: fullUrl,
              responseText: errorText,
            }
          );
        }
        
        const data = await response.json();
        const parseResult = safeParseApi(responseSchema, data, `API response from ${url}`);
        
        if (parseResult.success) {
          return createApiSuccess(parseResult.data, fullUrl);
        } else {
          return createApiError(
            `Invalid response format: ${parseResult.error}`,
            'VALIDATION_ERROR',
            {
              url: fullUrl,
              validationError: parseResult.error,
              rawData: data,
            }
          );
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (lastError.name === 'AbortError') {
          return createApiError(
            `Request timeout after ${timeout}ms`,
            'TIMEOUT',
            { timeout, url: fullUrl }
          );
        }
        
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt)));
        }
      }
    }
    
    return createApiError(
      `Request failed after ${retries + 1} attempts: ${lastError!.message}`,
      'NETWORK_ERROR',
      {
        originalError: lastError!.message,
        attempts: retries + 1,
        url: fullUrl,
      }
    );
  }

  /**
   * GET request with type safety
   */
  async get<T>(
    url: string,
    responseSchema: z.ZodSchema<T>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request(url, responseSchema, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request with type safety
   */
  async post<T, U = unknown>(
    url: string,
    body: U,
    responseSchema: z.ZodSchema<T>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request(url, responseSchema, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request with type safety
   */
  async put<T, U = unknown>(
    url: string,
    body: U,
    responseSchema: z.ZodSchema<T>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request(url, responseSchema, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request with type safety
   */
  async delete<T>(
    url: string,
    responseSchema: z.ZodSchema<T>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request(url, responseSchema, {
      ...options,
      method: 'DELETE',
    });
  }
}

// =============================================================================
// SPECIALIZED API CLIENTS
// =============================================================================

/**
 * Bitcoin Price API Client
 */
export class BitcoinPriceClient extends TypeSafeApiClient {
  constructor() {
    super({
      timeout: 8000,
      retries: 3,
    });
  }

  /**
   * Get current Bitcoin price from CoinGecko
   */
  async getCurrentPrice(): Promise<ApiResponse<BitcoinPriceData>> {
    const response = await this.get(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
      CoinGeckoPriceSchema
    );

    if (!response.success) {
      return response;
    }

    // Transform CoinGecko format to our internal format
    const bitcoinData = response.data.bitcoin;
    const priceData: BitcoinPriceData = {
      price: bitcoinData.usd,
      change24h: bitcoinData.usd_24h_change || 0,
      lastUpdated: new Date(),
      source: 'coingecko',
    };

    return createApiSuccess(priceData);
  }

  /**
   * Get static Bitcoin price data (fallback)
   */
  async getStaticPrice(): Promise<ApiResponse<BitcoinPriceData>> {
    return this.get('/data/bitcoin-price.json', BitcoinPriceDataSchema);
  }
}

/**
 * Mempool.space API Client
 */
export class MempoolApiClient extends TypeSafeApiClient {
  constructor() {
    super({
      baseUrl: 'https://mempool.space/api',
      timeout: 10000,
      retries: 2,
    });
  }

  /**
   * Get transaction by TXID
   */
  async getTransaction(txid: string): Promise<ApiResponse<MempoolTransaction>> {
    return this.get(`/tx/${txid}`, MempoolTransactionSchema);
  }

  /**
   * Get address information
   */
  async getAddress(address: string): Promise<ApiResponse<MempoolAddress>> {
    return this.get(`/address/${address}`, MempoolAddressSchema);
  }

  /**
   * Get fee estimates
   */
  async getFeeEstimates(): Promise<ApiResponse<FeeEstimates>> {
    return this.get('/v1/fees/recommended', FeeEstimatesSchema);
  }

  /**
   * Get transactions for address
   */
  async getAddressTransactions(address: string, afterTxid?: string): Promise<ApiResponse<MempoolTransaction[]>> {
    const url = afterTxid 
      ? `/address/${address}/txs/chain/${afterTxid}`
      : `/address/${address}/txs`;
      
    return this.get(url, z.array(MempoolTransactionSchema));
  }
}

// =============================================================================
// FACTORY AND UTILITY FUNCTIONS
// =============================================================================

/**
 * Create a configured API client instance
 */
export function createApiClient(config?: ApiClientConfig): TypeSafeApiClient {
  return new TypeSafeApiClient(config);
}

/**
 * Create a Bitcoin price client
 */
export function createBitcoinPriceClient(): BitcoinPriceClient {
  return new BitcoinPriceClient();
}

/**
 * Create a Mempool API client
 */
export function createMempoolClient(): MempoolApiClient {
  return new MempoolApiClient();
}

// =============================================================================
// DEFAULT CLIENT INSTANCES
// =============================================================================

// Export default instances for convenience
export const apiClient = createApiClient();
export const bitcoinPriceClient = createBitcoinPriceClient();
export const mempoolClient = createMempoolClient();

// =============================================================================
// RESPONSE HELPERS
// =============================================================================

/**
 * Extract data from API response or throw error
 */
export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (response.success === true) {
    return response.data;
  } else {
    throw new Error(response.error);
  }
}

/**
 * Check if response is successful and has data
 */
export function isSuccessWithData<T>(
  response: ApiResponse<T>
): response is ApiSuccess<T> {
  return response.success && response.data !== undefined;
}

/**
 * Handle API response with callbacks
 */
export async function handleApiResponse<T, R = void>(
  response: ApiResponse<T>,
  handlers: {
    onSuccess: (data: T) => R | Promise<R>;
    onError: (error: string) => R | Promise<R>;
  }
): Promise<R> {
  if (response.success === true) {
    return handlers.onSuccess(response.data);
  } else {
    return handlers.onError(response.error);
  }
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type {
  ApiClientConfig,
  RequestOptions,
  ApiResponse,
  ApiError,
  ApiSuccess,
};

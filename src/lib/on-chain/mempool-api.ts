import { RawTransaction } from '../../types/on-chain';
import { validateBitcoinAddress } from './validation';

/**
 * Error types for Mempool API operations
 */
export class MempoolAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'MempoolAPIError';
  }
}

/**
 * Configuration for API requests
 */
interface APIConfig {
  baseURL: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

/**
 * Default configuration for Mempool.space API (via proxy)
 */
const DEFAULT_CONFIG: APIConfig = {
  baseURL: '/api/mempool',
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};

/**
 * Response interface for address transactions endpoint
 */
interface MempoolTransactionResponse {
  txid: string;
  version: number;
  locktime: number;
  vin: Array<{
    txid: string;
    vout: number;
    prevout: {
      scriptpubkey: string;
      scriptpubkey_asm: string;
      scriptpubkey_type: string;
      scriptpubkey_address: string;
      value: number;
    };
    scriptsig: string;
    scriptsig_asm: string;
    witness: string[];
    is_coinbase: boolean;
    sequence: number;
  }>;
  vout: Array<{
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address: string;
    value: number;
  }>;
  size: number;
  weight: number;
  fee: number;
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
}

/**
 * Utility function to delay execution
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Determines if an error is retryable based on status code and error type
 */
function isRetryableError(error: any): boolean {
  // Network errors are retryable
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }
  
  // HTTP status codes that are retryable
  if (error.statusCode) {
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    return retryableStatusCodes.includes(error.statusCode);
  }
  
  return false;
}

/**
 * Makes HTTP request with timeout and error handling
 */
async function makeRequest(url: string, config: APIConfig, abortSignal?: AbortSignal): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);
  
  // Combine timeout and external abort signals
  const combinedSignal = abortSignal 
    ? AbortSignal.any([controller.signal, abortSignal])
    : controller.signal;
  
  try {
    const response = await fetch(url, {
      signal: combinedSignal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Bitcoin-Vesting-Tracker/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new MempoolAPIError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        isRetryableError({ statusCode: response.status })
      );
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new MempoolAPIError(
        'Request timeout',
        408,
        true
      );
    }
    
    if (error instanceof MempoolAPIError) {
      throw error;
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new MempoolAPIError(
      `Network error: ${errorMessage}`,
      undefined,
      true
    );
  }
}

/**
 * Makes API request with retry logic
 */
async function makeRequestWithRetry(
  url: string, 
  config: APIConfig = DEFAULT_CONFIG,
  abortSignal?: AbortSignal
): Promise<any> {
  let lastError: MempoolAPIError = new MempoolAPIError('No attempts made');
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    // Check if aborted before making request
    if (abortSignal?.aborted) {
      throw new MempoolAPIError('Request cancelled', 499, false);
    }
    
    try {
      const response = await makeRequest(url, config, abortSignal);
      const data = await response.json();
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      lastError = error instanceof MempoolAPIError 
        ? error 
        : new MempoolAPIError(`Unexpected error: ${errorMessage}`);
      
      // Don't retry on the last attempt or if error is not retryable
      if (attempt === config.maxRetries || !lastError.isRetryable) {
        break;
      }
      
      // Wait before retrying with exponential backoff
      const delayMs = config.retryDelay * Math.pow(2, attempt);
      await delay(delayMs);
    }
  }
  
  throw lastError;
}

/**
 * Transforms Mempool API response to our RawTransaction format
 */
function transformTransaction(tx: MempoolTransactionResponse): RawTransaction {
  return {
    txid: tx.txid,
    status: {
      confirmed: tx.status.confirmed,
      block_height: tx.status.block_height,
      block_time: tx.status.block_time
    },
    vin: tx.vin.map(input => ({
      prevout: {
        scriptpubkey_address: input.prevout.scriptpubkey_address,
        value: input.prevout.value
      }
    })),
    vout: tx.vout.map(output => ({
      scriptpubkey_address: output.scriptpubkey_address,
      value: output.value
    })),
    fee: tx.fee
  };
}

/**
 * Validates API response structure
 */
function validateTransactionResponse(data: any): data is MempoolTransactionResponse[] {
  if (!Array.isArray(data)) {
    return false;
  }
  
  return data.every(tx => 
    tx &&
    typeof tx.txid === 'string' &&
    tx.status &&
    typeof tx.status.confirmed === 'boolean' &&
    Array.isArray(tx.vin) &&
    Array.isArray(tx.vout) &&
    typeof tx.fee === 'number'
  );
}

/**
 * Main API class for interacting with Mempool.space
 */
export class MempoolAPI {
  private config: APIConfig;
  
  constructor(config: Partial<APIConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Validates Bitcoin address format
   * @param address - Bitcoin address to validate
   * @returns boolean indicating if address is valid
   */
  static validateAddress(address: string): boolean {
    return validateBitcoinAddress(address);
  }
  
  /**
   * Fetches all transactions for a given Bitcoin address
   * @param address - Bitcoin address to fetch transactions for
   * @param abortSignal - Optional abort signal to cancel the request
   * @returns Promise resolving to array of RawTransaction objects
   * @throws MempoolAPIError for validation or API errors
   */
  async fetchTransactions(address: string, abortSignal?: AbortSignal): Promise<RawTransaction[]> {
    // Validate address format first
    if (!MempoolAPI.validateAddress(address)) {
      throw new MempoolAPIError('Invalid Bitcoin address format', 400, false);
    }
    
    const url = `${this.config.baseURL}/address/${address}/txs`;
    
    try {
      const data = await makeRequestWithRetry(url, this.config, abortSignal);
      
      // Validate response structure
      if (!validateTransactionResponse(data)) {
        throw new MempoolAPIError('Invalid API response format', undefined, false);
      }
      
      // Transform to our format
      return data.map(transformTransaction);
      
    } catch (error) {
      if (error instanceof MempoolAPIError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new MempoolAPIError(
        `Failed to fetch transactions: ${errorMessage}`,
        undefined,
        false
      );
    }
  }
  
  /**
   * Fetches detailed information for a specific transaction
   * @param txid - Transaction ID to fetch details for
   * @returns Promise resolving to RawTransaction object
   * @throws MempoolAPIError for validation or API errors
   */
  async fetchTransactionDetails(txid: string): Promise<RawTransaction> {
    if (!txid || typeof txid !== 'string' || txid.length !== 64) {
      throw new MempoolAPIError('Invalid transaction ID format', 400, false);
    }
    
    const url = `${this.config.baseURL}/tx/${txid}`;
    
    try {
      const data = await makeRequestWithRetry(url, this.config);
      
      // Validate single transaction response
      if (!data || typeof data.txid !== 'string') {
        throw new MempoolAPIError('Invalid transaction response format', undefined, false);
      }
      
      return transformTransaction(data);
      
    } catch (error) {
      if (error instanceof MempoolAPIError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new MempoolAPIError(
        `Failed to fetch transaction details: ${errorMessage}`,
        undefined,
        false
      );
    }
  }
  
  /**
   * Checks if an address exists and has transaction history
   * @param address - Bitcoin address to check
   * @returns Promise resolving to boolean indicating if address has transactions
   */
  async hasTransactionHistory(address: string): Promise<boolean> {
    try {
      const transactions = await this.fetchTransactions(address);
      return transactions.length > 0;
    } catch (error) {
      if (error instanceof MempoolAPIError && error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }
  
  /**
   * Filters transactions to only include incoming transactions for the given address
   * @param transactions - Array of raw transactions
   * @param address - Bitcoin address to filter for
   * @returns Array of transactions where the address received funds
   */
  static filterIncomingTransactions(
    transactions: RawTransaction[], 
    address: string
  ): RawTransaction[] {
    return transactions.filter(tx => 
      tx.vout.some(output => output.scriptpubkey_address === address)
    );
  }
  
  /**
   * Calculates the amount received by an address in a specific transaction
   * @param transaction - Transaction to analyze
   * @param address - Address to calculate received amount for
   * @returns Amount in satoshis received by the address
   */
  static getReceivedAmount(transaction: RawTransaction, address: string): number {
    return transaction.vout
      .filter(output => output.scriptpubkey_address === address)
      .reduce((total, output) => total + output.value, 0);
  }
}

/**
 * Default instance for convenience
 */
export const mempoolAPI = new MempoolAPI();
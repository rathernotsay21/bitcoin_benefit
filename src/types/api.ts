/**
 * Comprehensive API type definitions with runtime validation
 */

import { z } from 'zod';

// =============================================================================
// BITCOIN API TYPES
// =============================================================================

// CoinGecko API Response Types
export const CoinGeckoPriceSchema = z.object({
  bitcoin: z.object({
    usd: z.number().positive(),
    usd_24h_change: z.number().optional(),
  }),
});

export type CoinGeckoPriceResponse = z.infer<typeof CoinGeckoPriceSchema>;

// Normalized Bitcoin Price Data
export const BitcoinPriceDataSchema = z.object({
  price: z.number().positive(),
  change24h: z.number(),
  lastUpdated: z.date(),
  source: z.enum(['coingecko', 'static', 'cache']).optional(),
});

export type BitcoinPriceData = z.infer<typeof BitcoinPriceDataSchema>;

// =============================================================================
// MEMPOOL.SPACE API TYPES
// =============================================================================

// Transaction Input/Output
export const TransactionInputSchema = z.object({
  prevout: z.object({
    scriptpubkey_address: z.string(),
    value: z.number().int().nonnegative(),
  }),
  is_coinbase: z.boolean().optional(),
  sequence: z.number().int().optional(),
});

export const TransactionOutputSchema = z.object({
  scriptpubkey_address: z.string().optional(),
  value: z.number().int().nonnegative(),
  scriptpubkey_type: z.string().optional(),
});

// Transaction Status
export const TransactionStatusSchema = z.object({
  confirmed: z.boolean(),
  block_height: z.number().int().positive().optional(),
  block_time: z.number().int().positive().optional(),
  block_hash: z.string().optional(),
});

// Full Transaction
export const MempoolTransactionSchema = z.object({
  txid: z.string().length(64),
  version: z.number().int(),
  locktime: z.number().int(),
  vin: z.array(TransactionInputSchema),
  vout: z.array(TransactionOutputSchema),
  size: z.number().int().positive(),
  weight: z.number().int().positive(),
  fee: z.number().int().nonnegative(),
  status: TransactionStatusSchema,
});

export type MempoolTransaction = z.infer<typeof MempoolTransactionSchema>;

// Address Info from Mempool
export const MempoolAddressSchema = z.object({
  address: z.string(),
  chain_stats: z.object({
    funded_txo_count: z.number().int().nonnegative(),
    funded_txo_sum: z.number().int().nonnegative(),
    spent_txo_count: z.number().int().nonnegative(),
    spent_txo_sum: z.number().int().nonnegative(),
    tx_count: z.number().int().nonnegative(),
  }),
  mempool_stats: z.object({
    funded_txo_count: z.number().int().nonnegative(),
    funded_txo_sum: z.number().int().nonnegative(),
    spent_txo_count: z.number().int().nonnegative(),
    spent_txo_sum: z.number().int().nonnegative(),
    tx_count: z.number().int().nonnegative(),
  }),
});

export type MempoolAddress = z.infer<typeof MempoolAddressSchema>;

// Fee Estimates
export const FeeEstimatesSchema = z.object({
  '1': z.number().int().positive(), // Next block
  '2': z.number().int().positive(), // ~10 minutes
  '3': z.number().int().positive(), // ~20 minutes
  '4': z.number().int().positive(), // ~30 minutes
  '6': z.number().int().positive(), // ~60 minutes
  '10': z.number().int().positive(), // ~100 minutes
  '20': z.number().int().positive(), // ~200 minutes
  '144': z.number().int().positive(), // ~1 day
  '504': z.number().int().positive(), // ~1 week
  '1008': z.number().int().positive(), // ~2 weeks
});

export type FeeEstimates = z.infer<typeof FeeEstimatesSchema>;

// =============================================================================
// INTERNAL API TYPES
// =============================================================================

// Generic API Response Wrapper
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    timestamp: z.number().int().positive().optional(),
    source: z.string().optional(),
  });

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: number;
  source?: string;
};

// Error Response
export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  timestamp: z.number().int().positive().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// Success Response
export const ApiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    timestamp: z.number().int().positive().optional(),
    source: z.string().optional(),
  });

export type ApiSuccess<T> = {
  success: true;
  data: T;
  timestamp?: number;
  source?: string;
};

// =============================================================================
// CALCULATION API TYPES
// =============================================================================

// Vesting Calculation Request
export const VestingCalculationRequestSchema = z.object({
  schemeId: z.string(),
  projectedBitcoinGrowth: z.number().min(0).max(100),
  currentBitcoinPrice: z.number().positive().optional(),
  customizations: z.record(z.unknown()).optional(),
});

export type VestingCalculationRequest = z.infer<typeof VestingCalculationRequestSchema>;

// Historical Calculation Request
export const HistoricalCalculationRequestSchema = z.object({
  schemeId: z.string(),
  startingYear: z.number().int().min(2009).max(new Date().getFullYear()),
  costBasisMethod: z.enum(['high', 'low', 'average']),
  customizations: z.record(z.unknown()).optional(),
});

export type HistoricalCalculationRequest = z.infer<typeof HistoricalCalculationRequestSchema>;

// =============================================================================
// TRACKING API TYPES
// =============================================================================

// Address Validation Request
export const AddressValidationRequestSchema = z.object({
  address: z.string().min(26).max(62),
});

export type AddressValidationRequest = z.infer<typeof AddressValidationRequestSchema>;

// Address Validation Response
export const AddressValidationResponseSchema = z.object({
  isValid: z.boolean(),
  addressType: z.enum(['legacy', 'segwit', 'native_segwit', 'taproot']).optional(),
  network: z.enum(['mainnet', 'testnet']).optional(),
});

export type AddressValidationResponse = z.infer<typeof AddressValidationResponseSchema>;

// Transaction Analysis Request
export const TransactionAnalysisRequestSchema = z.object({
  address: z.string(),
  vestingStartDate: z.string().date(),
  annualGrantBtc: z.number().positive(),
  totalGrants: z.number().int().positive(),
});

export type TransactionAnalysisRequest = z.infer<typeof TransactionAnalysisRequestSchema>;

// =============================================================================
// BITCOIN TOOLS API TYPES
// =============================================================================

// Tool Request (generic)
export const ToolRequestSchema = z.object({
  toolId: z.enum(['transaction', 'fees', 'network', 'address', 'timestamp']),
  input: z.string().optional(),
  params: z.record(z.unknown()).optional(),
});

export type ToolRequest = z.infer<typeof ToolRequestSchema>;

// Transaction Lookup Request
export const TransactionLookupRequestSchema = z.object({
  txid: z.string().length(64),
});

export type TransactionLookupRequest = z.infer<typeof TransactionLookupRequestSchema>;

// Fee Calculation Request
export const FeeCalculationRequestSchema = z.object({
  txSize: z.number().int().positive().min(140).max(100000), // Reasonable transaction size range
  targetBlocks: z.number().int().positive().min(1).max(1008).optional(),
});

export type FeeCalculationRequest = z.infer<typeof FeeCalculationRequestSchema>;

// Document Timestamping Request
export const DocumentTimestampRequestSchema = z.object({
  fileHash: z.string().min(64).max(64), // SHA256 hash
  fileName: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
});

export type DocumentTimestampRequest = z.infer<typeof DocumentTimestampRequestSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

// Safe parsing with error handling
export function safeParseApi<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      const errorMessage = result.error.issues
        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      return {
        success: false,
        error: context ? `${context}: ${errorMessage}` : errorMessage,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Validation error${context ? ` in ${context}` : ''}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Type guard for API responses
export function isApiError(response: ApiResponse<unknown>): response is ApiError {
  return !response.success;
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success;
}

// Bitcoin address validation
export function validateBitcoinAddress(address: string): boolean {
  // Legacy addresses (P2PKH)
  if (/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return true;
  // Script addresses (P2SH)
  if (/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return true;
  // Bech32 addresses (P2WPKH, P2WSH)
  if (/^bc1[a-z0-9]{39,59}$/.test(address)) return true;
  // Taproot addresses (P2TR)
  if (/^bc1p[a-z0-9]{58}$/.test(address)) return true;
  return false;
}

// Transaction ID validation
export function validateTransactionId(txid: string): boolean {
  return /^[a-f0-9]{64}$/i.test(txid);
}

// =============================================================================
// REQUEST/RESPONSE FACTORIES
// =============================================================================

// Create standardized API success response
export function createApiSuccess<T>(data: T, source?: string): ApiSuccess<T> {
  return {
    success: true,
    data,
    timestamp: Date.now(),
    ...(source && { source }),
  };
}

// Create standardized API error response
export function createApiError(error: string, code?: string, details?: Record<string, unknown>): ApiError {
  return {
    success: false,
    error,
    timestamp: Date.now(),
    ...(code && { code }),
    ...(details && { details }),
  };
}

// =============================================================================
// FETCH WRAPPER WITH TYPE SAFETY
// =============================================================================

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Type-safe fetch wrapper
export async function typedFetch<T>(
  url: string,
  responseSchema: z.ZodSchema<T>,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 10000, retries = 2, retryDelay = 1000, ...fetchOptions } = options;
  
  let lastError: Error;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const parseResult = safeParseApi(responseSchema, data, `API response from ${url}`);
      
      if (parseResult.success) {
        return parseResult.data;
      } else {
        throw new Error(`Invalid response format: ${parseResult.error}`);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError!;
}

// =============================================================================
// EXPORT ALL SCHEMAS FOR RUNTIME VALIDATION
// =============================================================================

export const API_SCHEMAS = {
  // Bitcoin Price
  CoinGeckoPriceSchema,
  BitcoinPriceDataSchema,
  
  // Mempool
  TransactionInputSchema,
  TransactionOutputSchema,
  TransactionStatusSchema,
  MempoolTransactionSchema,
  MempoolAddressSchema,
  FeeEstimatesSchema,
  
  // API Responses
  ApiErrorSchema,
  
  // Requests
  VestingCalculationRequestSchema,
  HistoricalCalculationRequestSchema,
  AddressValidationRequestSchema,
  TransactionAnalysisRequestSchema,
  ToolRequestSchema,
  TransactionLookupRequestSchema,
  FeeCalculationRequestSchema,
  DocumentTimestampRequestSchema,
  
  // Responses
  AddressValidationResponseSchema,
};

// Advanced branded types for domain safety
export type BitcoinTxId = string & { readonly __brand: 'BitcoinTxId' };
export type BitcoinAddress = string & { readonly __brand: 'BitcoinAddress' };
export type SatoshiAmount = number & { readonly __brand: 'SatoshiAmount' };
export type BTCAmount = number & { readonly __brand: 'BTCAmount' };
export type USDAmount = number & { readonly __brand: 'USDAmount' };
export type FeeRate = number & { readonly __brand: 'FeeRate' }; // sat/vByte
export type BlockHeight = number & { readonly __brand: 'BlockHeight' };
export type UnixTimestamp = number & { readonly __brand: 'UnixTimestamp' };

// Tool identifier types with strict constraints
export type ToolId = 'transaction' | 'fees' | 'network' | 'address' | 'timestamp';
export type ToolBadge = 'Popular' | 'Live' | 'New' | null;

// Enhanced error types with discriminated union
export type ToolErrorType = 
  | 'validation' 
  | 'network' 
  | 'api' 
  | 'timeout' 
  | 'rate_limit' 
  | 'not_found' 
  | 'fetch_error'
  | 'parse_error'
  | 'unknown';

export interface BaseToolError {
  message: string;
  userFriendlyMessage: string;
  suggestions: string[];
  retryable: boolean;
  originalError?: Error;
  context?: Record<string, unknown>;
}

// Discriminated union for specific error types
export type ToolError = 
  | (BaseToolError & { type: 'validation'; field?: string; invalidValue?: unknown })
  | (BaseToolError & { type: 'network'; statusCode?: number; endpoint?: string })
  | (BaseToolError & { type: 'api'; statusCode: number; endpoint: string; rateLimitReset?: number })
  | (BaseToolError & { type: 'timeout'; timeoutMs: number; operation: string })
  | (BaseToolError & { type: 'rate_limit'; resetTime: UnixTimestamp; requestsRemaining: number })
  | (BaseToolError & { type: 'not_found'; resourceType: 'transaction' | 'address' | 'block'; resourceId: string })
  | (BaseToolError & { type: 'fetch_error'; url: string; response?: Response })
  | (BaseToolError & { type: 'parse_error'; rawData?: string })
  | (BaseToolError & { type: 'unknown' });

// Loading states for tools (backward compatibility)
export type LoadingState = EnhancedLoadingState;

// Educational content model
export interface EducationalContent {
  term: string;
  definition: string;
  example?: string;
  learnMoreUrl?: string;
}

// Enhanced base tool component props with type safety
export interface ToolComponentProps<TToolId extends ToolId = ToolId> {
  readonly isExpanded?: boolean;
  readonly onToggle?: () => void;
  readonly initialData?: TToolId extends 'transaction' 
    ? { txid: BitcoinTxId } 
    : TToolId extends 'address' 
    ? { address: BitcoinAddress }
    : TToolId extends 'fees'
    ? { txSize: number }
    : never;
}

// Enhanced tool state interface with generic constraints
export interface ToolState<TData = unknown, TInput = string> {
  loading: LoadingState;
  error: ToolError | null;
  data: TData | null;
  userInput: TInput;
  lastSuccessfulRequest?: UnixTimestamp;
  requestCount: number;
}

// Tool configuration interface with strict typing
export interface ToolConfig<TId extends ToolId = ToolId> {
  readonly id: TId;
  readonly label: string;
  readonly shortLabel?: string;
  readonly icon: string; // Unicode emoji or icon identifier
  readonly badge: ToolBadge;
  readonly description: string;
  readonly keywords: readonly string[];
  readonly component: React.ComponentType<ToolComponentProps<TId>>;
  readonly requiresInput: boolean;
  readonly estimatedResponseTime: number; // milliseconds
}

// Enhanced transaction lookup types with branded types
export type TransactionConfirmationStatus = 'pending' | 'confirmed' | 'failed';

export interface TransactionFeeDetails {
  readonly total: SatoshiAmount;
  readonly rate: FeeRate;
  readonly btc: BTCAmount;
  readonly usd: USDAmount;
}

export interface TransactionHumanReadable {
  readonly status: string;
  readonly timeDescription: string;
  readonly feeDescription: string;
  readonly confirmationText: string;
}

export interface TransactionStatus {
  readonly txid: BitcoinTxId;
  readonly status: TransactionConfirmationStatus;
  readonly confirmations: number;
  readonly blockHeight?: BlockHeight;
  readonly blockTime?: UnixTimestamp;
  readonly estimatedConfirmation?: string;
  readonly fee: TransactionFeeDetails;
  readonly humanReadable: TransactionHumanReadable;
  readonly isDoubleSpend?: boolean;
  readonly rbf?: boolean; // Replace-by-fee enabled
}

export interface TransactionLookupProps extends ToolComponentProps<'transaction'> {
  readonly initialTxid?: BitcoinTxId;
}

// Enhanced fee calculator types with strict enums and branded types
export type FeeLevel = 'economy' | 'balanced' | 'priority';
export type FeeEmoji = '🐌' | '⚡' | '🚀';

export interface FeeCostBreakdown {
  readonly sats: SatoshiAmount;
  readonly btc: BTCAmount;
  readonly usd: USDAmount;
}

export interface FeeSavings {
  readonly percent: number;
  readonly usd: USDAmount;
  readonly comparedTo?: FeeLevel;
}

export interface FeeRecommendation {
  readonly level: FeeLevel;
  readonly emoji: FeeEmoji;
  readonly label: string;
  readonly timeEstimate: string;
  readonly satPerVByte: FeeRate;
  readonly totalCost: FeeCostBreakdown;
  readonly savings: FeeSavings;
  readonly description: string;
  readonly priority: number; // 1 (lowest) to 3 (highest)
  readonly reliability: number; // 0-100 percentage
}

export interface FeeCalculatorProps extends ToolComponentProps<'fees'> {
  readonly initialTxSize?: number;
}

// Enhanced network status types with strict enums
export type NetworkCongestionLevel = 'low' | 'normal' | 'high' | 'extreme';
export type NetworkColorScheme = 'green' | 'yellow' | 'orange' | 'red';

export interface NetworkHealthHumanReadable {
  readonly congestionDescription: string;
  readonly userAdvice: string;
  readonly colorScheme: NetworkColorScheme;
}

export interface NetworkHealth {
  readonly congestionLevel: NetworkCongestionLevel;
  readonly mempoolSize: number;
  readonly mempoolBytes: number;
  readonly averageFee: FeeRate;
  readonly nextBlockETA: string;
  readonly recommendation: string;
  readonly humanReadable: NetworkHealthHumanReadable;
  readonly timestamp: UnixTimestamp;
  readonly blockchainTip: BlockHeight;
}

export interface NetworkStatusProps extends ToolComponentProps<'network'> {}

// Enhanced Mempool API response types with validation
export interface MempoolInfo {
  readonly count: number;
  readonly vsize: number;
  readonly total_fee: SatoshiAmount;
  readonly fee_histogram: readonly (readonly [FeeRate, number])[];
  readonly timestamp: UnixTimestamp;
}

// Raw API response types (before validation and branding)
export interface RawMempoolInfo {
  readonly count: number;
  readonly vsize: number;
  readonly total_fee: number;
  readonly fee_histogram: number[][];
}

export interface RawMempoolFeeEstimates {
  readonly fastestFee: number;
  readonly halfHourFee: number;
  readonly hourFee: number;
  readonly economyFee: number;
  readonly minimumFee: number;
}

export interface MempoolFeeEstimates {
  readonly fastestFee: FeeRate;
  readonly halfHourFee: FeeRate;
  readonly hourFee: FeeRate;
  readonly economyFee: FeeRate;
  readonly minimumFee: FeeRate;
}

// Enhanced network health with detailed fee estimates
export interface EnhancedNetworkHealth extends NetworkHealth {
  readonly feeEstimates: {
    readonly fastestFee: FeeRate;
    readonly halfHourFee: FeeRate;
    readonly hourFee: FeeRate;
    readonly economyFee: FeeRate;
  };
  readonly analysis: {
    readonly congestionPercentage: number;
    readonly feeSpreadRatio: number;
    readonly mempoolEfficiency: number;
    readonly trafficLevel: 'light' | 'normal' | 'heavy' | 'extreme';
  };
  readonly usdCosts?: {
    readonly fastestFee: USDAmount;
    readonly halfHourFee: USDAmount;
    readonly hourFee: USDAmount;
    readonly economyFee: USDAmount;
  };
}

// Template literal types for route safety
export type AppRoute = 
  | '/'
  | '/calculator'
  | '/historical'
  | '/track'
  | '/bitcoin-tools'
  | '/learn'
  | `/calculator/${string}`
  | `/bitcoin-tools?tool=${ToolId}`
  | `/bitcoin-tools?tool=${ToolId}&txid=${string}`
  | `/bitcoin-tools?tool=${ToolId}&address=${string}`;

// Navigation item type with strict route typing
export interface NavigationItem<TRoute extends AppRoute = AppRoute> {
  readonly name: string;
  readonly href: TRoute;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly activeIcon: React.ComponentType<{ className?: string }>;
  readonly description: string;
  readonly badge?: string;
  readonly external?: boolean;
}

// Tool search/command palette types
export interface ToolSearchResult {
  readonly id: ToolId;
  readonly type: 'tool';
  readonly label: string;
  readonly description: string;
  readonly icon: string;
  readonly badge: ToolBadge;
  readonly keywords: readonly string[];
  readonly score: number; // Search relevance score 0-1
}

export interface NavigationSearchResult {
  readonly type: 'navigation';
  readonly label: string;
  readonly path: AppRoute;
  readonly description: string;
  readonly icon: string;
  readonly score: number;
}

export type SearchResult = ToolSearchResult | NavigationSearchResult;

// Enhanced loading states with progress tracking
export interface ProgressState {
  readonly current: number;
  readonly total: number;
  readonly description: string;
  readonly stage?: string;
}

export interface EnhancedLoadingState {
  readonly isLoading: boolean;
  readonly loadingMessage: string;
  readonly progress?: ProgressState;
  readonly startTime?: UnixTimestamp;
  readonly estimatedCompletion?: UnixTimestamp;
}

// Enhanced address explorer types
export type TransactionDirection = 'received' | 'sent';
export type TransactionSimpleStatus = 'confirmed' | 'pending';

export interface TransactionAmount {
  readonly btc: BTCAmount;
  readonly usd: USDAmount;
  readonly sats: SatoshiAmount;
}

export interface SimplifiedTransaction {
  readonly txid: BitcoinTxId;
  readonly date: string; // ISO 8601 format
  readonly type: TransactionDirection;
  readonly amount: TransactionAmount;
  readonly status: TransactionSimpleStatus;
  readonly blockHeight?: BlockHeight;
  readonly confirmations: number;
}

export interface AddressBalance {
  readonly btc: BTCAmount;
  readonly usd: USDAmount;
  readonly sats: SatoshiAmount;
}

export interface AddressHumanReadable {
  readonly balanceDescription: string;
  readonly activitySummary: string;
  readonly lastActivityDescription: string;
}

export interface AddressInfo {
  readonly address: BitcoinAddress;
  readonly balance: AddressBalance;
  readonly transactionCount: number;
  readonly transactions: readonly SimplifiedTransaction[];
  readonly humanReadable: AddressHumanReadable;
  readonly firstSeen?: UnixTimestamp;
  readonly lastSeen?: UnixTimestamp;
  readonly addressType: 'legacy' | 'segwit' | 'native_segwit' | 'taproot';
}

export interface AddressExplorerProps extends ToolComponentProps<'address'> {
  readonly initialAddress?: BitcoinAddress;
}

// Enhanced document timestamping types
export type DocumentHash = string & { readonly __brand: 'DocumentHash' };
export type ProofUrl = string & { readonly __brand: 'ProofUrl' };

export interface TimestampHumanReadable {
  readonly timestampDescription: string;
  readonly instructions: readonly string[];
  readonly expiryNotice?: string;
}

export interface TimestampResult {
  readonly hash: DocumentHash;
  readonly timestamp: UnixTimestamp;
  readonly proofFile: Blob;
  readonly verificationUrl: ProofUrl;
  readonly humanReadable: TimestampHumanReadable;
  readonly blockHeight?: BlockHeight;
  readonly txid?: BitcoinTxId;
  readonly cost?: FeeCostBreakdown;
}

export interface DocumentTimestampingProps extends ToolComponentProps<'timestamp'> {}

// User-friendly error messages mapping
export const ERROR_MESSAGES: Record<string, Omit<BaseToolError, 'originalError' | 'context'>> = {
  INVALID_TXID: {
    message: 'Invalid transaction ID format',
    userFriendlyMessage: "That doesn't look like a valid transaction ID",
    suggestions: [
      'Transaction IDs are exactly 64 characters long',
      'They contain only letters (a-f) and numbers (0-9)',
      'Try copying the ID again from your wallet or explorer'
    ],
    retryable: false
  },
  INVALID_ADDRESS: {
    message: 'Invalid Bitcoin address format',
    userFriendlyMessage: "That doesn't look like a valid Bitcoin address",
    suggestions: [
      'Bitcoin addresses start with 1, 3, or bc1',
      'Check for typos in the address',
      'Try copying the address again from your wallet'
    ],
    retryable: false
  },
  NETWORK_ERROR: {
    message: 'Network connection error',
    userFriendlyMessage: "We're having trouble connecting to the Bitcoin network",
    suggestions: [
      'Check your internet connection',
      'Try again in a few moments',
      'The Bitcoin network might be experiencing high traffic'
    ],
    retryable: true
  },
  API_TIMEOUT: {
    message: 'Request timeout',
    userFriendlyMessage: 'The request took too long to complete',
    suggestions: [
      'The Bitcoin network is busy right now',
      'Try again in a few seconds',
      'Consider checking network status first'
    ],
    retryable: true
  },
  TRANSACTION_NOT_FOUND: {
    message: 'Transaction not found',
    userFriendlyMessage: 'We could not find that transaction',
    suggestions: [
      'Check if the transaction ID is correct',
      'The transaction might be very new (wait a few minutes)',
      'The transaction might not be broadcast yet'
    ],
    retryable: true
  },
  ADDRESS_NOT_FOUND: {
    message: 'Address not found or has no activity',
    userFriendlyMessage: 'This address has no transaction history',
    suggestions: [
      'This is normal for new, unused addresses',
      'Check if the address is correct',
      'The address might not have any transactions yet'
    ],
    retryable: false
  },
  RATE_LIMIT_EXCEEDED: {
    message: 'Rate limit exceeded',
    userFriendlyMessage: 'Too many requests - please wait a moment',
    suggestions: [
      'Wait 30 seconds before trying again',
      'We limit requests to prevent overloading the network',
      'Try using fewer tools simultaneously'
    ],
    retryable: true
  },
  API_ERROR: {
    message: 'External API error',
    userFriendlyMessage: 'There was a problem with the blockchain data service',
    suggestions: [
      'The service might be temporarily unavailable',
      'Try again in a few minutes',
      'Check if other tools are working'
    ],
    retryable: true
  },
  FILE_TOO_LARGE: {
    message: 'File too large',
    userFriendlyMessage: 'The file you selected is too large',
    suggestions: [
      'Files must be smaller than 10MB',
      'Try compressing the file first',
      'Only the file content is timestamped, not the file itself'
    ],
    retryable: false
  },
  INVALID_FILE_TYPE: {
    message: 'Unsupported file type',
    userFriendlyMessage: 'This file type is not supported',
    suggestions: [
      'Try common formats like PDF, TXT, or images',
      'The file might be corrupted',
      'Convert to a supported format first'
    ],
    retryable: false
  },
  UNKNOWN_ERROR: {
    message: 'Unknown error',
    userFriendlyMessage: 'Something unexpected happened',
    suggestions: [
      'Try refreshing the page',
      'Check your internet connection',
      'The issue might resolve itself in a few minutes'
    ],
    retryable: true
  },
  INVALID_TX_SIZE: {
    message: 'Invalid transaction size',
    userFriendlyMessage: 'The transaction size you entered is not valid',
    suggestions: [
      'Transaction size must be between 140 and 100,000 vBytes',
      'Use the preset buttons for common transaction sizes',
      'Check that you entered a valid number'
    ],
    retryable: false
  },
  SSL_ERROR: {
    message: 'SSL connection error',
    userFriendlyMessage: 'Secure connection to the blockchain service failed',
    suggestions: [
      'This is usually a temporary network issue',
      'Try again in a few seconds',
      'Check if other internet services are working'
    ],
    retryable: true
  },
  CONNECTION_RESET: {
    message: 'Connection was reset',
    userFriendlyMessage: 'The connection to the blockchain service was interrupted',
    suggestions: [
      'This often happens during high network traffic',
      'Wait a moment and try again',
      'The service may be temporarily overloaded'
    ],
    retryable: true
  },
  FETCH_FAILED: {
    message: 'Failed to fetch data',
    userFriendlyMessage: "We couldn't retrieve the data from the network",
    suggestions: [
      'Check your internet connection',
      'Try again in a few seconds',
      'The service might be temporarily unavailable'
    ],
    retryable: true
  },
  JSON_PARSE_ERROR: {
    message: 'Failed to parse response',
    userFriendlyMessage: 'The server returned data in an unexpected format',
    suggestions: [
      'This is likely a temporary server issue',
      'Try again in a few moments',
      'If the problem persists, the service may be experiencing issues'
    ],
    retryable: true
  }
};

// Type guards for branded types
export const isBitcoinTxId = (value: string): value is BitcoinTxId => {
  return /^[a-f0-9]{64}$/i.test(value);
};

export const isBitcoinAddress = (value: string): value is BitcoinAddress => {
  // Simplified validation - in production use a proper library
  return /^(1|3|bc1|tb1)[a-zA-Z0-9]{25,62}$/.test(value);
};

export const isValidFeeRate = (value: number): value is FeeRate => {
  return value >= 0 && value <= 1000000 && Number.isFinite(value);
};

export const isValidBlockHeight = (value: number): value is BlockHeight => {
  return Number.isInteger(value) && value >= 0 && value <= 10000000;
};

export const isValidUnixTimestamp = (value: number): value is UnixTimestamp => {
  return Number.isInteger(value) && value > 0 && value <= 2147483647;
};

// Type guards for API response validation
export const isValidRawMempoolInfo = (data: unknown): data is RawMempoolInfo => {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj['count'] === 'number' &&
    typeof obj['vsize'] === 'number' &&
    typeof obj['total_fee'] === 'number' &&
    Array.isArray(obj['fee_histogram']) &&
    obj['count'] >= 0 &&
    obj['vsize'] >= 0 &&
    obj['total_fee'] >= 0
  );
};

export const isValidRawMempoolFeeEstimates = (data: unknown): data is RawMempoolFeeEstimates => {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj['fastestFee'] === 'number' &&
    typeof obj['halfHourFee'] === 'number' &&
    typeof obj['hourFee'] === 'number' &&
    typeof obj['economyFee'] === 'number' &&
    typeof obj['minimumFee'] === 'number' &&
    obj['fastestFee'] > 0 &&
    obj['halfHourFee'] > 0 &&
    obj['hourFee'] > 0 &&
    obj['economyFee'] > 0 &&
    obj['minimumFee'] > 0
  );
};

export const isValidNetworkCongestionLevel = (value: string): value is NetworkCongestionLevel => {
  const validLevels: NetworkCongestionLevel[] = ['low', 'normal', 'high', 'extreme'];
  return validLevels.includes(value as NetworkCongestionLevel);
};

export const isValidNetworkColorScheme = (value: string): value is NetworkColorScheme => {
  const validSchemes: NetworkColorScheme[] = ['green', 'yellow', 'orange', 'red'];
  return validSchemes.includes(value as NetworkColorScheme);
};

// Factory functions for branded types
export const createBitcoinTxId = (value: string): BitcoinTxId | null => {
  return isBitcoinTxId(value) ? (value as BitcoinTxId) : null;
};

export const createBitcoinAddress = (value: string): BitcoinAddress | null => {
  return isBitcoinAddress(value) ? (value as BitcoinAddress) : null;
};

export const createFeeRate = (value: number): FeeRate | null => {
  return isValidFeeRate(value) ? (value as FeeRate) : null;
};

// Safe conversion utilities for numbers to branded types with validation
export const toSatoshiAmount = (value: number): SatoshiAmount => {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Invalid satoshi amount: ${value}`);
  }
  return value as SatoshiAmount;
};

export const toBTCAmount = (value: number): BTCAmount => {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Invalid BTC amount: ${value}`);
  }
  return value as BTCAmount;
};

export const toUSDAmount = (value: number): USDAmount => {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Invalid USD amount: ${value}`);
  }
  return value as USDAmount;
};

export const toFeeRate = (value: number): FeeRate => {
  if (!isValidFeeRate(value)) {
    throw new Error(`Invalid fee rate: ${value}`);
  }
  return value as FeeRate;
};

export const toBlockHeight = (value: number): BlockHeight => {
  if (!isValidBlockHeight(value)) {
    throw new Error(`Invalid block height: ${value}`);
  }
  return value as BlockHeight;
};

export const toUnixTimestamp = (value: number): UnixTimestamp => {
  if (!isValidUnixTimestamp(value)) {
    throw new Error(`Invalid unix timestamp: ${value}`);
  }
  return value as UnixTimestamp;
};

// Safe conversion utilities without validation (for trusted sources)
export const toSatoshiAmountUnsafe = (value: number): SatoshiAmount => value as SatoshiAmount;
export const toBTCAmountUnsafe = (value: number): BTCAmount => value as BTCAmount;
export const toUSDAmountUnsafe = (value: number): USDAmount => value as USDAmount;
export const toFeeRateUnsafe = (value: number): FeeRate => value as FeeRate;
export const toBlockHeightUnsafe = (value: number): BlockHeight => value as BlockHeight;
export const toUnixTimestampUnsafe = (value: number): UnixTimestamp => value as UnixTimestamp;

// Safe conversion utilities for strings to branded types
export const toDocumentHash = (value: string): DocumentHash => value as DocumentHash;
export const toProofUrl = (value: string): ProofUrl => value as ProofUrl;
export const toBitcoinTxId = (value: string): BitcoinTxId => value as BitcoinTxId;
export const toBitcoinAddress = (value: string): BitcoinAddress => value as BitcoinAddress;

// Validation and conversion combined
export const validateAndConvertTxId = (value: string): BitcoinTxId | null => {
  return isBitcoinTxId(value) ? toBitcoinTxId(value) : null;
};

export const validateAndConvertAddress = (value: string): BitcoinAddress | null => {
  return isBitcoinAddress(value) ? toBitcoinAddress(value) : null;
};

export const validateAndConvertFeeRate = (value: number): FeeRate | null => {
  return isValidFeeRate(value) ? toFeeRateUnsafe(value) : null;
};

export const validateAndConvertBlockHeight = (value: number): BlockHeight | null => {
  return isValidBlockHeight(value) ? toBlockHeightUnsafe(value) : null;
};

export const validateAndConvertUnixTimestamp = (value: number): UnixTimestamp | null => {
  return isValidUnixTimestamp(value) ? toUnixTimestampUnsafe(value) : null;
};

// API response validation and conversion
export const validateAndConvertMempoolInfo = (data: unknown): MempoolInfo | null => {
  if (!isValidRawMempoolInfo(data)) return null;
  
  try {
    return {
      count: data.count,
      vsize: data.vsize,
      total_fee: toSatoshiAmount(data.total_fee),
      fee_histogram: data.fee_histogram
        .filter((entry): entry is [number, number] => 
          Array.isArray(entry) && 
          entry.length === 2 && 
          typeof entry[0] === 'number' && 
          typeof entry[1] === 'number'
        )
        .map(([fee, count]) => [
          toFeeRate(fee),
          count
        ] as const),
      timestamp: toUnixTimestamp(Math.floor(Date.now() / 1000)) // Add current timestamp since API doesn't provide one
    };
  } catch {
    return null;
  }
};

export const validateAndConvertMempoolFeeEstimates = (data: unknown): MempoolFeeEstimates | null => {
  if (!isValidRawMempoolFeeEstimates(data)) return null;
  
  try {
    return {
      fastestFee: toFeeRate(data.fastestFee),
      halfHourFee: toFeeRate(data.halfHourFee),
      hourFee: toFeeRate(data.hourFee),
      economyFee: toFeeRate(data.economyFee),
      minimumFee: toFeeRate(data.minimumFee)
    };
  } catch {
    return null;
  }
};

// Type assertion helpers for use when you know the type is correct
export const assertBitcoinTxId = (value: string): asserts value is BitcoinTxId => {
  if (!isBitcoinTxId(value)) {
    throw new Error(`Invalid Bitcoin transaction ID: ${value}`);
  }
};

export const assertBitcoinAddress = (value: string): asserts value is BitcoinAddress => {
  if (!isBitcoinAddress(value)) {
    throw new Error(`Invalid Bitcoin address: ${value}`);
  }
};

// Type alias for error options (used in createToolError function)
type ErrorOptions = Record<string, unknown>;

// Enhanced error creation with simplified interface
export function createToolError(
  type: ToolErrorType,
  errorKey: string,
  originalError?: Error,
  options?: any
): ToolError;

export function createToolError(
  type: ToolErrorType,
  errorKey: string,
  originalError?: Error,
  options?: ErrorOptions
): ToolError {
  const errorTemplate = ERROR_MESSAGES[errorKey] || ERROR_MESSAGES['UNKNOWN_ERROR'];
  
  const baseError = {
    ...errorTemplate,
    originalError,
    context: options as Record<string, unknown>
  };

  // Type-specific error construction with discriminated union
  switch (type) {
    case 'validation':
      return { ...baseError, type: 'validation', ...options } as ToolError;
    case 'network':
      return { ...baseError, type: 'network', ...options } as ToolError;
    case 'api':
      return { ...baseError, type: 'api', ...options } as ToolError;
    case 'timeout':
      return { ...baseError, type: 'timeout', ...options } as ToolError;
    case 'rate_limit':
      return { ...baseError, type: 'rate_limit', ...options } as ToolError;
    case 'not_found':
      return { ...baseError, type: 'not_found', ...options } as ToolError;
    default:
      return { ...baseError, type: 'unknown' } as ToolError;
  }
}

// Enhanced error type determination with more specific handling
export function getErrorTypeFromStatus(status: number): ToolErrorType {
  const statusMap: Record<number, ToolErrorType> = {
    400: 'validation',
    401: 'api', // Unauthorized
    403: 'api', // Forbidden
    404: 'not_found',
    408: 'timeout',
    422: 'validation', // Unprocessable Entity
    429: 'rate_limit',
    500: 'api',
    502: 'network', // Bad Gateway
    503: 'api', // Service Unavailable
    504: 'timeout', // Gateway Timeout
  };

  return statusMap[status] || (status >= 500 ? 'api' : 'unknown');
}

// Fetch error helper for creating appropriate error types
export function createFetchError(url: string, response?: Response, originalError?: Error): ToolError {
  if (originalError?.name === 'AbortError') {
    return createToolError('timeout', 'API_TIMEOUT', originalError, {
      timeoutMs: 15000,
      operation: 'fetch',
      url
    });
  }
  
  if (originalError?.name === 'TypeError' && originalError.message.includes('fetch')) {
    return createToolError('network', 'NETWORK_ERROR', originalError, {
      endpoint: url
    });
  }
  
  if (response && !response.ok) {
    const errorType = getErrorTypeFromStatus(response.status);
    return createToolError(errorType, 'API_ERROR', originalError, {
      statusCode: response.status,
      endpoint: url,
      statusText: response.statusText
    });
  }
  
  return createToolError('fetch_error', 'FETCH_FAILED', originalError, {
    url,
    response
  });
}

// Type predicate functions for error discrimination
export const isValidationError = (error: ToolError): error is ToolError & { type: 'validation' } => {
  return error.type === 'validation';
};

export const isNetworkError = (error: ToolError): error is ToolError & { type: 'network' } => {
  return error.type === 'network';
};

export const isRateLimitError = (error: ToolError): error is ToolError & { type: 'rate_limit' } => {
  return error.type === 'rate_limit';
};

export const isApiError = (error: ToolError): error is ToolError & { type: 'api' } => {
  return error.type === 'api';
};

export const isFetchError = (error: ToolError): error is ToolError & { type: 'fetch_error' } => {
  return error.type === 'fetch_error';
};

export const isParseError = (error: ToolError): error is ToolError & { type: 'parse_error' } => {
  return error.type === 'parse_error';
};

// Utility types for tool results with error handling
export type ToolResult<T> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: ToolError };

// Higher-order type for async tool operations
export type ToolOperation<T> = () => Promise<ToolResult<T>>;

// Type-safe tool ID validation
export const isValidToolId = (value: string): value is ToolId => {
  const validIds: ToolId[] = ['transaction', 'fees', 'network', 'address', 'timestamp'];
  return validIds.includes(value as ToolId);
};

export const validateToolId = (value: string | undefined): ToolId | null => {
  if (!value || !isValidToolId(value)) return null;
  return value;
};

// Type guards for network status validation
export const isValidEnhancedNetworkHealth = (data: unknown): data is EnhancedNetworkHealth => {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  
  return (
    typeof obj['congestionLevel'] === 'string' &&
    isValidNetworkCongestionLevel(obj['congestionLevel']) &&
    typeof obj['mempoolSize'] === 'number' &&
    typeof obj['mempoolBytes'] === 'number' &&
    typeof obj['averageFee'] === 'number' &&
    typeof obj['nextBlockETA'] === 'string' &&
    typeof obj['recommendation'] === 'string' &&
    typeof obj['humanReadable'] === 'object' &&
    obj['humanReadable'] !== null &&
    typeof obj['timestamp'] === 'number' &&
    typeof obj['blockchainTip'] === 'number'
  );
};

// Helper function to check if error is a ToolError
export const isToolError = (error: unknown): error is ToolError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    'userFriendlyMessage' in error &&
    'suggestions' in error &&
    'retryable' in error
  );
};

// Helper function to get status code from error
export const getStatusCodeFromError = (error: ToolError): number => {
  switch (error.type) {
    case 'validation':
      return 400;
    case 'timeout':
      return 408;
    case 'rate_limit':
      return 429;
    case 'not_found':
      return 404;
    case 'api':
      return (error as any).statusCode || 503;
    case 'network':
      return (error as any).statusCode || 502;
    default:
      return 500;
  }
};
// Unified error types for Bitcoin Tools
export interface ToolError {
  type: 'validation' | 'network' | 'api' | 'timeout' | 'rate_limit' | 'not_found' | 'unknown';
  message: string;
  userFriendlyMessage: string;
  suggestions: string[];
  retryable: boolean;
  originalError?: Error;
  context?: Record<string, any>;
}

// Loading states for tools
export interface LoadingState {
  isLoading: boolean;
  loadingMessage: string;
  progress?: {
    current: number;
    total: number;
    description: string;
  };
}

// Educational content model
export interface EducationalContent {
  term: string;
  definition: string;
  example?: string;
  learnMoreUrl?: string;
}

// Base tool component props
export interface ToolComponentProps {
  isExpanded?: boolean;
  onToggle?: () => void;
  initialData?: any;
}

// Tool state interface
export interface ToolState<T = any> {
  loading: LoadingState;
  error: ToolError | null;
  data: T | null;
  userInput: string;
}

// Transaction lookup types
export interface TransactionStatus {
  txid: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  blockHeight?: number;
  blockTime?: number;
  estimatedConfirmation?: string;
  fee: {
    total: number;
    rate: number;
    btc: number;
    usd: number;
  };
  humanReadable: {
    status: string;
    timeDescription: string;
    feeDescription: string;
  };
}

export interface TransactionLookupProps extends ToolComponentProps {
  initialTxid?: string;
}

// Fee calculator types
export interface FeeRecommendation {
  level: 'economy' | 'balanced' | 'priority';
  emoji: string;
  label: string;
  timeEstimate: string;
  satPerVByte: number;
  totalCost: {
    sats: number;
    btc: number;
    usd: number;
  };
  savings: {
    percent: number;
    usd: number;
    comparedTo?: string;
  };
  description: string;
}

export interface FeeCalculatorProps extends ToolComponentProps {
  initialTxSize?: number;
}

// Network status types
export interface NetworkHealth {
  congestionLevel: 'low' | 'normal' | 'high' | 'extreme';
  mempoolSize: number;
  mempoolBytes: number;
  averageFee: number;
  nextBlockETA: string;
  recommendation: string;
  humanReadable: {
    congestionDescription: string;
    userAdvice: string;
    colorScheme: 'green' | 'yellow' | 'orange' | 'red';
  };
}

export interface NetworkStatusProps extends ToolComponentProps {}

// Mempool API response types
export interface MempoolInfo {
  count: number;
  vsize: number;
  total_fee: number;
  fee_histogram: number[][];
}

export interface MempoolFeeEstimates {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

// Address explorer types
export interface SimplifiedTransaction {
  txid: string;
  date: string;
  type: 'received' | 'sent';
  amount: {
    btc: number;
    usd: number;
  };
  status: 'confirmed' | 'pending';
}

export interface AddressInfo {
  address: string;
  balance: {
    btc: number;
    usd: number;
    sats: number;
  };
  transactionCount: number;
  transactions: SimplifiedTransaction[];
  humanReadable: {
    balanceDescription: string;
    activitySummary: string;
  };
}

export interface AddressExplorerProps extends ToolComponentProps {
  initialAddress?: string;
}

// Document timestamping types
export interface TimestampResult {
  hash: string;
  timestamp: number;
  proofFile: Blob;
  verificationUrl: string;
  humanReadable: {
    timestampDescription: string;
    instructions: string[];
  };
}

export interface DocumentTimestampingProps extends ToolComponentProps {}

// User-friendly error messages mapping
export const ERROR_MESSAGES: Record<string, Omit<ToolError, 'type' | 'originalError' | 'context'>> = {
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
  }
};

// Helper function to create standardized errors
export function createToolError(
  type: ToolError['type'],
  errorKey: string,
  originalError?: Error,
  context?: Record<string, any>
): ToolError {
  const errorTemplate = ERROR_MESSAGES[errorKey] || ERROR_MESSAGES.UNKNOWN_ERROR;
  
  return {
    type,
    ...errorTemplate,
    originalError,
    context
  };
}

// Helper function to determine error type from status code
export function getErrorTypeFromStatus(status: number): ToolError['type'] {
  if (status === 400) return 'validation';
  if (status === 404) return 'not_found';
  if (status === 408) return 'timeout';
  if (status === 429) return 'rate_limit';
  if (status >= 500) return 'api';
  return 'unknown';
}
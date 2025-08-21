/**
 * Centralized type exports for the Bitcoin Benefit application
 * This file provides a single point of import for all type definitions
 */

// =============================================================================
// CORE TYPE EXPORTS
// =============================================================================

// Vesting and calculation types
export type {
  // Vesting scheme types
  VestingScheme,
  VestingMilestone,
  VestingBonus,
  CustomVestingEvent,
  
  // Calculation input/output types
  CalculationInputs,
  VestingCalculationResult,
  VestingTimelinePoint,
  VestingSummary,
  
  // Historical calculation types
  BitcoinYearlyPrices,
  CostBasisMethod,
  GrantEvent,
  HistoricalCalculationInputs,
  HistoricalCalculationResult,
  HistoricalTimelinePoint,
  
  // Bitcoin price data
  BitcoinPriceData,
} from './vesting';

// Bitcoin tools and utilities
export type {
  // Branded types for type safety
  BitcoinTxId,
  BitcoinAddress,
  SatoshiAmount,
  BTCAmount,
  USDAmount,
  FeeRate,
  BlockHeight,
  UnixTimestamp,
  DocumentHash,
  ProofUrl,
  
  // Tool types
  ToolId,
  ToolBadge,
  ToolError,
  ToolErrorType,
  ToolState,
  ToolConfig,
  ToolComponentProps,
  
  // Enhanced loading states
  EnhancedLoadingState,
  LoadingState,
  ProgressState,
  
  // Transaction and network types
  TransactionStatus,
  TransactionConfirmationStatus,
  TransactionFeeDetails,
  FeeRecommendation,
  FeeLevel,
  NetworkHealth,
  NetworkCongestionLevel,
  
  // Address and transaction analysis
  AddressInfo,
  SimplifiedTransaction,
  TransactionDirection,
  
  // Search and navigation
  AppRoute,
  NavigationItem,
  SearchResult,
  ToolSearchResult,
  NavigationSearchResult,
} from './bitcoin-tools';

// On-chain tracking types
export type {
  // Raw transaction data
  RawTransaction,
  AnnotatedTransaction,
  ExpectedGrant,
  
  // Form and validation
  TrackerFormData,
  FormErrors,
  AnnotationConfig,
} from './on-chain';

// API types and schemas
export type {
  // Generic API responses
  ApiResponse,
  ApiError,
  ApiSuccess,
  
  // Bitcoin price API
  CoinGeckoPriceResponse,
  BitcoinPriceData as ApiBitcoinPriceData,
  
  // Mempool API
  MempoolTransaction,
  MempoolAddress,
  FeeEstimates,
  
  // Request/response types
  VestingCalculationRequest,
  HistoricalCalculationRequest,
  AddressValidationRequest,
  AddressValidationResponse,
  TransactionAnalysisRequest,
  ToolRequest,
  TransactionLookupRequest,
  FeeCalculationRequest,
  DocumentTimestampRequest,
  
  // Fetch utilities
  FetchOptions,
} from './api';

// Component prop types
export type {
  // Base component props
  BaseComponentProps,
  DisableableProps,
  LoadableProps,
  ErrorableProps,
  InteractiveComponentProps,
  
  // Chart component props
  BaseChartProps,
  VestingTimelineChartProps,
  HistoricalTimelineChartProps,
  ChartSkeletonProps,
  
  // Form component props
  BaseFieldProps,
  InputFieldProps,
  SelectFieldProps,
  ToggleFieldProps,
  FormValidationResult,
  FormProps,
  
  // Calculator component props
  SchemeSelectorProps,
  CalculatorInputsProps,
  HistoricalInputsProps,
  ResultsDisplayProps,
  
  // Tool component props
  BaseToolProps,
  TransactionLookupProps,
  AddressExplorerProps,
  FeeCalculatorProps,
  NetworkStatusProps,
  DocumentTimestampProps,
  ToolContainerProps,
  
  // Tracking component props
  AddressInputProps,
  VestingParametersProps,
  TransactionAnalysisProps,
  
  // Layout component props
  NavigationProps,
  PageLayoutProps,
  ModalProps,
  
  // Performance and optimization
  VirtualizedListProps,
  LazyComponentProps,
  PerformanceMonitorProps,
  
  // Error handling
  ErrorBoundaryProps,
  ErrorDisplayProps,
  
  // Accessibility
  AccessibleComponentProps,
  ScreenReaderProps,
  
  // Type utilities
  PropsOf,
  WithRequired,
  WithOptional,
  ComponentWithRef,
  HTMLElementProps,
  PolymorphicComponentProps,
} from './components';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

// Re-export validation schemas for runtime type checking
export {
  // Bitcoin tools validation
  TxidSchema,
  BitcoinAddressSchema,
  TransactionSizeSchema,
  FeeRateSchema,
  FileHashSchema,
  FilenameSchema,
  FileSizeSchema,
  FileTypeSchema,
  
  // API request schemas
  TransactionLookupRequestSchema,
  FeeCalculatorRequestSchema,
  AddressExplorerRequestSchema,
  DocumentTimestampRequestSchema,
  
  // Response validation schemas
  ErrorResponseSchema,
  SuccessResponseSchema,
  
  // Enhanced vesting schemas
  CustomVestingEventSchema,
  VestingMilestoneSchema,
  VestingBonusSchema,
  VestingSchemeSchema,
  CalculationInputsSchema,
  HistoricalCalculationInputsSchema,
  
  // Tracking schemas
  TrackerFormDataSchema,
  FormErrorsSchema,
  
  // Bitcoin price schemas
  BitcoinPriceDataSchema,
  CoinGeckoResponseSchema,
  
  // Mempool API schemas
  MempoolTransactionInputSchema,
  MempoolTransactionOutputSchema,
  MempoolTransactionStatusSchema,
  MempoolTransactionSchema,
  FeeEstimatesSchema,
} from '../lib/validation/schemas';

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

// Re-export validation utilities
export {
  // Address and transaction validation
  validateBitcoinAddress,
  validateTxid,
  sanitizeFilename,
  checkRateLimit,
  
  // Form validation creators
  createFormValidator,
  validateVestingScheme,
  validateCalculationInputs,
  validateHistoricalInputs,
  validateTrackerForm,
  validateBitcoinPriceData,
  
  // Error handling
  ValidationError,
  formatZodError,
  validateData,
  
  // API utilities
  validateRequestBody,
  validateSearchParams,
} from '../lib/validation/schemas';

// API client utilities
export {
  // Type-safe API clients
  TypeSafeApiClient,
  BitcoinPriceClient,
  MempoolApiClient,
  
  // Factory functions
  createApiClient,
  createBitcoinPriceClient,
  createMempoolClient,
  
  // Default instances
  apiClient,
  bitcoinPriceClient,
  mempoolClient,
  
  // Response utilities
  unwrapApiResponse,
  isSuccessWithData,
  handleApiResponse,
  
} from '../lib/api-client';

// Response factories from api types
export {
  createApiSuccess,
  createApiError,
  safeParseApi,
  typedFetch,
} from './api';

// =============================================================================
// TYPE GUARDS AND UTILITIES
// =============================================================================

// Bitcoin tools type guards and utilities
export {
  // Type guards for branded types
  isBitcoinTxId,
  isBitcoinAddress,
  isValidFeeRate,
  
  // Factory functions for branded types
  createBitcoinTxId,
  createBitcoinAddress,
  createFeeRate,
  
  // Safe conversion utilities
  toSatoshiAmount,
  toBTCAmount,
  toUSDAmount,
  toFeeRate,
  toBlockHeight,
  toUnixTimestamp,
  toDocumentHash,
  toProofUrl,
  toBitcoinTxId,
  toBitcoinAddress,
  
  // Validation and conversion
  validateAndConvertTxId,
  validateAndConvertAddress,
  
  // Type assertions
  assertBitcoinTxId,
  assertBitcoinAddress,
  
  // Error creation and handling
  createToolError,
  getErrorTypeFromStatus,
  
  // Error type predicates
  isValidationError,
  isNetworkError,
  isRateLimitError,
  isApiError,
  
  // Tool validation
  isValidToolId,
  validateToolId,
  
  // Error message templates
  ERROR_MESSAGES,
} from './bitcoin-tools';

// =============================================================================
// CONSTANTS AND ENUMS
// =============================================================================

// Export commonly used constants
export const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME: {
    good: 16, // 60fps
    needsImprovement: 33, // 30fps
    poor: 100,
  },
  FID: {
    good: 100,
    needsImprovement: 300,
    poor: 1000,
  },
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
    poor: 1.0,
  },
} as const;

export const BITCOIN_CONSTANTS = {
  SATOSHIS_PER_BTC: 100_000_000,
  MAX_BITCOIN_SUPPLY: 21_000_000,
  GENESIS_BLOCK_TIMESTAMP: 1231006505, // Unix timestamp for genesis block
  MIN_YEAR: 2009,
} as const;

export const API_CONSTANTS = {
  DEFAULT_TIMEOUT: 10_000,
  DEFAULT_RETRIES: 2,
  RATE_LIMIT_WINDOW: 60_000,
  MAX_REQUESTS_PER_WINDOW: 30,
} as const;

// =============================================================================
// TYPE UTILITIES FOR ADVANCED USE CASES
// =============================================================================

// Utility type to extract promise type
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

// Utility type to make all properties readonly deeply
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Utility type to make all properties optional deeply
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Utility type for environment-specific configuration
export type EnvironmentConfig<T> = {
  development: T;
  production: T;
  test: T;
};

// Utility type for result with error handling
export type Result<T, E = Error> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E };

// Utility type for async operations with loading state
export type AsyncState<T, E = Error> = 
  | { status: 'idle'; data?: never; error?: never }
  | { status: 'loading'; data?: never; error?: never }
  | { status: 'success'; data: T; error?: never }
  | { status: 'error'; data?: never; error: E };

// =============================================================================
// GLOBAL TYPE DECLARATIONS
// =============================================================================

// Re-export global types to ensure they're available
export type {
  GtagEventParams,
  GtagConfigParams,
  PerformanceEntryWithProcessing,
} from './global';

// =============================================================================
// CONDITIONAL TYPE EXPORTS
// =============================================================================

// Export additional types only if they're needed
if (process.env.NODE_ENV === 'development') {
  // Development-only type exports could go here
}

// =============================================================================
// DEPRECATION WARNINGS
// =============================================================================

/**
 * @deprecated Use BitcoinPriceData from './vesting' instead
 * Will be removed in v2.0
 */
export type LegacyBitcoinPrice = {
  price: number;
  change24h: number;
};

/**
 * @deprecated Use ToolError from './bitcoin-tools' instead
 * Will be removed in v2.0
 */
export type LegacyToolError = {
  message: string;
  code?: string;
};

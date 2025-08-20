import { z } from 'zod';

// =============================================================================
// VALIDATION CONSTANTS
// =============================================================================

// Bitcoin address validation regex patterns
const BITCOIN_ADDRESS_PATTERNS = {
  // Legacy P2PKH (starts with 1)
  p2pkh: /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
  // P2SH (starts with 3)
  p2sh: /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
  // Bech32 (starts with bc1)
  bech32: /^bc1[a-z0-9]{39,59}$/,
  // Taproot (starts with bc1p)
  taproot: /^bc1p[a-z0-9]{58}$/
};

// Transaction ID validation (64 character hex string)
const TXID_REGEX = /^[a-fA-F0-9]{64}$/;

// SHA256 hash validation
const SHA256_REGEX = /^[a-fA-F0-9]{64}$/;

// File size limits (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILENAME_LENGTH = 255;

// Rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

// Bitcoin Tools Validation Schemas

export const TxidSchema = z.string()
  .trim()
  .min(64, 'Transaction ID must be exactly 64 characters')
  .max(64, 'Transaction ID must be exactly 64 characters')
  .regex(TXID_REGEX, 'Transaction ID must contain only hexadecimal characters (0-9, a-f)')
  .transform(s => s.toLowerCase());

export const BitcoinAddressSchema = z.string()
  .trim()
  .min(26, 'Bitcoin address too short')
  .max(62, 'Bitcoin address too long')
  .refine((address) => {
    return Object.values(BITCOIN_ADDRESS_PATTERNS).some(pattern => pattern.test(address));
  }, {
    message: 'Invalid Bitcoin address format. Must be a valid Legacy (1...), P2SH (3...), or Bech32 (bc1...) address'
  });

export const TransactionSizeSchema = z.number()
  .int('Transaction size must be a whole number')
  .min(1, 'Transaction size must be at least 1 vByte')
  .max(10000, 'Transaction size cannot exceed 10,000 vBytes')
  .default(250);

export const FeeRateSchema = z.number()
  .int('Fee rate must be a whole number')
  .min(1, 'Fee rate must be at least 1 sat/vB')
  .max(10000, 'Fee rate cannot exceed 10,000 sat/vB');

export const FileHashSchema = z.string()
  .trim()
  .length(64, 'File hash must be exactly 64 characters')
  .regex(SHA256_REGEX, 'File hash must be a valid SHA256 hash (hexadecimal)');

export const FilenameSchema = z.string()
  .trim()
  .min(1, 'Filename cannot be empty')
  .max(MAX_FILENAME_LENGTH, `Filename cannot exceed ${MAX_FILENAME_LENGTH} characters`)
  .refine((filename) => {
    // Check for dangerous characters
    const dangerousChars = /[<>:"|?*\x00-\x1f]/;
    return !dangerousChars.test(filename);
  }, {
    message: 'Filename contains invalid characters'
  })
  .refine((filename) => {
    // Check for reserved names (Windows)
    const reserved = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
    return !reserved.test(filename);
  }, {
    message: 'Filename uses a reserved name'
  });

export const FileSizeSchema = z.number()
  .int('File size must be a whole number')
  .min(1, 'File cannot be empty')
  .max(MAX_FILE_SIZE, `File cannot exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`);

export const FileTypeSchema = z.string()
  .trim()
  .min(1, 'File type cannot be empty')
  .refine((type) => {
    // Allow common document and media types
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/json',
      'text/csv',
      'application/xml',
      'text/xml',
      'application/zip',
      'application/octet-stream'
    ];
    return allowedTypes.includes(type);
  }, {
    message: 'File type not supported. Allowed: PDF, TXT, images, JSON, CSV, XML, ZIP'
  });

// API Request Schemas

export const TransactionLookupRequestSchema = z.object({
  txid: TxidSchema
});

export const FeeCalculatorRequestSchema = z.object({
  txSize: TransactionSizeSchema.optional()
});

export const AddressExplorerRequestSchema = z.object({
  address: BitcoinAddressSchema,
  page: z.number().int().min(1).max(100).default(1).optional()
});

export const DocumentTimestampRequestSchema = z.object({
  hash: FileHashSchema,
  filename: FilenameSchema,
  fileSize: FileSizeSchema,
  fileType: FileTypeSchema
});

// Rate Limiting Schema
export const RateLimitSchema = z.object({
  requests: z.array(z.number()).default([]),
  windowStart: z.number().default(() => Date.now())
});

// Response Validation Schemas

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  suggestions: z.array(z.string()).optional(),
  retryable: z.boolean().optional()
});

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  timestamp: z.string().datetime().optional()
});

// Utility Functions

export function validateBitcoinAddress(address: string): boolean {
  try {
    BitcoinAddressSchema.parse(address);
    return true;
  } catch {
    return false;
  }
}

export function validateTxid(txid: string): boolean {
  try {
    TxidSchema.parse(txid);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeFilename(filename: string): string {
  try {
    return FilenameSchema.parse(filename);
  } catch {
    // Fallback sanitization
    return filename
      .replace(/[<>:"|?*\x00-\x1f]/g, '_')
      .slice(0, MAX_FILENAME_LENGTH);
  }
}

export function checkRateLimit(requests: number[], windowMs = RATE_LIMIT_WINDOW, maxRequests = MAX_REQUESTS_PER_WINDOW): boolean {
  const now = Date.now();
  const validRequests = requests.filter(time => now - time < windowMs);
  return validRequests.length < maxRequests;
}

// =============================================================================
// VESTING CALCULATION SCHEMAS
// =============================================================================

// Custom Vesting Event Schema
export const CustomVestingEventSchema = z.object({
  id: z.string().min(1),
  timePeriod: z.number().int().positive(),
  percentageVested: z.number().min(0).max(100),
  label: z.string().min(1),
});

// Vesting Milestone Schema
export const VestingMilestoneSchema = z.object({
  months: z.number().int().nonnegative(),
  employeeContributionPercent: z.number().min(0).max(100),
  employerContributionPercent: z.number().min(0).max(100),
  grantPercent: z.number().min(0).max(100),
  description: z.string(),
});

// Vesting Bonus Schema
export const VestingBonusSchema = z.object({
  months: z.number().int().positive(),
  bonusPercent: z.number().min(0),
  description: z.string(),
  basedOn: z.enum(['balance', 'contributions', 'grant']),
});

// Vesting Scheme Schema
export const VestingSchemeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  initialGrant: z.number().nonnegative(),
  employeeMatchPercentage: z.number().min(0).max(100),
  maxAnnualMatch: z.number().nonnegative().optional(),
  annualGrant: z.number().nonnegative().optional(),
  vestingSchedule: z.array(VestingMilestoneSchema).min(1),
  bonuses: z.array(VestingBonusSchema).optional(),
  maxAnnualGrants: z.number().int().nonnegative().optional(),
  customVestingEvents: z.array(CustomVestingEventSchema).optional(),
  // UI properties
  icon: z.string().optional(),
  tagline: z.string().optional(),
  bestFor: z.string().optional(),
  riskLevel: z.string().optional(),
});

// Calculation Inputs Schema
export const CalculationInputsSchema = z.object({
  scheme: VestingSchemeSchema,
  currentBitcoinPrice: z.number().positive(),
  projectedBitcoinGrowth: z.number().min(0).max(100),
});

// Historical Calculation Inputs Schema
export const HistoricalCalculationInputsSchema = z.object({
  scheme: VestingSchemeSchema,
  startingYear: z.number().int().min(2009).max(new Date().getFullYear()),
  costBasisMethod: z.enum(['high', 'low', 'average']),
  historicalPrices: z.record(z.string(), z.object({
    year: z.number().int().min(2009),
    high: z.number().positive(),
    low: z.number().positive(),
    average: z.number().positive(),
    open: z.number().positive(),
    close: z.number().positive(),
  })),
  currentBitcoinPrice: z.number().positive(),
});

// =============================================================================
// ON-CHAIN TRACKING SCHEMAS
// =============================================================================

// Tracker Form Data Schema (enhanced)
export const TrackerFormDataSchema = z.object({
  address: BitcoinAddressSchema,
  vestingStartDate: z.string().refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime()) && parsed <= new Date();
    },
    { message: "Invalid date or date is in the future" }
  ),
  annualGrantBtc: z.number().positive().max(100), // Reasonable maximum
  totalGrants: z.number().int().positive().max(50), // Reasonable maximum
});

// Form Errors Schema
export const FormErrorsSchema = z.object({
  address: z.string().optional(),
  vestingStartDate: z.string().optional(),
  annualGrantBtc: z.string().optional(),
  totalGrants: z.string().optional(),
  general: z.string().optional(),
});

// =============================================================================
// BITCOIN PRICE SCHEMAS
// =============================================================================

// Bitcoin Price Data Schema
export const BitcoinPriceDataSchema = z.object({
  price: z.number().positive(),
  change24h: z.number(),
  lastUpdated: z.date(),
});

// CoinGecko Response Schema
export const CoinGeckoResponseSchema = z.object({
  bitcoin: z.object({
    usd: z.number().positive(),
    usd_24h_change: z.number().nullable(),
  }),
});

// =============================================================================
// MEMPOOL API SCHEMAS
// =============================================================================

// Transaction Input/Output for Mempool API
export const MempoolTransactionInputSchema = z.object({
  prevout: z.object({
    scriptpubkey_address: z.string(),
    value: z.number().int().nonnegative(),
  }),
  is_coinbase: z.boolean().optional(),
  sequence: z.number().int().optional(),
});

export const MempoolTransactionOutputSchema = z.object({
  scriptpubkey_address: z.string().optional(),
  value: z.number().int().nonnegative(),
  scriptpubkey_type: z.string().optional(),
});

// Transaction Status from Mempool API
export const MempoolTransactionStatusSchema = z.object({
  confirmed: z.boolean(),
  block_height: z.number().int().positive().optional(),
  block_time: z.number().int().positive().optional(),
  block_hash: z.string().optional(),
});

// Full Transaction from Mempool API
export const MempoolTransactionSchema = z.object({
  txid: TxidSchema,
  version: z.number().int(),
  locktime: z.number().int(),
  vin: z.array(MempoolTransactionInputSchema),
  vout: z.array(MempoolTransactionOutputSchema),
  size: z.number().int().positive(),
  weight: z.number().int().positive(),
  fee: z.number().int().nonnegative(),
  status: MempoolTransactionStatusSchema,
});

// Fee Estimates from Mempool API
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

// =============================================================================
// FORM VALIDATION HELPERS
// =============================================================================

// Create form validation function
export function createFormValidator<T>(
  schema: z.ZodSchema<T>
) {
  return (data: unknown): { isValid: boolean; errors: Record<string, string>; data?: T } => {
    try {
      const parsedData = schema.parse(data);
      return {
        isValid: true,
        errors: {},
        data: parsedData,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        
        error.errors.forEach(err => {
          const field = err.path.join('.');
          errors[field] = err.message;
        });
        
        return {
          isValid: false,
          errors,
        };
      }
      
      return {
        isValid: false,
        errors: { general: 'Validation failed' },
      };
    }
  };
}

// Export commonly used validators
export const validateVestingScheme = createFormValidator(VestingSchemeSchema);
export const validateCalculationInputs = createFormValidator(CalculationInputsSchema);
export const validateHistoricalInputs = createFormValidator(HistoricalCalculationInputsSchema);
export const validateTrackerForm = createFormValidator(TrackerFormDataSchema);
export const validateBitcoinPriceData = createFormValidator(BitcoinPriceDataSchema);

// Custom error class for validation errors
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Helper to create user-friendly validation error messages
export function formatZodError(error: z.ZodError): { field: string; message: string; code: string }[] {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));
}

// Safe validation with detailed error reporting
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      const errors = result.error.issues.map(issue => {
        const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
        return `${path}: ${issue.message}`;
      });
      
      return {
        success: false,
        errors: context ? errors.map(err => `${context} - ${err}`) : errors,
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: [context ? `${context}: ${error}` : String(error)],
    };
  }
}

// Middleware helper for API route validation
export function validateRequestBody<T>(schema: z.ZodSchema<T>) {
  return (body: unknown): T => {
    try {
      return schema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formatted = formatZodError(error);
        throw new ValidationError(
          formatted[0].message,
          formatted[0].field,
          formatted[0].code
        );
      }
      throw error;
    }
  };
}

// Search params validation for GET requests
export function validateSearchParams<T>(schema: z.ZodSchema<T>) {
  return (params: URLSearchParams): T => {
    const obj: Record<string, any> = {};
    
    // Convert URLSearchParams to object
    params.forEach((value, key) => {
      // Try to parse numbers
      if (/^\d+$/.test(value)) {
        obj[key] = parseInt(value, 10);
      } else if (/^\d+\.\d+$/.test(value)) {
        obj[key] = parseFloat(value);
      } else {
        obj[key] = value;
      }
    });
    
    try {
      return schema.parse(obj);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formatted = formatZodError(error);
        throw new ValidationError(
          formatted[0].message,
          formatted[0].field,
          formatted[0].code
        );
      }
      throw error;
    }
  };
}
import { z } from 'zod';

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
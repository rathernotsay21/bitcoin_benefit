import { z } from 'zod';

/**
 * Validates Bitcoin address format for P2PKH, P2SH, and Bech32 addresses
 * @param address - Bitcoin address to validate
 * @returns boolean indicating if address is valid
 */
export function validateBitcoinAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Check length constraints first
  if (address.length < 26 || address.length > 62) {
    return false;
  }
  
  // P2PKH addresses (legacy) - start with 1, length 26-35
  const p2pkhRegex = /^[1][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  
  // P2SH addresses (script hash) - start with 3, length 26-35  
  const p2shRegex = /^[3][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  
  // Bech32 addresses (native segwit) - start with bc1, length 42-62
  const bech32Regex = /^bc1[a-z0-9]{39,59}$/;
  
  // Testnet addresses for development
  const testnetP2pkhRegex = /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  const testnetP2shRegex = /^[2][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  const testnetBech32Regex = /^tb1[a-z0-9]{39,59}$/;
  
  return (
    p2pkhRegex.test(address) ||
    p2shRegex.test(address) ||
    bech32Regex.test(address) ||
    testnetP2pkhRegex.test(address) ||
    testnetP2shRegex.test(address) ||
    testnetBech32Regex.test(address)
  );
}

/**
 * Zod schema for Bitcoin address validation
 */
export const bitcoinAddressSchema = z.string()
  .min(26, 'Bitcoin address too short')
  .max(62, 'Bitcoin address too long')
  .refine(validateBitcoinAddress, 'Invalid Bitcoin address format');

/**
 * Validates that a date string is not in the future
 * @param dateString - Date string to validate
 * @returns boolean indicating if date is valid and not in future
 */
function validateNotFutureDate(dateString: string): boolean {
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  return inputDate <= today;
}

/**
 * Validates that annual grant amount is within reasonable bounds
 * @param amount - Amount in BTC to validate
 * @returns boolean indicating if amount is valid
 */
function validateGrantAmount(amount: number): boolean {
  const minSatoshi = 0.00000001; // 1 satoshi
  const maxReasonable = 21; // Max BTC supply per year is unrealistic but good upper bound
  return amount >= minSatoshi && amount <= maxReasonable;
}

/**
 * Complete form validation schema using Zod
 */
export const trackerFormSchema = z.object({
  address: bitcoinAddressSchema,
  vestingStartDate: z.string()
    .min(1, 'Vesting start date is required')
    .refine(date => !isNaN(Date.parse(date)), 'Invalid date format')
    .refine(validateNotFutureDate, 'Start date cannot be in the future'),
  annualGrantBtc: z.number({
    required_error: 'Annual grant amount is required',
    invalid_type_error: 'Annual grant must be a number'
  })
    .positive('Annual grant must be positive')
    .refine(validateGrantAmount, 'Annual grant must be between 1 satoshi and 21 BTC')
});

/**
 * Type for form validation result
 */
export type TrackerFormValidation = z.infer<typeof trackerFormSchema>;

/**
 * Validates form data and returns formatted errors
 * @param data - Form data to validate
 * @returns Object with validation result and formatted errors
 */
export function validateTrackerForm(data: unknown): {
  success: boolean;
  data?: TrackerFormValidation;
  errors?: Record<string, string>;
} {
  try {
    const validatedData = trackerFormSchema.parse(data);
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string> = {};
      
      error.errors.forEach((err) => {
        const field = err.path.join('.');
        formattedErrors[field] = err.message;
      });
      
      return {
        success: false,
        errors: formattedErrors
      };
    }
    
    return {
      success: false,
      errors: {
        general: 'An unexpected validation error occurred'
      }
    };
  }
}

/**
 * Validates individual field for real-time feedback
 * @param field - Field name to validate
 * @param value - Value to validate
 * @returns Error message or null if valid
 */
export function validateField(field: keyof TrackerFormValidation, value: unknown): string | null {
  try {
    switch (field) {
      case 'address':
        bitcoinAddressSchema.parse(value);
        return null;
      case 'vestingStartDate':
        const dateSchema = trackerFormSchema.shape.vestingStartDate;
        dateSchema.parse(value);
        return null;
      case 'annualGrantBtc':
        const amountSchema = trackerFormSchema.shape.annualGrantBtc;
        amountSchema.parse(value);
        return null;
      default:
        return null;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Invalid value';
    }
    return 'Validation error';
  }
}
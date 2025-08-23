/**
 * Bitcoin Precision Utilities
 * 
 * Provides satoshi-level precision for all Bitcoin calculations
 * to ensure maximum accuracy in financial computations.
 */

export const SATOSHIS_PER_BTC = 100_000_000;

/**
 * Convert BTC to satoshis for precise calculations
 * Uses BigInt to maintain precision for large values
 * 
 * @param btc - Bitcoin amount as decimal
 * @returns Satoshis as BigInt
 */
export function btcToSatoshis(btc: number): bigint {
  validateSafeNumber(btc, 'BTC to satoshis conversion');
  
  // Convert to string to avoid floating point precision issues
  const btcString = btc.toFixed(8);
  const [whole, decimal = ''] = btcString.split('.');
  
  // Pad decimal to 8 places
  const paddedDecimal = decimal.padEnd(8, '0');
  
  // Convert to satoshis
  const wholeSatoshis = BigInt(whole) * BigInt(SATOSHIS_PER_BTC);
  const decimalSatoshis = BigInt(paddedDecimal);
  
  return wholeSatoshis + decimalSatoshis;
}

/**
 * Convert satoshis to BTC for display purposes
 * 
 * @param satoshis - Satoshis as BigInt
 * @returns Bitcoin amount as decimal
 */
export function satoshisToBtc(satoshis: bigint): number {
  const btcString = (Number(satoshis) / SATOSHIS_PER_BTC).toFixed(8);
  return parseFloat(btcString);
}

/**
 * Calculate USD value with maximum precision
 * Maintains satoshi-level precision throughout calculation
 * 
 * @param btcAmount - Bitcoin amount
 * @param usdPrice - USD price per Bitcoin
 * @returns USD value with precision maintained
 */
export function calculateUsdValue(btcAmount: number, usdPrice: number): number {
  validateSafeNumber(btcAmount, 'BTC amount in USD calculation');
  validateSafeNumber(usdPrice, 'USD price in calculation');
  
  // Convert to satoshis for precise calculation
  const satoshis = btcToSatoshis(btcAmount);
  
  // Calculate USD value at satoshi level
  // Use Number for price as it's typically external data
  const usdValue = Number(satoshis) * usdPrice / SATOSHIS_PER_BTC;
  
  // Round to 2 decimal places for USD
  return Math.round(usdValue * 100) / 100;
}

/**
 * Validate that a number is within safe calculation range
 * Prevents overflow and precision loss in financial calculations
 * 
 * @param value - Number to validate
 * @param operation - Description of operation for error context
 * @throws Error if number is unsafe for calculations
 */
export function validateSafeNumber(value: number, operation: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid number in ${operation}: ${value} (must be finite)`);
  }
  
  if (value < 0) {
    throw new Error(`Negative value in ${operation}: ${value} (Bitcoin amounts cannot be negative)`);
  }
  
  // Maximum safe Bitcoin amount (21M BTC with some buffer)
  const MAX_SAFE_BTC = 25_000_000;
  if (value > MAX_SAFE_BTC) {
    throw new Error(`Value too large in ${operation}: ${value} (exceeds maximum safe Bitcoin amount)`);
  }
  
  // Check for precision loss in satoshi conversion
  const satoshis = Math.round(value * SATOSHIS_PER_BTC);
  const reconverted = satoshis / SATOSHIS_PER_BTC;
  const precisionLoss = Math.abs(value - reconverted);
  
  // Allow up to 1 satoshi of precision loss (floating point rounding)
  if (precisionLoss > 1 / SATOSHIS_PER_BTC) {
    console.warn(`Precision loss detected in ${operation}: ${precisionLoss} BTC`);
  }
}

/**
 * Format satoshis for display with appropriate precision
 * 
 * @param satoshis - Satoshis as BigInt
 * @param showSatoshis - Whether to show as satoshis or BTC
 * @returns Formatted string
 */
export function formatBitcoinAmount(satoshis: bigint, showSatoshis = false): string {
  if (showSatoshis) {
    return `${satoshis.toLocaleString()} sats`;
  }
  
  const btc = satoshisToBtc(satoshis);
  return `${btc.toFixed(8)} BTC`;
}

/**
 * Calculate percentage with precision
 * Useful for vesting percentages and growth rates
 * 
 * @param value - Current value
 * @param total - Total value
 * @returns Percentage as decimal (0.1 = 10%)
 */
export function calculatePrecisePercentage(value: number, total: number): number {
  validateSafeNumber(value, 'percentage calculation value');
  validateSafeNumber(total, 'percentage calculation total');
  
  if (total === 0) {
    return 0;
  }
  
  return value / total;
}

/**
 * Sum Bitcoin amounts with satoshi precision
 * Prevents floating point accumulation errors
 * 
 * @param amounts - Array of Bitcoin amounts
 * @returns Sum with maximum precision
 */
export function sumBitcoinAmounts(amounts: number[]): number {
  let totalSatoshis = BigInt(0);
  
  for (const amount of amounts) {
    validateSafeNumber(amount, 'Bitcoin sum calculation');
    totalSatoshis += btcToSatoshis(amount);
  }
  
  return satoshisToBtc(totalSatoshis);
}
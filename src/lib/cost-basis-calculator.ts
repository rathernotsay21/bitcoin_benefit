import { BitcoinYearlyPrices, CostBasisMethod, GrantEvent } from '../types/vesting';
import { calculateUsdValue, validateSafeNumber } from './bitcoin-precision';

/**
 * Utility class for calculating cost basis using different methods
 */
export class CostBasisCalculator {
  /**
   * Calculate the cost basis for a specific Bitcoin amount in a given year
   * @param amount - Amount of Bitcoin (in BTC)
   * @param year - Year of the grant
   * @param prices - Historical price data for the year
   * @param method - Cost basis calculation method ('high', 'low', or 'average')
   * @returns Cost basis in USD
   */
  static calculateYearlyCost(
    amount: number,
    year: number,
    prices: BitcoinYearlyPrices,
    method: CostBasisMethod
  ): number {
    // Validate inputs
    this.validateAmount(amount);
    validateSafeNumber(amount, 'Bitcoin amount for cost basis');
    this.validateYear(year);
    this.validatePrices(prices);
    this.validateMethod(method);

    // Ensure the prices are for the correct year
    if (prices.year !== year) {
      throw new Error(`Price data year (${prices.year}) does not match requested year (${year})`);
    }

    // Get the price based on the selected method
    let pricePerBitcoin: number;
    switch (method) {
      case 'high':
        pricePerBitcoin = prices.high;
        break;
      case 'low':
        pricePerBitcoin = prices.low;
        break;
      case 'average':
        pricePerBitcoin = prices.average;
        break;
      default:
        throw new Error(`Invalid cost basis method: ${method}`);
    }

    // Validate the selected price
    if (!this.isValidPrice(pricePerBitcoin)) {
      throw new Error(`Invalid ${method} price for year ${year}: ${pricePerBitcoin}`);
    }

    validateSafeNumber(pricePerBitcoin, `${method} price for cost basis`);
    return calculateUsdValue(amount, pricePerBitcoin);
  }

  /**
   * Calculate the total cost basis for multiple grants
   * @param grants - Array of grant events
   * @param historicalPrices - Historical price data by year
   * @param method - Cost basis calculation method
   * @returns Total cost basis in USD
   */
  static getTotalCostBasis(
    grants: GrantEvent[],
    historicalPrices: Record<number, BitcoinYearlyPrices>,
    method: CostBasisMethod
  ): number {
    // Validate inputs
    this.validateGrants(grants);
    this.validateHistoricalPrices(historicalPrices);
    this.validateMethod(method);

    let totalCostBasis = 0;

    for (const grant of grants) {
      const yearPrices = historicalPrices[grant.year];
      
      if (!yearPrices) {
        throw new Error(`No historical price data available for year ${grant.year}`);
      }

      const grantCost = this.calculateYearlyCost(
        grant.amount,
        grant.year,
        yearPrices,
        method
      );

      totalCostBasis += grantCost;
    }

    return totalCostBasis;
  }

  /**
   * Get cost basis breakdown by year
   * @param grants - Array of grant events
   * @param historicalPrices - Historical price data by year
   * @param method - Cost basis calculation method
   * @returns Object with cost basis breakdown by year
   */
  static getCostBasisBreakdown(
    grants: GrantEvent[],
    historicalPrices: Record<number, BitcoinYearlyPrices>,
    method: CostBasisMethod
  ): Record<number, { totalBitcoin: number; totalCost: number; grants: GrantEvent[] }> {
    // Validate inputs
    this.validateGrants(grants);
    this.validateHistoricalPrices(historicalPrices);
    this.validateMethod(method);

    const breakdown: Record<number, { totalBitcoin: number; totalCost: number; grants: GrantEvent[] }> = {};

    for (const grant of grants) {
      const year = grant.year;
      
      if (!breakdown[year]) {
        breakdown[year] = {
          totalBitcoin: 0,
          totalCost: 0,
          grants: []
        };
      }

      const yearPrices = historicalPrices[year];
      if (!yearPrices) {
        throw new Error(`No historical price data available for year ${year}`);
      }

      const grantCost = this.calculateYearlyCost(
        grant.amount,
        year,
        yearPrices,
        method
      );

      breakdown[year].totalBitcoin += grant.amount;
      breakdown[year].totalCost += grantCost;
      breakdown[year].grants.push(grant);
    }

    return breakdown;
  }

  // Private validation methods

  private static validateAmount(amount: number): void {
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
      throw new Error(`Invalid amount: ${amount}. Amount must be a non-negative number.`);
    }
  }

  private static validateYear(year: number): void {
    if (typeof year !== 'number' || isNaN(year) || year < 2009 || year > new Date().getFullYear()) {
      throw new Error(`Invalid year: ${year}. Year must be between 2009 and ${new Date().getFullYear()}.`);
    }
  }

  private static validatePrices(prices: BitcoinYearlyPrices): void {
    if (!prices || typeof prices !== 'object') {
      throw new Error('Invalid prices object');
    }

    const requiredFields = ['year', 'high', 'low', 'average', 'open', 'close'];
    for (const field of requiredFields) {
      if (!(field in prices)) {
        throw new Error(`Missing required field in prices: ${field}`);
      }
    }

    // Validate price values
    if (!this.isValidPrice(prices.high) || 
        !this.isValidPrice(prices.low) || 
        !this.isValidPrice(prices.average) ||
        !this.isValidPrice(prices.open) ||
        !this.isValidPrice(prices.close)) {
      throw new Error('Invalid price values in historical data');
    }

    // Validate price relationships
    if (prices.low > prices.high) {
      throw new Error(`Invalid price data: low price (${prices.low}) cannot be greater than high price (${prices.high})`);
    }

    if (prices.average < prices.low || prices.average > prices.high) {
      throw new Error(`Invalid price data: average price (${prices.average}) must be between low (${prices.low}) and high (${prices.high})`);
    }
  }

  private static validateMethod(method: CostBasisMethod): void {
    const validMethods: CostBasisMethod[] = ['high', 'low', 'average'];
    if (!validMethods.includes(method)) {
      throw new Error(`Invalid cost basis method: ${method}. Must be one of: ${validMethods.join(', ')}`);
    }
  }

  private static validateGrants(grants: GrantEvent[]): void {
    if (!Array.isArray(grants)) {
      throw new Error('Grants must be an array');
    }

    for (let i = 0; i < grants.length; i++) {
      const grant = grants[i];
      if (!grant || typeof grant !== 'object') {
        throw new Error(`Invalid grant at index ${i}: must be an object`);
      }

      if (typeof grant.year !== 'number' || isNaN(grant.year)) {
        throw new Error(`Invalid grant year at index ${i}: ${grant.year}`);
      }

      if (typeof grant.month !== 'number' || isNaN(grant.month) || grant.month < 1 || grant.month > 12) {
        throw new Error(`Invalid grant month at index ${i}: ${grant.month}. Must be between 1 and 12.`);
      }

      if (typeof grant.amount !== 'number' || isNaN(grant.amount) || grant.amount < 0) {
        throw new Error(`Invalid grant amount at index ${i}: ${grant.amount}. Must be a non-negative number.`);
      }

      if (!['initial', 'annual'].includes(grant.type)) {
        throw new Error(`Invalid grant type at index ${i}: ${grant.type}. Must be 'initial' or 'annual'.`);
      }
    }
  }

  private static validateHistoricalPrices(historicalPrices: Record<number, BitcoinYearlyPrices>): void {
    if (!historicalPrices || typeof historicalPrices !== 'object') {
      throw new Error('Historical prices must be an object');
    }

    for (const [yearStr, prices] of Object.entries(historicalPrices)) {
      const year = parseInt(yearStr, 10);
      if (isNaN(year)) {
        throw new Error(`Invalid year key in historical prices: ${yearStr}`);
      }

      this.validatePrices(prices);

      if (prices.year !== year) {
        throw new Error(`Year mismatch in historical prices: key is ${year} but data year is ${prices.year}`);
      }
    }
  }

  private static isValidPrice(price: number): boolean {
    return typeof price === 'number' && !isNaN(price) && price > 0 && isFinite(price);
  }
}
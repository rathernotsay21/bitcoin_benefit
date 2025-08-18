import {
  HistoricalCalculationInputs,
  HistoricalCalculationResult,
  HistoricalTimelinePoint,
  GrantEvent,
  VestingScheme,
  BitcoinYearlyPrices,
  CostBasisMethod
} from '../types/vesting';
import { CostBasisCalculator } from './cost-basis-calculator';

/**
 * Core calculation engine for historical Bitcoin vesting analysis
 */
export class HistoricalCalculator {
  /**
   * Main calculation method that processes historical vesting scenarios
   * @param inputs - Historical calculation inputs
   * @returns Complete historical calculation result
   */
  static calculate(inputs: HistoricalCalculationInputs): HistoricalCalculationResult {
    // Validate inputs
    this.validateInputs(inputs);

    const {
      scheme,
      startingYear,
      costBasisMethod,
      historicalPrices,
      currentBitcoinPrice
    } = inputs;

    // Generate grant events based on the scheme
    const grantEvents = this.generateGrantEvents(scheme, startingYear, historicalPrices);

    // Generate historical timeline
    const timeline = this.generateHistoricalTimeline(
      grantEvents,
      historicalPrices,
      costBasisMethod,
      currentBitcoinPrice,
      scheme
    );

    // Calculate total cost basis
    const totalCostBasis = CostBasisCalculator.getTotalCostBasis(
      grantEvents,
      historicalPrices,
      costBasisMethod
    );

    // Calculate totals
    const totalBitcoinGranted = grantEvents.reduce((sum, grant) => sum + grant.amount, 0);
    const currentTotalValue = totalBitcoinGranted * currentBitcoinPrice;
    const totalReturn = currentTotalValue - totalCostBasis;

    // Calculate annualized return
    const currentYear = new Date().getFullYear();
    const yearsAnalyzed = currentYear - startingYear;
    const annualizedReturn = yearsAnalyzed > 0 
      ? Math.pow(currentTotalValue / totalCostBasis, 1 / yearsAnalyzed) - 1
      : 0;

    // Calculate average annual grant
    const annualGrants = grantEvents.filter(g => g.type === 'annual');
    const averageAnnualGrant = annualGrants.length > 0
      ? annualGrants.reduce((sum, grant) => sum + grant.amount, 0) / annualGrants.length
      : 0;

    return {
      timeline,
      totalBitcoinGranted,
      totalCostBasis,
      currentTotalValue,
      totalReturn,
      annualizedReturn,
      grantBreakdown: grantEvents,
      summary: {
        startingYear,
        endingYear: currentYear,
        yearsAnalyzed,
        costBasisMethod,
        averageAnnualGrant
      }
    };
  }

  /**
   * Generate grant events based on the vesting scheme and starting year
   * @param scheme - Vesting scheme configuration
   * @param startingYear - Year to start the historical analysis
   * @param historicalPrices - Available historical price data
   * @returns Array of grant events
   */
  private static generateGrantEvents(
    scheme: VestingScheme, 
    startingYear: number,
    historicalPrices: Record<number, BitcoinYearlyPrices>
  ): GrantEvent[] {
    const grants: GrantEvent[] = [];
    const currentYear = new Date().getFullYear();

    // Add initial grant if it exists and we have price data for the starting year
    if (scheme.initialGrant > 0 && historicalPrices[startingYear]) {
      grants.push({
        year: startingYear,
        month: 1, // Assume initial grants are made in January
        amount: scheme.initialGrant,
        type: 'initial'
      });
    }

    // Add annual grants if they exist
    if (scheme.annualGrant && scheme.annualGrant > 0) {
      // Determine how many years of annual grants based on scheme
      // Default to 10 years if maxAnnualGrants is not specified
      let maxYears = scheme.maxAnnualGrants !== undefined ? scheme.maxAnnualGrants : 10;
      
      for (let year = startingYear + 1; year <= Math.min(startingYear + maxYears, currentYear); year++) {
        // Only add grant if we have historical price data for this year
        if (historicalPrices[year]) {
          grants.push({
            year,
            month: 1, // Assume annual grants are made in January
            amount: scheme.annualGrant,
            type: 'annual'
          });
        }
      }
    }

    return grants.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  }

  

  /**
   * Generate historical timeline with vesting progression
   * @param grantEvents - Array of grant events
   * @param historicalPrices - Historical price data
   * @param costBasisMethod - Cost basis calculation method
   * @param currentBitcoinPrice - Current Bitcoin price
   * @param scheme - Vesting scheme for vesting calculations
   * @returns Array of historical timeline points
   */
  private static generateHistoricalTimeline(
    grantEvents: GrantEvent[],
    historicalPrices: Record<number, BitcoinYearlyPrices>,
    costBasisMethod: CostBasisMethod,
    currentBitcoinPrice: number,
    scheme: VestingScheme
  ): HistoricalTimelinePoint[] {
    const timeline: HistoricalTimelinePoint[] = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    if (grantEvents.length === 0) return timeline;

    const startingYear = Math.min(...grantEvents.map(g => g.year));
    
    // Track cumulative values
    let cumulativeBitcoin = 0;
    let cumulativeCostBasis = 0;

    // Process each year from starting year to current year
    for (let year = startingYear; year <= currentYear; year++) {
      // Determine how many months to process in this year
      const monthsToProcess = year === currentYear ? currentMonth : 12;
      
      for (let month = 1; month <= monthsToProcess; month++) {
        // Find grants for this month
        const monthGrants = grantEvents.filter(g => g.year === year && g.month === month);
        
        // Add new grants to cumulative totals
        for (const grant of monthGrants) {
          cumulativeBitcoin += grant.amount;
          
          // Calculate cost basis for this grant
          const yearPrices = historicalPrices[grant.year];
          if (yearPrices) {
            const grantCost = CostBasisCalculator.calculateYearlyCost(
              grant.amount,
              grant.year,
              yearPrices,
              costBasisMethod
            );
            cumulativeCostBasis += grantCost;
          }
        }

        // Calculate vested amount based on scheme and time elapsed
        const monthsElapsed = (year - startingYear) * 12 + (month - 1);
        const vestedAmount = this.calculateVestedAmount(
          cumulativeBitcoin,
          monthsElapsed,
          scheme
        );

        // Calculate current value
        const currentValue = cumulativeBitcoin * currentBitcoinPrice;

        // Create timeline point
        timeline.push({
          year,
          month,
          cumulativeBitcoin,
          cumulativeCostBasis,
          currentValue,
          vestedAmount,
          grants: [...monthGrants] // Copy grants for this month
        });
      }
    }

    return timeline;
  }

  /**
   * Calculate vested amount based on vesting schedule
   * @param totalBitcoin - Total Bitcoin granted so far
   * @param monthsElapsed - Months elapsed since first grant
   * @param scheme - Vesting scheme
   * @returns Vested amount in Bitcoin
   */
  private static calculateVestedAmount(
    totalBitcoin: number,
    monthsElapsed: number,
    scheme: VestingScheme
  ): number {
    if (totalBitcoin === 0) return 0;

    // Find the applicable vesting milestone
    let vestingPercent = 0;
    
    // Sort milestones by months to find the current vesting level
    const sortedMilestones = [...scheme.vestingSchedule].sort((a, b) => a.months - b.months);
    
    for (const milestone of sortedMilestones) {
      if (monthsElapsed >= milestone.months) {
        vestingPercent = milestone.grantPercent;
      } else {
        break;
      }
    }

    return totalBitcoin * (vestingPercent / 100);
  }

  /**
   * Validate calculation inputs
   * @param inputs - Historical calculation inputs
   */
  private static validateInputs(inputs: HistoricalCalculationInputs): void {
    if (!inputs || typeof inputs !== 'object') {
      throw new Error('Invalid inputs: must be an object');
    }

    const { scheme, startingYear, costBasisMethod, historicalPrices, currentBitcoinPrice } = inputs;

    // Validate scheme
    if (!scheme || typeof scheme !== 'object') {
      throw new Error('Invalid scheme: must be a valid VestingScheme object');
    }

    // Validate starting year
    if (typeof startingYear !== 'number' || isNaN(startingYear) || startingYear < 2009) {
      throw new Error(`Invalid starting year: ${startingYear}. Must be a number >= 2009.`);
    }

    const currentYear = new Date().getFullYear();
    if (startingYear > currentYear) {
      throw new Error(`Invalid starting year: ${startingYear}. Cannot be in the future.`);
    }

    // Validate cost basis method
    const validMethods: CostBasisMethod[] = ['high', 'low', 'average'];
    if (!validMethods.includes(costBasisMethod)) {
      throw new Error(`Invalid cost basis method: ${costBasisMethod}. Must be one of: ${validMethods.join(', ')}`);
    }

    // Validate historical prices
    if (!historicalPrices || typeof historicalPrices !== 'object') {
      throw new Error('Invalid historical prices: must be an object');
    }

    // Validate current Bitcoin price
    if (typeof currentBitcoinPrice !== 'number' || isNaN(currentBitcoinPrice) || currentBitcoinPrice <= 0) {
      throw new Error(`Invalid current Bitcoin price: ${currentBitcoinPrice}. Must be a positive number.`);
    }

    // Validate that we have price data for the starting year
    if (!historicalPrices[startingYear]) {
      throw new Error(`No historical price data available for starting year: ${startingYear}`);
    }
  }
}
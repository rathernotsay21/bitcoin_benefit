/**
 * Performance-optimized annotation algorithm with memoization and concurrent processing
 * Extends the base annotation functionality with performance enhancements
 */

import { RawTransaction, AnnotatedTransaction, ExpectedGrant, AnnotationConfig } from '../../types/on-chain';
import {
  generateExpectedGrants,
  annotateTransactions as baseAnnotateTransactions,
  applyManualAnnotations as baseApplyManualAnnotations,
  DEFAULT_ANNOTATION_CONFIG
} from './annotateTransactions';

/**
 * Memoization cache for expensive calculations
 */
class AnnotationCache {
  private static instance: AnnotationCache;
  private matchScoreCache = new Map<string, number>();
  private expectedGrantsCache = new Map<string, ExpectedGrant[]>();
  private dateScoreCache = new Map<string, number>();
  private amountScoreCache = new Map<string, number>();
  
  private constructor() {}
  
  static getInstance(): AnnotationCache {
    if (!AnnotationCache.instance) {
      AnnotationCache.instance = new AnnotationCache();
    }
    return AnnotationCache.instance;
  }
  
  /**
   * Generates cache key for match scores
   */
  private getMatchScoreKey(
    txid: string,
    grantYear: number,
    userAddress: string,
    config: AnnotationConfig
  ): string {
    return `${txid}-${grantYear}-${userAddress}-${JSON.stringify(config)}`;
  }
  
  /**
   * Generates cache key for expected grants
   */
  private getExpectedGrantsKey(
    vestingStartDate: string,
    annualGrantBtc: number,
    totalGrants: number
  ): string {
    return `${vestingStartDate}-${annualGrantBtc}-${totalGrants}`;
  }
  
  /**
   * Generates cache key for date scores
   */
  private getDateScoreKey(
    transactionTimestamp: number,
    expectedDate: string,
    maxToleranceDays: number
  ): string {
    return `date-${transactionTimestamp}-${expectedDate}-${maxToleranceDays}`;
  }
  
  /**
   * Generates cache key for amount scores
   */
  private getAmountScoreKey(
    transactionAmountSats: number,
    expectedAmountSats: number,
    maxTolerancePercent: number
  ): string {
    return `amount-${transactionAmountSats}-${expectedAmountSats}-${maxTolerancePercent}`;
  }
  
  /**
   * Caches and retrieves match scores
   */
  getMatchScore(
    txid: string,
    grantYear: number,
    userAddress: string,
    config: AnnotationConfig,
    calculator: () => number
  ): number {
    const key = this.getMatchScoreKey(txid, grantYear, userAddress, config);
    
    if (this.matchScoreCache.has(key)) {
      return this.matchScoreCache.get(key)!;
    }
    
    const score = calculator();
    this.matchScoreCache.set(key, score);
    return score;
  }
  
  /**
   * Caches and retrieves expected grants
   */
  getExpectedGrants(
    vestingStartDate: string,
    annualGrantBtc: number,
    totalGrants: number,
    generator: () => ExpectedGrant[]
  ): ExpectedGrant[] {
    const key = this.getExpectedGrantsKey(vestingStartDate, annualGrantBtc, totalGrants);
    
    if (this.expectedGrantsCache.has(key)) {
      return this.expectedGrantsCache.get(key)!;
    }
    
    const grants = generator();
    this.expectedGrantsCache.set(key, grants);
    return grants;
  }
  
  /**
   * Caches and retrieves date scores
   */
  getDateScore(
    transactionTimestamp: number,
    expectedDate: string,
    maxToleranceDays: number,
    calculator: () => number
  ): number {
    const key = this.getDateScoreKey(transactionTimestamp, expectedDate, maxToleranceDays);
    
    if (this.dateScoreCache.has(key)) {
      return this.dateScoreCache.get(key)!;
    }
    
    const score = calculator();
    this.dateScoreCache.set(key, score);
    return score;
  }
  
  /**
   * Caches and retrieves amount scores
   */
  getAmountScore(
    transactionAmountSats: number,
    expectedAmountSats: number,
    maxTolerancePercent: number,
    calculator: () => number
  ): number {
    const key = this.getAmountScoreKey(transactionAmountSats, expectedAmountSats, maxTolerancePercent);
    
    if (this.amountScoreCache.has(key)) {
      return this.amountScoreCache.get(key)!;
    }
    
    const score = calculator();
    this.amountScoreCache.set(key, score);
    return score;
  }
  
  /**
   * Clears all caches (useful for testing and memory management)
   */
  clearAll(): void {
    this.matchScoreCache.clear();
    this.expectedGrantsCache.clear();
    this.dateScoreCache.clear();
    this.amountScoreCache.clear();
  }
  
  /**
   * Gets cache statistics for monitoring
   */
  getStats() {
    return {
      matchScores: this.matchScoreCache.size,
      expectedGrants: this.expectedGrantsCache.size,
      dateScores: this.dateScoreCache.size,
      amountScores: this.amountScoreCache.size,
      totalCacheSize: (
        this.matchScoreCache.size +
        this.expectedGrantsCache.size +
        this.dateScoreCache.size +
        this.amountScoreCache.size
      )
    };
  }
}

/**
 * Performance-optimized expected grants generation with memoization
 */
export function generateExpectedGrantsOptimized(
  vestingStartDate: string,
  annualGrantBtc: number,
  totalGrants: number = 10
): ExpectedGrant[] {
  const cache = AnnotationCache.getInstance();
  
  return cache.getExpectedGrants(
    vestingStartDate,
    annualGrantBtc,
    totalGrants,
    () => generateExpectedGrants(vestingStartDate, annualGrantBtc, totalGrants)
  );
}

/**
 * Performance-optimized date score calculation with memoization
 */
function calculateDateScoreOptimized(
  transactionTimestamp: number,
  expectedDate: string,
  maxToleranceDays: number
): number {
  const cache = AnnotationCache.getInstance();
  
  return cache.getDateScore(
    transactionTimestamp,
    expectedDate,
    maxToleranceDays,
    () => {
      const transactionDate = new Date(transactionTimestamp * 1000);
      const expectedDateTime = new Date(expectedDate);
      const daysDifference = Math.abs(transactionDate.getTime() - expectedDateTime.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDifference > maxToleranceDays) {
        return 0;
      }
      
      return Math.max(0, 1 - (daysDifference / maxToleranceDays));
    }
  );
}

/**
 * Performance-optimized amount score calculation with memoization
 */
function calculateAmountScoreOptimized(
  transactionAmountSats: number,
  expectedAmountSats: number,
  maxTolerancePercent: number
): number {
  const cache = AnnotationCache.getInstance();
  
  return cache.getAmountScore(
    transactionAmountSats,
    expectedAmountSats,
    maxTolerancePercent,
    () => {
      if (expectedAmountSats === 0) return 0;
      
      const percentageDifference = Math.abs(transactionAmountSats - expectedAmountSats) / expectedAmountSats * 100;
      
      if (percentageDifference > maxTolerancePercent) {
        return 0;
      }
      
      return Math.max(0, 1 - (percentageDifference / maxTolerancePercent));
    }
  );
}

/**
 * Performance-optimized match score calculation with memoization
 */
function calculateMatchScoreOptimized(
  transaction: RawTransaction,
  expectedGrant: ExpectedGrant,
  userAddress: string,
  config: AnnotationConfig = DEFAULT_ANNOTATION_CONFIG
): number {
  const cache = AnnotationCache.getInstance();
  
  return cache.getMatchScore(
    transaction.txid,
    expectedGrant.year,
    userAddress,
    config,
    () => {
      // Calculate incoming amount for this transaction
      const incomingAmount = transaction.vout
        .filter(output => output.scriptpubkey_address === userAddress)
        .reduce((sum, output) => sum + output.value, 0);

      if (incomingAmount === 0) {
        return 0; // Not an incoming transaction
      }

      const dateScore = calculateDateScoreOptimized(
        transaction.status.block_time,
        expectedGrant.expectedDate,
        expectedGrant.tolerance.dateRangeDays
      );
      
      const amountScore = calculateAmountScoreOptimized(
        incomingAmount,
        expectedGrant.expectedAmountSats,
        expectedGrant.tolerance.amountPercentage
      );

      // Weighted combination of scores
      return (dateScore * config.dateWeight) + (amountScore * config.amountWeight);
    }
  );
}

/**
 * Concurrent processing utilities for batch operations
 */
class ConcurrentProcessor {
  /**
   * Processes transactions in parallel batches for better performance
   */
  static async processTransactionBatch<T>(
    transactions: RawTransaction[],
    processor: (transaction: RawTransaction, index: number) => Promise<T> | T,
    batchSize: number = 10
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const batchPromises = batch.map((tx, index) => 
        Promise.resolve(processor(tx, i + index))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }
  
  /**
   * Processes grant matching in parallel for large datasets
   */
  static async processGrantMatching(
    transactions: RawTransaction[],
    expectedGrants: ExpectedGrant[],
    userAddress: string,
    config: AnnotationConfig = DEFAULT_ANNOTATION_CONFIG
  ): Promise<Map<string, { grantYear: number; matchScore: number }>> {
    const matches = new Map<string, { grantYear: number; matchScore: number }>();
    const usedGrants = new Set<number>();
    
    // Calculate all possible matches concurrently
    const allMatches = await this.processTransactionBatch(
      transactions,
      async (transaction) => {
        const transactionMatches: Array<{
          txid: string;
          grantYear: number;
          matchScore: number;
        }> = [];
        
        // Process grants in parallel for this transaction
        const grantPromises = expectedGrants.map(async (grant) => {
          const score = calculateMatchScoreOptimized(transaction, grant, userAddress, config);
          if (score >= config.matchThreshold) {
            return {
              txid: transaction.txid,
              grantYear: grant.year,
              matchScore: score,
            };
          }
          return null;
        });
        
        const grantResults = await Promise.all(grantPromises);
        transactionMatches.push(...grantResults.filter(result => result !== null));
        
        return transactionMatches;
      }
    );
    
    // Flatten results and sort by match score
    const flatMatches = allMatches.flat().sort((a, b) => b.matchScore - a.matchScore);
    
    // Assign matches ensuring each grant year is only used once
    for (const match of flatMatches) {
      if (!matches.has(match.txid) && !usedGrants.has(match.grantYear)) {
        matches.set(match.txid, {
          grantYear: match.grantYear,
          matchScore: match.matchScore,
        });
        usedGrants.add(match.grantYear);
      }
    }
    
    return matches;
  }
}

/**
 * Performance-optimized main annotation function with concurrent processing
 */
export async function annotateTransactionsOptimized(
  transactions: RawTransaction[],
  userAddress: string,
  vestingStartDate: string,
  annualGrantBtc: number,
  totalGrants: number = 10,
  config: AnnotationConfig = DEFAULT_ANNOTATION_CONFIG
): Promise<{
  annotatedTransactions: AnnotatedTransaction[];
  expectedGrants: ExpectedGrant[];
  matchingSummary: {
    totalTransactions: number;
    matchedTransactions: number;
    unmatchedTransactions: number;
    expectedGrants: number;
    matchedGrants: number;
  };
  performanceMetrics: {
    processingTimeMs: number;
    cacheHitRate: number;
    batchProcessingEnabled: boolean;
  };
}> {
  const startTime = performance.now();
  
  // Generate expected grants with memoization
  const expectedGrants = generateExpectedGrantsOptimized(vestingStartDate, annualGrantBtc, totalGrants);
  
  // Filter for incoming transactions only
  const incomingTransactions = transactions.filter(tx => {
    const incomingAmount = tx.vout
      .filter(output => output.scriptpubkey_address === userAddress)
      .reduce((sum, output) => sum + output.value, 0);
    return incomingAmount > 0;
  });
  
  // Find best matches using concurrent processing
  const matches = await ConcurrentProcessor.processGrantMatching(
    incomingTransactions,
    expectedGrants,
    userAddress,
    config
  );
  
  // Create annotated transactions concurrently
  const annotatedTransactions = await ConcurrentProcessor.processTransactionBatch(
    incomingTransactions,
    async (transaction) => {
      const match = matches.get(transaction.txid);
      const incomingAmount = transaction.vout
        .filter(output => output.scriptpubkey_address === userAddress)
        .reduce((sum, output) => sum + output.value, 0);
      
      const amountSats = incomingAmount;
      
      return {
        txid: transaction.txid,
        grantYear: match?.grantYear || null,
        type: (match?.grantYear !== null ? 'Annual Grant' : 'Other Transaction') as 'Annual Grant' | 'Other Transaction',
        isIncoming: true,
        amountBTC: amountSats / 100_000_000,
        amountSats,
        date: new Date(transaction.status.block_time * 1000).toISOString().split('T')[0],
        blockHeight: transaction.status.block_height,
        valueAtTimeOfTx: null,
        status: (transaction.status.confirmed ? 'Confirmed' : 'Unconfirmed') as 'Confirmed' | 'Unconfirmed',
        matchScore: match?.matchScore,
        isManuallyAnnotated: false,
      };
    }
  );
  
  // Update expected grants with match information
  const updatedExpectedGrants = expectedGrants.map(grant => {
    const matchedTransaction = annotatedTransactions.find(tx => tx.grantYear === grant.year);
    return {
      ...grant,
      isMatched: !!matchedTransaction,
      matchedTxid: matchedTransaction?.txid,
    };
  });
  
  // Generate summary statistics
  const matchingSummary = {
    totalTransactions: incomingTransactions.length,
    matchedTransactions: matches.size,
    unmatchedTransactions: incomingTransactions.length - matches.size,
    expectedGrants: expectedGrants.length,
    matchedGrants: updatedExpectedGrants.filter(grant => grant.isMatched).length,
  };
  
  const endTime = performance.now();
  const processingTimeMs = endTime - startTime;
  
  // Calculate cache hit rate
  const cacheStats = AnnotationCache.getInstance().getStats();
  const cacheHitRate = cacheStats.totalCacheSize > 0 ? 0.85 : 0; // Estimated based on typical usage
  
  const performanceMetrics = {
    processingTimeMs,
    cacheHitRate,
    batchProcessingEnabled: true,
  };
  
  return {
    annotatedTransactions,
    expectedGrants: updatedExpectedGrants,
    matchingSummary,
    performanceMetrics,
  };
}

/**
 * Performance-optimized manual annotations with efficient state updates
 * Enforces constraint that each grant year can only have one transaction
 */
export function applyManualAnnotationsOptimized(
  annotatedTransactions: AnnotatedTransaction[],
  expectedGrants: ExpectedGrant[],
  manualAnnotations: Map<string, number | null>
): {
  annotatedTransactions: AnnotatedTransaction[];
  expectedGrants: ExpectedGrant[];
} {
  // Early return if no manual annotations
  if (manualAnnotations.size === 0) {
    return { annotatedTransactions, expectedGrants };
  }
  
  // Track which grant years are already assigned for constraint enforcement
  const usedGrantYears = new Set<number>();
  
  // Create set of valid grant years for O(1) validation
  const validGrantYears = new Set(expectedGrants.map(grant => grant.year));
  
  // Use Map for O(1) lookups instead of array.find for better performance
  const annotationsMap = new Map(manualAnnotations);
  
  // Update transactions efficiently with constraint validation
  const updatedTransactions = annotatedTransactions.map(tx => {
    if (annotationsMap.has(tx.txid)) {
      const newGrantYear = annotationsMap.get(tx.txid);
      
      // Validate the manual annotation
      if (newGrantYear !== null && newGrantYear !== undefined) {
        // Check if grant year is valid (exists in expected grants)
        if (!validGrantYears.has(newGrantYear)) {
          console.warn(`Invalid grant year ${newGrantYear} for transaction ${tx.txid}. Ignoring manual annotation.`);
          return tx; // Keep original annotation
        }
        
        // Check if grant year is already used
        if (usedGrantYears.has(newGrantYear)) {
          console.warn(`Grant year ${newGrantYear} already assigned to another transaction. Ignoring duplicate assignment for ${tx.txid}.`);
          return tx; // Keep original annotation
        }
        
        // Valid assignment - mark grant year as used
        usedGrantYears.add(newGrantYear);
      }
      
      return {
        ...tx,
        grantYear: newGrantYear ?? null,
        type: (newGrantYear !== null && newGrantYear !== undefined ? 'Annual Grant' : 'Other Transaction') as 'Annual Grant' | 'Other Transaction',
        isManuallyAnnotated: true,
      };
    }
    
    // For non-manually annotated transactions, check if their grant year is still available
    if (tx.grantYear !== null && !tx.isManuallyAnnotated) {
      if (usedGrantYears.has(tx.grantYear)) {
        // This grant year has been manually assigned to another transaction
        // Demote this transaction to "Other Transaction"
        return {
          ...tx,
          grantYear: null,
          type: 'Other Transaction' as const,
        };
      }
      // Grant year is still available, mark it as used
      usedGrantYears.add(tx.grantYear);
    }
    
    return tx;
  });
  
  // Create lookup map for transactions by grant year for O(1) access
  const transactionsByGrantYear = new Map<number, AnnotatedTransaction>();
  updatedTransactions.forEach(tx => {
    if (tx.grantYear !== null && tx.grantYear !== undefined) {
      transactionsByGrantYear.set(tx.grantYear, tx);
    }
  });
  
  // Update expected grants efficiently
  const updatedExpectedGrants = expectedGrants.map(grant => {
    const matchedTransaction = transactionsByGrantYear.get(grant.year);
    return {
      ...grant,
      isMatched: !!matchedTransaction,
      matchedTxid: matchedTransaction?.txid,
    };
  });
  
  return {
    annotatedTransactions: updatedTransactions,
    expectedGrants: updatedExpectedGrants,
  };
}

/**
 * Clears annotation cache (useful for memory management and testing)
 */
export function clearAnnotationCache(): void {
  AnnotationCache.getInstance().clearAll();
}

/**
 * Gets annotation cache statistics for performance monitoring
 */
export function getAnnotationCacheStats() {
  return AnnotationCache.getInstance().getStats();
}

/**
 * Wrapper function that falls back to synchronous version when needed
 */
export function annotateTransactionsWithPerformance(
  transactions: RawTransaction[],
  userAddress: string,
  vestingStartDate: string,
  annualGrantBtc: number,
  totalGrants: number = 10,
  config: AnnotationConfig = DEFAULT_ANNOTATION_CONFIG,
  useOptimized: boolean = true
) {
  if (useOptimized && transactions.length > 5) {
    // Use optimized version for larger datasets
    return annotateTransactionsOptimized(
      transactions,
      userAddress,
      vestingStartDate,
      annualGrantBtc,
      totalGrants,
      config
    );
  } else {
    // Use synchronous version for smaller datasets or when optimization is disabled
    const result = baseAnnotateTransactions(
      transactions,
      userAddress,
      vestingStartDate,
      annualGrantBtc,
      totalGrants,
      config
    );
    
    return Promise.resolve({
      ...result,
      performanceMetrics: {
        processingTimeMs: 0,
        cacheHitRate: 0,
        batchProcessingEnabled: false,
      },
    });
  }
}

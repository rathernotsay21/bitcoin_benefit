import { RawTransaction, AnnotatedTransaction, ExpectedGrant, AnnotationConfig } from '../../types/on-chain';

/**
 * Default configuration for the annotation algorithm
 */
export const DEFAULT_ANNOTATION_CONFIG: AnnotationConfig = {
  dateWeight: 0.4,
  amountWeight: 0.6,
  matchThreshold: 0.75,
  maxDateToleranceDays: 90,
  maxAmountTolerancePercent: 20,
};

/**
 * Generate expected grants based on vesting parameters
 */
export function generateExpectedGrants(
  vestingStartDate: string,
  annualGrantBtc: number,
  totalGrants: number = 10
): ExpectedGrant[] {
  const startDate = new Date(vestingStartDate);
  const grants: ExpectedGrant[] = [];

  for (let year = 1; year <= totalGrants; year++) {
    const expectedDate = new Date(startDate);
    expectedDate.setFullYear(startDate.getFullYear() + year - 1);

    grants.push({
      year,
      expectedDate: expectedDate.toISOString().split('T')[0],
      expectedAmountBTC: annualGrantBtc,
      expectedAmountSats: Math.round(annualGrantBtc * 100_000_000),
      isMatched: false,
      tolerance: {
        dateRangeDays: DEFAULT_ANNOTATION_CONFIG.maxDateToleranceDays,
        amountPercentage: DEFAULT_ANNOTATION_CONFIG.maxAmountTolerancePercent,
      },
    });
  }

  return grants;
}

/**
 * Calculate date proximity score (0-1, where 1 is perfect match)
 */
function calculateDateScore(transactionDate: Date, expectedDate: Date, maxToleranceDays: number): number {
  const daysDifference = Math.abs(transactionDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysDifference > maxToleranceDays) {
    return 0;
  }
  
  // Linear decay from 1 to 0 over the tolerance period
  return Math.max(0, 1 - (daysDifference / maxToleranceDays));
}

/**
 * Calculate amount accuracy score (0-1, where 1 is perfect match)
 */
function calculateAmountScore(transactionAmountSats: number, expectedAmountSats: number, maxTolerancePercent: number): number {
  if (expectedAmountSats === 0) return 0;
  
  const percentageDifference = Math.abs(transactionAmountSats - expectedAmountSats) / expectedAmountSats * 100;
  
  if (percentageDifference > maxTolerancePercent) {
    return 0;
  }
  
  // Linear decay from 1 to 0 over the tolerance period
  return Math.max(0, 1 - (percentageDifference / maxTolerancePercent));
}

/**
 * Calculate overall match score for a transaction against an expected grant
 */
function calculateMatchScore(
  transaction: RawTransaction,
  expectedGrant: ExpectedGrant,
  userAddress: string,
  config: AnnotationConfig = DEFAULT_ANNOTATION_CONFIG
): number {
  // Calculate incoming amount for this transaction
  const incomingAmount = transaction.vout
    .filter(output => output.scriptpubkey_address === userAddress)
    .reduce((sum, output) => sum + output.value, 0);

  if (incomingAmount === 0) {
    return 0; // Not an incoming transaction
  }

  const transactionDate = new Date(transaction.status.block_time * 1000);
  const expectedDate = new Date(expectedGrant.expectedDate);

  const dateScore = calculateDateScore(transactionDate, expectedDate, expectedGrant.tolerance.dateRangeDays);
  const amountScore = calculateAmountScore(incomingAmount, expectedGrant.expectedAmountSats, expectedGrant.tolerance.amountPercentage);

  // Weighted combination of scores
  return (dateScore * config.dateWeight) + (amountScore * config.amountWeight);
}

/**
 * Convert raw transaction to annotated transaction
 */
function createAnnotatedTransaction(
  transaction: RawTransaction,
  userAddress: string,
  grantYear: number | null = null,
  matchScore?: number
): AnnotatedTransaction {
  // Calculate incoming amount
  const incomingAmount = transaction.vout
    .filter(output => output.scriptpubkey_address === userAddress)
    .reduce((sum, output) => sum + output.value, 0);

  const isIncoming = incomingAmount > 0;
  const amountSats = isIncoming ? incomingAmount : 0;

  return {
    txid: transaction.txid,
    grantYear,
    type: grantYear !== null ? 'Annual Grant' : 'Other Transaction',
    isIncoming,
    amountBTC: amountSats / 100_000_000,
    amountSats,
    date: new Date(transaction.status.block_time * 1000).toISOString().split('T')[0],
    blockHeight: transaction.status.block_height,
    valueAtTimeOfTx: null, // Will be populated by price fetcher
    status: transaction.status.confirmed ? 'Confirmed' : 'Unconfirmed',
    matchScore,
    isManuallyAnnotated: false,
  };
}

/**
 * Find the best match for each expected grant
 */
function findBestMatches(
  transactions: RawTransaction[],
  expectedGrants: ExpectedGrant[],
  userAddress: string,
  config: AnnotationConfig = DEFAULT_ANNOTATION_CONFIG
): Map<string, { grantYear: number; matchScore: number }> {
  const matches = new Map<string, { grantYear: number; matchScore: number }>();
  const usedGrants = new Set<number>();

  // Calculate all possible matches
  const allMatches: Array<{
    txid: string;
    grantYear: number;
    matchScore: number;
  }> = [];

  for (const transaction of transactions) {
    for (const grant of expectedGrants) {
      const score = calculateMatchScore(transaction, grant, userAddress, config);
      if (score >= config.matchThreshold) {
        allMatches.push({
          txid: transaction.txid,
          grantYear: grant.year,
          matchScore: score,
        });
      }
    }
  }

  // Sort by match score (highest first) to prioritize best matches
  allMatches.sort((a, b) => b.matchScore - a.matchScore);

  // Assign matches ensuring each grant year is only used once
  for (const match of allMatches) {
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

/**
 * Main annotation function that processes transactions and matches them to expected grants
 */
export function annotateTransactions(
  transactions: RawTransaction[],
  userAddress: string,
  vestingStartDate: string,
  annualGrantBtc: number,
  totalGrants: number = 10,
  config: AnnotationConfig = DEFAULT_ANNOTATION_CONFIG
): {
  annotatedTransactions: AnnotatedTransaction[];
  expectedGrants: ExpectedGrant[];
  matchingSummary: {
    totalTransactions: number;
    matchedTransactions: number;
    unmatchedTransactions: number;
    expectedGrants: number;
    matchedGrants: number;
  };
} {
  // Generate expected grants
  const expectedGrants = generateExpectedGrants(vestingStartDate, annualGrantBtc, totalGrants);

  // Filter for incoming transactions only
  const incomingTransactions = transactions.filter(tx => {
    const incomingAmount = tx.vout
      .filter(output => output.scriptpubkey_address === userAddress)
      .reduce((sum, output) => sum + output.value, 0);
    return incomingAmount > 0;
  });

  // Find best matches
  const matches = findBestMatches(incomingTransactions, expectedGrants, userAddress, config);

  // Create annotated transactions
  const annotatedTransactions: AnnotatedTransaction[] = incomingTransactions.map(transaction => {
    const match = matches.get(transaction.txid);
    return createAnnotatedTransaction(
      transaction,
      userAddress,
      match?.grantYear || null,
      match?.matchScore
    );
  });

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

  return {
    annotatedTransactions,
    expectedGrants: updatedExpectedGrants,
    matchingSummary,
  };
}

/**
 * Apply manual annotation overrides to existing annotated transactions
 */
export function applyManualAnnotations(
  annotatedTransactions: AnnotatedTransaction[],
  expectedGrants: ExpectedGrant[],
  manualAnnotations: Map<string, number | null>
): {
  annotatedTransactions: AnnotatedTransaction[];
  expectedGrants: ExpectedGrant[];
} {
  // Create a copy of transactions with manual annotations applied
  const updatedTransactions = annotatedTransactions.map(tx => {
    if (manualAnnotations.has(tx.txid)) {
      const newGrantYear = manualAnnotations.get(tx.txid) ?? null;
      return {
        ...tx,
        grantYear: newGrantYear,
        type: newGrantYear !== null ? 'Annual Grant' as const : 'Other Transaction' as const,
        isManuallyAnnotated: true,
      };
    }
    return tx;
  });

  // Update expected grants based on manual annotations
  const updatedExpectedGrants = expectedGrants.map(grant => {
    const matchedTransaction = updatedTransactions.find(tx => tx.grantYear === grant.year);
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
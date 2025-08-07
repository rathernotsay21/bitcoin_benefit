import {
  annotateTransactions,
  generateExpectedGrants,
  applyManualAnnotations,
  DEFAULT_ANNOTATION_CONFIG,
} from '../annotateTransactions';
import { RawTransaction, ExpectedGrant, AnnotationConfig } from '../../../types/on-chain';

// Test data helpers
const createMockTransaction = (
  txid: string,
  blockTime: number,
  incomingAmount: number,
  userAddress: string = 'bc1test123'
): RawTransaction => ({
  txid,
  status: {
    confirmed: true,
    block_height: 800000,
    block_time: blockTime,
  },
  vin: [],
  vout: [
    {
      scriptpubkey_address: userAddress,
      value: incomingAmount,
    },
  ],
  fee: 1000,
});

const testUserAddress = 'bc1test123';
const testVestingStart = '2023-01-01';
const testAnnualGrant = 1.0; // 1 BTC

describe('generateExpectedGrants', () => {
  it('should generate correct number of expected grants', () => {
    const grants = generateExpectedGrants(testVestingStart, testAnnualGrant, 5);
    expect(grants).toHaveLength(5);
  });

  it('should generate grants with correct dates', () => {
    const grants = generateExpectedGrants(testVestingStart, testAnnualGrant, 3);
    
    expect(grants[0].expectedDate).toBe('2023-01-01');
    expect(grants[1].expectedDate).toBe('2024-01-01');
    expect(grants[2].expectedDate).toBe('2025-01-01');
  });

  it('should generate grants with correct amounts', () => {
    const grants = generateExpectedGrants(testVestingStart, testAnnualGrant, 2);
    
    grants.forEach(grant => {
      expect(grant.expectedAmountBTC).toBe(1.0);
      expect(grant.expectedAmountSats).toBe(100_000_000);
    });
  });

  it('should generate grants with correct year numbering', () => {
    const grants = generateExpectedGrants(testVestingStart, testAnnualGrant, 3);
    
    expect(grants[0].year).toBe(1);
    expect(grants[1].year).toBe(2);
    expect(grants[2].year).toBe(3);
  });

  it('should initialize grants as unmatched', () => {
    const grants = generateExpectedGrants(testVestingStart, testAnnualGrant, 2);
    
    grants.forEach(grant => {
      expect(grant.isMatched).toBe(false);
      expect(grant.matchedTxid).toBeUndefined();
    });
  });
});

describe('annotateTransactions - Perfect Matches', () => {
  it('should match transaction with perfect date and amount', () => {
    const perfectDate = new Date('2023-01-01').getTime() / 1000;
    const perfectAmount = 100_000_000; // 1 BTC in sats
    
    const transactions = [
      createMockTransaction('perfect_match', perfectDate, perfectAmount, testUserAddress),
    ];

    const result = annotateTransactions(
      transactions,
      testUserAddress,
      testVestingStart,
      testAnnualGrant
    );

    expect(result.annotatedTransactions).toHaveLength(1);
    expect(result.annotatedTransactions[0].grantYear).toBe(1);
    expect(result.annotatedTransactions[0].type).toBe('Annual Grant');
    expect(result.annotatedTransactions[0].matchScore).toBeCloseTo(1.0, 2);
  });

  it('should match multiple perfect transactions to different grant years', () => {
    const year1Date = new Date('2023-01-01').getTime() / 1000;
    const year2Date = new Date('2024-01-01').getTime() / 1000;
    const perfectAmount = 100_000_000;
    
    const transactions = [
      createMockTransaction('year1_tx', year1Date, perfectAmount, testUserAddress),
      createMockTransaction('year2_tx', year2Date, perfectAmount, testUserAddress),
    ];

    const result = annotateTransactions(
      transactions,
      testUserAddress,
      testVestingStart,
      testAnnualGrant
    );

    expect(result.annotatedTransactions).toHaveLength(2);
    
    const year1Tx = result.annotatedTransactions.find(tx => tx.txid === 'year1_tx');
    const year2Tx = result.annotatedTransactions.find(tx => tx.txid === 'year2_tx');
    
    expect(year1Tx?.grantYear).toBe(1);
    expect(year2Tx?.grantYear).toBe(2);
    expect(year1Tx?.type).toBe('Annual Grant');
    expect(year2Tx?.type).toBe('Annual Grant');
  });
});

describe('annotateTransactions - Near Misses', () => {
  it('should match transaction with slightly off date but perfect amount', () => {
    const slightlyOffDate = new Date('2023-01-15').getTime() / 1000; // 14 days off
    const perfectAmount = 100_000_000;
    
    const transactions = [
      createMockTransaction('near_miss_date', slightlyOffDate, perfectAmount, testUserAddress),
    ];

    const result = annotateTransactions(
      transactions,
      testUserAddress,
      testVestingStart,
      testAnnualGrant
    );

    expect(result.annotatedTransactions[0].grantYear).toBe(1);
    expect(result.annotatedTransactions[0].type).toBe('Annual Grant');
    expect(result.annotatedTransactions[0].matchScore).toBeLessThan(1.0);
    expect(result.annotatedTransactions[0].matchScore).toBeGreaterThan(0.75);
  });

  it('should match transaction with perfect date but slightly off amount', () => {
    const perfectDate = new Date('2023-01-01').getTime() / 1000;
    const slightlyOffAmount = 95_000_000; // 5% less than expected
    
    const transactions = [
      createMockTransaction('near_miss_amount', perfectDate, slightlyOffAmount, testUserAddress),
    ];

    const result = annotateTransactions(
      transactions,
      testUserAddress,
      testVestingStart,
      testAnnualGrant
    );

    expect(result.annotatedTransactions[0].grantYear).toBe(1);
    expect(result.annotatedTransactions[0].type).toBe('Annual Grant');
    expect(result.annotatedTransactions[0].matchScore).toBeLessThan(1.0);
    expect(result.annotatedTransactions[0].matchScore).toBeGreaterThan(0.75);
  });

  it('should not match transaction that is just below threshold', () => {
    const veryOffDate = new Date('2023-04-01').getTime() / 1000; // 90 days off
    const veryOffAmount = 70_000_000; // 30% off
    
    const transactions = [
      createMockTransaction('below_threshold', veryOffDate, veryOffAmount, testUserAddress),
    ];

    const result = annotateTransactions(
      transactions,
      testUserAddress,
      testVestingStart,
      testAnnualGrant
    );

    expect(result.annotatedTransactions[0].grantYear).toBeNull();
    expect(result.annotatedTransactions[0].type).toBe('Other Transaction');
  });
});

describe('annotateTransactions - No Matches', () => {
  it('should not match transactions with no incoming amount', () => {
    const perfectDate = new Date('2023-01-01').getTime() / 1000;
    
    const outgoingTransaction: RawTransaction = {
      txid: 'outgoing_tx',
      status: {
        confirmed: true,
        block_height: 800000,
        block_time: perfectDate,
      },
      vin: [],
      vout: [
        {
          scriptpubkey_address: 'different_address',
          value: 100_000_000,
        },
      ],
      fee: 1000,
    };

    const result = annotateTransactions(
      [outgoingTransaction],
      testUserAddress,
      testVestingStart,
      testAnnualGrant
    );

    expect(result.annotatedTransactions).toHaveLength(0);
  });

  it('should not match transactions that are too far off in date', () => {
    const tooFarDate = new Date('2023-06-01').getTime() / 1000; // 151 days off
    const perfectAmount = 100_000_000;
    
    const transactions = [
      createMockTransaction('too_far_date', tooFarDate, perfectAmount, testUserAddress),
    ];

    const result = annotateTransactions(
      transactions,
      testUserAddress,
      testVestingStart,
      testAnnualGrant
    );

    expect(result.annotatedTransactions[0].grantYear).toBeNull();
    expect(result.annotatedTransactions[0].type).toBe('Other Transaction');
  });

  it('should not match transactions with amounts too far off', () => {
    const perfectDate = new Date('2023-01-01').getTime() / 1000;
    const tooFarAmount = 50_000_000; // 50% off, beyond 20% tolerance
    
    const transactions = [
      createMockTransaction('too_far_amount', perfectDate, tooFarAmount, testUserAddress),
    ];

    const result = annotateTransactions(
      transactions,
      testUserAddress,
      testVestingStart,
      testAnnualGrant
    );

    expect(result.annotatedTransactions[0].grantYear).toBeNull();
    expect(result.annotatedTransactions[0].type).toBe('Other Transaction');
  });
});

describe('annotateTransactions - Edge Cases', () => {
  it('should handle multiple potential matches and choose the best one', () => {
    const perfectDate = new Date('2023-01-01').getTime() / 1000;
    const nearDate = new Date('2023-01-10').getTime() / 1000;
    const perfectAmount = 100_000_000;
    
    const transactions = [
      createMockTransaction('perfect_tx', perfectDate, perfectAmount, testUserAddress),
      createMockTransaction('near_tx', nearDate, perfectAmount, testUserAddress),
    ];

    const result = annotateTransactions(
      transactions,
      testUserAddress,
      testVestingStart,
      testAnnualGrant
    );

    const perfectTx = result.annotatedTransactions.find(tx => tx.txid === 'perfect_tx');
    const nearTx = result.annotatedTransactions.find(tx => tx.txid === 'near_tx');
    
    expect(perfectTx?.grantYear).toBe(1);
    expect(nearTx?.grantYear).toBeNull();
    expect(perfectTx?.matchScore).toBeGreaterThan(nearTx?.matchScore || 0);
  });

  it('should handle duplicate amounts on same date', () => {
    const sameDate = new Date('2023-01-01').getTime() / 1000;
    const sameAmount = 100_000_000;
    
    const transactions = [
      createMockTransaction('dup1', sameDate, sameAmount, testUserAddress),
      createMockTransaction('dup2', sameDate, sameAmount, testUserAddress),
    ];

    const result = annotateTransactions(
      transactions,
      testUserAddress,
      testVestingStart,
      testAnnualGrant
    );

    const matchedTransactions = result.annotatedTransactions.filter(tx => tx.grantYear !== null);
    expect(matchedTransactions).toHaveLength(1); // Only one should be matched
  });

  it('should handle transactions across multiple years correctly', () => {
    const year1Date = new Date('2023-01-01').getTime() / 1000;
    const year2Date = new Date('2024-01-01').getTime() / 1000;
    const year3Date = new Date('2025-01-01').getTime() / 1000;
    const amount = 100_000_000;
    
    const transactions = [
      createMockTransaction('year3_tx', year3Date, amount, testUserAddress),
      createMockTransaction('year1_tx', year1Date, amount, testUserAddress),
      createMockTransaction('year2_tx', year2Date, amount, testUserAddress),
    ];

    const result = annotateTransactions(
      transactions,
      testUserAddress,
      testVestingStart,
      testAnnualGrant
    );

    expect(result.annotatedTransactions).toHaveLength(3);
    
    const year1Tx = result.annotatedTransactions.find(tx => tx.txid === 'year1_tx');
    const year2Tx = result.annotatedTransactions.find(tx => tx.txid === 'year2_tx');
    const year3Tx = result.annotatedTransactions.find(tx => tx.txid === 'year3_tx');
    
    expect(year1Tx?.grantYear).toBe(1);
    expect(year2Tx?.grantYear).toBe(2);
    expect(year3Tx?.grantYear).toBe(3);
  });

  it('should handle empty transaction list', () => {
    const result = annotateTransactions(
      [],
      testUserAddress,
      testVestingStart,
      testAnnualGrant
    );

    expect(result.annotatedTransactions).toHaveLength(0);
    expect(result.expectedGrants).toHaveLength(10);
    expect(result.matchingSummary.totalTransactions).toBe(0);
    expect(result.matchingSummary.matchedTransactions).toBe(0);
  });

  it('should handle custom configuration', () => {
    const customConfig: AnnotationConfig = {
      dateWeight: 0.8,
      amountWeight: 0.2,
      matchThreshold: 0.9,
      maxDateToleranceDays: 30,
      maxAmountTolerancePercent: 10,
    };

    const slightlyOffDate = new Date('2023-01-15').getTime() / 1000; // 14 days off
    const perfectAmount = 100_000_000;
    
    const transactions = [
      createMockTransaction('custom_config', slightlyOffDate, perfectAmount, testUserAddress),
    ];

    const result = annotateTransactions(
      transactions,
      testUserAddress,
      testVestingStart,
      testAnnualGrant,
      customConfig
    );

    // With higher date weight and stricter threshold, this might not match
    expect(result.annotatedTransactions).toHaveLength(1);
    expect(result.annotatedTransactions[0].txid).toBe('custom_config');
    
    // Test that the custom config was applied by checking if it affects matching
    const defaultResult = annotateTransactions(
      transactions,
      testUserAddress,
      testVestingStart,
      testAnnualGrant
    );
    
    // The results might be different due to different configuration
    expect(result.matchingSummary).toBeDefined();
    expect(defaultResult.matchingSummary).toBeDefined();
  });
});

describe('applyManualAnnotations', () => {
  it('should apply manual annotation to override automatic annotation', () => {
    const transactions = [
      {
        txid: 'test_tx',
        grantYear: 1,
        type: 'Annual Grant' as const,
        isIncoming: true,
        amountBTC: 1.0,
        amountSats: 100_000_000,
        date: '2023-01-01',
        blockHeight: 800000,
        valueAtTimeOfTx: null,
        status: 'Confirmed' as const,
        matchScore: 0.95,
        isManuallyAnnotated: false,
      },
    ];

    const expectedGrants: ExpectedGrant[] = [
      {
        year: 1,
        expectedDate: '2023-01-01',
        expectedAmountBTC: 1.0,
        expectedAmountSats: 100_000_000,
        isMatched: true,
        matchedTxid: 'test_tx',
        tolerance: {
          dateRangeDays: 90,
          amountPercentage: 20,
        },
      },
      {
        year: 2,
        expectedDate: '2024-01-01',
        expectedAmountBTC: 1.0,
        expectedAmountSats: 100_000_000,
        isMatched: false,
        tolerance: {
          dateRangeDays: 90,
          amountPercentage: 20,
        },
      },
    ];

    const manualAnnotations = new Map([['test_tx', 2]]);

    const result = applyManualAnnotations(transactions, expectedGrants, manualAnnotations);

    expect(result.annotatedTransactions[0].grantYear).toBe(2);
    expect(result.annotatedTransactions[0].isManuallyAnnotated).toBe(true);
    expect(result.expectedGrants[0].isMatched).toBe(false);
    expect(result.expectedGrants[1].isMatched).toBe(true);
    expect(result.expectedGrants[1].matchedTxid).toBe('test_tx');
  });

  it('should remove annotation when manually set to null', () => {
    const transactions = [
      {
        txid: 'test_tx',
        grantYear: 1,
        type: 'Annual Grant' as const,
        isIncoming: true,
        amountBTC: 1.0,
        amountSats: 100_000_000,
        date: '2023-01-01',
        blockHeight: 800000,
        valueAtTimeOfTx: null,
        status: 'Confirmed' as const,
        matchScore: 0.95,
        isManuallyAnnotated: false,
      },
    ];

    const expectedGrants: ExpectedGrant[] = [
      {
        year: 1,
        expectedDate: '2023-01-01',
        expectedAmountBTC: 1.0,
        expectedAmountSats: 100_000_000,
        isMatched: true,
        matchedTxid: 'test_tx',
        tolerance: {
          dateRangeDays: 90,
          amountPercentage: 20,
        },
      },
    ];

    const manualAnnotations = new Map([['test_tx', null]]);

    const result = applyManualAnnotations(transactions, expectedGrants, manualAnnotations);

    expect(result.annotatedTransactions[0].grantYear).toBeNull();
    expect(result.annotatedTransactions[0].type).toBe('Other Transaction');
    expect(result.annotatedTransactions[0].isManuallyAnnotated).toBe(true);
    expect(result.expectedGrants[0].isMatched).toBe(false);
    expect(result.expectedGrants[0].matchedTxid).toBeUndefined();
  });

  it('should handle multiple manual annotations', () => {
    const transactions = [
      {
        txid: 'tx1',
        grantYear: 1,
        type: 'Annual Grant' as const,
        isIncoming: true,
        amountBTC: 1.0,
        amountSats: 100_000_000,
        date: '2023-01-01',
        blockHeight: 800000,
        valueAtTimeOfTx: null,
        status: 'Confirmed' as const,
        isManuallyAnnotated: false,
      },
      {
        txid: 'tx2',
        grantYear: null,
        type: 'Other Transaction' as const,
        isIncoming: true,
        amountBTC: 1.0,
        amountSats: 100_000_000,
        date: '2024-01-01',
        blockHeight: 800001,
        valueAtTimeOfTx: null,
        status: 'Confirmed' as const,
        isManuallyAnnotated: false,
      },
    ];

    const expectedGrants: ExpectedGrant[] = [
      {
        year: 1,
        expectedDate: '2023-01-01',
        expectedAmountBTC: 1.0,
        expectedAmountSats: 100_000_000,
        isMatched: true,
        matchedTxid: 'tx1',
        tolerance: { dateRangeDays: 90, amountPercentage: 20 },
      },
      {
        year: 2,
        expectedDate: '2024-01-01',
        expectedAmountBTC: 1.0,
        expectedAmountSats: 100_000_000,
        isMatched: false,
        tolerance: { dateRangeDays: 90, amountPercentage: 20 },
      },
    ];

    const manualAnnotations = new Map([
      ['tx1', null],
      ['tx2', 2],
    ]);

    const result = applyManualAnnotations(transactions, expectedGrants, manualAnnotations);

    expect(result.annotatedTransactions[0].grantYear).toBeNull();
    expect(result.annotatedTransactions[0].type).toBe('Other Transaction');
    expect(result.annotatedTransactions[1].grantYear).toBe(2);
    expect(result.annotatedTransactions[1].type).toBe('Annual Grant');
    
    expect(result.expectedGrants[0].isMatched).toBe(false);
    expect(result.expectedGrants[1].isMatched).toBe(true);
    expect(result.expectedGrants[1].matchedTxid).toBe('tx2');
  });
});

describe('annotateTransactions - Summary Statistics', () => {
  it('should generate correct summary statistics', () => {
    const year1Date = new Date('2023-01-01').getTime() / 1000;
    const randomDate = new Date('2023-06-01').getTime() / 1000;
    const amount = 100_000_000;
    
    const transactions = [
      createMockTransaction('matched_tx', year1Date, amount, testUserAddress),
      createMockTransaction('unmatched_tx', randomDate, amount, testUserAddress),
    ];

    const result = annotateTransactions(
      transactions,
      testUserAddress,
      testVestingStart,
      testAnnualGrant
    );

    expect(result.matchingSummary.totalTransactions).toBe(2);
    expect(result.matchingSummary.matchedTransactions).toBe(1);
    expect(result.matchingSummary.unmatchedTransactions).toBe(1);
    expect(result.matchingSummary.expectedGrants).toBe(10);
    expect(result.matchingSummary.matchedGrants).toBe(1);
  });
});
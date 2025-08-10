# Bitcoin Testing Best Practices

## Overview

This document outlines best practices specifically for testing Bitcoin-related functionality, including address validation, transaction processing, formatting, and vesting calculations.

## 🎯 Core Principles

### 1. Use Real Bitcoin Constraints
Always test with realistic Bitcoin constraints and edge cases:

```typescript
// ✅ Good - Test Bitcoin constraints
describe('Bitcoin amount validation', () => {
  it('should accept minimum satoshi (1 sat)', () => {
    expect(validateAmount(0.00000001)).toBe(true);
  });

  it('should reject amounts exceeding 21M BTC', () => {
    expect(validateAmount(21_000_001)).toBe(false);
  });

  it('should handle precision limits', () => {
    // Bitcoin has 8 decimal places maximum
    expect(validateAmount(0.123456789)).toBe(false);
    expect(validateAmount(0.12345678)).toBe(true);
  });
});

// ❌ Bad - Unrealistic constraints
it('should handle large amounts', () => {
  expect(validateAmount(1_000_000_000)).toBe(true); // > 21M BTC
});
```

### 2. Test Address Format Variations
Bitcoin has multiple address formats - test them all:

```typescript
// ✅ Good - Test all address types
describe('Bitcoin address validation', () => {
  it('should accept all valid address formats', () => {
    const testCases = [
      { type: 'Legacy P2PKH', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
      { type: 'P2SH', address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy' },
      { type: 'Bech32', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
      { type: 'Bech32 v0', address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4' }
    ];

    testCases.forEach(({ type, address }) => {
      expect(validateAddress(address)).toBe(true);
    });
  });
});
```

### 3. Test Precision and Rounding
Bitcoin calculations require precise decimal handling:

```typescript
// ✅ Good - Test precision handling
describe('BTC calculations', () => {
  it('should handle satoshi precision correctly', () => {
    const btcAmount = 0.12345678;
    const satoshis = btcToSatoshis(btcAmount);
    const backToBtc = satoshisToBtc(satoshis);
    
    expect(backToBtc).toBe(btcAmount); // No precision loss
  });

  it('should round half-satoshis correctly', () => {
    expect(btcToSatoshis(0.123456785)).toBe(12345679); // Round up
    expect(btcToSatoshis(0.123456784)).toBe(12345678); // Round down
  });
});
```

## 🧪 Testing Patterns

### Transaction Processing Tests

```typescript
// ✅ Complete transaction processing test
describe('Transaction Processing', () => {
  it('should process vesting grants with tolerance matching', () => {
    const expectedGrants = bitcoinTestData.createMockGrantList(4, {
      expectedAmountBTC: 0.25,
      tolerance: {
        dateRangeDays: 90,
        amountPercentage: 20
      }
    });

    const actualTransactions = bitcoinTestData.createMockTransactionList(4, {
      amountBTC: 0.24, // Within 20% tolerance
      type: 'Annual Grant'
    });

    const result = matchTransactionsToGrants(actualTransactions, expectedGrants);
    
    expect(result.matches).toHaveLength(4);
    expect(result.unmatched.transactions).toHaveLength(0);
    expect(result.unmatched.grants).toHaveLength(0);
  });

  it('should handle partial matches and outliers', () => {
    const grants = bitcoinTestData.createMockGrantList(3);
    const transactions = [
      ...bitcoinTestData.createMockTransactionList(2), // 2 matches
      bitcoinTestData.createMockTransaction({ 
        amountBTC: 10, // Too large - outlier
        date: '2024-01-01'
      })
    ];

    const result = matchTransactionsToGrants(transactions, grants);
    
    expect(result.matches).toHaveLength(2);
    expect(result.unmatched.transactions).toHaveLength(1);
    expect(result.unmatched.grants).toHaveLength(1);
  });
});
```

### Form Validation Tests

```typescript
// ✅ Comprehensive form validation
describe('VestingTrackerForm', () => {
  it('should validate all fields comprehensively', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VestingTrackerForm />);

    // Test address validation
    const addressInput = screen.getByLabelText(/bitcoin address/i);
    
    // Invalid formats
    await user.type(addressInput, 'invalid');
    expect(await screen.findByText(/invalid.*format/i)).toBeInTheDocument();
    
    await user.clear(addressInput);
    await user.type(addressInput, '1InvalidChecksum123');
    expect(await screen.findByText(/invalid.*format/i)).toBeInTheDocument();
    
    // Valid format
    await user.clear(addressInput);
    await user.type(addressInput, bitcoinAddressUtils.validAddresses[0]);
    expect(screen.queryByText(/invalid.*format/i)).not.toBeInTheDocument();

    // Test date validation
    const dateInput = screen.getByLabelText(/vesting start date/i);
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    
    await user.type(dateInput, futureDate.toISOString().split('T')[0]);
    expect(await screen.findByText(/future/i)).toBeInTheDocument();

    // Test amount validation
    const amountInput = screen.getByLabelText(/annual grant/i);
    
    await user.type(amountInput, '0');
    expect(await screen.findByText(/greater than 0/i)).toBeInTheDocument();
    
    await user.clear(amountInput);
    await user.type(amountInput, '25'); // > 21 BTC
    expect(await screen.findByText(/21.*btc/i)).toBeInTheDocument();
  });
});
```

### Chart Component Tests

```typescript
// ✅ Chart testing with Bitcoin data
describe('VestingTimelineChart', () => {
  beforeEach(() => {
    vi.mock('recharts', () => chartTestUtils.mockRechartsComponents);
  });

  it('should render transaction data points correctly', () => {
    const transactions = bitcoinTestData.createMockTransactionList(5, {
      type: 'Annual Grant'
    });
    
    renderWithProviders(<VestingTimelineChart transactions={transactions} />);
    
    // Verify chart elements
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    expect(screen.getByTestId('scatter-transactions')).toBeInTheDocument();
    
    // Verify data points
    transactions.forEach(tx => {
      expect(screen.getByText(formatBTC(tx.amountBTC))).toBeInTheDocument();
    });
  });

  it('should handle chart interactions', () => {
    const onHover = vi.fn();
    const transactions = bitcoinTestData.createMockTransactionList(3);
    
    renderWithProviders(
      <VestingTimelineChart 
        transactions={transactions} 
        onDataPointHover={onHover}
      />
    );
    
    const chart = screen.getByTestId('composed-chart');
    chartTestUtils.simulateChartHover(chart, transactions[0]);
    
    expect(onHover).toHaveBeenCalledWith(
      expect.objectContaining({
        txid: transactions[0].txid,
        amountBTC: transactions[0].amountBTC
      })
    );
  });
});
```

### Performance Tests for Bitcoin Processing

```typescript
// ✅ Bitcoin-specific performance testing
describe('Bitcoin Processing Performance', () => {
  it('should process large transaction datasets efficiently', async () => {
    const { transactions } = performanceTestUtils.createLargeDataset(200);
    
    const processingTime = await performanceTestUtils.measureTime(async () => {
      await processOnChainData(
        bitcoinAddressUtils.validAddresses[0],
        '2023-01-01',
        1.0,
        { transactions }
      );
    });
    
    // Should process 200 transactions in under 5 seconds
    expect(processingTime).toBeLessThan(5000);
  });

  it('should handle concurrent API requests efficiently', async () => {
    const dates = Array.from({ length: 50 }, (_, i) => 
      new Date(2023, 0, i + 1).toISOString().split('T')[0]
    );
    
    const batchTime = await performanceTestUtils.measureTime(async () => {
      await OnChainPriceFetcher.fetchBatchPrices(dates);
    });
    
    // Concurrent processing should be faster than sequential
    const estimatedSequentialTime = dates.length * 100; // 100ms per request
    expect(batchTime).toBeLessThan(estimatedSequentialTime * 0.8);
  });

  it('should maintain memory efficiency during processing', async () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    
    // Process large dataset
    const { transactions } = performanceTestUtils.createLargeDataset(500);
    await annotateTransactionsWithPerformance(transactions, []);
    
    // Trigger garbage collection if available
    if (global.gc) global.gc();
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryGrowth = finalMemory - initialMemory;
    
    // Memory growth should be reasonable (< 50MB)
    expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
  });
});
```

## 🔧 Bitcoin-Specific Utilities Usage

### Using Bitcoin Test Data Effectively

```typescript
// ✅ Good - Generate realistic test scenarios
describe('Grant Matching Algorithm', () => {
  it('should handle typical corporate vesting schedule', () => {
    // Generate 4-year vesting with annual grants
    const grants = Array.from({ length: 4 }, (_, i) => 
      bitcoinTestData.createMockGrant({
        year: i + 1,
        expectedDate: `${2023 + i}-01-01`,
        expectedAmountBTC: 0.25,
        tolerance: {
          dateRangeDays: 90,
          amountPercentage: 15
        }
      })
    );

    // Generate transactions with slight variations
    const transactions = grants.map((grant, i) => 
      bitcoinTestData.createMockTransaction({
        date: `${2023 + i}-01-15`, // 15 days after expected
        amountBTC: 0.24, // Slightly less than expected
        grantYear: i + 1
      })
    );

    const result = matchGrantsToTransactions(grants, transactions);
    expect(result.matchedPairs).toHaveLength(4);
  });
});
```

### Formatting Validation Patterns

```typescript
// ✅ Comprehensive formatting tests
describe('Bitcoin Formatting', () => {
  it('should format amounts consistently across components', () => {
    const testAmounts = [
      0.00000001, // 1 satoshi
      0.001,      // 1000 sats
      0.1,        // Typical grant
      1.0,        // 1 BTC
      20.99999999 // Near max supply
    ];

    testAmounts.forEach(amount => {
      const btcValidation = bitcoinFormatUtils.validateBTCFormat(amount, 3);
      const summaryValidation = bitcoinFormatUtils.validateBTCSummaryFormat(amount);
      
      expect(btcValidation.isValid).toBe(true);
      expect(summaryValidation.isValid).toBe(true);
      
      // Both should display Bitcoin symbol
      expect(btcValidation.formatted).toContain('₿');
      expect(summaryValidation.formatted).toContain('₿');
    });
  });

  it('should handle edge cases in formatting', () => {
    // Very small amounts
    const smallValidation = bitcoinFormatUtils.validateBTCFormat(0.00000001, 8);
    expect(smallValidation.formatted).toBe('₿0.00000001');
    
    // Large amounts
    const largeValidation = bitcoinFormatUtils.validateBTCFormat(20.99999999, 8);
    expect(largeValidation.formatted).toBe('₿20.99999999');
    
    // Zero amount
    const zeroValidation = bitcoinFormatUtils.validateBTCFormat(0, 3);
    expect(zeroValidation.formatted).toBe('₿0.000');
  });
});
```

## 🚀 Performance Testing Best Practices

### 1. Test Real-World Scenarios

```typescript
// ✅ Test realistic data sizes
describe('Real-World Performance', () => {
  it('should handle typical employee transaction history', async () => {
    // 4 years * 4 grants/year = 16 transactions
    const transactions = bitcoinTestData.createMockTransactionList(16);
    
    const time = await performanceTestUtils.measureTime(async () => {
      await processEmployeeVestingData(transactions);
    });
    
    // Should be near-instantaneous for typical users
    expect(time).toBeLessThan(100);
  });

  it('should handle enterprise-scale processing', async () => {
    // 1000 employees * 16 transactions = 16,000 transactions
    const largeDataset = performanceTestUtils.createLargeDataset(16000);
    
    const time = await performanceTestUtils.measureTime(async () => {
      await processBatchVestingData(largeDataset.transactions);
    });
    
    // Should complete in reasonable time even for large batches
    expect(time).toBeLessThan(30000); // 30 seconds
  });
});
```

### 2. Test Concurrent Operations

```typescript
// ✅ Test Bitcoin API concurrency
describe('API Concurrency', () => {
  it('should handle multiple price requests efficiently', async () => {
    const addresses = bitcoinAddressUtils.validAddresses;
    const startDate = '2023-01-01';
    
    const concurrentTime = await performanceTestUtils.measureTime(async () => {
      await Promise.all(
        addresses.map(address => 
          fetchAddressData(address, startDate)
        )
      );
    });
    
    const sequentialTime = await performanceTestUtils.measureTime(async () => {
      for (const address of addresses) {
        await fetchAddressData(address, startDate);
      }
    });
    
    // Concurrent should be significantly faster
    expect(concurrentTime).toBeLessThan(sequentialTime * 0.7);
  });
});
```

## 🎨 Component Testing Patterns

### Form Testing with Bitcoin Validation

```typescript
// ✅ Complete form testing pattern
describe('Bitcoin Address Input', () => {
  const setupComponent = (props = {}) => {
    const defaultProps = {
      onAddressChange: vi.fn(),
      onValidationChange: vi.fn(),
      ...props
    };
    
    return {
      ...renderWithProviders(<BitcoinAddressInput {...defaultProps} />),
      props: defaultProps
    };
  };

  it('should provide real-time validation feedback', async () => {
    const user = userEvent.setup();
    const { props } = setupComponent();
    
    const input = screen.getByLabelText(/bitcoin address/i);
    
    // Test progressive validation
    await user.type(input, 'b'); // Too short
    expect(screen.getByText(/too short/i)).toBeInTheDocument();
    
    await user.type(input, 'c1qinvalid'); // Invalid checksum
    expect(screen.getByText(/invalid/i)).toBeInTheDocument();
    
    // Clear and enter valid address
    await user.clear(input);
    await user.type(input, bitcoinAddressUtils.validAddresses[0]);
    
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    expect(props.onValidationChange).toHaveBeenLastCalledWith(true);
  });

  it('should handle paste operations correctly', async () => {
    const user = userEvent.setup();
    setupComponent();
    
    const input = screen.getByLabelText(/bitcoin address/i);
    
    // Simulate paste with whitespace
    const addressWithSpaces = `  ${bitcoinAddressUtils.validAddresses[0]}  `;
    await user.click(input);
    await user.paste(addressWithSpaces);
    
    // Should trim whitespace automatically
    expect(input).toHaveValue(bitcoinAddressUtils.validAddresses[0]);
  });
});
```

### Chart Component Testing

```typescript
// ✅ Chart component testing pattern
describe('VestingProgressChart', () => {
  const createTestData = () => ({
    transactions: bitcoinTestData.createMockTransactionList(8, {
      type: 'Annual Grant'
    }),
    grants: bitcoinTestData.createMockGrantList(4)
  });

  it('should render progress visualization correctly', () => {
    const { transactions, grants } = createTestData();
    
    renderWithProviders(
      <VestingProgressChart 
        transactions={transactions}
        expectedGrants={grants}
      />
    );
    
    // Verify chart structure
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-expectedVesting')).toBeInTheDocument();
    expect(screen.getByTestId('scatter-actualGrants')).toBeInTheDocument();
    
    // Verify data representation
    expect(screen.getByText(/4 expected grants/i)).toBeInTheDocument();
    expect(screen.getByText(/8 transactions/i)).toBeInTheDocument();
  });

  it('should respond to viewport changes', async () => {
    const { transactions, grants } = createTestData();
    
    const { rerender } = renderWithProviders(
      <VestingProgressChart 
        transactions={transactions}
        expectedGrants={grants}
      />
    );
    
    // Test mobile layout
    responsiveTestUtils.setViewportSize(375, 667);
    rerender(
      <VestingProgressChart 
        transactions={transactions}
        expectedGrants={grants}
      />
    );
    
    expect(screen.getByTestId('mobile-chart-layout')).toBeInTheDocument();
    
    // Test desktop layout
    responsiveTestUtils.setViewportSize(1024, 768);
    rerender(
      <VestingProgressChart 
        transactions={transactions}
        expectedGrants={grants}
      />
    );
    
    expect(screen.getByTestId('desktop-chart-layout')).toBeInTheDocument();
  });
});
```

## 🐛 Common Pitfalls to Avoid

### 1. Hardcoded Bitcoin Values

```typescript
// ❌ Bad - Hardcoded values
expect(amount).toBe(4500000); // What does this number mean?

// ✅ Good - Use meaningful constants
const EXPECTED_USD_VALUE = 45000;
const EXPECTED_SATOSHIS = 100_000_000;
expect(usdValue).toBe(EXPECTED_USD_VALUE);
expect(satoshis).toBe(EXPECTED_SATOSHIS);
```

### 2. Ignoring Floating Point Precision

```typescript
// ❌ Bad - Direct equality with floats
expect(btcAmount).toBe(0.123456789);

// ✅ Good - Use precision-aware comparison
expect(btcAmount).toBeCloseTo(0.123456789, 8);
```

### 3. Not Testing Edge Cases

```typescript
// ❌ Bad - Only happy path
it('should calculate vested amount', () => {
  expect(calculateVested(1.0, 60)).toBe(0.5);
});

// ✅ Good - Include edge cases
describe('vested amount calculation', () => {
  it('should calculate normal vesting', () => {
    expect(calculateVested(1.0, 60)).toBe(0.5);
  });

  it('should handle zero amount', () => {
    expect(calculateVested(0, 60)).toBe(0);
  });

  it('should handle pre-vesting period', () => {
    expect(calculateVested(1.0, 0)).toBe(0);
  });

  it('should handle full vesting', () => {
    expect(calculateVested(1.0, 120)).toBe(1.0);
  });
});
```

### 4. Not Mocking External APIs

```typescript
// ❌ Bad - Real API calls in tests
it('should fetch current price', async () => {
  const price = await fetchBitcoinPrice(); // Real API call!
  expect(price).toBeGreaterThan(0);
});

// ✅ Good - Mock external APIs
vi.mock('@/lib/bitcoin-api');
it('should fetch current price', async () => {
  vi.mocked(fetchBitcoinPrice).mockResolvedValue(45000);
  const price = await fetchBitcoinPrice();
  expect(price).toBe(45000);
});
```

## 📋 Testing Checklist

Before submitting Bitcoin-related code:

- [ ] **Address formats**: Test all Bitcoin address types
- [ ] **Precision**: Use `toBeCloseTo()` for Bitcoin amounts
- [ ] **Edge cases**: Test 0, negative, and max values
- [ ] **Formatting**: Verify Bitcoin symbol (₿) and decimal places
- [ ] **Performance**: Test with realistic data sizes
- [ ] **Mocking**: Mock all external Bitcoin APIs
- [ ] **Accessibility**: Test screen reader compatibility
- [ ] **Responsive**: Test across different viewport sizes
- [ ] **Error handling**: Test network failures and invalid data
- [ ] **Security**: Test address validation thoroughly

---

Following these practices ensures robust, reliable testing of Bitcoin functionality while maintaining development velocity and code quality.

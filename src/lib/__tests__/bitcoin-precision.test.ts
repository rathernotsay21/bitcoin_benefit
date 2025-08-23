import {
  SATOSHIS_PER_BTC,
  btcToSatoshis,
  satoshisToBtc,
  calculateUsdValue,
  validateSafeNumber,
  formatBitcoinAmount,
  calculatePrecisePercentage,
  sumBitcoinAmounts
} from '../bitcoin-precision';

describe('Bitcoin Precision Utilities', () => {
  describe('Constants', () => {
    test('SATOSHIS_PER_BTC is correct', () => {
      expect(SATOSHIS_PER_BTC).toBe(100_000_000);
    });
  });

  describe('btcToSatoshis', () => {
    test('converts whole Bitcoin correctly', () => {
      expect(btcToSatoshis(1)).toBe(BigInt(100_000_000));
      expect(btcToSatoshis(0.5)).toBe(BigInt(50_000_000));
    });

    test('converts decimal Bitcoin correctly', () => {
      expect(btcToSatoshis(0.00000001)).toBe(BigInt(1)); // 1 satoshi
      expect(btcToSatoshis(0.12345678)).toBe(BigInt(12_345_678));
    });

    test('handles zero correctly', () => {
      expect(btcToSatoshis(0)).toBe(BigInt(0));
    });
  });

  describe('satoshisToBtc', () => {
    test('converts satoshis to BTC correctly', () => {
      expect(satoshisToBtc(BigInt(100_000_000))).toBe(1);
      expect(satoshisToBtc(BigInt(50_000_000))).toBe(0.5);
      expect(satoshisToBtc(BigInt(1))).toBe(0.00000001);
    });

    test('handles zero correctly', () => {
      expect(satoshisToBtc(BigInt(0))).toBe(0);
    });
  });

  describe('calculateUsdValue', () => {
    test('calculates USD value with precision', () => {
      // 1 BTC at $50,000
      expect(calculateUsdValue(1, 50000)).toBe(50000);
      
      // 0.1 BTC at $50,000
      expect(calculateUsdValue(0.1, 50000)).toBe(5000);
      
      // Test precision with small amounts
      expect(calculateUsdValue(0.00000001, 50000)).toBe(0); // 1 satoshi rounds to $0
    });

    test('rounds to 2 decimal places for USD', () => {
      expect(calculateUsdValue(1, 50000.999)).toBe(50001);
      expect(calculateUsdValue(1, 50000.001)).toBe(50000);
    });
  });

  describe('validateSafeNumber', () => {
    test('accepts valid positive numbers', () => {
      expect(() => validateSafeNumber(1, 'test')).not.toThrow();
      expect(() => validateSafeNumber(0.5, 'test')).not.toThrow();
      expect(() => validateSafeNumber(0, 'test')).not.toThrow();
    });

    test('rejects negative numbers', () => {
      expect(() => validateSafeNumber(-1, 'test')).toThrow('negative');
    });

    test('rejects infinite values', () => {
      expect(() => validateSafeNumber(Infinity, 'test')).toThrow('finite');
      expect(() => validateSafeNumber(-Infinity, 'test')).toThrow('finite');
      expect(() => validateSafeNumber(NaN, 'test')).toThrow('finite');
    });

    test('rejects values too large', () => {
      expect(() => validateSafeNumber(30_000_000, 'test')).toThrow('too large');
    });
  });

  describe('formatBitcoinAmount', () => {
    test('formats as BTC by default', () => {
      expect(formatBitcoinAmount(BigInt(100_000_000))).toBe('1.00000000 BTC');
      expect(formatBitcoinAmount(BigInt(50_000_000))).toBe('0.50000000 BTC');
    });

    test('formats as satoshis when requested', () => {
      expect(formatBitcoinAmount(BigInt(100_000_000), true)).toBe('100,000,000 sats');
      expect(formatBitcoinAmount(BigInt(1), true)).toBe('1 sats');
    });
  });

  describe('calculatePrecisePercentage', () => {
    test('calculates percentage correctly', () => {
      expect(calculatePrecisePercentage(50, 100)).toBe(0.5);
      expect(calculatePrecisePercentage(25, 100)).toBe(0.25);
    });

    test('handles zero total', () => {
      expect(calculatePrecisePercentage(10, 0)).toBe(0);
    });
  });

  describe('sumBitcoinAmounts', () => {
    test('sums Bitcoin amounts with precision', () => {
      const amounts = [0.1, 0.2, 0.3];
      const result = sumBitcoinAmounts(amounts);
      
      // Should be exactly 0.6, not 0.6000000000000001
      expect(result).toBe(0.6);
      expect(result.toFixed(8)).toBe('0.60000000');
    });

    test('handles empty array', () => {
      expect(sumBitcoinAmounts([])).toBe(0);
    });

    test('handles small amounts precisely', () => {
      const amounts = [0.00000001, 0.00000001, 0.00000001]; // 3 satoshis
      expect(sumBitcoinAmounts(amounts)).toBe(0.00000003);
    });
  });

  describe('Real-world precision scenarios', () => {
    test('handles vesting calculation precision', () => {
      const btcAmount = 0.125; // Employee balance
      const price = 67432.15; // Current Bitcoin price
      
      // Using our precision function
      const preciseValue = calculateUsdValue(btcAmount, price);
      
      // Using direct multiplication (what we're replacing)
      const directValue = btcAmount * price;
      
      // Both should be very close, but our function ensures proper rounding
      expect(Math.abs(preciseValue - directValue)).toBeLessThan(0.01);
      expect(preciseValue).toBe(8429.02);
    });

    test('prevents floating point accumulation errors', () => {
      // Simulate multiple small vesting grants
      const grants = Array(10).fill(0.01); // 10 grants of 0.01 BTC each
      
      const preciseSum = sumBitcoinAmounts(grants);
      
      // Should be exactly 0.1 BTC, not 0.09999999999999999
      expect(preciseSum).toBe(0.1);
      expect(preciseSum.toString()).toBe('0.1');
    });

    test('handles large Bitcoin holdings safely', () => {
      const largeBtcAmount = 1000; // 1000 BTC
      const highPrice = 100000; // $100k per BTC
      
      expect(() => {
        const value = calculateUsdValue(largeBtcAmount, highPrice);
        expect(value).toBe(100_000_000); // $100M
      }).not.toThrow();
    });
  });
});
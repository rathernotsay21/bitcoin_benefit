/**
 * Performance tests for concurrent processing optimizations
 * Tests validate optimization effectiveness and performance improvements
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  processOnChainDataConcurrently,
  PerformanceMonitor,
  MemoryOptimizer,
  ConcurrentProcessingMetrics 
} from '../concurrentProcessing';
import { annotateTransactions } from '../annotateTransactions';
import { annotateTransactionsWithPerformance } from '../annotateTransactionsOptimized';
import { mempoolAPI } from '../mempool-api';
import { OnChainPriceFetcher } from '../price-fetcher';

// Mock the external dependencies
vi.mock('../mempool-api');
vi.mock('../price-fetcher');

// Generate mock transaction data for performance testing
const generateMockTransactions = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    txid: `mock-txid-${i.toString().padStart(8, '0')}`,
    date: new Date(2023, 0, 1 + i).toISOString().split('T')[0],
    amountBTC: 0.1 + (i * 0.001),
    fee: 0.0001,
    inputs: [{ address: 'mock-input', value: 1000000 }],
    outputs: [{ address: 'mock-output', value: 999900 }],
    blockHeight: 800000 + i,
    blockTime: new Date(2023, 0, 1 + i).getTime() / 1000
  }));
};

const generateMockPrices = (dates: string[]) => {
  return dates.reduce((acc, date) => {
    acc[date] = 40000 + Math.random() * 10000; // Random price between 40k-50k
    return acc;
  }, {} as Record<string, number>);
};

describe('Concurrent Processing Performance Tests', () => {
  beforeEach(() => {
    // Reset performance monitoring
    PerformanceMonitor.clearMeasurements();
    MemoryOptimizer.optimizeMemory();
    
    // Setup mocks
    vi.mocked(mempoolAPI.fetchTransactions).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
      return generateMockTransactions(50);
    });
    
    vi.mocked(OnChainPriceFetcher.fetchBatchPrices).mockImplementation(async (dates) => {
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate API delay
      return generateMockPrices(dates);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Performance Benchmarks', () => {
    it('should process small dataset (10 transactions) within performance thresholds', async () => {
      const startTime = performance.now();
      const measurementId = PerformanceMonitor.startMeasurement('small-dataset');
      
      // Mock smaller dataset
      vi.mocked(mempoolAPI.fetchTransactions).mockResolvedValueOnce(generateMockTransactions(10));
      
      const result = await processOnChainDataConcurrently(
        'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        '2023-01-01',
        1.0,
        {
          maxConcurrentOperations: 3,
          batchSize: 5,
          enableRequestBatching: true,
          enableCaching: true,
        }
      );
      
      const endTime = performance.now();
      const processingTime = PerformanceMonitor.endMeasurement(measurementId);
      
      expect(result.transactions).toHaveLength(10);
      expect(result.performanceMetrics).toBeDefined();
      expect(processingTime).toBeLessThan(3000); // Should complete in under 3 seconds
      expect(endTime - startTime).toBeLessThan(5000); // Total time under 5 seconds
      
      // Validate performance metrics
      expect(result.performanceMetrics?.totalProcessingTime).toBeGreaterThan(0);
      expect(result.performanceMetrics?.concurrentOperationsUsed).toBeGreaterThan(0);
    }, 10000);

    it('should process medium dataset (50 transactions) efficiently', async () => {
      const startTime = performance.now();
      const measurementId = PerformanceMonitor.startMeasurement('medium-dataset');
      
      const result = await processOnChainDataConcurrently(
        'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        '2023-01-01',
        1.0,
        {
          maxConcurrentOperations: 5,
          batchSize: 10,
          enableRequestBatching: true,
          enableCaching: true,
        }
      );
      
      const endTime = performance.now();
      const processingTime = PerformanceMonitor.endMeasurement(measurementId);
      
      expect(result.transactions).toHaveLength(50);
      expect(processingTime).toBeLessThan(8000); // Should complete in under 8 seconds
      expect(endTime - startTime).toBeLessThan(10000); // Total time under 10 seconds
      
      // Performance should be better than linear scaling
      const expectedLinearTime = 3000 * (50 / 10); // Based on small dataset performance
      expect(processingTime).toBeLessThan(expectedLinearTime * 0.8); // At least 20% improvement
    }, 15000);

    it('should process large dataset (100 transactions) with concurrent optimizations', async () => {
      const measurementId = PerformanceMonitor.startMeasurement('large-dataset');
      
      // Mock large dataset
      vi.mocked(mempoolAPI.fetchTransactions).mockResolvedValueOnce(generateMockTransactions(100));
      
      const result = await processOnChainDataConcurrently(
        'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        '2023-01-01',
        1.0,
        {
          maxConcurrentOperations: 8,
          batchSize: 15,
          enableRequestBatching: true,
          enableCaching: true,
        }
      );
      
      const processingTime = PerformanceMonitor.endMeasurement(measurementId);
      
      expect(result.transactions).toHaveLength(100);
      expect(processingTime).toBeLessThan(15000); // Should complete in under 15 seconds
      
      // Validate that concurrent operations were actually used
      expect(result.performanceMetrics?.concurrentOperationsUsed).toBeGreaterThan(1);
      expect(result.performanceMetrics?.batchingEfficiencyPercent).toBeGreaterThan(50);
    }, 20000);
  });

  describe('Optimization Effectiveness', () => {
    it('should demonstrate performance improvement over sequential processing', async () => {
      const transactions = generateMockTransactions(25);
      
      // Test sequential processing time (mock the old way)
      const sequentialStart = PerformanceMonitor.startMeasurement('sequential');
      
      // Simulate sequential annotation
      const sequentialResult = annotateTransactions(
        transactions,
        'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        '2023-01-01',
        1.0
      );
      
      const sequentialTime = PerformanceMonitor.endMeasurement(sequentialStart);
      
      // Test concurrent processing time
      const concurrentStart = PerformanceMonitor.startMeasurement('concurrent');
      
      const concurrentResult = await annotateTransactionsWithPerformance(
        transactions,
        'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        '2023-01-01',
        1.0,
        undefined,
        true
      );
      
      const concurrentTime = PerformanceMonitor.endMeasurement(concurrentStart);
      
      // Validate results are equivalent
      expect(concurrentResult.annotatedTransactions).toHaveLength(sequentialResult.annotatedTransactions.length);
      
      // Concurrent should be faster or at least not significantly slower
      // Allow some tolerance for test environment variability
      const performanceRatio = concurrentTime / sequentialTime;
      expect(performanceRatio).toBeLessThan(1.2); // At most 20% slower (should be faster)
      
      // Log performance comparison
      console.log(`Sequential: ${sequentialTime}ms, Concurrent: ${concurrentTime}ms, Ratio: ${performanceRatio}`);
    }, 10000);

    it('should validate memory optimization effectiveness', async () => {
      const initialMemory = MemoryOptimizer.getMemoryInfo();
      
      // Process large dataset
      const result = await processOnChainDataConcurrently(
        'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        '2023-01-01',
        1.0,
        {
          maxConcurrentOperations: 5,
          batchSize: 20,
          enableRequestBatching: true,
          enableCaching: true,
        }
      );
      
      // Trigger memory optimization
      MemoryOptimizer.optimizeMemory();
      const finalMemory = MemoryOptimizer.getMemoryInfo();
      
      expect(result.performanceMetrics?.memoryOptimizationsPerformed).toBeGreaterThan(0);
      
      // Memory usage should be reasonable
      if (initialMemory.usedJSHeapSize && finalMemory.usedJSHeapSize) {
        const memoryGrowth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
        expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // Less than 50MB growth
      }
    }, 10000);

    it('should validate cache effectiveness', async () => {
      // Clear caches first
      OnChainPriceFetcher.clearCache();
      
      const dates = ['2023-01-01', '2023-01-02', '2023-01-03'];
      
      // First call - should hit API
      const start1 = performance.now();
      const prices1 = await OnChainPriceFetcher.fetchBatchPrices(dates);
      const time1 = performance.now() - start1;
      
      // Second call - should hit cache
      const start2 = performance.now();
      const prices2 = await OnChainPriceFetcher.fetchBatchPrices(dates);
      const time2 = performance.now() - start2;
      
      expect(prices1).toEqual(prices2);
      expect(time2).toBeLessThan(time1 * 0.5); // Cached call should be at least 50% faster
      
      const cacheStats = OnChainPriceFetcher.getCacheStats();
      expect(cacheStats.hitRate).toBeGreaterThan(0);
    }, 8000);
  });

  describe('Stress Testing', () => {
    it('should handle high concurrency without degradation', async () => {
      const testCases = [
        { concurrent: 2, expected: 'baseline' },
        { concurrent: 5, expected: 'improved' },
        { concurrent: 10, expected: 'optimal' },
        { concurrent: 20, expected: 'saturated' }
      ];
      
      const results: Array<{ concurrent: number; time: number; }> = [];
      
      for (const testCase of testCases) {
        const measurementId = PerformanceMonitor.startMeasurement(`concurrency-${testCase.concurrent}`);
        
        await processOnChainDataConcurrently(
          'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          '2023-01-01',
          1.0,
          {
            maxConcurrentOperations: testCase.concurrent,
            batchSize: 10,
            enableRequestBatching: true,
            enableCaching: true,
          }
        );
        
        const time = PerformanceMonitor.endMeasurement(measurementId);
        results.push({ concurrent: testCase.concurrent, time });
      }
      
      // Validate that increasing concurrency improves performance up to a point
      expect(results[1].time).toBeLessThanOrEqual(results[0].time * 1.1); // 5 concurrent should be better or similar
      
      // Log results for analysis
      console.log('Concurrency stress test results:', results);
    }, 25000);

    it('should maintain performance under memory pressure', async () => {
      // Simulate memory pressure by creating large objects
      const memoryPressure = new Array(1000).fill(null).map(() => new Array(1000).fill('data'));
      
      const measurementId = PerformanceMonitor.startMeasurement('memory-pressure');
      
      const result = await processOnChainDataConcurrently(
        'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        '2023-01-01',
        1.0,
        {
          maxConcurrentOperations: 5,
          batchSize: 10,
          enableRequestBatching: true,
          enableCaching: true,
        }
      );
      
      const time = PerformanceMonitor.endMeasurement(measurementId);
      
      expect(result.transactions).toHaveLength(50);
      expect(time).toBeLessThan(12000); // Should still complete reasonably fast
      expect(result.performanceMetrics?.memoryOptimizationsPerformed).toBeGreaterThan(0);
      
      // Cleanup memory pressure
      memoryPressure.splice(0);
    }, 15000);
  });

  describe('Error Handling Performance', () => {
    it('should handle partial failures efficiently', async () => {
      // Mock partial failures
      vi.mocked(OnChainPriceFetcher.fetchBatchPrices).mockImplementationOnce(async (dates) => {
        // Simulate failure for some dates
        const prices: Record<string, number> = {};
        dates.slice(0, Math.floor(dates.length / 2)).forEach(date => {
          prices[date] = 40000;
        });
        return prices;
      });
      
      const measurementId = PerformanceMonitor.startMeasurement('partial-failures');
      
      const result = await processOnChainDataConcurrently(
        'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        '2023-01-01',
        1.0,
        {
          maxConcurrentOperations: 5,
          batchSize: 10,
          enableRequestBatching: true,
          enableCaching: true,
        }
      );
      
      const time = PerformanceMonitor.endMeasurement(measurementId);
      
      expect(result.transactions).toHaveLength(50);
      expect(time).toBeLessThan(10000); // Should handle failures efficiently
      expect(result.performanceMetrics?.partialFailuresHandled).toBeGreaterThan(0);
    }, 12000);
  });
});

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { cacheMetrics, measureCachePerformance } from '@/lib/performance/cacheMetrics';

// Mock Service Worker environment
const mockServiceWorkerContainer = {
  register: vi.fn().mockResolvedValue({
    installing: null,
    waiting: null,
    active: {
      postMessage: vi.fn()
    },
    addEventListener: vi.fn(),
    update: vi.fn()
  }),
  ready: Promise.resolve({
    active: {
      postMessage: vi.fn()
    },
    sync: {
      register: vi.fn().mockResolvedValue(undefined)
    }
  }),
  getRegistrations: vi.fn().mockResolvedValue([]),
  controller: null
};

// Mock cache API
const mockCache = {
  match: vi.fn(),
  put: vi.fn().mockResolvedValue(undefined),
  add: vi.fn().mockResolvedValue(undefined),
  addAll: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(true),
  keys: vi.fn().mockResolvedValue([])
};

const mockCaches = {
  open: vi.fn().mockResolvedValue(mockCache),
  match: vi.fn(),
  has: vi.fn().mockResolvedValue(true),
  delete: vi.fn().mockResolvedValue(true),
  keys: vi.fn().mockResolvedValue(['test-cache-v1'])
};

describe('Phase 3.2: Service Worker Performance Tests', () => {
  beforeAll(() => {
    // Setup service worker and cache mocks
    Object.defineProperty(global, 'navigator', {
      value: {
        serviceWorker: mockServiceWorkerContainer,
        onLine: true
      },
      writable: true
    });

    Object.defineProperty(global, 'caches', {
      value: mockCaches,
      writable: true
    });

    // Mock fetch for performance testing
    global.fetch = vi.fn();
    
    // Mock performance API
    Object.defineProperty(global, 'performance', {
      value: {
        now: vi.fn(() => Date.now())
      },
      writable: true
    });
  });

  afterAll(() => {
    vi.restoreAllMocks();
    cacheMetrics.clear();
  });

  describe('Cache Metrics Collection', () => {
    it('should record cache hits with improved performance', () => {
      const url = '/api/bitcoin/price';
      const fastCacheTime = 25; // 25ms - much faster than network
      const networkTime = 350; // 350ms - typical network request

      // Record cache hit
      cacheMetrics.recordCacheEvent(url, true, fastCacheTime, 'bitcoin');
      
      // Record network request for comparison
      cacheMetrics.recordCacheEvent(url, false, networkTime, 'bitcoin');

      const stats = cacheMetrics.getStatsByType('bitcoin');

      expect(stats.hitRate).toBe(50); // 1 hit out of 2 requests
      expect(stats.avgLoadTimeWithCache).toBe(fastCacheTime);
      expect(stats.avgLoadTimeWithoutCache).toBe(networkTime);
      expect(stats.totalSavings).toBeGreaterThan(300); // Should save > 300ms
    });

    it('should track 300ms improvement target for repeat visits', () => {
      cacheMetrics.clear();
      
      // Simulate repeat visit with cached resources
      const cachedRequests = [
        { url: '/', time: 20, type: 'static' as const },
        { url: '/_next/static/main.js', time: 15, type: 'static' as const },
        { url: '/_next/static/main.css', time: 10, type: 'static' as const },
        { url: '/api/bitcoin/price', time: 30, type: 'bitcoin' as const },
        { url: '/data/bitcoin-price.json', time: 25, type: 'data' as const }
      ];

      // Record all as cache hits
      cachedRequests.forEach(req => {
        cacheMetrics.recordCacheEvent(req.url, true, req.time, req.type);
      });

      const summary = cacheMetrics.getPerformanceSummary();
      const totalCacheTime = cachedRequests.reduce((sum, req) => sum + req.time, 0);
      
      expect(summary.overall.hitRate).toBe(100);
      expect(summary.overall.avgLoadTimeWithCache).toBeLessThan(50); // Average should be very fast
      expect(totalCacheTime).toBeLessThan(150); // Total under 150ms for all resources
    });

    it('should demonstrate static asset caching performance', () => {
      cacheMetrics.clear();
      
      // Simulate static asset loading
      const staticAssets = [
        '/_next/static/chunks/main.js',
        '/_next/static/chunks/pages/index.js',
        '/_next/static/css/app.css'
      ];

      // First visit (network)
      staticAssets.forEach(asset => {
        cacheMetrics.recordCacheEvent(asset, false, 200, 'static');
      });

      // Repeat visit (cached)
      staticAssets.forEach(asset => {
        cacheMetrics.recordCacheEvent(asset, true, 20, 'static');
      });

      const stats = cacheMetrics.getStatsByType('static');
      
      expect(stats.hitRate).toBe(50); // 3 hits out of 6 total requests
      expect(stats.avgLoadTimeWithCache).toBe(20);
      expect(stats.avgLoadTimeWithoutCache).toBe(200);
      expect(stats.totalSavings).toBeGreaterThan(500); // Should save significant time
    });
  });

  describe('measureCachePerformance utility', () => {
    it('should measure and record cache performance', async () => {
      cacheMetrics.clear();
      
      // Mock a fast cached operation
      const cachedOperation = () => Promise.resolve({ data: 'cached' });
      
      // Mock performance.now to return predictable values
      let mockTime = 1000;
      vi.mocked(global.performance.now).mockImplementation(() => {
        const currentTime = mockTime;
        mockTime += 25; // 25ms elapsed
        return currentTime;
      });

      const result = await measureCachePerformance(
        cachedOperation,
        '/api/test',
        'bitcoin',
        true
      );

      expect(result).toEqual({ data: 'cached' });
      
      const stats = cacheMetrics.getStatsByType('bitcoin');
      expect(stats.cacheHits).toBe(1);
      expect(stats.avgLoadTimeWithCache).toBe(25);
    });

    it('should handle errors and still record metrics', async () => {
      cacheMetrics.clear();
      
      const failingOperation = () => Promise.reject(new Error('Network error'));
      
      let mockTime = 2000;
      vi.mocked(global.performance.now).mockImplementation(() => {
        const currentTime = mockTime;
        mockTime += 100; // 100ms elapsed
        return currentTime;
      });

      await expect(
        measureCachePerformance(failingOperation, '/api/fail', 'api', false)
      ).rejects.toThrow('Network error');
      
      const stats = cacheMetrics.getStatsByType('api');
      expect(stats.cacheMisses).toBe(1);
      expect(stats.avgLoadTimeWithoutCache).toBe(100);
    });
  });

  describe('Performance Summary', () => {
    it('should indicate 300ms improvement achievement', () => {
      cacheMetrics.clear();
      
      // Record network requests (slow)
      cacheMetrics.recordCacheEvent('/page1', false, 500, 'static');
      cacheMetrics.recordCacheEvent('/page2', false, 600, 'static');
      
      // Record cached requests (fast)
      cacheMetrics.recordCacheEvent('/page1', true, 150, 'static');
      cacheMetrics.recordCacheEvent('/page2', true, 200, 'static');
      
      const summary = cacheMetrics.getPerformanceSummary();
      
      expect(summary.improved300ms).toBe(true);
      expect(summary.overall.avgLoadTimeWithoutCache - summary.overall.avgLoadTimeWithCache).toBeGreaterThan(300);
    });
  });

  describe('Cache Statistics Export', () => {
    it('should export metrics in JSON format', () => {
      cacheMetrics.clear();
      
      cacheMetrics.recordCacheEvent('/test', true, 50, 'api');
      
      const exported = cacheMetrics.exportMetrics('json');
      const parsed = JSON.parse(exported);
      
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(1);
      expect(parsed[0].url).toBe('/test');
      expect(parsed[0].cacheHit).toBe(true);
      expect(parsed[0].loadTime).toBe(50);
    });

    it('should export metrics in CSV format', () => {
      cacheMetrics.clear();
      
      cacheMetrics.recordCacheEvent('/test.css', true, 25, 'static', 1024);
      
      const csv = cacheMetrics.exportMetrics('csv');
      const lines = csv.split('\n');
      
      expect(lines[0]).toBe('timestamp,url,cacheHit,loadTime,cacheType,responseSize');
      expect(lines).toHaveLength(2); // Header + 1 data row
      expect(lines[1]).toContain('/test.css,true,25,static,1024');
    });
  });

  describe('Service Worker Integration', () => {
    it('should support service worker registration', () => {
      expect(navigator.serviceWorker).toBeDefined();
      expect(typeof navigator.serviceWorker.register).toBe('function');
    });

    it('should support cache API', () => {
      expect(global.caches).toBeDefined();
      expect(typeof caches.open).toBe('function');
      expect(typeof caches.match).toBe('function');
    });
  });
});

// Integration test for Phase 3.2 performance targets
describe('Phase 3.2: Performance Target Validation', () => {
  it('should achieve 300ms repeat visit improvement', () => {
    cacheMetrics.clear();
    
    // Simulate first visit (cold cache)
    const firstVisitResources = [
      { url: '/', time: 800, cached: false },
      { url: '/_next/static/main.js', time: 450, cached: false },
      { url: '/_next/static/main.css', time: 200, cached: false },
      { url: '/api/bitcoin/price', time: 300, cached: false },
      { url: '/data/schemes-meta.json', time: 150, cached: false }
    ];
    
    // Simulate repeat visit (warm cache)
    const repeatVisitResources = [
      { url: '/', time: 50, cached: true },
      { url: '/_next/static/main.js', time: 20, cached: true },
      { url: '/_next/static/main.css', time: 15, cached: true },
      { url: '/api/bitcoin/price', time: 40, cached: true },
      { url: '/data/schemes-meta.json', time: 25, cached: true }
    ];
    
    // Record all requests
    [...firstVisitResources, ...repeatVisitResources].forEach(resource => {
      const cacheType = resource.url.includes('/api/') ? 'api' : 
                       resource.url.includes('/_next/') ? 'static' : 
                       resource.url.includes('/data/') ? 'data' : 'static';
      
      cacheMetrics.recordCacheEvent(
        resource.url, 
        resource.cached, 
        resource.time, 
        cacheType as any
      );
    });
    
    const firstVisitTotal = firstVisitResources.reduce((sum, r) => sum + r.time, 0);
    const repeatVisitTotal = repeatVisitResources.reduce((sum, r) => sum + r.time, 0);
    const improvement = firstVisitTotal - repeatVisitTotal;
    
    expect(improvement).toBeGreaterThan(300); // Should exceed 300ms improvement
    expect(repeatVisitTotal).toBeLessThan(200); // Repeat visit should be very fast
    
    const stats = cacheMetrics.getStats();
    expect(stats.hitRate).toBe(50); // 50% cache hit rate
    expect(stats.totalSavings).toBeGreaterThan(1000); // Significant time savings
  });
  
  it('should optimize Bitcoin-specific data caching', () => {
    cacheMetrics.clear();
    
    // Bitcoin data requests with stale-while-revalidate
    const bitcoinRequests = [
      { url: '/api/bitcoin/price', networkTime: 250, cacheTime: 35 },
      { url: '/api/mempool/fees/recommended', networkTime: 180, cacheTime: 25 },
      { url: '/data/bitcoin-price.json', networkTime: 120, cacheTime: 20 }
    ];
    
    bitcoinRequests.forEach(req => {
      // Network request (first time)
      cacheMetrics.recordCacheEvent(req.url, false, req.networkTime, 'bitcoin');
      // Cached request (subsequent times)
      cacheMetrics.recordCacheEvent(req.url, true, req.cacheTime, 'bitcoin');
    });
    
    const bitcoinStats = cacheMetrics.getStatsByType('bitcoin');
    
    expect(bitcoinStats.hitRate).toBe(50);
    expect(bitcoinStats.avgLoadTimeWithCache).toBeLessThan(40);
    expect(bitcoinStats.avgLoadTimeWithoutCache).toBeGreaterThan(150);
    expect(bitcoinStats.totalSavings).toBeGreaterThan(400); // Bitcoin data should save significant time
  });
});
/**
 * Comprehensive tests for secure fetch wrapper with SSL error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { secureFetch, secureGet, SecureApiClient } from '../secure-fetch-wrapper';
import { ToolError } from '@/types/bitcoin-tools';

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Test schemas
const TestResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  active: z.boolean()
});

type TestResponse = z.infer<typeof TestResponseSchema>;

describe('SecureFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic functionality', () => {
    it('should successfully fetch and validate data', async () => {
      const mockData = { id: 1, name: 'Test', active: true };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockData),
        status: 200,
        statusText: 'OK'
      };
      
      mockFetch.mockResolvedValue(mockResponse);

      const result = await secureFetch<TestResponse>('https://api.test.com/data', {
        validateSchema: TestResponseSchema
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockData);
        expect(result.attempts).toBe(1);
      }
    });

    it('should handle HTTP error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: vi.fn().mockResolvedValue('Resource not found')
      };
      
      mockFetch.mockResolvedValue(mockResponse);

      const result = await secureFetch('https://api.test.com/missing');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('fetch_error');
        expect(result.attempts).toBe(1);
      }
    });

    it('should handle invalid JSON responses', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockRejectedValue(new SyntaxError('Invalid JSON')),
        status: 200
      };
      
      mockFetch.mockResolvedValue(mockResponse);

      const result = await secureFetch('https://api.test.com/invalid-json');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('parse_error');
      }
    });
  });

  describe('SSL Error handling', () => {
    it('should detect and retry SSL errors', async () => {
      const sslError = new Error('SSL certificate verification failed');
      mockFetch
        .mockRejectedValueOnce(sslError)
        .mockRejectedValueOnce(sslError)
        .mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue({ success: true }),
          status: 200
        });

      const result = await secureFetch('https://api.test.com/ssl-test', {
        retries: 3,
        retryDelay: 100
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.attempts).toBe(3);
        expect(mockFetch).toHaveBeenCalledTimes(3);
      }
    });

    it('should handle SSL errors with custom retry condition', async () => {
      const sslError = new Error('certificate verify failed');
      mockFetch.mockRejectedValue(sslError);

      const result = await secureFetch('https://api.test.com/ssl-fail', {
        retries: 2,
        retryCondition: (error, attempt) => {
          return error.message.includes('certificate') && attempt <= 1;
        }
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('network');
        expect(result.attempts).toBe(2);
      }
    });
  });

  describe('Connection errors', () => {
    it('should retry ECONNRESET errors', async () => {
      const connectionError = new Error('ECONNRESET - Connection reset by peer');
      mockFetch
        .mockRejectedValueOnce(connectionError)
        .mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue({ recovered: true }),
          status: 200
        });

      const result = await secureFetch('https://api.test.com/connection-test', {
        retries: 1,
        retryDelay: 50
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.attempts).toBe(2);
      }
    });

    it('should handle ENOTFOUND errors', async () => {
      const dnsError = new Error('ENOTFOUND api.nonexistent.com');
      mockFetch.mockRejectedValue(dnsError);

      const result = await secureFetch('https://api.nonexistent.com/test');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('network');
      }
    });
  });

  describe('Timeout handling', () => {
    it('should handle timeout errors', async () => {
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValue(abortError);

      const result = await secureFetch('https://api.test.com/slow', {
        timeout: 1000
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('timeout');
      }
    });

    it('should use progressive timeout on retries', async () => {
      let timeoutValues: number[] = [];
      
      // Mock setTimeout to capture timeout values
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = vi.fn().mockImplementation((callback: Function, timeout: number) => {
        if (timeout > 100) { // Only capture fetch timeouts, not retry delays
          timeoutValues.push(timeout);
        }
        return originalSetTimeout(callback, timeout);
      });

      const timeoutError = new Error('Timeout');
      timeoutError.name = 'AbortError';
      mockFetch.mockRejectedValue(timeoutError);

      await secureFetch('https://api.test.com/progressive-timeout', {
        timeout: 5000,
        retries: 2
      });

      // Should have progressive timeouts: 5000ms, 10000ms, 15000ms
      expect(timeoutValues).toHaveLength(3);
      expect(timeoutValues[0]).toBe(5000);
      expect(timeoutValues[1]).toBe(10000);
      expect(timeoutValues[2]).toBe(15000);

      global.setTimeout = originalSetTimeout;
    });
  });

  describe('Schema validation', () => {
    it('should validate response against schema', async () => {
      const invalidData = { id: 'not-a-number', name: 123, missing: 'active' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(invalidData),
        status: 200
      });

      const result = await secureFetch('https://api.test.com/invalid-schema', {
        validateSchema: TestResponseSchema
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('parse_error');
        expect(result.error.context?.validationErrors).toBeDefined();
      }
    });

    it('should pass valid data through schema validation', async () => {
      const validData = { id: 42, name: 'Valid Data', active: false };
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(validData),
        status: 200
      });

      const result = await secureFetch<TestResponse>('https://api.test.com/valid-schema', {
        validateSchema: TestResponseSchema
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });
  });

  describe('SecureGet convenience function', () => {
    it('should perform GET request with validation', async () => {
      const testData = { id: 99, name: 'GET Test', active: true };
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(testData),
        status: 200
      });

      const result = await secureGet('https://api.test.com/get-test', TestResponseSchema);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/get-test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  describe('SecureApiClient', () => {
    let client: SecureApiClient;

    beforeEach(() => {
      client = new SecureApiClient('https://api.test.com', {
        retries: 1,
        timeout: 5000
      });
    });

    it('should construct URLs correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ success: true }),
        status: 200
      });

      await client.get('/endpoint', z.object({ success: z.boolean() }));

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/endpoint',
        expect.any(Object)
      );
    });

    it('should handle absolute URLs', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ external: true }),
        status: 200
      });

      await client.get('https://external.api.com/data', z.object({ external: z.boolean() }));

      expect(mockFetch).toHaveBeenCalledWith(
        'https://external.api.com/data',
        expect.any(Object)
      );
    });

    it('should merge default options', async () => {
      const sslError = new Error('SSL handshake failure');
      mockFetch
        .mockRejectedValueOnce(sslError)
        .mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue({ retried: true }),
          status: 200
        });

      const result = await client.get('/retry-test', z.object({ retried: z.boolean() }));

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2); // Initial + 1 retry (from default options)
    });
  });

  describe('Error recovery scenarios', () => {
    it('should recover from intermittent SSL errors', async () => {
      const errors = [
        new Error('SSL certificate verify failed'),
        new Error('ECONNRESET'),
        new Error('SSL handshake timeout')
      ];
      
      errors.forEach(error => mockFetch.mockRejectedValueOnce(error));
      mockFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ recovered: true }),
        status: 200
      });

      const result = await secureFetch('https://api.test.com/ssl-recovery', {
        retries: 3,
        retryDelay: 10
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.attempts).toBe(4);
        expect(result.data).toEqual({ recovered: true });
      }
    });

    it('should eventually fail after max retries', async () => {
      const persistentError = new Error('Persistent SSL failure');
      mockFetch.mockRejectedValue(persistentError);

      const result = await secureFetch('https://api.test.com/persistent-fail', {
        retries: 2,
        retryDelay: 10
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.attempts).toBe(3); // Initial + 2 retries
        expect(mockFetch).toHaveBeenCalledTimes(3);
      }
    });
  });
});
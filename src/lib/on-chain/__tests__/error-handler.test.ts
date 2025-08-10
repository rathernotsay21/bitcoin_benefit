/**
 * Comprehensive tests for on-chain error handling and recovery
 * Tests error scenarios, retry logic, and recovery mechanisms
 */

import { 
  OnChainErrorHandler, 
  OnChainTrackingError,
  NetworkError,
  ValidationError,
  DataProcessingError,
  PartialDataError,
  ErrorUtils
} from '../error-handler';
import { MempoolAPIError } from '../mempool-api';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('OnChainErrorHandler', () => {
  let errorHandler: OnChainErrorHandler;

  beforeEach(() => {
    errorHandler = OnChainErrorHandler.getInstance();
  });

  describe('Error Processing', () => {
    const mockContext = {
      operation: 'test_operation',
      step: 'test_step',
      timestamp: '2024-01-01T00:00:00.000Z'
    };

    it('should process MempoolAPIError correctly', () => {
      const mempoolError = new MempoolAPIError(
        'Invalid Bitcoin address format',
        400,
        false
      );

      const processed = errorHandler.processError(mempoolError, mockContext);

      expect(processed).toBeInstanceOf(ValidationError);
      expect(processed.code).toBe('VALIDATION_ERROR');
      expect(processed.isRetryable).toBe(false);
      expect(processed.userFriendlyMessage).toContain('Invalid Bitcoin address');
    });

    it('should process network timeout errors', () => {
      const timeoutError = new MempoolAPIError(
        'Request timeout',
        408,
        true
      );

      const processed = errorHandler.processError(timeoutError, mockContext);

      expect(processed).toBeInstanceOf(NetworkError);
      expect(processed.code).toBe('NETWORK_ERROR');
      expect(processed.isRetryable).toBe(true);
    });

    it('should process rate limit errors', () => {
      const rateLimitError = new MempoolAPIError(
        'Rate limit exceeded',
        429,
        true
      );

      const processed = errorHandler.processError(rateLimitError, mockContext);

      expect(processed).toBeInstanceOf(NetworkError);
      expect(processed.code).toBe('NETWORK_ERROR');
      expect(processed.isRetryable).toBe(true);
    });

    it('should process server errors as retryable', () => {
      const serverError = new MempoolAPIError(
        'Internal server error',
        500,
        false
      );

      const processed = errorHandler.processError(serverError, mockContext);

      expect(processed).toBeInstanceOf(NetworkError);
      expect(processed.isRetryable).toBe(true);
    });

    it('should process generic fetch errors', () => {
      const fetchError = new TypeError('Failed to fetch');

      const processed = errorHandler.processError(fetchError, mockContext);

      expect(processed).toBeInstanceOf(NetworkError);
      expect(processed.isRetryable).toBe(true);
      expect(processed.userFriendlyMessage).toBe('Network connection failed');
    });

    it('should process JSON parsing errors', () => {
      const jsonError = new SyntaxError('Unexpected token in JSON');

      const processed = errorHandler.processError(jsonError, mockContext);

      expect(processed).toBeInstanceOf(DataProcessingError);
      expect(processed.code).toBe('DATA_PROCESSING_ERROR');
      expect(processed.isRetryable).toBe(false);
    });

    it('should process unknown errors', () => {
      const unknownError = 'some string error';

      const processed = errorHandler.processError(unknownError, mockContext);

      expect(processed).toBeInstanceOf(OnChainTrackingError);
      expect(processed.code).toBe('UNKNOWN_ERROR');
      expect(processed.isRetryable).toBe(false);
    });
  });

  describe('Retry Logic', () => {
    it('should retry retryable operations', async () => {
      let callCount = 0;
      const operation = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          throw new NetworkError('Network error', 503);
        }
        return 'success';
      });

      const result = await errorHandler.executeWithRetry(
        operation,
        {
          operation: 'transaction_fetch',
          step: 'fetch_data',
          timestamp: '2024-01-01T00:00:00.000Z'
        },
        {
          maxRetries: 3,
          baseDelay: 10, // Short delay for tests
          maxDelay: 100,
          exponentialBackoff: false,
          retryableErrors: ['NETWORK_ERROR']
        }
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-retryable errors', async () => {
      const operation = jest.fn().mockImplementation(() => {
        throw new ValidationError('Invalid input');
      });

      await expect(errorHandler.executeWithRetry(
        operation,
        {
          operation: 'validation',
          step: 'validate_input',
          timestamp: '2024-01-01T00:00:00.000Z'
        },
        {
          maxRetries: 3,
          baseDelay: 10,
          maxDelay: 100,
          exponentialBackoff: false,
          retryableErrors: ['NETWORK_ERROR']
        }
      )).rejects.toThrow(ValidationError);

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should respect max retry limit', async () => {
      const operation = jest.fn().mockImplementation(() => {
        throw new NetworkError('Persistent network error', 503);
      });

      await expect(errorHandler.executeWithRetry(
        operation,
        {
          operation: 'transaction_fetch',
          step: 'fetch_data',
          timestamp: '2024-01-01T00:00:00.000Z'
        },
        {
          maxRetries: 2,
          baseDelay: 10,
          maxDelay: 100,
          exponentialBackoff: false,
          retryableErrors: ['NETWORK_ERROR']
        }
      )).rejects.toThrow(NetworkError);

      expect(operation).toHaveBeenCalledTimes(3); // Initial call + 2 retries
    });

    it('should use exponential backoff when enabled', async () => {
      let callCount = 0;
      const startTime = Date.now();
      const operation = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          throw new NetworkError('Network error', 503);
        }
        return 'success';
      });

      await errorHandler.executeWithRetry(
        operation,
        {
          operation: 'transaction_fetch',
          step: 'fetch_data',
          timestamp: '2024-01-01T00:00:00.000Z'
        },
        {
          maxRetries: 2,
          baseDelay: 50,
          maxDelay: 200,
          exponentialBackoff: true,
          retryableErrors: ['NETWORK_ERROR']
        }
      );

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should take at least baseDelay * 2 (exponential backoff)
      // Plus some time for jitter
      expect(totalTime).toBeGreaterThan(50);
    });
  });

  describe('Partial Data Handling', () => {
    it('should handle partial data scenarios', () => {
      const availableData = { transactions: [{ id: '1' }] };
      const missingData = 'historical prices';
      const context = {
        operation: 'price_fetch',
        step: 'fetch_prices',
        timestamp: '2024-01-01T00:00:00.000Z'
      };

      const result = errorHandler.handlePartialDataError(
        availableData,
        missingData,
        context
      );

      expect(result.data).toEqual(availableData);
      expect(result.error).toBeInstanceOf(PartialDataError);
      expect(result.error.code).toBe('PARTIAL_DATA_ERROR');
      expect(result.error.isRetryable).toBe(true);
    });
  });

  describe('User-Friendly Error Messages', () => {
    it('should create validation error messages', () => {
      const validationError = new ValidationError('Invalid Bitcoin address', 'address');

      const userFriendly = errorHandler.createUserFriendlyError(validationError);

      expect(userFriendly.title).toBe('Invalid Input');
      expect(userFriendly.canRetry).toBe(false);
      expect(userFriendly.actionable).toContain('correct');
    });

    it('should create network error messages', () => {
      const networkError = new NetworkError('Connection failed', 503);

      const userFriendly = errorHandler.createUserFriendlyError(networkError);

      expect(userFriendly.title).toBe('Connection Error');
      expect(userFriendly.canRetry).toBe(true);
      expect(userFriendly.actionable).toContain('try again');
    });

    it('should create partial data error messages', () => {
      const partialError = new PartialDataError(
        'Some data missing',
        'transaction data',
        'price data'
      );

      const userFriendly = errorHandler.createUserFriendlyError(partialError);

      expect(userFriendly.title).toBe('Partial Results');
      expect(userFriendly.canRetry).toBe(true);
      expect(userFriendly.actionable).toContain('continue with partial data');
    });
  });
});

describe('Error Utility Functions', () => {
  describe('ErrorUtils', () => {
    it('should identify service unavailable errors', () => {
      const serviceError = new NetworkError('Service unavailable', 503);
      expect(ErrorUtils.isServiceUnavailable(serviceError)).toBe(true);

      const otherError = new NetworkError('Timeout', 408);
      expect(ErrorUtils.isServiceUnavailable(otherError)).toBe(false);
    });

    it('should identify retryable errors', () => {
      const retryableError = new NetworkError('Timeout', 408);
      retryableError.isRetryable = true;
      expect(ErrorUtils.canRetry(retryableError)).toBe(true);

      const nonRetryableError = new ValidationError('Invalid input');
      expect(ErrorUtils.canRetry(nonRetryableError)).toBe(false);
    });

    it('should identify user input errors', () => {
      const inputError = new ValidationError('Invalid address');
      expect(ErrorUtils.isUserInputError(inputError)).toBe(true);

      const networkError = new NetworkError('Connection failed');
      expect(ErrorUtils.isUserInputError(networkError)).toBe(false);
    });

    it('should extract validation field names', () => {
      const addressError = new ValidationError('Invalid Bitcoin address format');
      expect(ErrorUtils.getValidationField(addressError)).toBe('address');

      const dateError = new ValidationError('Invalid vesting start date');
      expect(ErrorUtils.getValidationField(dateError)).toBe('date');

      const amountError = new ValidationError('Invalid grant amount');
      expect(ErrorUtils.getValidationField(amountError)).toBe('amount');

      const genericError = new ValidationError('Something is wrong');
      expect(ErrorUtils.getValidationField(genericError)).toBeNull();
    });
  });
});

describe('Custom Error Classes', () => {
  describe('OnChainTrackingError', () => {
    it('should create error with all properties', () => {
      const error = new OnChainTrackingError(
        'Test error',
        'TEST_ERROR',
        true,
        'User friendly message',
        'Do this to fix it'
      );

      expect(error.name).toBe('OnChainTrackingError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.isRetryable).toBe(true);
      expect(error.userFriendlyMessage).toBe('User friendly message');
      expect(error.actionableGuidance).toBe('Do this to fix it');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with field', () => {
      const error = new ValidationError('Invalid format', 'address');

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.isRetryable).toBe(false);
      expect(error.userFriendlyMessage).toContain('Invalid address');
      expect(error.actionableGuidance).toContain('correct the address');
    });

    it('should create validation error without field', () => {
      const error = new ValidationError('Invalid format');

      expect(error.userFriendlyMessage).toContain('Invalid input');
      expect(error.actionableGuidance).toContain('correct the input');
    });
  });

  describe('NetworkError', () => {
    it('should mark retryable status codes as retryable', () => {
      const timeoutError = new NetworkError('Timeout', 408);
      expect(timeoutError.isRetryable).toBe(true);

      const rateLimitError = new NetworkError('Rate limited', 429);
      expect(rateLimitError.isRetryable).toBe(true);

      const serverError = new NetworkError('Server error', 500);
      expect(serverError.isRetryable).toBe(true);
    });

    it('should mark non-retryable status codes as non-retryable', () => {
      const badRequestError = new NetworkError('Bad request', 400);
      expect(badRequestError.isRetryable).toBe(false);

      const notFoundError = new NetworkError('Not found', 404);
      expect(notFoundError.isRetryable).toBe(false);
    });

    it('should default to retryable when no status code provided', () => {
      const genericError = new NetworkError('Network error');
      expect(genericError.isRetryable).toBe(true);
    });
  });

  describe('DataProcessingError', () => {
    it('should create processing error with step', () => {
      const error = new DataProcessingError('Failed to parse', 'annotation');

      expect(error.code).toBe('DATA_PROCESSING_ERROR');
      expect(error.isRetryable).toBe(false);
      expect(error.userFriendlyMessage).toContain('processing annotation');
      expect(error.actionableGuidance).toContain('verify your inputs');
    });
  });

  describe('PartialDataError', () => {
    it('should create partial data error with details', () => {
      const error = new PartialDataError(
        'Some data missing',
        'transactions',
        'price data'
      );

      expect(error.code).toBe('PARTIAL_DATA_ERROR');
      expect(error.isRetryable).toBe(true);
      expect(error.userFriendlyMessage).toContain('price data');
      expect(error.actionableGuidance).toContain('continue with partial data');
    });
  });
});

describe('Integration Tests', () => {
  let errorHandler: OnChainErrorHandler;

  beforeEach(() => {
    errorHandler = OnChainErrorHandler.getInstance();
  });

  it('should handle complete error flow with retry and recovery', async () => {
    let callCount = 0;
    const mockOperation = jest.fn().mockImplementation(async () => {
      callCount++;

      if (callCount === 1) {
        // First call: network timeout (retryable)
        throw new Error('Request timeout');
      } else if (callCount === 2) {
        // Second call: rate limit (retryable)
        const rateLimitError = new MempoolAPIError('Rate limit exceeded', 429, true);
        throw rateLimitError;
      } else {
        // Third call: success
        return { success: true, data: 'test data' };
      }
    });

    const result = await errorHandler.executeWithRetry(
      mockOperation,
      {
        operation: 'transaction_fetch',
        step: 'fetch_transactions',
        address: 'test-address',
        timestamp: '2024-01-01T00:00:00.000Z'
      },
      {
        maxRetries: 3,
        baseDelay: 10,
        maxDelay: 100,
        exponentialBackoff: false,
        retryableErrors: ['NETWORK_ERROR']
      }
    );

    expect(result).toEqual({ success: true, data: 'test data' });
    expect(mockOperation).toHaveBeenCalledTimes(3);
  });

  it('should handle graceful degradation scenario', () => {
    const partialData = {
      transactions: [
        { txid: '1', amount: 0.1 },
        { txid: '2', amount: 0.2 }
      ]
    };

    const result = errorHandler.handlePartialDataError(
      partialData,
      'historical USD prices',
      {
        operation: 'price_fetch',
        step: 'fetch_historical_prices',
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    );

    expect(result.data).toEqual(partialData);
    expect(result.error).toBeInstanceOf(PartialDataError);

    const userFriendly = errorHandler.createUserFriendlyError(result.error);
    expect(userFriendly.title).toBe('Partial Results');
    expect(userFriendly.canRetry).toBe(true);
  });
});
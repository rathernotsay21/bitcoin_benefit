import { create } from 'zustand';
import { 
  RawTransaction, 
  AnnotatedTransaction, 
  ExpectedGrant, 
  TrackerFormData, 
  FormErrors 
} from '@/types/on-chain';
import { validateTrackerForm, validateField } from '@/lib/on-chain/validation';
import { MempoolAPI, mempoolAPI } from '@/lib/on-chain/mempool-api';
import { OnChainPriceFetcher } from '@/lib/on-chain/price-fetcher';
import { 
  annotateTransactions, 
  applyManualAnnotations,
  generateExpectedGrants 
} from '@/lib/on-chain/annotateTransactions';
import { 
  processOnChainDataConcurrently,
  ConcurrentProcessingMetrics,
  PerformanceMonitor,
  MemoryOptimizer,
  ConcurrentProcessingService
} from '@/lib/on-chain/concurrentProcessing';
import { 
  annotateTransactionsWithPerformance,
  applyManualAnnotationsOptimized,
  clearAnnotationCache
} from '@/lib/on-chain/annotateTransactionsOptimized';
import { 
  errorHandler, 
  OnChainTrackingError,
  NetworkError,
  ValidationError,
  DataProcessingError,
  PartialDataError,
  ErrorUtils
} from '@/lib/on-chain/error-handler';

interface OnChainState {
  // Form inputs
  address: string;
  vestingStartDate: string;
  annualGrantBtc: number;
  totalGrants: number;
  
  // Validation
  formErrors: FormErrors;
  
  // Core data
  rawTransactions: RawTransaction[];
  annotatedTransactions: AnnotatedTransaction[];
  expectedGrants: ExpectedGrant[];
  historicalPrices: Record<string, number>;
  
  // Manual overrides
  manualAnnotations: Map<string, number | null>;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  currentStep: 'idle' | 'fetching' | 'annotating' | 'pricing' | 'complete';
  partialDataAvailable: boolean;
  lastError: OnChainTrackingError | null;
  retryCount: number;
  
  // Performance metrics
  performanceMetrics: ConcurrentProcessingMetrics | null;
  lastProcessingTimeMs: number;
  enablePerformanceOptimizations: boolean;
  
  // Actions
  setFormData: (data: Partial<TrackerFormData>) => void;
  validateField: (field: keyof TrackerFormData, value: unknown) => void;
  validateAndFetch: () => Promise<void>;
  updateManualAnnotation: (txid: string, grantYear: number | null) => void;
  resetTracker: () => void;
  retryOperation: () => Promise<void>;
  continueWithPartialData: () => void;
  handleError: (error: unknown, operation: string, step: string) => void;
  clearError: () => void;
  togglePerformanceOptimizations: () => void;
  clearPerformanceCaches: () => void;
  getPerformanceStats: () => any;
  processWithConcurrentOptimizations: (address: string, vestingStartDate: string, annualGrantBtc: number, totalGrants: number) => Promise<void>;
  processWithStandardAlgorithm: (address: string, vestingStartDate: string, annualGrantBtc: number, totalGrants: number) => Promise<void>;
}

// Track active operations for cleanup
let abortController: AbortController | null = null;
let pendingTimers: Set<NodeJS.Timeout> = new Set();

export const useOnChainStore = create<OnChainState>((set, get) => ({
  // Initial state
  address: '',
  vestingStartDate: '',
  annualGrantBtc: 0,
  totalGrants: 5, // Default to reasonable value, will be overridden by form
  formErrors: {},
  rawTransactions: [],
  annotatedTransactions: [],
  expectedGrants: [],
  historicalPrices: {},
  manualAnnotations: new Map(),
  isLoading: false,
  error: null,
  currentStep: 'idle',
  partialDataAvailable: false,
  lastError: null,
  retryCount: 0,
  performanceMetrics: null,
  lastProcessingTimeMs: 0,
  enablePerformanceOptimizations: true,
  
  // Actions
  setFormData: (data) => {
    set((state) => ({
      address: data.address !== undefined ? data.address : state.address,
      vestingStartDate: data.vestingStartDate !== undefined ? data.vestingStartDate : state.vestingStartDate,
      annualGrantBtc: data.annualGrantBtc !== undefined ? data.annualGrantBtc : state.annualGrantBtc,
      totalGrants: data.totalGrants !== undefined ? data.totalGrants : state.totalGrants,
      // Clear errors and last error for updated fields to ensure fresh analysis
      formErrors: {
        ...state.formErrors,
        ...(data.address !== undefined && { address: undefined }),
        ...(data.vestingStartDate !== undefined && { vestingStartDate: undefined }),
        ...(data.annualGrantBtc !== undefined && { annualGrantBtc: undefined }),
        ...(data.totalGrants !== undefined && { totalGrants: undefined }),
        general: undefined
      },
      // Clear previous errors when form data changes to ensure next analysis is fresh
      error: null,
      lastError: null,
      partialDataAvailable: false
    }));
  },
  
  validateField: (field, value) => {
    const error = validateField(field, value);
    set((state) => ({
      formErrors: {
        ...state.formErrors,
        [field]: error || undefined
      }
    }));
  },
  
  validateAndFetch: async () => {
    const { address, vestingStartDate, annualGrantBtc, totalGrants, retryCount, enablePerformanceOptimizations, isLoading } = get();
    
    // Prevent multiple concurrent operations
    if (isLoading) {
      console.warn('Validation already in progress, ignoring duplicate request');
      return;
    }
    
    // Properly cleanup previous AbortController
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    
    // Clear any pending timers from price fetcher
    OnChainPriceFetcher.clearBatchQueue();
    
    // Create new AbortController for this operation
    abortController = new AbortController();
    
    // Start performance monitoring
    const performanceId = PerformanceMonitor.startMeasurement('validateAndFetch');
    
    // Check memory usage and optimize if needed
    if (MemoryOptimizer.shouldOptimize()) {
      MemoryOptimizer.optimizeMemory();
    }
    
    // Clear performance caches to ensure fresh start
    clearAnnotationCache();
    
    // COMPLETELY reset all analysis state to ensure fresh start
    const currentRetryCount = retryCount;
    const isRetry = !!get().lastError; // If there was a previous error, this is a retry
    
    set({
      isLoading: true,
      error: null,
      currentStep: 'fetching',
      formErrors: {},
      rawTransactions: [],
      annotatedTransactions: [],
      expectedGrants: [],
      historicalPrices: {},
      manualAnnotations: new Map(),
      partialDataAvailable: false,
      lastError: null,
      retryCount: isRetry ? currentRetryCount + 1 : 0, // Increment for retries, reset for fresh analysis
      performanceMetrics: null,
      lastProcessingTimeMs: 0
    });
    
    try {
      // Validate form data
      const validation = validateTrackerForm({
        address,
        vestingStartDate,
        annualGrantBtc,
        totalGrants
      });
      
      if (!validation.success) {
        const validationError = new ValidationError('Please correct the form errors and try again');
        const userFriendlyError = errorHandler.createUserFriendlyError(validationError);
        
        set({
          formErrors: validation.errors || {},
          isLoading: false,
          currentStep: 'idle',
          error: userFriendlyError.message,
          lastError: validationError,
          lastProcessingTimeMs: PerformanceMonitor.endMeasurement(performanceId)
        });
        return;
      }
      
      // Use optimized concurrent processing if enabled
      if (enablePerformanceOptimizations) {
        await get().processWithConcurrentOptimizations(address, vestingStartDate, annualGrantBtc, totalGrants);
      } else {
        await get().processWithStandardAlgorithm(address, vestingStartDate, annualGrantBtc, totalGrants);
      }
      
      // Record performance metrics
      const processingTime = PerformanceMonitor.endMeasurement(performanceId);
      set(state => ({
        ...state,
        lastProcessingTimeMs: processingTime
      }));
      
    } catch (error) {
      const processingTime = PerformanceMonitor.endMeasurement(performanceId);
      const processedError = errorHandler.processError(error, {
        operation: 'validateAndFetch',
        step: get().currentStep,
        address,
        timestamp: new Date().toISOString()
      });
      
      const userFriendlyError = errorHandler.createUserFriendlyError(processedError);
      
      // Handle validation errors specially
      if (ErrorUtils.isUserInputError(processedError)) {
        const field = ErrorUtils.getValidationField(processedError as ValidationError);
        set({
          formErrors: field ? { [field]: userFriendlyError.message } : {},
          isLoading: false,
          currentStep: 'idle',
          error: userFriendlyError.message,
          lastError: processedError,
          lastProcessingTimeMs: processingTime
        });
      } else {
        set({
          isLoading: false,
          currentStep: 'idle',
          error: userFriendlyError.message,
          lastError: processedError,
          lastProcessingTimeMs: processingTime
        });
      }
    }
  },
  
  // Performance-optimized processing with concurrent operations
  processWithConcurrentOptimizations: async (address: string, vestingStartDate: string, annualGrantBtc: number, totalGrants: number) => {
    try {
      set({ currentStep: 'fetching' });
      
      // Use concurrent processing service with abort signal
      const result = await processOnChainDataConcurrently(
        address,
        vestingStartDate,
        annualGrantBtc,
        totalGrants,
        {
          maxConcurrentOperations: 5,
          batchSize: 10,
          enableRequestBatching: true,
          enableCaching: true,
          abortSignal: abortController?.signal,
        }
      );
      
      set({
        rawTransactions: result.transactions,
        annotatedTransactions: result.annotatedTransactions,
        expectedGrants: result.expectedGrants,
        historicalPrices: result.historicalPrices,
        performanceMetrics: result.performanceMetrics,
        isLoading: false,
        currentStep: 'complete',
        error: null
      });
      
    } catch (error) {
      throw error; // Re-throw to be handled by parent
    }
  },
  
  // Standard processing algorithm (fallback)
  processWithStandardAlgorithm: async (address: string, vestingStartDate: string, annualGrantBtc: number, totalGrants: number) => {
    // Step 1: Fetch transactions
    set({ currentStep: 'fetching' });
    const rawTransactions = await errorHandler.executeWithRetry(
      () => mempoolAPI.fetchTransactions(address, abortController?.signal),
      {
        operation: 'transaction_fetch',
        step: 'fetch_transactions',
        address,
        timestamp: new Date().toISOString()
      }
    );
    
    if (!rawTransactions || rawTransactions.length === 0) {
      set({
        isLoading: false,
        currentStep: 'complete',
        rawTransactions: [],
        annotatedTransactions: [],
        expectedGrants: generateExpectedGrants(vestingStartDate, annualGrantBtc, totalGrants)
      });
      return;
    }
    
    set({ rawTransactions });
    
    // Step 2: Annotate transactions
    set({ currentStep: 'annotating' });
    const annotationResult = await annotateTransactionsWithPerformance(
      rawTransactions,
      address,
      vestingStartDate,
      annualGrantBtc,
      totalGrants,
      undefined,
      true // Use optimized version
    );
    
    // Convert performance metrics to match expected interface
    const standardPerformanceMetrics: ConcurrentProcessingMetrics = {
      totalOperationTimeMs: annotationResult.performanceMetrics?.processingTimeMs || 0,
      transactionFetchTimeMs: 0, // Not tracked in standard algorithm
      priceFetchTimeMs: 0, // Will be updated later
      annotationTimeMs: annotationResult.performanceMetrics?.processingTimeMs || 0,
      concurrentOperationsUsed: annotationResult.performanceMetrics?.batchProcessingEnabled || false,
      batchingEfficiency: 0.8, // Default estimate
      cacheHitRate: annotationResult.performanceMetrics?.cacheHitRate || 0,
      apiCallsOptimized: 0, // Not tracked in standard algorithm
      memoryUsageMB: 0 // Not tracked in standard algorithm
    };
    
    set({
      annotatedTransactions: annotationResult.annotatedTransactions,
      expectedGrants: annotationResult.expectedGrants,
      performanceMetrics: standardPerformanceMetrics
    });
    
    // Step 3: Fetch historical prices
    set({ currentStep: 'pricing' });
    const uniqueDates = OnChainPriceFetcher.optimizePriceRequests(rawTransactions);
    
    if (uniqueDates.length > 0) {
      try {
        const historicalPrices = await errorHandler.executeWithRetry(
          () => OnChainPriceFetcher.fetchBatchPrices(uniqueDates),
          {
            operation: 'price_fetch',
            step: 'fetch_historical_prices',
            address,
            timestamp: new Date().toISOString()
          }
        );
        
        // Update annotated transactions with price data
        const transactionsWithPrices = annotationResult.annotatedTransactions.map(tx => ({
          ...tx,
          valueAtTimeOfTx: historicalPrices[tx.date] ? 
            Math.round(tx.amountBTC * historicalPrices[tx.date] * 100) / 100 : 
            null
        }));
        
        set({
          historicalPrices,
          annotatedTransactions: transactionsWithPrices
        });
      } catch (priceError) {
        const partialError = new PartialDataError(
          'Historical prices unavailable',
          'transaction data and annotations',
          'historical USD values'
        );
        
        set({
          partialDataAvailable: true,
          lastError: partialError,
          error: 'Price data unavailable - continuing with Bitcoin amounts only'
        });
      }
    }
    
    set({
      isLoading: false,
      currentStep: 'complete',
      error: null
    });
  },
  
  updateManualAnnotation: (txid, grantYear) => {
    const { annotatedTransactions, expectedGrants, manualAnnotations, enablePerformanceOptimizations } = get();
    
    // Update manual annotations map
    const newManualAnnotations = new Map(manualAnnotations);
    newManualAnnotations.set(txid, grantYear);
    
    // Use optimized version if performance optimizations are enabled
    const applyFunction = enablePerformanceOptimizations 
      ? applyManualAnnotationsOptimized
      : applyManualAnnotations;
    
    // Apply manual annotations
    const { annotatedTransactions: updatedTransactions, expectedGrants: updatedGrants } = 
      applyFunction(annotatedTransactions, expectedGrants, newManualAnnotations);
    
    // Update transactions with price data if available
    const { historicalPrices } = get();
    const transactionsWithPrices = updatedTransactions.map(tx => ({
      ...tx,
      valueAtTimeOfTx: historicalPrices[tx.date] ? 
        Math.round(tx.amountBTC * historicalPrices[tx.date] * 100) / 100 : 
        tx.valueAtTimeOfTx
    }));
    
    set({
      manualAnnotations: newManualAnnotations,
      annotatedTransactions: transactionsWithPrices,
      expectedGrants: updatedGrants
    });
  },
  
  resetTracker: () => {
    // Cancel any ongoing operations first
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    
    // Clear any pending batch operations
    OnChainPriceFetcher.clearBatchQueue();
    
    // Clear all intervals and timers to prevent memory leaks
    pendingTimers.forEach(timer => clearTimeout(timer));
    pendingTimers.clear();
    
    // Clear performance caches when resetting
    try {
      clearAnnotationCache();
      MemoryOptimizer.optimizeMemory();
      PerformanceMonitor.clearMeasurements();
      OnChainPriceFetcher.clearCache();
      
      // Reset concurrent processing service singleton
      ConcurrentProcessingService.resetInstance();
    } catch (error) {
      console.warn('Error clearing caches during reset:', error);
    }
    
    set({
      address: '',
      vestingStartDate: '',
      annualGrantBtc: 0,
      totalGrants: 5, // Reset to default value
      formErrors: {},
      rawTransactions: [],
      annotatedTransactions: [],
      expectedGrants: [],
      historicalPrices: {},
      manualAnnotations: new Map(),
      isLoading: false,
      error: null,
      currentStep: 'idle',
      partialDataAvailable: false,
      lastError: null,
      retryCount: 0,
      performanceMetrics: null,
      lastProcessingTimeMs: 0
    });
  },
  
  retryOperation: async () => {
    // validateAndFetch will handle the retry logic automatically
    await get().validateAndFetch();
  },
  
  continueWithPartialData: () => {
    set({
      partialDataAvailable: false,
      error: null,
      currentStep: 'complete'
    });
  },
  
  handleError: (error: unknown, operation: string, step: string) => {
    const processedError = errorHandler.processError(error, {
      operation,
      step,
      address: get().address,
      timestamp: new Date().toISOString()
    });
    
    const userFriendlyError = errorHandler.createUserFriendlyError(processedError);
    
    set({
      error: userFriendlyError.message,
      lastError: processedError,
      isLoading: false
    });
  },
  
  clearError: () => {
    set({
      error: null,
      lastError: null,
      partialDataAvailable: false
    });
  },
  
  togglePerformanceOptimizations: () => {
    set(state => ({
      enablePerformanceOptimizations: !state.enablePerformanceOptimizations
    }));
  },
  
  clearPerformanceCaches: () => {
    clearAnnotationCache();
    OnChainPriceFetcher.clearCache();
    OnChainPriceFetcher.clearBatchQueue();
    MemoryOptimizer.optimizeMemory();
    PerformanceMonitor.clearMeasurements();
    ConcurrentProcessingService.resetInstance();
  },
  
  getPerformanceStats: () => {
    const { performanceMetrics, lastProcessingTimeMs } = get();
    return {
      lastProcessingTimeMs,
      performanceMetrics,
      memoryInfo: MemoryOptimizer.getMemoryInfo(),
      cacheStats: OnChainPriceFetcher.getCacheStats(),
      performanceMeasurements: PerformanceMonitor.getAllMeasurements()
    };
  }
}));

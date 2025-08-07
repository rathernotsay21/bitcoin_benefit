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
  MemoryOptimizer
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
  processWithConcurrentOptimizations: (address: string, vestingStartDate: string, annualGrantBtc: number) => Promise<void>;
  processWithStandardAlgorithm: (address: string, vestingStartDate: string, annualGrantBtc: number) => Promise<void>;
}

export const useOnChainStore = create<OnChainState>((set, get) => ({
  // Initial state
  address: '',
  vestingStartDate: '',
  annualGrantBtc: 0,
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
      // Clear errors for updated fields
      formErrors: {
        ...state.formErrors,
        ...(data.address !== undefined && { address: undefined }),
        ...(data.vestingStartDate !== undefined && { vestingStartDate: undefined }),
        ...(data.annualGrantBtc !== undefined && { annualGrantBtc: undefined }),
        general: undefined
      }
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
    const { address, vestingStartDate, annualGrantBtc, retryCount, enablePerformanceOptimizations } = get();
    
    // Start performance monitoring
    const performanceId = PerformanceMonitor.startMeasurement('validateAndFetch');
    
    // Check memory usage and optimize if needed
    if (MemoryOptimizer.shouldOptimize()) {
      MemoryOptimizer.optimizeMemory();
    }
    
    // Reset state
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
      retryCount: retryCount + 1
    });
    
    try {
      // Validate form data
      const validation = validateTrackerForm({
        address,
        vestingStartDate,
        annualGrantBtc
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
        await get().processWithConcurrentOptimizations(address, vestingStartDate, annualGrantBtc);
      } else {
        await get().processWithStandardAlgorithm(address, vestingStartDate, annualGrantBtc);
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
  processWithConcurrentOptimizations: async (address: string, vestingStartDate: string, annualGrantBtc: number) => {
    try {
      set({ currentStep: 'fetching' });
      
      // Use concurrent processing service
      const result = await processOnChainDataConcurrently(
        address,
        vestingStartDate,
        annualGrantBtc,
        {
          maxConcurrentOperations: 5,
          batchSize: 10,
          enableRequestBatching: true,
          enableCaching: true,
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
  processWithStandardAlgorithm: async (address: string, vestingStartDate: string, annualGrantBtc: number) => {
    // Step 1: Fetch transactions
    set({ currentStep: 'fetching' });
    const rawTransactions = await errorHandler.executeWithRetry(
      () => mempoolAPI.fetchTransactions(address),
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
        expectedGrants: generateExpectedGrants(vestingStartDate, annualGrantBtc)
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
    // Clear performance caches when resetting
    clearAnnotationCache();
    MemoryOptimizer.optimizeMemory();
    
    set({
      address: '',
      vestingStartDate: '',
      annualGrantBtc: 0,
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
    const { validateAndFetch, clearError } = get();
    clearError();
    await validateAndFetch();
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
    MemoryOptimizer.optimizeMemory();
    PerformanceMonitor.clearMeasurements();
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

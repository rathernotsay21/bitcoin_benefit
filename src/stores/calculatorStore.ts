import { create } from 'zustand';
import { CalculationInputs, VestingCalculationResult, VestingScheme } from '@/types/vesting';
import { VestingCalculator } from '@/lib/vesting-calculations';
import { OptimizedBitcoinAPI } from '@/lib/bitcoin-api-optimized';
import { VESTING_SCHEMES } from '@/lib/vesting-schemes';
import { debounce, DebouncedFunction } from '@/lib/utils/debounce';
import { syncBitcoinPrice } from '@/lib/utils/store-sync';
import { trackClarityEvent, ClarityEvents, trackCalculatorEvent } from '@/lib/analytics/clarity-events';

interface CalculatorState {
  // Input state
  selectedScheme: VestingScheme | null;
  inputs: Partial<CalculationInputs>;
  
  // Results state
  results: VestingCalculationResult | null;
  isCalculating: boolean;
  
  // Bitcoin price state
  currentBitcoinPrice: number;
  bitcoinChange24h: number;
  isLoadingPrice: boolean;
  
  // Static data state
  staticDataLoaded: boolean;
  staticCalculations: Record<string, VestingCalculationResult>;
  
  // Scheme customization
  schemeCustomizations: Record<string, Partial<VestingScheme>>;
  
  // Debounced functions
  debouncedCalculate: DebouncedFunction<() => void> | null;
  debouncedSchemeCalculate: DebouncedFunction<() => void> | null;
  
  // Actions
  setSelectedScheme: (scheme: VestingScheme) => void;
  updateInputs: (inputs: Partial<CalculationInputs>) => void;
  calculateResults: () => void;
  setBitcoinPrice: (price: number, change24h: number) => void;
  fetchBitcoinPrice: () => Promise<void>;
  resetCalculator: () => void;
  updateSchemeCustomization: (schemeId: string, customization: Partial<VestingScheme>) => void;
  addCustomVestingEvent: (schemeId: string, event: import('@/types/vesting').CustomVestingEvent) => void;
  removeCustomVestingEvent: (schemeId: string, eventId: string) => void;
  updateCustomVestingEvent: (schemeId: string, eventId: string, updates: Partial<import('@/types/vesting').CustomVestingEvent>) => void;
  getEffectiveScheme: (scheme: VestingScheme) => VestingScheme;
  loadStaticData: () => Promise<void>;
  cleanup: () => void;
}

// Static data cache
let staticDataCache: {
  bitcoinPrice?: { price: number; change24h: number; timestamp: number };
  calculations?: Record<string, VestingCalculationResult>;
} = {};

export const useCalculatorStore = create<CalculatorState>((set, get) => {
  // Create debounced functions that will be initialized after store creation
  let debouncedCalculate: DebouncedFunction<() => void> | null = null;
  let debouncedSchemeCalculate: DebouncedFunction<() => void> | null = null;

  // Initialize debounced functions once to prevent recreation
  const initDebouncedFunctions = (() => {
    let initialized = false;
    let functions: { debouncedCalculate: DebouncedFunction<() => void>; debouncedSchemeCalculate: DebouncedFunction<() => void> };
    
    return () => {
      if (!initialized) {
        functions = {
          debouncedCalculate: debounce(() => {
            const state = get();
            state.calculateResults();
          }, 500), // Increased debounce time
          debouncedSchemeCalculate: debounce(() => {
            const state = get();
            state.calculateResults();
          }, 200)
        };
        initialized = true;
      }
      return functions;
    };
  })();

  return {
    // Initial state
    selectedScheme: VESTING_SCHEMES.find(scheme => scheme.id === 'accelerator') || null,
    inputs: {
      projectedBitcoinGrowth: 15,
    },
    results: null,
    isCalculating: false,
    currentBitcoinPrice: 45000,
    bitcoinChange24h: 0,
    isLoadingPrice: false,
    staticDataLoaded: false,
    staticCalculations: {},
    schemeCustomizations: {},
    debouncedCalculate: null,
    debouncedSchemeCalculate: null,
  
    // Actions
    setSelectedScheme: (scheme) => {
      const { debouncedSchemeCalculate } = initDebouncedFunctions();
      const previousScheme = get().selectedScheme;
      
      set({ selectedScheme: scheme });
      
      // Track scheme selection
      if (previousScheme && previousScheme.id !== scheme.id) {
        trackClarityEvent(ClarityEvents.VESTING_SCHEME_CHANGED, {
          from: previousScheme.id,
          to: scheme.id,
          schemeName: scheme.name,
        });
      } else {
        trackClarityEvent(ClarityEvents.VESTING_SCHEME_SELECTED, {
          scheme: scheme.id,
          schemeName: scheme.name,
        });
      }
      
      // Check if we have static calculation for this scheme
      const state = get();
      if (state.staticDataLoaded && state.staticCalculations[scheme.id]) {
        // Use static calculation immediately for instant display
        set({ results: state.staticCalculations[scheme.id] });
      }
      
      // Auto-calculate with current inputs using debounced function
      debouncedSchemeCalculate();
    },
  
    updateInputs: (newInputs) => {
      const { debouncedCalculate } = initDebouncedFunctions();
      
      set((state) => {
        // Only update if values actually changed to prevent unnecessary re-renders
        const hasChanged = Object.keys(newInputs).some(
          key => state.inputs[key as keyof typeof state.inputs] !== newInputs[key as keyof typeof newInputs]
        );
        
        if (!hasChanged) return state;
        
        return {
          inputs: { ...state.inputs, ...newInputs }
        };
      });
      
      // Auto-calculate with proper debounce
      debouncedCalculate();
    },
  
  calculateResults: () => {
    const { selectedScheme, inputs, currentBitcoinPrice, getEffectiveScheme, results } = get();
    
    if (!selectedScheme) {
      set({ results: null });
      return;
    }
    
    const schemeToUse = getEffectiveScheme(selectedScheme);
    
    // Check if we need to recalculate - avoid unnecessary computations
    const fullInputs: CalculationInputs = {
      scheme: schemeToUse,
      currentBitcoinPrice,
      projectedBitcoinGrowth: inputs.projectedBitcoinGrowth || 15,
    };
    
    // Simple hash for input comparison
    const inputHash = JSON.stringify({
      schemeId: schemeToUse.id,
      price: currentBitcoinPrice,
      growth: fullInputs.projectedBitcoinGrowth
    });
    
    // Skip calculation if inputs haven't changed
    if (results && (results as any).inputHash === inputHash) {
      return;
    }
    
    set({ isCalculating: true });
    
    // Use requestIdleCallback for non-blocking calculation
    const calculate = () => {
      try {
        const newResults = VestingCalculator.calculate(fullInputs);
        // Store input hash for future comparison
        (newResults as any).inputHash = inputHash;
        set({ results: newResults, isCalculating: false });
        
        // Track successful calculation
        trackCalculatorEvent('complete', {
          scheme: schemeToUse.id,
          growthRate: fullInputs.projectedBitcoinGrowth,
          amount: schemeToUse.grantAmount,
        });
      } catch (error) {
        console.error('Calculation error:', error);
        set({ results: null, isCalculating: false });
        
        // Track calculation error
        trackClarityEvent(ClarityEvents.CALCULATOR_ERROR, {
          error: error instanceof Error ? error.message : 'Unknown error',
          scheme: schemeToUse.id,
        });
      }
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(calculate, { timeout: 100 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(calculate, 0);
    }
  },
  
  setBitcoinPrice: (price, change24h) => {
    const state = get();
    
    // Ensure values are valid numbers
    const validPrice = typeof price === 'number' && !isNaN(price) ? price : 45000;
    const validChange = typeof change24h === 'number' && !isNaN(change24h) ? change24h : 0;
    
    // Only update if price actually changed (prevent unnecessary re-renders)
    if (state.currentBitcoinPrice === validPrice && state.bitcoinChange24h === validChange) {
      return;
    }
    
    // Use sync utility to update all stores
    syncBitcoinPrice(validPrice, validChange);
  },
  
  fetchBitcoinPrice: async () => {
    set({ isLoadingPrice: true });
    try {
      const { price, change24h } = await OptimizedBitcoinAPI.getCurrentPrice();
      // Use sync utility to update all stores
      syncBitcoinPrice(price, change24h);
      set({ isLoadingPrice: false });
    } catch (error) {
      console.error('Failed to fetch Bitcoin price:', error);
      set({ isLoadingPrice: false });
    }
  },
  
  loadStaticData: async () => {
    // Use optimized API to initialize with static data first
    try {
      const staticBitcoinData = await OptimizedBitcoinAPI.initializeWithStaticData();
      set({
        currentBitcoinPrice: staticBitcoinData.price,
        bitcoinChange24h: staticBitcoinData.change24h,
      });
    } catch (error) {
      console.warn('Failed to load static Bitcoin data:', error);
    }
    
    // Check cache first
    if (staticDataCache.bitcoinPrice && staticDataCache.calculations) {
      const { bitcoinPrice, calculations } = staticDataCache;
      set({
        currentBitcoinPrice: bitcoinPrice.price,
        bitcoinChange24h: bitcoinPrice.change24h,
        staticCalculations: calculations,
        staticDataLoaded: true,
      });
      
      // Auto-load default calculation if available
      const { selectedScheme } = get();
      if (selectedScheme && calculations[selectedScheme.id]) {
        set({ results: calculations[selectedScheme.id] });
      }
      
      return;
    }
    
    try {
      // Load static calculations and Bitcoin price in parallel
      const [calculationsResponse, bitcoinData] = await Promise.allSettled([
        fetch('/data/static-calculations.json', {
          credentials: 'same-origin',
          mode: 'cors'
        }),
        OptimizedBitcoinAPI.getCurrentPrice()
      ]);
      
      // Process static calculations
      if (calculationsResponse.status === 'fulfilled' && calculationsResponse.value.ok) {
        const calculationsData = await calculationsResponse.value.json();
        staticDataCache.calculations = calculationsData.calculations;
        set({
          staticCalculations: calculationsData.calculations,
          staticDataLoaded: true,
        });
        
        // Auto-load default calculation if available
        const { selectedScheme } = get();
        if (selectedScheme && calculationsData.calculations[selectedScheme.id]) {
          set({ results: calculationsData.calculations[selectedScheme.id] });
        }
      }
      
      // Process Bitcoin price (already fetched in parallel)
      if (bitcoinData.status === 'fulfilled' && bitcoinData.value) {
        staticDataCache.bitcoinPrice = {
          price: bitcoinData.value.price,
          change24h: bitcoinData.value.change24h,
          timestamp: Date.now()
        };
        set({
          currentBitcoinPrice: bitcoinData.value.price,
          bitcoinChange24h: bitcoinData.value.change24h,
        });
      }
      
    } catch (error) {
      console.warn('Failed to load static data, using defaults:', error);
      set({ staticDataLoaded: true });
    }
  },
  
    resetCalculator: () => {
      // Cancel any pending debounced calculations
      if (debouncedCalculate) {
        debouncedCalculate.cancel();
      }
      if (debouncedSchemeCalculate) {
        debouncedSchemeCalculate.cancel();
      }
      
      set({
        selectedScheme: VESTING_SCHEMES.find(scheme => scheme.id === 'accelerator') || null,
        inputs: {
          projectedBitcoinGrowth: 15,
        },
        results: null,
        isCalculating: false,
        schemeCustomizations: {},
      });
    },
  
    updateSchemeCustomization: (schemeId, customization) => {
      const { debouncedCalculate } = initDebouncedFunctions();
      
      set((state) => ({
        schemeCustomizations: {
          ...state.schemeCustomizations,
          [schemeId]: {
            ...state.schemeCustomizations[schemeId],
            ...customization
          }
        }
      }));
      
      // Use debounced calculation
      debouncedCalculate();
    },
    
    addCustomVestingEvent: (schemeId, event) => {
      const { debouncedCalculate } = initDebouncedFunctions();
      
      set((state) => {
        const currentCustomization = state.schemeCustomizations[schemeId] || {};
        const currentEvents = currentCustomization.customVestingEvents || [];
        
        return {
          schemeCustomizations: {
            ...state.schemeCustomizations,
            [schemeId]: {
              ...currentCustomization,
              customVestingEvents: [...currentEvents, event]
            }
          }
        };
      });
      
      debouncedCalculate();
    },
    
    removeCustomVestingEvent: (schemeId, eventId) => {
      const { debouncedCalculate } = initDebouncedFunctions();
      
      set((state) => {
        const currentCustomization = state.schemeCustomizations[schemeId] || {};
        const currentEvents = currentCustomization.customVestingEvents || [];
        
        return {
          schemeCustomizations: {
            ...state.schemeCustomizations,
            [schemeId]: {
              ...currentCustomization,
              customVestingEvents: currentEvents.filter(e => e.id !== eventId)
            }
          }
        };
      });
      
      debouncedCalculate();
    },
    
    updateCustomVestingEvent: (schemeId, eventId, updates) => {
      const { debouncedCalculate } = initDebouncedFunctions();
      
      set((state) => {
        const currentCustomization = state.schemeCustomizations[schemeId] || {};
        const currentEvents = currentCustomization.customVestingEvents || [];
        
        return {
          schemeCustomizations: {
            ...state.schemeCustomizations,
            [schemeId]: {
              ...currentCustomization,
              customVestingEvents: currentEvents.map(e => 
                e.id === eventId ? { ...e, ...updates } : e
              )
            }
          }
        };
      });
      
      debouncedCalculate();
    },
  
    getEffectiveScheme: (scheme) => {
      const { schemeCustomizations } = get();
      const customization = schemeCustomizations[scheme.id];
      
      if (!customization) {
        return scheme;
      }
      
      return {
        ...scheme,
        ...customization
      };
    },
    
    cleanup: () => {
      // Cancel all pending debounced operations
      const { debouncedCalculate, debouncedSchemeCalculate } = initDebouncedFunctions();
      debouncedCalculate.cancel();
      debouncedSchemeCalculate.cancel();
    },
  };
});

import { create } from 'zustand';
import { CalculationInputs, VestingCalculationResult, VestingScheme } from '@/types/vesting';
import { VestingCalculator } from '@/lib/vesting-calculations';
import { OptimizedBitcoinAPI } from '@/lib/bitcoin-api-optimized';
import { VESTING_SCHEMES } from '@/lib/vesting-schemes';
import { debounce, DebouncedFunction } from '@/lib/utils/debounce';
import { syncBitcoinPrice } from '@/lib/utils/store-sync';

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

  // Initialize debounced functions after get() is available
  const initDebouncedFunctions = () => {
    if (!debouncedCalculate) {
      debouncedCalculate = debounce(() => {
        get().calculateResults();
      }, 300);
    }
    if (!debouncedSchemeCalculate) {
      debouncedSchemeCalculate = debounce(() => {
        get().calculateResults();
      }, 100);
    }
    return { debouncedCalculate, debouncedSchemeCalculate };
  };

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
      const { debouncedCalculate: debounced, debouncedSchemeCalculate: schemeDebounced } = initDebouncedFunctions();
      
      set({ selectedScheme: scheme });
      
      // Check if we have static calculation for this scheme
      const { staticCalculations, staticDataLoaded } = get();
      if (staticDataLoaded && staticCalculations[scheme.id]) {
        // Use static calculation immediately for instant display
        set({ results: staticCalculations[scheme.id] });
      }
      
      // Auto-calculate with current inputs using debounced function
      schemeDebounced();
    },
  
    updateInputs: (newInputs) => {
      const { debouncedCalculate: debounced } = initDebouncedFunctions();
      
      set((state) => ({
        inputs: { ...state.inputs, ...newInputs }
      }));
      
      // Auto-calculate with proper debounce
      debounced();
    },
  
  calculateResults: () => {
    const { selectedScheme, inputs, currentBitcoinPrice, getEffectiveScheme } = get();
    
    if (!selectedScheme) {
      set({ results: null });
      return;
    }
    
    const schemeToUse = getEffectiveScheme(selectedScheme);
    
    set({ isCalculating: true });
    
    try {
      const fullInputs: CalculationInputs = {
        scheme: schemeToUse,
        currentBitcoinPrice,
        projectedBitcoinGrowth: inputs.projectedBitcoinGrowth || 15,
      };
      
      const results = VestingCalculator.calculate(fullInputs);
      set({ results, isCalculating: false });
    } catch (error) {
      console.error('Calculation error:', error);
      set({ results: null, isCalculating: false });
    }
  },
  
  setBitcoinPrice: (price, change24h) => {
    // Use sync utility to update all stores
    syncBitcoinPrice(price, change24h);
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
        fetch('/data/static-calculations.json'),
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
      const { debouncedCalculate: debounced } = initDebouncedFunctions();
      
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
      debounced();
    },
    
    addCustomVestingEvent: (schemeId, event) => {
      const { debouncedCalculate: debounced } = initDebouncedFunctions();
      
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
      
      debounced();
    },
    
    removeCustomVestingEvent: (schemeId, eventId) => {
      const { debouncedCalculate: debounced } = initDebouncedFunctions();
      
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
      
      debounced();
    },
    
    updateCustomVestingEvent: (schemeId, eventId, updates) => {
      const { debouncedCalculate: debounced } = initDebouncedFunctions();
      
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
      
      debounced();
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
      if (debouncedCalculate) {
        debouncedCalculate.cancel();
      }
      if (debouncedSchemeCalculate) {
        debouncedSchemeCalculate.cancel();
      }
    },
  };
});

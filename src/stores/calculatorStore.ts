import { create } from 'zustand';
import { CalculationInputs, VestingCalculationResult, VestingScheme } from '@/types/vesting';
import { VestingCalculator } from '@/lib/vesting-calculations';
import { OptimizedBitcoinAPI } from '@/lib/bitcoin-api-optimized';
import { VESTING_SCHEMES } from '@/lib/vesting-schemes';

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
  
  // Actions
  setSelectedScheme: (scheme: VestingScheme) => void;
  updateInputs: (inputs: Partial<CalculationInputs>) => void;
  calculateResults: () => void;
  setBitcoinPrice: (price: number, change24h: number) => void;
  fetchBitcoinPrice: () => Promise<void>;
  resetCalculator: () => void;
  updateSchemeCustomization: (schemeId: string, customization: Partial<VestingScheme>) => void;
  getEffectiveScheme: (scheme: VestingScheme) => VestingScheme;
  loadStaticData: () => Promise<void>;
}

// Static data cache
let staticDataCache: {
  bitcoinPrice?: { price: number; change24h: number; timestamp: number };
  calculations?: Record<string, VestingCalculationResult>;
} = {};

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
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
  
  // Actions
  setSelectedScheme: (scheme) => {
    set({ selectedScheme: scheme });
    
    // Check if we have static calculation for this scheme
    const { staticCalculations, staticDataLoaded } = get();
    if (staticDataLoaded && staticCalculations[scheme.id]) {
      // Use static calculation immediately for instant display
      set({ results: staticCalculations[scheme.id] });
    }
    
    // Auto-calculate with current inputs
    setTimeout(() => {
      get().calculateResults();
    }, 100);
  },
  
  updateInputs: (newInputs) => {
    set((state) => ({
      inputs: { ...state.inputs, ...newInputs }
    }));
    
    // Auto-calculate with debounce
    setTimeout(() => {
      get().calculateResults();
    }, 300);
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
    set({ currentBitcoinPrice: price, bitcoinChange24h: change24h });
    get().calculateResults();
  },
  
  fetchBitcoinPrice: async () => {
    set({ isLoadingPrice: true });
    try {
      const { price, change24h } = await OptimizedBitcoinAPI.getCurrentPrice();
      set({ 
        currentBitcoinPrice: price, 
        bitcoinChange24h: change24h,
        isLoadingPrice: false 
      });
      get().calculateResults();
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
      // Load static calculations
      const calculationsResponse = await fetch('/data/static-calculations.json');
      if (calculationsResponse.ok) {
        const calculationsData = await calculationsResponse.json();
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
      
    } catch (error) {
      console.warn('Failed to load static data, using defaults:', error);
      set({ staticDataLoaded: true });
    }
  },
  
  resetCalculator: () => {
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
    set((state) => ({
      schemeCustomizations: {
        ...state.schemeCustomizations,
        [schemeId]: {
          ...state.schemeCustomizations[schemeId],
          ...customization
        }
      }
    }));
    get().calculateResults();
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
}));

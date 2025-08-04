import { create } from 'zustand';
import { CalculationInputs, VestingCalculationResult, VestingScheme } from '@/types/vesting';
import { VestingCalculator } from '@/lib/vesting-calculations';
import { BitcoinAPI } from '@/lib/bitcoin-api';
import { CUSTOM_SCHEME } from '@/lib/vesting-schemes';

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
  
  // Scheme customization
  isCustomMode: boolean;
  customScheme: VestingScheme | null;
  schemeCustomizations: Record<string, Partial<VestingScheme>>;
  
  // Actions
  setSelectedScheme: (scheme: VestingScheme) => void;
  updateInputs: (inputs: Partial<CalculationInputs>) => void;
  calculateResults: () => void;
  setBitcoinPrice: (price: number, change24h: number) => void;
  fetchBitcoinPrice: () => Promise<void>;
  resetCalculator: () => void;
  setCustomMode: (enabled: boolean) => void;
  updateCustomScheme: (scheme: Partial<VestingScheme>) => void;
  updateSchemeCustomization: (schemeId: string, customization: Partial<VestingScheme>) => void;
  getEffectiveScheme: (scheme: VestingScheme) => VestingScheme;
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  // Initial state
  selectedScheme: null,
  inputs: {
    projectedBitcoinGrowth: 15,
  },
  results: null,
  isCalculating: false,
  currentBitcoinPrice: 45000,
  bitcoinChange24h: 0,
  isLoadingPrice: false,
  isCustomMode: false,
  customScheme: null,
  schemeCustomizations: {},
  
  // Actions
  setSelectedScheme: (scheme) => {
    set({ selectedScheme: scheme, isCustomMode: scheme.id === 'custom' });
    // Auto-calculate if we have enough inputs
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
    const { selectedScheme, inputs, currentBitcoinPrice, customScheme, isCustomMode, getEffectiveScheme } = get();
    
    let schemeToUse: VestingScheme | null = null;
    
    if (isCustomMode) {
      schemeToUse = customScheme;
    } else if (selectedScheme) {
      schemeToUse = getEffectiveScheme(selectedScheme);
    }
    
    if (!schemeToUse) {
      set({ results: null });
      return;
    }
    
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
      const { price, change24h } = await BitcoinAPI.getCurrentPrice();
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
  
  resetCalculator: () => {
    set({
      selectedScheme: null,
      inputs: {
        projectedBitcoinGrowth: 15,
      },
      results: null,
      isCalculating: false,
      isCustomMode: false,
      customScheme: null,
      schemeCustomizations: {},
    });
  },
  
  setCustomMode: (enabled) => {
    set({ isCustomMode: enabled });
    if (enabled && !get().customScheme) {
      // Initialize custom scheme with CUSTOM_SCHEME defaults
      set({
        customScheme: { ...CUSTOM_SCHEME }
      });
    }
  },
  
  updateCustomScheme: (schemeUpdate) => {
    set((state) => ({
      customScheme: state.customScheme ? { ...state.customScheme, ...schemeUpdate } : null
    }));
    get().calculateResults();
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
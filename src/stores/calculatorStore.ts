import { create } from 'zustand';
import { CalculationInputs, VestingCalculationResult, VestingScheme } from '@/types/vesting';
import { VestingCalculator } from '@/lib/vesting-calculations';
import { BitcoinAPI } from '@/lib/bitcoin-api';
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
}

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
  schemeCustomizations: {},
  
  // Actions
  setSelectedScheme: (scheme) => {
    set({ selectedScheme: scheme });
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
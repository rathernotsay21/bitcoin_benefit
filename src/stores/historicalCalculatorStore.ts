import { create } from 'zustand';
import {
  VestingScheme,
  BitcoinYearlyPrices,
  CostBasisMethod,
  HistoricalCalculationResult,
  HistoricalCalculationInputs
} from '@/types/vesting';
import { HistoricalCalculator } from '@/lib/historical-calculations';
import { HistoricalBitcoinAPI } from '@/lib/historical-bitcoin-api';
import { OptimizedBitcoinAPI } from '@/lib/bitcoin-api-optimized';
import { HISTORICAL_VESTING_SCHEMES } from '@/lib/historical-vesting-schemes';

interface HistoricalCalculatorState {
  // Input state
  selectedScheme: VestingScheme | null;
  startingYear: number;
  costBasisMethod: CostBasisMethod;
  schemeCustomizations: Record<string, Partial<VestingScheme>>;
  
  // Historical data
  historicalPrices: Record<number, BitcoinYearlyPrices>;
  currentBitcoinPrice: number;
  isLoadingHistoricalData: boolean;
  historicalDataError: string | null;
  staticDataLoaded: boolean;
  
  // Results
  historicalResults: HistoricalCalculationResult | null;
  isCalculating: boolean;
  calculationError: string | null;
  
  // Actions
  setStartingYear: (year: number) => void;
  setCostBasisMethod: (method: CostBasisMethod) => void;
  setSelectedScheme: (scheme: VestingScheme) => void;
  updateSchemeCustomization: (schemeId: string, customization: Partial<VestingScheme>) => void;
  fetchHistoricalData: () => Promise<void>;
  fetchCurrentBitcoinPrice: () => Promise<void>;
  calculateHistoricalResults: () => void;
  resetCalculator: () => void;
  getEffectiveScheme: (scheme: VestingScheme) => VestingScheme;
  loadStaticData: () => Promise<void>;
}

export const useHistoricalCalculatorStore = create<HistoricalCalculatorState>((set, get) => ({
  // Initial state
  selectedScheme: HISTORICAL_VESTING_SCHEMES.find(scheme => scheme.id === 'accelerator') || null,
  startingYear: 2020, // Default to 2020
  costBasisMethod: 'average',
  schemeCustomizations: {},
  
  // Historical data state
  historicalPrices: {},
  currentBitcoinPrice: 45000, // Default fallback price
  isLoadingHistoricalData: false,
  historicalDataError: null,
  staticDataLoaded: false,
  
  // Results state
  historicalResults: null,
  isCalculating: false,
  calculationError: null,
  
  // Actions
  setStartingYear: (year) => {
    set({ startingYear: year });
    
    // Auto-fetch historical data and recalculate
    setTimeout(() => {
      get().fetchHistoricalData();
    }, 100);
  },
  
  setCostBasisMethod: (method) => {
    set({ costBasisMethod: method });
    
    // Auto-recalculate with new method
    setTimeout(() => {
      get().calculateHistoricalResults();
    }, 100);
  },
  
  setSelectedScheme: (scheme) => {
    set({ selectedScheme: scheme });
    
    // Auto-calculate if we have enough data
    setTimeout(() => {
      get().calculateHistoricalResults();
    }, 100);
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
    
    // Auto-recalculate with new customization
    setTimeout(() => {
      get().calculateHistoricalResults();
    }, 100);
  },
  
  fetchHistoricalData: async () => {
    const { startingYear } = get();
    const currentYear = new Date().getFullYear();
    
    set({ 
      isLoadingHistoricalData: true, 
      historicalDataError: null 
    });
    
    try {
      // Fetch historical prices from starting year to current year
      const historicalPrices = await HistoricalBitcoinAPI.getYearlyPrices(
        startingYear, 
        currentYear
      );
      
      set({ 
        historicalPrices,
        isLoadingHistoricalData: false 
      });
      
      // Auto-calculate results after fetching data
      get().calculateHistoricalResults();
      
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      set({ 
        isLoadingHistoricalData: false,
        historicalDataError: error instanceof Error ? error.message : 'Failed to fetch historical data'
      });
    }
  },
  
  fetchCurrentBitcoinPrice: async () => {
    try {
      const { price } = await OptimizedBitcoinAPI.getCurrentPrice();
      set({ currentBitcoinPrice: price });
      
      // Auto-recalculate with new current price
      get().calculateHistoricalResults();
      
    } catch (error) {
      console.error('Failed to fetch current Bitcoin price:', error);
      // Keep existing price as fallback
    }
  },
  
  calculateHistoricalResults: () => {
    const {
      selectedScheme,
      startingYear,
      costBasisMethod,
      historicalPrices,
      currentBitcoinPrice,
      getEffectiveScheme
    } = get();
    
    // Clear previous results and errors
    set({ 
      historicalResults: null, 
      calculationError: null 
    });
    
    // Validate required inputs
    if (!selectedScheme) {
      return; // No scheme selected, nothing to calculate
    }
    
    if (Object.keys(historicalPrices).length === 0) {
      set({ 
        calculationError: 'Historical price data not available. Please try again.' 
      });
      return;
    }
    
    // Check if we have price data for the starting year
    if (!historicalPrices[startingYear]) {
      set({ 
        calculationError: `No historical price data available for ${startingYear}. Please select a different year.` 
      });
      return;
    }
    
    set({ isCalculating: true });
    
    try {
      const schemeToUse = getEffectiveScheme(selectedScheme);
      
      const inputs: HistoricalCalculationInputs = {
        scheme: schemeToUse,
        startingYear,
        costBasisMethod,
        historicalPrices,
        currentBitcoinPrice
      };
      
      const results = HistoricalCalculator.calculate(inputs);
      
      set({ 
        historicalResults: results,
        isCalculating: false 
      });
      
    } catch (error) {
      console.error('Historical calculation error:', error);
      set({ 
        isCalculating: false,
        calculationError: error instanceof Error ? error.message : 'Calculation failed'
      });
    }
  },
  
  resetCalculator: () => {
    set({
      selectedScheme: HISTORICAL_VESTING_SCHEMES.find(scheme => scheme.id === 'accelerator') || null,
      startingYear: 2020,
      costBasisMethod: 'average',
      schemeCustomizations: {},
      historicalPrices: {},
      historicalResults: null,
      isCalculating: false,
      calculationError: null,
      historicalDataError: null,
      isLoadingHistoricalData: false
    });
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
  
  loadStaticData: async () => {
    try {
      // Load static historical data
      const historicalResponse = await fetch('/data/historical-bitcoin.json');
      if (historicalResponse.ok) {
        const historicalData = await historicalResponse.json();
        set({
          historicalPrices: historicalData,
          staticDataLoaded: true,
        });
      }
      
      // Load current Bitcoin price using optimized API
      const staticBitcoinData = await OptimizedBitcoinAPI.getStaticPrice();
      set({
        currentBitcoinPrice: staticBitcoinData.price,
      });
      
    } catch (error) {
      console.warn('Failed to load static historical data, will fetch from API:', error);
      set({ staticDataLoaded: true });
    }
  },
}));
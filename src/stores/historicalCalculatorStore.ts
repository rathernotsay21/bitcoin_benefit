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
import { debounce, DebouncedFunction } from '@/lib/utils/debounce';
import { syncBitcoinPrice } from '@/lib/utils/store-sync';

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
  
  // Debounced functions
  debouncedCalculate: DebouncedFunction<() => void> | null;
  debouncedFetch: DebouncedFunction<() => Promise<void>> | null;
  
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
  cleanup: () => void;
}

export const useHistoricalCalculatorStore = create<HistoricalCalculatorState>((set, get) => {
  // Create debounced functions that will be initialized after store creation
  let debouncedCalculate: DebouncedFunction<() => void> | null = null;
  let debouncedFetch: DebouncedFunction<() => Promise<void>> | null = null;

  // Optimized debounced functions with singleton pattern
  const getDebouncedFunctions = () => {
    if (!debouncedCalculate) {
      debouncedCalculate = debounce(() => {
        get().calculateHistoricalResults();
      }, 150); // Slightly longer debounce for historical calculations
    }
    if (!debouncedFetch) {
      debouncedFetch = debounce(async () => {
        await get().fetchHistoricalData();
      }, 300); // Longer debounce for expensive data fetching
    }
    return { debouncedCalculate, debouncedFetch };
  };

  return {
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
    
    // Debounced functions
    debouncedCalculate: null,
    debouncedFetch: null,
  
    // Actions
    setStartingYear: (year) => {
      const currentYear = get().startingYear;
      
      // Early return if same year to prevent unnecessary operations
      if (currentYear === year) return;
      
      const { debouncedFetch } = getDebouncedFunctions();
      set({ startingYear: year });
      
      // Auto-fetch historical data and recalculate with debounce
      debouncedFetch();
    },
    
    setCostBasisMethod: (method) => {
      const { debouncedCalculate } = getDebouncedFunctions();
      
      set({ costBasisMethod: method });
      
      // Auto-recalculate with new method using debounce
      debouncedCalculate();
    },
    
    setSelectedScheme: (scheme) => {
      const { debouncedCalculate } = getDebouncedFunctions();
      
      set({ selectedScheme: scheme });
      
      // Auto-calculate if we have enough data using debounce
      debouncedCalculate();
    },
    
    updateSchemeCustomization: (schemeId, customization) => {
      const { debouncedCalculate } = getDebouncedFunctions();
      
      set((state) => ({
        schemeCustomizations: {
          ...state.schemeCustomizations,
          [schemeId]: {
            ...state.schemeCustomizations[schemeId],
            ...customization
          }
        }
      }));
      
      // Auto-recalculate with new customization using debounce
      debouncedCalculate();
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
      const { price, change24h } = await OptimizedBitcoinAPI.getCurrentPrice();
      // Use sync utility to update all stores
      syncBitcoinPrice(price, change24h);
      
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
    
    // Validate that all price data has required fields
    for (const [year, priceData] of Object.entries(historicalPrices)) {
      if (!priceData || typeof priceData !== 'object' || !priceData.year) {
        set({ 
          calculationError: `Invalid price data structure for year ${year}. Please refresh and try again.` 
        });
        return;
      }
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
      // Cancel any pending debounced operations
      if (debouncedCalculate) {
        debouncedCalculate.cancel();
      }
      if (debouncedFetch) {
        debouncedFetch.cancel();
      }
      
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
      // Load historical data and Bitcoin price in parallel
      const [historicalResponse, staticBitcoinData] = await Promise.allSettled([
        fetch('/data/historical-bitcoin.json', {
          credentials: 'same-origin',
          mode: 'cors'
        }),
        OptimizedBitcoinAPI.getStaticPrice()
      ]);
      
      // Process historical data
      if (historicalResponse.status === 'fulfilled' && historicalResponse.value.ok) {
        const historicalData = await historicalResponse.value.json();
        set({
          historicalPrices: historicalData,
          staticDataLoaded: true,
        });
      }
      
      // Process Bitcoin price (already fetched in parallel)
      if (staticBitcoinData.status === 'fulfilled' && staticBitcoinData.value) {
        set({
          currentBitcoinPrice: staticBitcoinData.value.price,
        });
      }
      
    } catch (error) {
      console.warn('Failed to load static historical data, will fetch from API:', error);
      set({ staticDataLoaded: true });
    }
  },
    
    cleanup: () => {
      // Cancel all pending debounced operations
      if (debouncedCalculate) {
        debouncedCalculate.cancel();
      }
      if (debouncedFetch) {
        debouncedFetch.cancel();
      }
    },
  };
});
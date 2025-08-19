import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  LoadingState, 
  ToolError, 
  TransactionStatus, 
  FeeRecommendation, 
  NetworkHealth, 
  AddressInfo,
  TimestampResult 
} from '@/types/bitcoin-tools';

// Rate limiting state
interface RateLimit {
  count: number;
  resetTime: number;
}

// Tool-specific states
interface ToolStates {
  transactionLookup: {
    loading: LoadingState;
    error: ToolError | null;
    data: TransactionStatus | null;
    lastTxid: string;
  };
  feeCalculator: {
    loading: LoadingState;
    error: ToolError | null;
    data: FeeRecommendation[] | null;
    txSize: number;
    selectedTier: 'economy' | 'balanced' | 'priority' | null;
  };
  networkStatus: {
    loading: LoadingState;
    error: ToolError | null;
    data: NetworkHealth | null;
    lastUpdate: number;
  };
  addressExplorer: {
    loading: LoadingState;
    error: ToolError | null;
    data: AddressInfo | null;
    lastAddress: string;
    currentPage: number;
  };
  documentTimestamp: {
    loading: LoadingState;
    error: ToolError | null;
    data: TimestampResult | null;
    uploadedFile: File | null;
  };
}

interface BitcoinToolsStore {
  // Tool states
  tools: ToolStates;
  
  // Rate limiting
  rateLimits: Record<string, RateLimit>;
  
  // UI state
  expandedTools: Set<string>;
  preferences: {
    autoRefresh: boolean;
    showAdvanced: boolean;
    preferredCurrency: 'USD' | 'BTC' | 'sats';
  };
  
  // Actions for transaction lookup
  setTransactionLoading: (loading: LoadingState) => void;
  setTransactionData: (data: TransactionStatus | null) => void;
  setTransactionError: (error: ToolError | null) => void;
  
  // Actions for fee calculator
  setFeeCalculatorLoading: (loading: LoadingState) => void;
  setFeeCalculatorData: (data: FeeRecommendation[] | null) => void;
  setFeeCalculatorError: (error: ToolError | null) => void;
  setFeeCalculatorTxSize: (size: number) => void;
  setFeeCalculatorSelectedTier: (tier: 'economy' | 'balanced' | 'priority' | null) => void;
  
  // Actions for network status
  setNetworkStatusLoading: (loading: LoadingState) => void;
  setNetworkStatusData: (data: NetworkHealth | null) => void;
  setNetworkStatusError: (error: ToolError | null) => void;
  refreshNetworkStatus: () => void;
  
  // Actions for address explorer
  setAddressExplorerLoading: (loading: LoadingState) => void;
  setAddressExplorerData: (data: AddressInfo | null) => void;
  setAddressExplorerError: (error: ToolError | null) => void;
  setAddressExplorerPage: (page: number) => void;
  
  // Actions for document timestamp
  setDocumentTimestampLoading: (loading: LoadingState) => void;
  setDocumentTimestampData: (data: TimestampResult | null) => void;
  setDocumentTimestampError: (error: ToolError | null) => void;
  setDocumentTimestampFile: (file: File | null) => void;
  
  // Rate limiting actions
  checkRateLimit: (endpoint: string) => boolean;
  recordRequest: (endpoint: string) => void;
  
  // UI actions
  toggleTool: (toolName: string) => void;
  setPreference: <K extends keyof BitcoinToolsStore['preferences']>(
    key: K, 
    value: BitcoinToolsStore['preferences'][K]
  ) => void;
  
  // Utility actions
  clearAllData: () => void;
  clearToolData: (toolName: keyof ToolStates) => void;
  resetErrorStates: () => void;
}

const createDefaultLoadingState = (): LoadingState => ({
  isLoading: false,
  loadingMessage: ''
});

const createDefaultToolStates = (): ToolStates => ({
  transactionLookup: {
    loading: createDefaultLoadingState(),
    error: null,
    data: null,
    lastTxid: ''
  },
  feeCalculator: {
    loading: createDefaultLoadingState(),
    error: null,
    data: null,
    txSize: 250, // Default transaction size in vBytes
    selectedTier: null
  },
  networkStatus: {
    loading: createDefaultLoadingState(),
    error: null,
    data: null,
    lastUpdate: 0
  },
  addressExplorer: {
    loading: createDefaultLoadingState(),
    error: null,
    data: null,
    lastAddress: '',
    currentPage: 1
  },
  documentTimestamp: {
    loading: createDefaultLoadingState(),
    error: null,
    data: null,
    uploadedFile: null
  }
});

export const useBitcoinToolsStore = create<BitcoinToolsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      tools: createDefaultToolStates(),
      rateLimits: {},
      expandedTools: new Set(),
      preferences: {
        autoRefresh: true,
        showAdvanced: false,
        preferredCurrency: 'USD'
      },

      // Transaction lookup actions
      setTransactionLoading: (loading) => set(state => ({
        tools: {
          ...state.tools,
          transactionLookup: {
            ...state.tools.transactionLookup,
            loading,
            error: null // Clear error when starting new loading
          }
        }
      })),

      setTransactionData: (data) => set(state => ({
        tools: {
          ...state.tools,
          transactionLookup: {
            ...state.tools.transactionLookup,
            data,
            loading: createDefaultLoadingState(),
            lastTxid: data?.txid || state.tools.transactionLookup.lastTxid
          }
        }
      })),

      setTransactionError: (error) => set(state => ({
        tools: {
          ...state.tools,
          transactionLookup: {
            ...state.tools.transactionLookup,
            error,
            loading: createDefaultLoadingState()
          }
        }
      })),

      // Fee calculator actions
      setFeeCalculatorLoading: (loading) => set(state => ({
        tools: {
          ...state.tools,
          feeCalculator: {
            ...state.tools.feeCalculator,
            loading,
            error: null
          }
        }
      })),

      setFeeCalculatorData: (data) => set(state => ({
        tools: {
          ...state.tools,
          feeCalculator: {
            ...state.tools.feeCalculator,
            data,
            loading: createDefaultLoadingState()
          }
        }
      })),

      setFeeCalculatorError: (error) => set(state => ({
        tools: {
          ...state.tools,
          feeCalculator: {
            ...state.tools.feeCalculator,
            error,
            loading: createDefaultLoadingState()
          }
        }
      })),

      setFeeCalculatorTxSize: (txSize) => set(state => ({
        tools: {
          ...state.tools,
          feeCalculator: {
            ...state.tools.feeCalculator,
            txSize
          }
        }
      })),

      setFeeCalculatorSelectedTier: (selectedTier) => set(state => ({
        tools: {
          ...state.tools,
          feeCalculator: {
            ...state.tools.feeCalculator,
            selectedTier
          }
        }
      })),

      // Network status actions
      setNetworkStatusLoading: (loading) => set(state => ({
        tools: {
          ...state.tools,
          networkStatus: {
            ...state.tools.networkStatus,
            loading,
            error: null
          }
        }
      })),

      setNetworkStatusData: (data) => set(state => ({
        tools: {
          ...state.tools,
          networkStatus: {
            ...state.tools.networkStatus,
            data,
            loading: createDefaultLoadingState(),
            lastUpdate: Date.now()
          }
        }
      })),

      setNetworkStatusError: (error) => set(state => ({
        tools: {
          ...state.tools,
          networkStatus: {
            ...state.tools.networkStatus,
            error,
            loading: createDefaultLoadingState()
          }
        }
      })),

      refreshNetworkStatus: () => {
        // This will be used to trigger a refresh in components
        set(state => ({
          tools: {
            ...state.tools,
            networkStatus: {
              ...state.tools.networkStatus,
              lastUpdate: 0 // Reset to trigger refresh
            }
          }
        }));
      },

      // Address explorer actions
      setAddressExplorerLoading: (loading) => set(state => ({
        tools: {
          ...state.tools,
          addressExplorer: {
            ...state.tools.addressExplorer,
            loading,
            error: null
          }
        }
      })),

      setAddressExplorerData: (data) => set(state => ({
        tools: {
          ...state.tools,
          addressExplorer: {
            ...state.tools.addressExplorer,
            data,
            loading: createDefaultLoadingState(),
            lastAddress: data?.address || state.tools.addressExplorer.lastAddress
          }
        }
      })),

      setAddressExplorerError: (error) => set(state => ({
        tools: {
          ...state.tools,
          addressExplorer: {
            ...state.tools.addressExplorer,
            error,
            loading: createDefaultLoadingState()
          }
        }
      })),

      setAddressExplorerPage: (currentPage) => set(state => ({
        tools: {
          ...state.tools,
          addressExplorer: {
            ...state.tools.addressExplorer,
            currentPage
          }
        }
      })),

      // Document timestamp actions
      setDocumentTimestampLoading: (loading) => set(state => ({
        tools: {
          ...state.tools,
          documentTimestamp: {
            ...state.tools.documentTimestamp,
            loading,
            error: null
          }
        }
      })),

      setDocumentTimestampData: (data) => set(state => ({
        tools: {
          ...state.tools,
          documentTimestamp: {
            ...state.tools.documentTimestamp,
            data,
            loading: createDefaultLoadingState()
          }
        }
      })),

      setDocumentTimestampError: (error) => set(state => ({
        tools: {
          ...state.tools,
          documentTimestamp: {
            ...state.tools.documentTimestamp,
            error,
            loading: createDefaultLoadingState()
          }
        }
      })),

      setDocumentTimestampFile: (uploadedFile) => set(state => ({
        tools: {
          ...state.tools,
          documentTimestamp: {
            ...state.tools.documentTimestamp,
            uploadedFile
          }
        }
      })),

      // Rate limiting
      checkRateLimit: (endpoint) => {
        const now = Date.now();
        const rateLimit = get().rateLimits[endpoint];
        
        if (!rateLimit || now > rateLimit.resetTime) {
          return true; // No limit or limit has reset
        }
        
        return rateLimit.count < 10; // Max 10 requests per minute
      },

      recordRequest: (endpoint) => {
        const now = Date.now();
        const resetTime = now + 60000; // Reset after 1 minute
        
        set(state => ({
          rateLimits: {
            ...state.rateLimits,
            [endpoint]: {
              count: (state.rateLimits[endpoint]?.count || 0) + 1,
              resetTime: state.rateLimits[endpoint]?.resetTime || resetTime
            }
          }
        }));
      },

      // UI actions
      toggleTool: (toolName) => set(state => {
        const newExpanded = new Set(state.expandedTools);
        if (newExpanded.has(toolName)) {
          newExpanded.delete(toolName);
        } else {
          newExpanded.add(toolName);
        }
        return { expandedTools: newExpanded };
      }),

      setPreference: (key, value) => set(state => ({
        preferences: {
          ...state.preferences,
          [key]: value
        }
      })),

      // Utility actions
      clearAllData: () => set(state => ({
        tools: createDefaultToolStates(),
        expandedTools: new Set()
      })),

      clearToolData: (toolName) => set(state => ({
        tools: {
          ...state.tools,
          [toolName]: createDefaultToolStates()[toolName]
        }
      })),

      resetErrorStates: () => set(state => ({
        tools: Object.keys(state.tools).reduce((acc, toolName) => {
          const key = toolName as keyof ToolStates;
          (acc as any)[key] = {
            ...state.tools[key],
            error: null
          };
          return acc;
        }, {} as ToolStates)
      }))
    }),
    {
      name: 'bitcoin-tools-store',
      // Only persist preferences and some UI state, not temporary data
      partialize: (state) => ({
        preferences: state.preferences,
        expandedTools: Array.from(state.expandedTools), // Convert Set to Array for serialization
        tools: {
          feeCalculator: {
            txSize: state.tools.feeCalculator.txSize,
            selectedTier: state.tools.feeCalculator.selectedTier
          }
        }
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.expandedTools)) {
          // Convert Array back to Set
          state.expandedTools = new Set(state.expandedTools);
        }
      }
    }
  )
);
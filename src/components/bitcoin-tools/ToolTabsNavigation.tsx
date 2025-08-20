'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ToolId, ToolBadge, ToolConfig, BitcoinTxId, BitcoinAddress } from '@/types/bitcoin-tools';
import { MagnifyingGlassIcon, CurrencyDollarIcon, ChartBarIcon, HomeIcon, ClockIcon } from '@heroicons/react/24/outline';

// Enhanced skeleton variant types
type SkeletonVariant = 'default' | 'form' | 'calculator' | 'stats' | 'explorer' | 'upload';

interface ToolSkeletonProps {
  readonly variant?: SkeletonVariant;
}

// Tool skeleton component for loading states with strict typing
function ToolSkeleton({ variant = 'default' }: ToolSkeletonProps) {
  const skeletonMap = {
    default: (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    ),
    form: (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-32 w-full" />
      </div>
    ),
    calculator: (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-20 w-full" />
      </div>
    ),
    stats: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    ),
    explorer: (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ),
    upload: (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full border-2 border-dashed" />
        <Skeleton className="h-10 w-48" />
      </div>
    ),
  };

  return (
    <div className="animate-pulse p-6">
      {skeletonMap[variant]}
    </div>
  );
}

// Lazy load tool components for better performance
const TransactionLookupTool = dynamic(() => import('./TransactionLookupTool'), {
  loading: () => <ToolSkeleton variant="form" />,
  ssr: false
});

const FeeCalculatorTool = dynamic(() => import('./FeeCalculatorTool'), {
  loading: () => <ToolSkeleton variant="calculator" />,
  ssr: false
});

const NetworkStatusTool = dynamic(() => import('./NetworkStatus'), {
  loading: () => <ToolSkeleton variant="stats" />,
  ssr: false
});

const AddressExplorerTool = dynamic(() => import('./AddressExplorerTool'), {
  loading: () => <ToolSkeleton variant="explorer" />,
  ssr: false
});

const DocumentTimestampingTool = dynamic(() => import('./DocumentTimestampingTool'), {
  loading: () => <ToolSkeleton variant="upload" />,
  ssr: false
});

// Enhanced tool configuration with strict typing
interface EnhancedToolConfig {
  readonly id: ToolId;
  readonly label: string;
  readonly shortLabel: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly component: React.ComponentType<any>;
  readonly badge: ToolBadge;
  readonly description: string;
  readonly requiresInput: boolean;
  readonly estimatedResponseTime: number; // milliseconds
}

const tools: readonly EnhancedToolConfig[] = [
  {
    id: 'transaction' as const,
    label: 'Transactions',
    shortLabel: 'TX',
    icon: MagnifyingGlassIcon,
    component: TransactionLookupTool,
    badge: null,
    description: 'Check any Bitcoin transaction status and details',
    requiresInput: true,
    estimatedResponseTime: 2000
  },
  {
    id: 'fees' as const,
    label: 'Fee Calculator',
    shortLabel: 'Fees',
    icon: CurrencyDollarIcon,
    component: FeeCalculatorTool,
    badge: 'Popular' as const,
    description: 'Calculate optimal transaction fees for different confirmation times',
    requiresInput: false,
    estimatedResponseTime: 1500
  },
  {
    id: 'network' as const,
    label: 'Network Status',
    shortLabel: 'Network',
    icon: ChartBarIcon,
    component: NetworkStatusTool,
    badge: 'Live' as const,
    description: 'Real-time Bitcoin blockchain network statistics and health',
    requiresInput: false,
    estimatedResponseTime: 1000
  },
  {
    id: 'address' as const,
    label: 'Address Explorer',
    shortLabel: 'Address',
    icon: HomeIcon,
    component: AddressExplorerTool,
    badge: null,
    description: 'Explore Bitcoin address balance, transactions, and history',
    requiresInput: true,
    estimatedResponseTime: 3000
  },
  {
    id: 'timestamp' as const,
    label: 'Document Timestamp',
    shortLabel: 'Timestamp',
    icon: ClockIcon,
    component: DocumentTimestampingTool,
    badge: 'New' as const,
    description: 'Timestamp documents on the Bitcoin blockchain for proof of existence',
    requiresInput: true,
    estimatedResponseTime: 5000
  },
] as const;

// Enhanced props interface with strict typing
interface ToolTabsNavigationProps {
  readonly defaultTool?: ToolId;
  readonly searchParams?: {
    readonly tool?: ToolId;
    readonly txid?: string; // Will be validated as BitcoinTxId
    readonly address?: string; // Will be validated as BitcoinAddress
  };
}

// Type-safe search params processing
interface ProcessedSearchParams {
  readonly tool?: ToolId;
  readonly txid?: BitcoinTxId;
  readonly address?: BitcoinAddress;
}

export default function ToolTabsNavigation({ 
  defaultTool = 'transaction' as const,
  searchParams 
}: ToolTabsNavigationProps) {
  // Process and validate search params with type safety
  const processedParams: ProcessedSearchParams = {
    tool: searchParams?.tool,
    txid: searchParams?.txid ? (searchParams.txid as BitcoinTxId) : undefined,
    address: searchParams?.address ? (searchParams.address as BitcoinAddress) : undefined,
  };
  
  // Use search params tool if provided and valid, otherwise use defaultTool
  const initialTool = processedParams.tool || defaultTool;
  const [activeTab, setActiveTab] = useState<ToolId>(initialTool);
  
  // Handle opening command palette
  const openCommandPalette = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true
    });
    document.dispatchEvent(event);
  };
  
  // Add keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // Command palette will be opened by the ToolCommandPalette component
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full">

      <Tabs value={activeTab} onValueChange={(value: string) => {
        if (value && value in tools.reduce((acc, tool) => ({ ...acc, [tool.id]: true }), {})) {
          setActiveTab(value as ToolId);
        }
      }} className="w-full">
        {/* Enhanced Tab Navigation */}
        <div className="relative mb-8">
          <TabsList className="w-full h-auto p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg">
            <div className="grid grid-cols-3 lg:grid-cols-5 gap-2 w-full">
              {tools.map((tool) => (
                <TabsTrigger
                  key={tool.id}
                  value={tool.id}
                  className="relative flex flex-col items-center py-4 px-3 transition-all duration-300 rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-bitcoin data-[state=active]:to-bitcoin-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 border-0 bg-transparent shadow-none group min-h-[100px] data-[state=active]:transform data-[state=active]:scale-[1.02]"
                >
                  <div className="w-8 h-8 mb-3 text-gray-600 dark:text-gray-400 group-data-[state=active]:text-white transition-all duration-300 group-data-[state=active]:scale-110">
                    <tool.icon className="w-full h-full" />
                  </div>
                  <span className="text-sm font-semibold text-center leading-tight group-data-[state=active]:text-white transition-colors duration-300">
                    {tool.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 group-data-[state=active]:text-white/80 text-center mt-1 transition-colors duration-300">
                    {tool.description.length > 30 ? tool.description.substring(0, 30) + '...' : tool.description}
                  </span>
                  {tool.badge && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-1 -right-1 text-[9px] px-1.5 py-0.5 h-4 bg-gradient-to-r from-bitcoin to-bitcoin-600 text-white border-0 rounded-full shadow-sm z-10"
                    >
                      {tool.badge}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </div>
          </TabsList>
        </div>

        {/* Enhanced Tab Content */}
        {tools.map((tool) => {
          const Component = tool.component;
          return (
            <TabsContent key={tool.id} value={tool.id} className="space-y-8 animate-in fade-in-50 duration-300">
              {/* Enhanced Tool Header */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-gray-200 dark:border-slate-600">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-bitcoin/10 dark:bg-bitcoin/20 rounded-xl flex items-center justify-center">
                    <tool.icon className="w-8 h-8 text-bitcoin" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {tool.label}
                      </h2>
                      {tool.badge && (
                        <Badge 
                          variant="secondary" 
                          className="bg-gradient-to-r from-bitcoin to-bitcoin-600 text-white border-0 px-2 py-1"
                        >
                          {tool.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>
                
                {/* Tool Stats with Search */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Response time: ~{tool.estimatedResponseTime/1000}s</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>{tool.requiresInput ? 'Input required' : 'Ready to use'}</span>
                  </div>
                  <div className="ml-auto">
                    <button
                      onClick={openCommandPalette}
                      className="bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-2"
                      aria-label="Open search (⌘K)"
                    >
                      Press{" "}
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-1 mr-1">
                        <span className="text-xs">⌘</span>K
                      </kbd>{" "}
                      to search
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Tool Component Container */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <Component 
                  initialTxid={tool.id === 'transaction' ? processedParams.txid : undefined}
                  initialAddress={tool.id === 'address' ? processedParams.address : undefined}
                />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
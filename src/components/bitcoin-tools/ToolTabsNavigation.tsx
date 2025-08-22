'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ToolId, ToolBadge, ToolConfig, BitcoinTxId, BitcoinAddress } from '@/types/bitcoin-tools';
import { MagnifyingGlassIcon, WalletIcon, ServerStackIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { SatoshiIcon } from '@/components/icons';

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
    icon: SatoshiIcon,
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
    icon: ServerStackIcon,
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
    icon: WalletIcon,
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
    icon: DocumentIcon,
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

const ToolTabsNavigation = React.memo(function ToolTabsNavigation({ 
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

  return (
    <div className="w-full">
      {/* Add proper spacing from hero section */}
      <div className="pt-8 sm:pt-12">
        <Tabs value={activeTab} onValueChange={(value: string) => {
          if (value && value in tools.reduce((acc, tool) => ({ ...acc, [tool.id]: true }), {})) {
            setActiveTab(value as ToolId);
          }
        }} className="w-full">
          {/* Enhanced Tab Navigation with improved spacing and design */}
          <div className="relative mb-12">
            {/* Add subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 via-white/30 to-slate-50/50 dark:from-slate-800/50 dark:via-slate-700/30 dark:to-slate-800/50 rounded-2xl blur-3xl" aria-hidden="true"></div>
            
            <TabsList className="relative w-full h-auto p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-slate-700/60 rounded-2xl shadow-xl">
              {/* Responsive grid with optimized sizing */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
                {tools.map((tool) => (
                  <TabsTrigger
                    key={tool.id}
                    value={tool.id}
                    className="relative flex flex-col items-center py-3 px-2 sm:py-4 sm:px-3 transition-all duration-300 rounded-xl data-[state=active]:bg-gradient-to-br data-[state=active]:from-bitcoin data-[state=active]:to-bitcoin-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-50/80 dark:hover:bg-slate-700/50 border-0 bg-transparent shadow-none group min-h-[80px] sm:min-h-[90px] data-[state=active]:transform data-[state=active]:scale-[1.02] hover:scale-[1.01] data-[state=active]:ring-2 data-[state=active]:ring-bitcoin/20 data-[state=active]:ring-offset-2"
                  >
                    {/* Icon with improved sizing */}
                    <div className="w-6 h-6 sm:w-7 sm:h-7 mb-2 text-gray-600 dark:text-gray-400 group-data-[state=active]:text-white transition-all duration-300 group-data-[state=active]:scale-110 group-hover:scale-105">
                      <tool.icon className="w-full h-full" />
                    </div>
                    
                    {/* Responsive text sizing */}
                    <span className="text-xs sm:text-sm font-semibold text-center leading-tight group-data-[state=active]:text-white transition-colors duration-300 px-1">
                      <span className="hidden sm:inline">{tool.label}</span>
                      <span className="sm:hidden">{tool.shortLabel}</span>
                    </span>
                    
                    {/* Enhanced badge positioning and styling */}
                    {tool.badge && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 h-3 sm:h-4 bg-gradient-to-r from-bitcoin to-bitcoin-600 text-white border-0 rounded-full shadow-md z-10 animate-pulse"
                      >
                        {tool.badge}
                      </Badge>
                    )}
                    
                    {/* Subtle glow effect for active state */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-bitcoin/10 to-bitcoin-600/10 opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300 pointer-events-none" aria-hidden="true"></div>
                  </TabsTrigger>
                ))}
              </div>
            </TabsList>
            
            {/* Add visual depth with shadow layers */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-bitcoin/5 to-transparent rounded-2xl pointer-events-none" aria-hidden="true"></div>
          </div>

          {/* Enhanced Tab Content with improved spacing */}
          {tools.map((tool) => {
            const Component = tool.component;
            return (
              <TabsContent key={tool.id} value={tool.id} className="space-y-6" forceMount={tool.id === activeTab ? undefined : true} hidden={tool.id !== activeTab}>
                {/* Enhanced Tool Header with better visual hierarchy */}
                <div className="bg-gradient-to-r from-slate-50/80 to-blue-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/60 dark:border-slate-600/60 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-bitcoin/15 to-bitcoin-600/15 dark:from-bitcoin/25 dark:to-bitcoin-600/25 rounded-2xl flex items-center justify-center shadow-inner">
                      <tool.icon className="w-12 h-12 text-bitcoin" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                          {tool.label}
                        </h2>
                        {tool.badge && (
                          <Badge 
                            variant="secondary" 
                            className="w-fit bg-gradient-to-r from-bitcoin to-bitcoin-600 text-white border-0 px-3 py-1 shadow-md"
                          >
                            {tool.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Enhanced Tool Stats with better responsive design */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Response time: ~{tool.estimatedResponseTime/1000}s</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{tool.requiresInput ? 'Input required' : 'Ready to use'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Tool Component Container with enhanced styling */}
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 dark:border-slate-700/60 overflow-hidden min-h-[600px] transition-all duration-300 hover:shadow-2xl">
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
    </div>
  );
});

export default ToolTabsNavigation;
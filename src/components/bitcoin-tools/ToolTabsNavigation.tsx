'use client';

import { useState } from 'react';
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

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={(value: string) => {
        if (value && value in tools.reduce((acc, tool) => ({ ...acc, [tool.id]: true }), {})) {
          setActiveTab(value as ToolId);
        }
      }} className="w-full">
        {/* Tab Navigation */}
        <TabsList className="flex w-full justify-center gap-0.5 h-auto p-1 bg-transparent">
          {tools.map((tool) => (
            <TabsTrigger
              key={tool.id}
              value={tool.id}
              className="relative flex flex-col items-center py-3 px-1.5 w-20 sm:w-24 transition-all duration-300 rounded-lg data-[state=active]:bg-bitcoin data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border-0 bg-transparent shadow-none"
            >
              <div className="w-7 h-7 mb-2 text-gray-600 dark:text-gray-400 data-[state=active]:text-white transition-colors">
                <tool.icon className="w-full h-full" />
              </div>
              <span className="text-xs font-medium hidden sm:inline text-center leading-tight">
                {tool.label}
              </span>
              <span className="text-xs font-semibold sm:hidden text-center">
                {tool.shortLabel}
              </span>
              {tool.badge && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 text-[9px] px-1.5 py-0.5 h-4 bg-gradient-to-r from-bitcoin to-bitcoin-600 text-white border-0 rounded-full shadow-sm"
                >
                  {tool.badge}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        {tools.map((tool) => {
          const Component = tool.component;
          return (
            <TabsContent key={tool.id} value={tool.id} className="mt-8 space-y-6">
              <div className="text-center sm:text-left space-y-3">
                <div className="flex items-center justify-center sm:justify-start gap-4">
                  <div className="w-8 h-8 text-bitcoin flex-shrink-0">
                    <tool.icon className="w-full h-full" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {tool.label}
                  </h2>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto sm:mx-0 leading-relaxed">
                  {tool.description}
                </p>
              </div>
              
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
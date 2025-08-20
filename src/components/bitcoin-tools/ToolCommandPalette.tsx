'use client';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { ToolId, ToolBadge, ToolSearchResult, AppRoute, NavigationSearchResult } from '@/types/bitcoin-tools';

// Enhanced tool configuration with strict typing
interface ToolCommandConfig {
  readonly id: ToolId;
  readonly label: string;
  readonly icon: string;
  readonly badge: ToolBadge;
  readonly description: string;
  readonly keywords: readonly string[];
}

const tools: readonly ToolCommandConfig[] = [
  {
    id: 'transaction' as const,
    label: 'Transaction Lookup',
    icon: '🔍',
    badge: null,
    description: 'Check Bitcoin transaction status',
    keywords: ['tx', 'txid', 'transaction', 'hash', 'lookup', 'search'] as const
  },
  {
    id: 'fees' as const,
    label: 'Fee Calculator',
    icon: '💰',
    badge: 'Popular' as const,
    description: 'Calculate optimal fees',
    keywords: ['fee', 'cost', 'priority', 'mempool', 'calculator'] as const
  },
  {
    id: 'network' as const,
    label: 'Network Status',
    icon: '📊',
    badge: 'Live' as const,
    description: 'Real-time network stats',
    keywords: ['network', 'stats', 'status', 'health', 'blockchain'] as const
  },
  {
    id: 'address' as const,
    label: 'Address Explorer',
    icon: '🏠',
    badge: null,
    description: 'Explore address details',
    keywords: ['address', 'wallet', 'balance', 'history', 'explorer'] as const
  },
  {
    id: 'timestamp' as const,
    label: 'Document Timestamp',
    icon: '⏰',
    badge: 'New' as const,
    description: 'Timestamp documents',
    keywords: ['timestamp', 'document', 'proof', 'notary', 'blockchain'] as const
  },
] as const;

// Enhanced navigation configuration with strict route typing
interface NavigationCommandConfig {
  readonly label: string;
  readonly path: AppRoute;
  readonly icon: string;
  readonly description: string;
}

const navigation: readonly NavigationCommandConfig[] = [
  { 
    label: 'Home', 
    path: '/' as const, 
    icon: '🏠', 
    description: 'Return to homepage' 
  },
  { 
    label: 'Calculator', 
    path: '/calculator' as const, 
    icon: '🧮', 
    description: 'Bitcoin benefits calculator' 
  },
  { 
    label: 'Historical', 
    path: '/historical' as const, 
    icon: '📈', 
    description: 'Historical performance' 
  },
  { 
    label: 'Track', 
    path: '/track' as const, 
    icon: '📊', 
    description: 'Track your vesting' 
  },
  { 
    label: 'Learn', 
    path: '/learn' as const, 
    icon: '📚', 
    description: 'Learn about Bitcoin benefits' 
  },
] as const;

export function ToolCommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigateToTool = (toolId: ToolId) => {
    const currentPath = window.location.pathname;
    if (currentPath === '/bitcoin-tools') {
      // If we're already on the tools page, just update the URL with the tool param
      const params = new URLSearchParams(searchParams);
      params.set('tool', toolId);
      router.push(`/bitcoin-tools?${params.toString()}`);
    } else {
      // Navigate to tools page with the specific tool
      router.push(`/bitcoin-tools?tool=${toolId}`);
    }
    setOpen(false);
  };

  const navigateToPage = (path: AppRoute) => {
    router.push(path);
    setOpen(false);
  };

  return (
    <>
      {/* Keyboard shortcut hint */}
      <div className="hidden sm:flex items-center justify-center mb-4">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          Press{" "}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-1 mr-1">
            <span className="text-xs">⌘</span>K
          </kbd>{" "}
          to search tools
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search tools and pages..." className="border-0" />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Bitcoin Tools">
            {tools.map((tool) => (
              <CommandItem
                key={tool.id}
                onSelect={() => navigateToTool(tool.id)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="text-lg" role="img" aria-label={tool.label}>
                  {tool.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{tool.label}</span>
                    {tool.badge && (
                      <Badge variant="secondary" className="text-xs bg-bitcoin text-white">
                        {tool.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {tool.description}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Navigation">
            {navigation.map((item) => (
              <CommandItem
                key={item.path}
                onSelect={() => navigateToPage(item.path)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="text-lg" role="img" aria-label={item.label}>
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{item.label}</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {item.description}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
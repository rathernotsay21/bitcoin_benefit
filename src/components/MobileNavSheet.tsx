'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { AppRoute, NavigationItem } from '@/types/bitcoin-tools';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Import icons directly
import { 
  Bars3Icon, 
  XMarkIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  HomeIcon,
  CalculatorIcon,
  ClockIcon,
  BookOpenIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  CalculatorIcon as CalculatorIconSolid,
  ClockIcon as ClockIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  LinkIcon as LinkIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  SunIcon as SunIconSolid,
  MoonIcon as MoonIconSolid,
} from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

export default function MobileNavSheet() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);

  // Enhanced navigation items with strict route typing
  interface MobileNavItem {
    readonly name: string;
    readonly href: AppRoute;
    readonly icon: React.ComponentType<{ className?: string }>;
    readonly activeIcon: React.ComponentType<{ className?: string }>;
    readonly description: string;
    readonly badge?: string;
    readonly subItems?: readonly {
      readonly name: string;
      readonly href: string;
      readonly description: string;
    }[];
  }

  const navItems: readonly MobileNavItem[] = [
    {
      name: 'Home',
      href: '/' as const,
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
      description: 'Start your Bitcoin benefits journey'
    },
    {
      name: 'Plans',
      href: '/calculator' as const,
      icon: CalculatorIcon,
      activeIcon: CalculatorIconSolid,
      description: 'Build your employee award plan'
    },
    {
      name: 'Results',
      href: '/historical' as const,
      icon: ClockIcon,
      activeIcon: ClockIconSolid,
      description: 'See how plans performed historically'
    },
    {
      name: 'Track',
      href: '/track' as const,
      icon: MagnifyingGlassIcon,
      activeIcon: MagnifyingGlassIconSolid,
      description: 'Verify and track vesting on-chain'
    },
    {
      name: 'Tools',
      href: '/bitcoin-tools' as const,
      icon: LinkIcon,
      activeIcon: LinkIconSolid,
      description: 'Blockchain tools and calculators',
      subItems: [
        { name: 'Transactions', href: '/bitcoin-tools?tool=transaction', description: 'Look up transactions' },
        { name: 'Fee Calculator', href: '/bitcoin-tools?tool=fees', description: 'Calculate optimal fees' },
        { name: 'Network Status', href: '/bitcoin-tools?tool=network', description: 'Monitor network health' },
        { name: 'Address Explorer', href: '/bitcoin-tools?tool=address', description: 'Explore addresses' },
        { name: 'Document Timestamp', href: '/bitcoin-tools?tool=timestamp', description: 'Timestamp documents' },
      ]
    },
    {
      name: 'Guide',
      href: '/learn' as const,
      icon: BookOpenIcon,
      activeIcon: BookOpenIconSolid,
      description: 'Implementation guide and resources'
    },
  ] as const;

  // Close sheet when route changes
  useEffect(() => {
    setIsOpen(false);
    setIsToolsExpanded(false);
  }, [pathname]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className="sm:hidden p-2 rounded-sm text-deepSlate dark:text-slate-100 hover:text-bitcoin dark:hover:text-bitcoin transition-all duration-300"
          aria-label="Open navigation menu"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="mobile-nav-sheet w-full sm:max-w-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-700 flex flex-col gap-4 h-full max-h-screen overflow-hidden"
      >
        <SheetHeader className="sheet-header text-left pb-4 sm:pb-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <SheetTitle className="text-xl font-bold text-deepSlate dark:text-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-bitcoin/20 dark:bg-bitcoin/30 flex items-center justify-center">
              <span className="text-bitcoin font-bold">₿</span>
            </div>
            Bitcoin Benefits
          </SheetTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-tight">
            Secure their future. Secure your team.
          </p>
        </SheetHeader>

        <nav className="sheet-nav flex flex-col py-3 sm:py-6 space-y-1 flex-1 overflow-y-auto min-h-0 pb-6">
          {navItems.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
            const Icon = isActive ? item.activeIcon : item.icon;

            // Special handling for Tools with sub-items
            if (item.subItems) {
              return (
                <div key={item.name}>
                  <button
                    onClick={() => setIsToolsExpanded(!isToolsExpanded)}
                    className={cn(
                      "nav-link group flex items-center justify-between px-4 py-3 rounded-sm transition-all duration-300 w-full",
                      isActive 
                        ? 'bg-bitcoin/10 dark:bg-bitcoin/20 text-bitcoin border-l-4 border-bitcoin' 
                        : 'text-slate-600 dark:text-slate-300 hover:text-bitcoin dark:hover:text-bitcoin hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                  >
                    <div className="flex items-center">
                      <Icon className={cn(
                        "w-6 h-6 mr-4 transition-all duration-300 group-hover:scale-110 flex-shrink-0",
                        isActive ? 'text-bitcoin' : 'text-slate-500 group-hover:text-bitcoin dark:text-slate-400 dark:group-hover:text-bitcoin'
                      )} />
                      <div className="flex flex-col min-w-0 text-left">
                        <span className={cn(
                          "font-semibold transition-all duration-300 truncate text-left",
                          isActive ? 'text-bitcoin' : 'text-deepSlate group-hover:text-bitcoin dark:text-slate-300 dark:group-hover:text-bitcoin'
                        )}>
                          {item.name}
                        </span>
                        <span className="nav-description text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate leading-tight text-left">
                          {item.description}
                        </span>
                      </div>
                    </div>
                    {isToolsExpanded ? (
                      <ChevronUpIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    )}
                  </button>
                  {isToolsExpanded && (
                    <div className="ml-10 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <SheetClose key={subItem.name} asChild>
                          <Link
                            href={subItem.href}
                            className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-bitcoin dark:hover:text-bitcoin hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-all duration-300"
                          >
                            <div className="font-medium">{subItem.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                              {subItem.description}
                            </div>
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Regular navigation items
            return (
              <SheetClose key={item.name} asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "nav-link group flex items-center px-4 py-3 rounded-sm transition-all duration-300",
                    isActive 
                      ? 'bg-bitcoin/10 dark:bg-bitcoin/20 text-bitcoin border-l-4 border-bitcoin' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-bitcoin dark:hover:text-bitcoin hover:bg-slate-100 dark:hover:bg-slate-700'
                  )}
                >
                  <Icon className={cn(
                    "w-6 h-6 mr-4 transition-all duration-300 group-hover:scale-110 flex-shrink-0",
                    isActive ? 'text-bitcoin' : 'text-slate-500 group-hover:text-bitcoin dark:text-slate-400 dark:group-hover:text-bitcoin'
                  )} />
                  <div className="flex flex-col min-w-0">
                    <span className={cn(
                      "font-semibold transition-all duration-300 truncate",
                      isActive ? 'text-bitcoin' : 'text-deepSlate group-hover:text-bitcoin dark:text-slate-300 dark:group-hover:text-bitcoin'
                    )}>
                      {item.name}
                    </span>
                    <span className="nav-description text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate leading-tight">
                      {item.description}
                    </span>
                  </div>
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        <div className="theme-toggle-section flex-shrink-0 border-t border-slate-200 dark:border-slate-700 pt-4 sm:pt-6">
          <button
            onClick={toggleTheme}
            className="flex items-center w-full px-4 py-3 rounded-sm text-slate-600 dark:text-slate-300 hover:text-bitcoin dark:hover:text-bitcoin hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? (
              <SunIconSolid className="w-6 h-6 mr-4 text-yellow-400 flex-shrink-0" />
            ) : (
              <MoonIconSolid className="w-6 h-6 mr-4 text-slate-600 dark:text-slate-300 flex-shrink-0" />
            )}
            <div className="flex flex-col items-start min-w-0">
              <span className="font-semibold truncate">
                Switch to {theme === 'dark' ? 'light' : 'dark'} mode
              </span>
              <span className="theme-toggle-description text-xs text-slate-500 dark:text-slate-400 truncate">
                Change appearance
              </span>
            </div>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
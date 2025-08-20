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

// Import icons dynamically for performance
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Load essential navigation icons dynamically  
const HomeIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.HomeIcon })), { ssr: false });
const CalculatorIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.CalculatorIcon })), { ssr: false });
const SunIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.SunIcon })), { ssr: false });
const MoonIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.MoonIcon })), { ssr: false });
const ClockIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.ClockIcon })), { ssr: false });
const BookOpenIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.BookOpenIcon })), { ssr: false });
const LinkIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.LinkIcon })), { ssr: false });
const MagnifyingGlassIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.MagnifyingGlassIcon })), { ssr: false });

// Load solid versions dynamically
const HomeIconSolid = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.HomeIcon })), { ssr: false });
const CalculatorIconSolid = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.CalculatorIcon })), { ssr: false });
const SunIconSolid = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.SunIcon })), { ssr: false });
const MoonIconSolid = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.MoonIcon })), { ssr: false });
const ClockIconSolid = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.ClockIcon })), { ssr: false });
const BookOpenIconSolid = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.BookOpenIcon })), { ssr: false });
const LinkIconSolid = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.LinkIcon })), { ssr: false });
const MagnifyingGlassIconSolid = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.MagnifyingGlassIcon })), { ssr: false });

export default function MobileNavSheet() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Enhanced navigation items with strict route typing
  interface MobileNavItem {
    readonly name: string;
    readonly href: AppRoute;
    readonly icon: React.ComponentType<{ className?: string }>;
    readonly activeIcon: React.ComponentType<{ className?: string }>;
    readonly description: string;
    readonly badge?: string;
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
      description: 'Build your employee bonus plan'
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
      description: 'Blockchain tools and calculators'
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
  }, [pathname]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className="md:hidden p-2 rounded-lg text-deepSlate dark:text-slate-100 hover:text-bitcoin dark:hover:text-bitcoin transition-all duration-300"
          aria-label="Open navigation menu"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-full sm:max-w-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-700"
      >
        <SheetHeader className="text-left pb-6 border-b border-slate-200 dark:border-slate-700">
          <SheetTitle className="text-xl font-bold text-deepSlate dark:text-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-bitcoin/20 dark:bg-bitcoin/30 flex items-center justify-center">
              <span className="text-bitcoin font-bold">₿</span>
            </div>
            Bitcoin Benefits
          </SheetTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Secure their future. Secure your team.
          </p>
        </SheetHeader>

        <nav className="flex flex-col py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
            const Icon = isActive ? item.activeIcon : item.icon;

            return (
              <SheetClose key={item.name} asChild>
                <Link
                  href={item.href}
                  className={`
                    group flex items-center px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive 
                      ? 'bg-bitcoin/10 dark:bg-bitcoin/20 text-bitcoin border-l-4 border-bitcoin' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-bitcoin dark:hover:text-bitcoin hover:bg-slate-100 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  <Icon className={`
                    w-6 h-6 mr-4 transition-all duration-300 group-hover:scale-110
                    ${isActive ? 'text-bitcoin' : 'text-slate-500 group-hover:text-bitcoin dark:text-slate-400 dark:group-hover:text-bitcoin'}
                  `} />
                  <div className="flex flex-col min-w-0">
                    <span className={`
                      font-semibold transition-all duration-300
                      ${isActive ? 'text-bitcoin' : 'text-deepSlate group-hover:text-bitcoin dark:text-slate-300 dark:group-hover:text-bitcoin'}
                    `}>
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.description}
                    </span>
                  </div>
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <button
              onClick={toggleTheme}
              className="flex items-center w-full px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:text-bitcoin dark:hover:text-bitcoin hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? (
                <SunIconSolid className="w-6 h-6 mr-4 text-yellow-400" />
              ) : (
                <MoonIconSolid className="w-6 h-6 mr-4 text-slate-600 dark:text-slate-300" />
              )}
              <div className="flex flex-col items-start">
                <span className="font-semibold">
                  Switch to {theme === 'dark' ? 'light' : 'dark'} mode
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Change appearance
                </span>
              </div>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
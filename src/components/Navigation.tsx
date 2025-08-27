'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import MobileNavSheet from '@/components/MobileNavSheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { ToolsDropdown } from '@/components/navigation/ToolsDropdown';
import { cn } from '@/lib/utils';
// Import icons directly for navigation
import {
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
import { SatoshiOutlineIcon, BitcoinPresentationIcon, MinerOutlineIcon } from '@/components/icons';

export default function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      name: 'Calculator',
      href: '/calculator',
      icon: CalculatorIcon,
      activeIcon: CalculatorIconSolid,
    },
    {
      name: 'Performance',
      href: '/historical',
      icon: ClockIcon,
      activeIcon: ClockIconSolid,
    },
    {
      name: 'Dashboard',
      href: '/track',
      icon: MagnifyingGlassIcon,
      activeIcon: MagnifyingGlassIconSolid,
    },
    {
      name: 'Tools',
      href: '/bitcoin-tools',
      icon: LinkIcon,
      activeIcon: LinkIconSolid,
    },
    {
      name: 'Guide',
      href: '/learn',
      icon: BookOpenIcon,
      activeIcon: BookOpenIconSolid,
    },
  ];

  return (
    <header className="navbar sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-1 sm:py-1.5">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink">
            <div className="group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">
              <SatoshiOutlineIcon className="w-12 h-12 sm:w-14 sm:h-14" size={56} />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-deepSlate dark:text-slate-100 group-hover:text-bitcoin dark:group-hover:text-bitcoin transition-colors duration-300">
                <span className="hidden sm:inline">BitcoinBenefits</span>
                <span className="sm:hidden">Bitcoin Benefits</span>
              </h1>
              <p className="hidden sm:block text-xs sm:text-sm text-slate-500 dark:text-slate-700 group-hover:text-bitcoin-600 dark:group-hover:text-bitcoin transition-colors duration-300 leading-tight">
                Secure their future. Secure your team.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation with Shadcn NavigationMenu */}
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList>
              {navItems.map((item) => {
                const isActive = item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
                const Icon = isActive ? item.activeIcon : item.icon;

                // Special handling for Tools dropdown
                if (item.name === 'Tools') {
                  return (
                    <NavigationMenuItem key={item.name}>
                      <NavigationMenuTrigger 
                        className={cn(
                          "flex items-center space-x-2",
                          isActive && "text-bitcoin dark:text-bitcoin"
                        )}
                      >
                        <Icon className={`w-6 h-6 transition-all duration-300 ${isActive
                          ? 'text-bitcoin dark:text-bitcoin'
                          : 'text-slate-500 group-hover:text-bitcoin dark:text-slate-300 dark:group-hover:text-bitcoin'
                          }`} />
                        <span>{item.name}</span>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ToolsDropdown />
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  );
                }

                // Regular navigation items
                return (
                  <NavigationMenuItem key={item.name}>
                    <Link href={item.href} legacyBehavior passHref>
                      <NavigationMenuLink 
                        className={cn(
                          navigationMenuTriggerStyle(),
                          isActive && "text-bitcoin dark:text-bitcoin bg-bitcoin/10 dark:bg-bitcoin/20"
                        )}
                      >
                        <span className="flex items-center space-x-2">
                          <Icon className={`w-6 h-6 flex-shrink-0 transition-all duration-300 ${isActive
                            ? 'text-bitcoin dark:text-bitcoin'
                            : 'text-slate-500 group-hover:text-bitcoin dark:text-slate-300 dark:group-hover:text-bitcoin'
                            }`} />
                          <span>{item.name}</span>
                        </span>
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Mobile Icon Navigation (Small Desktop/Tablet) */}
          <nav className="hidden sm:flex lg:hidden items-center space-x-2">
            {navItems.map((item) => {
              const isActive = item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
              const Icon = isActive ? item.activeIcon : item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`p-2 rounded-sm transition-all duration-300 ${isActive
                    ? 'bg-bitcoin/10 dark:bg-bitcoin/20'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  title={item.name}
                >
                  <Icon className={`w-6 h-6 transition-all duration-300 ${isActive
                    ? 'text-bitcoin dark:text-bitcoin'
                    : 'text-slate-500 hover:text-bitcoin dark:text-slate-300 dark:hover:text-bitcoin'
                    }`} />
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? (
                <SunIconSolid className="w-6 h-6 text-yellow-400 hover:text-yellow-300 transition-colors" />
              ) : (
                <MoonIconSolid className="w-6 h-6 text-gray-700 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200 transition-colors" />
              )}
            </button>
            
            {/* Mobile Navigation Sheet */}
            <MobileNavSheet />
          </div>
        </div>
      </div>

      {/* Legacy Mobile Navigation - Hidden, kept for reference */}
      <div className="hidden">
        {/* Mobile navigation now handled by MobileNavSheet component */}
      </div>
    </header>
  );
}
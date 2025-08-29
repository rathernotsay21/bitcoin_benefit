'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MobileNavSheet from '@/components/MobileNavSheet';
import { useTheme } from '@/components/ThemeProvider';
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
// Optimized icon imports - use bundle to reduce duplicates
import { Icons } from '@/components/icons/HeroIconBundle';
import { SatoshiOutlineIcon, BitcoinPresentationIcon, MinerOutlineIcon } from '@/components/icons';

export default function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    {
      name: 'Home',
      href: '/',
      icon: Icons.Home,
      activeIcon: Icons.HomeSolid,
    },
    {
      name: 'Calculator',
      href: '/calculator',
      icon: Icons.Calculator,
      activeIcon: Icons.CalculatorSolid,
    },
    {
      name: 'Performance',
      href: '/historical',
      icon: Icons.Clock,
      activeIcon: Icons.ClockSolid,
    },
    {
      name: 'Dashboard',
      href: '/track',
      icon: Icons.MagnifyingGlass,
      activeIcon: Icons.MagnifyingGlassSolid,
    },
    {
      name: 'Tools',
      href: '/bitcoin-tools',
      icon: Icons.Link,
      activeIcon: Icons.LinkSolid,
    },
    {
      name: 'Guide',
      href: '/learn',
      icon: Icons.BookOpen,
      activeIcon: Icons.BookOpenSolid,
    },
  ];

  return (
    <header className="navbar sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-1 sm:py-1.5">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 sm:space-x-4 group flex-shrink-0 mr-8">
            <div className="group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">
              <SatoshiOutlineIcon className="w-12 h-12 sm:w-14 sm:h-14" size={56} />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-deepSlate dark:text-slate-100 group-hover:text-bitcoin dark:group-hover:text-bitcoin transition-colors duration-300 whitespace-nowrap">
                <span className="hidden sm:inline">Bitcoin Benefits</span>
                <span className="sm:hidden">Bitcoin Benefits</span>
              </h1>
              <p className="hidden sm:block text-xs sm:text-sm text-slate-500 dark:text-slate-400 group-hover:text-bitcoin-600 dark:group-hover:text-bitcoin transition-colors duration-300 leading-tight whitespace-nowrap">
                Secure their future. Secure your team.
              </p>
            </div>
          </Link>

          {/* Spacer */}
          <div className="flex-grow"></div>
          
          {/* Desktop Navigation with Shadcn NavigationMenu */}
          <div className="hidden xl:flex items-center gap-6 flex-shrink-0">
            <NavigationMenu>
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
            
            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-sm transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800 group"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Icons.Sun className="w-6 h-6 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-200" />
              ) : (
                <Icons.Moon className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-bitcoin transition-colors duration-200" />
              )}
            </button>
          </div>

          {/* Mobile Icon Navigation (Small Desktop/Tablet) */}
          <nav className="hidden sm:flex xl:hidden items-center space-x-3 flex-shrink-0 ml-auto">
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
            
            {/* Dark Mode Toggle for Tablet */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-sm transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800 group"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Icons.Sun className="w-6 h-6 text-yellow-400 group-hover:text-yellow-300 transition-colors duration-200" />
              ) : (
                <Icons.Moon className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-bitcoin transition-colors duration-200" />
              )}
            </button>
          </nav>

          {/* Mobile Menu */}
          <div className="flex items-center sm:hidden ml-auto">
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
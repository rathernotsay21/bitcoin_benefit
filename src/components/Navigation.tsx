'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import MobileNavSheet from '@/components/MobileNavSheet';
// Optimize icon imports with dynamic loading
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
      name: 'Plans',
      href: '/calculator',
      icon: CalculatorIcon,
      activeIcon: CalculatorIconSolid,
    },
    {
      name: 'Results',
      href: '/historical',
      icon: ClockIcon,
      activeIcon: ClockIconSolid,
    },
    {
      name: 'Track',
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
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink">
            <div className="icon-container group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">
              <SatoshiOutlineIcon className="w-12 h-12 sm:w-16 sm:h-16" size={64} />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-deepSlate dark:text-slate-100 group-hover:text-bitcoin dark:group-hover:text-bitcoin transition-colors duration-300">
                <span className="hidden sm:inline">BitcoinBenefits.me</span>
                <span className="sm:hidden">Bitcoin Benefits</span>
              </h1>
              <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-300 group-hover:text-bitcoin-600 dark:group-hover:text-bitcoin transition-colors duration-300 leading-tight">
                Secure their future. Secure your team.
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
            {navItems.map((item) => {
              const isActive = item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
              const Icon = isActive ? item.activeIcon : item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-link flex items-center space-x-2 group ${isActive ? 'active' : ''
                    }`}
                >
                  <Icon className={`w-5 h-5 transition-all duration-300 ${isActive
                    ? 'text-bitcoin dark:text-bitcoin'
                    : 'text-slate-500 group-hover:text-bitcoin dark:text-slate-300 dark:group-hover:text-bitcoin'
                    }`} />
                  <span className={`transition-all duration-300 ${isActive
                    ? 'text-bitcoin dark:text-bitcoin'
                    : 'text-deepSlate group-hover:text-bitcoin dark:text-slate-300 dark:group-hover:text-bitcoin'
                    }`}>{item.name}</span>
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
                <MoonIconSolid className="w-6 h-6 text-slate-600 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200 transition-colors" />
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
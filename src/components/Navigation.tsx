'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
// Optimize icon imports with dynamic loading
import dynamic from 'next/dynamic';

// Load essential navigation icons dynamically  
const HomeIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.HomeIcon })), { ssr: false });
const CalculatorIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.CalculatorIcon })), { ssr: false });
const SunIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.SunIcon })), { ssr: false });
const MoonIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.MoonIcon })), { ssr: false });
const ClockIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.ClockIcon })), { ssr: false });
const AcademicCapIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.AcademicCapIcon })), { ssr: false });
const LinkIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => ({ default: mod.LinkIcon })), { ssr: false });

// Load solid versions dynamically
const HomeIconSolid = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.HomeIcon })), { ssr: false });
const CalculatorIconSolid = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.CalculatorIcon })), { ssr: false });
const SunIconSolid = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.SunIcon })), { ssr: false });
const MoonIconSolid = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.MoonIcon })), { ssr: false });
const ClockIconSolid = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.ClockIcon })), { ssr: false });
const AcademicCapIconSolid = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.AcademicCapIcon })), { ssr: false });
const LinkIconSolid = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.LinkIcon })), { ssr: false });
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
      name: 'Forecast',
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
      name: 'Status',
      href: '/track',
      icon: LinkIcon,
      activeIcon: LinkIconSolid,
    },
    {
      name: 'Guide',
      href: '/learn',
      icon: AcademicCapIcon,
      activeIcon: AcademicCapIconSolid,
    },
  ];

  return (
    <header className="navbar sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink">
            <div className="icon-container group-hover:rotate-12 transition-transform duration-300 flex-shrink-0">
              <SatoshiOutlineIcon className="w-7 h-7 sm:w-8 sm:h-8" size={32} />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-700 dark:text-slate-100 group-hover:text-bitcoin dark:group-hover:text-bitcoin transition-colors duration-300">
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
                    : 'text-slate-500 group-hover:text-bitcoin dark:text-slate-300 dark:group-hover:text-bitcoin'
                    }`}>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side: Dark Mode Toggle + CTA Button */}
          <div className="flex items-center space-x-2 sm:space-x-3 ml-2 sm:ml-4 flex-shrink-0">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle group"
              aria-label="Toggle dark mode"
            >
              {theme === 'light' ? (
                <MoonIcon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-[-20deg]" />
              ) : (
                <SunIcon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45" />
              )}
            </button>

            {/* CTA Button */}
            <a
              href="https://river.com/signup?r=RH5MJKJM"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-3 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Buy Bitcoin</span>
              <span className="sm:hidden">Buy</span>
            </a>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center justify-between pb-4 border-t border-slate-200 dark:border-slate-800 pt-4 overflow-x-auto">
          <div className="flex items-center justify-around w-full px-2">
            {navItems.map((item) => {
              const isActive = item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
              const Icon = isActive ? item.activeIcon : item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-link flex flex-col items-center space-y-1 px-2 py-1 transition-all duration-300 ${isActive ? 'active text-bitcoin dark:text-bitcoin' : 'text-slate-500 dark:text-slate-300 hover:text-bitcoin dark:hover:text-bitcoin'
                    }`}
                >
                  <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-bitcoin dark:text-bitcoin scale-110' : 'text-slate-500 dark:text-slate-300 group-hover:text-bitcoin dark:group-hover:text-bitcoin'
                    }`} />
                  <span className={`text-xs font-medium transition-all duration-300 ${isActive ? 'text-bitcoin dark:text-bitcoin' : 'text-slate-500 dark:text-slate-300'
                    }`}>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Dark Mode Toggle - Remove from mobile nav as it's already in header */}
          {/* <button
            onClick={toggleTheme}
            className="theme-toggle group"
            aria-label="Toggle dark mode"
          >
            {theme === 'light' ? (
              <MoonIcon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-[-20deg]" />
            ) : (
              <SunIcon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45" />
            )}
          </button> */}
        </nav>
      </div>
    </header>
  );
}
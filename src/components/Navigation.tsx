'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { 
  HomeIcon, 
  CalculatorIcon, 
  SunIcon,
  MoonIcon,
  ClockIcon,
  AcademicCapIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  CalculatorIcon as CalculatorIconSolid, 
  SunIcon as SunIconSolid,
  MoonIcon as MoonIconSolid,
  ClockIcon as ClockIconSolid,
  AcademicCapIcon as AcademicCapIconSolid,
  LinkIcon as LinkIconSolid
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
      name: 'Historical',
      href: '/historical',
      icon: ClockIcon,
      activeIcon: ClockIconSolid,
    },
    {
      name: 'On-Chain',
      href: '/on-chain',
      icon: LinkIcon,
      activeIcon: LinkIconSolid,
    },
    {
      name: 'Learn More',
      href: '/learn-more',
      icon: AcademicCapIcon,
      activeIcon: AcademicCapIconSolid,
    },
  ];

  return (
    <header className="navbar sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="icon-container group-hover:rotate-12 transition-transform duration-300">
              <SatoshiOutlineIcon className="w-9 h-9" size={36} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-slate-700 dark:text-slate-100 group-hover:text-bitcoin dark:group-hover:text-bitcoin transition-colors duration-300">
                BitcoinBenefits.me
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-300 group-hover:text-bitcoin-600 dark:group-hover:text-bitcoin transition-colors duration-300">
                Secure their future. Secure your team.
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = isActive ? item.activeIcon : item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-link flex items-center space-x-2 group ${
                    isActive ? 'active' : ''
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-all duration-300 ${
                    isActive 
                      ? 'text-bitcoin dark:text-bitcoin' 
                      : 'text-slate-500 group-hover:text-bitcoin dark:text-slate-300 dark:group-hover:text-bitcoin'
                  }`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side: Dark Mode Toggle + CTA Button */}
          <div className="flex items-center space-x-3">
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
            <Link 
              href="/calculator" 
              className="btn-primary text-sm"
            >
              <span className="hidden sm:inline">Start Planning</span>
              <span className="sm:hidden">Start</span>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center justify-between pb-4 border-t border-slate-200 dark:border-slate-800 pt-4 overflow-x-auto">
          <div className="flex items-center space-x-3 sm:space-x-6 min-w-0 flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = isActive ? item.activeIcon : item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center space-y-1 ${
                    isActive ? 'text-bitcoin dark:text-bitcoin' : 'text-slate-500 dark:text-slate-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 transition-all duration-300 ${
                    isActive ? 'text-bitcoin dark:text-bitcoin scale-110' : 'text-slate-500 dark:text-slate-300'
                  }`} />
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Mobile Dark Mode Toggle */}
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
        </nav>
      </div>
    </header>
  );
}
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  CalculatorIcon, 
  ChartBarIcon, 
  AcademicCapIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  CalculatorIcon as CalculatorIconSolid, 
  ChartBarIcon as ChartBarIconSolid, 
  AcademicCapIcon as AcademicCapIconSolid 
} from '@heroicons/react/24/solid';

export default function Navigation() {
  const pathname = usePathname();

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
      icon: ChartBarIcon,
      activeIcon: ChartBarIconSolid,
    },
    {
      name: 'Learn More',
      href: '/learn-more',
      icon: AcademicCapIcon,
      activeIcon: AcademicCapIconSolid,
    },
  ];

  return (
    <header className="navbar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="icon-container group-hover:rotate-12">
              <CurrencyDollarIcon className="w-7 h-7 text-bitcoin-dark transition-colors duration-300" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900 group-hover:text-bitcoin transition-colors duration-300">
                Bitcoin Benefits
              </h1>
              <p className="text-xs text-gray-500 group-hover:text-bitcoin-dark transition-colors duration-300">
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
                      ? 'text-bitcoin-dark' 
                      : 'text-gray-500 group-hover:text-bitcoin'
                  }`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
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
        <nav className="md:hidden flex items-center justify-center space-x-6 pb-4 border-t border-gray-100 pt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = isActive ? item.activeIcon : item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center space-y-1 ${
                  isActive ? 'text-bitcoin-dark' : 'text-gray-500'
                }`}
              >
                <Icon className={`w-6 h-6 transition-all duration-300 ${
                  isActive ? 'text-bitcoin-dark scale-110' : 'text-gray-500'
                }`} />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
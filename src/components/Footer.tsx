'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalculatorIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { BitcoinIcon } from '@/components/icons';

export default function Footer() {
  const pathname = usePathname();

  // Don't show CTA on calculator/historical pages (they already have their own calculators)
  const showCTA = !pathname.includes('/calculator') && !pathname.includes('/historical');

  // Get page name for bottom left display
  const getPageName = () => {
    if (pathname === '/') return 'Home';
    if (pathname.includes('/calculator')) return 'Future Plans';
    if (pathname.includes('/historical')) return 'Past Results';
    if (pathname.includes('/track')) return 'Track Bonuses';
    if (pathname.includes('/learn')) return 'How It Works';
    return 'Bitcoin Benefit';
  };

  return (
    <>
      {/* CTA Section - Only show on non-calculator pages */}
      {showCTA && (
        <section className="py-20 bg-gradient-to-br from-bitcoin to-orange-600 dark:from-slate-700 dark:to-slate-800 relative overflow-hidden transition-colors duration-300">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
          </div>

          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Stop Losing Your Best Employees
            </h3>
            <p className="text-xl text-orange-100 dark:text-slate-300 mb-10 leading-relaxed">
              Bitcoin awards cost less than you think and mean more than you know.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/calculator"
                className="bg-offWhite dark:bg-slate-800 text-bitcoin dark:text-slate-100 hover:bg-bitcoin-50 dark:hover:bg-slate-700 font-bold py-4 px-10 rounded-sm text-lg transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md inline-flex items-center justify-center space-x-2"
              >
                <CalculatorIcon className="w-5 h-5" />
                <span>Build Your Plan</span>
              </Link>
              <Link
                href="/historical"
                className="bg-orange-600 dark:bg-slate-600 text-white hover:bg-orange-700 dark:hover:bg-slate-500 font-bold py-4 px-10 rounded-sm text-lg transition-all duration-300 transform hover:scale-105 border-2 border-white/30 shadow-sm hover:shadow-md inline-flex items-center justify-center space-x-2"
              >
                <ClockIcon className="w-5 h-5" />
                <span>See the Proof</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer Section */}
      <footer className="bg-slate-800 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Footer Top - Logo and Tagline */}
          <div className="text-center pt-12 pb-8">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-sm mb-6">
              <BitcoinIcon className="w-8 h-8 text-bitcoin" />
            </div>
            <h4 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Build generational wealth for the people who build your business.
            </h4>
            <p className="text-slate-400 mb-8">
              Simple Bitcoin awards that help small businesses compete for talent
            </p>
          </div>

          <div className="border-t border-slate-700 py-12">
            {/* Navigation Links */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
              {/* Main Pages */}
              <div>
                <h5 className="text-white font-semibold mb-4">Quick Links</h5>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="text-slate-400 hover:text-bitcoin transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/track" className="text-slate-400 hover:text-bitcoin transition-colors">
                      Track Bonuses
                    </Link>
                  </li>
                  <li>
                    <Link href="/learn" className="text-slate-400 hover:text-bitcoin transition-colors">
                      Learn More
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Forecast Calculator */}
              <div>
                <h5 className="text-white font-semibold mb-4">Future Plans</h5>
                <ul className="space-y-2">
                  <li>
                    <Link href="/calculator" className="text-slate-400 hover:text-bitcoin transition-colors">
                      Plan Calculator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/calculator?scheme=accelerator"
                      className="text-slate-400 hover:text-bitcoin transition-colors text-sm"
                    >
                      → Pioneer Plan
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/calculator?scheme=steady-builder"
                      className="text-slate-400 hover:text-bitcoin transition-colors text-sm"
                    >
                      → Stacker Plan
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/calculator?scheme=slow-burn"
                      className="text-slate-400 hover:text-bitcoin transition-colors text-sm"
                    >
                      → Builder Plan
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Historical Calculator */}
              <div>
                <h5 className="text-white font-semibold mb-4">Past Performance</h5>
                <ul className="space-y-2">
                  <li>
                    <Link href="/historical" className="text-slate-400 hover:text-bitcoin transition-colors">
                      Past Performance
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/historical?scheme=accelerator"
                      className="text-slate-400 hover:text-bitcoin transition-colors text-sm"
                    >
                      → Pioneer History
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/historical?scheme=steady-builder"
                      className="text-slate-400 hover:text-bitcoin transition-colors text-sm"
                    >
                      → Stacker History
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/historical?scheme=slow-burn"
                      className="text-slate-400 hover:text-bitcoin transition-colors text-sm"
                    >
                      → Builder History
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h5 className="text-white font-semibold mb-4">Resources</h5>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://river.com/signup?r=RH5MJKJM"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-bitcoin transition-colors"
                    >
                      Buy Bitcoin (River)
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/learn#hardware-wallets"
                      className="text-slate-400 hover:text-bitcoin transition-colors"
                    >
                      Hardware Wallets
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://foundationdevices.com/passport/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-bitcoin transition-colors text-sm"
                    >
                      → Passport
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://blockstream.com/jade/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-bitcoin transition-colors text-sm"
                    >
                      → Jade
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://shiftcrypto.ch/bitbox02/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-bitcoin transition-colors text-sm"
                    >
                      → BitBox02
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h5 className="text-white font-semibold mb-4">Legal</h5>
                <ul className="space-y-2">
                  <li>
                    <Link href="/terms" className="text-slate-400 hover:text-bitcoin transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-slate-400 hover:text-bitcoin transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/risk-disclosure" className="text-slate-400 hover:text-bitcoin transition-colors">
                      Risk Disclosure
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Page Name & Credits */}
            <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-start md:items-end">
              {/* Large Page Name - Bottom Left */}
              <div className="w-full md:w-1/3 mb-4 md:mb-0">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white/20">
                  {getPageName()}
                </h2>
              </div>

              {/* Credits - Bottom Right */}
              <div className="text-sm text-slate-500">
                <p>Webmaster - Rather Notsay</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
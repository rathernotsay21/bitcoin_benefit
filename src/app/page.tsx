'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BitcoinAPI } from '@/lib/bitcoin-api';
import { HistoricalBitcoinAPI } from '@/lib/historical-bitcoin-api';
import Navigation from '@/components/Navigation';
import { useTheme } from '@/components/ThemeProvider';
import {
  ChartBarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  LockClosedIcon,
  CalculatorIcon,
  ScaleIcon,
  ClockIcon,
  AcademicCapIcon,
  EyeIcon
} from '@heroicons/react/24/solid';
import { SatoshiOutlineIcon, MiningOutlineIcon, BitcoinIcon, BitcoinCircleOutlineIcon, SatoshiIcon, BitcoinPresentationIcon } from '@/components/icons';

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function HomePage() {
  const { theme } = useTheme();
  const [currentBitcoinPrice, setCurrentBitcoinPrice] = useState(113976); // Fallback
  const [historicalPrice2020, setHistoricalPrice2020] = useState(11000); // Fallback
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Fetch current Bitcoin price
        const currentPriceData = await BitcoinAPI.getCurrentPrice();
        setCurrentBitcoinPrice(currentPriceData.price);

        // Fetch 2020 historical price
        const historical2020 = await HistoricalBitcoinAPI.getYearlyPrice(2020);
        setHistoricalPrice2020(historical2020.average);
      } catch (error) {
        console.error('Failed to fetch Bitcoin prices:', error);
        // Keep fallback values
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // Calculate dynamic values
  const bitcoinAmount = 0.1;
  const costBasis = bitcoinAmount * historicalPrice2020;
  const presentValue = bitcoinAmount * currentBitcoinPrice;
  const totalReturn = presentValue - costBasis;
  const returnPercentage = ((totalReturn / costBasis) * 100);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-slate-900 transition-colors duration-300">
      <Navigation />

      {/* Hero Section */}
      <section className="hero-gradient py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-bitcoin dark:bg-white rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-bitcoin-gradient dark:bg-white rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-bitcoin dark:bg-slate-700 rounded-2xl mb-6 animate-float">
              <SatoshiIcon className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-5xl font-bold text-slate-700 dark:text-slate-100 sm:text-6xl md:text-7xl leading-tight">
              Reward loyalty with
              <span className="text-bitcoin dark:text-bitcoin block mt-2">sound money.</span>
            </h2>
            <p className="mt-8 max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Create an employee retention protocol that works.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/calculator" className="btn-primary text-lg px-10 py-4 inline-flex items-center justify-center space-x-2">
                <BitcoinCircleOutlineIcon className="w-8 h-8" />
                <span>Start Planning</span>
              </Link>
              <Link href="/historical" className="btn-secondary text-lg px-10 py-4 inline-flex items-center justify-center space-x-2">
                <ClockIcon className="w-6 h-6" />
                <span>Historical Results</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-700 dark:text-slate-100 mb-4">
              Choose a Strategy
            </h3>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Three approaches designed to align incentives and build wealth
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Bitcoin Pioneer */}
            <Link href="/calculator?plan=accelerator" className="feature-card group">
              <div className="text-center">
                <div className="icon-container mx-auto mb-6">
                  <BitcoinIcon className="w-8 h-8 text-bitcoin dark:text-bitcoin transition-all duration-300" />
                </div>
                <h4 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mb-3">
                  Bitcoin Pioneer
                </h4>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  Immediate grants for companies ready to lead in digital asset compensation.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-slate-600 dark:text-slate-300">0.02 ₿ initial grant</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-slate-600 dark:text-slate-300">50% vested at 5 years</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-slate-600 dark:text-slate-300">100% vested at 10 years</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <span className="badge badge-orange">Beast Mode</span>
                </div>
              </div>
            </Link>

            {/* Stacking Sats */}
            <Link href="/calculator?plan=steady-builder" className="feature-card group">
              <div className="text-center">
                <div className="icon-container mx-auto mb-6">
                  <SatoshiIcon className="w-8 h-8 text-bitcoin dark:text-bitcoin transition-all duration-300" size={32} />
                </div>
                <h4 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mb-3">
                  Sat Stacker
                </h4>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  Minimize market timing risk with annual grants during the first five years.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-slate-600 dark:text-slate-300">0.015 ₿ initial grant</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-slate-600 dark:text-slate-300">0.001 ₿ yearly bonus</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-slate-600 dark:text-slate-300">Balanced approach</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <span className="badge badge-success">Mid</span>
                </div>
              </div>
            </Link>

            {/* Wealth Builder */}
            <Link href="/calculator?plan=slow-burn" className="feature-card group">
              <div className="text-center">
                <div className="icon-container mx-auto mb-6">
                  <MiningOutlineIcon className="w-8 h-8 text-bitcoin dark:text-bitcoin transition-all duration-300" />
                </div>
                <h4 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mb-3">
                  Wealth Builder
                </h4>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  Most conservative approach to spread costs across entire vesting period.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-slate-600 dark:text-slate-300">0.002 ₿ yearly for 10 years</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-slate-600 dark:text-slate-300">Highest cost basis</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-slate-600 dark:text-slate-300">Gradual accumulation</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">Grindset</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Historical Analysis Section */}
      <section className="py-24 section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl font-bold text-slate-700 dark:text-slate-100 mb-6">
                Learn from Bitcoin's History
              </h3>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                See how your vesting scheme would have performed using real historical Bitcoin data from 2015 onwards.
              </p>

              <div className="space-y-5 mb-10">
                <div className="flex items-center group">
                  <div className="w-10 h-10 bg-bitcoin dark:bg-slate-700 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <ChartBarIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-300 text-lg">Analyze real historical performance</span>
                </div>
                <div className="flex items-center group">
                  <div className="w-10 h-10 bg-bitcoin dark:bg-slate-700 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <ScaleIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-300 text-lg">Compare different cost basis methods</span>
                </div>
                <div className="flex items-center group">
                  <div className="w-10 h-10 bg-bitcoin dark:bg-slate-700 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <CalculatorIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-300 text-lg">Calculate actual returns and growth</span>
                </div>
              </div>

              <Link href="/historical" className="btn-primary text-lg px-10 py-4 inline-flex items-center space-x-2">
                <ClockIcon className="w-5 h-5" />
                <span>Try Historical Analysis</span>
              </Link>
            </div>

            <div className="card lg:p-10 glass glow-orange">
              <div className="text-center">
                <h4 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mb-8">
                  Historical Performance Example
                </h4>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl">
                    <span className="font-medium text-slate-600 dark:text-slate-300">Starting Year</span>
                    <span className="font-bold text-slate-700 dark:text-slate-100 text-lg">2020</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl">
                    <span className="font-medium text-slate-600 dark:text-slate-300">Initial Grant</span>
                    <span className="font-bold text-slate-700 dark:text-slate-100 text-lg">₿0.1</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-slate-700 dark:to-slate-600 rounded-xl border-2 border-bitcoin dark:border-slate-700">
                    <span className="font-medium text-orange-800 dark:text-slate-300">Cost Basis (2020)</span>
                    <span className="font-bold text-orange-900 dark:text-slate-100 text-lg">
                      {isLoading ? '$1,100' : formatUSD(costBasis)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                    <span className="font-medium text-blue-800 dark:text-slate-300">Present Value (2025)</span>
                    <span className="font-bold text-blue-900 dark:text-slate-100 text-lg">
                      {isLoading ? '$11,398' : formatUSD(presentValue)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-xl">
                    <span className="font-medium text-green-800 dark:text-green-100">Total Return</span>
                    <span className="font-bold text-green-900 dark:text-green-100 text-lg">
                      {isLoading
                        ? '+936% ($10,298)'
                        : `+${returnPercentage.toFixed(0)}% (${formatUSD(totalReturn)})`
                      }
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    * Example based on Bitcoin Pioneer scheme (₿0.1) starting in 2020.
                    Past performance does not guarantee future results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-700 dark:text-slate-100 mb-4">
              Why Bitcoin Vesting?
            </h3>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Transform your benefits package with the world's premier digital asset
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-start group">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 dark:from-green-700 dark:to-emerald-700 rounded-2xl flex items-center justify-center mt-1 group-hover:scale-110 transition-transform">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-5">
                  <h4 className="text-xl font-bold text-slate-700 dark:text-slate-100 mb-2">
                    Enhanced Retention
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Employees stay when they see their balance grow over time.
                  </p>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-700 dark:to-indigo-700 rounded-2xl flex items-center justify-center mt-1 group-hover:scale-110 transition-transform">
                  <AcademicCapIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-5">
                  <h4 className="text-xl font-bold text-slate-700 dark:text-slate-100 mb-2">
                    Financial Education
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Introduce your team to sound money and help them build wealth.
                  </p>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="flex-shrink-0 w-12 h-12 bg-bitcoin dark:bg-slate-700 rounded-2xl flex items-center justify-center mt-1 group-hover:scale-110 transition-transform">
                  <EyeIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-5">
                  <h4 className="text-xl font-bold text-slate-700 dark:text-slate-100 mb-2">
                    Transparent & Trackable
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Employees can verify their balance on-line 24/7.
                  </p>
                </div>
              </div>
            </div>

            <div className="card lg:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-bitcoin dark:bg-bitcoin rounded-full blur-3xl opacity-10"></div>
              <div className="relative text-center">
                <div className="text-5xl font-bold text-bitcoin dark:text-bitcoin mb-3">₿0.015</div>
                <div className="text-lg text-slate-600 dark:text-slate-300 mb-8">Standard Initial Grant</div>

                <div className="grid grid-cols-2 gap-6 text-center mb-8">
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                    <div className="text-3xl font-bold text-slate-700 dark:text-slate-100">5</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">Years to 50%</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                    <div className="text-3xl font-bold text-slate-700 dark:text-slate-100">10</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">Years to 100%</div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-600 dark:text-slate-300 space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-slate-700 dark:to-slate-600 rounded-lg">
                      <span className="font-bold">Bitcoin Pioneer:</span>
                      <span className="text-bitcoin dark:text-bitcoin font-bold">0.02 ₿ upfront</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-lg">
                      <span className="font-bold">Stacking Sats:</span>
                      <span className="text-green-700 dark:text-green-100 font-bold">0.015 ₿ + 0.001 ₿/yr</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-900 rounded-lg">
                      <span className="font-bold">Wealth Builder:</span>
                      <span className="text-purple-700 dark:text-purple-100 font-bold">0.002 ₿/year × 10</span>
                    </div>

                    <div className="pt-3 text-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400">All schemes total 0.02 ₿</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-bitcoin dark:bg-slate-700 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Start Planning?
          </h3>
          <p className="text-2xl text-orange-100 dark:text-slate-300 mb-10 leading-relaxed">
            Use our calculators to model different vesting scenarios and analyze historical performance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/calculator" className="bg-white dark:bg-slate-800 text-bitcoin dark:text-slate-100 hover:bg-orange-50 dark:hover:bg-slate-700 font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-xl inline-flex items-center justify-center space-x-2">
              <CalculatorIcon className="w-5 h-5" />
              <span>Planning Calculator</span>
            </Link>
            <Link href="/historical" className="bg-orange-600 dark:bg-slate-600 text-white hover:bg-orange-700 dark:hover:bg-slate-500 font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 border-2 border-white/30 shadow-xl inline-flex items-center justify-center space-x-2">
              <ClockIcon className="w-5 h-5" />
              <span>Historical Results</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6">
              <BitcoinIcon className="w-8 h-8 text-bitcoin" />
            </div>
            <h4 className="text-3xl font-bold mb-4">Secure their future. Secure your team.</h4>
            <p className="text-gray-400 mb-8 text-lg">
              Empowering employers to reward teams with sound money
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Webmaster - Rather Notsay</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
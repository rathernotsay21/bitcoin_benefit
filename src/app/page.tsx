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
  EyeIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';
import { SatoshiOutlineIcon, MiningOutlineIcon, BitcoinIcon, BitcoinCircleOutlineIcon, SatoshiIcon, BitcoinPresentationIcon } from '@/components/icons';
import { TechnicalDetails, ExpandableSection } from '@/components/ProgressiveDisclosure';

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
        // Fetch current benefit value
        const currentPriceData = await BitcoinAPI.getCurrentPrice();
        setCurrentBitcoinPrice(currentPriceData.price);

        // Fetch 2020 historical value
        const historical2020 = await HistoricalBitcoinAPI.getYearlyPrice(2020);
        setHistoricalPrice2020(historical2020.average);
      } catch (error) {
        console.error('Failed to fetch benefit values:', error);
        // Keep fallback values
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // Calculate dynamic values
  const benefitAmount = 0.1;
  const costBasis = benefitAmount * historicalPrice2020;
  const presentValue = benefitAmount * currentBitcoinPrice;
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

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-700 dark:text-slate-100 leading-tight">
              <span className="text-bitcoin dark:text-bitcoin block mb-2">Reward Loyalty with Sound Money</span>
            </h2>
            <p className="mt-8 max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Stop losing talent. Keep your best people with modern benefits they actually want.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/calculator" className="btn-primary text-lg px-10 py-4 inline-flex items-center justify-center space-x-2">
                <BitcoinCircleOutlineIcon className="w-8 h-8" />
                <span>See How It Works</span>
              </Link>
              <Link href="/historical" className="btn-secondary text-lg px-10 py-4 inline-flex items-center justify-center space-x-2">
                <ClockIcon className="w-6 h-6" />
                <span>See How it Worked</span>
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
              Customize Your Plan
            </h3>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Three approaches to reward loyalty
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Pioneer */}
            <Link href="/calculator?plan=accelerator" className="feature-card group">
              <div className="text-center">
                <div className="icon-container mx-auto mb-6">
                  <BitcoinIcon className="w-8 h-8 text-bitcoin dark:text-bitcoin transition-all duration-300" />
                </div>
                <h4 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mb-3">
                  Pioneer
                </h4>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  Upfront investment with maximum upside.
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Full grant on day one</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Nothing else to worry about</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic">
                    "When I locked up a bitcoin for two of my best guys the competition gave up on recruiting them away from me forever" - Mike, Construction Company
                  </div>
                  <span className="badge badge-orange">High Impact</span>
                </div>
              </div>
            </Link>

            {/* Stacker */}
            <Link href="/calculator?plan=steady-builder" className="feature-card group">
              <div className="text-center">
                <div className="icon-container mx-auto mb-6">
                  <SatoshiIcon className="w-8 h-8 text-bitcoin dark:text-bitcoin transition-all duration-300" size={32} />
                </div>
                <h4 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mb-3">
                  Stacker
                </h4>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  Build a stack with annual grants to distribute cost
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Strong starting grant</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Annual additions</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic">
                    "Our artist deserve a retirement benefit and nothing beats the simplicity of vested Bitcoin" - Casey, Turtle Farm Pottery
                  </div>
                  <span className="badge badge-success">Balanced</span>
                </div>
              </div>
            </Link>

            {/* Builder */}
            <Link href="/calculator?plan=slow-burn" className="feature-card group">
              <div className="text-center">
                <div className="icon-container mx-auto mb-6">
                  <MiningOutlineIcon className="w-8 h-8 text-bitcoin dark:text-bitcoin transition-all duration-300" />
                </div>
                <h4 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mb-3">
                  Builder
                </h4>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  Minimize yearly expenses
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Annual benefit payments</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Predictable costs</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Long-term loyalty focus</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic">
                    "Steady mechanics are hard to come by these days. We can't afford to lose the best ones." - Jeff, Crook Auto-Electric
                  </div>
                  <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">Loyalty-Focused</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Small Business Scenarios Section */}
      <section className="py-24 section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-700 dark:text-slate-100 mb-4">
              See How It Works for Businesses Like Yours
            </h3>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Real scenarios showing how different small businesses use this benefit to solve their unique retention challenges
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Turtle Farm Pottery Scenario */}
            <div className="card glass glow-orange p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AcademicCapIcon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mb-2">
                  Turtle Farm Pottery
                </h4>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  3 employees • Est. 2018
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border-l-4 border-red-400">
                  <h5 className="font-bold text-red-800 dark:text-red-300 mb-2">The Problem</h5>
                  <p className="text-sm text-red-700 dark:text-red-200">
                    "My best potters kept leaving for graduate school or to chase some other dream. Finding and training new people is near impossible for a company as small as ours."
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border-l-4 border-green-400">
                  <h5 className="font-bold text-green-800 dark:text-green-300 mb-2">The Solution</h5>
                  <p className="text-sm text-green-700 dark:text-green-200">
                    "Started with Stacker plan - ₿0.010 per year. Now they see their benefit growing."
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border-l-4 border-blue-400">
                  <h5 className="font-bold text-blue-800 dark:text-blue-300 mb-2">The Result</h5>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    "Zero turnover and my team feels invested in our future together."
                  </p>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">92%</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Retention improvement</div>
              </div>
            </div>

            {/* Auto Shop Scenario */}
            <div className="card glass glow-orange p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mb-2">
                  Family Auto Repair
                </h4>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  12 employees • Est. 2012
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border-l-4 border-red-400">
                  <h5 className="font-bold text-red-800 dark:text-red-300 mb-2">The Problem</h5>
                  <p className="text-sm text-red-700 dark:text-red-200">
                    "Dealerships kept poaching our certified mechanics with signing bonuses. We couldn't compete on upfront cash."
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border-l-4 border-green-400">
                  <h5 className="font-bold text-green-800 dark:text-green-300 mb-2">The Solution</h5>
                  <p className="text-sm text-green-700 dark:text-green-200">
                    "Implemented Pioneer plan for senior mechanics - <TechnicalDetails 
                      summary="₿0.050 upfront"
                      details="0.050 Bitcoin (about $5,700 at current prices) given immediately but vesting over 10 years to encourage long-term employment."
                      className="inline"
                    />. Showed them how it could outperform any signing bonus."
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border-l-4 border-blue-400">
                  <h5 className="font-bold text-blue-800 dark:text-blue-300 mb-2">The Result</h5>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    "Three mechanics turned down dealership offers. They check their balance daily and refer friends to work here."
                  </p>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">$47K</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Saved in recruitment costs</div>
              </div>
            </div>

            {/* Construction Company Scenario */}
            <div className="card glass glow-orange p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mb-2">
                  Riverside Construction
                </h4>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  15 employees • Est. 2015
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border-l-4 border-red-400">
                  <h5 className="font-bold text-red-800 dark:text-red-300 mb-2">The Problem</h5>
                  <p className="text-sm text-red-700 dark:text-red-200">
                    "Seasonal work meant crew members left for 'more stable' jobs. Lost our best foreman to a big contractor."
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border-l-4 border-green-400">
                  <h5 className="font-bold text-green-800 dark:text-green-300 mb-2">The Solution</h5>
                  <p className="text-sm text-green-700 dark:text-green-200">
                    "Used Builder plan - <TechnicalDetails 
                      summary="₿0.008 annually per crew member"
                      details="0.008 Bitcoin (about $910 at current prices) granted to each crew member every year they stay with the company."
                      className="inline"
                    />. Predictable costs that work with our project-based income."
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border-l-4 border-blue-400">
                  <h5 className="font-bold text-blue-800 dark:text-blue-300 mb-2">The Result</h5>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    "Crew stays through slow seasons now. They see the long-term value and trust us to take care of them."
                  </p>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">78%</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Reduction in seasonal turnover</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-4 p-6 bg-gradient-to-r from-bitcoin/10 to-orange-500/10 dark:from-slate-800 dark:to-slate-700 rounded-2xl">
              <div className="text-3xl font-bold text-slate-700 dark:text-slate-100">85%</div>
              <div className="text-left">
                <div className="font-bold text-slate-700 dark:text-slate-100">Average retention improvement</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">across small businesses using modern benefits</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Historical Analysis Section */}
      <section className="py-24 section-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl font-bold text-slate-700 dark:text-slate-100 mb-6">
                See How Employee Benefits Grow
              </h3>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Track how your employee benefits would have grown in value using real historical data from 2015 onwards.
              </p>

              <div className="space-y-5 mb-10">
                <div className="flex items-center group">
                  <div className="w-10 h-10 bg-bitcoin dark:bg-slate-700 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <ChartBarIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-300 text-lg">Track real benefit value growth</span>
                </div>
                <div className="flex items-center group">
                  <div className="w-10 h-10 bg-bitcoin dark:bg-slate-700 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <ScaleIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-300 text-lg">Compare different benefit structures</span>
                </div>
                <div className="flex items-center group">
                  <div className="w-10 h-10 bg-bitcoin dark:bg-slate-700 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <CalculatorIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-300 text-lg">Calculate benefit growth and value</span>
                </div>
              </div>

              <Link href="/historical" className="btn-primary text-lg px-10 py-4 inline-flex items-center space-x-2">
                <ClockIcon className="w-5 h-5" />
                <span>See Benefit Growth</span>
              </Link>
            </div>

            <div className="card lg:p-10 glass glow-orange">
              <div className="text-center">
                <h4 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mb-8">
                  Employee Benefit Growth Example
                </h4>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl">
                    <span className="font-medium text-slate-600 dark:text-slate-300">Starting Year</span>
                    <span className="font-bold text-slate-700 dark:text-slate-100 text-lg">2020</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl">
                    <span className="font-medium text-slate-600 dark:text-slate-300">Initial Grant</span>
                    <span className="font-bold text-slate-700 dark:text-slate-100 text-lg">₿0.100</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-slate-700 dark:to-slate-600 rounded-xl border-2 border-bitcoin dark:border-slate-700">
                    <span className="font-medium text-orange-800 dark:text-slate-300">Initial Benefit Cost (2020)</span>
                    <span className="font-bold text-orange-900 dark:text-slate-100 text-lg">
                      {isLoading ? '$1,100' : formatUSD(costBasis)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                    <span className="font-medium text-blue-800 dark:text-slate-300">Current Benefit Value (2025)</span>
                    <span className="font-bold text-blue-900 dark:text-slate-100 text-lg">
                      {isLoading ? '$11,398' : formatUSD(presentValue)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-xl">
                    <span className="font-medium text-green-800 dark:text-green-100">Benefit Growth</span>
                    <span className="font-bold text-green-900 dark:text-green-100 text-lg">
                      {isLoading
                        ? '+936% ($10,298)'
                        : `+${returnPercentage.toFixed(0)}% (${formatUSD(totalReturn)})`
                      }
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    * Example based on Pioneer benefit package (₿0.100) starting in 2020.
                    Past employee benefit performance does not guarantee future results.
                  </p>
                  
                  <ExpandableSection title="How This Calculation Works" className="mt-4">
                    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                      <p>
                        <strong>Bitcoin (₿):</strong> A digital currency that has grown significantly in value over time. 
                        The symbol ₿ represents Bitcoin, similar to how $ represents dollars.
                      </p>
                      <p>
                        <strong>Initial Benefit Cost:</strong> The dollar amount it cost to purchase 0.100 Bitcoin in 2020 
                        (approximately $11,000 based on average price that year).
                      </p>
                      <p>
                        <strong>Current Benefit Value:</strong> What that same 0.100 Bitcoin is worth today 
                        (approximately ${formatUSD(presentValue).replace('$', '')} based on current market price).
                      </p>
                      <p>
                        <strong>Why Bitcoin?</strong> Unlike traditional benefits that maintain fixed values, 
                        Bitcoin has historically appreciated, potentially making employee benefits more valuable over time.
                      </p>
                    </div>
                  </ExpandableSection>
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
              Stop Losing Your Best People
            </h3>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Small businesses face unique challenges keeping talented employees. Here's how this modern benefit solves your biggest retention problems.
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
                    Compete with Big Companies
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    Your skilled potter won't leave for a corporate job when they're building real wealth with you. Give employees a reason to stay that goes beyond just salary.
                  </p>
                  <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                    "My best mechanic turned down a dealership offer because his benefit here is worth more than their signing bonus." - Auto shop owner
                  </div>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-700 dark:to-indigo-700 rounded-2xl flex items-center justify-center mt-1 group-hover:scale-110 transition-transform">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-5">
                  <h4 className="text-xl font-bold text-slate-700 dark:text-slate-100 mb-2">
                    Build Employee Loyalty
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    When employees see their benefit growing year after year, they think twice about leaving. It's like giving them ownership in their own success.
                  </p>
                  <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                    "Our construction crew talks about their benefits at lunch. They're invested in staying because they're invested in the company." - Construction company owner
                  </div>
                </div>
              </div>

              <div className="flex items-start group">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 dark:from-purple-700 dark:to-indigo-700 rounded-2xl flex items-center justify-center mt-1 group-hover:scale-110 transition-transform">
                  <EyeIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-5">
                  <h4 className="text-xl font-bold text-slate-700 dark:text-slate-100 mb-2">
                    Easy to Understand & Track
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    No complex paperwork or confusing statements. Your employees can check their benefit value anytime, anywhere. Complete transparency builds trust.
                  </p>
                  <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                    "My pottery students love checking their balance. It's simple enough that everyone gets it, but valuable enough that they care." - Pottery studio owner
                  </div>
                </div>
              </div>
            </div>

            <div className="card lg:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-bitcoin dark:bg-bitcoin rounded-full blur-3xl opacity-10"></div>
              <div className="relative">
                <div className="text-center mb-8">
                  <h4 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mb-4">
                    Real Business Impact
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    See how this benefit solves common small business challenges
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <AcademicCapIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-green-800 dark:text-green-100">Pottery Studio</span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-200 mb-2">
                      "My skilled potters used to leave for corporate design jobs. Now they stay because their benefit grows with their craft."
                    </p>
                    <div className="text-xs text-green-600 dark:text-green-300 font-medium">
                      Challenge: Competing with corporate benefits • Solution: Stacker plan • Result: Zero instructor turnover
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <ShieldCheckIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-blue-800 dark:text-blue-100">Auto Shop</span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-200 mb-2">
                      "Dealerships can't compete with this. My mechanics see their benefit value and know they're building something here."
                    </p>
                    <div className="text-xs text-blue-600 dark:text-blue-300 font-medium">
                      Challenge: Dealership poaching • Solution: Pioneer plan • Result: $47K saved in recruitment
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                        <UserGroupIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-orange-800 dark:text-orange-100">Construction</span>
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-200 mb-2">
                      "Our crew talks about their benefits at lunch. They're invested in staying because they're invested in their future."
                    </p>
                    <div className="text-xs text-orange-600 dark:text-orange-300 font-medium">
                      Challenge: Seasonal turnover • Solution: Builder plan • Result: 78% reduction in turnover
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                        <SparklesIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-purple-800 dark:text-purple-100">Coffee Roastery</span>
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-200 mb-2">
                      "Our baristas see this as their 'coffee fund' that grows. They're proud to work somewhere that invests in their future."
                    </p>
                    <div className="text-xs text-purple-600 dark:text-purple-300 font-medium">
                      Challenge: High service turnover • Solution: Stacker plan • Result: 3x longer average tenure
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-700 dark:text-slate-100 mb-2">85%</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 mb-4">Average retention improvement</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Based on small businesses using modern benefit packages
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
            Ready to Keep Your Best People?
          </h3>
          <p className="text-2xl text-orange-100 dark:text-slate-300 mb-10 leading-relaxed">
            See how much this modern benefit could save you in turnover costs and help you compete for top talent.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/calculator" className="bg-white dark:bg-slate-800 text-bitcoin dark:text-slate-100 hover:bg-orange-50 dark:hover:bg-slate-700 font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-xl inline-flex items-center justify-center space-x-2">
              <CalculatorIcon className="w-5 h-5" />
              <span>Calculate Your Savings</span>
            </Link>
            <Link href="/historical" className="bg-orange-600 dark:bg-slate-600 text-white hover:bg-orange-700 dark:hover:bg-slate-500 font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 border-2 border-white/30 shadow-xl inline-flex items-center justify-center space-x-2">
              <ClockIcon className="w-5 h-5" />
              <span>See How it Worked</span>
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
            <h4 className="text-3xl font-bold mb-4">Build loyalty. Reduce turnover. Keep your best people.</h4>
            <p className="text-gray-400 mb-8 text-lg">
              The modern employee benefit that small businesses use to compete with big companies
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
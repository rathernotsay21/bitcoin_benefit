'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BitcoinAPI } from '@/lib/bitcoin-api';
import { HistoricalBitcoinAPI } from '@/lib/historical-bitcoin-api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useTheme } from '@/components/ThemeProvider';
// Optimize icon imports - only load what's actually used
import dynamic from 'next/dynamic';
const ClockIcon = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.ClockIcon })), { ssr: false });
import { SatoshiOutlineIcon, MiningOutlineIcon, BitcoinIcon, BitcoinCircleOutlineIcon, SatoshiIcon, BitcoinPresentationIcon } from '@/components/icons';
// Remove unused imports
// import { TechnicalDetails, ExpandableSection } from '@/components/ProgressiveDisclosure';

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
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: '#F4F6F8' }}>
      <Navigation />

      {/* Hero Section */}
      <section className="hero-gradient hero-texture py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-bitcoin dark:bg-white rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-bitcoin-gradient dark:bg-white rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-bitcoin dark:bg-slate-700 rounded-2xl mb-6 animate-float">
              <SatoshiIcon className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-deepSlate dark:text-slate-100 leading-tight">
              <span className="text-deepSlate dark:text-slate-500" style={{opacity: 0.8}}>Reward Loyalty </span>
              <span className="text-bitcoin dark:text-bitcoin">with Sound Money</span>
            </h2>
            <p className="mt-8 max-w-2xl mx-auto text-xl text-deepSlate dark:text-slate-300 leading-relaxed">
              Keep your best people with modern benefits they actually want.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/calculator" className="btn-primary text-lg px-10 py-4 inline-flex items-center justify-center space-x-2">
                <BitcoinCircleOutlineIcon className="w-8 h-8" />
                <span>Pick a Strategy</span>
              </Link>
              <Link href="/historical" className="btn-secondary text-lg px-10 py-4 inline-flex items-center justify-center space-x-2">
                <ClockIcon className="w-6 h-6" />
                <span>Past Performance</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-lightGrey dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-deepSlate dark:text-slate-100 mb-4">
              Customize Your Plan
            </h3>
            <p className="text-xl text-deepSlate dark:text-slate-300 max-w-2xl mx-auto">
              Three approaches to reward loyalty
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Pioneer */}
            <Link href="/calculator/accelerator" className="feature-card group">
              <div className="text-center">
                <div className="icon-container mx-auto mb-6">
                  <BitcoinIcon className="w-8 h-8 text-bitcoin dark:text-bitcoin transition-all duration-300" />
                </div>
                <h4 className="text-2xl font-bold text-deepSlate dark:text-slate-100 mb-3">
                  Pioneer
                </h4>
                <p className="text-deepSlate dark:text-slate-300 mb-6 leading-relaxed">
                  Maximum upside
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-sm text-deepSlate dark:text-slate-300">Full grant on day one</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-sm text-deepSlate dark:text-slate-300">Nothing else to worry about</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic">
                    "When I locked up a bitcoin for two of my best guys the competition gave up on recruiting them away from me forever" - Mike, Construction Company
                  </div>
                  <span className="badge badge-orange">All In</span>
                </div>
              </div>
            </Link>

            {/* Stacker */}
            <Link href="/calculator/steady-builder" className="feature-card group">
              <div className="text-center">
                <div className="icon-container mx-auto mb-6">
                  <SatoshiIcon className="w-8 h-8 text-bitcoin dark:text-bitcoin transition-all duration-300" size={32} />
                </div>
                <h4 className="text-2xl font-bold text-deepSlate dark:text-slate-100 mb-3">
                  Stacker
                </h4>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  Build a stack
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
            <Link href="/calculator/slow-burn" className="feature-card group">
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
                    <span className="text-sm text-slate-600 dark:text-slate-300">Ten Years of Annual grants</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-sm text-slate-600 dark:text-slate-300">Lowest yearly costs</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic">
                    "Steady mechanics are hard to come by these days. We can't afford to lose the best ones." - Jeff, Crook Auto-Electric
                  </div>
                  <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">Conservative</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* HIDDEN SECTIONS */}
      {/* 
      Small Business Scenarios Section - HIDDEN
      Historical Analysis Section - HIDDEN  
      Benefits Section ("Stop Losing Your Best People") - HIDDEN
      */}

      {/* Footer */}
      <Footer />
    </div>
  );
}
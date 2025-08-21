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
import Particles from '@/components/ui/particles';
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
      <section className="relative min-h-[400px] py-24 overflow-hidden bg-slate-950 dark:bg-slate-950">
        {/* Particles Background */}
        <div className="absolute inset-0">
          <Particles 
            quantity={120}
            ease={50}
            color="#F7931A"
            refresh={false}
            className="opacity-60"
          />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-950/60 to-slate-900/80"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-bitcoin/90 backdrop-blur-sm rounded-2xl mb-6 animate-float">
              <SatoshiIcon className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">Reward Loyalty</span>
              <br />
              <span className="bg-gradient-to-r from-bitcoin via-orange-400 to-bitcoin bg-clip-text text-transparent">with Sound Money</span>
            </h1>
            <p className="mt-8 max-w-2xl mx-auto text-xl text-slate-300 leading-relaxed">
              No-nonsense benefits that grow stronger over time.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/calculator" className="btn-primary text-lg px-10 py-4 inline-flex items-center justify-center space-x-2 backdrop-blur-sm">
                <BitcoinCircleOutlineIcon className="w-8 h-8" />
                <span>Build Your Plan</span>
              </Link>
              <Link href="/historical" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 text-lg px-10 py-4 inline-flex items-center justify-center space-x-2 rounded-2xl font-bold">
                <ClockIcon className="w-6 h-6" />
                <span>See Past Results</span>
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
              Three Ways to Reward Your Team
            </h3>
            <p className="text-xl text-deepSlate dark:text-slate-300 max-w-2xl mx-auto">
              Pick the plan that fits your budget and goals
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
                  Upfront spend for best returns
                </p>
                <div className="space-y-3 text-base">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-base text-deepSlate dark:text-slate-300">All in on day one</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-base text-deepSlate dark:text-slate-300">Simple one-time setup</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <span className="badge badge-orange">Beast Mode</span>
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
                  Start big and keep stacking
                </p>
                <div className="space-y-3 text-base">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-base text-slate-600 dark:text-slate-300">Large award</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-base text-slate-600 dark:text-slate-300">Plus yearly awards</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <span className="badge badge-success">Mid</span>
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
                  Least annual cost
                </p>
                <div className="space-y-3 text-base">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-base text-slate-600 dark:text-slate-300">Least volatility</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-bitcoin dark:bg-bitcoin rounded-full"></div>
                    <span className="text-base text-slate-600 dark:text-slate-300">Most affordable</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
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
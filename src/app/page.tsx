'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BitcoinAPI } from '@/lib/bitcoin-api';
import { HistoricalBitcoinAPI } from '@/lib/historical-bitcoin-api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useTheme } from '@/components/ThemeProvider';
import { MiningOutlineIcon, BitcoinIcon, SatoshiIcon } from '@/components/icons';
import Particles from '@/components/ui/particles';
import { HeroButtons } from '@/components/HeroButtons';
// Remove unused imports
// import { TechnicalDetails, ExpandableSection } from '@/components/ProgressiveDisclosure';


export default function HomePage() {
  const { theme: _theme } = useTheme();
  const [currentBitcoinPrice, setCurrentBitcoinPrice] = useState(113976); // Fallback
  const [historicalPrice2020, setHistoricalPrice2020] = useState(11000); // Fallback
  const [_isLoading, setIsLoading] = useState(true);

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
  const _returnPercentage = ((totalReturn / costBasis) * 100);

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: '#F4F6F8' }}>
      <Navigation />

      {/* Hero Section */}
      <section className="hero-section relative min-h-[400px] py-24 overflow-hidden bg-slate-950 dark:bg-slate-950">
        {/* Particles Background */}
        <Particles
          className="absolute inset-0 z-0"
          quantity={50}
          ease={80}
          color="#94a3b8"
          refresh={false}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-900/60 via-slate-950/40 to-slate-900/60 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full animate-float shadow-sm" style={{backgroundColor: '#F7931A'}}>
                <SatoshiIcon className="w-10 h-10" size={40} color="#FFFFFF" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">Reward Loyalty</span>
              <br />
              <span className="bg-gradient-to-r from-bitcoin via-orange-400 to-bitcoin bg-clip-text text-transparent">with Sound Money</span>
            </h1>
            <p className="mt-8 max-w-2xl mx-auto text-xl text-slate-300 leading-relaxed">
              The future ain't what it used to be.
            </p>
            <HeroButtons />
          </div>
        </div>
      </section>

      {/* Why Bitcoin Benefits Section */}
      <section className="py-24 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-deepSlate dark:text-slate-100 mb-6">
              Forward-Thinking Companies Choose Bitcoin
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Traditional benefits packages cost more and deliver less every year. Health insurance premiums rise. 
              401(k) matches barely beat inflation. Stock options are complex and often worthless.
            </p>
            <p className="text-2xl font-semibold text-bitcoin dark:text-bitcoin mt-6">
              Bitcoin is different.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Proven Over 16 Years */}
            <div className="bg-lightGrey dark:bg-slate-800 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-bitcoin/10 flex items-center justify-center">
                  <BitcoinIcon className="w-8 h-8 text-bitcoin" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-deepSlate dark:text-slate-100 mb-4 text-center">
                Proven Over 16 Years
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Since 2009, bitcoin has survived every crisis, crash, and criticism to become a multi-trillion-dollar 
                asset class. Billions of dollars are held in bitcoin by family office investors
                <sup className="text-bitcoin font-semibold ml-1">[1,2]</sup>, registered investment advisors
                <sup className="text-bitcoin font-semibold ml-1">[3]</sup>, Fidelity, and even the United States Treasury
                <sup className="text-bitcoin font-semibold ml-1">[5]</sup>.
              </p>
            </div>

            {/* Simple to Implement */}
            <div className="bg-lightGrey dark:bg-slate-800 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-bitcoin/10 flex items-center justify-center">
                  <SatoshiIcon className="w-8 h-8 text-bitcoin" size={32} color="#F7931A" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-deepSlate dark:text-slate-100 mb-4 text-center">
                Simple to Implement
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                No complicated vesting schedules. No lawyers. No administrative nightmares. Buy bitcoin, set a timeline, done. 
                Your employees can track their benefits value in real-time. You can even document the process with{' '}
                <a 
                  href="https://opentimestamps.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-bitcoin hover:text-orange-500 underline transition-colors duration-200"
                >
                  Open Timestamps
                </a>.
              </p>
            </div>

            {/* Meaningful to Employees */}
            <div className="bg-lightGrey dark:bg-slate-800 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-bitcoin/10 flex items-center justify-center">
                  <MiningOutlineIcon className="w-8 h-8 text-bitcoin" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-deepSlate dark:text-slate-100 mb-4 text-center">
                Meaningful to Employees
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Young talent values bitcoin. Use bitcoin to{' '}
                <Link href="/calculator/accelerator" className="text-bitcoin hover:text-orange-500 underline transition-colors duration-200">
                  recruit
                </Link>,{' '}
                <Link href="/calculator/steady-builder" className="text-bitcoin hover:text-orange-500 underline transition-colors duration-200">
                  retain
                </Link>, or{' '}
                <Link href="/calculator/slow-burn" className="text-bitcoin hover:text-orange-500 underline transition-colors duration-200">
                  reward
                </Link>{' '}
                your team. Offering it shows you understand their values and are investing in their long-term future, 
                not just their next paycheck.
              </p>
            </div>
          </div>

          {/* Sources */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Sources
              </h4>
              <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <p>
                  <span className="font-semibold text-bitcoin">[1]</span> BNY Mellon Wealth Management: 33% of US family offices actively investing in crypto, 39% globally investing or exploring
                </p>
                <p>
                  <span className="font-semibold text-bitcoin">[2]</span> Goldman Sachs: 26% of family offices invested in crypto, up from 15% in 2021
                </p>
                <p>
                  <span className="font-semibold text-bitcoin">[3]</span> CoinShares Research: RIAs hold $10.3 billion in Bitcoin ETFs (50% of all 13F Bitcoin ETF holdings of $21.2 billion)
                </p>
                <p>
                  <span className="font-semibold text-bitcoin">[4]</span> SEC 13F Filings: RIAs with &gt;$100M AUM required to report holdings quarterly
                </p>
                <p>
                  <span className="font-semibold text-bitcoin">[5]</span> US Department of Justice: US government holds ~198,000-212,000 BTC from criminal seizures
                </p>
              </div>
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
            <Link href="/calculator/accelerator" className="feature-card group h-full">
              <div className="flex flex-col h-full">
                {/* Icon - keep centered */}
                <div className="text-center mb-6">
                  <div className="icon-container solid-bg-icon mx-auto bg-slate-600 group-hover:bg-bitcoin transition-colors duration-300">
                    <BitcoinIcon className="w-8 h-8 transition-colors duration-300 text-bitcoin group-hover:text-white" />
                  </div>
                </div>
                
                {/* Content - left aligned, grows to fill space */}
                <div className="flex-1 flex flex-col">
                  <h4 className="text-2xl font-bold text-deepSlate dark:text-slate-100 mb-4 text-center">
                    Pioneer
                  </h4>
                  <p className="text-deepSlate dark:text-slate-300 leading-relaxed text-left flex-1">
                    Are you ready to lead? Make a significant upfront investment and like the companies that offered early stock options, you'll attract top talent with outsized potential rewards.
                  </p>
                </div>
                
                {/* Badge - aligned at bottom */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
                  <span className="badge badge-orange">Move First, Win Big</span>
                </div>
              </div>
            </Link>

            {/* Stacker */}
            <Link href="/calculator/steady-builder" className="feature-card group h-full">
              <div className="flex flex-col h-full">
                {/* Icon - keep centered */}
                <div className="text-center mb-6">
                  <div className="icon-container solid-bg-icon mx-auto bg-slate-600 group-hover:bg-bitcoin transition-colors duration-300">
                    <SatoshiIcon className="w-8 h-8 transition-colors duration-300 text-bitcoin group-hover:text-white" size={32} />
                  </div>
                </div>
                
                {/* Content - left aligned, grows to fill space */}
                <div className="flex-1 flex flex-col">
                  <h4 className="text-2xl font-bold text-deepSlate dark:text-slate-100 mb-4 text-center">
                    Stacker
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-left flex-1">
                    Combine a meaningful initial grant with annual additions. Like dollar-cost averaging, this spreads your risk while building substantial value over time.
                  </p>
                </div>
                
                {/* Badge - aligned at bottom */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
                  <span className="badge badge-success">Consistent Growth</span>
                </div>
              </div>
            </Link>

            {/* Builder */}
            <Link href="/calculator/slow-burn" className="feature-card group h-full">
              <div className="flex flex-col h-full">
                {/* Icon - keep centered */}
                <div className="text-center mb-6">
                  <div className="icon-container solid-bg-icon mx-auto bg-slate-600 group-hover:bg-bitcoin transition-colors duration-300">
                    <MiningOutlineIcon className="w-8 h-8 transition-colors duration-300 text-bitcoin group-hover:text-white" />
                  </div>
                </div>
                
                {/* Content - left aligned, grows to fill space */}
                <div className="flex-1 flex flex-col">
                  <h4 className="text-2xl font-bold text-deepSlate dark:text-slate-100 mb-4 text-center">
                    Builder
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-left flex-1">
                    Start small, think big. Make bitcoin benefits affordable with smaller, regular contributions that add up over time. Like climbing a mountain, each step seems small but leads to remarkable heights.
                  </p>
                </div>
                
                {/* Badge - aligned at bottom */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
                  <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">Start Small, Think Big</span>
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
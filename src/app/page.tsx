'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BitcoinAPI } from '@/lib/bitcoin-api';
import { HistoricalBitcoinAPI } from '@/lib/historical-bitcoin-api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useTheme } from '@/components/ThemeProvider';
import { MiningOutlineIcon, BitcoinIcon, SatoshiIcon } from '@/components/icons';
import { 
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
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
            <p className="mt-8 max-w-2xl mx-auto text-xl text-slate-700 leading-relaxed">
              The future ain't what it used to be.
            </p>
            <HeroButtons />
          </div>
        </div>
      </section>

      {/* Why Bitcoin Benefits Section */}
      <section className="py-24 bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
        {/* Gradient background similar to footer */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-bitcoin/10 via-transparent to-orange-600/10"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section Header - Left aligned with strong hierarchy */}
          <div className="text-left mb-16">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-2 h-8 bg-bitcoin rounded-full"></div>
              <span className="text-bitcoin uppercase text-sm font-bold tracking-wider">The Problem</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-deepSlate dark:text-white mb-6 leading-tight max-w-4xl">
              Forward-Thinking Companies
              <span className="block text-bitcoin">Choose Bitcoin</span>
            </h2>
            
            <div className="max-w-3xl">
              <p className="text-lg text-slate-600 dark:text-slate-700 leading-relaxed mb-6">
                Traditional benefits packages cost more and deliver less every year. Health insurance premiums rise. 
                401(k) matches barely beat inflation. Stock options are complex and often worthless.
              </p>
              
              <div className="flex items-center gap-3">
                <div className="w-1 h-12 bg-gradient-to-b from-bitcoin to-orange-500 rounded-full"></div>
                <p className="text-xl text-deepSlate dark:text-white font-semibold">
                  Bitcoin is different.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Grid - 2x2 grid with perfectly aligned cards */}
          <div className="grid lg:grid-cols-2 lg:auto-rows-fr gap-8 mb-12">
            {/* Proven Over 16 Years - Top Left */}
            <div className="bg-lightGrey dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-sm p-6 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-300 h-full flex">
              <div className="flex items-start gap-4 w-full">
                <div className="w-12 h-12 rounded-sm bg-bitcoin/20 flex items-center justify-center flex-shrink-0">
                  <ChartBarIcon className="w-6 h-6 text-bitcoin" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-deepSlate dark:text-white mb-3">
                    Proven Over 16 Years
                  </h3>
                  <p className="text-slate-600 dark:text-slate-700 leading-relaxed">
                    Since 2009, bitcoin has survived every crisis, crash, and criticism to become a multi-trillion-dollar 
                    asset class. Billions of dollars are held in bitcoin by family office investors
                    <sup className="text-bitcoin font-semibold ml-1">[1,2]</sup>, registered investment advisors
                    <sup className="text-bitcoin font-semibold ml-1">[3]</sup>, Fidelity, and even the United States Treasury
                    <sup className="text-bitcoin font-semibold ml-1">[5]</sup>.
                  </p>
                </div>
              </div>
            </div>

            {/* Meaningful to Employees - Top Right */}
            <div className="bg-lightGrey dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-sm p-6 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-300 h-full flex">
              <div className="flex items-start gap-4 w-full">
                <div className="w-12 h-12 rounded-sm bg-bitcoin/20 flex items-center justify-center flex-shrink-0">
                  <HeartIcon className="w-6 h-6 text-bitcoin" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-deepSlate dark:text-white mb-3">
                  A Benefit Employees Value
                  </h3>
                  <p className="text-slate-600 dark:text-slate-700 leading-relaxed">
                    Young talent values bitcoin. Use bitcoin to recruit, retain, or reward 
                    your team. Offering it shows you understand their values and want to help build their future, 
                    not just fund their paycheck.
                  </p>
                </div>
              </div>
            </div>

            {/* Simple to Implement - Bottom Left */}
            <div className="bg-lightGrey dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-sm p-6 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-300 h-full flex">
              <div className="flex items-start gap-4 w-full">
                <div className="w-12 h-12 rounded-sm bg-bitcoin/20 flex items-center justify-center flex-shrink-0">
                  <ClipboardDocumentCheckIcon className="w-6 h-6 text-bitcoin" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-deepSlate dark:text-white mb-3">
                    Simple to Implement
                  </h3>
                  <p className="text-slate-600 dark:text-slate-700 leading-relaxed">
                    No complicated vesting schedules. No lawyers. No administrative nightmares. Buy bitcoin, set a timeline, done. 
                    Your employees can track their benefits value in real-time. You can even document the process with{' '}
                    <a 
                      href="https://opentimestamps.org/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-bitcoin hover:text-orange-400 underline transition-colors duration-200"
                    >
                      Open Timestamps
                    </a>.
                  </p>
                </div>
              </div>
            </div>
            
            {/* The Bottom Line - Bottom Right */}
            <div className="bg-bitcoin-50 dark:bg-bitcoin/10 border border-bitcoin-200 dark:border-bitcoin/30 rounded-sm p-6 hover:bg-bitcoin-100 dark:hover:bg-bitcoin/15 transition-all duration-300 h-full flex">
              <div className="flex items-start gap-4 w-full">
                <div className="w-12 h-12 rounded-sm bg-bitcoin flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-2xl">₿</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-deepSlate dark:text-white mb-3">
                    The Bottom Line
                  </h3>
                  <p className="text-slate-600 dark:text-slate-700 leading-relaxed">
                    While traditional benefits lose value to inflation, bitcoin has the potential to grow significantly over time, 
                    creating real wealth for the people who build your business.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sources */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-8">
            <div className="bg-lightGrey dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-sm p-6">
              <h4 className="text-xs font-bold text-deepSlate dark:text-white mb-4 uppercase tracking-wider">
                Sources
              </h4>
              <div className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
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
      <section className="py-24 bg-slate-800 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
        {/* Subtle gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700/30 via-transparent to-slate-900/30"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-left mb-16">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-2 h-8 bg-bitcoin rounded-full"></div>
              <span className="text-bitcoin uppercase text-sm font-bold tracking-wider">Choose Your Path</span>
            </div>
            
            <h3 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Choose Your Bitcoin
              <span className="block text-bitcoin">Benefits Plan</span>
            </h3>
            
            <p className="text-lg text-slate-700 max-w-2xl leading-relaxed">
              Pick the plan that fits your budget and goals. Each approach has been designed for different business situations and growth stages.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Pioneer */}
            <Link href="/calculator?scheme=pioneer" className="group block">
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-sm p-8 h-full hover:bg-slate-700/50 hover:border-bitcoin/30 transition-all duration-300 relative overflow-hidden">
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-bitcoin/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon and title */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-sm bg-bitcoin/20 flex items-center justify-center flex-shrink-0 group-hover:bg-bitcoin transition-colors duration-300">
                      <BitcoinIcon className="w-6 h-6 text-bitcoin group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-white mb-2">
                        Pioneer
                      </h4>
                      <div className="inline-flex items-center px-3 py-1 bg-bitcoin/20 rounded-full">
                        <span className="text-bitcoin text-sm font-semibold">Move First, Win Big</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-slate-600 dark:text-slate-700 leading-relaxed">
                      Are you ready to lead? Make a significant upfront contribution and just like the companies that offered early stock options, you'll attract top talent with outsized potential rewards.
                    </p>
                  </div>
                  
                  {/* Call to action */}
                  <div className="mt-6 pt-4 border-t border-slate-600/50">
                    <div className="flex items-center text-bitcoin group-hover:text-orange-400 transition-colors duration-300">
                      <span className="text-sm font-semibold">Calculate Pioneer Plan</span>
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Stacker */}
            <Link href="/calculator?scheme=stacker" className="group block">
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-sm p-8 h-full hover:bg-slate-700/50 hover:border-bitcoin/30 transition-all duration-300 relative overflow-hidden">
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-bitcoin/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon and title */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-sm bg-bitcoin/20 flex items-center justify-center flex-shrink-0 group-hover:bg-bitcoin transition-colors duration-300">
                      <SatoshiIcon className="w-6 h-6 text-bitcoin group-hover:text-white transition-colors duration-300" size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-white mb-2">
                        Stacker
                      </h4>
                      <div className="inline-flex items-center px-3 py-1 bg-green-500/20 rounded-full">
                        <span className="text-green-400 text-sm font-semibold">Consistent Growth</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-slate-600 dark:text-slate-700 leading-relaxed">
                      Combine a meaningful initial award with annual additions. Like dollar-cost averaging, this spreads your risk while building substantial value over time.
                    </p>
                  </div>
                  
                  {/* Call to action */}
                  <div className="mt-6 pt-4 border-t border-slate-600/50">
                    <div className="flex items-center text-bitcoin group-hover:text-orange-400 transition-colors duration-300">
                      <span className="text-sm font-semibold">Calculate Stacker Plan</span>
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Builder */}
            <Link href="/calculator?scheme=builder" className="group block">
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-sm p-8 h-full hover:bg-slate-700/50 hover:border-bitcoin/30 transition-all duration-300 relative overflow-hidden">
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-bitcoin/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon and title */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-sm bg-bitcoin/20 flex items-center justify-center flex-shrink-0 group-hover:bg-bitcoin transition-colors duration-300">
                      <MiningOutlineIcon className="w-6 h-6 text-bitcoin group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-white mb-2">
                        Builder
                      </h4>
                      <div className="inline-flex items-center px-3 py-1 bg-purple-500/20 rounded-full">
                        <span className="text-purple-400 text-sm font-semibold">Start Small, Think Big</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-slate-600 dark:text-slate-700 leading-relaxed">
                      Start small, think big. Make bitcoin benefits affordable with smaller, regular contributions that add up over time. Like climbing a mountain, each step seems small but leads to remarkable heights.
                    </p>
                  </div>
                  
                  {/* Call to action */}
                  <div className="mt-6 pt-4 border-t border-slate-600/50">
                    <div className="flex items-center text-bitcoin group-hover:text-orange-400 transition-colors duration-300">
                      <span className="text-sm font-semibold">Calculate Builder Plan</span>
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
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
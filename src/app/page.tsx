import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { MiningOutlineIcon, BitcoinIcon, SatoshiIcon } from '@/components/icons';
import { 
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeroButtons } from '@/components/HeroButtons';
import { BitcoinPriceDisplay } from '@/components/client/BitcoinPriceDisplay';
import FeatureCarousel from '@/components/FeatureCarousel';

export default function HomePage() {

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: '#F4F6F8' }}>
      <Navigation />

      {/* Hero Section */}
      <section className="hero-section relative min-h-[400px] bg-slate-950 dark:bg-slate-950 overflow-hidden">
        {/* Hex pattern background similar to vesting presets */}
        <div className="absolute inset-0">
          {/* Base gradient layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900"></div>
          
          {/* Hex pattern texture overlay */}
          <div className="absolute inset-0 hero-hex-pattern"></div>
          
          {/* Subtle animated gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-bitcoin/3 via-transparent to-orange-600/3 animate-gradient-shift"></div>
          
          {/* Final gradient overlay for content legibility */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-slate-950/20 to-slate-900/40"></div>
        </div>

        {/* Content container without overflow constraints */}
        <div className="relative z-20 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full animate-float shadow-sm" style={{backgroundColor: '#F7931A'}}>
                  <SatoshiIcon className="w-10 h-10" size={40} color="#FFFFFF" />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-slate-200 via-white to-slate-300 bg-clip-text text-transparent">Give Your Team</span>
                <br />
                <span className="bg-gradient-to-r from-bitcoin via-orange-400 to-bitcoin bg-clip-text text-transparent">Something Real</span>
              </h1>
              <p className="mt-8 max-w-2xl mx-auto text-xl text-slate-300 leading-relaxed">
                The future ain't what it used to be.
              </p>
              <HeroButtons />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Carousel Section */}
      <FeatureCarousel />

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
              Leaders Are
              <span className="block text-bitcoin">Making the Switch</span>
            </h2>
            
            <div className="max-w-3xl">
              <p className="text-lg text-slate-600 dark:text-slate-400 dark:text-slate-300 leading-relaxed mb-6">
                You know the story. Benefits get more expensive, employees get less value. Every year it's the same thing, only worse.
              </p>
              
              <div className="flex items-center gap-3">
                <div className="w-1 h-12 bg-gradient-to-b from-bitcoin to-orange-500 rounded-full"></div>
                <p className="text-xl text-deepSlate dark:text-white font-semibold">
                  There's another way.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Grid - 2x2 grid with perfectly aligned cards */}
          <div className="grid lg:grid-cols-2 lg:auto-rows-fr gap-8 mb-12">
            {/* Proven Over 16 Years - Top Left */}
            <div className="bg-lightGrey dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-sm p-6 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-300 h-full flex">
              <div className="flex items-start gap-4 w-full">
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <ChartBarIcon className="w-6 h-6 text-bitcoin" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-deepSlate dark:text-white mb-3">
                    Proven Over 16 Years
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 dark:text-slate-300 leading-relaxed">
                    Bitcoin's been around since 2009. It's been declared dead 400+ times. Still here. Now it's a trillion-dollar market that your employees already understand better than you might think.
                  </p>
                </div>
              </div>
            </div>

            {/* Meaningful to Employees - Top Right */}
            <div className="bg-lightGrey dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-sm p-6 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-300 h-full flex">
              <div className="flex items-start gap-4 w-full">
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <HeartIcon className="w-6 h-6 text-bitcoin" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-deepSlate dark:text-white mb-3">
                  A Benefit Employees Value
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 dark:text-slate-300 leading-relaxed">
                    Your best people already own bitcoin. They get it. Offering it as a benefit says you get them. That's worth more than another ping-pong table.
                  </p>
                </div>
              </div>
            </div>

            {/* Simple to Implement - Bottom Left */}
            <div className="bg-lightGrey dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-sm p-6 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-300 h-full flex">
              <div className="flex items-start gap-4 w-full">
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <ClipboardDocumentCheckIcon className="w-6 h-6 text-bitcoin" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-deepSlate dark:text-white mb-3">
                    Simple to Set Up
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 dark:text-slate-300 leading-relaxed">
                    Buy it. Hold it. Give it. That's the whole process. No lawyers billing by the hour, no 50-page documents nobody reads. Just value that grows.
                  </p>
                </div>
              </div>
            </div>
            
            {/* The Bottom Line - Bottom Right */}
            <div className="bg-bitcoin-50 dark:bg-bitcoin/10 border border-bitcoin-200 dark:border-bitcoin/30 rounded-sm p-6 hover:bg-bitcoin-100 dark:hover:bg-bitcoin/15 transition-all duration-300 h-full flex">
              <div className="flex items-start gap-4 w-full">
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-2xl">₿</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-deepSlate dark:text-white mb-3">
                    The Bottom Line
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 dark:text-slate-300 leading-relaxed">
                    Your 401(k) match loses to inflation. Bitcoin doesn't. Sometimes the obvious choice is the right choice.
                  </p>
                </div>
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
            
            <p className="text-lg text-slate-300 dark:text-slate-400 max-w-2xl leading-relaxed">
              Three ways to do this. Pick what works for you.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Pioneer */}
            <Link href="/calculator/accelerator" className="group block">
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-sm p-8 h-full hover:bg-slate-700/50 hover:border-bitcoin/30 transition-all duration-300 relative overflow-hidden">
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-bitcoin/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon and title */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <BitcoinIcon className="w-12 h-12 text-bitcoin group-hover:text-orange-400 transition-colors duration-300" />
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
                    <p className="text-slate-300 dark:text-slate-400 leading-relaxed">
                      Big commitment upfront, bigger potential later. Like being first to offer stock options, except this time everyone can understand what they're getting.
                    </p>
                  </div>
                  
                  {/* Call to action */}
                  <div className="mt-6 pt-4 border-t border-slate-600/50">
                    <div className="flex items-center text-bitcoin group-hover:text-orange-400 transition-colors duration-300">
                      <span className="text-sm font-semibold">See the Numbers</span>
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Stacker */}
            <Link href="/calculator/steady-builder" className="group block">
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-sm p-8 h-full hover:bg-slate-700/50 hover:border-bitcoin/30 transition-all duration-300 relative overflow-hidden">
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-bitcoin/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon and title */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <SatoshiIcon className="w-12 h-12 text-bitcoin group-hover:text-orange-400 transition-colors duration-300" size={48} />
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
                    <p className="text-slate-300 dark:text-slate-400 leading-relaxed">
                      Start strong, keep adding. It's like compound interest that actually compounds. Every year counts.
                    </p>
                  </div>
                  
                  {/* Call to action */}
                  <div className="mt-6 pt-4 border-t border-slate-600/50">
                    <div className="flex items-center text-bitcoin group-hover:text-orange-400 transition-colors duration-300">
                      <span className="text-sm font-semibold">See the Numbers</span>
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Builder */}
            <Link href="/calculator/slow-burn" className="group block">
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-sm p-8 h-full hover:bg-slate-700/50 hover:border-bitcoin/30 transition-all duration-300 relative overflow-hidden">
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-bitcoin/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon and title */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <MiningOutlineIcon className="w-12 h-12 text-bitcoin group-hover:text-orange-400 transition-colors duration-300" />
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
                    <p className="text-slate-300 dark:text-slate-400 leading-relaxed">
                      Small steps, long journey. Even $100 a month becomes real money over time. Ask anyone who started buying coffee with bitcoin in 2013.
                    </p>
                  </div>
                  
                  {/* Call to action */}
                  <div className="mt-6 pt-4 border-t border-slate-600/50">
                    <div className="flex items-center text-bitcoin group-hover:text-orange-400 transition-colors duration-300">
                      <span className="text-sm font-semibold">See the Numbers</span>
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
      
      {/* Client-side price fetcher (invisible) */}
      <BitcoinPriceDisplay />
    </div>
  );
}
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { 
  ArrowTrendingUpIcon, 
  ClockIcon, 
  CubeTransparentIcon,
  CalculatorIcon,
  ServerIcon,
  DocumentIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/solid';

interface CarouselFeature {
  id: string;
  title: string;
  subtitle: string;
  description: string | React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  bgGradient: string;
  accentColor: string;
  image: string;
}

const features: CarouselFeature[] = [
  {
    id: 'calculator',
    title: 'Build Your Plan',
    subtitle: 'Three Ways to Win',
    description: (
      <>
        Pick your bitcoin benefit strategy:{' '}
        <a href="/calculator?scheme=pioneer" className="text-bitcoin hover:text-orange-400 underline transition-colors">
          Pioneer
        </a>{' '}(big now),{' '}
        <a href="/calculator?scheme=stacker" className="text-bitcoin hover:text-orange-400 underline transition-colors">
          Stacker
        </a>{' '}(steady growth), or{' '}
        <a href="/calculator?scheme=builder" className="text-bitcoin hover:text-orange-400 underline transition-colors">
          Builder
        </a>{' '}(start small). See real 10-year projections. No hype, just math.
      </>
    ),
    icon: ArrowTrendingUpIcon,
    href: '/calculator',
    color: 'text-green-400',
    bgGradient: 'from-green-500/20 via-emerald-500/10 to-green-600/20',
    accentColor: 'bg-green-500/10 border-green-500/20',
    image: '/images/calculator-builder.webp'
  },
  {
    id: 'dashboard',
    title: 'Award Dashboard',
    subtitle: 'Track Everything',
    description: 'Watch your bitcoin awards unlock in real-time. See what you expected, what you received, and when the next unlock happens. No spreadsheets, no guessing.',
    icon: CubeTransparentIcon,
    href: '/track',
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/20 via-violet-500/10 to-purple-600/20',
    accentColor: 'bg-purple-500/10 border-purple-500/20',
    image: '/images/dashboard.webp'
  },
  {
    id: 'timeline',
    title: 'Time Machine',
    subtitle: 'See the Past, Project the Future',
    description: 'What if you started in 2020? Click any year to see what those awards would be worth today. ₿0.060 from 2020 is now worth $6,500. Still think it\'s too late?',
    icon: ClockIcon,
    href: '/historical',
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/20 via-indigo-500/10 to-blue-600/20',
    accentColor: 'bg-blue-500/10 border-blue-500/20',
    image: '/images/interactive-timeline.webp'
  },
  {
    id: 'fees',
    title: 'Smart Fees',
    subtitle: 'Never Overpay',
    description: 'Know exactly what bitcoin transactions cost before you send. Choose priority for speed or economy to save. Real network data, not estimates.',
    icon: CalculatorIcon,
    href: '/bitcoin-tools#fees',
    color: 'text-amber-400',
    bgGradient: 'from-amber-500/20 via-yellow-500/10 to-amber-600/20',
    accentColor: 'bg-amber-500/10 border-amber-500/20',
    image: '/images/fees.webp'
  },
  {
    id: 'network',
    title: 'Network Pulse',
    subtitle: 'Real-Time Intelligence',
    description: 'See what\'s happening on Bitcoin right now. Block #875,000 and counting. Know when fees are low, when the network\'s busy, and when to act.',
    icon: ServerIcon,
    href: '/bitcoin-tools#network',
    color: 'text-teal-400',
    bgGradient: 'from-teal-500/20 via-cyan-500/10 to-teal-600/20',
    accentColor: 'bg-teal-500/10 border-teal-500/20',
    image: '/images/network-status.webp'
  },
  {
    id: 'timestamp',
    title: 'Proof Forever',
    subtitle: 'Blockchain-Verified Documents',
    description: 'Timestamp award agreements on the blockchain. Permanent proof that can\'t be altered, deleted, or disputed. Like a notary that never closes.',
    icon: DocumentIcon,
    href: '/bitcoin-tools#timestamp',
    color: 'text-indigo-400',
    bgGradient: 'from-indigo-500/20 via-blue-500/10 to-indigo-600/20',
    accentColor: 'bg-indigo-500/10 border-indigo-500/20',
    image: '/images/open-timestamps.webp'
  },
  {
    id: 'transactions',
    title: 'Verify Everything',
    subtitle: 'Complete Transparency',
    description: 'Every bitcoin transaction is public and permanent. Check confirmations, see fees paid, verify transfers. Your employees can verify every award themselves.',
    icon: MagnifyingGlassIcon,
    href: '/bitcoin-tools#transactions',
    color: 'text-rose-400',
    bgGradient: 'from-rose-500/20 via-pink-500/10 to-rose-600/20',
    accentColor: 'bg-rose-500/10 border-rose-500/20',
    image: '/images/transactions.webp'
  }
];

export default function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % features.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + features.length) % features.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Handle touch events for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Preload images for better performance
  useEffect(() => {
    features.forEach((feature) => {
      const img = new Image();
      img.src = feature.image;
    });
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (isPaused) return undefined;
    
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  // Add keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      } else if (e.key >= '1' && e.key <= '7') {
        e.preventDefault();
        goToSlide(parseInt(e.key) - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, goToSlide]);

  const currentFeature = features[currentIndex];

  return (
    <section className="py-20 bg-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900"></div>
        
        {/* Dynamic gradient based on current feature */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentFeature.bgGradient} opacity-30 transition-all duration-1000 ease-in-out animate-pulse`}></div>
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-slate-950/20"></div>
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bitcoin/5 via-transparent to-transparent animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-left mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-2 h-8 bg-bitcoin rounded-full"></div>
            <span className="text-bitcoin uppercase text-sm font-bold tracking-wider">
              Powerful Tools
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Everything You Need to Launch
            <span className="block text-bitcoin">Bitcoin Benefits</span>
          </h2>
          
          <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
            From planning to implementation to ongoing management—our comprehensive suite of tools makes Bitcoin benefits simple and powerful.
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Carousel Content */}
          <div className="min-h-[600px] lg:min-h-[650px] flex items-center">
            <div className="w-full p-8 sm:p-12 lg:p-16">
              <div className="grid lg:grid-cols-5 gap-8 items-center">
                {/* Content Side - Less space */}
                <div className="space-y-6 lg:col-span-2">
                  {/* Enhanced Feature Icon */}
                  <div className="flex items-center gap-3 sm:gap-4 animate-fade-in">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${currentFeature.bgGradient} flex items-center justify-center backdrop-blur-sm border transition-all duration-500 hover:scale-110 ${currentFeature.accentColor} shadow-lg group`}>
                      <currentFeature.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${currentFeature.color} transition-transform duration-300 group-hover:scale-110`} />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div>
                      <div className={`text-sm font-semibold uppercase tracking-wider ${currentFeature.color} mb-1 animate-fade-in-delayed`}>
                        {currentFeature.subtitle}
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white animate-slide-up">
                        {currentFeature.title}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Enhanced Description */}
                  <div className="animate-fade-in-delayed-2">
                    <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                      {currentFeature.description}
                    </p>
                  </div>
                  
                  {/* Enhanced CTA Button */}
                  <div className="pt-4 animate-fade-in-delayed-3">
                    <a
                      href={currentFeature.href}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-bitcoin to-orange-500 hover:from-orange-500 hover:to-bitcoin text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-bitcoin/40 border border-bitcoin/20 backdrop-blur-sm group"
                    >
                      <span>Explore {currentFeature.title}</span>
                      <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </a>
                  </div>
                </div>

                {/* Visual Side - Feature Screenshot - More space */}
                <div className="relative lg:col-span-3">
                  <div className="relative rounded-lg overflow-hidden shadow-2xl border border-slate-600/30">
                    <img
                      src={currentFeature.image}
                      alt={currentFeature.title}
                      className="w-full h-auto"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none" />
                  </div>
                  
                  {/* Floating elements for visual interest */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-bitcoin rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-green-400 rounded-full animate-pulse delay-1000"></div>
                  
                  {/* Decorative blur elements */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-bitcoin/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="absolute top-1/2 -translate-y-1/2 left-4">
            <button
              onClick={prevSlide}
              className="p-2 text-white/70 hover:text-white transition-all duration-300 group"
              aria-label="Previous feature"
            >
              <ChevronLeftIcon className="w-8 h-8 transform group-hover:-translate-x-0.5 transition-transform duration-200 drop-shadow-lg" />
            </button>
          </div>

          <div className="absolute top-1/2 -translate-y-1/2 right-4">
            <button
              onClick={nextSlide}
              className="p-2 text-white/70 hover:text-white transition-all duration-300 group"
              aria-label="Next feature"
            >
              <ChevronRightIcon className="w-8 h-8 transform group-hover:translate-x-0.5 transition-transform duration-200 drop-shadow-lg" />
            </button>
          </div>

          {/* Progress Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-bitcoin scale-125 shadow-lg shadow-bitcoin/50'
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
                aria-label={`Go to feature ${index + 1}`}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800/50">
            <div 
              className="h-full bg-gradient-to-r from-bitcoin to-orange-500 transition-all duration-300 ease-out"
              style={{ width: `${((currentIndex + 1) / features.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
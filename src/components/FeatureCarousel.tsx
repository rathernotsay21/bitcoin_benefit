'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { 
  ArrowTrendingUpIcon, 
  ClockIcon, 
  CubeTransparentIcon 
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
  image: string;
}

const features: CarouselFeature[] = [
  {
    id: 'calculator',
    title: 'Potential Growth',
    subtitle: 'Three Powerful Plans',
    description: (
      <>
        Design your own bitcoin benefit with three powerful plans:{' '}
        <a href="/calculator?scheme=pioneer" className="text-bitcoin hover:text-orange-400 underline transition-colors">
          Pioneer
        </a>,{' '}
        <a href="/calculator?scheme=stacker" className="text-bitcoin hover:text-orange-400 underline transition-colors">
          Stacker
        </a>, or{' '}
        <a href="/calculator?scheme=builder" className="text-bitcoin hover:text-orange-400 underline transition-colors">
          Builder
        </a>. Our calculator shows a conservative 10-year projection. See how Bitcoin awards today could become significant wealth tomorrow.
      </>
    ),
    icon: ArrowTrendingUpIcon,
    href: '/calculator',
    color: 'text-green-400',
    bgGradient: 'from-green-500/20 via-emerald-500/10 to-green-600/20',
    image: `/images/feature-calculator.webp?v=${Date.now()}`
  },
  {
    id: 'historical',
    title: 'Past Performance',
    subtitle: '27.9% Annualized',
    description: 'Click through the interactive timeline to see what bitcoin awards from any year are worth today. Understand the power of early adoption - ₿0.100 awarded in 2020 for just $556 is now worth over $10,000!',
    icon: ClockIcon,
    href: '/historical',
    color: 'text-blue-400',
    bgGradient: 'from-blue-500/20 via-indigo-500/10 to-blue-600/20',
    image: '/images/feature-historical.webp'
  },
  {
    id: 'tracking',
    title: 'Benefit Tracker',
    subtitle: 'Real-time Transparency',
    description: 'Track your awards and unlocks in real-time anytime. Track expected versus received amounts, view complete grant history with dates and USD values. Perfect transparency for both employers and employees.',
    icon: CubeTransparentIcon,
    href: '/track',
    color: 'text-purple-400',
    bgGradient: 'from-purple-500/20 via-violet-500/10 to-purple-600/20',
    image: '/images/feature-track.webp'
  }
];

export default function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % features.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + features.length) % features.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (isPaused) return undefined;
    
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  const currentFeature = features[currentIndex];

  return (
    <section className="py-20 bg-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900"></div>
        
        {/* Dynamic gradient based on current feature */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentFeature.bgGradient} opacity-30 transition-all duration-1000 ease-in-out`}></div>
        
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
          className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Carousel Content */}
          <div className="min-h-[600px] lg:min-h-[650px] flex items-center">
            <div className="w-full p-8 sm:p-12 lg:p-16">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Content Side */}
                <div className="space-y-6">
                  {/* Feature Icon */}
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${currentFeature.bgGradient} flex items-center justify-center backdrop-blur-sm border border-slate-600/30`}>
                      <currentFeature.icon className={`w-8 h-8 ${currentFeature.color}`} />
                    </div>
                    <div>
                      <div className={`text-sm font-semibold uppercase tracking-wider ${currentFeature.color} mb-1`}>
                        {currentFeature.subtitle}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white">
                        {currentFeature.title}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-slate-300 text-lg leading-relaxed">
                    {currentFeature.description}
                  </p>
                  
                  {/* CTA Button */}
                  <div className="pt-4">
                    <a
                      href={currentFeature.href}
                      className="inline-flex items-center px-6 py-3 bg-bitcoin hover:bg-orange-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-bitcoin/25"
                    >
                      <span>Explore {currentFeature.title}</span>
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Visual Side - Actual Feature Screenshot */}
                <div className="relative">
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
              className="w-12 h-12 rounded-full bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 flex items-center justify-center text-white hover:bg-slate-700/80 hover:border-bitcoin/30 transition-all duration-300 group"
              aria-label="Previous feature"
            >
              <ChevronLeftIcon className="w-6 h-6 transform group-hover:-translate-x-0.5 transition-transform duration-200" />
            </button>
          </div>

          <div className="absolute top-1/2 -translate-y-1/2 right-4">
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 flex items-center justify-center text-white hover:bg-slate-700/80 hover:border-bitcoin/30 transition-all duration-300 group"
              aria-label="Next feature"
            >
              <ChevronRightIcon className="w-6 h-6 transform group-hover:translate-x-0.5 transition-transform duration-200" />
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

        {/* Feature Navigation Cards */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <button
              key={feature.id}
              onClick={() => goToSlide(index)}
              className={`text-left p-6 rounded-lg border transition-all duration-300 ${
                index === currentIndex
                  ? `bg-gradient-to-br ${feature.bgGradient} border-${feature.color.replace('text-', '').replace('-400', '-500')}/50 scale-105`
                  : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <feature.icon className={`w-6 h-6 ${index === currentIndex ? feature.color : 'text-slate-400'}`} />
                <h4 className={`font-semibold ${index === currentIndex ? 'text-white' : 'text-slate-300'}`}>
                  {feature.title}
                </h4>
              </div>
              <p className={`text-sm ${index === currentIndex ? 'text-slate-200' : 'text-slate-400'}`}>
                {feature.subtitle}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
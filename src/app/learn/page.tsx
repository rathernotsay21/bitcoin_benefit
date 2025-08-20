'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { BitcoinIcon } from '@/components/icons/BitcoinIcon';
import { SatoshiOutlineIcon } from '@/components/icons/SatoshiOutlineIcon';
// Lazy load ExpandableSection since it's used at the bottom of the page
const ExpandableSection = dynamic(() => import('@/components/ProgressiveDisclosure').then(mod => ({ default: mod.ExpandableSection })), { ssr: false });
// Optimize icon imports
import dynamic from 'next/dynamic';
const BanknotesIcon = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.BanknotesIcon })), { ssr: false });
const LockClosedIcon = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.LockClosedIcon })), { ssr: false });
const CalculatorIcon = dynamic(() => import('@heroicons/react/24/solid').then(mod => ({ default: mod.CalculatorIcon })), { ssr: false });

export default function LearnMorePage() {
    return (
        <div className="min-h-screen">
            <Navigation />
            
            {/* Hero Section */}
            <section className="relative min-h-[150px] py-8 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
              <div className="absolute inset-0 bg-gradient-to-r from-bitcoin/10 to-blue-500/10" aria-hidden="true"></div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-slate-700 via-slate-900 to-slate-700 dark:from-slate-200 dark:via-white dark:to-slate-300 bg-clip-text text-transparent">Ready to </span>
                    <span className="bg-gradient-to-r from-bitcoin via-orange-400 to-bitcoin bg-clip-text text-transparent">Get Started?</span>
                  </h1>
                  <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                    Business is Hard, Bitcoin is Easy
                  </p>
                </div>
              </div>
            </section>

            {/* Bitcoin Exchange Showcase Section */}
            <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 transition-colors duration-300 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-r from-bitcoin/5 to-orange-500/5" aria-hidden="true"></div>
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-bitcoin/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" aria-hidden="true"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" aria-hidden="true"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            <span className="bg-gradient-to-r from-bitcoin via-orange-500 to-bitcoin bg-clip-text text-transparent">
                                Buying bitcoin has never been easier
                            </span>
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-white/90 max-w-3xl mx-auto leading-relaxed">
                            Running your business can be stressful, <a href="https://river.com/signup?r=RH5MJKJM" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">buying bitcoin</a> for your employees doesn't have to be. Setup <a href="https://support.river.com/kb/guide/en/how-do-i-set-up-a-recurring-order-zkSuAYQY1V/Steps/2925281" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">recurring buys</a> to fund each grant over a few weeks or months. Easily <a href="https://support.river.com/kb/guide/en/how-do-i-send-bitcoin-from-my-account-Ks1olAsF35/Steps/2128452" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">send the bitcoin</a> to an on-chain wallet with <a href="https://river.com/signup?r=RH5MJKJM" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">River</a>.
                        </p>
                    </div>

                    {/* Trusted Exchange Partners */}
                    <div className="mb-12">
                        <div className="text-center mb-8">
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Trusted Exchange Partners</p>
                            <div className="w-24 h-1 bg-gradient-to-r from-bitcoin to-orange-500 mx-auto rounded-full"></div>
                        </div>
                        
                        {/* Exchange Cards Grid */}
                        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
                            {/* Cash App - Left */}
                            <a 
                                href="https://cash.app/app/MGZQCNL" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group block transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                            >
                                <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:border-green-400 dark:group-hover:border-green-500 h-full">
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center group-hover:from-green-100 group-hover:to-emerald-100 dark:group-hover:from-green-800/40 dark:group-hover:to-emerald-800/40 transition-colors duration-300">
                                            <img 
                                                src="/256px-Square_Cash_app_logo.svg.png" 
                                                alt="Cash App" 
                                                className="w-12 h-12 object-contain"
                                            />
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                                            Cash App
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                                            Simple, mobile-first bitcoin buying with instant access and easy peer-to-peer transfers.
                                        </p>
                                        
                                        {/* Security badges */}
                                        <div className="space-y-1 mb-4">
                                            <div className="flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                                                <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                PCI-DSS Level 1
                                            </div>
                                            <div className="flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                                                <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                                </svg>
                                                Mobile Only
                                            </div>
                                            <div className="flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                                                <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                                </svg>
                                                S&P 500 Company
                                            </div>
                                        </div>
                                        <div className="inline-flex items-center text-green-600 dark:text-green-400 text-sm font-medium group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                                            Get Started
                                            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </a>

                            {/* River - Center (Featured) */}
                            <a 
                                href="https://river.com/signup?r=RH5MJKJM" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group block transform transition-all duration-300 hover:scale-110 hover:-translate-y-3 relative"
                            >
                                {/* Featured Badge */}
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                                    <div className="bg-gradient-to-r from-bitcoin to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                                        Recommended
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800/70 dark:to-slate-700/70 backdrop-blur-sm border-2 border-bitcoin/30 dark:border-bitcoin/40 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:border-bitcoin group-hover:shadow-bitcoin/20 h-full relative overflow-hidden">
                                    {/* Glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-bitcoin/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    
                                    <div className="text-center relative z-10">
                                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-bitcoin/10 to-orange-500/10 rounded-2xl flex items-center justify-center group-hover:from-bitcoin/20 group-hover:to-orange-500/20 transition-colors duration-300">
                                            <img 
                                                src="/River_idKJqge62z_1.png" 
                                                alt="River Financial" 
                                                className="w-16 h-16 object-contain"
                                            />
                                        </div>
                                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-bitcoin transition-colors duration-300">
                                            River Financial
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                                            Bitcoin-only platform with zero recurring fees, institutional security, and monthly proof of reserves.
                                        </p>
                                        
                                        {/* Feature highlights */}
                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center justify-center text-xs text-green-600 dark:text-green-400">
                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                $0 Recurring Fees
                                            </div>
                                            <div className="flex items-center justify-center text-xs text-blue-600 dark:text-blue-400">
                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                SOC 2 Certified
                                            </div>
                                            <div className="flex items-center justify-center text-xs text-purple-600 dark:text-purple-400">
                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Monthly Proof of Reserves
                                            </div>
                                        </div>
                                        
                                        <div className="inline-flex items-center bg-gradient-to-r from-bitcoin to-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold group-hover:from-orange-500 group-hover:to-bitcoin transition-all duration-300">
                                            Start with River
                                            <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </a>

                            {/* Kraken - Right */}
                            <a 
                                href="https://invite.kraken.com/JDNW/f98kz0z6" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group block transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                            >
                                <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:border-purple-400 dark:group-hover:border-purple-500 h-full">
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center group-hover:from-purple-100 group-hover:to-indigo-100 dark:group-hover:from-purple-800/40 dark:group-hover:to-indigo-800/40 transition-colors duration-300">
                                            <img 
                                                src="/kraken-logo.svg" 
                                                alt="Kraken" 
                                                className="w-12 h-12 object-contain"
                                            />
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                                            Kraken
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                                            Established exchange with advanced trading features, strong security, and global reach.
                                        </p>
                                        
                                        {/* Security badges */}
                                        <div className="space-y-1 mb-4">
                                            <div className="flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                                                <svg className="w-3 h-3 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                SOC 2 Type I
                                            </div>
                                            <div className="flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                                                <svg className="w-3 h-3 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                                                </svg>
                                                ISO/IEC 27001
                                            </div>
                                            <div className="flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                                                <svg className="w-3 h-3 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                </svg>
                                                97% Funds Offline
                                            </div>
                                        </div>
                                        <div className="inline-flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                                            Join Kraken
                                            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Why These Platforms */}
                    <div className="text-center bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                        <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Why These Platforms?
                        </h5>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-w-4xl mx-auto">
                            Each platform offers unique advantages for different needs. River excels in Bitcoin-only focus and institutional features, Cash App provides mobile simplicity, and Kraken offers advanced trading capabilities. All are trusted, regulated, and proven platforms for acquiring Bitcoin safely.
                        </p>
                    </div>
                </div>
            </section>

            {/* Hardware Wallets Section */}
            <section id="hardware-wallets" className="py-16 sm:py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center p-3 bg-orange-500 rounded-2xl mb-6">
                            <LockClosedIcon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Ready to Move On-Chain?
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-white/90 max-w-2xl mx-auto mb-8">
                            Secure your bitcoin with a hardware wallet from these trusted manufacturers.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="card glass p-6 text-center flex flex-col h-full">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Foundation Passport</h4>
                            <p className="text-gray-600 dark:text-white/90 mb-6 text-sm flex-grow">
                                For those who seek a balance of robust security and a user-friendly, intuitive experience.
                            </p>
                            <a 
                                href="https://foundationdevices.com/passport/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn-primary inline-block w-full mt-auto"
                            >
                                Buy from Foundation
                            </a>
                        </div>

                        <div className="card glass p-6 text-center flex flex-col h-full">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Blockstream Jade</h4>
                            <p className="text-gray-600 dark:text-white/90 mb-6 text-sm flex-grow">
                                Offers an innovative security model from a highly reputable company, appealing to those interested in cutting-edge cryptographic solutions.
                            </p>
                            <a 
                                href="https://blockstream.com/jade/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn-primary inline-block w-full mt-auto"
                            >
                                Buy from Blockstream
                            </a>
                        </div>

                        <div className="card glass p-6 text-center flex flex-col h-full">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">BitBox02</h4>
                            <p className="text-gray-600 dark:text-white/90 mb-6 text-sm flex-grow">
                                The Bitcoin-only edition provides a sleek, secure, and straightforward experience backed by Swiss engineering.
                            </p>
                            <a 
                                href="https://shiftcrypto.ch/bitbox02/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn-primary inline-block w-full mt-auto"
                            >
                                Buy from Shift Crypto
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bitcoin Basics Section */}
            <section className="py-16 bg-gray-50 dark:bg-slate-800 transition-colors duration-300">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Want to Learn More About the Technology?
                        </h3>
                        <p className="text-base text-gray-600 dark:text-white/90">
                            While you don't need to understand Bitcoin to offer this benefit, here are the basics for those who are curious.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <ExpandableSection title="What is Bitcoin?">
                            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                <p>
                                    Bitcoin is a digital currency that exists only electronically. Think of it like digital gold -
                                    it has value because people agree it has value, and there's a limited supply (only 21 million will ever exist).
                                </p>
                                <p>
                                    Unlike traditional money controlled by governments, Bitcoin operates on a decentralized network,
                                    meaning no single entity controls it. This has made it attractive as a store of value over time.
                                </p>
                            </div>
                        </ExpandableSection>

                        <ExpandableSection title="Why Has Bitcoin Grown in Value?">
                            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                <p>
                                    Bitcoin's value has increased over time due to growing adoption by individuals, companies, and even countries.
                                    Major corporations like Tesla, MicroStrategy, and Square have added Bitcoin to their balance sheets.
                                </p>
                                <p>
                                    The limited supply (like digital real estate) combined with increasing demand has historically driven price appreciation.
                                    However, Bitcoin is volatile and past performance doesn't guarantee future results.
                                </p>
                            </div>
                        </ExpandableSection>

                        <ExpandableSection title="How Do Employees Access Their Bitcoin?">
                            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                <p>
                                    Employees can view their Bitcoin balance anytime through a secure digital wallet or dashboard.
                                    When vested, they can transfer it to their personal wallet, sell it for cash, or hold it as an investment.
                                </p>
                                <p>
                                    The process is similar to accessing a 401(k) - employees have full control over their vested Bitcoin
                                    and can make their own decisions about what to do with it.
                                </p>
                            </div>
                        </ExpandableSection>

                        <ExpandableSection title="Is This Safe for My Business?">
                            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                <p>
                                    Your business risk is limited to the dollar amount you choose to invest in employee benefits.
                                    You're not speculating on Bitcoin - you're offering a modern benefit that happens to use Bitcoin as the vehicle.
                                </p>
                                <p>
                                    Many businesses set aside the same budget they would for traditional benefits and simply purchase Bitcoin instead.
                                    The employee gets the upside potential, while your costs remain predictable.
                                </p>
                            </div>
                        </ExpandableSection>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
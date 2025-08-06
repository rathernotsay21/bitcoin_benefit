'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { BitcoinIcon } from '@/components/icons/BitcoinIcon';
import { 
  AcademicCapIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  LockClosedIcon,
  BanknotesIcon,
  TrophyIcon,
  SparklesIcon,
  CheckCircleIcon,
  PlusIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CalculatorIcon
} from '@heroicons/react/24/solid';

export default function LearnMorePage() {
    return (
        <div className="min-h-screen">
            <Navigation />

            {/* Hero Section */}
            <section className="hero-gradient py-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-bitcoin rounded-full blur-3xl animate-pulse-slow"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-bitcoin-gradient rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                    <div className="inline-flex items-center justify-center p-3 bg-bitcoin-gradient rounded-2xl mb-6 animate-float">
                        <AcademicCapIcon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-8">
                        Why is Bitcoin the best way to<br />
                        <span className="text-bitcoin dark:text-white">secure your team?</span>
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8 text-left mt-12">
                        <div className="flex items-start group">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <TrophyIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Reduce Turnover</h3>
                                <p className="text-gray-600 dark:text-white/90 leading-relaxed">Give top talent a compelling reason to stay and grow with you.</p>
                            </div>
                        </div>

                        <div className="flex items-start group">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <ShieldCheckIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Total Transparency</h3>
                                <p className="text-gray-600 dark:text-white/90 leading-relaxed">Employees track their grants on-chain, anytime. No more guessing.</p>
                            </div>
                        </div>

                        <div className="flex items-start group">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <UserGroupIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Employee Empowerment</h3>
                                <p className="text-gray-600 dark:text-white/90 leading-relaxed">Allow direct contributions so your team can accelerate their savings.</p>
                            </div>
                        </div>

                        <div className="flex items-start group">
                            <div className="flex-shrink-0 w-12 h-12 bg-bitcoin-gradient rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <BanknotesIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Financial Wellness</h3>
                                <p className="text-gray-600 dark:text-white/90 leading-relaxed">Introduce your team to sound money principles and long-term wealth building.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Call-Out Sections */}
            <section className="py-24 bg-white dark:bg-bitcoin transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* On-Chain Tracking & Transparency */}
                    <div className="mb-24">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                                    <CheckCircleIcon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                    Radical Transparency
                                </h3>
                                <p className="text-xl text-gray-600 dark:text-white/90 leading-relaxed">
                                    Every grant is recorded on-chain. Employees have a real-time, immutable view of their growing assets, building unparalleled trust.
                                </p>
                            </div>
                            <div className="card glass glow-orange lg:p-10">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-bitcoin mb-3">₿0.0075</div>
                                    <div className="text-lg text-gray-600 dark:text-white/90 mb-6">Currently Vested</div>
                                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 mb-4 overflow-hidden">
                                        <div className="bg-bitcoin-gradient h-full rounded-full animate-pulse-slow" style={{ width: '50%' }}></div>
                                    </div>
                                    <div className="text-gray-600 dark:text-white/80">50% vested • 2.5 years remaining</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 24/7 Employee Contributions */}
                    <div className="mb-24">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="order-2 lg:order-1">
                                <div className="card glass glow-orange lg:p-10">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-gray-900 dark:text-white mb-6">Employee Dashboard</div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 rounded-xl">
                                                <span className="font-medium text-gray-700 dark:text-white">Company Grant</span>
                                                <span className="font-bold text-lg dark:text-white">₿0.015</span>
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl">
                                                <span className="font-medium text-gray-700 dark:text-white">Personal Contributions</span>
                                                <span className="font-bold text-green-600 dark:text-green-400 text-lg">₿0.008</span>
                                            </div>
                                            <div className="border-t-2 pt-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-lg dark:text-white">Total Balance</span>
                                                    <span className="text-2xl font-bold text-bitcoin dark:text-white">₿0.023</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                                    <PlusIcon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                    Empower Financial Ownership
                                </h3>
                                <p className="text-xl text-gray-600 dark:text-white/90 leading-relaxed">
                                    Employees can contribute directly to their plan 24/7, giving them direct control and turning their benefit into a personal wealth-building engine.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Long-Term Returns */}
                    <div className="mb-24">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="w-16 h-16 bg-bitcoin-gradient rounded-2xl flex items-center justify-center mb-6">
                                    <ArrowTrendingUpIcon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                    Powered by Sound Money
                                </h3>
                                <p className="text-xl text-gray-600 dark:text-white/90 leading-relaxed">
                                    Move beyond traditional plans. Offer a benefit with the potential for significant long-term growth, backed by the world's premier digital asset.
                                </p>
                            </div>
                            <div className="card glass glow-orange lg:p-10">
                                <div className="text-center">
                                    <div className="text-lg text-gray-600 dark:text-white/90 mb-6">Historical Performance</div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl">
                                            <span className="font-medium dark:text-white">5 Years</span>
                                            <span className="font-bold text-green-600 dark:text-green-400 text-lg">+1,200%</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl">
                                            <span className="font-medium dark:text-white">10 Years</span>
                                            <span className="font-bold text-green-600 dark:text-green-400 text-lg">+9,000%</span>
                                        </div>
                                        <div className="border-t pt-4 text-sm text-gray-500 dark:text-white/70">
                                            Past performance does not guarantee future results
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Turnover Reduction */}
                    <div>
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="order-2 lg:order-1">
                                <div className="card glass glow-orange lg:p-10">
                                    <div className="text-center">
                                        <div className="text-lg text-gray-600 dark:text-white/90 mb-6">Industry Comparison</div>
                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-medium dark:text-white">Traditional Benefits</span>
                                                    <span className="font-medium dark:text-white">65% retention</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                                    <div className="bg-gray-400 dark:bg-slate-500 h-full rounded-full" style={{ width: '65%' }}></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-medium dark:text-white">Bitcoin Vesting</span>
                                                    <span className="font-medium text-green-600 dark:text-green-400">89% retention</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full" style={{ width: '89%' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                                    <UserGroupIcon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                    The Ultimate Retention Tool
                                </h3>
                                <p className="text-xl text-gray-600 dark:text-white/90 leading-relaxed">
                                    In a competitive market, a truly valuable benefit makes the difference. Attract and keep top talent who are invested in the company's long-term vision.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-bitcoin-gradient dark:bg-slate-700 relative overflow-hidden transition-colors duration-300">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
                </div>

                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
                    <h3 className="text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Benefits?
                    </h3>
                    <p className="text-2xl text-orange-100 dark:text-white/90 mb-10 leading-relaxed">
                        Start planning your Bitcoin vesting program today and give your team a reason to stay.
                    </p>
                    <Link href="/calculator" className="bg-white dark:bg-slate-800 text-bitcoin-dark dark:text-white hover:bg-orange-50 dark:hover:bg-slate-900 font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-xl inline-flex items-center justify-center space-x-2">
                        <CalculatorIcon className="w-5 h-5" />
                        <span>Try the Calculator</span>
                    </Link>
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
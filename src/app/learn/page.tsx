'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { BitcoinIcon } from '@/components/icons/BitcoinIcon';
import { TechnicalDetails, ExpandableSection } from '@/components/ProgressiveDisclosure';
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
                        Tired of losing your best people to<br />
                        <span className="text-bitcoin dark:text-white">bigger companies?</span>
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8 text-left mt-12">
                        <div className="flex items-start group">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <TrophyIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Stop the Revolving Door</h3>
                                <p className="text-gray-600 dark:text-white/90 leading-relaxed mb-2">Give your skilled workers a real reason to stay instead of jumping to the next opportunity.</p>
                                <div className="text-sm text-gray-500 dark:text-white/70 italic">
                                  "My best mechanic turned down three job offers this year" - Auto shop owner
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start group">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <ShieldCheckIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Build Trust</h3>
                                <p className="text-gray-600 dark:text-white/90 leading-relaxed mb-2">Show employees exactly what they're earning with complete transparency - no hidden terms or fine print.</p>
                                <div className="text-sm text-gray-500 dark:text-white/70 italic">
                                  "Our pottery students check their balance daily - they love seeing it grow" - Studio owner
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start group">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <UserGroupIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Compete for Talent</h3>
                                <p className="text-gray-600 dark:text-white/90 leading-relaxed mb-2">Offer something big companies can't - a benefit that grows with your business success.</p>
                                <div className="text-sm text-gray-500 dark:text-white/70 italic">
                                  "We're attracting experienced workers from bigger contractors now" - Construction company
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start group">
                            <div className="flex-shrink-0 w-12 h-12 bg-bitcoin-gradient rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <BanknotesIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Attract Quality People</h3>
                                <p className="text-gray-600 dark:text-white/90 leading-relaxed mb-2">Stand out from other small businesses with a modern benefit that shows you invest in your team's future.</p>
                                <div className="text-sm text-gray-500 dark:text-white/70 italic">
                                  "Job candidates ask about our benefits before salary now" - Coffee roastery owner
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Call-Out Sections */}
            <section className="py-24 bg-white dark:bg-bitcoin transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Trust Building Through Transparency */}
                    <div className="mb-24">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                                    <CheckCircleIcon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                    Build Trust Through Complete Transparency
                                </h3>
                                <p className="text-xl text-gray-600 dark:text-white/90 leading-relaxed mb-4">
                                    Your employees can see exactly what they've earned and when they'll get it. No hidden terms, no surprises - just honest communication that builds lasting trust between you and your team.
                                </p>
                                <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded-xl">
                                    <p className="text-gray-700 dark:text-white/90 italic">
                                        "My pottery students check their balance during breaks. They love seeing it grow and understanding exactly how it works. That transparency builds so much trust." 
                                        <span className="font-medium">- Sarah, Pottery Studio Owner</span>
                                    </p>
                                </div>
                            </div>
                            <div className="card glass glow-orange lg:p-10">
                                <div className="text-center">
                                    <TechnicalDetails 
                                      summary="₿0.008"
                                      details="₿ is the symbol for Bitcoin. 0.008 Bitcoin is worth approximately $910 at current market prices."
                                      className="text-3xl font-bold text-bitcoin mb-3 justify-center"
                                    />
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
                                                <TechnicalDetails 
                                                  summary="₿0.015"
                                                  details="0.015 Bitcoin provided by the company, worth approximately $1,710 at current prices."
                                                  className="font-bold text-lg dark:text-white"
                                                />
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl">
                                                <span className="font-medium text-gray-700 dark:text-white">Personal Contributions</span>
                                                <TechnicalDetails 
                                                  summary="₿0.008"
                                                  details="0.008 Bitcoin purchased by the employee with their own money, worth approximately $910 at current prices."
                                                  className="font-bold text-green-600 dark:text-green-400 text-lg"
                                                />
                                            </div>
                                            <div className="border-t-2 pt-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-lg dark:text-white">Total Balance</span>
                                                    <TechnicalDetails 
                                                      summary="₿0.023"
                                                      details="Combined total of 0.023 Bitcoin (company grant + personal contributions), worth approximately $2,620 at current prices."
                                                      className="text-2xl font-bold text-bitcoin dark:text-white"
                                                    />
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
                                    Give Your Team Real Control
                                </h3>
                                <p className="text-xl text-gray-600 dark:text-white/90 leading-relaxed mb-4">
                                    Let employees boost their own benefits whenever they want. When your team has control over their financial future, they feel more invested in your business success.
                                </p>
                                <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded-xl">
                                    <p className="text-gray-700 dark:text-white/90 italic">
                                        "Our mechanics add to their benefits when they get overtime pay. They're building their own wealth while helping our shop succeed." 
                                        <span className="font-medium">- Mike, Auto Shop Owner</span>
                                    </p>
                                </div>
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
                                    Your Secret Competitive Advantage
                                </h3>
                                <p className="text-xl text-gray-600 dark:text-white/90 leading-relaxed mb-4">
                                    While other small businesses offer the same old benefits, you're offering something that could actually change your employees' lives. That's how you win the talent war.
                                </p>
                                <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded-xl">
                                    <p className="text-gray-700 dark:text-white/90 italic">
                                        "We're attracting experienced foremen from big contractors now. They see this benefit and know we're thinking about their future, not just the next project." 
                                        <span className="font-medium">- Tom, Construction Company Owner</span>
                                    </p>
                                </div>
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
                                        <div className="text-lg text-gray-600 dark:text-white/90 mb-6">Small Business Retention Rates</div>
                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-medium dark:text-white">Traditional Small Business</span>
                                                    <span className="font-medium dark:text-white">58% retention</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                                    <div className="bg-gray-400 dark:bg-slate-500 h-full rounded-full" style={{ width: '58%' }}></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-medium dark:text-white">With Modern Benefits</span>
                                                    <span className="font-medium text-green-600 dark:text-green-400">82% retention</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full" style={{ width: '82%' }}></div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-white/70 pt-2">
                                                *Based on small businesses with 5-15 employees
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
                                    Stop Losing People to Big Companies
                                </h3>
                                <p className="text-xl text-gray-600 dark:text-white/90 leading-relaxed mb-4">
                                    Small businesses using modern benefits like this see 40% less turnover than those stuck with traditional packages. Your skilled workers stay because they see a real future with you.
                                </p>
                                <div className="bg-gray-100 dark:bg-slate-700 p-4 rounded-xl">
                                    <p className="text-gray-700 dark:text-white/90 italic">
                                        "Before this, we lost someone every few months to bigger companies. Now our team is stable, and new hires ask about our benefits program before we even mention salary." 
                                        <span className="font-medium">- Lisa, Coffee Roastery Owner</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Small Business Success Stories Section */}
            <section className="py-24 bg-gray-50 dark:bg-slate-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Real Small Business Success Stories
                        </h3>
                        <p className="text-xl text-gray-600 dark:text-white/90 max-w-2xl mx-auto">
                            See how businesses like yours solved their biggest retention challenges with modern employee benefits
                        </p>
                    </div>

                    <div className="space-y-16">
                        {/* Pottery Studio Deep Dive */}
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="flex items-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mr-4">
                                    <AcademicCapIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">Artisan Pottery Studio</h4>
                                        <div className="text-gray-600 dark:text-white/80">8 employees • Portland, OR</div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h5 className="font-bold text-gray-900 dark:text-white mb-2">The Challenge</h5>
                                        <p className="text-gray-600 dark:text-white/90 leading-relaxed">
                                            "We were losing our best pottery instructors to corporate design jobs every 18 months. Training replacements took 6 months minimum, and students noticed the inconsistency. Our reputation was suffering."
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <h5 className="font-bold text-gray-900 dark:text-white mb-2">The Solution</h5>
                                        <p className="text-gray-600 dark:text-white/90 leading-relaxed">
                                            "Started with the Stacker plan - ₿0.010 per instructor annually, plus they can add their own contributions. Now they talk about their 'pottery portfolio' and see their benefit growing alongside their craft."
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <h5 className="font-bold text-gray-900 dark:text-white mb-2">The Results</h5>
                                        <ul className="text-gray-600 dark:text-white/90 space-y-2">
                                            <li className="flex items-center">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                                                Zero instructor turnover in 18 months
                                            </li>
                                            <li className="flex items-center">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                                                Student satisfaction scores up 34%
                                            </li>
                                            <li className="flex items-center">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                                                Instructors actively refer qualified candidates
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="card glass glow-orange lg:p-10">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-6">Before vs After</div>
                                    <div className="space-y-6">
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-white/80 mb-2">Average Instructor Tenure</div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-red-600 dark:text-red-400">Before: 18 months</span>
                                                <span className="text-green-600 dark:text-green-400">After: 3+ years</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-white/80 mb-2">Training Costs per Year</div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-red-600 dark:text-red-400">Before: $12,000</span>
                                                <span className="text-green-600 dark:text-green-400">After: $1,200</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-white/80 mb-2">Student Retention</div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-red-600 dark:text-red-400">Before: 67%</span>
                                                <span className="text-green-600 dark:text-green-400">After: 89%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Auto Shop Deep Dive */}
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="order-2 lg:order-1">
                                <div className="card glass glow-orange lg:p-10">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-gray-900 dark:text-white mb-6">ROI Breakdown</div>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">$47,000</div>
                                                <div className="text-sm text-green-700 dark:text-green-300">Saved in recruitment costs</div>
                                            </div>
                                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">$23,000</div>
                                                <div className="text-sm text-blue-700 dark:text-blue-300">Reduced training expenses</div>
                                            </div>
                                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">$18,000</div>
                                                <div className="text-sm text-purple-700 dark:text-purple-300">Annual benefit investment</div>
                                            </div>
                                            <div className="border-t pt-4">
                                                <div className="text-2xl font-bold text-gray-900 dark:text-white">$52,000</div>
                                                <div className="text-sm text-gray-600 dark:text-white/80">Net annual savings</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="order-1 lg:order-2">
                                <div className="flex items-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mr-4">
                                    <ShieldCheckIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">Family Auto Repair</h4>
                                        <div className="text-gray-600 dark:text-white/80">12 employees • Phoenix, AZ</div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h5 className="font-bold text-gray-900 dark:text-white mb-2">The Challenge</h5>
                                        <p className="text-gray-600 dark:text-white/90 leading-relaxed">
                                            "Dealerships kept poaching our ASE-certified mechanics with $5,000-$10,000 signing bonuses. We couldn't compete on upfront cash, and training new mechanics took 8-12 months."
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <h5 className="font-bold text-gray-900 dark:text-white mb-2">The Solution</h5>
                                        <p className="text-gray-600 dark:text-white/90 leading-relaxed">
                                            "Implemented the Pioneer plan for senior mechanics - ₿0.050 upfront vesting. We showed them how this could outperform any signing bonus over time, with complete transparency."
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <h5 className="font-bold text-gray-900 dark:text-white mb-2">The Results</h5>
                                        <ul className="text-gray-600 dark:text-white/90 space-y-2">
                                            <li className="flex items-center">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                                                Three mechanics turned down dealership offers
                                            </li>
                                            <li className="flex items-center">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                                                Mechanics actively refer qualified friends
                                            </li>
                                            <li className="flex items-center">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                                                Customer satisfaction up due to consistency
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Construction Company Deep Dive */}
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="flex items-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mr-4">
                                    <UserGroupIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">Riverside Construction</h4>
                                        <div className="text-gray-600 dark:text-white/80">15 employees • Denver, CO</div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h5 className="font-bold text-gray-900 dark:text-white mb-2">The Challenge</h5>
                                        <p className="text-gray-600 dark:text-white/90 leading-relaxed">
                                            "Seasonal work meant crew members left for 'more stable' jobs during slow periods. We lost our best foreman to a big contractor who offered year-round work and better benefits."
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <h5 className="font-bold text-gray-900 dark:text-white mb-2">The Solution</h5>
                                        <p className="text-gray-600 dark:text-white/90 leading-relaxed">
                                            "Used the Builder plan - ₿0.008 annually per crew member. The predictable costs work with our project-based income, and crew sees long-term value even during slow seasons."
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <h5 className="font-bold text-gray-900 dark:text-white mb-2">The Results</h5>
                                        <ul className="text-gray-600 dark:text-white/90 space-y-2">
                                            <li className="flex items-center">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                                                78% reduction in seasonal turnover
                                            </li>
                                            <li className="flex items-center">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                                                Crew stays through slow seasons
                                            </li>
                                            <li className="flex items-center">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                                                Faster project completion with experienced team
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="card glass glow-orange lg:p-10">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-6">Seasonal Impact</div>
                                    <div className="space-y-6">
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-white/80 mb-2">Winter Retention Rate</div>
                                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 mb-2">
                                                <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full" style={{ width: '89%' }}></div>
                                            </div>
                                            <div className="text-green-600 dark:text-green-400 font-bold">89% (was 45%)</div>
                                        </div>
                                        
                                        <div>
                                            <div className="text-sm text-gray-600 dark:text-white/80 mb-2">Project Completion Time</div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-red-600 dark:text-red-400">Before: 6.2 weeks avg</span>
                                                <span className="text-green-600 dark:text-green-400">After: 4.8 weeks avg</span>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-4 border-t">
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">$89,000</div>
                                            <div className="text-sm text-gray-600 dark:text-white/80">Annual savings from reduced turnover</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-16">
                        <div className="inline-flex items-center space-x-8 p-8 bg-gradient-to-r from-bitcoin/10 to-orange-500/10 dark:from-slate-700 dark:to-slate-600 rounded-2xl">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">85%</div>
                                <div className="text-sm text-gray-600 dark:text-white/80">Average retention improvement</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">$67K</div>
                                <div className="text-sm text-gray-600 dark:text-white/80">Average annual savings</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900 dark:text-white">4.2x</div>
                                <div className="text-sm text-gray-600 dark:text-white/80">ROI on benefit investment</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bitcoin Basics Section */}
            <section className="py-16 bg-gray-50 dark:bg-slate-800 transition-colors duration-300">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Want to Learn More About the Technology?
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-white/90">
                            While you don't need to understand Bitcoin to offer this benefit, here are the basics for those who are curious.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <ExpandableSection title="What is Bitcoin?">
                            <div className="space-y-3 text-gray-700 dark:text-gray-300">
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
                            <div className="space-y-3 text-gray-700 dark:text-gray-300">
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
                            <div className="space-y-3 text-gray-700 dark:text-gray-300">
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
                            <div className="space-y-3 text-gray-700 dark:text-gray-300">
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

            {/* CTA Section */}
            <section className="py-24 bg-bitcoin-gradient dark:bg-slate-700 relative overflow-hidden transition-colors duration-300">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
                </div>

                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
                    <h3 className="text-4xl font-bold text-white mb-6">
                        Ready to Stop Losing Your Best People?
                    </h3>
                    <p className="text-2xl text-orange-100 dark:text-white/90 mb-10 leading-relaxed">
                        Find out how much this employee benefit could save your business in turnover costs and recruitment expenses.
                    </p>
                    <Link href="/calculator" className="bg-white dark:bg-slate-800 text-bitcoin-dark dark:text-white hover:bg-orange-50 dark:hover:bg-slate-900 font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-xl inline-flex items-center justify-center space-x-2">
                        <CalculatorIcon className="w-5 h-5" />
                        <span>Calculate Your ROI</span>
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
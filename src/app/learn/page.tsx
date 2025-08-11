'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { BitcoinIcon } from '@/components/icons/BitcoinIcon';
import { ExpandableSection } from '@/components/ProgressiveDisclosure';
import {
    BanknotesIcon,
    CalculatorIcon
} from '@heroicons/react/24/solid';

export default function LearnMorePage() {
    return (
        <div className="min-h-screen">
            <Navigation />

            {/* River Implementation Section */}
            <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 transition-colors duration-300">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-2xl mb-6">
                            <BanknotesIcon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Ready to Get Started?
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-white/90 max-w-2xl mx-auto">
                            Running your business can be stressful, <a href="https://river.com/signup?r=RH5MJKJM" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">buying bitcoin</a> for your employees doesn't have to be. Setup <a href="https://support.river.com/kb/guide/en/how-do-i-set-up-a-recurring-order-zkSuAYQY1V/Steps/2925281" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">recurring buys</a> to fund each grants over a few weeks or month and easily <a href="https://support.river.com/kb/guide/en/how-do-i-send-bitcoin-from-my-account-Ks1olAsF35/Steps/2128452" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">send the bitcoin</a> to an on-chain wallet with <a href="https://river.com/signup?r=RH5MJKJM" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">River</a>.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <div>
                            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                What sets River apart?
                            </h4>
                            <div className="space-y-4 text-gray-600 dark:text-white/90">
                                <p>
                                    For U.S. investors prioritizing security and long-term accumulation, River Financial offers a premier, Bitcoin-only platform. River's commitment to security is backed by industry-leading transparency, including monthly <a href="https://river.com/reserves" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">proof of reserves</a> that allow clients to verify their holdings are fully backed, and SOC 2 compliance audits.
                                </p>
                                <p>
                                    River is particularly attractive for dollar-cost averaging (DCA) strategies, offering zero fees on recurring buys, a significant advantage over competitors. As a U.S.-based and regulated institution (NMLS ID 1906809), River combines institutional-grade security with high-touch human support, making it a trusted choice for building a Bitcoin position with confidence.
                                </p>
                            </div>
                        </div>

                        <div className="card glass glow-orange p-6 lg:p-8">
                            <div className="text-center">
                                <div className="text-lg font-bold text-gray-900 dark:text-white mb-6">River Advantages</div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl">
                                        <span className="font-medium text-sm text-gray-700 dark:text-white">Recurring Buy Fees</span>
                                        <span className="font-bold text-green-600 dark:text-green-400 text-lg">$0</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl">
                                        <span className="font-medium text-sm text-gray-700 dark:text-white">Security Audits</span>
                                        <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">SOC 2</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
                                        <span className="font-medium text-sm text-gray-700 dark:text-white">Proof of Reserves</span>
                                        <span className="font-bold text-purple-600 dark:text-purple-400 text-sm">Monthly</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl">
                                        <span className="font-medium text-sm text-gray-700 dark:text-white">Regulation</span>
                                        <span className="font-bold text-orange-600 dark:text-orange-400 text-sm">NMLS ID 1906809</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bitcoin Basics Section */}
            <section className="py-16 bg-white dark:bg-slate-900 transition-colors duration-300">
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

            {/* CTA Section */}
            <section className="py-16 sm:py-20 bg-bitcoin-gradient dark:bg-slate-700 relative overflow-hidden transition-colors duration-300">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
                </div>

                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
                    <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                        Ready to Stop Losing Your Best People?
                    </h3>
                    <p className="text-xl text-orange-100 dark:text-white/90 mb-10 leading-relaxed">
                        Find out how much this employee benefit could save your business in turnover costs and recruitment expenses.
                    </p>
                    <Link href="/calculator" className="bg-white dark:bg-slate-800 text-bitcoin-dark dark:text-white hover:bg-orange-50 dark:hover:bg-slate-900 font-bold py-4 px-10 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-xl inline-flex items-center justify-center space-x-2">
                        <CalculatorIcon className="w-5 h-5" />
                        <span>Calculate Your ROI</span>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6">
                            <BitcoinIcon className="w-8 h-8 text-bitcoin" />
                        </div>
                        <h4 className="text-2xl sm:text-3xl font-bold mb-4">Build loyalty. Reduce turnover. Keep your best people.</h4>
                        <p className="text-gray-400 mb-8">
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
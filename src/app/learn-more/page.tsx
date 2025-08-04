import Link from 'next/link'

export default function LearnMorePage() {
    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <Link href="/" className="flex-shrink-0">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Secure their future. Secure your team.
                                </h1>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/calculator" className="btn-primary">
                                Try Calculator
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-orange-50 to-yellow-50 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8">
                        Why is Bitcoin the best way to secure your team?
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6 text-left">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1 mr-4">
                                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reduce Turnover</h3>
                                <p className="text-gray-600">Give top talent a compelling reason to stay and grow with you.</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1 mr-4">
                                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Transparency</h3>
                                <p className="text-gray-600">Employees track their grants on-chain, anytime. No more guessing.</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1 mr-4">
                                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Employee Empowerment</h3>
                                <p className="text-gray-600">Allow direct contributions so your team can accelerate their savings.</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mt-1 mr-4">
                                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Wellness</h3>
                                <p className="text-gray-600">Introduce your team to sound money principles and long-term wealth building.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Call-Out Sections */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* On-Chain Tracking & Transparency */}
                    <div className="mb-20">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                                    Radical Transparency
                                </h3>
                                <p className="text-lg text-gray-600">
                                    Every grant is recorded on-chain. Employees have a real-time, immutable view of their growing assets, building unparalleled trust.
                                </p>
                            </div>
                            <div className="card lg:p-8">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-bitcoin mb-2">₿0.0075</div>
                                    <div className="text-sm text-gray-600 mb-4">Currently Vested</div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                        <div className="bg-bitcoin h-2 rounded-full" style={{ width: '50%' }}></div>
                                    </div>
                                    <div className="text-sm text-gray-500">50% vested • 2.5 years remaining</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 24/7 Employee Contributions */}
                    <div className="mb-20">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="order-2 lg:order-1">
                                <div className="card lg:p-8">
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-gray-900 mb-4">Employee Dashboard</div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                <span className="text-sm text-gray-600">Company Grant</span>
                                                <span className="font-semibold">₿0.015</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                                                <span className="text-sm text-gray-600">Personal Contributions</span>
                                                <span className="font-semibold text-green-600">₿0.008</span>
                                            </div>
                                            <div className="border-t pt-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold">Total Balance</span>
                                                    <span className="text-lg font-bold text-bitcoin">₿0.023</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                                    Empower Financial Ownership
                                </h3>
                                <p className="text-lg text-gray-600">
                                    Employees can contribute directly to their plan 24/7, giving them direct control and turning their benefit into a personal wealth-building engine.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Long-Term Returns */}
                    <div className="mb-20">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="w-16 h-16 bg-bitcoin/10 rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8 text-bitcoin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                                    Powered by Sound Money
                                </h3>
                                <p className="text-lg text-gray-600">
                                    Move beyond traditional plans. Offer a benefit with the potential for significant long-term growth, backed by the world's premier digital asset.
                                </p>
                            </div>
                            <div className="card lg:p-8">
                                <div className="text-center">
                                    <div className="text-sm text-gray-600 mb-4">Historical Performance</div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm">5 Years</span>
                                            <span className="font-semibold text-green-600">+1,200%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm">10 Years</span>
                                            <span className="font-semibold text-green-600">+9,000%</span>
                                        </div>
                                        <div className="border-t pt-3 text-xs text-gray-500">
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
                                <div className="card lg:p-8">
                                    <div className="text-center">
                                        <div className="text-sm text-gray-600 mb-4">Industry Comparison</div>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm">Traditional Benefits</span>
                                                    <span className="text-sm">65% retention</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-gray-400 h-2 rounded-full" style={{ width: '65%' }}></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm">Bitcoin Vesting</span>
                                                    <span className="text-sm text-green-600">89% retention</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                                    The Ultimate Retention Tool
                                </h3>
                                <p className="text-lg text-gray-600">
                                    In a competitive market, a truly valuable benefit makes the difference. Attract and keep top talent who are invested in the company's long-term vision.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-orange-600 to-yellow-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h3 className="text-3xl font-bold text-white mb-6">
                        Ready to Transform Your Benefits?
                    </h3>
                    <p className="text-xl text-orange-100 mb-8">
                        Start planning your Bitcoin vesting program today and give your team a reason to stay.
                    </p>
                    <Link href="/calculator" className="bg-white text-orange-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200">
                        Try the Calculator
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h4 className="text-2xl font-bold mb-4">Secure their future. Secure your team.</h4>
                        <p className="text-gray-400 mb-6">
                            Empowering employers to reward teams with sound money
                        </p>
                        <div className="text-sm text-gray-500">
                            Built with Next.js • Deployed on Netlify • Real-time Bitcoin prices via CoinGecko
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
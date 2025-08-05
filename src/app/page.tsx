import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  Secure their future. Secure your team.
                </h1>
              </div>
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
      <section className="bg-gradient-to-br from-orange-50 to-yellow-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Reward loyalty with
              <span className="text-bitcoin"> sound money.</span>
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Create an employee retention protocol that works.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/calculator" className="btn-primary text-lg px-8 py-3">
                Start Planning
              </Link>
              <Link href="/learn-more" className="btn-secondary text-lg px-8 py-3">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Bitcoin Pioneer */}
            <Link href="/calculator?plan=accelerator" className="card hover:shadow-lg transition-shadow block">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-blue-500 rounded"></div>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Bitcoin Pioneer
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Jump-start your team's Bitcoin journey with immediate grants. Perfect for companies ready to lead in digital asset compensation.
                </p>
                <div className="text-sm text-gray-500">
                  • 0.02 ₿ initial grant<br/>
                  • 50% vested at 5 years<br/>
                  • 100% vested at 10 years
                </div>
              </div>
            </Link>

            {/* Dollar Cost Advantage */}
            <Link href="/calculator?plan=steady-builder" className="card hover:shadow-lg transition-shadow block">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-green-500 rounded"></div>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Dollar Cost Advantage
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Minimize market timing risk with strategic yearly distributions. Ideal for conservative approaches to Bitcoin adoption.
                </p>
                <div className="text-sm text-gray-500">
                  • 0.015 ₿ initial + 0.001 ₿ yearly<br/>
                  • 50% vested at 5 years<br/>
                  • 100% vested at 10 years
                </div>
              </div>
            </Link>

            {/* Wealth Builder */}
            <Link href="/calculator?plan=slow-burn" className="card hover:shadow-lg transition-shadow block">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-purple-500 rounded"></div>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Wealth Builder
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Maximum retention incentive with 10-year distribution. Designed for companies prioritizing employee loyalty.
                </p>
                <div className="text-sm text-gray-500">
                  • 0.002 ₿ yearly for 10 years<br/>
                  • 50% vested at 5 years<br/>
                  • 100% vested at 10 years
                </div>
              </div>
            </Link>




          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Why Bitcoin Vesting?
              </h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Enhanced Retention
                    </h4>
                    <p className="text-gray-600">
                      Employees stay longer when they see their Bitcoin balance growing with time and market performance.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Financial Education
                    </h4>
                    <p className="text-gray-600">
                      Introduce your team to sound money principles and help them build long-term wealth.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Transparent & Trackable
                    </h4>
                    <p className="text-gray-600">
                      Employees can track their vesting balance on-chain, providing complete transparency and trust.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card lg:p-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-bitcoin mb-2">₿0.015</div>
                <div className="text-sm text-gray-600 mb-4">Standard Initial Grant</div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">5</div>
                    <div className="text-sm text-gray-600">Years to 50%</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">10</div>
                    <div className="text-sm text-gray-600">Years to 100%</div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Bitcoin Pioneer:</span>
                      <span>0.02 ₿ upfront</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Dollar Cost Advantage:</span>
                      <span>0.015 ₿ + 0.001 ₿/year (5 years)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Wealth Builder:</span>
                      <span>0.002 ₿/year (10 years)</span>
                    </div>

                    <div className="pt-2 border-t border-gray-100 text-center">
                      <span className="text-xs text-gray-500">Standard schemes total 0.02 ₿</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-yellow-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-6">
            Ready to Start Planning?
          </h3>
          <p className="text-xl text-orange-100 mb-8">
            Use our calculator to model different vesting scenarios and find the perfect fit for your team.
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
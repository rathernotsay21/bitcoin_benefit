'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function RiskDisclosure() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Risk Disclosure</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-sm p-6 mb-8">
            <p className="text-red-900 dark:text-red-200 font-semibold text-lg">
              ⚠️ IMPORTANT: Bitcoin and cryptocurrency investments carry substantial risk of loss. 
              You may lose some or all of your investment.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Bitcoin Volatility</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Bitcoin is an extremely volatile asset with significant price fluctuations:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Bitcoin prices can change dramatically within hours or even minutes</li>
              <li>Past performance does not guarantee or predict future returns</li>
              <li>Bitcoin has experienced drops of over 80% from its peaks multiple times</li>
              <li>Market manipulation and low liquidity can cause extreme price movements</li>
              <li>Technical issues, regulatory changes, or market sentiment can trigger sudden crashes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Complete Loss Risk</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              You could lose your entire Bitcoin investment due to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Market risk:</strong> Bitcoin value could go to zero</li>
              <li><strong>Technical risk:</strong> Loss of private keys means permanent loss of Bitcoin</li>
              <li><strong>Security risk:</strong> Hacking, theft, or fraud</li>
              <li><strong>Operational risk:</strong> Exchange failures or exit scams</li>
              <li><strong>Human error:</strong> Sending to wrong addresses or losing backup phrases</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Regulatory Uncertainty</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Bitcoin faces significant regulatory risks worldwide:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-3">
              <li>Governments may ban or restrict Bitcoin use at any time</li>
              <li>Tax treatment of Bitcoin varies by jurisdiction and may change</li>
              <li>Regulatory changes can significantly impact Bitcoin&apos;s value and usability</li>
              <li>Legal status of Bitcoin remains uncertain in many countries</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Security Responsibilities</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Bitcoin ownership requires significant security responsibilities:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>You are solely responsible for securing your private keys</li>
              <li>Lost or stolen private keys cannot be recovered</li>
              <li>No insurance or government protection exists for Bitcoin holdings</li>
              <li>Transactions are irreversible - mistakes cannot be undone</li>
              <li>Phishing, malware, and social engineering attacks are common</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Tax Obligations</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Bitcoin transactions may have significant tax implications:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-3">
              <li>Bitcoin transactions may be taxable events in your jurisdiction</li>
              <li>You are responsible for tracking and reporting all transactions</li>
              <li>Tax rates and rules vary significantly by country and state</li>
              <li>Failure to properly report can result in penalties and legal action</li>
              <li>Consult a qualified tax professional for your specific situation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Technology Risks</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Bitcoin technology carries inherent risks:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-3">
              <li>Network attacks or failures could impact Bitcoin&apos;s functionality</li>
              <li>Software bugs or vulnerabilities may be discovered</li>
              <li>Quantum computing could potentially threaten Bitcoin&apos;s security</li>
              <li>Scaling issues may affect transaction costs and speeds</li>
              <li>Fork events can create confusion and price volatility</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Market Risks</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Bitcoin markets present unique risks:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-3">
              <li>24/7 trading means prices can change while you sleep</li>
              <li>Limited liquidity can make large transactions difficult</li>
              <li>Market manipulation is possible due to lack of regulation</li>
              <li>Exchange outages during volatile periods are common</li>
              <li>Spreads and fees can significantly impact returns</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Employment Compensation Risks</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Using Bitcoin for employee compensation involves additional risks:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-3">
              <li>Employees may lose significant value if Bitcoin price drops</li>
              <li>Vesting schedules may lock in losses during bear markets</li>
              <li>Tax treatment of Bitcoin compensation can be complex</li>
              <li>Companies may face accounting and reporting challenges</li>
              <li>Employee satisfaction may be affected by price volatility</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. No Guarantees</h2>
            <p className="text-gray-700 dark:text-gray-300 font-semibold">
              This tool&apos;s projections and calculations are hypothetical and should not be relied upon for investment decisions:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-3">
              <li>All projections are estimates based on assumptions that may prove incorrect</li>
              <li>Actual results will vary significantly from any projections shown</li>
              <li>No returns are guaranteed - you may lose your entire investment</li>
              <li>This tool does not constitute investment advice or recommendations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Seek Professional Advice</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Before making any investment decisions regarding Bitcoin:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-3">
              <li>Consult with qualified financial advisors</li>
              <li>Speak with tax professionals about implications</li>
              <li>Consider your risk tolerance and financial situation</li>
              <li>Never invest more than you can afford to lose completely</li>
              <li>Understand that Bitcoin is speculative and experimental</li>
            </ul>
          </section>

          <div className="bg-bitcoin-50 dark:bg-bitcoin-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-sm p-6 mt-12">
            <p className="text-amber-900 dark:text-amber-200 font-semibold">
              By using this tool, you acknowledge that you understand and accept all risks associated with Bitcoin 
              investments. You agree that you are solely responsible for any investment decisions and their consequences.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-6">
              <Link href="/" className="text-bitcoin hover:text-bitcoin-600 font-medium">
                ← Return to Home
              </Link>
              <Link href="/terms" className="text-bitcoin hover:text-bitcoin-600 font-medium">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-bitcoin hover:text-bitcoin-600 font-medium">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
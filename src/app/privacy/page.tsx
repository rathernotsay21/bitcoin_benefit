'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            <strong>Effective Date:</strong> January 1, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Bitcoin Benefit is designed with privacy in mind. We collect minimal information:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>No Personal Information:</strong> We do not collect names, email addresses, or other personal identifiers</li>
              <li><strong>Calculator Data:</strong> All calculations are performed locally in your browser and are not sent to our servers</li>
              <li><strong>Usage Analytics:</strong> We may collect anonymous usage statistics to improve our service</li>
              <li><strong>Local Storage:</strong> We use browser local storage to save your preferences and calculations on your device</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. How Calculations Work</h2>
            <p className="text-gray-700 dark:text-gray-300">
              All Bitcoin vesting calculations and projections are performed entirely within your web browser. This means:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-3">
              <li>Your financial data never leaves your device</li>
              <li>We cannot access your calculation inputs or results</li>
              <li>No calculation history is stored on our servers</li>
              <li>You maintain complete privacy over your financial planning</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. External API Usage</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              We use the following external services to provide current data:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>CoinGecko API:</strong> For current Bitcoin price data</li>
              <li><strong>Mempool.space API:</strong> For Bitcoin network statistics and fee recommendations</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              These services receive only generic requests for public market data. No personal or calculation data is shared with these services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Cookies and Tracking</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We use minimal cookies and tracking technologies:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-3">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Preference Cookies:</strong> Remember your settings like theme preference (light/dark mode)</li>
              <li><strong>No Advertising Cookies:</strong> We do not use advertising or marketing cookies</li>
              <li><strong>No Third-Party Tracking:</strong> We do not share data with advertising networks</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Data Storage and Security</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Your data security is important to us:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-3">
              <li>All data processing happens in your browser</li>
              <li>We use HTTPS encryption for all connections</li>
              <li>Local storage data remains on your device</li>
              <li>You can clear local storage at any time through your browser settings</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Third-Party Links</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Our website may contain links to third-party websites (such as Bitcoin exchanges or hardware wallet providers). 
              We are not responsible for the privacy practices of these external sites. We encourage you to review their 
              privacy policies before providing any personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Children&apos;s Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Our service is not directed to individuals under the age of 18. We do not knowingly collect personal 
              information from children. This service is intended for business and financial planning purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Your Rights</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Since we don&apos;t collect personal information, traditional data rights may not apply. However, you can:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Clear your browser&apos;s local storage to remove saved preferences</li>
              <li>Use private/incognito browsing to prevent local data storage</li>
              <li>Disable JavaScript to prevent calculator functionality (though this will limit site features)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. International Users</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Bitcoin Benefit is accessible globally. By using our service from outside the United States, you understand 
              that any data processing occurs according to U.S. standards. However, since we process data locally in your 
              browser, your information remains under your control regardless of your location.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated 
              effective date. Continued use of our service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">11. Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have questions about this Privacy Policy or our privacy practices, please contact us through the 
              information provided on this website.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-300">
              Thank you for trusting Bitcoin Benefit with your financial planning needs. We are committed to protecting 
              your privacy while providing valuable educational tools.
            </p>
            <div className="mt-6">
              <Link href="/" className="text-bitcoin hover:text-bitcoin-600 font-medium">
                ← Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
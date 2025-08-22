'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            <strong>Effective Date:</strong> January 1, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Educational Purpose Only</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Bitcoin Benefit is an educational tool designed to help users understand potential Bitcoin vesting scenarios. 
              This service provides calculators and informational resources for educational purposes only.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. No Financial Advice</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              <strong>THIS SERVICE DOES NOT PROVIDE FINANCIAL, INVESTMENT, TAX, OR LEGAL ADVICE.</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>All calculations and projections are hypothetical and for illustrative purposes only</li>
              <li>Past performance does not guarantee or indicate future results</li>
              <li>Bitcoin is highly volatile and speculative</li>
              <li>Users should consult qualified professionals before making any financial decisions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. User Responsibilities</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">By using this service, you acknowledge and agree that:</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>You are solely responsible for any decisions made based on information from this service</li>
              <li>You will comply with all applicable laws and regulations in your jurisdiction</li>
              <li>You understand the risks associated with Bitcoin and cryptocurrency investments</li>
              <li>You will not use this service for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Accuracy of Information</h2>
            <p className="text-gray-700 dark:text-gray-300">
              While we strive to provide accurate information, we make no warranties or representations about the accuracy, 
              completeness, or timeliness of any information provided. Bitcoin prices and market data are obtained from 
              third-party sources and may be delayed or inaccurate.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Limitation of Liability</h2>
            <p className="text-gray-700 dark:text-gray-300">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL BITCOIN BENEFIT, ITS OPERATORS, OR AFFILIATES BE 
              LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR 
              RELATING TO YOUR USE OF THIS SERVICE, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF DATA, OR 
              INVESTMENT LOSSES.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Indemnification</h2>
            <p className="text-gray-700 dark:text-gray-300">
              You agree to indemnify, defend, and hold harmless Bitcoin Benefit and its operators from any claims, losses, 
              damages, liabilities, and expenses (including attorney fees) arising from your use of this service or 
              violation of these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 dark:text-gray-300">
              All content, features, and functionality of this service are owned by Bitcoin Benefit and are protected by 
              international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Modifications to Service</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to modify or discontinue this service at any time without notice. We shall not be 
              liable to you or any third party for any modification, suspension, or discontinuance of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Governing Law</h2>
            <p className="text-gray-700 dark:text-gray-300">
              These terms shall be governed by and construed in accordance with the laws of the United States, without 
              regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Contact Information</h2>
            <p className="text-gray-700 dark:text-gray-300">
              For questions about these Terms of Service, please contact us through the information provided on this website.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-300">
              By using Bitcoin Benefit, you acknowledge that you have read, understood, and agree to be bound by these 
              Terms of Service.
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
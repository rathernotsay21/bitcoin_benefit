import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { validateToolId } from '@/types/bitcoin-tools';
import { LockClosedIcon, BookOpenIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/solid';

// Lazy load privacy and command components
const DataUsageTransparency = dynamic(
  () => import('@/components/bitcoin-tools/PrivacyWarning').then(mod => ({ default: mod.DataUsageTransparency })),
  { ssr: false }
);

const ToolCommandPalette = dynamic(
  () => import('@/components/bitcoin-tools/ToolCommandPalette').then(mod => ({ default: mod.ToolCommandPalette })),
  { ssr: false }
);

// Lazy load the tabbed navigation component
const ToolTabsNavigation = dynamic(() => import('@/components/bitcoin-tools/ToolTabsNavigation'), {
  loading: () => (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-4 mb-8 h-20 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
      </div>
    </div>
  ),
  ssr: false
});

export const metadata: Metadata = {
  title: 'Bitcoin Tools | Simple Blockchain Tools for Everyone',
  description: 'User-friendly Bitcoin blockchain tools: transaction lookup, fee calculator, network status, address explorer, and document timestamping. No technical knowledge required.',
  keywords: ['bitcoin', 'blockchain', 'transaction', 'fees', 'mempool', 'tools', 'cryptocurrency'],
  robots: 'index, follow',
  openGraph: {
    title: 'Bitcoin Tools - Simple Blockchain Tools for Everyone',
    description: 'Easy-to-use Bitcoin blockchain tools for checking transactions, calculating fees, and exploring the network.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bitcoin Tools - Simple Blockchain Tools for Everyone',
    description: 'Easy-to-use Bitcoin blockchain tools for checking transactions, calculating fees, and exploring the network.',
  },
};

interface BitcoinToolsPageProps {
  searchParams?: {
    tool?: string;
    txid?: string;
    address?: string;
  };
}

export default function BitcoinToolsPage({ searchParams }: BitcoinToolsPageProps) {
  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navigation />
      
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-tools" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-bitcoin text-white px-4 py-2 rounded-md text-sm font-medium z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bitcoin"
      >
        Skip to main content
      </a>

      {/* Enhanced Hero Section */}
      <section className="relative min-h-[150px] py-8 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Enhanced background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-bitcoin/10 to-blue-500/10" aria-hidden="true"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent dark:via-slate-800/20" aria-hidden="true"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-slate-700 via-slate-900 to-slate-700 dark:from-slate-200 dark:via-white dark:to-slate-300 bg-clip-text text-transparent">Bitcoin </span>
              <span className="bg-gradient-to-r from-bitcoin via-orange-400 to-bitcoin bg-clip-text text-transparent">Tools</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-700 dark:text-slate-700 leading-relaxed">
              In theory, there is no difference between theory and practice.<br />In practice, there is.
            </p>
          </div>
        </div>
      </section>

      {/* Command Palette - Lazy loaded */}
      <Suspense fallback={null}>
        <ToolCommandPalette />
      </Suspense>

      {/* Enhanced Tools Interface */}
      <main id="main-tools" className="pb-24 -mt-4" role="main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={
            <div className="animate-pulse">
              <div className="grid grid-cols-3 lg:grid-cols-5 gap-4 mb-8 h-20 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
            </div>
          }>
            <ToolTabsNavigation 
              searchParams={{
                ...(validateToolId(searchParams?.tool) && { tool: validateToolId(searchParams?.tool)! }),
                ...(searchParams?.txid && { txid: searchParams.txid }),
                ...(searchParams?.address && { address: searchParams.address })
              }}
            />
          </Suspense>
        </div>

        {/* Educational Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <aside className="mt-20" aria-labelledby="educational-heading">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-sm shadow-sm border border-gray-200/60 dark:border-gray-700/60 p-8 sm:p-12">
            <h3 id="educational-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              New to Bitcoin?
            </h3>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-600 max-w-3xl mx-auto mb-8 px-4 text-center leading-relaxed">
              These tools help you interact with the Bitcoin blockchain safely and easily. 
              All data is processed securely, and we never store your personal information.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center group" role="article">
                <div className="w-16 h-16 mx-auto mb-4 bg-bitcoin/10 rounded-sm flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <LockClosedIcon className="w-8 h-8 text-bitcoin" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Privacy First</h4>
                <p className="text-base text-gray-600 dark:text-gray-600 leading-relaxed">No accounts, no tracking, data processed locally when possible</p>
              </div>
              <div className="text-center group" role="article">
                <div className="w-16 h-16 mx-auto mb-4 bg-bitcoin/10 rounded-sm flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <BookOpenIcon className="w-8 h-8 text-bitcoin" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Learn as You Go</h4>
                <p className="text-base text-gray-600 dark:text-gray-600 leading-relaxed">Helpful explanations and tooltips for Bitcoin terms</p>
              </div>
              <div className="text-center group" role="article">
                <div className="w-16 h-16 mx-auto mb-4 bg-bitcoin/10 rounded-sm flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <DevicePhoneMobileIcon className="w-8 h-8 text-bitcoin" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Mobile Friendly</h4>
                <p className="text-base text-gray-600 dark:text-gray-600 leading-relaxed">Works perfectly on all devices and screen sizes</p>
              </div>
            </div>
          </div>
          </aside>

          {/* Data Usage Transparency - Lazy loaded */}
          <Suspense fallback={null}>
            <DataUsageTransparency className="mt-12 sm:mt-16" />
          </Suspense>

          {/* Privacy Notice */}
          <footer className="mt-8 sm:mt-12 text-center" role="contentinfo" aria-labelledby="privacy-notice">
          <p id="privacy-notice" className="text-sm sm:text-base text-gray-500 dark:text-gray-600 max-w-4xl mx-auto px-4 leading-relaxed text-center">
            <strong>Privacy Notice:</strong> These tools may send data to public APIs (like mempool.space) to fetch blockchain information. 
            We do not store or track this data. Data is automatically cleared when you leave this page. For maximum privacy, consider running your own Bitcoin node.
          </p>
          </footer>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
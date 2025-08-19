import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load tool components for better performance
const TransactionLookupTool = dynamic(() => import('@/components/bitcoin-tools/TransactionLookupTool'), {
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>,
  ssr: false
});

const FeeCalculatorTool = dynamic(() => import('@/components/bitcoin-tools/FeeCalculatorTool'), {
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>,
  ssr: false
});

const NetworkStatusTool = dynamic(() => import('@/components/bitcoin-tools/NetworkStatus'), {
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>,
  ssr: false
});

const AddressExplorerTool = dynamic(() => import('@/components/bitcoin-tools/AddressExplorerTool'), {
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>,
  ssr: false
});

const DocumentTimestampingTool = dynamic(() => import('@/components/bitcoin-tools/DocumentTimestampingTool'), {
  loading: () => <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-tools" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-bitcoin text-white px-4 py-2 rounded-md text-sm font-medium z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bitcoin"
      >
        Skip to main content
      </a>

      {/* Header Section */}
      <header className="relative overflow-hidden" role="banner">
        <div className="absolute inset-0 bg-gradient-to-r from-bitcoin/10 to-blue-500/10" aria-hidden="true"></div>
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16 sm:pb-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Bitcoin Tools
              <span className="block text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-normal text-gray-600 dark:text-gray-300 mt-1 sm:mt-2">
                Simple blockchain tools for everyone
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              Explore the Bitcoin blockchain with user-friendly tools. Check transactions, calculate fees, 
              monitor network status, and more - all without needing technical expertise.
            </p>
          </div>
        </div>
      </header>

      {/* Tools Grid */}
      <main id="main-tools" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-16 sm:pb-24" role="main">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Transaction Lookup Tool */}
          <section 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
            aria-labelledby="transaction-lookup-heading"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-bitcoin/10 dark:bg-bitcoin/20 rounded-lg flex items-center justify-center mr-3 sm:mr-4" aria-hidden="true">
                <span className="text-xl sm:text-2xl">🔍</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="transaction-lookup-heading" className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Transaction Lookup
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate sm:whitespace-normal">
                  Check any Bitcoin transaction status
                </p>
              </div>
            </div>
            <Suspense fallback={
              <div 
                className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"
                role="status"
                aria-label="Loading transaction lookup tool"
              />
            }>
              <TransactionLookupTool initialTxid={searchParams?.txid} />
            </Suspense>
          </section>

          {/* Fee Calculator Tool */}
          <section 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
            aria-labelledby="fee-calculator-heading"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-bitcoin/10 dark:bg-bitcoin/20 rounded-lg flex items-center justify-center mr-3 sm:mr-4" aria-hidden="true">
                <span className="text-xl sm:text-2xl">💰</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="fee-calculator-heading" className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Smart Fee Calculator
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate sm:whitespace-normal">
                  Find the right fee for your transaction
                </p>
              </div>
            </div>
            <Suspense fallback={
              <div 
                className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"
                role="status"
                aria-label="Loading fee calculator tool"
              />
            }>
              <FeeCalculatorTool />
            </Suspense>
          </section>

          {/* Network Status Tool */}
          <section 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
            aria-labelledby="network-status-heading"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-bitcoin/10 dark:bg-bitcoin/20 rounded-lg flex items-center justify-center mr-3 sm:mr-4" aria-hidden="true">
                <span className="text-xl sm:text-2xl">📊</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="network-status-heading" className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Network Status
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate sm:whitespace-normal">
                  Monitor Bitcoin network health
                </p>
              </div>
            </div>
            <Suspense fallback={
              <div 
                className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"
                role="status"
                aria-label="Loading network status tool"
              />
            }>
              <NetworkStatusTool />
            </Suspense>
          </section>

          {/* Address Explorer Tool */}
          <section 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
            aria-labelledby="address-explorer-heading"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-bitcoin/10 dark:bg-bitcoin/20 rounded-lg flex items-center justify-center mr-3 sm:mr-4" aria-hidden="true">
                <span className="text-xl sm:text-2xl">🏠</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="address-explorer-heading" className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Address Explorer
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate sm:whitespace-normal">
                  Check address balance and history
                </p>
              </div>
            </div>
            <Suspense fallback={
              <div 
                className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"
                role="status"
                aria-label="Loading address explorer tool"
              />
            }>
              <AddressExplorerTool initialAddress={searchParams?.address} />
            </Suspense>
          </section>

          {/* Document Timestamping Tool - Full Width */}
          <section 
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
            aria-labelledby="document-timestamping-heading"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-bitcoin/10 dark:bg-bitcoin/20 rounded-lg flex items-center justify-center mr-3 sm:mr-4" aria-hidden="true">
                <span className="text-xl sm:text-2xl">⏰</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="document-timestamping-heading" className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Document Timestamping
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate sm:whitespace-normal">
                  Prove when a document existed using Bitcoin's blockchain
                </p>
              </div>
            </div>
            <Suspense fallback={
              <div 
                className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"
                role="status"
                aria-label="Loading document timestamping tool"
              />
            }>
              <DocumentTimestampingTool />
            </Suspense>
          </section>

        </div>

        {/* Educational Footer */}
        <aside className="mt-12 sm:mt-16 text-center" aria-labelledby="educational-heading">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <h3 id="educational-heading" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              New to Bitcoin?
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6 px-4">
              These tools help you interact with the Bitcoin blockchain safely and easily. 
              All data is processed securely, and we never store your personal information.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="text-center" role="article">
                <div className="text-2xl mb-2" aria-hidden="true">🔒</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Privacy First</h4>
                <p className="text-gray-600 dark:text-gray-400">No accounts, no tracking, data processed locally when possible</p>
              </div>
              <div className="text-center" role="article">
                <div className="text-2xl mb-2" aria-hidden="true">📚</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Learn as You Go</h4>
                <p className="text-gray-600 dark:text-gray-400">Helpful explanations and tooltips for Bitcoin terms</p>
              </div>
              <div className="text-center" role="article">
                <div className="text-2xl mb-2" aria-hidden="true">📱</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Mobile Friendly</h4>
                <p className="text-gray-600 dark:text-gray-400">Works perfectly on all devices and screen sizes</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Privacy Notice */}
        <footer className="mt-6 sm:mt-8 text-center" role="contentinfo" aria-labelledby="privacy-notice">
          <p id="privacy-notice" className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-4xl mx-auto px-4">
            <strong>Privacy Notice:</strong> These tools may send data to public APIs (like mempool.space) to fetch blockchain information. 
            We do not store or track this data. For maximum privacy, consider running your own Bitcoin node.
          </p>
        </footer>
      </main>
    </div>
  );
}
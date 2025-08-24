import { Metadata } from 'next';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ToolTabsNavigation from '@/components/bitcoin-tools/ToolTabsNavigation';
import { ToolCommandPalette } from '@/components/bitcoin-tools/ToolCommandPalette';
import { DataUsageTransparency } from '@/components/bitcoin-tools/PrivacyWarning';
import { validateToolId } from '@/types/bitcoin-tools';

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

export default function EnhancedBitcoinToolsPage({ searchParams }: BitcoinToolsPageProps) {
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8 sm:pb-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-4xl sm:text-5xl mr-3" role="img" aria-label="Tools">
                🛠️
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Bitcoin Tools
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6">
              Explore the Bitcoin blockchain with user-friendly tools. No technical expertise required.
            </p>
            
            {/* Feature badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              <Badge variant="outline" className="bg-white/80 dark:bg-slate-800/80">
                🔒 Privacy First
              </Badge>
              <Badge variant="outline" className="bg-white/80 dark:bg-slate-800/80">
                📱 Mobile Friendly
              </Badge>
              <Badge variant="outline" className="bg-white/80 dark:bg-slate-800/80">
                ⚡ Real-time Data
              </Badge>
            </div>

            {/* Command Palette */}
            <ToolCommandPalette />
          </div>
        </div>
      </header>

      {/* Main Tools Section */}
      <main id="main-tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" role="main">
        <Suspense fallback={
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
          </div>
        }>
          <ToolTabsNavigation 
            defaultTool="transaction" 
            searchParams={{
              tool: validateToolId(searchParams?.tool) || undefined,
              txid: searchParams?.txid,
              address: searchParams?.address
            }}
          />
        </Suspense>

        <Separator className="my-12" />

        {/* Educational Content */}
        <section className="mt-12" aria-labelledby="educational-heading">
          <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2">
            <CardHeader className="text-center">
              <CardTitle id="educational-heading" className="text-2xl font-bold flex items-center justify-center gap-2">
                <span role="img" aria-label="Education">📚</span>
                New to Bitcoin?
              </CardTitle>
              <CardDescription className="text-base max-w-2xl mx-auto">
                These tools help you interact with the Bitcoin blockchain safely and easily. 
                All data is processed securely, and we never store your personal information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4" role="article">
                  <div className="w-12 h-12 mx-auto mb-4 bg-bitcoin/10 dark:bg-bitcoin/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl" role="img" aria-label="Privacy">🔒</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Privacy First</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No accounts, no tracking, data processed locally when possible
                  </p>
                </div>
                <div className="text-center p-4" role="article">
                  <div className="w-12 h-12 mx-auto mb-4 bg-bitcoin/10 dark:bg-bitcoin/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl" role="img" aria-label="Learning">📖</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Learn as You Go</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Helpful explanations and tooltips for Bitcoin terms
                  </p>
                </div>
                <div className="text-center p-4" role="article">
                  <div className="w-12 h-12 mx-auto mb-4 bg-bitcoin/10 dark:bg-bitcoin/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl" role="img" aria-label="Mobile">📱</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Mobile Friendly</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Works perfectly on all devices and screen sizes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Data Usage Transparency */}
        <DataUsageTransparency className="mt-8" />

        {/* Privacy Notice */}
        <footer className="mt-8" role="contentinfo" aria-labelledby="privacy-notice">
          <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <p id="privacy-notice" className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-4xl mx-auto">
                <strong className="text-gray-900 dark:text-gray-100">Privacy Notice:</strong> These tools may send data to public APIs (like mempool.space) to fetch blockchain information. 
                We do not store or track this data. Data is automatically cleared when you leave this page. For maximum privacy, consider running your own Bitcoin node.
              </p>
            </CardContent>
          </Card>
        </footer>
      </main>
    </div>
  );
}
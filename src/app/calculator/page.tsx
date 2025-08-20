'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

function CalculatorRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for scheme query parameter
    const scheme = searchParams.get('scheme');

    // Map scheme names to valid routes
    const schemeMap: Record<string, string> = {
      'accelerator': 'accelerator',
      'steady-builder': 'steady-builder',
      'slow-burn': 'slow-burn',
      // Also handle the display names
      'pioneer': 'accelerator',
      'stacker': 'steady-builder',
      'builder': 'slow-burn'
    };

    // Redirect to the specified scheme or default to accelerator
    const targetScheme = scheme && schemeMap[scheme.toLowerCase()] ? schemeMap[scheme.toLowerCase()] : 'accelerator';
    router.replace(`/calculator/${targetScheme}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[150px] py-8 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-bitcoin/10 to-blue-500/10" aria-hidden="true"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-slate-700 via-slate-900 to-slate-700 dark:from-slate-200 dark:via-white dark:to-slate-300 bg-clip-text text-transparent">Finding Your Perfect </span>
              <span className="bg-gradient-to-r from-bitcoin via-orange-400 to-bitcoin bg-clip-text text-transparent">Vesting Plan</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              Getting the right calculator ready for your team...
            </p>
          </div>
        </div>
      </section>
      
      {/* Loading Section */}
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-300">Loading calculator...</p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Navigation />
        
        {/* Hero Section */}
        <section className="relative min-h-[150px] py-8 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="absolute inset-0 bg-gradient-to-r from-bitcoin/10 to-blue-500/10" aria-hidden="true"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-slate-700 via-slate-900 to-slate-700 dark:from-slate-200 dark:via-white dark:to-slate-300 bg-clip-text text-transparent">Finding Your Perfect </span>
                <span className="bg-gradient-to-r from-bitcoin via-orange-400 to-bitcoin bg-clip-text text-transparent">Vesting Plan</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                Getting the right calculator ready for your team...
              </p>
            </div>
          </div>
        </section>
        
        {/* Loading Section */}
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-slate-300">Loading calculator...</p>
          </div>
        </div>
        
        <Footer />
      </div>
    }>
      <CalculatorRedirect />
    </Suspense>
  );
}
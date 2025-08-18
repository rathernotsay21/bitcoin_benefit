'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin mx-auto mb-4"></div>
        <p className="text-deepSlate dark:text-slate-300">Loading calculator...</p>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-300">Loading calculator...</p>
        </div>
      </div>
    }>
      <CalculatorRedirect />
    </Suspense>
  );
}
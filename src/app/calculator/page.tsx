'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CalculatorPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the default accelerator plan
    router.replace('/calculator/accelerator');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-slate-300">Loading calculator...</p>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { ClockIcon } from '@heroicons/react/24/solid';
import { BitcoinCircleOutlineIcon } from '@/components/icons';

export function HeroButtons() {
  return (
    <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6 px-4">
      <Link 
        href="/calculator" 
        className="hero-btn-primary inline-flex items-center justify-center gap-4 px-12 py-4 font-bold text-lg rounded-xl transition-all duration-300 group border-2 border-bitcoin bg-slate-900/90 hover:bg-slate-800 hover:border-yellow-400 shadow-lg hover:shadow-xl hover:shadow-bitcoin/25"
        style={{ color: '#F7931A' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#F7931A'}
      >
        <BitcoinCircleOutlineIcon className="w-8 h-8 transition-transform duration-300 group-hover:rotate-12" />
        <span className="relative z-10">Build Your Plan</span>
      </Link>
      <Link 
        href="/historical" 
        className="hero-btn-secondary inline-flex items-center justify-center gap-4 px-12 py-4 font-bold text-lg rounded-xl transition-all duration-300 group border-2 border-slate-600 bg-slate-800/60 backdrop-blur-sm hover:bg-slate-700/60 hover:border-blue-400 shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
        style={{ color: '#e2e8f0' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#e2e8f0'}
      >
        <ClockIcon className="w-8 h-8 transition-transform duration-300 group-hover:rotate-180" />
        <span className="relative z-10">See the Proof</span>
      </Link>
    </div>
  );
}
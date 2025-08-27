'use client';

import Link from 'next/link';
import { ClockIcon } from '@heroicons/react/24/solid';
import { BitcoinCircleOutlineIcon } from '@/components/icons';

export function HeroButtons() {
  return (
    <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6 px-4">
      <Link 
        href="/calculator" 
        className="hero-btn-primary inline-flex items-center justify-center gap-3 px-10 py-4 font-bold text-lg rounded-xl transition-all duration-300 group text-bitcoin border-2 border-bitcoin bg-slate-900 hover:bg-slate-800 hover:text-white shadow-lg hover:shadow-xl hover:shadow-bitcoin/25"
      >
        <BitcoinCircleOutlineIcon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" />
        <span className="relative z-10">Build Your Plan</span>
      </Link>
      <Link 
        href="/historical" 
        className="hero-btn-secondary inline-flex items-center justify-center gap-3 px-10 py-4 font-bold text-lg rounded-xl transition-all duration-300 group text-slate-300 border-2 border-slate-600 bg-slate-800/40 backdrop-blur-sm hover:bg-slate-700/60 hover:text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
      >
        <ClockIcon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-180" />
        <span className="relative z-10">See the Proof</span>
      </Link>
    </div>
  );
}
'use client';

import Link from 'next/link';
import { ClockIcon } from '@heroicons/react/24/solid';
import { BitcoinCircleOutlineIcon } from '@/components/icons';

export function HeroButtons() {
  return (
    <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
      <Link 
        href="/calculator" 
        className="btn-hero-primary inline-flex items-center justify-center space-x-2"
      >
        <BitcoinCircleOutlineIcon className="w-8 h-8 transition-transform duration-300 group-hover:rotate-12" />
        <span>Build Your Plan</span>
      </Link>
      <Link 
        href="/historical" 
        className="btn-hero-secondary inline-flex items-center justify-center space-x-2"
      >
        <ClockIcon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-180" />
        <span>See the Proof</span>
      </Link>
    </div>
  );
}
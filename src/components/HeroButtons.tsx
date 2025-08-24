'use client';

import Link from 'next/link';
import { ClockIcon } from '@heroicons/react/24/solid';
import { BitcoinCircleOutlineIcon } from '@/components/icons';
import { useMagneticHover } from '@/hooks/useMagneticHover';

export function HeroButtons() {
  const primaryButtonRef = useMagneticHover({ strength: 0.2, maxDistance: 60 });
  const secondaryButtonRef = useMagneticHover({ strength: 0.15, maxDistance: 50 });

  return (
    <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
      <Link 
        href="/calculator" 
        className="btn-hero-primary magnetic-hover inline-flex items-center justify-center space-x-2"
        ref={primaryButtonRef as any}
      >
        <BitcoinCircleOutlineIcon className="w-8 h-8 transition-transform duration-300 group-hover:rotate-12" />
        <span>Build Your Plan</span>
      </Link>
      <Link 
        href="/historical" 
        className="btn-hero-secondary magnetic-hover inline-flex items-center justify-center space-x-2"
        ref={secondaryButtonRef as any}
      >
        <ClockIcon className="w-6 h-6 transition-transform duration-300 group-hover:rotate-180" />
        <span>See the Proof</span>
      </Link>
    </div>
  );
}
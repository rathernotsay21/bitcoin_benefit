import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VESTING_SCHEMES } from '@/lib/vesting-schemes';
import { Suspense } from 'react';
import CalculatorPlanClient from './CalculatorPlanClient';
import { CalculatorSkeleton } from '@/components/loading/CalculatorSkeleton';

interface PageProps {
  params: { plan: string };
}

// Static generation for known vesting schemes
export async function generateStaticParams() {
  return VESTING_SCHEMES.map((scheme) => ({
    plan: scheme.id,
  }));
}

// Generate metadata for each plan with better SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const scheme = VESTING_SCHEMES.find(s => s.id === params.plan);
  
  if (!scheme) {
    return {
      title: 'Plan Not Found - Bitcoin Benefit Calculator',
      description: 'The requested vesting plan could not be found.'
    };
  }

  return {
    title: `Bitcoin Vesting Calculator - Employee Benefits Platform`,
    description: `${scheme.description}. ${scheme.bestFor}. Calculate Bitcoin vesting schedules with ${scheme.riskLevel.toLowerCase()} risk over 20 years.`,
    keywords: `bitcoin vesting, ${scheme.name.toLowerCase()}, ${scheme.tagline.toLowerCase()}, bitcoin compensation, crypto benefits`,
    openGraph: {
      title: `${scheme.name} Bitcoin Vesting Plan - ${scheme.tagline}`,
      description: `${scheme.description}. Perfect for ${scheme.bestFor.toLowerCase()}.`,
      type: 'website',
      url: `/calculator/${params.plan}`,
      images: [
        {
          url: `/og-${params.plan}.png`,
          width: 1200,
          height: 630,
          alt: `${scheme.name} Bitcoin Vesting Calculator`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${scheme.name} Bitcoin Vesting - ${scheme.tagline}`,
      description: scheme.description,
    },
    alternates: {
      canonical: `/calculator/${params.plan}`
    }
  };
}

// Prefetch Bitcoin price at build time for static optimization
async function getBitcoinPrice() {
  try {
    // Try to get cached static data first
    const staticData = await import('@/data/bitcoin-price.json');
    if (staticData?.default?.price || staticData?.price) {
      return staticData?.default?.price || staticData?.price;
    }
  } catch {
    // Fallback to default if static data not available
  }
  return 100000; // Fallback price
}

// Server component with validation and data prefetching
export default async function CalculatorPlanPage({ params }: PageProps) {
  const scheme = VESTING_SCHEMES.find(s => s.id === params.plan);
  
  // Return 404 for invalid plans
  if (!scheme) {
    notFound();
  }
  
  // Prefetch data at build time
  const bitcoinPrice = await getBitcoinPrice();
  
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <CalculatorPlanClient 
        initialScheme={scheme} 
        planId={params.plan}
        initialBitcoinPrice={bitcoinPrice}
      />
    </Suspense>
  );
}

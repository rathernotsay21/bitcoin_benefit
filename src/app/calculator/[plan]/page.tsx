import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VESTING_SCHEMES } from '@/lib/vesting-schemes';
import dynamic from 'next/dynamic';

const CalculatorPlanClient = dynamic(
  () => import('./CalculatorPlanClient'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }
);

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
    title: `${scheme.name} (${scheme.tagline}) - Bitcoin Vesting Calculator`,
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

// Server component with validation
export default function CalculatorPlanPage({ params }: PageProps) {
  const scheme = VESTING_SCHEMES.find(s => s.id === params.plan);
  
  // Return 404 for invalid plans
  if (!scheme) {
    notFound();
  }
  
  return <CalculatorPlanClient initialScheme={scheme} planId={params.plan} />;
}

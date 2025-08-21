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

// Server component handles static generation
export async function generateStaticParams() {
  return VESTING_SCHEMES.map((scheme) => ({
    plan: scheme.id,
  }));
}

// Generate metadata for each plan
export async function generateMetadata({ params }: PageProps) {
  try {
    const scheme = VESTING_SCHEMES.find(s => s.id === params.plan);
    
    if (scheme) {
      return {
        title: `${scheme.name} - Bitcoin Unlocking Calculator`,
        description: `${scheme.description}. Calculate Bitcoin unlocking schedules and projections.`,
        openGraph: {
          title: `${scheme.name} Bitcoin Unlocking Plan`,
          description: scheme.description,
        },
      };
    }
  } catch (error) {
    console.warn('Failed to generate metadata:', error);
  }
  
  return {
    title: 'Bitcoin Unlocking Calculator',
    description: 'Calculate Bitcoin-based employee vesting schedules and projections.',
  };
}

// Server component that renders client component
export default function CalculatorPlanPage({ params }: PageProps) {
  const scheme = VESTING_SCHEMES.find(s => s.id === params.plan);
  
  return <CalculatorPlanClient initialScheme={scheme} planId={params.plan} />;
}

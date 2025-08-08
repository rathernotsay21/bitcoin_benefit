import { VESTING_SCHEMES } from '@/lib/vesting-schemes';
import CalculatorPlanClient from './CalculatorPlanClient';

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
        title: `${scheme.name} - Bitcoin Vesting Calculator`,
        description: `${scheme.description}. Calculate Bitcoin vesting schedules and projections.`,
        openGraph: {
          title: `${scheme.name} Bitcoin Vesting Plan`,
          description: scheme.description,
        },
      };
    }
  } catch (error) {
    console.warn('Failed to generate metadata:', error);
  }
  
  return {
    title: 'Bitcoin Vesting Calculator',
    description: 'Calculate Bitcoin-based employee vesting schedules and projections.',
  };
}

// Server component that renders client component
export default function CalculatorPlanPage({ params }: PageProps) {
  const scheme = VESTING_SCHEMES.find(s => s.id === params.plan);
  
  return <CalculatorPlanClient initialScheme={scheme} planId={params.plan} />;
}

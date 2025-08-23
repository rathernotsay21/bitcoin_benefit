import { redirect } from 'next/navigation';

// Server-side redirect - eliminates all flickering
export default function CalculatorPage({
  searchParams
}: {
  searchParams: { scheme?: string }
}) {
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

  // Determine target scheme (server-side)
  const scheme = searchParams.scheme?.toLowerCase();
  const targetScheme = scheme && schemeMap[scheme] ? schemeMap[scheme] : 'accelerator';
  
  // Instant server-side redirect - no JavaScript, no flickering
  redirect(`/calculator/${targetScheme}`);
}
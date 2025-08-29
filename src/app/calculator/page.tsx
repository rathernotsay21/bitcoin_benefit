import { redirect } from 'next/navigation';

// Server-side redirect - eliminates all flickering
export default function CalculatorPage() {
  // For static export, always redirect to the default scheme
  redirect(`/calculator/accelerator`);
}
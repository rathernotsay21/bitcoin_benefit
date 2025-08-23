import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Bitcoin Benefit Calculator',
    default: 'Bitcoin Benefit Calculator'
  },
  description: 'Calculate potential Bitcoin vesting benefits with our comprehensive calculator. Project earnings over 20 years with customizable growth assumptions.',
  openGraph: {
    type: 'website',
    siteName: 'Bitcoin Benefit',
    title: 'Bitcoin Vesting Calculator',
    description: 'Calculate your Bitcoin compensation package potential',
    images: [
      {
        url: '/og-calculator.png',
        width: 1200,
        height: 630,
        alt: 'Bitcoin Benefit Calculator'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bitcoin Vesting Calculator',
    description: 'Calculate your Bitcoin compensation package potential'
  }
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
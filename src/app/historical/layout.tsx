import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Performance Analysis | Bitcoin Benefit Calculator',
  description: 'Analyze historical performance of Bitcoin vesting plans. See how different strategies would have performed if started in past years.',
  keywords: ['bitcoin', 'performance', 'historical', 'analysis', 'vesting', 'calculator', 'retrospective'],
  robots: 'index, follow',
  openGraph: {
    title: 'Performance Analysis | Bitcoin Benefit Calculator',
    description: 'Analyze historical performance of Bitcoin vesting plans',
    type: 'website',
  },
};

export default function HistoricalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard & Tracking | Bitcoin Benefit Calculator',
  description: 'Track and verify your Bitcoin vesting benefits on-chain. Real-time dashboard for monitoring your Bitcoin awards and vesting schedule.',
  keywords: ['bitcoin', 'dashboard', 'tracking', 'vesting', 'blockchain', 'verification', 'on-chain'],
  robots: 'index, follow',
  openGraph: {
    title: 'Dashboard & Tracking | Bitcoin Benefit Calculator',
    description: 'Track and verify your Bitcoin vesting benefits on-chain',
    type: 'website',
  },
};

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
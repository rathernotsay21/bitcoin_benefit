import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Implementation Guide | Bitcoin Benefit Calculator',
  description: 'Complete guide to implementing Bitcoin benefits for your organization. Learn how to buy, store, and manage Bitcoin for employee compensation.',
  keywords: ['bitcoin', 'implementation', 'guide', 'benefits', 'employee', 'compensation', 'hardware wallet', 'exchange'],
  robots: 'index, follow',
  openGraph: {
    title: 'Implementation Guide | Bitcoin Benefit Calculator',
    description: 'Complete guide to implementing Bitcoin benefits for your organization',
    type: 'website',
  },
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
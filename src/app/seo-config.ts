import { Metadata } from 'next';

// Centralized SEO configuration
export const siteConfig = {
  name: 'Bitcoin Benefit',
  description: 'Bitcoin-based employee benefits calculator & vesting platform. Create retention strategies with sound money.',
  url: process.env.NEXT_PUBLIC_BASE_URL || 'https://bitcoinbenefit.com',
  ogImage: 'https://bitcoinbenefit.com/og-image.jpg',
  twitterHandle: '@bitcoinbenefit',
  creator: 'Bitcoin Benefit Team',
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'Bitcoin Benefit - Employee Vesting & Benefits Calculator | Sound Money Retention',
    template: '%s | Bitcoin Benefit'
  },
  description: 'Transform employee retention with Bitcoin-based vesting benefits. Calculate 20-year projections, analyze historical performance since 2015, and build powerful compensation packages with sound money.',
  keywords: [
    'bitcoin employee benefits',
    'bitcoin vesting calculator',
    'cryptocurrency compensation',
    'employee retention bitcoin',
    'bitcoin 401k alternative',
    'satoshi vesting schedule',
    'btc benefits package',
    'bitcoin retirement planning',
    'cryptocurrency vesting',
    'sound money benefits'
  ],
  authors: [{ name: 'Bitcoin Benefit' }],
  creator: siteConfig.creator,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: 'Bitcoin Benefit - Transform Employee Benefits with Sound Money',
    description: 'Calculate Bitcoin vesting schedules, analyze 10-year historical returns, and create retention strategies that actually work. Free tools for modern compensation planning.',
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'Bitcoin Benefit - Employee Vesting Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bitcoin Benefit - Employee Vesting Calculator',
    description: 'Transform retention with Bitcoin-based employee benefits. Free calculator & tools.',
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
  },
};

// Page-specific metadata generators
export const pageMetadata = {
  calculator: (scheme?: string): Metadata => ({
    title: scheme 
      ? `${scheme.charAt(0).toUpperCase() + scheme.slice(1)} Bitcoin Vesting Calculator - 20 Year Projections`
      : 'Bitcoin Vesting Calculator - Plan Employee Benefits & Retention',
    description: `Calculate Bitcoin vesting schedules with ${scheme || 'customizable'} unlock patterns. Project 20-year returns, compare strategies, and optimize employee retention with sound money benefits.`,
    openGraph: {
      title: `Bitcoin Vesting Calculator - ${scheme || 'Employee Benefits'}`,
      description: 'Plan vesting schedules, project returns, and build retention strategies with Bitcoin.',
      images: [
        {
          url: `${siteConfig.url}/og-calculator.jpg`,
          width: 1200,
          height: 630,
          alt: 'Bitcoin Vesting Calculator Preview',
        },
      ],
    },
    alternates: {
      canonical: `${siteConfig.url}/calculator${scheme ? `/${scheme}` : ''}`,
    },
  }),

  historical: (): Metadata => ({
    title: 'Historical Bitcoin Performance Calculator - 10 Years of Returns Data',
    description: 'Analyze actual Bitcoin investment returns from 2015 to present. Compare vesting strategies with real historical data, see compound returns, and understand Bitcoin\'s performance as an employee benefit.',
    openGraph: {
      title: 'Historical Bitcoin Returns - Real Performance Data Since 2015',
      description: 'See how Bitcoin vesting would have performed. Analyze 10 years of actual returns data.',
      images: [
        {
          url: `${siteConfig.url}/og-historical.jpg`,
          width: 1200,
          height: 630,
          alt: 'Historical Bitcoin Performance Chart',
        },
      ],
    },
    alternates: {
      canonical: `${siteConfig.url}/historical`,
    },
  }),

  bitcoinTools: (): Metadata => ({
    title: 'Free Bitcoin Tools - Transaction Lookup, Fee Calculator & Network Explorer',
    description: 'Essential Bitcoin blockchain tools: check transactions, calculate optimal fees, explore addresses, verify timestamps, and monitor network status. Simple, fast, no registration required.',
    openGraph: {
      title: 'Bitcoin Blockchain Tools - Free Transaction & Network Explorer',
      description: 'Check Bitcoin transactions, calculate fees, explore addresses. Simple tools for everyone.',
      images: [
        {
          url: `${siteConfig.url}/og-tools.jpg`,
          width: 1200,
          height: 630,
          alt: 'Bitcoin Blockchain Tools',
        },
      ],
    },
    alternates: {
      canonical: `${siteConfig.url}/bitcoin-tools`,
    },
  }),

  onChain: (): Metadata => ({
    title: 'Bitcoin Address Tracker - Monitor Vesting & Benefits On-Chain',
    description: 'Track Bitcoin vesting schedules on-chain. Monitor employee benefit addresses, analyze vesting progress, and verify distributions with real blockchain data.',
    openGraph: {
      title: 'On-Chain Bitcoin Vesting Tracker - Monitor Benefits Live',
      description: 'Track vesting schedules directly on the Bitcoin blockchain. Real-time monitoring.',
      images: [
        {
          url: `${siteConfig.url}/og-tracker.jpg`,
          width: 1200,
          height: 630,
          alt: 'Bitcoin On-Chain Tracker',
        },
      ],
    },
    alternates: {
      canonical: `${siteConfig.url}/on-chain`,
    },
  }),

  learn: (): Metadata => ({
    title: 'Learn Bitcoin Benefits - Guide to Sound Money Employee Compensation',
    description: 'Complete guide to Bitcoin-based employee benefits. Learn vesting strategies, tax implications, security best practices, and how to implement sound money compensation packages.',
    openGraph: {
      title: 'Bitcoin Benefits Guide - Everything About Sound Money Compensation',
      description: 'Learn how to implement Bitcoin employee benefits. Guides, strategies, and best practices.',
      images: [
        {
          url: `${siteConfig.url}/og-learn.jpg`,
          width: 1200,
          height: 630,
          alt: 'Bitcoin Benefits Education',
        },
      ],
    },
    alternates: {
      canonical: `${siteConfig.url}/learn`,
    },
  }),
};
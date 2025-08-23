# Bitcoin Benefits - Complete Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Phase 1: Server Components Migration](#phase-1-server-components-migration)
3. [Phase 2: Performance Optimization](#phase-2-performance-optimization)
4. [Phase 3: SEO Implementation](#phase-3-seo-implementation)
5. [Phase 4: Full-Stack Features](#phase-4-full-stack-features)
6. [Phase 5: Testing Strategy](#phase-5-testing-strategy)
7. [Phase 6: Deployment & Monitoring](#phase-6-deployment--monitoring)
8. [Migration Checklist](#migration-checklist)
9. [Rollback Procedures](#rollback-procedures)

---

## Overview

This guide provides complete, production-ready code implementations for transforming the Bitcoin Benefits application into a high-performance Next.js 14 application.

### Prerequisites

```bash
# Required Node version
node --version  # Should be >= 18.17.0

# Install exact dependencies
npm install --save-exact next@14.2.5 react@18.3.1 react-dom@18.3.1
npm install --save-exact @types/react@18.3.3 @types/react-dom@18.3.0
npm install --save-exact typescript@5.5.4

# Performance monitoring
npm install --save-exact @vercel/analytics@1.3.1 @vercel/speed-insights@1.0.12
npm install --save-exact @sentry/nextjs@8.20.0

# SEO tools
npm install --save-exact next-sitemap@4.2.3
npm install --save-exact schema-dts@1.1.2

# Testing
npm install --save-dev @playwright/test@1.45.3
npm install --save-dev @testing-library/react@16.0.0
npm install --save-dev @testing-library/jest-dom@6.4.8
npm install --save-dev vitest@2.0.5
```

### Environment Variables

Create `.env.local`:

```bash
# API Keys
COINGECKO_API_KEY=your_api_key_here
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id

# Performance
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Feature Flags
NEXT_PUBLIC_ENABLE_SERVER_ACTIONS=true
NEXT_PUBLIC_ENABLE_EDGE_RUNTIME=true

# Cache Control
BITCOIN_PRICE_CACHE_TTL=300
HISTORICAL_DATA_CACHE_TTL=3600

# Rate Limiting
API_RATE_LIMIT_PER_MINUTE=100
API_RATE_LIMIT_WINDOW_MS=60000
```

---

## Phase 1: Server Components Migration

### Step 1.1: Convert Root Layout to Server Component

**File:** `src/app/layout.tsx`

```typescript
import { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ClientProviders } from '@/components/providers/ClientProviders'
import { generateRootMetadata } from '@/lib/metadata/root-metadata'
import { generateStructuredData } from '@/lib/structured-data/organization'
import Script from 'next/script'
import './globals.css'

// Font optimization with variable fonts
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  adjustFontFallback: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  preload: true,
  weight: ['400', '500', '600', '700'],
})

// Generate comprehensive metadata
export const metadata: Metadata = generateRootMetadata()

// Viewport configuration for mobile optimization
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

// Server Component Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = generateStructuredData()

  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://api.coingecko.com" />
        <link rel="dns-prefetch" href="https://api.coingecko.com" />
        
        {/* Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        
        {/* Prefetch critical API endpoints */}
        <link
          rel="prefetch"
          href="/api/bitcoin-price"
          as="fetch"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Client-side providers wrapper */}
        <ClientProviders>
          {children}
        </ClientProviders>
        
        {/* Analytics and monitoring */}
        <Analytics />
        <SpeedInsights />
        
        {/* Web Vitals reporting */}
        <Script
          id="web-vitals"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
                onCLS(console.log);
                onFID(console.log);
                onFCP(console.log);
                onLCP(console.log);
                onTTFB(console.log);
              });
            `,
          }}
        />
      </body>
    </html>
  )
}
```

### Step 1.2: Create Client Providers Wrapper

**File:** `src/components/providers/ClientProviders.tsx`

```typescript
'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary'
import { SuspenseBoundary } from '@/components/suspense/SuspenseBoundary'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SuspenseBoundary>
          {children}
        </SuspenseBoundary>
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  )
}
```

### Step 1.3: Implement Route Groups

**Create directory structure:**

```bash
mkdir -p src/app/\(marketing\)
mkdir -p src/app/\(calculators\)/calculator
mkdir -p src/app/\(calculators\)/historical
mkdir -p src/app/\(dashboard\)
mkdir -p src/app/\(api\)
```

**File:** `src/app/(calculators)/layout.tsx`

```typescript
import { Metadata } from 'next'
import { Suspense } from 'react'
import { CalculatorNavigation } from '@/components/navigation/CalculatorNavigation'
import { CalculatorSkeleton } from '@/components/skeletons/CalculatorSkeleton'
import { getBitcoinPrice } from '@/lib/api/bitcoin-price'

export const metadata: Metadata = {
  title: {
    template: '%s | Bitcoin Calculators',
    default: 'Bitcoin Vesting Calculators',
  },
  description: 'Professional Bitcoin vesting calculators with historical analysis and future projections.',
}

// Server Component Layout with data prefetching
export default async function CalculatorsLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal?: React.ReactNode
}) {
  // Prefetch Bitcoin price at layout level
  const bitcoinPrice = await getBitcoinPrice()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <CalculatorNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Provide Bitcoin price via context or props */}
        <BitcoinPriceProvider value={bitcoinPrice}>
          <Suspense fallback={<CalculatorSkeleton />}>
            {children}
          </Suspense>
        </BitcoinPriceProvider>
      </div>
      
      {/* Modal slot for intercepting routes */}
      {modal}
    </div>
  )
}

// Bitcoin Price Provider (Server Component)
async function BitcoinPriceProvider({
  value,
  children,
}: {
  value: number
  children: React.ReactNode
}) {
  return (
    <div data-bitcoin-price={value}>
      {children}
    </div>
  )
}
```

### Step 1.4: Create Server Component Pages

**File:** `src/app/(calculators)/calculator/page.tsx`

```typescript
import { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { CalculatorClient } from '@/components/calculator/CalculatorClient'
import { CalculatorHeader } from '@/components/calculator/CalculatorHeader'
import { CalculatorSkeleton } from '@/components/skeletons/CalculatorSkeleton'
import { getBitcoinPrice, getHistoricalPrices } from '@/lib/api/bitcoin-price'
import { generateCalculatorMetadata } from '@/lib/metadata/calculator-metadata'
import { PerformanceMonitor } from '@/components/monitoring/PerformanceMonitor'

// Dynamic metadata generation
export async function generateMetadata(): Promise<Metadata> {
  const bitcoinPrice = await getBitcoinPrice()
  return generateCalculatorMetadata(bitcoinPrice)
}

// Server Component Page
export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Parse and validate search params
  const vestingScheme = searchParams.scheme as string | undefined
  const grantAmount = searchParams.amount ? parseFloat(searchParams.amount as string) : undefined
  
  // Parallel data fetching
  const [bitcoinPrice, historicalPrices] = await Promise.all([
    getBitcoinPrice(),
    getHistoricalPrices(30), // Last 30 days
  ])

  // Validate data
  if (!bitcoinPrice) {
    notFound()
  }

  return (
    <PerformanceMonitor name="calculator-page">
      <div className="space-y-8">
        {/* Static header content */}
        <CalculatorHeader 
          bitcoinPrice={bitcoinPrice}
          priceChange={calculatePriceChange(historicalPrices)}
        />
        
        {/* Dynamic calculator with streaming */}
        <Suspense fallback={<CalculatorSkeleton />}>
          <CalculatorWrapper
            initialPrice={bitcoinPrice}
            historicalPrices={historicalPrices}
            vestingScheme={vestingScheme}
            grantAmount={grantAmount}
          />
        </Suspense>
      </div>
    </PerformanceMonitor>
  )
}

// Async wrapper for calculator data
async function CalculatorWrapper({
  initialPrice,
  historicalPrices,
  vestingScheme,
  grantAmount,
}: {
  initialPrice: number
  historicalPrices: number[]
  vestingScheme?: string
  grantAmount?: number
}) {
  // Additional data fetching if needed
  const vestingConfigurations = await getVestingConfigurations()
  
  return (
    <CalculatorClient
      initialBitcoinPrice={initialPrice}
      historicalPrices={historicalPrices}
      vestingConfigurations={vestingConfigurations}
      defaultScheme={vestingScheme}
      defaultAmount={grantAmount}
    />
  )
}

// Helper function
function calculatePriceChange(prices: number[]): number {
  if (prices.length < 2) return 0
  const current = prices[prices.length - 1]
  const previous = prices[0]
  return ((current - previous) / previous) * 100
}
```

### Step 1.5: Implement Loading and Error States

**File:** `src/app/(calculators)/calculator/loading.tsx`

```typescript
import { CalculatorSkeleton } from '@/components/skeletons/CalculatorSkeleton'

export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="h-10 w-3/4 bg-muted rounded-lg" />
          <div className="h-6 w-1/2 bg-muted rounded-lg" />
        </div>
        
        {/* Calculator skeleton */}
        <CalculatorSkeleton />
        
        {/* Chart skeleton */}
        <div className="h-96 bg-muted rounded-lg" />
      </div>
    </div>
  )
}
```

**File:** `src/app/(calculators)/calculator/error.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error, {
      tags: {
        page: 'calculator',
        digest: error.digest,
      },
    })
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="text-2xl font-semibold">Something went wrong!</h2>
      <p className="text-muted-foreground text-center max-w-md">
        {error.message || 'An error occurred while loading the calculator. Please try again.'}
      </p>
      <div className="flex gap-4">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          Go home
        </Button>
      </div>
    </div>
  )
}
```

### Step 1.6: Implement Parallel Routes

**File:** `src/app/(dashboard)/layout.tsx`

```typescript
export default function DashboardLayout({
  children,
  analytics,
  performance,
  alerts,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  performance: React.ReactNode
  alerts: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      {/* Main content area */}
      <div className="col-span-8">
        {children}
      </div>
      
      {/* Parallel route slots */}
      <div className="col-span-4 space-y-6">
        <div className="bg-card rounded-lg p-4">
          {analytics}
        </div>
        <div className="bg-card rounded-lg p-4">
          {performance}
        </div>
        <div className="bg-card rounded-lg p-4">
          {alerts}
        </div>
      </div>
    </div>
  )
}
```

**File:** `src/app/(dashboard)/@analytics/page.tsx`

```typescript
import { getAnalyticsData } from '@/lib/api/analytics'
import { AnalyticsChart } from '@/components/charts/AnalyticsChart'

export default async function AnalyticsSlot() {
  const data = await getAnalyticsData()
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Analytics</h3>
      <AnalyticsChart data={data} />
    </div>
  )
}
```

---

## Phase 2: Performance Optimization

### Step 2.1: Image Optimization Implementation

**File:** `src/components/ui/OptimizedImage.tsx`

```typescript
'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  quality?: number
  className?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  sizes?: string
}

export function OptimizedImage({
  src,
  alt,
  width = 1920,
  height = 1080,
  priority = false,
  quality = 75,
  className,
  objectFit = 'cover',
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  // Generate blur data URL if not provided
  const shimmer = (w: number, h: number) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#333" offset="20%" />
          <stop stop-color="#222" offset="50%" />
          <stop stop-color="#333" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#333" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
    </svg>`

  const toBase64 = (str: string) =>
    typeof window === 'undefined'
      ? Buffer.from(str).toString('base64')
      : window.btoa(str)

  const dataUrl = `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`

  if (error) {
    return (
      <div 
        className={cn(
          'bg-muted flex items-center justify-center',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-muted-foreground text-sm">Failed to load image</span>
      </div>
    )
  }

  return (
    <div className={cn('overflow-hidden relative', className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL || dataUrl}
        className={cn(
          'transition-all duration-700 ease-in-out',
          isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'
        )}
        style={{
          objectFit,
        }}
        onLoad={() => {
          setIsLoading(false)
          onLoad?.()
        }}
        onError={() => setError(true)}
      />
    </div>
  )
}
```

### Step 2.2: Bundle Optimization

**File:** `next.config.js`

```javascript
const { withSentryConfig } = require('@sentry/nextjs')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // React strict mode for better development experience
  reactStrictMode: true,
  
  // Enable SWC minification
  swcMinify: true,
  
  // Optimize production builds
  productionBrowserSourceMaps: false,
  
  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    
    // Enable emotion if using it
    // emotion: true,
  },
  
  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
    
    // Optimize package imports
    optimizePackageImports: [
      '@headlessui/react',
      'recharts',
      'zustand',
      'lucide-react',
    ],
    
    // Partial Prerendering
    ppr: true,
    
    // Use new app directory
    typedRoutes: true,
  },
  
  // Image optimization
  images: {
    // Specify image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.coingecko.com',
        pathname: '/api/v3/**',
      },
      {
        protocol: 'https',
        hostname: 'bitcoinbenefits.app',
        pathname: '/**',
      },
    ],
    
    // Image formats
    formats: ['image/avif', 'image/webp'],
    
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    
    // Image sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Minimize images
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },
  
  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/calculator.html',
        destination: '/calculator',
        permanent: true,
      },
      {
        source: '/historical-analysis',
        destination: '/historical',
        permanent: true,
      },
    ]
  },
  
  // Rewrites for API proxying
  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite for Bitcoin price API with caching
        {
          source: '/api/bitcoin-price-cached',
          destination: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
        },
      ],
    }
  },
  
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Optimize chunks
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test(module) {
                return module.size() > 160000 &&
                  /node_modules[/\\]/.test(module.identifier())
              },
              name(module) {
                const hash = require('crypto')
                  .createHash('sha1')
                  .update(module.identifier())
                  .digest('hex')
                  .substring(0, 8)
                return `lib-${hash}`
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
            shared: {
              name(module, chunks) {
                return `shared-${require('crypto')
                  .createHash('sha1')
                  .update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
                  .digest('hex')
                  .substring(0, 8)}`
              },
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
        },
      }
    }
    
    return config
  },
  
  // Output configuration
  output: 'standalone',
  
  // PoweredByHeader
  poweredByHeader: false,
  
  // Compress
  compress: true,
  
  // Generate build ID
  generateBuildId: async () => {
    return process.env.BUILD_ID || `build-${Date.now()}`
  },
}

// Sentry configuration
const sentryWebpackPluginOptions = {
  silent: true,
  org: 'bitcoin-benefits',
  project: 'bitcoin-benefits-app',
  authToken: process.env.SENTRY_AUTH_TOKEN,
}

// Export with bundle analyzer and Sentry
module.exports = withBundleAnalyzer(
  withSentryConfig(nextConfig, sentryWebpackPluginOptions)
)
```

### Step 2.3: Edge Runtime Implementation

**File:** `src/app/api/bitcoin-price/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Enable Edge Runtime for better performance
export const runtime = 'edge'

// Cache configuration
export const revalidate = 300 // 5 minutes

// Input validation schema
const QuerySchema = z.object({
  currency: z.string().default('usd'),
  include_historical: z.boolean().optional(),
})

// Response cache
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const currency = searchParams.get('currency') || 'usd'
    const includeHistorical = searchParams.get('include_historical') === 'true'
    
    // Check cache
    const cacheKey = `bitcoin-${currency}-${includeHistorical}`
    const cached = cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      })
    }
    
    // Fetch Bitcoin price from CoinGecko
    const [priceResponse, historicalResponse] = await Promise.all([
      fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=${currency}&include_24hr_change=true&include_market_cap=true`,
        {
          headers: {
            'Accept': 'application/json',
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || '',
          },
          // @ts-ignore - Next.js specific
          next: { revalidate: 300 },
        }
      ),
      includeHistorical
        ? fetch(
            `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=${currency}&days=30`,
            {
              headers: {
                'Accept': 'application/json',
                'x-cg-demo-api-key': process.env.COINGECKO_API_KEY || '',
              },
              // @ts-ignore - Next.js specific
              next: { revalidate: 3600 },
            }
          )
        : Promise.resolve(null),
    ])
    
    // Check for errors
    if (!priceResponse.ok) {
      throw new Error(`CoinGecko API error: ${priceResponse.status}`)
    }
    
    const priceData = await priceResponse.json()
    const historicalData = historicalResponse ? await historicalResponse.json() : null
    
    // Prepare response
    const responseData = {
      price: priceData.bitcoin[currency],
      change24h: priceData.bitcoin[`${currency}_24h_change`],
      marketCap: priceData.bitcoin[`${currency}_market_cap`],
      timestamp: new Date().toISOString(),
      ...(historicalData && {
        historical: historicalData.prices.map(([timestamp, price]: [number, number]) => ({
          timestamp,
          price,
        })),
      }),
    }
    
    // Update cache
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    })
    
    // Clean old cache entries
    if (cache.size > 100) {
      const sortedEntries = Array.from(cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      for (let i = 0; i < 50; i++) {
        cache.delete(sortedEntries[i][0])
      }
    }
    
    return NextResponse.json(responseData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '99',
      },
    })
  } catch (error) {
    console.error('Bitcoin price API error:', error)
    
    // Return fallback data
    return NextResponse.json(
      {
        error: 'Failed to fetch Bitcoin price',
        fallback: true,
        price: 45000, // Fallback price
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    )
  }
}

// Handle POST requests for cache invalidation
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (action === 'invalidate') {
      cache.clear()
      return NextResponse.json({ success: true, message: 'Cache invalidated' })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
```

---

## Phase 3: SEO Implementation

### Step 3.1: Metadata API Implementation

**File:** `src/lib/metadata/root-metadata.ts`

```typescript
import { Metadata } from 'next'

export function generateRootMetadata(): Metadata {
  const title = 'Bitcoin Benefits - Professional Employee Vesting Calculator'
  const description = 'Calculate Bitcoin employee benefits with our professional vesting calculator. Analyze Pioneer, Stacker, and Builder schemes with historical data and future projections.'
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://bitcoinbenefits.app'

  return {
    metadataBase: new URL(url),
    title: {
      template: '%s | Bitcoin Benefits',
      default: title,
    },
    description,
    keywords: [
      'bitcoin calculator',
      'employee benefits',
      'vesting calculator',
      'crypto compensation',
      'bitcoin vesting',
      'employee stock options',
      'cryptocurrency benefits',
      'btc calculator',
      'bitcoin employee compensation',
      'vesting schedule calculator',
      'crypto equity',
      'bitcoin rewards',
    ],
    authors: [
      { name: 'Bitcoin Benefits', url },
    ],
    creator: 'Bitcoin Benefits Team',
    publisher: 'Bitcoin Benefits',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Bitcoin Benefits',
      images: [
        {
          url: '/og-image-main.png',
          width: 1200,
          height: 630,
          alt: 'Bitcoin Benefits Calculator',
        },
        {
          url: '/og-image-main-square.png',
          width: 1200,
          height: 1200,
          alt: 'Bitcoin Benefits Calculator',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@bitcoinbenefits',
      creator: '@bitcoinbenefits',
      images: ['/twitter-image.png'],
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
      languages: {
        'en-US': '/en-US',
        'es-ES': '/es-ES',
        'de-DE': '/de-DE',
        'fr-FR': '/fr-FR',
        'ja-JP': '/ja-JP',
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
      other: {
        'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION,
      },
    },
    category: 'finance',
    classification: 'Financial Calculator',
    referrer: 'origin-when-cross-origin',
    colorScheme: 'dark light',
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#ffffff' },
      { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    ],
    manifest: '/manifest.json',
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-icon.png' },
        { url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
      ],
      other: [
        {
          rel: 'mask-icon',
          url: '/safari-pinned-tab.svg',
          color: '#f7931a',
        },
      ],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'Bitcoin Benefits',
    },
    applicationName: 'Bitcoin Benefits Calculator',
    other: {
      'msapplication-TileColor': '#f7931a',
      'msapplication-config': '/browserconfig.xml',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'format-detection': 'telephone=no',
    },
  }
}
```

### Step 3.2: Dynamic Open Graph Images

**File:** `src/app/api/og/route.tsx`

```typescript
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Font loading
const interBold = fetch(
  new URL('../../../assets/fonts/Inter-Bold.ttf', import.meta.url)
).then((res) => res.arrayBuffer())

const interRegular = fetch(
  new URL('../../../assets/fonts/Inter-Regular.ttf', import.meta.url)
).then((res) => res.arrayBuffer())

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse parameters
    const title = searchParams.get('title') || 'Bitcoin Benefits Calculator'
    const description = searchParams.get('description') || 'Professional Bitcoin vesting calculator for employee compensation'
    const scheme = searchParams.get('scheme') || 'all'
    const bitcoinPrice = searchParams.get('price') || '45,000'
    const theme = searchParams.get('theme') || 'dark'
    
    // Load fonts
    const [interBoldFont, interRegularFont] = await Promise.all([
      interBold,
      interRegular,
    ])
    
    // Theme colors
    const colors = theme === 'dark' 
      ? {
          bg: '#0a0a0a',
          primary: '#f7931a',
          text: '#ffffff',
          muted: '#888888',
          card: '#1a1a1a',
        }
      : {
          bg: '#ffffff',
          primary: '#f7931a',
          text: '#0a0a0a',
          muted: '#666666',
          card: '#f5f5f5',
        }
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.bg,
            backgroundImage: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.card} 100%)`,
            fontFamily: 'Inter',
          }}
        >
          {/* Bitcoin logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 120,
              height: 120,
              borderRadius: '50%',
              backgroundColor: colors.primary,
              marginBottom: 40,
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
                stroke={colors.bg}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 22V12"
                stroke={colors.bg}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 12L2 7"
                stroke={colors.bg}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 12L22 7"
                stroke={colors.bg}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          {/* Title */}
          <div
            style={{
              fontSize: 60,
              fontWeight: 700,
              color: colors.text,
              marginBottom: 20,
              textAlign: 'center',
              maxWidth: 900,
            }}
          >
            {title}
          </div>
          
          {/* Description */}
          <div
            style={{
              fontSize: 24,
              color: colors.muted,
              textAlign: 'center',
              maxWidth: 800,
              marginBottom: 40,
            }}
          >
            {description}
          </div>
          
          {/* Stats cards */}
          <div
            style={{
              display: 'flex',
              gap: 20,
              marginBottom: 40,
            }}
          >
            {/* Bitcoin Price */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px 30px',
                backgroundColor: colors.card,
                borderRadius: 12,
                border: `1px solid ${colors.primary}20`,
              }}
            >
              <div style={{ fontSize: 14, color: colors.muted, marginBottom: 8 }}>
                Bitcoin Price
              </div>
              <div style={{ fontSize: 28, fontWeight: 600, color: colors.primary }}>
                ${bitcoinPrice}
              </div>
            </div>
            
            {/* Vesting Scheme */}
            {scheme !== 'all' && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '20px 30px',
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  border: `1px solid ${colors.primary}20`,
                }}
              >
                <div style={{ fontSize: 14, color: colors.muted, marginBottom: 8 }}>
                  Vesting Scheme
                </div>
                <div style={{ fontSize: 28, fontWeight: 600, color: colors.text }}>
                  {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                </div>
              </div>
            )}
          </div>
          
          {/* Website URL */}
          <div
            style={{
              fontSize: 18,
              color: colors.muted,
              position: 'absolute',
              bottom: 40,
            }}
          >
            bitcoinbenefits.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: interBoldFont,
            weight: 700,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: interRegularFont,
            weight: 400,
            style: 'normal',
          },
        ],
      }
    )
  } catch (error) {
    console.error('OG Image generation error:', error)
    
    // Return fallback image
    return new Response('Failed to generate image', { status: 500 })
  }
}
```

---

## Phase 4: Full-Stack Features

### Step 4.1: Server Actions Implementation

**File:** `src/lib/actions/calculator-actions.ts`

```typescript
'use server'

import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { calculateVestingSchedule } from '@/lib/vesting-calculations'
import { logCalculation } from '@/lib/analytics'
import { rateLimit } from '@/lib/rate-limit'

// Validation schemas
const CalculationInputSchema = z.object({
  grantAmount: z.number().min(0.00001).max(1000),
  vestingScheme: z.enum(['pioneer', 'stacker', 'builder']),
  startDate: z.string().datetime(),
  bitcoinGrowthRate: z.number().min(-50).max(200),
  currentBitcoinPrice: z.number().positive(),
})

const SaveCalculationSchema = z.object({
  name: z.string().min(1).max(100),
  calculation: CalculationInputSchema,
  results: z.any(), // Validated separately
})

// Types
export type CalculationInput = z.infer<typeof CalculationInputSchema>
export type SaveCalculationInput = z.infer<typeof SaveCalculationSchema>

// Server action for calculating vesting
export async function calculateVestingAction(
  input: CalculationInput
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Rate limiting
    const ip = cookies().get('client-ip')?.value || 'unknown'
    const rateLimitResult = await rateLimit(ip, 'calculation')
    
    if (!rateLimitResult.success) {
      return {
        success: false,
        error: 'Too many requests. Please try again later.',
      }
    }
    
    // Validate input
    const validatedInput = CalculationInputSchema.parse(input)
    
    // Perform calculation
    const results = await calculateVestingSchedule(validatedInput)
    
    // Log for analytics
    await logCalculation({
      ...validatedInput,
      timestamp: new Date().toISOString(),
      ip: ip,
    })
    
    // Revalidate calculator page
    revalidatePath('/calculator')
    revalidateTag('calculator-results')
    
    return {
      success: true,
      data: results,
    }
  } catch (error) {
    console.error('Calculation error:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input: ' + error.errors.map(e => e.message).join(', '),
      }
    }
    
    return {
      success: false,
      error: 'Failed to calculate vesting. Please try again.',
    }
  }
}

// Server action for saving calculations
export async function saveCalculationAction(
  input: SaveCalculationInput
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Get user session (implement your auth logic)
    const userId = cookies().get('user-id')?.value
    
    if (!userId) {
      return {
        success: false,
        error: 'Please sign in to save calculations.',
      }
    }
    
    // Validate input
    const validatedInput = SaveCalculationSchema.parse(input)
    
    // Save to database (implement your database logic)
    const savedCalculation = {
      id: crypto.randomUUID(),
      userId,
      ...validatedInput,
      createdAt: new Date().toISOString(),
    }
    
    // In real implementation, save to database
    // await db.calculations.create(savedCalculation)
    
    // Store in cookies temporarily (for demo)
    const calculations = JSON.parse(
      cookies().get('calculations')?.value || '[]'
    )
    calculations.push(savedCalculation)
    
    cookies().set('calculations', JSON.stringify(calculations), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
    
    // Revalidate user dashboard
    revalidatePath('/dashboard')
    
    return {
      success: true,
      id: savedCalculation.id,
    }
  } catch (error) {
    console.error('Save calculation error:', error)
    
    return {
      success: false,
      error: 'Failed to save calculation. Please try again.',
    }
  }
}

// Server action for loading saved calculations
export async function loadCalculationsAction(): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const userId = cookies().get('user-id')?.value
    
    if (!userId) {
      return {
        success: false,
        error: 'Please sign in to view saved calculations.',
      }
    }
    
    // Load from cookies (in real app, load from database)
    const calculations = JSON.parse(
      cookies().get('calculations')?.value || '[]'
    )
    
    return {
      success: true,
      data: calculations.filter((calc: any) => calc.userId === userId),
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to load calculations.',
    }
  }
}

// Server action for deleting calculation
export async function deleteCalculationAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = cookies().get('user-id')?.value
    
    if (!userId) {
      return {
        success: false,
        error: 'Please sign in to delete calculations.',
      }
    }
    
    // Load calculations
    const calculations = JSON.parse(
      cookies().get('calculations')?.value || '[]'
    )
    
    // Filter out the calculation
    const filtered = calculations.filter(
      (calc: any) => calc.id !== id || calc.userId !== userId
    )
    
    // Save back
    cookies().set('calculations', JSON.stringify(filtered), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    })
    
    // Revalidate dashboard
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to delete calculation.',
    }
  }
}

// Server action for sharing calculation
export async function shareCalculationAction(
  id: string
): Promise<{ success: boolean; shareUrl?: string; error?: string }> {
  try {
    // Generate share token
    const shareToken = crypto.randomUUID()
    
    // Store share token (in real app, store in database)
    const shares = JSON.parse(cookies().get('shares')?.value || '{}')
    shares[shareToken] = id
    
    cookies().set('shares', JSON.stringify(shares), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/share/${shareToken}`
    
    return {
      success: true,
      shareUrl,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to create share link.',
    }
  }
}

// Server action for exporting calculation
export async function exportCalculationAction(
  id: string,
  format: 'pdf' | 'csv' | 'json'
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Load calculation
    const calculations = JSON.parse(
      cookies().get('calculations')?.value || '[]'
    )
    
    const calculation = calculations.find((calc: any) => calc.id === id)
    
    if (!calculation) {
      return {
        success: false,
        error: 'Calculation not found.',
      }
    }
    
    // Generate export based on format
    let exportData
    
    switch (format) {
      case 'json':
        exportData = JSON.stringify(calculation, null, 2)
        break
      
      case 'csv':
        // Convert to CSV format
        exportData = convertToCSV(calculation)
        break
      
      case 'pdf':
        // Generate PDF (would use a library like jsPDF)
        exportData = await generatePDF(calculation)
        break
      
      default:
        throw new Error('Invalid export format')
    }
    
    return {
      success: true,
      data: exportData,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to export calculation.',
    }
  }
}

// Helper functions
function convertToCSV(data: any): string {
  // Implementation for CSV conversion
  const headers = Object.keys(data.calculation).join(',')
  const values = Object.values(data.calculation).join(',')
  return `${headers}\n${values}`
}

async function generatePDF(data: any): Promise<string> {
  // Implementation for PDF generation
  // This would use a library like jsPDF or puppeteer
  return 'PDF_DATA_BASE64'
}
```

### Step 4.2: Middleware Implementation

**File:** `src/middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create rate limiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
})

// Security headers
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' https://api.coingecko.com https://vitals.vercel-insights.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim(),
}

// Geolocation detection
function getCountry(request: NextRequest): string {
  return request.geo?.country || 'US'
}

// Language detection
function getPreferredLanguage(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') || ''
  const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim())
  
  const supportedLanguages = ['en', 'es', 'de', 'fr', 'ja']
  
  for (const lang of languages) {
    const shortLang = lang.substring(0, 2).toLowerCase()
    if (supportedLanguages.includes(shortLang)) {
      return shortLang
    }
  }
  
  return 'en'
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  // Get client IP
  const ip = request.ip ?? '127.0.0.1'
  
  // Store IP in cookie for server actions
  response.cookies.set('client-ip', ip, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
  
  // Geolocation-based routing
  const country = getCountry(request)
  response.headers.set('X-Country', country)
  
  // Language preference
  const language = getPreferredLanguage(request)
  response.headers.set('X-Preferred-Language', language)
  
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    try {
      const { success, limit, reset, remaining } = await ratelimit.limit(ip)
      
      response.headers.set('X-RateLimit-Limit', limit.toString())
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
      response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString())
      
      if (!success) {
        return NextResponse.json(
          {
            error: 'Too many requests',
            retryAfter: Math.floor((reset - Date.now()) / 1000),
          },
          {
            status: 429,
            headers: response.headers,
          }
        )
      }
    } catch (error) {
      console.error('Rate limiting error:', error)
      // Continue without rate limiting if Redis is down
    }
  }
  
  // Cache control for static assets
  if (request.nextUrl.pathname.startsWith('/_next/static/')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
  }
  
  // Cache control for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const cacheControl = request.nextUrl.pathname.includes('bitcoin-price')
      ? 'public, s-maxage=300, stale-while-revalidate=600'
      : 'private, no-cache, no-store, must-revalidate'
    
    response.headers.set('Cache-Control', cacheControl)
  }
  
  // A/B testing
  if (!request.cookies.has('ab-test-variant')) {
    const variant = Math.random() < 0.5 ? 'a' : 'b'
    response.cookies.set('ab-test-variant', variant, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }
  
  // Feature flags
  const featureFlags = {
    serverActions: process.env.NEXT_PUBLIC_ENABLE_SERVER_ACTIONS === 'true',
    edgeRuntime: process.env.NEXT_PUBLIC_ENABLE_EDGE_RUNTIME === 'true',
    newCalculator: process.env.NEXT_PUBLIC_ENABLE_NEW_CALCULATOR === 'true',
  }
  
  response.headers.set('X-Feature-Flags', JSON.stringify(featureFlags))
  
  // Performance monitoring
  response.headers.set('Server-Timing', `middleware;dur=${Date.now()}`)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}
```

---

## Phase 5: Testing Strategy

### Step 5.1: E2E Testing with Playwright

**File:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'junit.xml' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

**File:** `tests/e2e/calculator.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Bitcoin Calculator E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculator')
    await page.waitForLoadState('networkidle')
  })
  
  test('should load calculator page with all elements', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Bitcoin Vesting Calculator/)
    
    // Check main elements
    await expect(page.locator('h1')).toContainText('Bitcoin Vesting Calculator')
    await expect(page.locator('[data-testid="grant-amount-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="vesting-scheme-select"]')).toBeVisible()
    await expect(page.locator('[data-testid="growth-rate-slider"]')).toBeVisible()
    await expect(page.locator('[data-testid="calculate-button"]')).toBeVisible()
  })
  
  test('should calculate vesting with Pioneer scheme', async ({ page }) => {
    // Fill in the form
    await page.fill('[data-testid="grant-amount-input"]', '1.5')
    await page.selectOption('[data-testid="vesting-scheme-select"]', 'pioneer')
    await page.fill('[data-testid="growth-rate-input"]', '25')
    
    // Click calculate
    await page.click('[data-testid="calculate-button"]')
    
    // Wait for results
    await expect(page.locator('[data-testid="results-container"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-value"]')).toBeVisible()
    await expect(page.locator('[data-testid="vesting-chart"]')).toBeVisible()
    
    // Verify scheme label
    await expect(page.locator('[data-testid="active-scheme"]')).toContainText('Pioneer')
    
    // Take screenshot for visual regression
    await page.screenshot({ 
      path: 'tests/screenshots/pioneer-calculation.png',
      fullPage: true,
    })
  })
  
  test('should handle invalid inputs gracefully', async ({ page }) => {
    // Try negative grant amount
    await page.fill('[data-testid="grant-amount-input"]', '-1')
    await page.click('[data-testid="calculate-button"]')
    
    // Check for error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Grant amount must be positive')
    
    // Try invalid growth rate
    await page.fill('[data-testid="grant-amount-input"]', '1')
    await page.fill('[data-testid="growth-rate-input"]', '500')
    await page.click('[data-testid="calculate-button"]')
    
    // Check for error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Growth rate must be between -50% and 200%')
  })
  
  test('should save calculation to dashboard', async ({ page }) => {
    // Perform calculation
    await page.fill('[data-testid="grant-amount-input"]', '2.0')
    await page.selectOption('[data-testid="vesting-scheme-select"]', 'stacker')
    await page.click('[data-testid="calculate-button"]')
    
    // Wait for results
    await expect(page.locator('[data-testid="results-container"]')).toBeVisible()
    
    // Save calculation
    await page.click('[data-testid="save-calculation-button"]')
    await page.fill('[data-testid="calculation-name-input"]', 'My Test Calculation')
    await page.click('[data-testid="confirm-save-button"]')
    
    // Check for success message
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Calculation saved')
    
    // Navigate to dashboard
    await page.click('[data-testid="dashboard-link"]')
    
    // Verify saved calculation appears
    await expect(page.locator('[data-testid="saved-calculation"]')).toContainText('My Test Calculation')
  })
  
  test('should export calculation as PDF', async ({ page }) => {
    // Perform calculation
    await page.fill('[data-testid="grant-amount-input"]', '3.0')
    await page.selectOption('[data-testid="vesting-scheme-select"]', 'builder')
    await page.click('[data-testid="calculate-button"]')
    
    // Wait for results
    await expect(page.locator('[data-testid="results-container"]')).toBeVisible()
    
    // Export as PDF
    const downloadPromise = page.waitForEvent('download')
    await page.click('[data-testid="export-pdf-button"]')
    const download = await downloadPromise
    
    // Verify download
    expect(download.suggestedFilename()).toContain('bitcoin-calculation')
    expect(download.suggestedFilename()).toContain('.pdf')
  })
  
  test('should be fully accessible', async ({ page }) => {
    // Run accessibility scan
    const accessibilityScanResults = await page.accessibility.snapshot()
    expect(accessibilityScanResults).toBeTruthy()
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    const firstFocused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'))
    expect(firstFocused).toBeTruthy()
    
    // Test form submission with keyboard
    await page.keyboard.type('1.0')
    await page.keyboard.press('Tab')
    await page.keyboard.press('ArrowDown') // Select scheme
    await page.keyboard.press('Tab')
    await page.keyboard.type('30')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter') // Submit
    
    // Verify results appeared
    await expect(page.locator('[data-testid="results-container"]')).toBeVisible()
  })
  
  test('should perform well under load', async ({ page }) => {
    // Measure performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      }
    })
    
    // Assert performance thresholds
    expect(metrics.domContentLoaded).toBeLessThan(1000) // Under 1 second
    expect(metrics.loadComplete).toBeLessThan(2000) // Under 2 seconds
    
    // Test rapid calculations
    for (let i = 0; i < 10; i++) {
      await page.fill('[data-testid="grant-amount-input"]', String(i + 1))
      await page.click('[data-testid="calculate-button"]')
      await expect(page.locator('[data-testid="results-container"]')).toBeVisible()
    }
  })
})
```

---

## Phase 6: Deployment & Monitoring

### Step 6.1: Vercel Deployment Configuration

**File:** `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1", "lhr1"],
  "functions": {
    "src/app/api/bitcoin-price/route.ts": {
      "runtime": "edge",
      "maxDuration": 10
    },
    "src/app/api/*/route.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/update-bitcoin-data",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/cleanup-cache",
      "schedule": "0 0 * * *"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SITE_URL": "@site-url",
    "COINGECKO_API_KEY": "@coingecko-api-key",
    "SENTRY_DSN": "@sentry-dsn",
    "UPSTASH_REDIS_REST_URL": "@upstash-redis-rest-url",
    "UPSTASH_REDIS_REST_TOKEN": "@upstash-redis-rest-token"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    }
  ],
  "redirects": [
    {
      "source": "/old-calculator",
      "destination": "/calculator",
      "permanent": true
    }
  ]
}
```

### Step 6.2: GitHub Actions CI/CD

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18.x'
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
  
  e2e:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
  
  lighthouse:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/calculator
            http://localhost:3000/historical
          uploadArtifacts: true
          temporaryPublicStorage: true
  
  deploy-preview:
    runs-on: ubuntu-latest
    needs: [test, e2e, lighthouse]
    if: github.event_name == 'pull_request'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Preview
        run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}
  
  deploy-production:
    runs-on: ubuntu-latest
    needs: [test, e2e, lighthouse]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Production
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Create Sentry Release
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
        with:
          environment: production
          version: ${{ github.sha }}
```

---

## Migration Checklist

### Pre-Migration
- [ ] Backup current codebase
- [ ] Document current dependencies and versions
- [ ] Create feature branch for migration
- [ ] Set up staging environment
- [ ] Inform team about migration plan

### Phase 1: Server Components
- [ ] Convert root layout to Server Component
- [ ] Create client providers wrapper
- [ ] Implement route groups
- [ ] Add loading and error states
- [ ] Test component hydration

### Phase 2: Performance
- [ ] Implement next/image across all components
- [ ] Add font optimization
- [ ] Configure bundle optimization
- [ ] Enable Edge Runtime for API routes
- [ ] Set up performance monitoring

### Phase 3: SEO
- [ ] Implement Metadata API
- [ ] Add structured data
- [ ] Create dynamic OG images
- [ ] Generate comprehensive sitemap
- [ ] Set up Google Search Console

### Phase 4: Full-Stack
- [ ] Implement Server Actions
- [ ] Add middleware with rate limiting
- [ ] Enhance error handling
- [ ] Set up authentication (if needed)
- [ ] Configure caching strategies

### Phase 5: Testing
- [ ] Set up Playwright for E2E testing
- [ ] Write comprehensive test suites
- [ ] Configure CI/CD pipelines
- [ ] Set up performance benchmarks
- [ ] Implement visual regression testing

### Phase 6: Deployment
- [ ] Configure Vercel deployment
- [ ] Set up monitoring with Sentry
- [ ] Configure analytics
- [ ] Set up alerts and notifications
- [ ] Document deployment process

### Post-Migration
- [ ] Run full regression testing
- [ ] Performance audit
- [ ] SEO audit
- [ ] Security audit
- [ ] Update documentation
- [ ] Team training on new features
- [ ] Monitor metrics for 2 weeks

---

## Rollback Procedures

### Immediate Rollback (< 1 hour)
```bash
# Revert to previous deployment
vercel rollback

# Or using Git
git revert HEAD
git push origin main
```

### Partial Rollback
```bash
# Revert specific features
git revert <commit-hash>

# Disable features via environment variables
NEXT_PUBLIC_ENABLE_SERVER_ACTIONS=false
NEXT_PUBLIC_ENABLE_EDGE_RUNTIME=false
```

### Database Rollback
```bash
# If using Prisma
npx prisma migrate rollback

# Manual rollback
psql -U user -d database -f backup.sql
```

### Cache Invalidation
```bash
# Clear Vercel cache
vercel --force

# Clear CDN cache
curl -X POST https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

### Emergency Procedures
1. **Enable maintenance mode**: Set `NEXT_PUBLIC_MAINTENANCE_MODE=true`
2. **Notify users**: Display maintenance banner
3. **Rollback deployment**: Use Vercel dashboard or CLI
4. **Investigate issues**: Check logs and monitoring
5. **Fix and redeploy**: After resolving issues

---

## Success Metrics

### Performance KPIs
- Lighthouse Score: > 95
- First Contentful Paint: < 1.0s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.0s
- Cumulative Layout Shift: < 0.1

### SEO KPIs
- SEO Score: > 95
- Core Web Vitals: All green
- Mobile Usability: 100%
- Crawl Errors: 0
- Indexed Pages: 100%

### Business KPIs
- Page Load Time: < 2s
- Bounce Rate: < 30%
- Conversion Rate: > 5%
- User Engagement: > 3 minutes
- Error Rate: < 0.1%

---

This implementation guide provides production-ready code and configurations for transforming the Bitcoin Benefits application into a high-performance Next.js 14 application. Follow the phases sequentially for best results.
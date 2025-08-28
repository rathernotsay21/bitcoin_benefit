import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { StoreSyncProvider } from '@/components/StoreSyncProvider'
import { CSSLoadingGuard } from '@/components/CSSLoadingGuard'
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor'
import { StructuredData } from '@/components/seo/StructuredData'
import { structuredData } from '@/lib/seo/structured-data'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'
import { PrefetchLinks } from '@/components/PrefetchLinks'
import { PerformanceOptimizer } from '@/components/performance/PerformanceOptimizer'
import { FontOptimization } from '@/components/FontOptimization'
import CriticalCSS from '@/components/CriticalCSS'
import CSSLoadingStrategy from '@/components/CSSLoadingStrategy'
import { CacheManager, CacheStatusIndicator } from '@/components/performance/CacheManager'
import './globals.css'

// Phase 3.2: Import cache metrics for performance tracking
import '@/lib/performance/cacheMetrics'

// Note: The dangerouslySetInnerHTML usage below is safe as it only contains
// static, developer-controlled content (CSS and theme initialization script).
// No user input or external data is being rendered.

// Optimize font loading with critical weight subsetting for better FCP
// Phase 1.3 Performance Optimization: Reduced to only essential weights (400, 500, 700)
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Critical: Forces immediate text visibility with fallback fonts
  preload: true,
  // Critical weights only: reduced from 600 to 500 for better loading performance
  weight: ['400', '500', '700'],
  fallback: [
    // Optimized fallback stack for better metric compatibility
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Arial',
    'sans-serif'
  ],
  adjustFontFallback: true, // Enable metric-compatible fallbacks
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bitcoinbenefits.com'),
  title: 'Employee Benefits Platform | Modern Retention Solutions for HR Teams',
  description: 'Enterprise-grade employee benefits management platform. Design competitive compensation packages, implement vesting schedules, and boost retention with data-driven insights. Trusted by forward-thinking HR teams.',
  keywords: [
    'employee benefits platform',
    'HR technology',
    'compensation management',
    'employee retention software',
    'vesting schedules',
    'benefits administration',
    'total rewards',
    'human capital management',
    'workforce planning',
    'employee engagement',
    'talent retention',
    'compensation analytics'
  ],
  authors: [{ name: 'Bitcoin Benefit Solutions' }],
  creator: 'Bitcoin Benefit Solutions',
  publisher: 'Bitcoin Benefit Solutions',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'Business Software',
  classification: 'HR Technology / Employee Benefits',
  applicationName: 'Employee Benefits Platform',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
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
  openGraph: {
    title: 'Employee Benefits Platform | Modern HR Solutions',
    description: 'Transform your employee retention strategy with our comprehensive benefits management platform. Design, implement, and track compensation packages that attract and retain top talent.',
    url: 'https://bitcoinbenefit.netlify.app',
    siteName: 'Employee Benefits Platform',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Employee Benefits Platform - Modern HR Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Employee Benefits Platform | Modern HR Solutions',
    description: 'Enterprise-grade benefits management for forward-thinking companies',
    images: ['/twitter-image.png'],
    creator: '@bitcoinbenefit',
    site: '@bitcoinbenefit',
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-site-verification-code',
  },
  alternates: {
    canonical: 'https://bitcoinbenefit.netlify.app',
    languages: {
      'en-US': 'https://bitcoinbenefit.netlify.app',
    },
  },
  other: {
    'msapplication-TileColor': '#0F172A',
    'msapplication-TileImage': '/ms-icon-144x144.png',
    'theme-color': '#F7931A',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Critical performance optimizations - Phase 1.3: Enhanced font preloading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical font weights for immediate FCP improvement */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href={`https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2`}
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href={`https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2`}
          crossOrigin="anonymous"
        />
        
        {/* API preconnects moved after font preloading for better priority */}
        <link rel="preconnect" href="https://api.coingecko.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.mempool.space" crossOrigin="anonymous" />
        
        {/* Phase 3.1: Critical CSS inlined for immediate above-the-fold rendering */}
        <CriticalCSS />
        
        {/* Enhanced font loading optimization - Phase 1.3 */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Font loading states for progressive enhancement */
              .font-loading { 
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                font-size-adjust: 0.52; 
                font-display: swap;
              }
              
              .fonts-loaded .font-critical-load {
                font-family: var(--font-inter), system-ui, sans-serif;
              }
            `,
          }}
        />
        
        
        {/* Structured Data for SEO */}
        <StructuredData data={structuredData.organization} />
        
        {/* Favicon and manifest */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} ${inter.className}`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Theme initialization - prevent flash
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    if (!theme) {
                      localStorage.setItem('theme', 'light');
                    }
                  }
                  
                  // Phase 3.2: Initialize cache performance tracking
                  window.cachePerformanceStart = Date.now();
                  console.log('🚀 Phase 3.2 Service Worker optimization active');
                  
                } catch (e) {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
        <CSSLoadingGuard>
            <PerformanceMonitor 
              componentName="RootLayout"
              enableCoreWebVitals={true}
              enableDevLogging={process.env.NODE_ENV === 'development'}
            >
              <ThemeProvider>
                <StoreSyncProvider>
                  <PerformanceOptimizer enabled={process.env.NODE_ENV === 'production'}>
                    <FontOptimization />
                    {/* Phase 3.1: Advanced CSS loading strategy */}
                    <CSSLoadingStrategy 
                      enablePreload={true}
                      deferDelay={100}
                      enableProgressive={true}
                    />
                    <ServiceWorkerRegistration />
                    <PrefetchLinks />
                    <div className="min-h-screen transition-colors duration-300 performance-optimized" style={{ backgroundColor: '#F4F6F8' }}>
                      <main className="relative">
                        {children}
                      </main>
                      {/* Phase 3.2: Cache management components */}
                      {process.env.NODE_ENV === 'development' ? (
                        <CacheManager showInProduction={false} />
                      ) : (
                        <CacheStatusIndicator />
                      )}
                    </div>
                  </PerformanceOptimizer>
                </StoreSyncProvider>
              </ThemeProvider>
            </PerformanceMonitor>
        </CSSLoadingGuard>
        {/* Hidden form for Netlify Forms detection */}
        <form name="contact" data-netlify="true" data-netlify-honeypot="bot-field" hidden>
          <input type="hidden" name="form-name" value="contact" />
          <input type="email" name="email" />
          <textarea name="message"></textarea>
          <input type="hidden" name="bot-field" />
        </form>
      </body>
    </html>
  )
}
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
import './globals.css'

// Note: The dangerouslySetInnerHTML usage below is safe as it only contains
// static, developer-controlled content (CSS and theme initialization script).
// No user input or external data is being rendered.

// Optimize font loading with better performance
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bitcoinbenefits.com'),
  title: 'Modern Employee Benefits - Retention Solutions',
  description: 'Create an employee retention protocol that works—powered by valuable benefits. Plan vesting schemes, analyze historical performance, and secure your team\'s future.',
  keywords: ['employee benefits', 'vesting', 'retention', 'modern benefits', 'retirement', 'employee retention', 'compensation'],
  openGraph: {
    title: 'Modern Employee Benefits - Retention Solutions',
    description: 'Reward loyalty with valuable employee benefits. Create modern employee vesting schemes.',
    type: 'website',
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
        {/* Critical performance optimizations - Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.coingecko.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://mempool.space" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.mempool.space" />
        
        {/* Resource hints for critical data */}
        <link rel="prefetch" href="/data/bitcoin-price.json" as="fetch" crossOrigin="anonymous" />
        <link rel="prefetch" href="/data/historical-bitcoin.json" as="fetch" crossOrigin="anonymous" />
        <link rel="prefetch" href="/data/schemes-meta.json" as="fetch" crossOrigin="anonymous" />
        <link rel="prefetch" href="/data/static-calculations.json" as="fetch" crossOrigin="anonymous" />
        
        {/* Preload critical fonts */}
        <link rel="preload" href="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Module preload for critical JavaScript */}
        <link rel="modulepreload" href="/_next/static/chunks/webpack.js" />
        
        {/* Prefetch likely user journeys */}
        <link rel="prefetch" href="/calculator/pioneer" />
        <link rel="prefetch" href="/bitcoin-tools" />
        
        {/* CSS preload will be handled by Next.js automatically */}
        
        {/* Enhanced critical CSS to prevent FOUC and improve LCP */}
        <style dangerouslySetInnerHTML={{
          __html: `
            body{margin:0;padding:0;min-height:100vh;font-display:swap;background-color:#F4F6F8}
            .btn-primary{background:linear-gradient(135deg,#f7931a 0%,#f7931a 100%);padding:14px 28px;border-radius:12px;color:white;font-weight:600;border:none;cursor:pointer;transition:all 0.2s ease;transform:translateZ(0);will-change:transform}
            .loading-skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:loading 1.5s infinite}
            @keyframes loading{0%{background-position:200% 0}to{background-position:-200% 0}}
            .chart-container{contain:layout style paint;will-change:contents;height:540px}
            .performance-optimized{contain:layout;will-change:auto}
            .hero-section{min-height:400px;background:#0f172a;contain:layout style}
            .feature-card{background:white;border-radius:12px;padding:2rem;transition:transform 0.2s;contain:layout style}
            .feature-card:hover{transform:translateY(-4px)}
            .icon-container{width:4rem;height:4rem;background:rgba(247,147,26,0.1);border-radius:1.25rem;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(247,147,26,0.1)}
          `
        }} />
        
        
        {/* Structured Data for SEO */}
        <StructuredData data={structuredData.organization} />
        
        {/* Favicon and manifest */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
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
                  <ServiceWorkerRegistration />
                  <PrefetchLinks />
                  <div className="min-h-screen transition-colors duration-300 performance-optimized">
                    <main className="relative">
                      {children}
                    </main>
                  </div>
                </StoreSyncProvider>
              </ThemeProvider>
            </PerformanceMonitor>
        </CSSLoadingGuard>
      </body>
    </html>
  )
}
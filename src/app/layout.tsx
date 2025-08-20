import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { StoreSyncProvider } from '@/components/StoreSyncProvider'
import { CSSLoadingGuard } from '@/components/CSSLoadingGuard'
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor'
import './globals.css'

// Optimize font loading with better performance
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: false,
})

export const metadata: Metadata = {
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
        {/* Critical performance optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.coingecko.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://mempool.space" />
        
        {/* Resource hints for better performance */}
        <link rel="prefetch" href="/data/bitcoin-price.json" />
        <link rel="prefetch" href="/data/historical-bitcoin.json" />
        <link rel="prefetch" href="/data/schemes-meta.json" />
        
        {/* CSS preload will be handled by Next.js automatically */}
        
        {/* Enhanced critical CSS to prevent FOUC and improve LCP */}
        <style dangerouslySetInnerHTML={{
          __html: `
            body{margin:0;padding:0;min-height:100vh;font-display:swap}
            .btn-primary{background:linear-gradient(135deg,#f7931a 0%,#f7931a 100%);padding:14px 28px;border-radius:12px;color:white;font-weight:600;border:none;cursor:pointer;transition:all 0.2s ease;transform:translateZ(0);will-change:transform}
            .loading-skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:loading 1.5s infinite}
            @keyframes loading{0%{background-position:200% 0}to{background-position:-200% 0}}
            .chart-container{contain:layout style paint;will-change:contents}
            .performance-optimized{contain:layout;will-change:auto}
          `
        }} />
        
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
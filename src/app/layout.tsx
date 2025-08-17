import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import { StoreSyncProvider } from '@/components/StoreSyncProvider'
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Critical performance optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.coingecko.com" />
        <link rel="dns-prefetch" href="https://mempool.space" />
        
        {/* Critical CSS - minimal for above-the-fold */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Minimal critical CSS - let globals.css handle the enhanced styles */
            .hero-gradient{background:linear-gradient(135deg,#f8fafc 0%,#e2e8f0 50%,#cbd5e1 100%)}
            .dark .hero-gradient{background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%)}
            body{margin:0;padding:0;min-height:100vh}
          `
        }} />
        
        {/* Favicon and manifest */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Always start in light mode, only switch to dark if explicitly set
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    // Ensure light mode is set as default
                    localStorage.setItem('theme', 'light');
                  }
                } catch (e) {
                  // Fallback to light mode
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
        <ThemeProvider>
          <StoreSyncProvider>
            <div className="min-h-screen transition-colors duration-300">
              <main>{children}</main>
            </div>
          </StoreSyncProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
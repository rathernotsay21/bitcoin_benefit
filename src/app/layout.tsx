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
        
        {/* Critical CSS - inline for above-the-fold */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .hero-gradient{background:linear-gradient(135deg,#f8fafc 0%,#e2e8f0 50%,#cbd5e1 100%)}
            .dark .hero-gradient{background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%)}
            .animate-float{animation:float 6s ease-in-out infinite}
            @keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-10px)}}
            .animate-pulse-slow{animation:pulse 4s cubic-bezier(0.4,0,0.6,1) infinite}
            .btn-primary{background:#f7931a;color:white;border-radius:0.75rem;font-weight:600;transition:all 0.3s;will-change:transform}
            .btn-primary:hover{background:#e8851f;transform:translateY(-2px)}
            .feature-card{background:white;border:1px solid #e2e8f0;border-radius:1rem;padding:2rem;transition:all 0.3s;will-change:transform}
            .feature-card:hover{border-color:#f7931a;transform:translateY(-4px);box-shadow:0 20px 25px -5px rgba(0,0,0,0.1)}
            .dark .feature-card{background:#1e293b;border-color:#334155}
            .icon-container{background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:1rem;padding:0.75rem;transition:all 0.3s;will-change:transform}
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
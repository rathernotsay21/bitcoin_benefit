import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bitcoin Benefits - Employee Vesting Solutions',
  description: 'Create an employee retention protocol that works—powered by Bitcoin. Plan vesting schemes, analyze historical performance, and secure your team\'s future.',
  keywords: ['bitcoin', 'vesting', 'employee benefits', 'cryptocurrency', 'retirement', 'employee retention', 'compensation'],
  openGraph: {
    title: 'Bitcoin Benefits - Employee Vesting Solutions',
    description: 'Reward loyalty with sound money. Create Bitcoin-based employee vesting schemes.',
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
          <div className="min-h-screen transition-colors duration-300">
            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
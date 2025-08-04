import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bitcoin Vesting Calculator',
  description: 'Plan Bitcoin vesting schemes for your employees',
  keywords: ['bitcoin', 'vesting', 'employee benefits', 'cryptocurrency', 'retirement'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
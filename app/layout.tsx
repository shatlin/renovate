import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CurrencyProvider } from '@/contexts/CurrencyContext'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Renovate - Smart Renovation Planning & Budget Tracking',
    template: '%s | Renovate'
  },
  description: 'Plan and track your home renovation budget with ease. Room-by-room planning, contractor management, and real-time cost tracking - better than spreadsheets.',
  keywords: 'renovation budget, home improvement, renovation planning, budget tracker, contractor management, home renovation, remodeling budget, construction budget',
  authors: [{ name: 'Renovate Team' }],
  creator: 'Renovate',
  publisher: 'Renovate',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
      { url: '/apple-touch-icon-180x180.png', sizes: '180x180' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120' },
      { url: '/apple-touch-icon-76x76.png', sizes: '76x76' },
      { url: '/apple-touch-icon-60x60.png', sizes: '60x60' },
    ],
    other: [
      { rel: 'mask-icon', url: '/favicon.svg', color: '#4F46E5' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Renovate - Smart Renovation Planning & Budget Tracking',
    description: 'Plan and track your home renovation budget with ease. Room-by-room planning, contractor management, and real-time cost tracking.',
    url: 'https://renovate.app',
    siteName: 'Renovate',
    type: 'website',
    locale: 'en_US',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'RenovateBudget - Smart Renovation Planning'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Renovate - Smart Renovation Planning',
    description: 'Plan and track your home renovation budget with ease. Better than spreadsheets.',
    images: ['/twitter-image.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${inter.className} min-h-screen antialiased`}>
        {/* Very light gradient background with soft purple and pink tones */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-50/50 via-white to-rose-50/50" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-100/20 via-transparent to-transparent" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/50 via-transparent to-transparent" />
        
        {/* Very light animated gradient orbs */}
        <div className="fixed top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/15 to-purple-200/15 rounded-full blur-3xl animate-pulse" />
        <div className="fixed bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-200/15 to-rose-200/15 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-200/10 to-pink-200/10 rounded-full blur-3xl animate-pulse animation-delay-4000" />
        
        <div className="relative z-10">
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </div>
      </body>
    </html>
  )
}
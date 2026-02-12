import type { Metadata } from 'next'
import { playfair, caveat } from '@/lib/fonts'
import FloatingDoodles from '@/components/FloatingDoodles'
import BottomNav from '@/components/BottomNav'
import './globals.css'

export const metadata: Metadata = {
  title: 'For My Love ♡',
  description: 'A digital scrapbook of our memories',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${caveat.variable}`}>
      <body>
        <FloatingDoodles />
        <main className="min-h-screen relative z-10 pb-24">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}

import { Playfair_Display, Caveat } from 'next/font/google'

// Serif font for headings — elegant, editorial, sentimental
export const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '600', '700'],
})

// Handwritten font for decorative accents — personal and warm
export const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-hand',
  display: 'swap',
  weight: ['400', '700'],
})

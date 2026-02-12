'use client'

import { motion } from 'framer-motion'
import IkeaBingo from '@/components/IkeaBingo'
import IkeaPalette from '@/components/IkeaPalette'
import DateGuard from '@/components/DateGuard'

/* ═══════════════════════════════════════════════
   IKEA Adventure — "The Open Sketchbook"

   Desktop: Two-page spread (bingo left, palette right)
              with a book spine shadow in the center.
   Mobile:  Stacked vertically with a torn-paper divider.
   ═══════════════════════════════════════════════ */
export default function IkeaPage() {
  return (
    <DateGuard customMessage="Store Closed. Grand Opening: Feb 14 ♡">
      <motion.div
        className="w-full max-w-6xl mx-auto px-3 pt-6 pb-28 sm:px-4 sm:pt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* ─── Header ─── */}
        <div className="text-center mb-6 sm:mb-8">
          <h1
            className="font-hand text-4xl sm:text-5xl text-ink"
            style={{ lineHeight: 1.1, transform: 'rotate(-0.8deg)' }}
          >
            IKEA Adventure
          </h1>
          <p className="font-hand text-base sm:text-lg text-rose/70 mt-1 -rotate-[0.5deg]">
            Our scrapbook of chaos and colors ♡
          </p>
        </div>

        {/* ─── The Open Sketchbook ─── */}
        <div className="relative">
          {/* Book spine shadow — visible on desktop only */}
          <div
            className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(
              90deg,
              transparent 0%,
              rgba(62,60,60,0.04) 30%,
              rgba(62,60,60,0.08) 50%,
              rgba(62,60,60,0.04) 70%,
              transparent 100%
            )`,
            }}
          />

          {/* Two-page grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-0">
            {/* ═══ LEFT PAGE — Mission Bingo ═══ */}
            <div
              className="relative rounded-xl lg:rounded-r-none p-4 sm:p-6"
              style={{
                backgroundColor: '#F5F0E8',
                boxShadow: 'inset 0 1px 4px rgba(62,60,60,0.05), 0 2px 12px rgba(62,60,60,0.06)',
              }}
            >
              {/* Page heading */}
              <div className="mb-4">
                <h2 className="font-hand text-2xl sm:text-3xl text-ink" style={{ transform: 'rotate(-1deg)' }}>
                  Mission Bingo
                </h2>
                <p className="font-hand text-xs sm:text-sm text-ink/35 mt-0.5">
                  Snap 3 in a row → unlock reward ★
                </p>
              </div>

              <IkeaBingo />

              {/* Page number */}
              <p className="font-hand text-[10px] text-ink/15 text-center mt-4">— 1 —</p>
            </div>

            {/* ═══ TORN PAPER DIVIDER — Mobile only ═══ */}
            <div className="lg:hidden relative h-8 my-2 overflow-hidden select-none pointer-events-none">
              {/* Top torn edge */}
              <svg
                viewBox="0 0 400 16"
                className="absolute top-0 left-0 w-full h-4"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,16 Q10,8 20,14 T40,10 T60,14 T80,8 T100,12 T120,6 T140,14 T160,8 T180,12 T200,6 T220,14 T240,10 T260,14 T280,6 T300,12 T320,8 T340,14 T360,10 T380,12 T400,16"
                  fill="#F5F0E8"
                />
              </svg>
              {/* Dashed cut line */}
              <div className="absolute top-1/2 left-8 right-8 border-t-2 border-dashed border-ink/8" />
              {/* Bottom torn edge */}
              <svg
                viewBox="0 0 400 16"
                className="absolute bottom-0 left-0 w-full h-4"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,0 Q15,8 30,2 T60,6 T90,2 T120,8 T150,4 T180,8 T210,2 T240,6 T270,2 T300,8 T330,4 T360,8 T390,2 L400,0"
                  fill="#F5F0E8"
                />
              </svg>
            </div>

            {/* ═══ RIGHT PAGE — Mood Colors ═══ */}
            <div
              className="relative rounded-xl lg:rounded-l-none p-4 sm:p-6"
              style={{
                backgroundColor: '#F5F0E8',
                boxShadow: 'inset 0 1px 4px rgba(62,60,60,0.05), 0 2px 12px rgba(62,60,60,0.06)',
              }}
            >
              {/* Page heading */}
              <div className="mb-4">
                <h2 className="font-hand text-2xl sm:text-3xl text-ink" style={{ transform: 'rotate(0.5deg)' }}>
                  Mood Colors
                </h2>
                <p className="font-hand text-xs sm:text-sm text-ink/35 mt-0.5">
                  Pick colors from furniture you love ♡
                </p>
              </div>

              <IkeaPalette />

              {/* Page number */}
              <p className="font-hand text-[10px] text-ink/15 text-center mt-4">— 2 —</p>
            </div>
          </div>
        </div>
      </motion.div>
    </DateGuard>
  )
}

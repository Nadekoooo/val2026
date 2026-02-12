'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import LockScreen from '@/components/LockScreen'
import EnvelopeThread from '@/components/EnvelopeThread'

/* ════════════════════════════════════════════
   HOME PAGE — Time-Locked Entrance
   Before target date: "Keyhole Teaser" lock screen
   After:  "Untying the Heart" — red thread envelope
   ════════════════════════════════════════════ */

const UNLOCK_DATE = new Date('2026-02-14T00:00:00').getTime()

export default function Home() {
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null)
  const handleUnlock = useCallback(() => setIsUnlocked(true), [])

  useEffect(() => {
    setIsUnlocked(Date.now() >= UNLOCK_DATE)
  }, [])

  // SSR hydration
  if (isUnlocked === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-hand text-xl text-ink/30 animate-pulse">♡</p>
      </div>
    )
  }

  // ── LOCKED ──
  if (!isUnlocked) {
    return <LockScreen onUnlock={handleUnlock} />
  }

  // ── UNLOCKED — Untying the Heart ──
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <EnvelopeThread />
    </motion.div>
  )
}

'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'
import LockScreen from '@/components/LockScreen'
import { motion, AnimatePresence } from 'framer-motion'

/* ═══════════════════════════════════════════════
   DateGuard — Time-locks child routes
   until Feb 14, 2026 00:00:00 local time.
   ═══════════════════════════════════════════════ */

const UNLOCK_DATE = new Date('2026-02-14T00:00:00').getTime()

interface DateGuardProps {
    children: ReactNode
    customMessage?: string
}

export default function DateGuard({ children, customMessage = 'The Exhibition opens in…' }: DateGuardProps) {
    const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null)

    useEffect(() => {
        setIsUnlocked(Date.now() >= UNLOCK_DATE)
    }, [])

    const handleUnlock = useCallback(() => setIsUnlocked(true), [])

    // Hydration — show nothing (prevents flash)
    if (isUnlocked === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="font-hand text-xl text-ink/30 animate-pulse">♡</p>
            </div>
        )
    }

    // LOCKED — show keyhole teaser
    if (!isUnlocked) {
        return <LockScreen onUnlock={handleUnlock} customMessage={customMessage} />
    }

    // UNLOCKED — reveal children with smooth fade
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}

'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

/* ═══════════════════════════════════════════════
   Menu items — each with a unique background
   ═══════════════════════════════════════════════ */
interface MenuItem {
    id: string
    number: string
    label: string
    subtitle: string
    href: string
    bgGradient: string
}

const MENU_ITEMS: MenuItem[] = [
    {
        id: 'memories',
        number: '01',
        label: 'MEMORIES',
        subtitle: 'Our photo collection',
        href: '/gallery',
        // Warm blurred photo collage feel
        bgGradient: `
      radial-gradient(ellipse 80% 60% at 30% 30%, rgba(226,149,120,0.35) 0%, transparent 60%),
      radial-gradient(ellipse 60% 70% at 70% 60%, rgba(200,160,120,0.25) 0%, transparent 55%),
      radial-gradient(ellipse 50% 40% at 50% 80%, rgba(180,140,100,0.20) 0%, transparent 45%),
      linear-gradient(145deg, #C4A882 0%, #B89B72 50%, #D4B896 100%)
    `,
    },
    {
        id: 'letter',
        number: '02',
        label: 'THE LETTER',
        subtitle: 'Words from the heart',
        href: '/letter',
        // Crumpled paper texture feel
        bgGradient: `
      radial-gradient(ellipse 90% 80% at 40% 40%, rgba(245,240,232,0.5) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 75% 65%, rgba(220,210,195,0.3) 0%, transparent 50%),
      linear-gradient(160deg, #E8DDD0 0%, #D8CCBC 40%, #E0D5C8 100%)
    `,
    },
    {
        id: 'plans',
        number: '03',
        label: 'OUR PLANS',
        subtitle: 'The IKEA adventure',
        href: '/ikea',
        // Blueprint / IKEA color feel
        bgGradient: `
      radial-gradient(ellipse 70% 60% at 35% 35%, rgba(0,87,163,0.12) 0%, transparent 55%),
      radial-gradient(ellipse 50% 60% at 70% 70%, rgba(255,218,69,0.15) 0%, transparent 50%),
      radial-gradient(ellipse 80% 40% at 50% 50%, rgba(212,163,115,0.10) 0%, transparent 50%),
      linear-gradient(135deg, #D4C5B0 0%, #C8B89E 50%, #DDCFbb 100%)
    `,
    },
]

/* ═══════════════════════════════════════════════
   Kinetic Menu Component
   ═══════════════════════════════════════════════ */
export default function KineticMenu() {
    const [hoveredId, setHoveredId] = useState<string | null>(null)
    const [tappedId, setTappedId] = useState<string | null>(null)

    const handleEnter = useCallback((id: string) => setHoveredId(id), [])
    const handleLeave = useCallback(() => setHoveredId(null), [])

    // Mobile: first tap reveals, second tap navigates
    const handleTap = useCallback(
        (id: string, e: React.MouseEvent | React.TouchEvent) => {
            // Only intercept on touch devices
            if (!('ontouchstart' in window)) return
            if (tappedId !== id) {
                e.preventDefault()
                setTappedId(id)
                setHoveredId(id)
            }
            // If tappedId === id, let the Link navigate naturally
        },
        [tappedId]
    )

    const activeId = hoveredId ?? tappedId

    return (
        <div className="relative w-full min-h-screen overflow-hidden">
            {/* ── Background layers with crossfade ── */}
            <div className="fixed inset-0 z-0 transition-colors duration-700 ease-out" style={{ backgroundColor: '#F5F0E8' }} />

            <AnimatePresence>
                {activeId && (
                    <motion.div
                        key={activeId}
                        className="fixed inset-0 z-[1]"
                        style={{ background: MENU_ITEMS.find((m) => m.id === activeId)?.bgGradient }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                )}
            </AnimatePresence>

            {/* ── Grain texture overlay ── */}
            <div
                className="fixed inset-0 z-[2] pointer-events-none opacity-[0.04]"
                style={{
                    backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKvSURBVGiB7ZrNThRBEMd/PbMLKgQSE01MvHn05sEX8AGMz+Cj+AJ68ODBixc/LhITDRpRQBdk2d0Zh+rZ3p6e3tlZd2Y28E8mO91dXfWfrqrunlkJIUBC7wZ0DYVI1DYBN2ECbBFqFbhE4DTwBDgPDAin1h7wNlABtoGfsQqxR0SAGjFKYP+j1cOhEfuKbKVNoBozCpFqUzLaWJvAtQl8jwJ7Z7CHzl/SAU4D3wEDVNPmgb6ARO025g5/MHT/q7ZJXGBkS8QuQmyBtNrr3h/xDxG5YYroMkm6MdfK4wQu8Kp6iviDvA+cH4GuINYh4g9kLabPpbgC6DQyDf8AWqG3oP2TkW2IuIScR+QRsSKiPXWgeeIrYhYhcjbJmKViNyLYgfAQ+A6sA+cJVRWvSReAF4DdwjVmjvA68B3YBO4ifSzJsDBiBO4iJD5GjGz8WiEbiK+IG4j5xBrgQsREfiEOBF4RjpA7C/yJ/AXcBTlXWsXuErsY+5i7ILsR/kPsQ+4hViLpLxJbJfvjHO8HgjnJDwG3gZeAtfQnfbR4GngauI08AtwjN+Xie3AEvIvKxHvAMeDrwxLjBiAvATeARcBT4QKhX5G1gDuAd4C5gA7gEfIp0Y9kFfEDsEHiK2AFwB3GWMHd8HnGUaF5E5gD5FxA7iK+AIuYXYI3KMfE/t+bYQcxCrgbuQ6IevEDuI3YYF4n94QqxjEbcRLhBWIVCEJ1vUF4IXuA74E9kM5bVH6L8G/gSuIJKxdiEeIdIvcJcwm3CV4HLkHsLfQ8/0rXDLyLSA3A8+J+Av4B9gD0Y+YIv7A0/Ef8Re4CjxM80bA2+IN4iNijcgVxC5gnnCT2c7cJ3g+Ah4C/gZ2S32I7hMvAS+AsR8RP8A/mT/z+Af0UPW0bk5BQAAAABJRU5ErkJggg==")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '100px 100px',
                }}
            />

            {/* ── Content ── */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 sm:px-8">
                {/* Header */}
                <motion.div
                    className="mb-16 sm:mb-20 text-center"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="font-mono text-[10px] tracking-[0.5em] uppercase text-ink/25 mb-2">
                        Valentine 2026
                    </p>
                    <h1 className="font-serif text-2xl sm:text-3xl text-ink/50 italic font-light">
                        For Oyen
                    </h1>
                </motion.div>

                {/* Menu items */}
                <div className="w-full max-w-2xl space-y-2 sm:space-y-0">
                    {MENU_ITEMS.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + index * 0.12, duration: 0.5 }}
                        >
                            <Link
                                href={item.href}
                                className="group relative block py-5 sm:py-7 border-t border-ink/8 last:border-b transition-all duration-300"
                                onMouseEnter={() => handleEnter(item.id)}
                                onMouseLeave={handleLeave}
                                onClick={(e) => handleTap(item.id, e)}
                                style={{ mixBlendMode: 'normal' }}
                            >
                                <div className="flex items-center justify-between">
                                    {/* Left: number + label */}
                                    <div className="flex items-baseline gap-4 sm:gap-6">
                                        <span className="font-mono text-xs text-ink/20 tabular-nums">
                                            {item.number}
                                        </span>
                                        <motion.span
                                            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-ink/80"
                                            animate={{
                                                x: activeId === item.id ? 16 : 0,
                                                letterSpacing: activeId === item.id ? '0.04em' : '-0.02em',
                                            }}
                                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                            style={{ mixBlendMode: 'difference', color: activeId === item.id ? '#F9F5F1' : undefined }}
                                        >
                                            {item.label}
                                        </motion.span>
                                    </div>

                                    {/* Right: subtitle + arrow */}
                                    <div className="hidden sm:flex items-center gap-3">
                                        <motion.span
                                            className="font-hand text-sm text-ink/30"
                                            animate={{ opacity: activeId === item.id ? 1 : 0.5 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            {item.subtitle}
                                        </motion.span>
                                        <motion.div
                                            animate={{
                                                x: activeId === item.id ? 4 : 0,
                                                opacity: activeId === item.id ? 1 : 0.2,
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ArrowUpRight className="w-5 h-5 text-ink/40" />
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Mobile subtitle */}
                                <p className="sm:hidden font-hand text-xs text-ink/25 mt-1 ml-8">
                                    {item.subtitle}
                                </p>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Footer */}
                <motion.footer
                    className="mt-16 sm:mt-24 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-ink/15">
                        Curated for Oyen. Est. 2026.
                    </p>
                </motion.footer>
            </div>
        </div>
    )
}

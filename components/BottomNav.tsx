'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mail, ImageIcon, ShoppingCart, FileText, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/* ═══════════════════════════════════════════════
   Target Unlock Date - Synced with LockScreen
   ═══════════════════════════════════════════════ */
const TARGET_DATE = new Date('2026-02-14T00:00:00').getTime()

const navItems = [
    { href: '/', label: 'Home', icon: Mail, lockable: false },
    { href: '/letter', label: 'Letter', icon: FileText, lockable: false },
    { href: '/gallery', label: 'Photos', icon: ImageIcon, lockable: true },
    { href: '/ikea', label: 'IKEA', icon: ShoppingCart, lockable: true },
]

const LOCK_MESSAGES = [
    'Locked until Feb 14th ♡',
    'Sabar ya, belum waktunya~',
    'Tunggu tanggal 14 dulu!',
    'Coming soon… ✨',
]

export default function BottomNav() {
    const pathname = usePathname()
    const [isLocked, setIsLocked] = useState(true)
    const [shakingItem, setShakingItem] = useState<string | null>(null)
    const [toast, setToast] = useState<string | null>(null)

    // ── Date Check: Auto-update every second ──
    useEffect(() => {
        const checkLock = () => {
            const now = Date.now()
            setIsLocked(now < TARGET_DATE)
        }
        
        checkLock()
        const interval = setInterval(checkLock, 1000)
        return () => clearInterval(interval)
    }, [])

    // ── Handle Locked Item Click ──
    const handleLockedClick = useCallback((href: string) => {
        // Trigger shake animation
        setShakingItem(href)
        setTimeout(() => setShakingItem(null), 500)

        // Show random toast
        const randomMessage = LOCK_MESSAGES[Math.floor(Math.random() * LOCK_MESSAGES.length)]
        setToast(randomMessage)
        setTimeout(() => setToast(null), 2500)
    }, [])

    return (
        <>
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999]">
                <div
                    className="flex items-center gap-1 px-2.5 py-2 rounded-full border border-white/30 shadow-2xl"
                    style={{
                        background: 'rgba(255,255,255,0.78)',
                        backdropFilter: 'blur(20px) saturate(1.8)',
                        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                    }}
                >
                    {navItems.map(({ href, label, icon: Icon, lockable }) => {
                        const isActive = pathname === href
                        const isItemLocked = lockable && isLocked
                        const isShaking = shakingItem === href

                        const itemContent = (
                            <>
                                {/* Lock Icon Overlay */}
                                {isItemLocked && (
                                    <Lock className="absolute -top-1 -right-1 w-3 h-3 text-ink/60" />
                                )}

                                <Icon
                                    className={`w-[18px] h-[18px] transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                                />
                                <span
                                    className={`
                                        text-xs font-medium tracking-wide overflow-hidden transition-all duration-300
                                        ${isActive ? 'max-w-[60px] opacity-100' : 'max-w-0 opacity-0'}
                                    `}
                                >
                                    {label}
                                </span>
                            </>
                        )

                        const itemClass = `
                            relative flex items-center gap-2 px-4 py-2.5 rounded-full
                            transition-all duration-300 ease-out select-none
                            ${isItemLocked 
                                ? 'grayscale opacity-30 cursor-not-allowed' 
                                : isActive
                                    ? 'bg-accent/15 text-accent shadow-sm'
                                    : 'text-ink/40 hover:text-ink/70 hover:bg-white/40'
                            }
                        `

                        return (
                            <motion.div
                                key={href}
                                animate={isShaking ? {
                                    x: [-5, 5, -5, 5, 0],
                                } : {}}
                                transition={{ duration: 0.4 }}
                            >
                                {isItemLocked ? (
                                    <div
                                        onClick={() => handleLockedClick(href)}
                                        className={itemClass}
                                    >
                                        {itemContent}
                                    </div>
                                ) : (
                                    <Link
                                        href={href}
                                        className={itemClass}
                                    >
                                        {itemContent}
                                    </Link>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </nav>

            {/* ── Toast Notification ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none"
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div
                            className="px-5 py-3 rounded-full border border-white/30 shadow-2xl"
                            style={{
                                background: 'rgba(255,255,255,0.92)',
                                backdropFilter: 'blur(20px)',
                            }}
                        >
                            <p className="font-hand text-sm text-ink/70 whitespace-nowrap">
                                {toast}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

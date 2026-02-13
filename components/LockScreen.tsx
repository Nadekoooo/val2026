'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'

/* ═══════════════════════════════════════════════
   Target unlock date
   ═══════════════════════════════════════════════ */
const TARGET = new Date('2026-02-14T00:00:00').getTime()

/* ═══════════════════════════════════════════════
   Toast messages on knock
   ═══════════════════════════════════════════════ */
const KNOCK_MESSAGES = [
    'Sabar ya Oyen, lagi disiapin… 🔨',
    'Belum buka, jangan diintip terus! 👀',
    'Sabar dikit lagiii…',
    'Knock knock! Belum waktunya ♡',
    'Ssst, surprise nanti ya~',
    'Antri dulu, belum buka pintunya!',
]

interface TimeLeft {
    days: number
    hours: number
    minutes: number
    seconds: number
}

function getTimeLeft(): TimeLeft {
    const diff = Math.max(0, TARGET - Date.now())
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    }
}

function pad(n: number): string {
    return String(n).padStart(2, '0')
}

/* ═══════════════════════════════════════════════
   Lock Screen Component
   ═══════════════════════════════════════════════ */
export default function LockScreen({ onUnlock, customMessage }: { onUnlock: () => void; customMessage?: string }) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft)
    const [toast, setToast] = useState<string | null>(null)
    const [isShaking, setIsShaking] = useState(false)
    const knockIndexRef = useRef(0)
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // ── Parallax mouse tracking ──
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })

    // Countdown tick
    useEffect(() => {
        const interval = setInterval(() => {
            const tl = getTimeLeft()
            setTimeLeft(tl)
            if (tl.days === 0 && tl.hours === 0 && tl.minutes === 0 && tl.seconds === 0) {
                clearInterval(interval)
                onUnlock()
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [onUnlock])

    // Mouse parallax
    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            const cx = window.innerWidth / 2
            const cy = window.innerHeight / 2
            mouseX.set((e.clientX - cx) / cx * 15)
            mouseY.set((e.clientY - cy) / cy * 15)
        }
        window.addEventListener('mousemove', handleMove)
        return () => window.removeEventListener('mousemove', handleMove)
    }, [mouseX, mouseY])

    // Device orientation parallax (mobile)
    useEffect(() => {
        const handleOrientation = (e: DeviceOrientationEvent) => {
            const gamma = e.gamma ?? 0 // left-right tilt (-90 to 90)
            const beta = e.beta ?? 0   // front-back tilt (-180 to 180)
            mouseX.set(gamma / 90 * 15)
            mouseY.set(Math.max(-45, Math.min(45, beta)) / 45 * 15)
        }
        window.addEventListener('deviceorientation', handleOrientation)
        return () => window.removeEventListener('deviceorientation', handleOrientation)
    }, [mouseX, mouseY])

    // Knock handler
    const handleKnock = useCallback(() => {
        setIsShaking(true)
        setTimeout(() => setIsShaking(false), 500)

        const msg = KNOCK_MESSAGES[knockIndexRef.current % KNOCK_MESSAGES.length]
        knockIndexRef.current += 1
        setToast(msg)

        if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
        toastTimerRef.current = setTimeout(() => setToast(null), 2500)
    }, [])

    const totalSeconds = timeLeft.days * 86400 + timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds
    const isAlmostTime = totalSeconds < 3600 // last hour

    return (
        <div className="fixed inset-0 z-30 overflow-hidden select-none" style={{ backgroundColor: '#1A1714' }}>
            {/* ── Moving gradient background (visible through keyhole) ── */}
            <motion.div
                className="absolute inset-0"
                style={{
                    x: springX,
                    y: springY,
                    scale: 1.15,
                    background: `
            radial-gradient(ellipse 80% 60% at 45% 40%, rgba(226,149,120,0.25) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 65% 70%, rgba(212,163,115,0.20) 0%, transparent 55%),
            radial-gradient(ellipse 90% 70% at 50% 50%, rgba(249,245,241,0.06) 0%, transparent 50%),
            linear-gradient(135deg, #2D2520 0%, #1A1714 50%, #231E1A 100%)
          `,
                }}
            />

            {/* ── Animated floating particles behind keyhole ── */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ x: springX, y: springY, scale: 1.15 }}
            >
                {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full"
                        style={{
                            backgroundColor: i % 2 === 0 ? 'rgba(226,149,120,0.4)' : 'rgba(212,163,115,0.35)',
                            left: `${20 + i * 12}%`,
                            top: `${30 + (i % 3) * 15}%`,
                        }}
                        animate={{
                            y: [0, -20, 5, -15, 0],
                            x: [0, 8, -5, 10, 0],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                            duration: 5 + i * 0.8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 0.6,
                        }}
                    />
                ))}
            </motion.div>

            {/* ── Keyhole mask overlay ── */}
            <div
                className="absolute inset-0 z-10"
                style={{
                    background: '#1A1714',
                    maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 320'%3E%3Ccircle cx='100' cy='95' r='55' fill='black'/%3E%3Crect x='75' y='130' width='50' height='110' rx='6' fill='black'/%3E%3C/svg%3E")`,
                    maskSize: '120px auto',
                    maskPosition: 'center 38%',
                    maskRepeat: 'no-repeat',
                    maskComposite: 'exclude',
                    WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 320'%3E%3Ccircle cx='100' cy='95' r='55' fill='black'/%3E%3Crect x='75' y='130' width='50' height='110' rx='6' fill='black'/%3E%3C/svg%3E")`,
                    WebkitMaskSize: '120px auto',
                    WebkitMaskPosition: 'center 38%',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskComposite: 'xor',
                }}
            />

            {/* ── Keyhole rim glow ── */}
            <div className="absolute inset-0 z-20 flex items-start justify-center pointer-events-none" style={{ paddingTop: '28%' }}>
                <div
                    className="w-[130px] h-[200px] sm:w-[140px] sm:h-[220px]"
                    style={{
                        background: 'transparent',
                        borderRadius: '50% 50% 30% 30%',
                        boxShadow: 'inset 0 0 30px rgba(212,163,115,0.08), 0 0 40px rgba(212,163,115,0.05)',
                    }}
                />
            </div>

            {/* ── Clickable keyhole area (knock) ── */}
            <motion.button
                className="absolute z-30 left-1/2 -translate-x-1/2 w-32 h-48 cursor-pointer focus:outline-none"
                style={{ top: '28%' }}
                onClick={handleKnock}
                animate={isShaking ? { x: [-4, 4, -3, 3, -2, 2, 0], rotate: [-1, 1, -0.5, 0.5, 0] } : {}}
                transition={{ duration: 0.4 }}
                aria-label="Knock on keyhole"
            />

            {/* ── Countdown ── */}
            <div className="absolute z-30 bottom-32 sm:bottom-36 left-0 right-0 flex flex-col items-center gap-4">
                {/* Timer */}
                <div className="flex items-baseline gap-1">
                    <TimeUnit value={pad(timeLeft.days)} label="hari" />
                    <span className="font-mono text-lg text-white/20 mx-0.5">:</span>
                    <TimeUnit value={pad(timeLeft.hours)} label="jam" />
                    <span className="font-mono text-lg text-white/20 mx-0.5">:</span>
                    <TimeUnit value={pad(timeLeft.minutes)} label="min" />
                    <span className="font-mono text-lg text-white/20 mx-0.5">:</span>
                    <TimeUnit value={pad(timeLeft.seconds)} label="det" pulse={isAlmostTime} />
                </div>

                {/* Label */}
                <p className="font-hand text-sm text-white/20">
                    Until the door opens ♡
                </p>

                {/* Custom message from DateGuard */}
                {customMessage && (
                    <p className="font-hand text-sm text-white/30 italic mt-1 px-6 text-center leading-relaxed">
                        {customMessage}
                    </p>
                )}
            </div>

            {/* ── Toast message ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className="absolute z-40 top-16 left-1/2 -translate-x-1/2"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div
                            className="px-5 py-3 rounded-full font-hand text-sm text-white/80 whitespace-nowrap"
                            style={{
                                background: 'rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                        >
                            {toast}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── "Untuk Oyen" label ── */}
            <div className="absolute z-30 top-12 sm:top-16 left-0 right-0 text-center">
                <motion.h1
                    className="font-hand text-2xl sm:text-3xl text-white/25"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    Untuk Oyen
                </motion.h1>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════
   Time Unit display
   ═══════════════════════════════════════════════ */
function TimeUnit({
    value,
    label,
    pulse = false,
}: {
    value: string
    label: string
    pulse?: boolean
}) {
    return (
        <div className="flex flex-col items-center">
            <span
                className={`font-mono text-2xl sm:text-3xl font-bold tracking-wider ${pulse ? 'text-rose/70 animate-pulse' : 'text-white/50'
                    }`}
            >
                {value}
            </span>
            <span className="font-hand text-[10px] text-white/20 mt-0.5">{label}</span>
        </div>
    )
}

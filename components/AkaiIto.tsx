'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
    motion,
    useMotionValue,
    useTransform,
    useSpring,
    useAnimationControls,
    AnimatePresence,
} from 'framer-motion'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

/* ═══════════════════════════════════════════════
   Menu items attached to the thread
   ═══════════════════════════════════════════════ */
interface ThreadItem {
    id: string
    number: string
    label: string
    subtitle: string
    href: string
    attachPoint: number // 0-1 along thread where item is "tied"
}

const ITEMS: ThreadItem[] = [
    { id: 'memories', number: '01', label: 'MEMORIES', subtitle: 'Our photo collection', href: '/gallery', attachPoint: 0.25 },
    { id: 'letter', number: '02', label: 'THE LETTER', subtitle: 'Words from the heart', href: '/letter', attachPoint: 0.50 },
    { id: 'plans', number: '03', label: 'OUR PLANS', subtitle: 'The IKEA adventure', href: '/ikea', attachPoint: 0.75 },
]

/* Pull threshold to lock menu items into place */
const LOCK_THRESHOLD = 220
const THREAD_COLOR = '#C03030'

/* ═══════════════════════════════════════════════
   Generate organic thread path
   ═══════════════════════════════════════════════ */
function generateThreadPath(
    width: number,
    height: number,
    progress: number, // 0 = tangled, 1 = fully pulled
    handleX: number,
): string {
    const cy = height * 0.5
    const startX = 40
    const endX = Math.min(width - 40, startX + handleX)

    // How tangled the thread is (1 = very tangled, 0 = straight)
    const tangle = Math.max(0, 1 - progress * 1.4)

    // Control points for the main bezier — organic wobble decreases as thread straightens
    const amp = tangle * 80
    const freq = 3 + tangle * 2

    // Build a path with multiple cubic bezier segments for organic feel
    let d = `M ${startX} ${cy}`

    const segments = 6
    const segWidth = (endX - startX) / segments

    for (let i = 0; i < segments; i++) {
        const x0 = startX + i * segWidth
        const x1 = startX + (i + 1) * segWidth
        const mx = (x0 + x1) / 2

        // Alternating wobble with decreasing amplitude
        const wobble = amp * Math.sin((i + 0.5) * freq) * (1 - i / segments * 0.3)

        // Add some horizontal randomness to control points
        const cpOff = segWidth * 0.3 * (1 + tangle * 0.5)

        d += ` C ${x0 + cpOff} ${cy + wobble * 0.6}, ${mx} ${cy + wobble}, ${x1} ${cy - wobble * 0.2}`
    }

    return d
}

/* ═══════════════════════════════════════════════
   Small knot SVG at the drag handle
   ═══════════════════════════════════════════════ */
function ThreadKnot({ color }: { color: string }) {
    return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="pointer-events-none">
            <circle cx="14" cy="14" r="6" stroke={color} strokeWidth="2" fill="none" opacity="0.7" />
            <circle cx="14" cy="14" r="2.5" fill={color} opacity="0.5" />
            {/* Small loops */}
            <path d="M8 14 Q6 8 14 8" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4" />
            <path d="M20 14 Q22 20 14 20" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4" />
        </svg>
    )
}

/* ═══════════════════════════════════════════════
   AkaiIto — Red Thread of Fate Component
   ═══════════════════════════════════════════════ */
export default function AkaiIto() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
    const [isLocked, setIsLocked] = useState(false)
    const [hasInteracted, setHasInteracted] = useState(false)

    // Raw drag value
    const dragX = useMotionValue(0)

    // Spring-damped version for smooth physics
    const springX = useSpring(dragX, {
        stiffness: 300,
        damping: 20,
        mass: 0.8,
    })

    // Non-linear mapping: pulls get harder the further you go
    // Maps drag distance to "effective" distance with resistance
    const effectiveX = useTransform(springX, (v) => {
        if (v <= 0) return 0
        // Logarithmic resistance: first 200px are easy, then it gets harder
        const easy = Math.min(v, 200)
        const hard = Math.max(0, v - 200) * 0.4
        return easy + hard
    })

    // Progress 0→1 based on effective distance
    const progress = useTransform(effectiveX, [0, LOCK_THRESHOLD], [0, 1])

    // Thread path as motion value
    const [threadPath, setThreadPath] = useState('')

    // Menu item controls
    const menuControls = useAnimationControls()

    // Measure container
    useEffect(() => {
        const measure = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect()
                setDimensions({ width: rect.width, height: rect.height })
            }
        }
        measure()
        window.addEventListener('resize', measure)
        return () => window.removeEventListener('resize', measure)
    }, [])

    // Update thread path reactively
    useEffect(() => {
        const unsubProgress = progress.on('change', (p) => {
            const unsubEffX = effectiveX.get()
            setThreadPath(generateThreadPath(dimensions.width, dimensions.height, p, unsubEffX))
        })

        // Initial path
        setThreadPath(generateThreadPath(dimensions.width, dimensions.height, 0, 0))

        return () => unsubProgress()
    }, [dimensions, progress, effectiveX])

    // Lock detection
    useEffect(() => {
        const unsubEffX = effectiveX.on('change', (v) => {
            if (v >= LOCK_THRESHOLD && !isLocked) {
                setIsLocked(true)
                menuControls.start('visible')
            }
        })
        return () => unsubEffX()
    }, [effectiveX, isLocked, menuControls])

    const handleDragStart = useCallback(() => {
        if (!hasInteracted) setHasInteracted(true)
    }, [hasInteracted])

    // Thread stroke animation
    const threadStrokeDasharray = useTransform(progress, [0, 1], ['8 4', '1000 0'])
    const threadOpacity = useTransform(progress, [0, 0.3, 1], [0.5, 0.7, 0.85])

    return (
        <div
            ref={containerRef}
            className="relative w-full min-h-screen overflow-hidden select-none"
            style={{ backgroundColor: '#F5F0E8' }}
        >
            {/* ── Paper grain ── */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.04] z-[1]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px',
                }}
            />

            {/* ── Header ── */}
            <div className="absolute top-10 sm:top-14 left-0 right-0 z-20 text-center">
                <motion.p
                    className="font-mono text-[10px] tracking-[0.5em] uppercase text-ink/20 mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Valentine 2026
                </motion.p>
                <motion.h1
                    className="font-serif text-xl sm:text-2xl text-ink/40 italic font-light"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    For Oyen
                </motion.h1>
            </div>

            {/* ── SVG Thread ── */}
            <svg
                className="absolute inset-0 z-10 pointer-events-none"
                width={dimensions.width}
                height={dimensions.height}
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            >
                {/* Thread shadow */}
                <motion.path
                    d={threadPath}
                    fill="none"
                    stroke="rgba(0,0,0,0.06)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    style={{
                        translateY: 3,
                        translateX: 2,
                    }}
                />
                {/* Main thread */}
                <motion.path
                    d={threadPath}
                    fill="none"
                    stroke={THREAD_COLOR}
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{
                        opacity: threadOpacity,
                        strokeDasharray: threadStrokeDasharray,
                    }}
                />
                {/* Thread highlight for texture */}
                <motion.path
                    d={threadPath}
                    fill="none"
                    stroke="rgba(255,200,200,0.15)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    style={{
                        translateY: -0.5,
                    }}
                />
            </svg>

            {/* ── Drag Handle (Thread Knot) ── */}
            <AnimatePresence>
                {!isLocked && (
                    <motion.div
                        className="absolute z-30 cursor-grab active:cursor-grabbing touch-none"
                        style={{
                            top: '50%',
                            left: 40,
                            x: springX,
                            y: '-50%',
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: dimensions.width - 100 }}
                        dragElastic={0.1}
                        dragMomentum={false}
                        onDragStart={handleDragStart}
                        onDrag={(_, info) => {
                            dragX.set(info.offset.x)
                        }}
                        onDragEnd={() => {
                            if (effectiveX.get() < LOCK_THRESHOLD) {
                                // Snap back
                                dragX.set(0)
                            }
                        }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ThreadKnot color={THREAD_COLOR} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Pull hint ── */}
            <AnimatePresence>
                {!hasInteracted && (
                    <motion.div
                        className="absolute z-20 left-20 sm:left-24"
                        style={{ top: '50%', y: 24 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, x: [0, 12, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{
                            opacity: { delay: 1, duration: 0.6 },
                            x: { delay: 1.5, duration: 1.4, repeat: Infinity, repeatDelay: 1 },
                        }}
                    >
                        <p className="font-hand text-sm text-ink/25 whitespace-nowrap">
                            Pull the thread →
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Menu Items (revealed by thread pull) ── */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
                <div className="w-full max-w-2xl px-6 sm:px-8 space-y-1">
                    {ITEMS.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial="hidden"
                            animate={isLocked ? 'visible' : 'hidden'}
                            variants={{
                                hidden: {
                                    opacity: 0,
                                    x: index % 2 === 0 ? -60 : 60,
                                    filter: 'blur(8px)',
                                },
                                visible: {
                                    opacity: 1,
                                    x: 0,
                                    filter: 'blur(0px)',
                                    transition: {
                                        delay: index * 0.12,
                                        duration: 0.6,
                                        ease: [0.22, 1, 0.36, 1],
                                    },
                                },
                            }}
                            style={{ pointerEvents: isLocked ? 'auto' : 'none' }}
                        >
                            <Link
                                href={item.href}
                                className="group relative block py-5 sm:py-7 border-t border-ink/8 transition-all duration-300"
                            >
                                {/* Thread attachment dot */}
                                <div
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-2 h-2 rounded-full"
                                    style={{ backgroundColor: THREAD_COLOR, opacity: 0.4 }}
                                />

                                <div className="flex items-center justify-between ml-3">
                                    <div className="flex items-baseline gap-4 sm:gap-6">
                                        <span className="font-mono text-xs text-ink/20 tabular-nums">
                                            {item.number}
                                        </span>
                                        <span className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-ink/80 group-hover:text-ink transition-colors duration-300">
                                            {item.label}
                                        </span>
                                    </div>

                                    <div className="hidden sm:flex items-center gap-3">
                                        <span className="font-hand text-sm text-ink/30 group-hover:text-ink/50 transition-colors duration-300">
                                            {item.subtitle}
                                        </span>
                                        <ArrowUpRight className="w-4 h-4 text-ink/20 group-hover:text-ink/50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                                    </div>
                                </div>

                                <p className="sm:hidden font-hand text-xs text-ink/25 mt-1 ml-10">
                                    {item.subtitle}
                                </p>
                            </Link>
                        </motion.div>
                    ))}

                    {/* Bottom border for last item */}
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={isLocked ? { scaleX: 1 } : { scaleX: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="h-px bg-ink/8 origin-left"
                    />
                </div>
            </div>

            {/* ── Footer ── */}
            <motion.footer
                className="absolute bottom-8 sm:bottom-12 left-0 right-0 z-20 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLocked ? 1 : 0.3 }}
                transition={{ delay: isLocked ? 0.7 : 0, duration: 0.5 }}
            >
                <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-ink/15">
                    Curated for Oyen. Est. 2026.
                </p>
            </motion.footer>

            {/* ── Placeholder for string tension sound ── */}
            {/* 
              TODO: Add subtle audio feedback
              - On drag start: soft "string pluck" 
              - During drag: tension hum (pitch increases with distance)
              - On lock: satisfying "click" or "snap"
              Example: const audioRef = useRef(new Audio('/sounds/thread-tension.mp3'))
            */}
        </div>
    )
}

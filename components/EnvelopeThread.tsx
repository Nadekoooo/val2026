'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import {
    motion,
    useMotionValue,
    useTransform,
    useSpring,
    AnimatePresence,
} from 'framer-motion'

/* ═══════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════ */
const THREAD_COLOR = '#C03030'
const THREAD_HIGHLIGHT = '#E86060'
const UNWIND_THRESHOLD = 280 // drag px to fully unwind
const ENVELOPE_W = 320
const ENVELOPE_H = 220

/* ═══════════════════════════════════════════════
   Letter paragraphs — the apology
   ═══════════════════════════════════════════════ */
const LETTER_PARAGRAPHS = [
    'I know I haven\'t always been perfect. There have been moments when I\'ve let you down, times when my words fell short, and days when I could have tried harder.',
    'But every mistake has taught me something beautiful — how much you mean to me, and how lucky I am to have someone like you who sees the best in me even when I stumble.',
    'This little website is my way of saying I\'m grateful for the moments I wasn\'t there, and thank you for all the moments you were. You inspire me every day with your art and passion, your kindness, and the way you see beauty in imperfection. Jangan blg kamu jele lagiii.',
    'Just like these photos scattered across the page, our memories are beautifully imperfect, wonderfully chaotic, and absolutely precious.',
    'I love you more than words can express. Thanks for being my valentine love!',
    'Forever yours, Tian ♡',
]

/* ═══════════════════════════════════════════════
   Generate the winding thread path around washers
   ═══════════════════════════════════════════════ */
function generateWindingPath(envCx: number, envCy: number): string {
    // Two washer positions (left and right of envelope center)
    const wL = envCx - 50
    const wR = envCx + 50
    const wY = envCy + ENVELOPE_H / 2 - 18

    // Thread winds between left and right washers in figure-8 loops
    return [
        // Start from the right, dangling
        `M ${wR + 60} ${wY + 20}`,
        // Come into right washer
        `Q ${wR + 30} ${wY + 10}, ${wR + 8} ${wY}`,
        // Loop around right washer (clockwise)
        `A 10 10 0 1 1 ${wR - 8} ${wY}`,
        // Cross to left washer
        `Q ${envCx} ${wY - 20}, ${wL + 8} ${wY}`,
        // Loop around left washer (counter-clockwise)
        `A 10 10 0 1 0 ${wL - 8} ${wY}`,
        // Cross back to right, higher
        `Q ${envCx} ${wY - 35}, ${wR + 8} ${wY - 6}`,
        // Second loop around right
        `A 8 8 0 1 1 ${wR - 6} ${wY - 6}`,
        // Final cross back to left
        `Q ${envCx} ${wY - 45}, ${wL + 6} ${wY - 8}`,
        // Second loop around left
        `A 8 8 0 1 0 ${wL - 6} ${wY - 8}`,
        // Trail off to the left (the pull end)
        `Q ${wL - 30} ${wY - 15}, ${wL - 60} ${wY}`,
    ].join(' ')
}

/* ═══════════════════════════════════════════════
   Washer SVG component
   ═══════════════════════════════════════════════ */
function Washer({ cx, cy }: { cx: number; cy: number }) {
    return (
        <g>
            <circle cx={cx} cy={cy} r="10" fill="#B8A88A" stroke="#A09070" strokeWidth="1" />
            <circle cx={cx} cy={cy} r="4" fill="#1A1714" opacity="0.6" />
            <circle cx={cx} cy={cy} r="9" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        </g>
    )
}

/* ═══════════════════════════════════════════════
   Vintage Envelope SVG
   ═══════════════════════════════════════════════ */
function EnvelopeSvg({
    cx,
    cy,
    flapAngle,
}: {
    cx: number
    cy: number
    flapAngle: number
}) {
    const x = cx - ENVELOPE_W / 2
    const y = cy - ENVELOPE_H / 2
    const flapH = 80

    return (
        <g>
            {/* Envelope shadow */}
            <rect
                x={x + 4}
                y={y + 6}
                width={ENVELOPE_W}
                height={ENVELOPE_H}
                rx="6"
                fill="rgba(0,0,0,0.06)"
            />

            {/* Envelope body */}
            <rect
                x={x}
                y={y}
                width={ENVELOPE_W}
                height={ENVELOPE_H}
                rx="6"
                fill="#F0E4CF"
                stroke="#D4C5B0"
                strokeWidth="1"
            />

            {/* Inner lining pattern */}
            <rect
                x={x + 8}
                y={y + 8}
                width={ENVELOPE_W - 16}
                height={ENVELOPE_H - 16}
                rx="2"
                fill="none"
                stroke="#E8D5B7"
                strokeWidth="0.5"
                strokeDasharray="4 3"
            />

            {/* Ruled lines inside */}
            {[0, 1, 2, 3].map((i) => (
                <line
                    key={i}
                    x1={x + 40}
                    y1={y + 70 + i * 22}
                    x2={x + ENVELOPE_W - 40}
                    y2={y + 70 + i * 22}
                    stroke="#3E3C3C"
                    strokeWidth="0.5"
                    strokeOpacity="0.08"
                />
            ))}

            {/* Flap — transforms via rotateX perspective */}
            <g
                style={{
                    transformOrigin: `${cx}px ${y}px`,
                    transform: `perspective(400px) rotateX(${flapAngle}deg)`,
                }}
            >
                <path
                    d={`M ${x} ${y} L ${cx} ${y + flapH} L ${x + ENVELOPE_W} ${y} Z`}
                    fill={flapAngle > 90 ? '#E8D5B7' : '#F0E4CF'}
                    stroke="#D4C5B0"
                    strokeWidth="1"
                    strokeLinejoin="round"
                />
                {/* Flap shadow line */}
                <path
                    d={`M ${x + 20} ${y + 2} L ${cx} ${y + flapH - 10} L ${x + ENVELOPE_W - 20} ${y + 2}`}
                    fill="none"
                    stroke="#D4C5B0"
                    strokeWidth="0.5"
                    strokeOpacity="0.4"
                />
            </g>

            {/* Washers at the bottom */}
            <Washer cx={cx - 50} cy={cy + ENVELOPE_H / 2 - 18} />
            <Washer cx={cx + 50} cy={cy + ENVELOPE_H / 2 - 18} />
        </g>
    )
}

/* ═══════════════════════════════════════════════
   Thread Knot (drag handle)
   ═══════════════════════════════════════════════ */
function ThreadKnot() {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="pointer-events-none">
            <circle cx="16" cy="16" r="7" stroke={THREAD_COLOR} strokeWidth="2" fill="none" opacity="0.7" />
            <circle cx="16" cy="16" r="3" fill={THREAD_COLOR} opacity="0.5" />
            <path d="M9 16 Q7 10 16 9" stroke={THREAD_COLOR} strokeWidth="1.5" fill="none" opacity="0.35" />
            <path d="M23 16 Q25 22 16 23" stroke={THREAD_COLOR} strokeWidth="1.5" fill="none" opacity="0.35" />
        </svg>
    )
}

/* ═══════════════════════════════════════════════
   MAIN: Envelope Thread Component
   ═══════════════════════════════════════════════ */
export default function EnvelopeThread() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [dims, setDims] = useState({ w: 800, h: 700 })
    const [phase, setPhase] = useState<'wrapped' | 'unwound' | 'opened' | 'letter'>('wrapped')
    const [hasInteracted, setHasInteracted] = useState(false)

    // Envelope center
    const envCx = dims.w / 2
    const envCy = dims.h * 0.38

    // Drag state
    const dragX = useMotionValue(0)
    const springX = useSpring(dragX, { stiffness: 300, damping: 22, mass: 0.8 })

    // Non-linear resistance
    const effectiveX = useTransform(springX, (v) => {
        if (v <= 0) return 0
        const easy = Math.min(v, 180)
        const hard = Math.max(0, v - 180) * 0.35
        return easy + hard
    })

    // Progress 0→1
    const progress = useTransform(effectiveX, [0, UNWIND_THRESHOLD], [0, 1])

    // Thread dashoffset: full path length to 0 as thread unwinds
    const pathLength = 900
    const dashOffset = useTransform(progress, [0, 1], [0, pathLength])

    // Flap angle: 0° (closed) → 180° (fully open)
    const flapAngle = useTransform(progress, [0.7, 1], [0, 180])
    const flapAngleSmooth = useSpring(flapAngle, { stiffness: 80, damping: 15 })

    // Thread path
    const threadPath = useMemo(() => generateWindingPath(envCx, envCy), [envCx, envCy])

    // Measure container
    useEffect(() => {
        const measure = () => {
            if (containerRef.current) {
                const r = containerRef.current.getBoundingClientRect()
                setDims({ w: r.width, h: r.height })
            }
        }
        measure()
        window.addEventListener('resize', measure)
        return () => window.removeEventListener('resize', measure)
    }, [])

    // Phase transitions
    useEffect(() => {
        const unsub = progress.on('change', (p) => {
            if (p >= 1 && phase === 'wrapped') {
                setPhase('unwound')
                // Trigger envelope opening after a beat
                setTimeout(() => setPhase('opened'), 600)
                // Then show letter
                setTimeout(() => setPhase('letter'), 1400)
            }
        })
        return () => unsub()
    }, [progress, phase])

    // Knot starting position (right side of envelope)
    const knotStartX = envCx + ENVELOPE_W / 2 + 40
    const knotStartY = envCy + ENVELOPE_H / 2 - 18

    // Thread border opacity when letter is shown
    const showBorder = phase === 'letter'

    return (
        <div
            ref={containerRef}
            className="relative w-full min-h-screen overflow-hidden select-none"
            style={{ backgroundColor: '#F5F0E8' }}
        >
            {/* ── Paper grain ── */}
            <div
                className="absolute inset-0 pointer-events-none z-[1] opacity-[0.04]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px',
                }}
            />

            {/* ── Header ── */}
            <motion.div
                className="absolute top-8 sm:top-12 left-0 right-0 z-20 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
            >
                <p className="font-mono text-[10px] tracking-[0.5em] uppercase text-ink/20 mb-1.5">
                    Valentine 2026
                </p>
                <h1 className="font-serif text-xl sm:text-2xl text-ink/40 italic font-light">
                    Untuk Oyen
                </h1>
            </motion.div>

            {/* ═══ WRAPPED/UNWINDING PHASE ═══ */}
            <AnimatePresence>
                {(phase === 'wrapped' || phase === 'unwound') && (
                    <motion.div
                        className="absolute inset-0 z-10"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* SVG Canvas */}
                        <svg
                            className="absolute inset-0"
                            width={dims.w}
                            height={dims.h}
                            viewBox={`0 0 ${dims.w} ${dims.h}`}
                        >
                            {/* Envelope */}
                            <EnvelopeSvg cx={envCx} cy={envCy} flapAngle={flapAngleSmooth.get()} />

                            {/* Thread shadow */}
                            <motion.path
                                d={threadPath}
                                fill="none"
                                stroke="rgba(0,0,0,0.08)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                pathLength={pathLength}
                                style={{
                                    strokeDasharray: pathLength,
                                    strokeDashoffset: dashOffset,
                                    translateY: 2,
                                    translateX: 1,
                                }}
                            />

                            {/* Main thread */}
                            <motion.path
                                d={threadPath}
                                fill="none"
                                stroke={THREAD_COLOR}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                pathLength={pathLength}
                                style={{
                                    strokeDasharray: pathLength,
                                    strokeDashoffset: dashOffset,
                                }}
                            />

                            {/* Thread highlight */}
                            <motion.path
                                d={threadPath}
                                fill="none"
                                stroke={THREAD_HIGHLIGHT}
                                strokeWidth="1"
                                strokeLinecap="round"
                                opacity="0.2"
                                pathLength={pathLength}
                                style={{
                                    strokeDasharray: pathLength,
                                    strokeDashoffset: dashOffset,
                                    translateY: -0.5,
                                }}
                            />
                        </svg>

                        {/* Drag handle (knot) */}
                        {phase === 'wrapped' && (
                            <motion.div
                                className="absolute z-30 cursor-grab active:cursor-grabbing touch-none"
                                style={{
                                    left: knotStartX - 16,
                                    top: knotStartY - 16,
                                    x: springX,
                                }}
                                drag="x"
                                dragConstraints={{ left: 0, right: dims.w - knotStartX }}
                                dragElastic={0.08}
                                dragMomentum={false}
                                onDragStart={() => {
                                    if (!hasInteracted) setHasInteracted(true)
                                }}
                                onDrag={(_, info) => dragX.set(info.offset.x)}
                                onDragEnd={() => {
                                    if (effectiveX.get() < UNWIND_THRESHOLD) {
                                        dragX.set(0) // snap back
                                    }
                                }}
                            >
                                <ThreadKnot />
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Pull hint ── */}
            <AnimatePresence>
                {!hasInteracted && phase === 'wrapped' && (
                    <motion.div
                        className="absolute z-20"
                        style={{
                            left: knotStartX + 24,
                            top: knotStartY - 8,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, x: [0, 10, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{
                            opacity: { delay: 1.2, duration: 0.5 },
                            x: { delay: 1.8, duration: 1.2, repeat: Infinity, repeatDelay: 1 },
                        }}
                    >
                        <p className="font-hand text-sm text-ink/30 whitespace-nowrap">
                            Tarik benang merahnya →
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ DECORATIVE THREAD BORDER (after letter reveal) ═══ */}
            <AnimatePresence>
                {showBorder && (
                    <motion.div
                        className="fixed inset-0 z-[5] pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2 }}
                    >
                        <svg width="100%" height="100%" className="absolute inset-0">
                            {/* Left border thread */}
                            <motion.path
                                d={`M 20 0 Q 15 ${dims.h * 0.25} 22 ${dims.h * 0.5} Q 18 ${dims.h * 0.75} 20 ${dims.h}`}
                                fill="none"
                                stroke={THREAD_COLOR}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, ease: 'easeOut' }}
                                opacity="0.2"
                            />
                            {/* Right border thread */}
                            <motion.path
                                d={`M ${dims.w - 20} 0 Q ${dims.w - 15} ${dims.h * 0.3} ${dims.w - 22} ${dims.h * 0.55} Q ${dims.w - 18} ${dims.h * 0.8} ${dims.w - 20} ${dims.h}`}
                                fill="none"
                                stroke={THREAD_COLOR}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, ease: 'easeOut', delay: 0.3 }}
                                opacity="0.15"
                            />
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ LETTER CONTENT (slides out from envelope) ═══ */}
            <AnimatePresence>
                {phase === 'letter' && (
                    <motion.div
                        className="absolute inset-0 z-20 flex items-start justify-center overflow-y-auto overscroll-contain pb-28"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.div
                            className="relative w-full max-w-lg mx-6 mt-24 sm:mt-32"
                            initial={{ y: 60, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                type: 'spring',
                                stiffness: 100,
                                damping: 18,
                                delay: 0.2,
                            }}
                        >
                            {/* Letter paper */}
                            <div
                                className="relative rounded-md px-8 py-10 sm:px-12 sm:py-14"
                                style={{
                                    backgroundColor: '#FDF8F4',
                                    boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
                                }}
                            >
                                {/* Ruled lines */}
                                <div
                                    className="absolute inset-0 pointer-events-none opacity-10 rounded-md overflow-hidden"
                                    style={{
                                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #E29578 31px, #E29578 32px)',
                                        backgroundSize: '100% 32px',
                                        backgroundPosition: '0 56px',
                                    }}
                                />

                                {/* Red margin line */}
                                <div className="absolute top-0 bottom-0 left-10 sm:left-14 w-[1px] bg-rose/10 pointer-events-none" />

                                {/* Date */}
                                <motion.p
                                    className="font-hand text-right text-sm text-ink/30 mb-8"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    February 14th, 2026
                                </motion.p>

                                {/* Paragraphs with staggered typewriter */}
                                <div className="space-y-5">
                                    {LETTER_PARAGRAPHS.map((para, pIdx) => (
                                        <motion.div
                                            key={pIdx}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{
                                                delay: 0.8 + pIdx * 0.55,
                                                duration: 0.5,
                                            }}
                                        >
                                            <p
                                                className={`font-hand leading-[1.9] ${pIdx === 0
                                                        ? 'text-2xl sm:text-3xl text-ink mb-2'
                                                        : pIdx === LETTER_PARAGRAPHS.length - 1
                                                            ? 'text-xl sm:text-2xl text-ink/60 italic mt-8'
                                                            : pIdx === LETTER_PARAGRAPHS.length - 2
                                                                ? 'text-base sm:text-lg text-ink/45 italic'
                                                                : 'text-base sm:text-lg text-ink/70'
                                                    }`}
                                            >
                                                {/* Word-by-word stagger within each paragraph */}
                                                {para.split(' ').map((word, wIdx) => (
                                                    <motion.span
                                                        key={wIdx}
                                                        className="inline-block mr-[0.3em]"
                                                        initial={{ opacity: 0, y: 4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{
                                                            delay: 0.8 + pIdx * 0.55 + wIdx * 0.04,
                                                            duration: 0.25,
                                                        }}
                                                    >
                                                        {word}
                                                    </motion.span>
                                                ))}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Warm glow after all text is revealed */}
                                <motion.div
                                    className="absolute inset-0 rounded-md pointer-events-none"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 6, duration: 2 }}
                                    style={{
                                        boxShadow: 'inset 0 0 60px rgba(226,149,120,0.06)',
                                    }}
                                />
                            </div>

                            {/* Navigation links below letter */}
                            <motion.div
                                className="mt-10 flex flex-col items-center gap-4"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 7, duration: 0.6 }}
                            >
                                <div className="flex gap-4">
                                    <NavPill href="/gallery" label="Memories" />
                                    <NavPill href="/ikea" label="Our Plans" />
                                </div>
                                <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-ink/15 mt-4">
                                    Curated for Oyen. Est. 2026.
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Footer (during wrapped phase) ── */}
            <AnimatePresence>
                {phase === 'wrapped' && (
                    <motion.footer
                        className="absolute bottom-8 sm:bottom-12 left-0 right-0 z-20 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                    >
                        <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-ink/12">
                            Pull the thread to begin
                        </p>
                    </motion.footer>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ═══════════════════════════════════════════════
   Navigation Pill
   ═══════════════════════════════════════════════ */
function NavPill({ href, label }: { href: string; label: string }) {
    return (
        <a
            href={href}
            className="px-6 py-3 rounded-full font-hand text-base text-ink/60 hover:text-ink/90 transition-all duration-300"
            style={{
                background: 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(62,60,60,0.06)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}
        >
            {label}
        </a>
    )
}

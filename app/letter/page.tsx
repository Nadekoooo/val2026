'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'

/* ═══════════════════════════════════════════════
   Letter content — each string is one paragraph
   ═══════════════════════════════════════════════ */
const LETTER_PARAGRAPHS = [
    'Buat oyen bocil tercintaku,',
    'Aku tahu aku nggak selalu jadi orang yang sempurna buat kamu. Ada banyak hal yang harusnya aku bilang tapi nggak pernah aku sampein, dan ada hal-hal yang aku lakuin yang bikin kamu sedih.',
    'Aku menyesal kalau aku pernah bikin kamu ngerasa nggak cukup, atau nggak dihargain. Kamu lebih dari cukup — kamu luar biasa. Dan aku bodoh kalau sampai bikin kamu lupa akan hal itu.',
    'Aku belajar pelan-pelan. Untuk lebih sabar, lebih dengerin, selalu ada di sisi bocil.',
    'Kamu adalah orang yang bikin hari-hariku punya warna. Yang bikin hal kecil jadi berarti. Yang bikin aku pengen jadi versi terbaik dari diriku.',
    'Kemarin, karena beberapa alasan, aku sangat sensitif dan aku salah menangkep maksud kamu.',
    'Aku jadi takut banget usahaku yang sekarang bakal dianggap engga cukup. Makanya aku jadi defensif dan aku sesaat itu sedi kukira plan aku gagal.',
    'Aku juga gamau kamu ngerasa digurui lagi, kemarin aku ceramahin kamu panjangg. Aku minta maaf.',

    'Aku cuma pengen banget Valentine ini berhasil dan bikin kamu happy, saking pengennya aku jadi overthinking.',
    'Jadi ini janjiku, aku akan terus berusaha. Emang engga sempurna, tapi aku tulus ouen. Nggak selalu bener, tapi aku selalu disini buat kamu.',
    'Dengan seluruh hatiku,\nDari aku yang selalu sayang kamu ♡',
]

/* ═══════════════════════════════════════════════
   The Quiet Room
   ═══════════════════════════════════════════════ */
export default function LetterPage() {
    const [phase, setPhase] = useState<'sealed' | 'opening' | 'reading' | 'accepted'>('sealed')
    const [holdProgress, setHoldProgress] = useState(0)
    const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const holdStartRef = useRef<number>(0)
    const HOLD_DURATION = 2000 // ms

    // ── Long press handlers ──
    const startHold = useCallback(() => {
        if (phase !== 'sealed') return
        holdStartRef.current = Date.now()
        setPhase('opening')

        holdTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - holdStartRef.current
            const progress = Math.min(elapsed / HOLD_DURATION, 1)
            setHoldProgress(progress)

            if (progress >= 1) {
                if (holdTimerRef.current) clearInterval(holdTimerRef.current)
                setPhase('reading')
                setHoldProgress(0)
            }
        }, 30)
    }, [phase])

    const cancelHold = useCallback(() => {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current)
        if (phase === 'opening') {
            setPhase('sealed')
            setHoldProgress(0)
        }
    }, [phase])

    useEffect(() => {
        return () => {
            if (holdTimerRef.current) clearInterval(holdTimerRef.current)
        }
    }, [])

    const handleAccept = useCallback(() => {
        setPhase('accepted')
    }, [])

    // Background color transitions by phase
    const bgColor = phase === 'accepted' ? '#3D3530' : '#2A2420'

    return (
        <div
            className="fixed inset-0 z-20 overflow-hidden transition-colors duration-[2000ms]"
            style={{ backgroundColor: bgColor }}
        >
            {/* ── Spotlight radial gradient ── */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-[2000ms]"
                style={{
                    background: phase === 'accepted'
                        ? 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(212,163,115,0.18) 0%, transparent 70%)'
                        : 'radial-gradient(ellipse 50% 40% at 50% 45%, rgba(212,163,115,0.10) 0%, transparent 70%)',
                }}
            />

            {/* ── Paper texture overlay (very subtle on dark bg) ── */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKvSURBVGiB7ZrNThRBEMd/PbMLKgQSE01MvHn05sEX8AGMz+Cj+AJ68ODBixc/LhITDRpRQBdk2d0Zh+rZ3p6e3tlZd2Y28E8mO91dXfWfrqrunlkJIUBC7wZ0DYVI1DYBN2ECbBFqFbhE4DTwBDgPDAin1h7wNlABtoGfsQqxR0SAGjFKYP+j1cOhEfuKbKVNoBozCpFqUzLaWJvAtQl8jwJ7Z7CHzl/SAU4D3wEDVNPmgb6ARO025g5/MHT/q7ZJXGBkS8QuQmyBtNrr3h/xDxG5YYroMkm6MdfK4wQu8Kp6iviDvA+cH4GuINYh4g9kLabPpbgC6DQyDf8AWqG3oP2TkW2IuIScR+QRsSKiPXWgeeIrYhYhcjbJmKViNyLYgfAQ+A6sA+cJVRWvSReAF4DdwjVmjvA68B3YBO4ifSzJsDBiBO4iJD5GjGz8WiEbiK+IG4j5xBrgQsREfiEOBF4RjpA7C/yJ/AXcBTlXWsXuErsY+5i7ILsR/kPsQ+4hViLpLxJbJfvjHO8HgjnJDwG3gZeAtfQnfbR4GngauI08AtwjN+Xie3AEvIvKxHvAMeDrwxLjBiAvATeARcBT4QKhX5G1gDuAd4C5gA7gEfIp0Y9kFfEDsEHiK2AFwB3GWMHd8HnGUaF5E5gD5FxA7iK+AIuYXYI3KMfE/t+bYQcxCrgbuQ6IevEDuI3YYF4n94QqxjEbcRLhBWIVCEJ1vUF4IXuA74E9kM5bVH6L8G/gSuIJKxdiEeIdIvcJcwm3CV4HLkHsLfQ8/0rXDLyLSA3A8+J+Av4B9gD0Y+YIv7A0/Ef8Re4CjxM80bA2+IN4iNijcgVxC5gnnCT2c7cJ3g+Ah4C/gZ2S32I7hMvAS+AsR8RP8A/mT/z+Af0UPW0bk5BQAAAABJRU5ErkJggg==")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '100px 100px',
                }}
            />

            {/* ── Content container ── */}
            <div className="relative z-10 flex items-center justify-center w-full h-full">
                <AnimatePresence mode="wait">
                    {/* ════ PHASE 1: SEALED ENVELOPE ════ */}
                    {(phase === 'sealed' || phase === 'opening') && (
                        <motion.div
                            key="envelope"
                            className="flex flex-col items-center gap-6 select-none"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30, scale: 0.9 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* The envelope */}
                            <motion.button
                                className="relative w-56 h-40 sm:w-72 sm:h-48 cursor-pointer focus:outline-none"
                                onPointerDown={startHold}
                                onPointerUp={cancelHold}
                                onPointerLeave={cancelHold}
                                onContextMenu={(e) => e.preventDefault()}
                                animate={
                                    phase === 'opening'
                                        ? {
                                            rotate: [-0.5, 0.5, -0.8, 0.3, -0.5],
                                            scale: [1, 1.01, 0.995, 1.01, 1],
                                        }
                                        : {}
                                }
                                transition={
                                    phase === 'opening'
                                        ? { duration: 0.3, repeat: Infinity, ease: 'easeInOut' }
                                        : {}
                                }
                            >
                                {/* Envelope body */}
                                <div
                                    className="absolute inset-0 rounded-md"
                                    style={{
                                        background: 'linear-gradient(145deg, #E8DDD0 0%, #D8CCBC 100%)',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)',
                                    }}
                                />

                                {/* Envelope flap */}
                                <div
                                    className="absolute top-0 left-0 right-0 h-1/2"
                                    style={{
                                        background: 'linear-gradient(180deg, #D8CCBC 0%, #CBBFAF 100%)',
                                        clipPath: 'polygon(0 0, 50% 70%, 100% 0)',
                                        borderRadius: '6px 6px 0 0',
                                    }}
                                />

                                {/* Wax seal */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{
                                        background: 'radial-gradient(circle at 40% 35%, #C4776C 0%, #A85A50 60%, #8B4540 100%)',
                                        boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.2), 0 2px 6px rgba(0,0,0,0.3)',
                                    }}
                                >
                                    <Heart className="w-4 h-4 text-white/60" />
                                </div>

                                {/* Hold progress ring */}
                                {phase === 'opening' && (
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                                        <circle
                                            cx="50" cy="50" r="46"
                                            fill="none"
                                            stroke="rgba(212,163,115,0.3)"
                                            strokeWidth="1"
                                            strokeDasharray={`${holdProgress * 289} 289`}
                                            strokeLinecap="round"
                                            transform="rotate(-90 50 50)"
                                            className="transition-all duration-75"
                                        />
                                    </svg>
                                )}
                            </motion.button>

                            {/* Label */}
                            <motion.p
                                className="font-hand text-xl sm:text-2xl text-white/40"
                                animate={phase === 'opening' ? { opacity: [0.4, 0.7, 0.4] } : {}}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                Untuk Oyen
                            </motion.p>

                            {/* Instruction */}
                            <p className="font-hand text-sm text-white/20">
                                {phase === 'opening' ? 'Tahan terus…' : 'Tekan dan tahan untuk membuka'}
                            </p>
                        </motion.div>
                    )}

                    {/* ════ PHASE 2 & 3: LETTER CONTENT ════ */}
                    {(phase === 'reading' || phase === 'accepted') && (
                        <motion.div
                            key="letter"
                            className="relative w-full max-w-xl mx-auto px-6 h-full overflow-y-auto no-scrollbar"
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Paper sheet */}
                            <div
                                className="relative my-8 sm:my-16 p-6 sm:p-10 rounded-sm transition-shadow duration-[2000ms]"
                                style={{
                                    backgroundColor: '#F5F0E8',
                                    boxShadow: phase === 'accepted'
                                        ? '0 0 60px rgba(212,163,115,0.20), 0 8px 32px rgba(0,0,0,0.15)'
                                        : '0 8px 32px rgba(0,0,0,0.25)',
                                }}
                            >
                                {/* Paper lines */}
                                <div
                                    className="absolute inset-0 pointer-events-none opacity-[0.06]"
                                    style={{
                                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(62,60,60,1) 31px, rgba(62,60,60,1) 32px)',
                                        backgroundPosition: '0 12px',
                                    }}
                                />

                                {/* Red margin line */}
                                <div
                                    className="absolute top-0 bottom-0 left-12 sm:left-16 w-px opacity-[0.12]"
                                    style={{ backgroundColor: '#C4776C' }}
                                />

                                {/* Letter content — typewriter reveal */}
                                <div className="relative z-10 pl-4 sm:pl-6 space-y-6">
                                    {LETTER_PARAGRAPHS.map((text, i) => (
                                        <TypewriterParagraph
                                            key={i}
                                            text={text}
                                            delay={i * 1.8 + 0.5}
                                            isFirstParagraph={i === 0}
                                            isLastParagraph={i === LETTER_PARAGRAPHS.length - 1}
                                        />
                                    ))}

                                    {/* ═══ PHASE 3: Accept button ═══ */}
                                    <motion.div
                                        className="flex justify-center pt-4 pb-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: LETTER_PARAGRAPHS.length * 1.8 + 1.5,
                                            duration: 0.6,
                                        }}
                                    >
                                        {phase === 'reading' ? (
                                            <button
                                                onClick={handleAccept}
                                                className="group flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                                                style={{
                                                    backgroundColor: 'rgba(212,163,115,0.15)',
                                                    border: '1px solid rgba(212,163,115,0.3)',
                                                }}
                                            >
                                                <Heart className="w-4 h-4 text-accent group-hover:text-rose transition-colors" />
                                                <span className="font-hand text-base text-ink/60 group-hover:text-ink/80 transition-colors">
                                                    Aku sudah baca
                                                </span>
                                            </button>
                                        ) : (
                                            <motion.div
                                                className="flex flex-col items-center gap-2"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ type: 'spring', damping: 15 }}
                                            >
                                                <motion.div
                                                    animate={{ scale: [1, 1.15, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                                >
                                                    <Heart className="w-8 h-8 text-rose fill-rose/30" />
                                                </motion.div>
                                                <p className="font-hand text-sm text-ink/35">Terima kasih, Oyen ♡</p>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </div>
                            </div>

                            {/* Fade-out mask at bottom for scroll hint */}
                            <div className="sticky bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-[#2A2420]/80 to-transparent" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════
   Typewriter Paragraph — word-by-word reveal
   ═══════════════════════════════════════════════ */
function TypewriterParagraph({
    text,
    delay,
    isFirstParagraph,
    isLastParagraph,
}: {
    text: string
    delay: number
    isFirstParagraph: boolean
    isLastParagraph: boolean
}) {
    const words = text.split(' ')

    return (
        <motion.p
            className={`
        font-hand leading-[2] whitespace-pre-line
        ${isFirstParagraph ? 'text-lg sm:text-xl text-ink/70 italic' : ''}
        ${isLastParagraph ? 'text-base sm:text-lg text-ink/55 mt-8 text-right' : ''}
        ${!isFirstParagraph && !isLastParagraph ? 'text-base sm:text-lg text-ink/65' : ''}
      `}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: 0.06,
                        delayChildren: delay,
                    },
                },
            }}
        >
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    className="inline-block mr-[0.3em]"
                    variants={{
                        hidden: { opacity: 0, y: 6, filter: 'blur(2px)' },
                        visible: {
                            opacity: 1,
                            y: 0,
                            filter: 'blur(0px)',
                            transition: { duration: 0.35, ease: 'easeOut' },
                        },
                    }}
                >
                    {word}
                </motion.span>
            ))}
        </motion.p>
    )
}

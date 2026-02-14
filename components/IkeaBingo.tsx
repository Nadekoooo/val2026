'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Camera } from 'lucide-react'
import { resizeImageToBase64 } from '@/utils/imageProcessor'
import { ref, onValue, set, update } from 'firebase/database'
import { db } from '@/lib/firebase'

/* ═══════════════════════════════════════════════
   Types & Data
   ═══════════════════════════════════════════════ */
interface BingoTile {
    id: string
    label: string
    photo: string | null
    rotation: number
}

interface Prize {
    title: string
    emoji: string
    description: string
    code: string
}

interface FirebaseState {
    tiles: BingoTile[] | Record<string, unknown>
    claimedMilestones: number
    hasClaimedGrandPrize: boolean
    hasShownReward: boolean
}

const SESSION_PATH = 'bingo/session_oyen_tian'

const tileLabels = [
    'Barang Paling\nGak Guna',
    'Spot Bengong\nTerbaik',
    'Selfie di\nCermin Bunder',
    'Warna\nFavorit Kamu',
    'Boneka\nHiu / Dino',
    'Simulasi Rumah\nMasa Depan',
    'Lampu Tidur\nEstetik',
    'Tanaman\nPlastik',
    'Meatballs /\nIce Cream',
]

const SMALL_PRIZES: Prize[] = [
    {
        title: 'Free Pat-pat',
        emoji: '👋',
        description: 'Unlimited duration',
        code: 'PAT-2026',
    },
    {
        title: 'Free Peyuk',
        emoji: '🫂',
        description: 'Recharge energy',
        code: 'HUG-2026',
    },
    {
        title: 'Kupon Cubit Pipi/Perut',
        emoji: '🤏',
        description: 'Gemes pass',
        code: 'PINCH-2026',
    },
    {
        title: 'Traktir Eskrim',
        emoji: '🍦',
        description: 'Sesuai request',
        code: 'MATCHA-2026',
    },
]

const GRAND_PRIZE: Prize = {
    title: 'Tium Jidat oyen',
    emoji: '😘',
    description: 'The Holy Grail Reward',
    code: 'GRAND-2026',
}

function createInitialGrid(): BingoTile[] {
    return tileLabels.map((label, i) => ({
        id: `tile-${i}`,
        label,
        photo: null,
        rotation: Math.round(Math.random() * 8 - 4),
    }))
}

/* ═══════════════════════════════════════════════
   Sanitizer — the core fix for sparse-object bug
   ═══════════════════════════════════════════════

   Firebase RTDB converts arrays with null/missing
   holes into plain objects: {"0": {...}, "2": {...}}.
   This helper normalizes ANY shape back to BingoTile[9].
*/
function sanitizeTiles(raw: unknown): BingoTile[] {
    const fallback = createInitialGrid()

    if (!raw || typeof raw !== 'object') return fallback

    // Convert object → array if Firebase returned a sparse object
    let asArray: unknown[]
    if (Array.isArray(raw)) {
        asArray = raw
    } else {
        // It's a Record<string, unknown> — keys are "0","1",…
        const keys = Object.keys(raw as Record<string, unknown>)
        // Sort numerically to maintain correct tile order
        keys.sort((a, b) => Number(a) - Number(b))
        // Build a full 9-slot array, filling gaps with null
        asArray = new Array(9).fill(null)
        for (const k of keys) {
            const idx = Number(k)
            if (idx >= 0 && idx < 9) {
                asArray[idx] = (raw as Record<string, unknown>)[k]
            }
        }
    }

    // Must have exactly 9 items
    if (asArray.length !== 9) return fallback

    return asArray.map((item, i) => {
        if (!item || typeof item !== 'object') return fallback[i]
        const obj = item as Record<string, unknown>
        return {
            id: typeof obj.id === 'string' ? obj.id : `tile-${i}`,
            label: typeof obj.label === 'string' ? obj.label : tileLabels[i],
            photo: typeof obj.photo === 'string' ? obj.photo : null,
            rotation: typeof obj.rotation === 'number' ? obj.rotation : fallback[i].rotation,
        }
    })
}

/* Win Detection */
const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
]

function findWinningLines(tiles: BingoTile[]): number[][] {
    if (!tiles || tiles.length !== 9) return []
    return LINES.filter((line) => line.every((i) => tiles[i]?.photo !== null))
}

/* ═══════════════════════════════════════════════
   Exported Bingo Component
   ═══════════════════════════════════════════════ */
export default function IkeaBingo() {
    const [tiles, setTiles] = useState<BingoTile[]>(() => createInitialGrid())
    const [loaded, setLoaded] = useState(false)
    const [winningLines, setWinningLines] = useState<number[][]>([])
    const [showReward, setShowReward] = useState(false)
    const [currentReward, setCurrentReward] = useState<Prize | null>(null)
    const [claimedMilestones, setClaimedMilestones] = useState(0)
    const [hasClaimedGrandPrize, setHasClaimedGrandPrize] = useState(false)
    const [hasShownReward, setHasShownReward] = useState(false)

    // Refs to avoid stale closures in the onValue callback
    const isResetting = useRef(false)
    const prevWinningLineCount = useRef(0)

    // Firebase Real-time Sync
    useEffect(() => {
        const dbRef = ref(db, SESSION_PATH)

        const unsubscribe = onValue(dbRef, (snapshot) => {
            // Skip processing while a reset is in-flight
            if (isResetting.current) return

            const data = snapshot.val() as FirebaseState | null

            if (data === null || data === undefined) {
                // First-ever load: no data exists yet — seed Firebase
                const initialTiles = createInitialGrid()
                const initialState = {
                    tiles: initialTiles,
                    claimedMilestones: 0,
                    hasClaimedGrandPrize: false,
                    hasShownReward: false,
                }
                set(dbRef, initialState).catch(console.error)
                setTiles(initialTiles)
                setWinningLines([])
                setClaimedMilestones(0)
                setHasClaimedGrandPrize(false)
                setHasShownReward(false)
                prevWinningLineCount.current = 0
                setLoaded(true)
                return
            }

            // Sanitize tiles: handles sparse object, missing fields, etc.
            const safeTiles = sanitizeTiles(data.tiles)
            const lines = findWinningLines(safeTiles)
            const newClaimedMilestones = typeof data.claimedMilestones === 'number' ? data.claimedMilestones : 0
            const newHasClaimedGrandPrize = data.hasClaimedGrandPrize === true
            const newHasShownReward = data.hasShownReward === true

            // Update local state
            setTiles(safeTiles)
            setWinningLines(lines)
            setClaimedMilestones(newClaimedMilestones)
            setHasClaimedGrandPrize(newHasClaimedGrandPrize)
            setHasShownReward(newHasShownReward)

            // Track winning line count for next comparison
            prevWinningLineCount.current = lines.length
            setLoaded(true)
        })

        return () => unsubscribe()
    }, [])

    /* ─── Confetti helpers ─── */
    const showSmallPrizeConfetti = useCallback(() => {
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 }, colors: ['#E29578', '#D4A373', '#F9F5F1'] })
        setTimeout(() => confetti({ particleCount: 120, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#E29578', '#D4A373'] }), 200)
        setTimeout(() => confetti({ particleCount: 120, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#E29578', '#D4A373'] }), 350)
    }, [])

    const showGrandPrizeConfetti = useCallback(() => {
        const duration = 3000
        const animationEnd = Date.now() + duration
        const colors = ['#FFD700', '#E29578', '#D4A373', '#FF6B9D', '#F9F5F1']
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min
        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now()
            if (timeLeft <= 0) return clearInterval(interval)
            confetti({
                particleCount: 50 * (timeLeft / duration),
                startVelocity: 30,
                spread: 360,
                origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
                colors,
            })
        }, 250)
    }, [])

    /* ─── Photo Capture ─── */
    const handleCapture = useCallback(
        async (tileIndex: number, file: File) => {
            try {
                const base64 = await resizeImageToBase64(file, 300, 0.7)

                const dbRef = ref(db, SESSION_PATH)

                // Step 1: Write ONLY the photo to the specific tile path.
                // This is safe — no stale closure needed, we use the index directly.
                await update(dbRef, {
                    [`tiles/${tileIndex}/photo`]: base64,
                })

                // Step 2: After the write succeeds, read fresh state from DB
                // to determine prize logic — avoids the stale-closure bug entirely.
                const { get } = await import('firebase/database')
                const freshSnap = await get(dbRef)
                const freshData = freshSnap.val() as FirebaseState | null
                if (!freshData) return

                const freshTiles = sanitizeTiles(freshData.tiles)
                const freshLines = findWinningLines(freshTiles)
                const completedCount = freshTiles.filter((t) => t.photo !== null).length
                const freshMilestones = typeof freshData.claimedMilestones === 'number' ? freshData.claimedMilestones : 0
                const freshGrand = freshData.hasClaimedGrandPrize === true
                const freshShown = freshData.hasShownReward === true

                // Check for Full House (Grand Prize)
                if (completedCount === 9 && !freshGrand && !freshShown) {
                    await update(dbRef, {
                        hasClaimedGrandPrize: true,
                        hasShownReward: true,
                        claimedMilestones: freshMilestones >= SMALL_PRIZES.length ? freshMilestones : SMALL_PRIZES.length,
                    })
                    setTimeout(() => showGrandPrizeConfetti(), 300)
                    setTimeout(() => {
                        setCurrentReward(GRAND_PRIZE)
                        setShowReward(true)
                    }, 800)
                }
                // Check for new line completion (Small Prize)
                else if (
                    freshLines.length > prevWinningLineCount.current &&
                    freshMilestones < SMALL_PRIZES.length &&
                    !freshShown
                ) {
                    const prizeIndex = freshMilestones
                    const newMilestoneCount = freshMilestones + 1
                    await update(dbRef, {
                        claimedMilestones: newMilestoneCount,
                        hasShownReward: true,
                    })
                    setTimeout(() => showSmallPrizeConfetti(), 300)
                    setTimeout(() => {
                        setCurrentReward(SMALL_PRIZES[prizeIndex])
                        setShowReward(true)
                    }, 800)
                }
                // Just a regular capture — small confetti
                else {
                    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 }, colors: ['#E29578', '#D4A373'] })
                }
            } catch (err) {
                console.error('Image processing failed:', err)
            }
        },
        [showSmallPrizeConfetti, showGrandPrizeConfetti]
    )

    /* ─── Atomic Reset ─── */
    const resetGrid = useCallback(async () => {
        // Guard: prevent the onValue listener from racing us
        isResetting.current = true

        const dbRef = ref(db, SESSION_PATH)
        const initialState = {
            tiles: createInitialGrid(),
            claimedMilestones: 0,
            hasClaimedGrandPrize: false,
            hasShownReward: false,
        }

        try {
            // Atomic set — replaces the entire node in one write
            await set(dbRef, initialState)
        } catch (err) {
            console.error('Reset failed:', err)
        }

        // Apply locally immediately (the onValue will also fire, but the guard prevents double-processing)
        setTiles(initialState.tiles)
        setWinningLines([])
        setClaimedMilestones(0)
        setHasClaimedGrandPrize(false)
        setHasShownReward(false)
        setShowReward(false)
        setCurrentReward(null)
        prevWinningLineCount.current = 0

        // Re-enable the listener on next tick so the onValue callback from our own set() is skipped
        setTimeout(() => {
            isResetting.current = false
        }, 100)
    }, [])

    /* ─── Dismiss reward & clear the flag so future rewards can fire ─── */
    const dismissReward = useCallback(() => {
        setShowReward(false)
        // Clear hasShownReward in Firebase so the next milestone can trigger
        const dbRef = ref(db, SESSION_PATH)
        update(dbRef, { hasShownReward: false }).catch(console.error)
    }, [])

    /* ─── Derived UI state ─── */
    const completedCount = tiles.filter((t) => t.photo !== null).length
    const winningIndices = new Set(winningLines.flat())

    if (!loaded) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="font-hand text-lg text-ink/40 animate-pulse">Loading…</p>
            </div>
        )
    }

    // Safety net: if tiles is somehow not length 9, show loading
    if (!tiles || tiles.length !== 9) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="font-hand text-lg text-ink/40 animate-pulse">Recovering…</p>
            </div>
        )
    }

    return (
        <div>
            {/* Progress */}
            <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-hand text-sm text-ink/40">Snapped</span>
                <span className="font-hand text-base font-bold">{completedCount}/9</span>
            </div>

            {/* Grid container */}
            <div
                className="relative rounded-xl p-2.5 sm:p-3"
                style={{
                    backgroundColor: '#F3EDE4',
                    boxShadow: 'inset 0 1px 4px rgba(62,60,60,0.06), 0 2px 12px rgba(62,60,60,0.08)',
                }}
            >
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                    {tiles.map((tile, idx) => (
                        <JournalCell
                            key={tile.id}
                            tile={tile}
                            index={idx}
                            isWinning={winningIndices.has(idx)}
                            onCapture={handleCapture}
                        />
                    ))}
                </div>
            </div>

            {/* Bingo indicator */}
            <AnimatePresence>
                {winningLines.length > 0 && (
                    <motion.div
                        className="mt-4 text-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <p className="font-hand text-lg text-accent font-bold">
                            ★ BINGO — {winningLines.length} line{winningLines.length > 1 ? 's' : ''}! ★
                        </p>
                        <p className="mt-1 font-hand text-xs text-ink/45">
                            {claimedMilestones} prize{claimedMilestones !== 1 ? 's' : ''} unlocked{hasClaimedGrandPrize ? ' + Grand Prize!' : ''}
                        </p>
                        {claimedMilestones > 0 && (
                            <button
                                onClick={() => {
                                    const lastPrize = hasClaimedGrandPrize ? GRAND_PRIZE : SMALL_PRIZES[claimedMilestones - 1]
                                    setCurrentReward(lastPrize)
                                    setShowReward(true)
                                }}
                                className="mt-1 font-hand text-xs underline text-ink/35 hover:text-ink/60 transition-colors"
                            >
                                View latest reward
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reset */}
            <div className="mt-3 text-center">
                <button
                    onClick={resetGrid}
                    className="font-hand text-xs text-ink/20 hover:text-ink/45 transition-colors"
                >
                    ↻ Reset
                </button>
            </div>

            {/* Reward Modal */}
            <AnimatePresence>
                {showReward && currentReward && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute inset-0 bg-ink/50" onClick={dismissReward} />
                        <motion.div
                            className="relative z-10 w-full max-w-sm"
                            initial={{ scale: 0.85, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                        >
                            <div
                                className={`
                                    rounded-2xl p-8 text-center shadow-scrapbook-hover
                                    ${currentReward.code === GRAND_PRIZE.code
                                        ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 border-4 border-yellow-400'
                                        : 'bg-[#FDF8F4]'
                                    }
                                `}
                                style={{ transform: 'rotate(-1deg)' }}
                            >
                                <div className="absolute top-3 left-6 right-6 border-t-2 border-dashed border-ink/15" />
                                <p
                                    className={`
                                        font-hand text-sm mb-2 mt-2
                                        ${currentReward.code === GRAND_PRIZE.code
                                            ? 'text-yellow-600 font-bold text-base'
                                            : 'text-ink/35'
                                        }
                                    `}
                                >
                                    {currentReward.code === GRAND_PRIZE.code ? '✨ GRAND PRIZE UNLOCKED ✨' : '★ Reward Unlocked ★'}
                                </p>
                                <h2
                                    className={`
                                        font-hand text-ink leading-tight mb-3
                                        ${currentReward.code === GRAND_PRIZE.code
                                            ? 'text-4xl sm:text-5xl'
                                            : 'text-3xl'
                                        }
                                    `}
                                >
                                    {currentReward.emoji}
                                    <br />
                                    {currentReward.title}
                                </h2>
                                <div className="w-12 h-px bg-ink/15 mx-auto mb-3" />
                                <p className="font-hand text-lg text-rose/70 mb-5">{currentReward.description}</p>
                                <p className="font-hand text-xs text-ink/20 mb-5">Code: {currentReward.code}</p>
                                <button
                                    onClick={dismissReward}
                                    className={`
                                        w-full py-3 rounded-full font-hand text-lg transition-colors
                                        ${currentReward.code === GRAND_PRIZE.code
                                            ? 'bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 hover:from-yellow-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold'
                                            : 'bg-accent hover:bg-accent/90 text-white'
                                        }
                                    `}
                                >
                                    Claim ♡
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ═══════════════════════════════════════════════
   Journal Cell
   ═══════════════════════════════════════════════ */
function JournalCell({
    tile,
    index,
    isWinning,
    onCapture,
}: {
    tile: BingoTile
    index: number
    isWinning: boolean
    onCapture: (tileIndex: number, file: File) => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const isDone = tile.photo !== null

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) onCapture(index, file)
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div className="relative aspect-square">
            {!isDone && (
                <button
                    onClick={() => inputRef.current?.click()}
                    className={`
            w-full h-full rounded-lg flex flex-col items-center justify-center gap-1 p-1.5
            transition-all duration-200 cursor-pointer group
            ${isWinning ? 'ring-2 ring-accent ring-offset-2 ring-offset-[#F3EDE4]' : ''}
          `}
                    style={{ backgroundColor: '#EDE6D8', border: '2px dashed #D4A373' }}
                >
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-ink/15 group-hover:text-ink/30 transition-colors" />
                    <span className="font-hand text-[10px] sm:text-xs leading-tight text-center text-ink/45 group-hover:text-ink/65 whitespace-pre-line select-none transition-colors">
                        {tile.label}
                    </span>
                </button>
            )}

            {isDone && tile.photo && (
                <motion.div
                    className="w-full h-full relative"
                    initial={{ scale: 0, rotate: tile.rotation * 2 }}
                    animate={{ scale: [0, 1.12, 0.95, 1], rotate: tile.rotation }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{ zIndex: 2 }}
                >
                    <div
                        className={`
              relative w-full h-full rounded-sm overflow-hidden
              bg-white p-1 pb-1.5 sm:p-1.5 sm:pb-2
              shadow-md
              ${isWinning ? 'ring-2 ring-accent ring-offset-1 ring-offset-[#F3EDE4]' : ''}
            `}
                        style={{ transform: `rotate(${tile.rotation}deg)` }}
                    >
                        {/* Washi tape — top-left */}
                        <div
                            className="absolute -top-1 left-1 w-7 h-2.5 sm:w-9 sm:h-3 rounded-sm pointer-events-none z-10"
                            style={{ backgroundColor: 'rgba(212, 163, 115, 0.35)', transform: 'rotate(-18deg)' }}
                        />
                        {/* Washi tape — bottom-right */}
                        <div
                            className="absolute -bottom-1 right-1 w-7 h-2.5 sm:w-9 sm:h-3 rounded-sm pointer-events-none z-10"
                            style={{ backgroundColor: 'rgba(226, 149, 120, 0.3)', transform: 'rotate(12deg)' }}
                        />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={tile.photo}
                            alt={tile.label}
                            className="w-full h-full object-cover rounded-[2px]"
                            style={{ filter: 'grayscale(20%) sepia(18%) contrast(1.05)' }}
                        />
                        <div className="absolute bottom-0 inset-x-0 px-1 pb-0.5">
                            <p className="font-hand text-[8px] sm:text-[10px] text-ink/50 text-center truncate leading-none">
                                {tile.label.replace('\n', ' ')}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleChange}
                className="hidden"
                aria-label={`Snap proof for ${tile.label}`}
            />
        </div>
    )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Camera } from 'lucide-react'
import { resizeImageToBase64 } from '@/utils/imageProcessor'

/* ═══════════════════════════════════════════════
   Types & Data
   ═══════════════════════════════════════════════ */
interface BingoTile {
    id: string
    label: string
    photo: string | null
    rotation: number
}

const STORAGE_KEY = 'ikea-bingo-state'

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

function createInitialGrid(): BingoTile[] {
    return tileLabels.map((label, i) => ({
        id: `tile-${i}`,
        label,
        photo: null,
        rotation: Math.round(Math.random() * 8 - 4),
    }))
}

/* Win Detection */
const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
]

function findWinningLines(tiles: BingoTile[]): number[][] {
    return LINES.filter((line) => line.every((i) => tiles[i].photo !== null))
}

/* ═══════════════════════════════════════════════
   Exported Bingo Component
   ═══════════════════════════════════════════════ */
export default function IkeaBingo() {
    const [tiles, setTiles] = useState<BingoTile[]>([])
    const [loaded, setLoaded] = useState(false)
    const [winningLines, setWinningLines] = useState<number[][]>([])
    const [showReward, setShowReward] = useState(false)
    const [hasShownReward, setHasShownReward] = useState(false)

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const parsed: BingoTile[] = JSON.parse(saved)
                if (parsed.length === 9) {
                    setTiles(parsed)
                    const lines = findWinningLines(parsed)
                    setWinningLines(lines)
                    if (lines.length > 0) setHasShownReward(true)
                } else {
                    setTiles(createInitialGrid())
                }
            } else {
                setTiles(createInitialGrid())
            }
        } catch {
            setTiles(createInitialGrid())
        }
        setLoaded(true)
    }, [])

    useEffect(() => {
        if (loaded && tiles.length === 9) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tiles))
        }
    }, [tiles, loaded])

    const handleCapture = useCallback(
        async (id: string, file: File) => {
            try {
                const base64 = await resizeImageToBase64(file, 300, 0.7)
                setTiles((prev) => {
                    const next = prev.map((t) => (t.id === id ? { ...t, photo: base64 } : t))
                    const lines = findWinningLines(next)
                    setWinningLines(lines)
                    if (lines.length > 0 && !hasShownReward) {
                        setHasShownReward(true)
                        setTimeout(() => {
                            confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 }, colors: ['#E29578', '#D4A373', '#F9F5F1'] })
                            setTimeout(() => confetti({ particleCount: 120, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#E29578', '#D4A373'] }), 200)
                            setTimeout(() => confetti({ particleCount: 120, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#E29578', '#D4A373'] }), 350)
                        }, 300)
                        setTimeout(() => setShowReward(true), 800)
                    } else {
                        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 }, colors: ['#E29578', '#D4A373'] })
                    }
                    return next
                })
            } catch (err) {
                console.error('Image processing failed:', err)
            }
        },
        [hasShownReward]
    )

    const resetGrid = useCallback(() => {
        setTiles(createInitialGrid())
        setWinningLines([])
        setShowReward(false)
        setHasShownReward(false)
        localStorage.removeItem(STORAGE_KEY)
    }, [])

    const completedCount = tiles.filter((t) => t.photo !== null).length
    const winningIndices = new Set(winningLines.flat())

    if (!loaded) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="font-hand text-lg text-ink/40 animate-pulse">Loading…</p>
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
                        <button
                            onClick={() => setShowReward(true)}
                            className="mt-1 font-hand text-xs underline text-ink/35 hover:text-ink/60 transition-colors"
                        >
                            View reward
                        </button>
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
                {showReward && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute inset-0 bg-ink/50" onClick={() => setShowReward(false)} />
                        <motion.div
                            className="relative z-10 w-full max-w-sm"
                            initial={{ scale: 0.85, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                        >
                            <div className="bg-[#FDF8F4] rounded-2xl p-8 text-center shadow-scrapbook-hover" style={{ transform: 'rotate(-1deg)' }}>
                                <div className="absolute top-3 left-6 right-6 border-t-2 border-dashed border-ink/15" />
                                <p className="font-hand text-sm text-ink/35 mb-2 mt-2">★ Reward Unlocked ★</p>
                                <h2 className="font-hand text-3xl text-ink leading-tight mb-3">1× Free<br />Back Massage</h2>
                                <div className="w-12 h-px bg-ink/15 mx-auto mb-3" />
                                <p className="font-hand text-lg text-rose/70 mb-5">Redeemable anytime. No expiry. ♡</p>
                                <p className="font-hand text-xs text-ink/20 mb-5">Code: LOVE-2026</p>
                                <button
                                    onClick={() => setShowReward(false)}
                                    className="w-full py-3 bg-accent hover:bg-accent/90 text-white rounded-full font-hand text-lg transition-colors"
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
    onCapture: (id: string, file: File) => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const isDone = tile.photo !== null

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) onCapture(tile.id, file)
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

'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import { Shuffle, X } from 'lucide-react'
import Image from 'next/image'
import DateGuard from '@/components/DateGuard'
import DeskClutter from '@/components/DeskClutter'

/* ═══════════════════════════════════════════════
   Photo Data
   ═══════════════════════════════════════════════ */
interface ScatterPhoto {
    id: number
    src: string
    caption: string
    width: number
    height: number
}

const PHOTOS: ScatterPhoto[] = [
    { id: 1, src: '/gallery/1768493778285.jpg', caption: 'Sesuai Caption, cakep!!', width: 400, height: 500 },
    { id: 2, src: '/gallery/IMG_20251206_142838.jpg', caption: 'Sekola dulu dek', width: 500, height: 400 },
    { id: 3, src: '/gallery/IMG_20251223_170431.jpg', caption: 'Ayo ngadu jenong', width: 400, height: 500 },
    { id: 4, src: '/gallery/IMG_20251223_192441.jpg', caption: 'Peace peace', width: 400, height: 400 },
    { id: 5, src: '/gallery/IMG_20251223_203049_1.jpg', caption: 'Gasengaja kpenct, eh cakep', width: 500, height: 400 },
    { id: 6, src: '/gallery/IMG_20251224_211951.jpg', caption: 'Kamu rajin2 maenin rambut dpn aku ya', width: 400, height: 500 },
    { id: 7, src: '/gallery/IMG_20260113_140420.jpg', caption: 'Nanti aku anterin lagii', width: 400, height: 500 },
    { id: 8, src: '/gallery/IMG_20260115_173555.jpg', caption: 'Wleee (baju km bikin aku mleleh)', width: 500, height: 400 },
    { id: 9, src: '/gallery/IMG-20251219-WA0003.jpg', caption: 'Oyen dingin', width: 400, height: 500 },
    { id: 10, src: '/gallery/IMG-20251229-WA0052(1).jpg', caption: 'Kirim yg byk, jgn skali2', width: 400, height: 400 },
    { id: 11, src: '/gallery/IMG-20260113-WA0005.jpg', caption: 'Memori awal2 banget ni', width: 500, height: 400 },
    { id: 12, src: '/gallery/IMG-20260211-WA0046.jpg', caption: 'masi utang 1 pap', width: 400, height: 500 },
    { id: 13, src: '/gallery/Screenshot_2025-12-09-17-40-26-026_com.whatsapp.jpg', caption: 'aku gatahan yg ini kamu UGHHHH', width: 500, height: 400 },
    { id: 14, src: '/gallery/Screenshot_2026-02-04-22-24-47-636_com.google.android.apps.docs.jpg', caption: 'My only Casto ♡', width: 400, height: 500 },
]

/* ═══════════════════════════════════════════════
   Seeded RNG for deterministic scatter
   ═══════════════════════════════════════════════ */
function seededRandom(seed: number) {
    let s = seed
    return () => {
        s = (s * 16807 + 0) % 2147483647
        return (s - 1) / 2147483646
    }
}

function generatePositions(seed: number) {
    const rng = seededRandom(seed)
    return PHOTOS.map(() => ({
        x: rng() * 55 + 5,
        y: rng() * 50 + 8,
        rotation: rng() * 30 - 15,
    }))
}

/* Washi tape color variants */
const TAPE_COLORS = [
    'rgba(212,163,115,0.35)',
    'rgba(226,149,120,0.30)',
    'rgba(180,200,160,0.30)',
    'rgba(200,180,220,0.28)',
    'rgba(240,200,150,0.32)',
]

/* ═══════════════════════════════════════════════
   Main Gallery Page
   ═══════════════════════════════════════════════ */
export default function GalleryPage() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [seed, setSeed] = useState(42)
    const [highestZ, setHighestZ] = useState(20)
    const [viewingPhoto, setViewingPhoto] = useState<ScatterPhoto | null>(null)

    const positions = useMemo(() => generatePositions(seed), [seed])

    const bringToFront = useCallback(() => {
        const next = highestZ + 1
        setHighestZ(next)
        return next
    }, [highestZ])

    const reshuffle = useCallback(() => {
        setSeed(Date.now())
        setHighestZ(20)
    }, [])

    return (
        <DateGuard customMessage="Sabar, fotonya masih dicuci dulu… 🎞️">
            <div className="h-screen w-screen overflow-hidden relative select-none">
                {/* ─── Desk background: wood grain ─── */}
                <div className="absolute inset-0" style={{
                    backgroundColor: '#BFA27A',
                    backgroundImage: `
          linear-gradient(135deg, #C4A882 0%, #B89B72 40%, #C9AD88 70%, #BFA27A 100%),
          repeating-linear-gradient(95deg,
            transparent 0px, transparent 7px,
            rgba(80,50,20,0.06) 7px, rgba(80,50,20,0.06) 8px,
            transparent 8px, transparent 26px
          ),
          repeating-linear-gradient(92deg,
            transparent 0px, transparent 14px,
            rgba(60,40,15,0.04) 14px, rgba(60,40,15,0.04) 15px,
            transparent 15px, transparent 40px
          )
        `,
                }} />

                {/* Wood knots / subtle circles */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
                    backgroundImage: `
          radial-gradient(ellipse 40px 30px at 20% 35%, rgba(60,30,10,1) 0%, transparent 70%),
          radial-gradient(ellipse 30px 25px at 70% 60%, rgba(60,30,10,1) 0%, transparent 70%),
          radial-gradient(ellipse 25px 20px at 45% 80%, rgba(60,30,10,1) 0%, transparent 70%)
        `,
                }} />

                {/* ─── Desk clutter layer ─── */}
                <DeskClutter />

                {/* ─── Drag canvas ─── */}
                <div ref={containerRef} className="relative w-full h-full">
                    {/* Title scrap — pinned with tape */}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[3] pointer-events-none">
                        <div className="relative">
                            {/* Tape holding the title */}
                            <div
                                className="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4 rounded-sm z-10"
                                style={{
                                    backgroundColor: 'rgba(212,163,115,0.4)',
                                    transform: 'translateX(-50%) rotate(-2deg)',
                                }}
                            />
                            <div className="bg-white/92 px-6 py-3 shadow-lg rounded-sm">
                                <h1 className="font-hand text-2xl sm:text-3xl text-ink text-center whitespace-nowrap">
                                    Our Memories ♡
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Photos */}
                    {PHOTOS.map((photo, i) => (
                        <DraggablePolaroid
                            key={`${photo.id}-${seed}`}
                            photo={photo}
                            initialX={positions[i].x}
                            initialY={positions[i].y}
                            rotation={positions[i].rotation}
                            initialZ={10 + i}
                            tapeColor={TAPE_COLORS[i % TAPE_COLORS.length]}
                            containerRef={containerRef}
                            bringToFront={bringToFront}
                            onDoubleClick={() => setViewingPhoto(photo)}
                        />
                    ))}

                    {/* Reshuffle button */}
                    <button
                        onClick={reshuffle}
                        className="absolute bottom-24 right-4 z-[100] flex items-center gap-2 px-4 py-2.5 rounded-full font-hand text-sm text-ink/70 hover:text-ink transition-all active:scale-95 border border-white/30 shadow-xl"
                        style={{
                            background: 'rgba(255,255,255,0.82)',
                            backdropFilter: 'blur(12px)',
                        }}
                    >
                        <Shuffle className="w-4 h-4" />
                        Acak lagi
                    </button>

                    {/* Hint */}
                    <div className="absolute bottom-24 left-4 z-[2] pointer-events-none">
                        <p className="font-hand text-sm text-white/40">← Drag & double-tap</p>
                    </div>
                </div>

                {/* ─── Photo Zoom Modal ─── */}
                <AnimatePresence>
                    {viewingPhoto && (
                        <motion.div
                            className="fixed inset-0 z-[500] flex items-center justify-center p-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Backdrop */}
                            <motion.div
                                className="absolute inset-0 bg-ink/70"
                                onClick={() => setViewingPhoto(null)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />

                            {/* Enlarged Polaroid */}
                            <motion.div
                                className="relative z-10 max-w-md w-full"
                                initial={{ scale: 0.8, y: 30, rotate: -2 }}
                                animate={{ scale: 1, y: 0, rotate: 0 }}
                                exit={{ scale: 0.85, y: 20, opacity: 0 }}
                                transition={{ type: 'spring', damping: 22, stiffness: 260 }}
                            >
                                <div className="bg-white p-3 pb-14 sm:p-4 sm:pb-16 rounded-sm shadow-2xl">
                                    {/* Washi tape on enlarged view */}
                                    <div
                                        className="absolute -top-2 left-8 w-16 h-5 rounded-sm z-20"
                                        style={{
                                            backgroundColor: 'rgba(212,163,115,0.4)',
                                            transform: 'rotate(-6deg)',
                                        }}
                                    />
                                    <div className="relative w-full aspect-[4/5] overflow-hidden rounded-[2px]">
                                        <Image
                                            src={viewingPhoto.src}
                                            alt={viewingPhoto.caption}
                                            fill
                                            className="object-cover"
                                            sizes="400px"
                                            style={{ filter: 'sepia(8%) contrast(1.04)' }}
                                        />
                                    </div>
                                    <p className="absolute bottom-4 inset-x-0 text-center font-hand text-lg sm:text-xl text-ink/60">
                                        {viewingPhoto.caption}
                                    </p>
                                </div>

                                {/* Close button */}
                                <button
                                    onClick={() => setViewingPhoto(null)}
                                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center z-20 hover:bg-ink/5 transition-colors"
                                >
                                    <X className="w-4 h-4 text-ink/50" />
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DateGuard>
    )
}

/* ═══════════════════════════════════════════════
   Draggable Polaroid with Washi Tape
   ═══════════════════════════════════════════════ */
function DraggablePolaroid({
    photo,
    initialX,
    initialY,
    rotation,
    initialZ,
    tapeColor,
    containerRef,
    bringToFront,
    onDoubleClick,
}: {
    photo: ScatterPhoto
    initialX: number
    initialY: number
    rotation: number
    initialZ: number
    tapeColor: string
    containerRef: React.RefObject<HTMLDivElement | null>
    bringToFront: () => number
    onDoubleClick: () => void
}) {
    const [zIndex, setZIndex] = useState(initialZ)
    const [isDragging, setIsDragging] = useState(false)
    const scale = useMotionValue(1)
    const lastTap = useRef(0)

    const isPortrait = photo.height > photo.width
    const w = isPortrait ? 'w-28 sm:w-36' : 'w-32 sm:w-44'
    const h = isPortrait ? 'h-36 sm:h-44' : 'h-24 sm:h-32'

    // Handle double-tap (works on touch + mouse)
    const handlePointerDown = useCallback(() => {
        setZIndex(bringToFront())
        const now = Date.now()
        if (now - lastTap.current < 350) {
            onDoubleClick()
        }
        lastTap.current = now
    }, [bringToFront, onDoubleClick])

    return (
        <motion.div
            className="absolute touch-none cursor-grab active:cursor-grabbing"
            style={{
                left: `${initialX}%`,
                top: `${initialY}%`,
                zIndex,
                rotate: rotation,
            }}
            drag
            dragConstraints={containerRef}
            dragElastic={0.06}
            dragMomentum={false}
            onDragStart={() => {
                setIsDragging(true)
                scale.set(1.05)
            }}
            onDragEnd={() => {
                setIsDragging(false)
                scale.set(1)
            }}
            onPointerDown={handlePointerDown}
            whileTap={{ scale: 1.03 }}
        >
            <motion.div
                className="relative"
                style={{ scale }}
            >
                {/* Washi tape strip on top */}
                <div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 sm:w-14 sm:h-[18px] rounded-sm z-10 pointer-events-none"
                    style={{
                        backgroundColor: tapeColor,
                        transform: 'translateX(-50%) rotate(-3deg)',
                        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.2) 5px)',
                    }}
                />

                {/* Polaroid card */}
                <div
                    className={`
            bg-white p-2 pb-8 sm:p-2.5 sm:pb-10 rounded-sm
            transition-shadow duration-200
            ${isDragging
                            ? 'shadow-[0_20px_40px_-8px_rgba(0,0,0,0.35)]'
                            : 'shadow-[0_8px_24px_-4px_rgba(0,0,0,0.2)]'
                        }
          `}
                >
                    {/* Image */}
                    <div className={`${w} ${h} relative overflow-hidden`}>
                        <Image
                            src={photo.src}
                            alt={photo.caption}
                            fill
                            className="object-cover"
                            sizes="180px"
                            style={{ filter: 'sepia(10%) contrast(1.05) brightness(1.02)' }}
                        />
                    </div>

                    {/* Caption */}
                    <p className="font-hand text-xs sm:text-sm text-ink/55 text-center mt-1 absolute bottom-2 inset-x-0">
                        {photo.caption}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    )
}

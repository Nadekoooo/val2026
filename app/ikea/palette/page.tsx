'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Download, X, Pipette, Camera, Trash2 } from 'lucide-react'
import { resizeImageToBase64 } from '@/utils/imageProcessor'

/* ═══════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════ */
interface Swatch {
    id: string
    photo: string | null  // base64
    color: string         // hex
    name: string          // custom name
}

const MAX_SWATCHES = 5

const PLACEHOLDER_NAMES = [
    'Living Room Vibe',
    'Kitchen Accent',
    'Bedroom Mood',
    'Sofa Oyen',
    'Sunset Corner',
]

function createEmptySwatch(index: number): Swatch {
    return {
        id: `swatch-${Date.now()}-${index}`,
        photo: null,
        color: '#D4A373',
        name: PLACEHOLDER_NAMES[index] ?? `Swatch ${index + 1}`,
    }
}

/* ═══════════════════════════════════════════════
   Utility: contrast text color
   ═══════════════════════════════════════════════ */
function getContrastColor(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.55 ? '#1a1a1a' : '#ffffff'
}

/* ═══════════════════════════════════════════════
   Utility: download palette as PNG via Canvas
   ═══════════════════════════════════════════════ */
function downloadPalette(swatches: Swatch[]) {
    const filled = swatches.filter((s) => s.photo)
    if (filled.length === 0) return

    const stripeW = 160
    const stripeH = 420
    const padding = 40
    const totalW = padding * 2 + filled.length * stripeW + (filled.length - 1) * 8
    const totalH = padding * 2 + stripeH + 60

    const canvas = document.createElement('canvas')
    canvas.width = totalW
    canvas.height = totalH
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background
    ctx.fillStyle = '#F9F5F1'
    ctx.fillRect(0, 0, totalW, totalH)

    // Title
    ctx.fillStyle = '#3E3C3C'
    ctx.font = '600 18px Courier New, monospace'
    ctx.textAlign = 'center'
    ctx.fillText('MY IKEA PALETTE', totalW / 2, 30)

    // Stripes
    filled.forEach((swatch, i) => {
        const x = padding + i * (stripeW + 8)
        const y = padding + 10

        // Color stripe
        ctx.fillStyle = swatch.color
        ctx.fillRect(x, y, stripeW, stripeH)

        // Hex code
        const textColor = getContrastColor(swatch.color)
        ctx.fillStyle = textColor
        ctx.font = '600 13px Courier New, monospace'
        ctx.textAlign = 'center'
        ctx.fillText(swatch.color.toUpperCase(), x + stripeW / 2, y + stripeH - 30)

        // Name
        ctx.font = '12px Courier New, monospace'
        ctx.fillText(swatch.name, x + stripeW / 2, y + stripeH - 12)
    })

    // Footer
    ctx.fillStyle = '#3E3C3C66'
    ctx.font = '11px Courier New, monospace'
    ctx.textAlign = 'center'
    ctx.fillText('ikea date — valentine 2026', totalW / 2, totalH - 12)

    // Download
    const link = document.createElement('a')
    link.download = 'ikea-palette.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
}

/* ═══════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════ */
export default function PalettePage() {
    const [swatches, setSwatches] = useState<Swatch[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)

    const addSwatch = useCallback(() => {
        if (swatches.length >= MAX_SWATCHES) return
        const newSwatch = createEmptySwatch(swatches.length)
        setSwatches((prev) => [...prev, newSwatch])
        setEditingId(newSwatch.id)
    }, [swatches.length])

    const removeSwatch = useCallback((id: string) => {
        setSwatches((prev) => prev.filter((s) => s.id !== id))
        setEditingId(null)
    }, [])

    const updateSwatch = useCallback((id: string, updates: Partial<Swatch>) => {
        setSwatches((prev) =>
            prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
        )
    }, [])

    const filledCount = swatches.filter((s) => s.photo).length

    return (
        <motion.div
            className="max-w-lg mx-auto px-4 pt-8 pb-28 sm:pt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* ─── Header ─── */}
            <div className="text-center mb-8">
                <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-ink/30 mb-2">
                    IKEA × Valentine
                </p>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
                    The Mood Collector
                </h1>
                <p className="font-hand text-lg text-rose/70 mt-1">
                    Capture colors from furniture you love ♡
                </p>
            </div>

            {/* ─── Swatch slots ─── */}
            <div className="space-y-4 mb-8">
                <AnimatePresence mode="popLayout">
                    {swatches.map((swatch, index) => (
                        <SwatchEditor
                            key={swatch.id}
                            swatch={swatch}
                            index={index}
                            isEditing={editingId === swatch.id}
                            onEdit={() => setEditingId(editingId === swatch.id ? null : swatch.id)}
                            onUpdate={(updates) => updateSwatch(swatch.id, updates)}
                            onRemove={() => removeSwatch(swatch.id)}
                        />
                    ))}
                </AnimatePresence>

                {/* Add button */}
                {swatches.length < MAX_SWATCHES && (
                    <motion.button
                        onClick={addSwatch}
                        className="w-full py-4 border-2 border-dashed border-ink/12 rounded-xl flex items-center justify-center gap-2 text-ink/30 hover:text-ink/50 hover:border-ink/25 transition-all group"
                        whileTap={{ scale: 0.98 }}
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-mono text-sm tracking-wide">
                            Add Color ({swatches.length}/{MAX_SWATCHES})
                        </span>
                    </motion.button>
                )}
            </div>

            {/* ─── Palette Card Preview ─── */}
            {filledCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-mono text-xs tracking-widest uppercase text-ink/40">
                            Your Palette
                        </h2>
                        <button
                            onClick={() => downloadPalette(swatches)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-ink text-paper rounded-full font-mono text-xs hover:bg-ink/85 transition-colors"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Save PNG
                        </button>
                    </div>

                    {/* Pantone-style stripe card */}
                    <div
                        className="rounded-xl overflow-hidden shadow-scrapbook"
                        style={{ backgroundColor: '#F3EDE4' }}
                    >
                        <div className="flex">
                            {swatches
                                .filter((s) => s.photo)
                                .map((swatch) => (
                                    <div
                                        key={swatch.id}
                                        className="flex-1 flex flex-col"
                                    >
                                        {/* Color stripe */}
                                        <div
                                            className="h-32 sm:h-44"
                                            style={{ backgroundColor: swatch.color }}
                                        />
                                        {/* Info */}
                                        <div className="px-1.5 py-2 sm:px-2.5 sm:py-3 text-center bg-white">
                                            <p className="font-mono text-[10px] sm:text-xs font-bold text-ink tracking-wide">
                                                {swatch.color.toUpperCase()}
                                            </p>
                                            <p className="font-hand text-xs sm:text-sm text-ink/45 mt-0.5 truncate">
                                                {swatch.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Footer label */}
                    <p className="text-center font-mono text-[9px] text-ink/20 tracking-widest mt-3 uppercase">
                        IKEA Date — Valentine 2026
                    </p>
                </motion.div>
            )}
        </motion.div>
    )
}

/* ═══════════════════════════════════════════════
   Swatch Editor Component
   ═══════════════════════════════════════════════ */
function SwatchEditor({
    swatch,
    index,
    isEditing,
    onEdit,
    onUpdate,
    onRemove,
}: {
    swatch: Swatch
    index: number
    isEditing: boolean
    onEdit: () => void
    onUpdate: (updates: Partial<Swatch>) => void
    onRemove: () => void
}) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const colorInputRef = useRef<HTMLInputElement>(null)

    const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        try {
            const base64 = await resizeImageToBase64(file, 300, 0.75)
            onUpdate({ photo: base64 })
        } catch (err) {
            console.error('Photo processing failed:', err)
        }
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.25 }}
        >
            <div
                className={`
          rounded-xl overflow-hidden border-2 transition-all duration-200
          ${isEditing ? 'border-accent/40 shadow-md' : 'border-ink/8 shadow-sm'}
        `}
            >
                {/* ── Header row ── */}
                <button
                    onClick={onEdit}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-ink/[0.02] transition-colors"
                >
                    {/* Color dot */}
                    <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: swatch.color }}
                    />

                    {/* Info */}
                    <div className="flex-1 text-left min-w-0">
                        <p className="font-mono text-xs font-bold text-ink tracking-wide">
                            {swatch.color.toUpperCase()}
                        </p>
                        <p className="font-hand text-sm text-ink/45 truncate">
                            {swatch.name}
                        </p>
                    </div>

                    {/* Status */}
                    <span className="font-mono text-[10px] text-ink/25 tracking-wider">
                        {swatch.photo ? '✓' : `#${index + 1}`}
                    </span>
                </button>

                {/* ── Expanded editor ── */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="px-4 pb-4 bg-white border-t border-ink/5">
                                <div className="pt-3 space-y-3">
                                    {/* Photo section */}
                                    <div className="flex gap-3">
                                        {/* Photo preview or capture button */}
                                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-ink/[0.03]">
                                            {swatch.photo ? (
                                                <div className="relative w-full h-full group">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={swatch.photo}
                                                        alt="Captured"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 flex items-center justify-center transition-colors"
                                                    >
                                                        <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full h-full flex flex-col items-center justify-center gap-1 text-ink/20 hover:text-ink/40 transition-colors"
                                                >
                                                    <Camera className="w-6 h-6" />
                                                    <span className="font-mono text-[9px] tracking-wide">SNAP</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Color picker + name */}
                                        <div className="flex-1 space-y-2">
                                            {/* Color picker row */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => colorInputRef.current?.click()}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-ink/10 hover:border-ink/20 transition-colors flex-1"
                                                >
                                                    <div
                                                        className="w-5 h-5 rounded-full border border-white shadow-sm"
                                                        style={{ backgroundColor: swatch.color }}
                                                    />
                                                    <span className="font-mono text-xs font-bold tracking-wide">
                                                        {swatch.color.toUpperCase()}
                                                    </span>
                                                    <Pipette className="w-3.5 h-3.5 text-ink/30 ml-auto" />
                                                </button>

                                                {/* Native color picker (hidden, triggered by button) */}
                                                <input
                                                    ref={colorInputRef}
                                                    type="color"
                                                    value={swatch.color}
                                                    onChange={(e) => onUpdate({ color: e.target.value })}
                                                    className="sr-only"
                                                    aria-label="Pick color"
                                                />
                                            </div>

                                            {/* Name input */}
                                            <input
                                                type="text"
                                                value={swatch.name}
                                                onChange={(e) => onUpdate({ name: e.target.value })}
                                                placeholder="Name this color..."
                                                className="w-full px-3 py-2 rounded-lg border border-ink/10 focus:border-accent/40 focus:outline-none font-hand text-sm text-ink/70 placeholder:text-ink/20 transition-colors bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Remove button */}
                                    <button
                                        onClick={onRemove}
                                        className="flex items-center gap-1.5 text-ink/25 hover:text-red-400 font-mono text-[10px] tracking-wider uppercase transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Remove swatch
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhoto}
                className="hidden"
                aria-label={`Capture photo for swatch ${index + 1}`}
            />
        </motion.div>
    )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Download, Pipette, Camera, Trash2 } from 'lucide-react'
import { resizeImageToBase64 } from '@/utils/imageProcessor'

/* ═══════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════ */
interface Swatch {
    id: string
    photo: string | null
    color: string
    name: string
}

const MAX_SWATCHES = 5
const STORAGE_KEY = 'ikea-palette-state'

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

function getContrastColor(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.55 ? '#1a1a1a' : '#ffffff'
}

function downloadPalette(swatches: Swatch[]) {
    const filled = swatches.filter((s) => s.photo)
    if (filled.length === 0) return
    const stripeW = 140
    const stripeH = 360
    const pad = 32
    const totalW = pad * 2 + filled.length * stripeW + (filled.length - 1) * 6
    const totalH = pad * 2 + stripeH + 50
    const canvas = document.createElement('canvas')
    canvas.width = totalW
    canvas.height = totalH
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#F9F5F1'
    ctx.fillRect(0, 0, totalW, totalH)
    ctx.fillStyle = '#3E3C3C'
    ctx.font = '600 16px Courier New, monospace'
    ctx.textAlign = 'center'
    ctx.fillText('MY IKEA PALETTE', totalW / 2, 26)
    filled.forEach((swatch, i) => {
        const x = pad + i * (stripeW + 6)
        const y = pad + 8
        ctx.fillStyle = swatch.color
        ctx.fillRect(x, y, stripeW, stripeH)
        ctx.fillStyle = getContrastColor(swatch.color)
        ctx.font = '600 12px Courier New, monospace'
        ctx.textAlign = 'center'
        ctx.fillText(swatch.color.toUpperCase(), x + stripeW / 2, y + stripeH - 28)
        ctx.font = '11px Courier New, monospace'
        ctx.fillText(swatch.name, x + stripeW / 2, y + stripeH - 12)
    })
    ctx.fillStyle = '#3E3C3C66'
    ctx.font = '10px Courier New, monospace'
    ctx.textAlign = 'center'
    ctx.fillText('ikea date — valentine 2026', totalW / 2, totalH - 10)
    const link = document.createElement('a')
    link.download = 'ikea-palette.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
}

/* ═══════════════════════════════════════════════
   Exported Palette Component
   ═══════════════════════════════════════════════ */
export default function IkeaPalette() {
    const [swatches, setSwatches] = useState<Swatch[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [loaded, setLoaded] = useState(false)

    // Load
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                setSwatches(JSON.parse(saved))
            }
        } catch { /* ignore */ }
        setLoaded(true)
    }, [])

    // Save
    useEffect(() => {
        if (loaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(swatches))
        }
    }, [swatches, loaded])

    const addSwatch = useCallback(() => {
        if (swatches.length >= MAX_SWATCHES) return
        const s = createEmptySwatch(swatches.length)
        setSwatches((prev) => [...prev, s])
        setEditingId(s.id)
    }, [swatches.length])

    const removeSwatch = useCallback((id: string) => {
        setSwatches((prev) => prev.filter((s) => s.id !== id))
        setEditingId(null)
    }, [])

    const updateSwatch = useCallback((id: string, updates: Partial<Swatch>) => {
        setSwatches((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
    }, [])

    const filledCount = swatches.filter((s) => s.photo).length

    if (!loaded) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="font-hand text-lg text-ink/40 animate-pulse">Loading…</p>
            </div>
        )
    }

    return (
        <div>
            {/* Swatch editors */}
            <div className="space-y-3 mb-6">
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

                {swatches.length < MAX_SWATCHES && (
                    <motion.button
                        onClick={addSwatch}
                        className="w-full py-3.5 border-2 border-dashed border-ink/12 rounded-xl flex items-center justify-center gap-2 text-ink/30 hover:text-ink/50 hover:border-ink/25 transition-all group"
                        whileTap={{ scale: 0.98 }}
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-mono text-xs tracking-wide">
                            Add Color ({swatches.length}/{MAX_SWATCHES})
                        </span>
                    </motion.button>
                )}
            </div>

            {/* Pantone preview */}
            {filledCount > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] tracking-widest uppercase text-ink/35">Your Palette</span>
                        <button
                            onClick={() => downloadPalette(swatches)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-ink text-paper rounded-full font-mono text-[10px] hover:bg-ink/85 transition-colors"
                        >
                            <Download className="w-3 h-3" />
                            PNG
                        </button>
                    </div>

                    <div className="rounded-xl overflow-hidden shadow-scrapbook" style={{ backgroundColor: '#F3EDE4' }}>
                        <div className="flex">
                            {swatches.filter((s) => s.photo).map((swatch) => (
                                <div key={swatch.id} className="flex-1 flex flex-col">
                                    <div className="h-24 sm:h-32 lg:h-36" style={{ backgroundColor: swatch.color }} />
                                    <div className="px-1 py-1.5 sm:px-2 sm:py-2 text-center bg-white">
                                        <p className="font-mono text-[9px] sm:text-[10px] font-bold text-ink tracking-wide">
                                            {swatch.color.toUpperCase()}
                                        </p>
                                        <p className="font-hand text-[10px] sm:text-xs text-ink/40 mt-0.5 truncate">
                                            {swatch.name}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-center font-mono text-[8px] text-ink/15 tracking-widest mt-2 uppercase">
                        IKEA Date — Valentine 2026
                    </p>
                </motion.div>
            )}
        </div>
    )
}

/* ═══════════════════════════════════════════════
   Swatch Editor
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
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2 }}
        >
            <div
                className={`rounded-xl overflow-hidden border-2 transition-all duration-200
          ${isEditing ? 'border-accent/40 shadow-md' : 'border-ink/8 shadow-sm'}`}
            >
                {/* Header row */}
                <button
                    onClick={onEdit}
                    className="w-full flex items-center gap-3 px-3 py-2.5 bg-white hover:bg-ink/[0.02] transition-colors"
                >
                    <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm flex-shrink-0" style={{ backgroundColor: swatch.color }} />
                    <div className="flex-1 text-left min-w-0">
                        <p className="font-mono text-[10px] font-bold text-ink tracking-wide">{swatch.color.toUpperCase()}</p>
                        <p className="font-hand text-xs text-ink/40 truncate">{swatch.name}</p>
                    </div>
                    <span className="font-mono text-[9px] text-ink/20">{swatch.photo ? '✓' : `#${index + 1}`}</span>
                </button>

                {/* Expanded editor */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="px-3 pb-3 bg-white border-t border-ink/5">
                                <div className="pt-2.5 space-y-2.5">
                                    <div className="flex gap-2.5">
                                        {/* Photo */}
                                        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-ink/[0.03]">
                                            {swatch.photo ? (
                                                <div className="relative w-full h-full group">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={swatch.photo} alt="Captured" className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 flex items-center justify-center transition-colors"
                                                    >
                                                        <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full h-full flex flex-col items-center justify-center gap-1 text-ink/20 hover:text-ink/40 transition-colors"
                                                >
                                                    <Camera className="w-5 h-5" />
                                                    <span className="font-mono text-[8px]">SNAP</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            {/* Color picker */}
                                            <button
                                                onClick={() => colorInputRef.current?.click()}
                                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-ink/10 hover:border-ink/20 transition-colors w-full"
                                            >
                                                <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: swatch.color }} />
                                                <span className="font-mono text-[10px] font-bold tracking-wide">{swatch.color.toUpperCase()}</span>
                                                <Pipette className="w-3 h-3 text-ink/25 ml-auto" />
                                            </button>
                                            <input
                                                ref={colorInputRef}
                                                type="color"
                                                value={swatch.color}
                                                onChange={(e) => onUpdate({ color: e.target.value })}
                                                className="sr-only"
                                            />

                                            {/* Name */}
                                            <input
                                                type="text"
                                                value={swatch.name}
                                                onChange={(e) => onUpdate({ name: e.target.value })}
                                                placeholder="Name this color…"
                                                className="w-full px-2.5 py-1.5 rounded-lg border border-ink/10 focus:border-accent/40 focus:outline-none font-hand text-xs text-ink/70 placeholder:text-ink/20 bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={onRemove}
                                        className="flex items-center gap-1 text-ink/20 hover:text-red-400 font-mono text-[9px] tracking-wider uppercase transition-colors"
                                    >
                                        <Trash2 className="w-2.5 h-2.5" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

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

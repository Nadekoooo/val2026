'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ═══════════════════════════════════════════════
   Bubble Data
   ═══════════════════════════════════════════════ */
const BUBBLE_WORDS = [
    'Oyen', 'Suka Matcha', 'Anak Seni', 'Galak dikit',
    'Cantik', 'Kesayangan', 'Manja', 'Lucu',
    'Pinter', 'Gemesin', 'Kangen', 'Senyumnya ♡',
]

interface BubbleData {
    id: number
    text: string
    x: number   // % from left
    y: number   // % from top
    size: 'sm' | 'md' | 'lg'
    duration: number  // animation cycle duration
    delay: number
}

/* Generate scattered positions, avoiding the center zone
   where the envelope sits (~30-70% x, ~30-70% y) */
function generateBubbles(): BubbleData[] {
    const sizes: ('sm' | 'md' | 'lg')[] = ['sm', 'md', 'lg']
    return BUBBLE_WORDS.map((text, i) => {
        // Use deterministic-ish positions spread around the edges
        const angle = (i / BUBBLE_WORDS.length) * Math.PI * 2
        const radius = 35 + (i % 3) * 8 // 35–51% from center
        let x = 50 + Math.cos(angle) * radius
        let y = 50 + Math.sin(angle) * radius

        // Clamp to stay on screen
        x = Math.max(5, Math.min(90, x))
        y = Math.max(5, Math.min(88, y))

        return {
            id: i,
            text,
            x,
            y,
            size: sizes[i % 3],
            duration: 6 + (i % 4) * 2,   // 6–12s
            delay: i * 0.3,
        }
    })
}

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */
export default function FloatingBubbles() {
    const allBubbles = useMemo(() => generateBubbles(), [])
    const [popped, setPopped] = useState<Set<number>>(new Set())

    const pop = useCallback((id: number) => {
        setPopped((prev) => {
            const next = new Set(prev)
            next.add(id)
            return next
        })
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none z-[3] overflow-hidden">
            <AnimatePresence>
                {allBubbles
                    .filter((b) => !popped.has(b.id))
                    .map((bubble) => (
                        <Bubble key={bubble.id} data={bubble} onPop={pop} />
                    ))}
            </AnimatePresence>
        </div>
    )
}

/* ═══════════════════════════════════════════════
   Individual Bubble
   ═══════════════════════════════════════════════ */
function Bubble({
    data,
    onPop,
}: {
    data: BubbleData
    onPop: (id: number) => void
}) {
    const [isPopping, setIsPopping] = useState(false)

    const handlePop = useCallback(() => {
        if (isPopping) return
        setIsPopping(true)
        // Small particle burst
        spawnParticles(data.x, data.y)
        // Let the exit animation play
        setTimeout(() => onPop(data.id), 250)
    }, [data.id, data.x, data.y, isPopping, onPop])

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-[11px]',
        md: 'px-4 py-2 text-xs',
        lg: 'px-5 py-2 text-sm',
    }

    // Unique float path per bubble
    const floatX = [0, 12, -8, 5, 0]
    const floatY = [0, -14, 6, -10, 0]

    return (
        <motion.div
            className="absolute pointer-events-auto"
            style={{
                left: `${data.x}%`,
                top: `${data.y}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={
                isPopping
                    ? { scale: [1.3, 0], opacity: [1, 0] }
                    : { opacity: 1, scale: 1 }
            }
            exit={{ scale: 0, opacity: 0 }}
            transition={
                isPopping
                    ? { duration: 0.25, ease: 'easeOut' }
                    : { duration: 0.5, delay: data.delay * 0.15 }
            }
        >
            <motion.button
                onClick={handlePop}
                className={`
          ${sizeClasses[data.size]}
          font-hand whitespace-nowrap cursor-pointer select-none
          rounded-full
          bg-white/40 backdrop-blur-sm
          border border-white/50
          text-ink/60
          shadow-sm
          hover:bg-white/60 hover:scale-110
          active:scale-95
          transition-colors duration-150
          will-change-transform
        `}
                animate={{
                    x: floatX.map((v) => v * (data.id % 2 === 0 ? 1 : -1)),
                    y: floatY.map((v) => v * (data.id % 3 === 0 ? -1 : 1)),
                    rotate: [0, data.id % 2 === 0 ? 3 : -3, 0],
                }}
                transition={{
                    duration: data.duration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                {data.text}
            </motion.button>
        </motion.div>
    )
}

/* ═══════════════════════════════════════════════
   Particle burst on pop (lightweight CSS approach)
   ═══════════════════════════════════════════════ */
function spawnParticles(xPct: number, yPct: number) {
    const container = document.createElement('div')
    container.style.cssText = `
    position: fixed;
    left: ${xPct}%;
    top: ${yPct}%;
    pointer-events: none;
    z-index: 4;
  `
    document.body.appendChild(container)

    const colors = ['#E29578', '#D4A373', '#F9F5F1', '#fff']

    for (let i = 0; i < 8; i++) {
        const dot = document.createElement('div')
        const angle = (i / 8) * Math.PI * 2
        const dist = 20 + Math.random() * 15
        const dx = Math.cos(angle) * dist
        const dy = Math.sin(angle) * dist
        const size = 3 + Math.random() * 3

        dot.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${colors[i % colors.length]};
      left: 0;
      top: 0;
      opacity: 1;
      transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    `
        container.appendChild(dot)

        // Trigger animation after paint
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                dot.style.transform = `translate(${dx}px, ${dy}px)`
                dot.style.opacity = '0'
            })
        })
    }

    setTimeout(() => container.remove(), 500)
}

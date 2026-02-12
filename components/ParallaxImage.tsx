'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'

interface ParallaxImageProps {
    src: string
    alt: string
    width: number
    height: number
    /** Parallax speed multiplier. 0 = static, positive = moves up faster, negative = moves down. */
    speed: number
    /** CSS rotation in degrees, e.g. 6 or -3 */
    rotation: number
    /** Caption text floating beside the image */
    caption?: string
    /** Position where caption appears relative to image */
    captionSide?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    /** Optional z-index override */
    zIndex?: number
    /** Which corner(s) get tape */
    tape?: ('tl' | 'tr' | 'bl' | 'br')[]
    /** Extra className for absolute positioning */
    className?: string
}

export default function ParallaxImage({
    src,
    alt,
    width,
    height,
    speed,
    rotation,
    caption,
    captionSide = 'bottom-right',
    zIndex = 1,
    tape = ['tl'],
    className = '',
}: ParallaxImageProps) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    })

    // Parallax Y movement: speed controls how much the image drifts
    const y = useTransform(scrollYProgress, [0, 1], [speed * 80, speed * -80])

    // Caption position classes
    const captionPositionMap = {
        'top-left': '-top-8 -left-4 -rotate-6',
        'top-right': '-top-8 -right-4 rotate-3',
        'bottom-left': '-bottom-8 -left-4 rotate-2',
        'bottom-right': '-bottom-10 -right-4 -rotate-3',
    }

    // Tape position styles
    const tapeStyles: Record<string, string> = {
        tl: 'top-[-6px] left-2 rotate-[-20deg]',
        tr: 'top-[-6px] right-2 rotate-[15deg]',
        bl: 'bottom-[-6px] left-3 rotate-[25deg]',
        br: 'bottom-[-6px] right-3 rotate-[-18deg]',
    }

    return (
        <motion.div
            ref={ref}
            className={`absolute ${className}`}
            style={{ y, zIndex, rotate: rotation }}
        >
            <div className="relative group cursor-pointer">
                {/* Polaroid frame with shadow */}
                <div className="relative bg-white p-2.5 pb-3 sm:p-3 sm:pb-4 shadow-scrapbook group-hover:shadow-scrapbook-hover transition-all duration-500 group-hover:scale-105 group-hover:z-20">
                    {/* Tape strips */}
                    {tape.map((pos) => (
                        <div
                            key={pos}
                            className={`absolute ${tapeStyles[pos]} w-10 h-4 sm:w-12 sm:h-5 bg-accent/20 backdrop-blur-sm rounded-sm pointer-events-none`}
                            style={{ opacity: 0.55 }}
                        />
                    ))}

                    {/* The actual image */}
                    <Image
                        src={src}
                        alt={alt}
                        width={width}
                        height={height}
                        className="w-full h-auto object-cover"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjlGNUYxIi8+PC9zdmc+"
                    />
                </div>

                {/* Floating handwritten caption */}
                {caption && (
                    <span
                        className={`absolute ${captionPositionMap[captionSide]} font-hand text-base sm:text-lg text-ink/60 whitespace-nowrap pointer-events-none select-none`}
                    >
                        {caption}
                    </span>
                )}
            </div>
        </motion.div>
    )
}

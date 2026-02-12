'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Disc, Play, Pause } from 'lucide-react'

export default function MusicPlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio('/songs/bgm.mp3')
        audioRef.current.loop = true
        audioRef.current.volume = 0.4 // Set to 40% volume for background ambiance

        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    }, [])

    const togglePlay = () => {
        if (!audioRef.current) return

        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else {
            audioRef.current.play().catch((err) => {
                console.warn('Autoplay prevented:', err)
            })
            setIsPlaying(true)
        }
    }

    return (
        <div className="fixed bottom-24 right-6 z-[998]">
            <motion.button
                onClick={togglePlay}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="group relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
                {/* Glass Button */}
                <div
                    className="w-14 h-14 rounded-full border border-white/30 shadow-2xl flex items-center justify-center backdrop-blur-xl"
                    style={{
                        background: 'rgba(255,255,255,0.75)',
                        backdropFilter: 'blur(20px) saturate(1.6)',
                        WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
                    }}
                >
                    {/* Vinyl Disc Icon - Rotates when playing */}
                    <motion.div
                        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                        transition={{
                            duration: 3,
                            repeat: isPlaying ? Infinity : 0,
                            ease: 'linear',
                        }}
                    >
                        <Disc 
                            className="w-7 h-7 text-accent-pink" 
                            strokeWidth={1.5}
                        />
                    </motion.div>

                    {/* Small Play/Pause indicator overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="w-5 h-5 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                        >
                            {isPlaying ? (
                                <Pause className="w-3 h-3 text-accent-pink" fill="currentColor" />
                            ) : (
                                <Play className="w-3 h-3 text-accent-pink ml-0.5" fill="currentColor" />
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* "Now Playing" Label */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            className="absolute bottom-full right-0 mb-3 pointer-events-none whitespace-nowrap"
                            initial={{ opacity: 0, y: 5, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div
                                className="px-4 py-2 rounded-full border border-white/30 shadow-xl"
                                style={{
                                    background: 'rgba(255,255,255,0.92)',
                                    backdropFilter: 'blur(16px)',
                                }}
                            >
                                <p className="font-hand text-sm text-ink/70">
                                    {isPlaying ? '♪ Now Playing...' : 'Click to play music'}
                                </p>
                            </div>
                            {/* Small arrow pointing down */}
                            <div 
                                className="absolute top-full right-6 w-0 h-0 -mt-px"
                                style={{
                                    borderLeft: '6px solid transparent',
                                    borderRight: '6px solid transparent',
                                    borderTop: '6px solid rgba(255,255,255,0.92)',
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Subtle pulsing ring when playing */}
                <AnimatePresence>
                    {isPlaying && (
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{
                                border: '2px solid rgba(238, 187, 195, 0.3)',
                            }}
                            initial={{ scale: 1, opacity: 0.6 }}
                            animate={{ scale: 1.3, opacity: 0 }}
                            exit={{ scale: 1, opacity: 0 }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeOut',
                            }}
                        />
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail } from 'lucide-react'

export default function SecretLetter() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Closed State - Envelope */}
      {!isOpen && (
        <motion.div
          className="flex flex-col items-center justify-center py-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.button
            onClick={() => setIsOpen(true)}
            className="group relative flex flex-col items-center gap-6 cursor-pointer focus:outline-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Envelope with Wax Seal */}
            <div className="relative">
              {/* Envelope */}
              <motion.div
                className="relative w-32 h-24 sm:w-40 sm:h-28 bg-rose/30 rounded-sm shadow-scrapbook group-hover:shadow-scrapbook-hover transition-shadow duration-300"
                style={{
                  rotate: -2,
                }}
              >
                {/* Envelope flap */}
                <div className="absolute inset-x-0 top-0 h-12 sm:h-14 bg-rose/40 clip-triangle" />

                {/* Mail icon */}
                <Mail className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 text-rose/60" />
              </motion.div>

              {/* Wax Seal */}
              <motion.div
                className="absolute -bottom-3 -right-3 w-12 h-12 sm:w-14 sm:h-14 bg-accent rounded-full shadow-lg flex items-center justify-center"
                animate={{
                  rotate: [0, -5, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-ink/30" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </motion.div>
            </div>

            <p className="font-hand text-2xl sm:text-3xl text-ink/70 group-hover:text-ink transition-colors">
              Read Me When You're Ready
            </p>
          </motion.button>
        </motion.div>
      )}

      {/* Open State - Full Screen Letter */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-paper rounded-lg shadow-2xl lined-paper"
              initial={{ scale: 0.3, opacity: 0, rotateX: 90 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateX: -20 }}
              transition={{
                duration: 0.5,
                type: 'spring',
                damping: 25,
                stiffness: 200,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-ink/10 hover:bg-ink/20 transition-colors group z-10"
                aria-label="Close letter"
              >
                <X className="w-6 h-6 text-ink/70 group-hover:text-ink" />
              </button>

              {/* Letter Content */}
              <div className="p-8 sm:p-12 md:p-16">
                {/* Date */}
                <p className="font-hand text-right text-lg sm:text-xl text-ink/60 mb-8">
                  February 14th, 2026
                </p>

                {/* Salutation */}
                <h2 className="font-hand text-3xl sm:text-4xl md:text-5xl text-ink mb-8">
                  My Dearest Oyen,
                </h2>

                {/* Letter Body */}
                <div className="font-hand text-xl sm:text-2xl md:text-3xl text-ink/80 space-y-6 leading-relaxed">
                  <p>
                    I know I haven't always been perfect. There have been moments when I've let you down,
                    times when my words fell short, and days when I could have tried harder.
                  </p>

                  <p>
                    But every mistake has taught me something beautiful, how much you mean to me,
                    and how lucky I am to have someone like you who sees the best in me even when
                    I stumble.
                  </p>

                  <p>
                    This little website is my way of saying I'm grateful for the moments
                    I wasn't there, and thank you for all the moments you were. You inspire me every day
                    with your art and passion, your kindness, and the way you see beauty in imperfection. Jangan blg kamu jele lagiii
                  </p>

                  <p>
                    Just like these photos scattered across the page, our memories are beautifully
                    imperfect, wonderfully chaotic, and absolutely precious.
                  </p>

                  <p className="pt-4">
                    I love you more than words can express (bahkan jauh lebi bagus dari dokumen supersemar).
                    Thanks for being my valentine love!
                  </p>
                </div>

                {/* Signature */}
                <div className="mt-12 font-hand text-2xl sm:text-3xl text-ink/70">
                  <p>Forever yours, Tian</p>
                  <p className="mt-2 text-3xl sm:text-4xl text-rose">
                    ♡
                  </p>
                </div>
              </div>

              {/* Paper edge effect */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-ink/5 to-transparent pointer-events-none" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .clip-triangle {
          clip-path: polygon(0 0, 100% 0, 50% 100%);
        }

        .lined-paper {
          background-image: 
            repeating-linear-gradient(
              transparent,
              transparent 39px,
              #E29578 39px,
              #E29578 41px
            ),
            linear-gradient(
              to right,
              #D4A373 0px,
              #D4A373 2px,
              transparent 2px,
              transparent 100%
            );
          background-size: 100% 41px, 60px 100%;
          background-position: 0 45px, 40px 0;
        }

        @media (max-width: 640px) {
          .lined-paper {
            background-size: 100% 35px, 40px 100%;
            background-position: 0 35px, 25px 0;
            background-image: 
              repeating-linear-gradient(
                transparent,
                transparent 33px,
                #E29578 33px,
                #E29578 35px
              ),
              linear-gradient(
                to right,
                #D4A373 0px,
                #D4A373 2px,
                transparent 2px,
                transparent 100%
              );
          }
        }
      `}</style>
    </>
  )
}

'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

interface GalleryImage {
  id: number
  src: string
  alt: string
  width: number
  height: number
  rotation: number
}

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

export default function MasonryGallery() {
  // Our actual memories with random rotations for that imperfect scrapbook feel
  const [images] = useState<GalleryImage[]>([
    {
      id: 1,
      src: '/gallery/1768493778285.jpg',
      alt: 'Sweet moment',
      width: 400,
      height: 500,
      rotation: -1.5,
    },
    {
      id: 2,
      src: '/gallery/IMG-20251219-WA0003.jpg',
      alt: 'December memories',
      width: 400,
      height: 500,
      rotation: 2,
    },
    {
      id: 3,
      src: '/gallery/IMG-20251229-WA0052(1).jpg',
      alt: 'Winter days',
      width: 400,
      height: 500,
      rotation: -0.8,
    },
    {
      id: 4,
      src: '/gallery/IMG-20260113-WA0005.jpg',
      alt: 'New year together',
      width: 400,
      height: 500,
      rotation: 1.2,
    },
    {
      id: 5,
      src: '/gallery/IMG-20260211-WA0046.jpg',
      alt: 'February love',
      width: 400,
      height: 500,
      rotation: -1.8,
    },
    {
      id: 6,
      src: '/gallery/IMG_20251206_142838.jpg',
      alt: 'Afternoon smile',
      width: 400,
      height: 500,
      rotation: 0.5,
    },
    {
      id: 7,
      src: '/gallery/IMG_20251223_170431.jpg',
      alt: 'Christmas vibes',
      width: 400,
      height: 500,
      rotation: -1.2,
    },
    {
      id: 8,
      src: '/gallery/IMG_20251223_192441.jpg',
      alt: 'Evening magic',
      width: 400,
      height: 500,
      rotation: 1.8,
    },
    {
      id: 9,
      src: '/gallery/IMG_20251223_203049_1.jpg',
      alt: 'Night lights',
      width: 400,
      height: 500,
      rotation: -0.6,
    },
    {
      id: 10,
      src: '/gallery/IMG_20251224_211951.jpg',
      alt: 'Christmas Eve',
      width: 400,
      height: 500,
      rotation: 1.3,
    },
    {
      id: 11,
      src: '/gallery/IMG_20260113_140420.jpg',
      alt: 'January adventures',
      width: 400,
      height: 500,
      rotation: -1.1,
    },
    {
      id: 12,
      src: '/gallery/IMG_20260115_173555.jpg',
      alt: 'Beautiful day',
      width: 400,
      height: 500,
      rotation: 0.7,
    },
    {
      id: 13,
      src: '/gallery/Screenshot_2025-12-09-17-40-26-026_com.whatsapp.jpg',
      alt: 'Special chat',
      width: 400,
      height: 600,
      rotation: -1.6,
    },
    {
      id: 14,
      src: '/gallery/Screenshot_2026-02-04-22-24-47-636_com.google.android.apps.docs.jpg',
      alt: 'Our plans',
      width: 400,
      height: 600,
      rotation: 1.5,
    },
  ])

  return (
    <motion.div
      className="masonry-container"
      style={{
        columnCount: 1,
        columnGap: '1.5rem',
      }}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      <style jsx>{`
        @media (min-width: 640px) {
          .masonry-container {
            column-count: 2;
          }
        }
        @media (min-width: 1024px) {
          .masonry-container {
            column-count: 3;
          }
        }
      `}</style>

      {images.map((image, index) => (
        <PolaroidImage
          key={image.id}
          image={image}
          index={index}
        />
      ))}
    </motion.div>
  )
}

function PolaroidImage({ image, index }: { image: GalleryImage; index: number }) {
  return (
    <motion.div
      className="polaroid-wrapper mb-6 break-inside-avoid cursor-pointer group"
      variants={itemVariants}
      style={{
        transform: `rotate(${image.rotation}deg)`,
      }}
      whileHover={{
        rotate: 0,
        scale: 1.05,
        zIndex: 10,
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
    >
      <div className="bg-white p-3 pb-12 shadow-scrapbook group-hover:shadow-scrapbook-hover transition-shadow duration-300">
        {/* The Image */}
        <div className="relative w-full aspect-auto overflow-hidden bg-accent/10">
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>

        {/* Handwritten Caption (Polaroid-style) */}
        <div className="mt-3 text-center">
          <p className="font-hand text-ink/70 text-lg">
            {image.alt}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

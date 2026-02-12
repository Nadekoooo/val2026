'use client'

/*
  FloatingDoodles — decorative background SVG shapes.
  
  PERFORMANCE: Uses CSS animations instead of Framer Motion
  to avoid JS animation overhead. CSS animations run on the
  compositor thread and don't block the main thread.
*/

export default function FloatingDoodles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Heart - Top Right */}
      <div
        className="absolute top-20 right-10 text-rose/20 animate-doodle-float-slow"
      >
        <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      {/* Star - Top Left */}
      <div
        className="absolute top-32 left-12 text-accent/25 animate-doodle-float-med"
      >
        <svg width="50" height="50" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </div>

      {/* Sparkle - Middle Right */}
      <div
        className="absolute top-1/3 right-20 text-rose/15 animate-doodle-float-fast"
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3v18M3 12h18M6.5 6.5l11 11M17.5 6.5l-11 11" />
        </svg>
      </div>

      {/* Circle Doodle - Bottom Left */}
      <div
        className="absolute bottom-40 left-16 text-accent/20 animate-doodle-float-slow"
        style={{ animationDelay: '-3s' }}
      >
        <svg width="70" height="70" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
          <circle cx="50" cy="50" r="30" strokeDasharray="5,5" />
          <circle cx="50" cy="50" r="20" />
        </svg>
      </div>

      {/* Scribble - Middle Left */}
      <div
        className="absolute top-2/3 left-8 text-accent/20 animate-doodle-float-med"
        style={{ animationDelay: '-5s' }}
      >
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 50 Q 40 20, 60 50 T 100 50" strokeLinecap="round" />
          <path d="M15 60 Q 35 80, 55 60 T 95 60" strokeLinecap="round" />
        </svg>
      </div>

      {/* Mini Heart - Bottom Right */}
      <div
        className="absolute bottom-24 right-32 text-rose/25 animate-doodle-float-fast"
        style={{ animationDelay: '-2s' }}
      >
        <svg width="35" height="35" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      {/* Triangle Doodle - Top Center */}
      <div
        className="absolute top-16 left-1/2 -translate-x-1/2 text-accent/15 hidden lg:block animate-doodle-float-slow"
        style={{ animationDelay: '-7s' }}
      >
        <svg width="45" height="45" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M50 10 L80 80 L20 80 Z" strokeLinejoin="round" />
        </svg>
      </div>

      {/* CSS keyframes — compositor-thread only, no JS overhead */}
      <style jsx>{`
        @keyframes doodle-float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(4deg); }
        }
        @keyframes doodle-float-med {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(14px) rotate(-3deg); }
          66% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes doodle-float-fast {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-22px) rotate(-5deg); }
        }
        .animate-doodle-float-slow {
          animation: doodle-float-slow 7s ease-in-out infinite;
          will-change: transform;
        }
        .animate-doodle-float-med {
          animation: doodle-float-med 9s ease-in-out infinite;
          will-change: transform;
        }
        .animate-doodle-float-fast {
          animation: doodle-float-fast 5s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  )
}

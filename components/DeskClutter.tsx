'use client'

/* ═══════════════════════════════════════════════
   Desk Clutter — scattered static SVG props
   Sits behind photos but in front of background.
   ═══════════════════════════════════════════════ */

interface ClutterItem {
    id: string
    x: string
    y: string
    rotation: number
    element: React.ReactNode
}

const clutterItems: ClutterItem[] = [
    // ~~ Coffee ring stain ~~
    {
        id: 'coffee',
        x: '12%',
        y: '65%',
        rotation: 15,
        element: (
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="32" stroke="rgba(139,90,43,0.12)" strokeWidth="6" fill="none" />
                <circle cx="40" cy="40" r="28" stroke="rgba(139,90,43,0.06)" strokeWidth="2" fill="none" />
                <ellipse cx="42" cy="38" rx="16" ry="14" fill="rgba(139,90,43,0.04)" />
            </svg>
        ),
    },

    // ~~ Movie ticket stub ~~
    {
        id: 'ticket',
        x: '75%',
        y: '72%',
        rotation: -22,
        element: (
            <div
                className="w-20 h-10 rounded-md flex flex-col items-center justify-center"
                style={{
                    background: 'linear-gradient(135deg, #E8D5B7 0%, #F0E4CF 100%)',
                    border: '1px solid rgba(62,60,60,0.08)',
                    boxShadow: '1px 2px 4px rgba(0,0,0,0.06)',
                }}
            >
                <span className="font-mono text-[7px] text-ink/30 tracking-widest">ADMIT ONE</span>
                <span className="font-hand text-[8px] text-ink/25 mt-0.5">Movie Date ♡</span>
                {/* Perforated edge */}
                <div className="absolute left-0 top-1 bottom-1 w-px border-l border-dashed border-ink/10" />
            </div>
        ),
    },

    // ~~ Dried flower / pressed petal ~~
    {
        id: 'flower',
        x: '82%',
        y: '18%',
        rotation: 45,
        element: (
            <svg width="50" height="64" viewBox="0 0 50 64" fill="none">
                {/* Stem */}
                <path d="M25 60 Q26 40 24 24" stroke="rgba(120,140,90,0.25)" strokeWidth="1.5" fill="none" />
                {/* Petals */}
                <ellipse cx="24" cy="18" rx="8" ry="12" fill="rgba(226,149,120,0.15)" transform="rotate(-15 24 18)" />
                <ellipse cx="28" cy="16" rx="7" ry="11" fill="rgba(212,163,115,0.12)" transform="rotate(20 28 16)" />
                <ellipse cx="22" cy="14" rx="6" ry="10" fill="rgba(226,149,120,0.10)" transform="rotate(-40 22 14)" />
                {/* Center */}
                <circle cx="25" cy="17" r="3" fill="rgba(212,163,115,0.18)" />
            </svg>
        ),
    },

    // ~~ Scribble / doodle ~~
    {
        id: 'scribble',
        x: '8%',
        y: '20%',
        rotation: -8,
        element: (
            <svg width="70" height="30" viewBox="0 0 70 30" fill="none">
                <path
                    d="M5,20 Q15,5 25,18 Q35,30 45,12 Q55,0 65,15"
                    stroke="rgba(62,60,60,0.08)"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />
            </svg>
        ),
    },

    // ~~ Small heart doodle ~~
    {
        id: 'heart',
        x: '55%',
        y: '85%',
        rotation: 12,
        element: (
            <svg width="28" height="26" viewBox="0 0 28 26" fill="none">
                <path
                    d="M14,24 C5,18 1,12 1,7 A5,5 0 0,1 14,5 A5,5 0 0,1 27,7 C27,12 23,18 14,24Z"
                    fill="rgba(226,149,120,0.12)"
                    stroke="rgba(226,149,120,0.18)"
                    strokeWidth="0.8"
                />
            </svg>
        ),
    },

    // ~~ Sticky note scrap ~~
    {
        id: 'stickyScrap',
        x: '35%',
        y: '8%',
        rotation: 6,
        element: (
            <div
                className="w-14 h-12 flex items-center justify-center p-1"
                style={{
                    backgroundColor: 'rgba(255,245,157,0.45)',
                    boxShadow: '1px 2px 4px rgba(0,0,0,0.04)',
                }}
            >
                <span className="font-hand text-[8px] text-ink/25 text-center leading-tight">
                    don&apos;t forget!
                </span>
            </div>
        ),
    },

    // ~~ Paper clip ~~
    {
        id: 'clip',
        x: '60%',
        y: '5%',
        rotation: -35,
        element: (
            <svg width="16" height="40" viewBox="0 0 16 40" fill="none">
                <path
                    d="M4,2 L4,30 Q4,36 8,36 Q12,36 12,30 L12,8 Q12,4 8,4 Q5,4 5,8 L5,26"
                    stroke="rgba(160,160,160,0.3)"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                />
            </svg>
        ),
    },

    // ~~ Washi tape scrap ~~
    {
        id: 'washiScrap',
        x: '22%',
        y: '88%',
        rotation: -5,
        element: (
            <div
                className="w-16 h-4 rounded-sm"
                style={{
                    backgroundColor: 'rgba(212,163,115,0.25)',
                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 4px)',
                }}
            />
        ),
    },
]

export default function DeskClutter() {
    return (
        <div className="absolute inset-0 pointer-events-none z-[1]">
            {clutterItems.map((item) => (
                <div
                    key={item.id}
                    className="absolute"
                    style={{
                        left: item.x,
                        top: item.y,
                        transform: `rotate(${item.rotation}deg)`,
                    }}
                >
                    {item.element}
                </div>
            ))}
        </div>
    )
}

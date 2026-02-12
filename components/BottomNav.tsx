'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mail, ImageIcon, ShoppingCart, FileText } from 'lucide-react'

const navItems = [
    { href: '/', label: 'Home', icon: Mail },
    { href: '/letter', label: 'Letter', icon: FileText },
    { href: '/gallery', label: 'Photos', icon: ImageIcon },
    { href: '/ikea', label: 'IKEA', icon: ShoppingCart },
]

export default function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999]">
            <div
                className="flex items-center gap-1 px-2.5 py-2 rounded-full border border-white/30 shadow-2xl"
                style={{
                    background: 'rgba(255,255,255,0.78)',
                    backdropFilter: 'blur(20px) saturate(1.8)',
                    WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                }}
            >
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`
                relative flex items-center gap-2 px-4 py-2.5 rounded-full
                transition-all duration-300 ease-out select-none
                ${isActive
                                    ? 'bg-accent/15 text-accent shadow-sm'
                                    : 'text-ink/40 hover:text-ink/70 hover:bg-white/40'
                                }
              `}
                        >
                            <Icon
                                className={`w-[18px] h-[18px] transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                            />
                            <span
                                className={`
                  text-xs font-medium tracking-wide overflow-hidden transition-all duration-300
                  ${isActive ? 'max-w-[60px] opacity-100' : 'max-w-0 opacity-0'}
                `}
                            >
                                {label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

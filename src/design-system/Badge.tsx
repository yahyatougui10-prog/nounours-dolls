import React from 'react'

type BadgeTone = 'cyan' | 'red' | 'marron' | 'cream'

const tones: Record<BadgeTone, string> = {
  cyan: 'bg-cyan-tint text-marron-deep ring-cyan/30',
  red: 'bg-red-tint text-red-deep ring-red/20',
  marron: 'bg-marron-tint text-marron ring-marron/15',
  cream: 'bg-cream/15 text-cream ring-cream/25',
}

export interface BadgeProps {
  children: React.ReactNode
  tone?: BadgeTone
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ children, tone = 'cyan', className = '' }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-[9px] font-semibold uppercase leading-[1.6] tracking-[0.2em] ring-1 ring-inset ${tones[tone]} ${className}`}
  >
    {children}
  </span>
)

import React from 'react'
import { brand, neutrals } from './tokens'

export interface BrandMarkProps {
  size?: number
  className?: string
  title?: string
}

/** A custom teddy-bear monogram used across navigation, footer and loading states. */
export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 44,
  className,
  title = 'The Little World',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    role="img"
    aria-label={title}
    className={className}
  >
    <circle cx="16" cy="17" r="9" fill={brand.marron} />
    <circle cx="48" cy="17" r="9" fill={brand.marron} />
    <circle cx="16" cy="17" r="4.4" fill={brand.cyan} />
    <circle cx="48" cy="17" r="4.4" fill={brand.cyan} />
    <ellipse cx="32" cy="35" rx="24" ry="22" fill={brand.marron} />
    <ellipse cx="32" cy="43" rx="13" ry="10" fill={neutrals.cream} />
    <circle cx="24" cy="32" r="2.6" fill={neutrals.ink} />
    <circle cx="40" cy="32" r="2.6" fill={neutrals.ink} />
    <circle cx="24.8" cy="31.2" r="0.8" fill={neutrals.cream} />
    <circle cx="40.8" cy="31.2" r="0.8" fill={neutrals.cream} />
    <ellipse cx="32" cy="39" rx="3.4" ry="2.4" fill={brand.red} />
    <path d="M32 41.5c0 3-3 4.8-6 3.4M32 41.5c0 3 3 4.8 6 3.4" stroke={neutrals.cocoa} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M14 51c5 5 31 5 36 0l2 5c-8 5-32 5-40 0l2-5Z" fill={brand.cyan} />
    <path d="M40 53l7 7-6 2-4-8" fill={brand.red} />
    <path d="M54 9l1.4 3.6L59 14l-3.6 1.4L54 19l-1.4-3.6L49 14l3.6-1.4L54 9Z" fill={brand.cyan} />
  </svg>
)

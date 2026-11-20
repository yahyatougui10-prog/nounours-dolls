/**
 * NOOSH & FRIENDS — design tokens
 * ---------------------------------------------------------------------------
 * A single source of truth for the V6 editorial visual language. Tailwind
 * consumes the mirrored CSS variables in index.css; these values are used by
 * components for inline decoration, imagery and motion timing.
 */

export const brand = {
  red: '#C62828',
  redDeep: '#A82020',
  redTint: '#F8E8E6',
  cyan: '#22C7D6',
  cyanDeep: '#0D7480',
  cyanTint: '#E2F4F6',
  marron: '#795548',
  marronDeep: '#5B3E33',
  marronSoft: '#806454',
  marronTint: '#F1E8E2',
} as const

export const neutrals = {
  ivory: '#FBF7F2',
  paper: '#F7F0E7',
  cream: '#FFFDF9',
  sand: '#EFE6DD',
  blush: '#F6E4E0',
  sky: '#E4F5F7',
  butter: '#F7EEDC',
  cocoa: '#5E4238',
  ink: '#3D2F2F',
  muted: '#7A675E',
  line: 'rgba(121, 85, 72, 0.14)',
  lineStrong: 'rgba(121, 85, 72, 0.24)',
} as const

export const backgrounds = {
  warm: 'linear-gradient(145deg, #FFFDF9 0%, #FBF7F2 55%, #F7F0E7 100%)',
  sky: 'radial-gradient(circle at 15% 20%, rgba(34, 199, 214, 0.14), transparent 45%), #FBF7F2',
  blush: 'radial-gradient(circle at 85% 25%, rgba(198, 40, 40, 0.09), transparent 42%), #FFFDF9',
  cocoa: 'linear-gradient(150deg, #795548 0%, #5E4238 100%)',
  editorial:
    'radial-gradient(circle at 12% 18%, rgba(34, 199, 214, 0.10), transparent 40%), radial-gradient(circle at 88% 82%, rgba(198, 40, 40, 0.07), transparent 38%), #FFFDF9',
} as const

export const typography = {
  display: '"Fraunces", Georgia, serif',
  body: '"Inter", system-ui, -apple-system, sans-serif',
  scale: {
    hero: 'clamp(2.75rem, 4.7vw, 4.9rem)',
    section: 'clamp(2.25rem, 6.2vw, 3.6rem)',
    subhead: 'clamp(1.85rem, 2.5vw, 2.6rem)',
    card: 'clamp(1.1rem, 1.35vw, 1.35rem)',
  },
  tracking: {
    editorial: '-0.032em',
    label: '0.24em',
    eyebrow: '0.3em',
  },
} as const

export const spacing = {
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  6: '1.5rem',
  8: '2rem',
  12: '3rem',
  16: '4rem',
  24: '6rem',
  32: '8rem',
} as const

export const radii = {
  sm: '0.75rem',
  md: '1.25rem',
  lg: '1.75rem',
  xl: '2.25rem',
  organic: '48% 48% 2.25rem 2.25rem / 38% 38% 2.25rem 2.25rem',
} as const

export const shadows = {
  soft: '0 1px 2px rgba(91, 62, 51, 0.05), 0 14px 34px -24px rgba(91, 62, 51, 0.32)',
  lift: '0 1px 2px rgba(91, 62, 51, 0.06), 0 30px 64px -32px rgba(91, 62, 51, 0.38)',
  glow: '0 0 0 1px rgba(34, 199, 214, 0.28), 0 18px 44px -30px rgba(34, 199, 214, 0.5)',
  campaign: '0 2px 4px rgba(91, 62, 51, 0.05), 0 44px 96px -48px rgba(91, 62, 51, 0.48)',
  modal: '0 48px 120px -44px rgba(45, 30, 24, 0.55)',
} as const

export const motionTokens = {
  fast: 0.2,
  base: 0.45,
  reveal: 0.7,
  slow: 0.9,
  cinematic: 1.15,
  stagger: 0.08,
  staggerDelay: 0.06,
  ease: [0.22, 1, 0.36, 1] as const,
} as const

export const identity = {
  name: 'NOOSH & FRIENDS',
  legalName: 'Nounours & Dolls',
  world: 'A LITTLE WORLD OF HAPPINESS',
  line: 'Where Every Friend Has a Story',
  heroHeadline: 'A Little World of Love, Made for You.',
  heroSubtitle:
    'Meet your new favorite companions. Discover adorable teddy bears and beautiful dolls that turn little moments into precious memories.',
  primaryCta: 'Discover the Collection',
  secondaryCta: 'Meet Our Little Friends',
} as const

export const social = {
  instagram: 'https://www.instagram.com',
  facebook: 'https://www.facebook.com',
  pinterest: 'https://www.pinterest.com',
} as const

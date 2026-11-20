import React from 'react'
import { Reveal } from './Reveal'

export interface SectionHeadingProps {
  eyebrow: string
  title: React.ReactNode
  description?: string
  align?: 'left' | 'center'
  invert?: boolean
  headingLevel?: 'h1' | 'h2'
  className?: string
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  align = 'left',
  invert = false,
  headingLevel: Heading = 'h2',
  className = '',
}) => (
  <Reveal
    className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-3xl ${className}`}
  >
    <div className="mb-6 flex items-center gap-3">
      <span className={`h-px w-10 ${invert ? 'bg-cyan/70' : 'bg-cyan-deep'}`} aria-hidden="true" />
      <span
        className={`label-micro ${invert ? 'text-cyan' : 'text-marron-soft'}`}
      >
        {eyebrow}
      </span>
    </div>
    <Heading
      className={`text-balance font-display text-[length:var(--type-section)] font-medium leading-[1.05] ${
        invert ? 'text-cream' : 'text-marron'
      }`}
    >
      {title}
    </Heading>
    {description && (
      <p
        className={`mt-6 max-w-xl text-pretty text-[0.95rem] leading-[1.8] sm:text-base ${
          align === 'center' ? 'mx-auto' : ''
        } ${invert ? 'text-cream/70' : 'text-muted'}`}
      >
        {description}
      </p>
    )}
  </Reveal>
)

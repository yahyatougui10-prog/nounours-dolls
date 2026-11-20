import React from 'react'
import { motion, useMotionValue, useSpring, type HTMLMotionProps } from 'framer-motion'

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'link'
  | 'magnetic'

export type ButtonSize = 'sm' | 'default' | 'lg' | 'icon'

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-marron text-cream shadow-lift ring-1 ring-inset ring-white/10 hover:bg-marron-deep',
  accent: 'bg-cyan text-marron-deep shadow-soft ring-1 ring-inset ring-white/25 hover:bg-cyan-deep hover:text-cream',
  secondary: 'bg-cream text-marron ring-1 ring-inset ring-marron/20 hover:ring-cyan/60 hover:bg-white',
  ghost: 'text-marron hover:bg-marron/5 hover:text-cyan-deep',
  danger: 'bg-red text-white shadow-soft ring-1 ring-inset ring-white/10 hover:bg-red-deep',
  link: 'text-marron underline decoration-cyan/50 underline-offset-4 hover:decoration-cyan hover:text-cyan-deep',
  magnetic: 'bg-marron text-cream shadow-lift ring-1 ring-inset ring-white/15 hover:bg-marron-deep',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-5 py-2.5 text-[11px]',
  default: 'min-h-12 px-7 py-3.5 text-xs',
  lg: 'min-h-14 px-8 py-4 text-xs sm:text-sm',
  icon: 'h-12 w-12 p-0',
}

const buttonClassName = (
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  className: string,
) =>
  [
    'relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full font-semibold tracking-[0.06em]',
    'transition-[background-color,box-shadow,color] duration-300 disabled:pointer-events-none disabled:opacity-50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
    variants[variant],
    sizes[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}) => (
  <motion.button
    whileHover={disabled ? undefined : { y: -2 }}
    whileTap={disabled ? undefined : { scale: 0.975 }}
    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
    className={buttonClassName(variant, size, fullWidth, className)}
    disabled={disabled}
    {...props}
  >
    {children}
  </motion.button>
)

/**
 * A CTA that leans toward the pointer while preserving every native button
 * behaviour. Used sparingly for the hero and primary conversion moments.
 */
export const MagneticButton: React.FC<ButtonProps> = ({
  variant = 'magnetic',
  size = 'default',
  fullWidth = false,
  className = '',
  disabled,
  children,
  style,
  onMouseMove,
  onMouseLeave,
  ...props
}) => {
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 260, damping: 20, mass: 0.4 })
  const y = useSpring(rawY, { stiffness: 260, damping: 20, mass: 0.4 })

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      rawX.set((event.clientX - rect.left - rect.width / 2) * 0.18)
      rawY.set((event.clientY - rect.top - rect.height / 2) * 0.22)
    }
    onMouseMove?.(event)
  }

  const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    rawX.set(0)
    rawY.set(0)
    onMouseLeave?.(event)
  }

  return (
    <motion.button
      ref={buttonRef}
      style={{ ...style, x, y }}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.975 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={buttonClassName(variant, size, fullWidth, className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  )
}

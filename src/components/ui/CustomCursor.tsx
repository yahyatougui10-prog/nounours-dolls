import React from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const INTERACTIVE_SELECTOR = 'button, a, [role="button"], [data-cursor]'

/**
 * A restrained cyan ring that trails the pointer on fine-pointer, motion-friendly
 * devices. The native cursor is never hidden or replaced.
 */
export const CustomCursor: React.FC = () => {
  const [enabled, setEnabled] = React.useState(
    () =>
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [visible, setVisible] = React.useState(false)
  const [isHovering, setIsHovering] = React.useState(false)
  const pointerX = useMotionValue(-100)
  const pointerY = useMotionValue(-100)
  const x = useSpring(pointerX, { stiffness: 420, damping: 34, mass: 0.4 })
  const y = useSpring(pointerY, { stiffness: 420, damping: 34, mass: 0.4 })

  React.useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const finePointer = window.matchMedia('(pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      const next = finePointer.matches && !reducedMotion.matches
      setEnabled(next)
      if (!next) {
        setVisible(false)
        setIsHovering(false)
      }
    }

    finePointer.addEventListener('change', update)
    reducedMotion.addEventListener('change', update)
    return () => {
      finePointer.removeEventListener('change', update)
      reducedMotion.removeEventListener('change', update)
    }
  }, [])

  React.useEffect(() => {
    if (!enabled) return

    const handlePointerMove = (event: PointerEvent) => {
      pointerX.set(event.clientX)
      pointerY.set(event.clientY)
      setVisible(true)
      setIsHovering(
        event.target instanceof Element && Boolean(event.target.closest(INTERACTIVE_SELECTOR)),
      )
    }
    const handleLeave = () => setVisible(false)

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.addEventListener('pointerleave', handleLeave)
    window.addEventListener('blur', handleLeave)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerleave', handleLeave)
      window.removeEventListener('blur', handleLeave)
    }
  }, [enabled, pointerX, pointerY])

  if (!enabled) return null

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[120]"
      style={{ x, y }}
    >
      <motion.div
        animate={{ opacity: visible ? 1 : 0, scale: isHovering ? 1.55 : 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        className="-ml-2.5 -mt-2.5 h-5 w-5 rounded-full border border-cyan/80 bg-cyan/10 shadow-glow"
      >
        <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan" />
      </motion.div>
    </motion.div>
  )
}

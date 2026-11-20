import type { Variants } from 'framer-motion'
import { motionTokens } from './tokens'

export const editorialEase = motionTokens.ease

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.reveal, ease: editorialEase },
  },
}

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: motionTokens.stagger, delayChildren: motionTokens.staggerDelay },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.base, ease: editorialEase },
  },
}

export const softScale: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: motionTokens.base, ease: editorialEase },
  },
}

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.base, ease: editorialEase },
  },
  exit: { opacity: 0, y: -10, transition: { duration: motionTokens.fast, ease: editorialEase } },
}

export const imageReveal: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: motionTokens.slow, ease: editorialEase },
  },
}

export const imageSwap: Variants = {
  initial: { opacity: 0, scale: 1.04 },
  animate: { opacity: 1, scale: 1, transition: { duration: motionTokens.base, ease: editorialEase } },
  exit: { opacity: 0, scale: 0.99, transition: { duration: motionTokens.fast + 0.08, ease: editorialEase } },
}

export const drawerVariants: Variants = {
  initial: { x: '100%' },
  animate: { x: 0, transition: { type: 'spring', stiffness: 320, damping: 34 } },
  exit: { x: '100%', transition: { duration: motionTokens.fast + 0.08, ease: editorialEase } },
}

export const modalVariants: Variants = {
  initial: { opacity: 0, y: 18, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: motionTokens.base, ease: editorialEase },
  },
  exit: { opacity: 0, y: 10, scale: 0.98, transition: { duration: motionTokens.fast } },
}

export const toastVariants: Variants = {
  initial: { opacity: 0, y: 24, scale: 0.94 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 380, damping: 30 },
  },
  exit: { opacity: 0, y: 12, scale: 0.97, transition: { duration: motionTokens.fast } },
}

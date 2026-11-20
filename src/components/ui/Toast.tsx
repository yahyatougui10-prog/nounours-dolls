import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { toastVariants } from '../../design-system/motion'

export interface ToastProps {
  message: string | null
  position?: 'bottom' | 'top'
}

export const Toast: React.FC<ToastProps> = ({ message, position = 'bottom' }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        variants={toastVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        role="status"
        aria-live="polite"
        className={`fixed left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-full border border-cream/15 bg-marron px-5 py-3.5 text-cream shadow-lift ${
          position === 'top' ? 'top-24' : 'bottom-6'
        }`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan text-marron">
          <Check className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{message}</span>
      </motion.div>
    )}
  </AnimatePresence>
)

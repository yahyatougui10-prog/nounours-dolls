import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

export interface AssistanceButtonProps {
  hidden?: boolean
  onClick: () => void
}

export const AssistanceButton: React.FC<AssistanceButtonProps> = ({ hidden = false, onClick }) => (
  <AnimatePresence>
    {!hidden && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 12 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 320, damping: 26 }}
        className="group fixed bottom-24 right-4 z-30 lg:bottom-7 lg:right-7"
      >
        <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full border border-marron/10 bg-cream px-4 py-2 text-[11px] font-semibold text-marron opacity-0 shadow-soft transition-all duration-300 group-hover:opacity-100">
          Need a little help?
        </span>
        <motion.button
          type="button"
          onClick={onClick}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Chat with our boutique team"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-marron text-cream shadow-lift ring-1 ring-cyan/50 transition-colors hover:bg-cyan hover:text-marron"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        </motion.button>
      </motion.div>
    )}
  </AnimatePresence>
)

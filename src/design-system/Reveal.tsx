import React from 'react'
import { motion } from 'framer-motion'
import { editorialEase } from './motion'
import { motionTokens } from './tokens'

export interface RevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
}

export const Reveal: React.FC<RevealProps> = ({ children, className, delay = 0, y = 24 }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: motionTokens.reveal, delay, ease: editorialEase }}
  >
    {children}
  </motion.div>
)

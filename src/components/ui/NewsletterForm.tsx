import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'

export interface NewsletterFormProps {
  tone?: 'light' | 'dark'
  className?: string
}

export const NewsletterForm: React.FC<NewsletterFormProps> = ({
  tone = 'light',
  className = '',
}) => {
  const id = React.useId()
  const [email, setEmail] = React.useState('')
  const [subscribed, setSubscribed] = React.useState(false)

  const isDark = tone === 'dark'

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
    setEmail('')
  }

  return (
    <div className={className}>
      <form onSubmit={submit} className="flex w-full max-w-lg gap-2">
        <label htmlFor={id} className="sr-only">
          Email address for boutique updates
        </label>
        <input
          id={id}
          type="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            setSubscribed(false)
          }}
          placeholder="Your email address"
          className={[
            'min-w-0 flex-1 rounded-full px-5 py-3 text-sm outline-none transition-all',
            isDark
              ? 'border border-cream/20 bg-white/5 text-cream placeholder:text-cream/40 focus:border-cyan focus:ring-2 focus:ring-cyan/30'
              : 'border border-marron/15 bg-white text-marron placeholder:text-muted/70 shadow-sm focus:border-cyan focus:ring-2 focus:ring-cyan/25',
          ].join(' ')}
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Subscribe to newsletter"
          className={[
            'flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full transition-colors',
            isDark
              ? 'bg-cyan text-marron hover:bg-cyan/85'
              : 'bg-marron text-cream hover:bg-cyan hover:text-marron',
          ].join(' ')}
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </motion.button>
      </form>
      {subscribed && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className={`mt-2 flex items-center gap-1.5 text-xs ${isDark ? 'text-cyan' : 'text-marron'}`}
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Thank you — you're on the list.
        </motion.p>
      )}
    </div>
  )
}

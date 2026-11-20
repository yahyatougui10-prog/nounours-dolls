import React from 'react'
import { Send } from 'lucide-react'
import { Badge } from '../../design-system/Badge'
import { Reveal } from '../../design-system/Reveal'
import { NewsletterForm } from '../ui/NewsletterForm'

export const Newsletter: React.FC = () => (
  <section className="bg-cream section-y" id="newsletter">
    <div className="page-container">
      <Reveal>
        <div className="relative rounded-5xl bg-gradient-to-br from-cyan/20 via-cream to-red/10 px-6 py-12 shadow-soft sm:px-12 sm:py-16 lg:px-16">
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="min-w-0">
              <Badge tone="marron" className="mb-6 bg-cream/80">
                <Send className="mr-1.5 h-3 w-3" aria-hidden="true" />
                The little letter · 08
              </Badge>
              <h2 className="max-w-2xl text-balance text-4xl font-medium leading-[1.05] text-marron sm:text-5xl">
                Stay in the little loop.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
                New arrivals, gentle stories and boutique finds — delivered with care, never clutter.
              </p>
            </div>

            <div className="relative min-w-0">
              <div className="rounded-4xl border border-marron/10 bg-cream/90 p-6 shadow-soft backdrop-blur-sm sm:p-8">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-marron/70">
                  Join our little circle
                </p>
                <NewsletterForm />
                <p className="mt-4 text-[11px] leading-relaxed text-muted">
                  Thoughtful notes only. Unsubscribe whenever you like.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
)

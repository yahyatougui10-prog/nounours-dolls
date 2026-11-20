import React from 'react'
import { motion } from 'framer-motion'
import { Heart, ShieldCheck, Sparkles } from 'lucide-react'
import { Reveal } from '../../design-system/Reveal'
import { SectionHeading } from '../../design-system/SectionHeading'

const reasons = [
  {
    icon: Heart,
    title: 'Chosen with heart',
    description: 'We only offer pieces we would happily give to someone we love.',
  },
  {
    icon: Sparkles,
    title: 'A little more magic',
    description: 'Beautiful details that make each companion feel personal and alive.',
  },
  {
    icon: ShieldCheck,
    title: 'Care you can trust',
    description: 'From your first question to the final little surprise, we are here to help.',
  },
]

export const CustomerLove: React.FC = () => (
  <section className="bg-paper-texture section-y" id="customer-love">
    <div className="page-container">
      <SectionHeading
        eyebrow="Customer love · 07"
        title={<>The little details families keep coming back for.</>}
        description="No real toys, no empty promises — just thoughtful companions and a boutique experience that feels warm from the very first hello."
        align="center"
      />

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {reasons.map((reason, index) => (
          <Reveal key={reason.title} delay={index * 0.08}>
            <motion.article
              whileHover={{ y: -5 }}
              className="h-full rounded-5xl border border-marron/10 bg-cream p-7 shadow-soft transition-shadow duration-500 hover:shadow-lift sm:p-8"
            >
              <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-marron/8 text-marron">
                <reason.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-display text-2xl font-medium text-marron">{reason.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{reason.description}</p>
            </motion.article>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12 text-center" delay={0.15}>
        <p className="mx-auto max-w-2xl font-display text-xl italic leading-relaxed text-marron/80 sm:text-2xl">
          "A beautiful little friend is never just a toy — it becomes part of a story."
        </p>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan">
          The Nounours &amp; Dolls belief
        </p>
      </Reveal>
    </div>
  </section>
)

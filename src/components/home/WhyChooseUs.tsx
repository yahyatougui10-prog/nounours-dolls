import React from 'react'
import { motion } from 'framer-motion'
import { Gift, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react'
import { SectionHeading } from '../../design-system/SectionHeading'

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Quality you can feel',
    description: 'Thoughtful materials, careful finishes and companions made for everyday cuddles.',
  },
  {
    icon: Sparkles,
    title: 'Details that delight',
    description: 'Embroidered expressions, soft textures and little surprises hidden in every piece.',
  },
  {
    icon: HeartHandshake,
    title: 'Handpicked with care',
    description: 'We choose each treasure individually, never filling the boutique with anything ordinary.',
  },
  {
    icon: Gift,
    title: 'Joy worth sharing',
    description: 'Beautiful to give, even better to receive — and made to be loved for years.',
  },
]

export const WhyChooseUs: React.FC = () => (
  <section className="bg-marron relative section-y text-cream" id="why-choose-us">
    <div className="relative page-container">
      <SectionHeading
        eyebrow="The promise · 06"
        title={<>A boutique built around little moments.</>}
        description="We believe the smallest details often become the biggest memories. That belief guides everything we choose."
        align="center"
        invert
      />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((pillar, index) => (
          <motion.article
            key={pillar.title}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: index * 0.07 }}
            className="rounded-4xl border border-cream/10 bg-cream/[0.06] p-6 backdrop-blur-sm transition-colors duration-300 hover:border-cyan/40 hover:bg-cream/10 sm:p-7"
          >
            <span className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-cyan/15 text-cyan">
              <pillar.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="font-display text-xl font-medium text-cream">{pillar.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-cream/65">{pillar.description}</p>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
)

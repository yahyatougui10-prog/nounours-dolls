import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react'
import { Badge } from '../../design-system/Badge'
import { Reveal } from '../../design-system/Reveal'
import { Button } from '../ui/Button'
import { assetUrl } from '../../lib/assets'

export interface AboutPageProps {
  onExplore: () => void
  onContact: () => void
}

const values = [
  {
    icon: ShieldCheck,
    title: 'Quality first',
    description: 'We carefully select each piece for its craftsmanship, materials and enduring appeal.',
  },
  {
    icon: Sparkles,
    title: 'Handpicked selection',
    description: 'Our team personally curates every item so nothing ordinary makes it onto the shelves.',
  },
  {
    icon: HeartHandshake,
    title: 'Customer joy',
    description: 'Your happiness is our greatest reward. We are here to help you find the perfect companion.',
  },
]

const steps = [
  { number: '01', title: 'We look closely', description: 'Texture, expression, stitching, softness — every detail matters.' },
  { number: '02', title: 'We choose with heart', description: 'Only the pieces that feel special enough to become someone’s favourite.' },
  { number: '03', title: 'We share the joy', description: 'Beautifully presented, thoughtfully described and ready to become a memory.' },
]

export const AboutPage: React.FC<AboutPageProps> = ({ onExplore, onContact }) => (
  <section className="bg-paper-texture pb-28 pt-28 sm:pt-32" id="about">
    <div className="page-container">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <Badge tone="cyan" className="mb-6">Our story · Since 2024</Badge>
          <h1 className="max-w-2xl text-balance font-display text-[length:var(--type-section)] font-medium leading-[1.06] text-marron">
            More than toys, they're <span className="display-italic">little memories.</span>
          </h1>
          <p className="mt-7 max-w-xl text-pretty text-base leading-[1.85] text-muted sm:text-lg">
            At Nounours & Dolls, we believe that every teddy bear and doll carries a special meaning.
            Since our founding in 2024, we've been dedicated to curating the most charming collection
            of companion pieces that warm hearts and inspire imagination.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button variant="primary" onClick={onExplore}>
              Explore the collection
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button variant="secondary" onClick={onContact}>
              Talk to our boutique
            </Button>
          </div>
        </div>

        <Reveal className="relative">
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.6 }}
            className="frame-image h-[400px] rounded-5xl shadow-lift sm:h-[560px]"
          >
            <img
              src={assetUrl('/about-hero.jpg')}
              alt="The Nounours and Dolls boutique collection"
              className="h-full w-full object-cover"
            />
          </motion.div>
          <div className="glass-panel absolute -bottom-5 -left-3 rounded-3xl px-6 py-5 text-marron sm:-left-7">
            <p className="font-display text-2xl font-medium">A little wonder for every story.</p>
            <p className="label-micro mt-2 text-cyan-deep">Paris · Since 2024</p>
          </div>
        </Reveal>
      </div>

      <div className="mt-24 grid gap-4 md:grid-cols-3">
        {values.map((value, index) => (
          <motion.article
            key={value.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: index * 0.07 }}
            className="rounded-4xl border border-marron/12 bg-cream p-6 shadow-soft sm:p-8"
          >
            <span className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-cyan-tint text-cyan-deep">
              <value.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-display text-xl font-medium text-marron-deep">{value.title}</h2>
            <p className="mt-3 text-sm leading-[1.8] text-muted">{value.description}</p>
          </motion.article>
        ))}
      </div>

      <div className="mt-24 overflow-hidden rounded-5xl bg-marron-deep p-8 text-cream shadow-lift ring-1 ring-white/5 sm:p-12">
        <p className="label-micro mb-4 text-cyan">
          How we choose
        </p>
        <h2 className="max-w-2xl text-balance font-display text-[length:var(--type-subhead)] font-medium leading-[1.12] text-cream">
          Every little friend earns its place.
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number}>
              <p className="font-display text-4xl text-cyan/80">{step.number}</p>
              <span className="mt-4 block h-px w-10 bg-cyan/40" aria-hidden="true" />
              <h3 className="mt-4 font-display text-lg font-medium text-cream">{step.title}</h3>
              <p className="mt-2 text-sm leading-[1.8] text-cream/65">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
)

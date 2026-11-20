import React from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight, Heart } from 'lucide-react'
import { Button } from './Button'
import { Badge } from '../../design-system/Badge'
import { editorialEase } from '../../design-system/motion'
import { identity, motionTokens } from '../../design-system/tokens'
import { assetUrl } from '../../lib/assets'

export interface HeroSectionProps {
  onExploreCollection: () => void
  onMeetFriends: () => void
  eyebrow?: string
  headline?: string
  subtitle?: string
}

const trustPoints = ['Handpicked', 'Made with care', 'Made to be loved']

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreCollection,
  onMeetFriends,
  eyebrow = `${identity.name} — ${identity.world}`,
  headline = identity.heroHeadline,
  subtitle = identity.heroSubtitle,
}) => {
  const [beforeLove, ...afterLove] = headline.split(/Love/i)

  return (
    <section
      className="bg-hero relative isolate flex min-h-[100svh] items-center pb-20 pt-28 sm:pb-24 lg:pb-16"
      aria-labelledby="hero-headline"
    >
      <div className="page-container grid w-full items-center gap-12 lg:grid-cols-[minmax(0,48fr)_minmax(0,52fr)] lg:gap-10 xl:gap-16">
        {/* Copy — one reading order, no decorative text inside this column. */}
        <div className="flex max-w-[36rem] flex-col items-start">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.base, ease: editorialEase }}
          >
            <Badge tone="cyan" className="gap-2 bg-cream/90 px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
              {eyebrow}
            </Badge>
          </motion.div>

          <motion.h1
            id="hero-headline"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.reveal, delay: 0.06, ease: editorialEase }}
            className="mt-7 max-w-[6.8em] font-display text-[length:var(--type-hero)] font-medium leading-[1.03] tracking-[-0.035em] text-marron lg:max-w-[6.5em]"
          >
            {beforeLove}
            <span className="relative inline-block italic text-red">{afterLove.length ? 'Love' : ''}</span>
            {afterLove.join('')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.reveal, delay: 0.14, ease: editorialEase }}
            className="mt-7 max-w-[32rem] text-pretty text-[0.95rem] leading-[1.85] text-muted sm:text-[1.05rem]"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.reveal, delay: 0.22, ease: editorialEase }}
            className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-3"
          >
            <Button size="default" onClick={onExploreCollection} className="w-full whitespace-nowrap sm:w-auto">
              {identity.primaryCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="secondary"
              size="default"
              onClick={onMeetFriends}
              className="w-full whitespace-nowrap sm:w-auto"
            >
              {identity.secondaryCta}
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: motionTokens.reveal, delay: 0.34 }}
            className="mt-10 flex w-full flex-wrap items-center gap-x-6 gap-y-2 border-t border-marron/10 pt-6"
          >
            {trustPoints.map((point) => (
              <span key={point} className="label-micro flex items-center gap-2 text-muted">
                <span className="h-1 w-1 rounded-full bg-cyan-deep" aria-hidden="true" />
                {point}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Editorial image composition — three portraits, one shared ground. */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionTokens.reveal, delay: 0.1, ease: editorialEase }}
          className="mx-auto w-full max-w-[36rem] lg:max-w-none"
        >
          <div className="relative grid aspect-[4/4.35] w-full grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[repeat(12,minmax(0,1fr))] sm:aspect-[4/4.1]">
            <div className="absolute inset-[6%_4%_2%_2%] rounded-[3.5rem] bg-sand/45" aria-hidden="true" />

            <div className="frame-image arch-image col-start-1 col-end-9 row-start-1 row-end-10 z-10 shadow-lift">
              <img
                src={assetUrl('/products/toys/nounours/nounours_001.png')}
                alt="A soft handpicked teddy bear"
                className="h-full w-full object-cover object-center"
                fetchPriority="high"
              />
            </div>

            <div className="frame-image col-start-7 col-end-13 row-start-5 row-end-13 z-20 rounded-[2.5rem_2.5rem_48%_48%/2.5rem_2.5rem_38%_38%] border-[6px] border-ivory shadow-campaign sm:border-8">
              <img
                src={assetUrl('/products/toys/dolls/doll_001.png')}
                alt="An elegant handmade doll"
                className="h-full w-full object-cover object-center"
              />
            </div>

            <div className="frame-image col-start-1 col-end-5 row-start-9 row-end-13 z-30 hidden rounded-3xl border-4 border-ivory shadow-lift sm:block">
              <img
                src={assetUrl('/products/toys/nounours/nounours_013.png')}
                alt="A beautifully presented little gift set"
                className="h-full w-full object-cover object-center"
              />
            </div>

            <div
              aria-hidden="true"
              className="col-start-8 col-end-13 row-start-1 row-end-3 z-40 hidden items-center justify-center gap-2 self-start justify-self-end rounded-full border border-marron/10 bg-cream/95 px-4 py-2 text-marron shadow-soft lg:flex"
            >
              <Heart className="h-3.5 w-3.5 fill-red text-red" aria-hidden="true" />
              <span className="label-micro">Made with love</span>
            </div>
          </div>
        </motion.div>
      </div>

      <span className="absolute inset-x-0 bottom-0 h-px bg-marron/10" aria-hidden="true" />
    </section>
  )
}

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Heart, Sparkles } from 'lucide-react'
import { Badge } from '../../design-system/Badge'
import { Reveal } from '../../design-system/Reveal'
import { editorialEase } from '../../design-system/motion'
import { identity } from '../../design-system/tokens'
import { Button } from '../ui/Button'
import { assetUrl } from '../../lib/assets'

export interface WelcomeStoryProps {
  headline?: string
  body?: string
  onExploreCollection: () => void
  onMeetFriends: () => void
}

export const WelcomeStory: React.FC<WelcomeStoryProps> = ({
  headline = 'Some friends are meant to be found.',
  body = 'Not just toys — little companions with a softness you can feel and a character you remember. Every piece in our boutique is chosen by hand, for the moments it will quietly become part of.',
  onExploreCollection,
  onMeetFriends,
}) => (
  <section className="bg-warm relative section-y" id="welcome-world" aria-labelledby="welcome-headline">
    <div className="relative page-container grid items-center gap-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20">
      <div className="max-w-2xl">
        <Reveal>
          <div className="mb-8 flex items-center gap-4">
            <span className="font-display text-sm font-semibold tabular-nums text-cyan-deep">01 / 05</span>
            <span className="h-px w-12 bg-cyan/60" aria-hidden="true" />
            <span className="label-micro text-marron-soft">
              Welcome to our little world
            </span>
          </div>
        </Reveal>

        <motion.h2
          id="welcome-headline"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.85, ease: editorialEase }}
          className="text-balance font-display text-[length:var(--type-hero)] font-medium leading-[1.04] text-marron"
        >
          {headline.split(' ').map((word, index) =>
            word.endsWith('found.') ? (
              <span key={`${word}-${index}`} className="relative inline-block italic text-red">
                {word}
                <svg className="absolute -bottom-2 left-0 w-full text-cyan/70" viewBox="0 0 200 14" fill="none" aria-hidden="true">
                  <path d="M3 10c48-8 112-9 194-4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            ) : (
              <React.Fragment key={`${word}-${index}`}>{word} </React.Fragment>
            ),
          )}
        </motion.h2>

        <Reveal delay={0.1}>
          <p className="mt-9 max-w-xl text-base leading-[1.9] text-muted sm:text-lg">{body}</p>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" onClick={onExploreCollection}>
              Enter the boutique
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="lg" onClick={onMeetFriends}>
              Meet our little friends
              <Heart className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.22}>
          <div className="mt-12 flex flex-wrap gap-2">
            <Badge tone="marron"><Sparkles className="mr-1.5 h-3 w-3" aria-hidden="true" /> {identity.line}</Badge>
            <Badge tone="cyan">Handpicked in Paris</Badge>
          </div>
        </Reveal>
      </div>

      <Reveal y={40} className="relative mx-auto h-[430px] w-full max-w-xl sm:h-[560px] lg:h-[620px]">
        <div className="frame-image arch-image absolute left-[4%] top-0 h-[78%] w-[70%] shadow-lift ring-1 ring-marron/10">
          <img src={assetUrl('/about-hero.jpg')} alt="A handpicked collection of little friends" loading="lazy" className="h-full w-full object-cover" />
          <span className="image-tint absolute inset-0" aria-hidden="true" />
        </div>

        <div className="frame-image absolute bottom-[4%] right-[2%] h-[48%] w-[48%] rounded-[2.5rem_2.5rem_46%_46%/2.5rem_2.5rem_34%_34%] border-[7px] border-ivory shadow-campaign sm:border-[10px]">
          <img src={assetUrl('/gallery/closeup1.jpg')} alt="A close-up of thoughtful hand-finished details" loading="lazy" className="h-full w-full object-cover" />
        </div>
      </Reveal>
    </div>
  </section>
)

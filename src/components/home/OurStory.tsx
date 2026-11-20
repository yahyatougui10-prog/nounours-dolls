import React from 'react'
import { ArrowRight, Heart } from 'lucide-react'
import { Badge } from '../../design-system/Badge'
import { Reveal } from '../../design-system/Reveal'
import { Button } from '../ui/Button'
import { assetUrl } from '../../lib/assets'

export interface OurStoryProps {
  onReadStory: () => void
}

export const OurStory: React.FC<OurStoryProps> = ({ onReadStory }) => (
  <section className="relative bg-marron section-y text-cream" id="our-story">
    <div className="relative page-container grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
      <Reveal className="relative order-first lg:order-last" y={30}>
        <div className="relative mx-auto h-[420px] w-full max-w-lg sm:h-[560px]">
          <div className="frame-image arch-image absolute left-0 top-0 h-[88%] w-[76%] overflow-hidden shadow-lift">
            <img
              src={assetUrl('/about-hero.jpg')}
              alt="The Nounours and Dolls boutique collection"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="frame-image absolute bottom-0 right-0 h-[46%] w-[48%] overflow-hidden rounded-[2.5rem] border-[6px] border-marron shadow-lift">
            <img
              src={assetUrl('/gallery/closeup1.jpg')}
              alt="A close-up of thoughtful hand-finished details"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </Reveal>

      <div>
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-10 bg-cyan" aria-hidden="true" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan">
            Our story · The little world
          </span>
        </div>

        <h2 className="max-w-2xl text-balance font-display text-4xl font-medium leading-[1.05] tracking-editorial text-cream sm:text-5xl lg:text-[3.6rem]">
          Every Little Friend Has a Story to Tell.
        </h2>

        <p className="mt-7 max-w-xl text-base leading-[1.85] text-cream/70 sm:text-lg">
          It began in 2024 with one very special teddy. We imagined a boutique where softness,
          craftsmanship and emotion mattered just as much as how something looks — a place where
          every companion feels chosen, never mass-produced.
        </p>

        <div className="mt-10 grid gap-7 border-l border-cyan/40 pl-6 sm:grid-cols-2 sm:gap-9">
          <div>
            <h3 className="font-display text-xl font-medium text-cream">Handpicked, always</h3>
            <p className="mt-2 text-sm leading-relaxed text-cream/60">
              Every toy is chosen by hand for its character, quality and the feeling it gives.
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl font-medium text-cream">Made for real life</h3>
            <p className="mt-2 text-sm leading-relaxed text-cream/60">
              Companions for bedtime, tea parties, long journeys and all the quiet moments between.
            </p>
          </div>
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Badge tone="cream" className="bg-cream/10 text-cream ring-cream/20">Small boutique</Badge>
          <Badge tone="cream" className="bg-red/20 text-cream ring-red/30">Big heart</Badge>
          <span className="inline-flex items-center gap-2 text-xs text-cream/60">
            <Heart className="h-3.5 w-3.5 fill-cyan text-cyan" aria-hidden="true" />
            Paris, France
          </span>
        </div>

        <Button variant="accent" size="lg" className="mt-10" onClick={onReadStory}>
          Read our full story
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  </section>
)

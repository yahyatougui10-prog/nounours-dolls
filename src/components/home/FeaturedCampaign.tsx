import React from 'react'
import { ArrowRight, Gift, Sparkles } from 'lucide-react'
import { Badge } from '../../design-system/Badge'
import { Reveal } from '../../design-system/Reveal'
import { SectionHeading } from '../../design-system/SectionHeading'
import { MagneticButton } from '../ui/Button'
import { assetUrl } from '../../lib/assets'

export interface FeaturedCampaignProps {
  onExploreGifts: () => void
  onExploreNew: () => void
  onOpenGiftStudio?: () => void
}

interface Campaign {
  eyebrow: string
  title: React.ReactNode
  description: string
  image: string
  cta: string
  action: 'gifts' | 'new'
  tone: 'red' | 'cyan'
}

const campaigns: Campaign[] = [
  {
    eyebrow: 'The little gift edit',
    title: <>The sweetest way to say <em className="italic">“I thought of you.”</em></>,
    description: 'From birthdays to just-because moments, find a companion that says it beautifully — without saying a word.',
    image: assetUrl('/products/toys/nounours/nounours_013.png'),
    cta: 'Explore gifts',
    action: 'gifts',
    tone: 'red',
  },
  {
    eyebrow: 'The new-friend edit',
    title: <>Fresh faces. <em className="italic">Big feeling.</em></>,
    description: 'New little friends with crowns, hearts and storybook details — each one ready to become someone’s favourite.',
    image: assetUrl('/products/toys/dolls/doll_003.png'),
    cta: 'Discover new arrivals',
    action: 'new',
    tone: 'cyan',
  },
]

const CampaignBanner: React.FC<{ campaign: Campaign; index: number; onAction: (action: Campaign['action']) => void; onOpenGiftStudio?: () => void }> = ({
  campaign,
  index,
  onAction,
  onOpenGiftStudio,
}) => {
  const isRed = campaign.tone === 'red'

  return (
    <Reveal y={34} delay={index * 0.1}>
      <div className={`group relative isolate overflow-hidden rounded-5xl shadow-campaign ring-1 ring-white/5 sm:rounded-6xl ${isRed ? 'bg-red-deep' : 'bg-cocoa'}`}>
        <div className="grid min-h-[440px] lg:min-h-[520px] lg:grid-cols-2">
          <div className={`relative flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16 ${isRed ? 'bg-red-deep' : 'bg-cocoa'}`}>
            <div className="relative max-w-lg">
              <Badge tone="cream" className="mb-7 w-fit bg-cream/10 text-cream ring-cream/25">
                {isRed ? <Gift className="mr-1.5 h-3 w-3" aria-hidden="true" /> : <Sparkles className="mr-1.5 h-3 w-3" aria-hidden="true" />}
                {campaign.eyebrow}
              </Badge>
              <h3 className="text-balance font-display text-[length:var(--type-subhead)] font-medium leading-[1.1] text-cream sm:text-[2.6rem]">
                {campaign.title}
              </h3>
              <p className="mt-6 max-w-md text-pretty text-sm leading-[1.8] text-cream/70 sm:text-base">
                {campaign.description}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <MagneticButton
                  variant="accent"
                  size="lg"
                  onClick={() => onAction(campaign.action)}
                  className={isRed ? '' : 'bg-cyan'}
                >
                  {campaign.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </MagneticButton>
                {isRed && onOpenGiftStudio && (
                  <button
                    type="button"
                    onClick={onOpenGiftStudio}
                    className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-6 py-4 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
                  >
                    Open the Gift Studio
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="frame-image relative min-h-[300px] overflow-hidden lg:min-h-full">
            <img
              src={campaign.image}
              alt={campaign.eyebrow}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.06]"
            />
            <span className="absolute inset-0 bg-gradient-to-r from-marron/35 via-transparent to-transparent" aria-hidden="true" />
          </div>
        </div>
      </div>
    </Reveal>
  )
}

export const FeaturedCampaign: React.FC<FeaturedCampaignProps> = ({
  onExploreGifts,
  onExploreNew,
  onOpenGiftStudio,
}) => {
  const handleAction = (action: Campaign['action']) => {
    if (action === 'gifts') onExploreGifts()
    else onExploreNew()
  }

  return (
    <section className="bg-cream relative section-y" id="perfect-gift" aria-labelledby="campaign-headline">
      <div className="relative page-container">
        <div className="mb-12 sm:mb-16">
          <SectionHeading
            eyebrow="04 / 05 · Featured campaigns"
            title={<span id="campaign-headline">A little magic, in every season.</span>}
            description="Two beautiful edits, chosen for the moments that deserve something special."
          />
        </div>
        <div className="space-y-6 sm:space-y-8">
          {campaigns.map((campaign, index) => (
            <CampaignBanner
              key={campaign.eyebrow}
              campaign={campaign}
              index={index}
              onAction={handleAction}
              onOpenGiftStudio={onOpenGiftStudio}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

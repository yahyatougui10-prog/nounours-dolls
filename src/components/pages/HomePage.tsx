import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Gift, Sparkles, WandSparkles } from 'lucide-react'
import type { Product } from '../../data/products'
import { scrollToId } from '../../lib/scroll'
import { motionTokens } from '../../design-system/tokens'
import { WelcomeStory } from '../home/WelcomeStory'
import { CollectionShowcase } from '../home/CollectionShowcase'
import { FeaturedCampaign } from '../home/FeaturedCampaign'
import { GiftInspiration } from '../home/GiftInspiration'
import { LittleFriendsWorld } from '../home/LittleFriendsWorld'
import { OurStory } from '../home/OurStory'
import { WhyChooseUs } from '../home/WhyChooseUs'
import { CustomerLove } from '../home/CustomerLove'
import { Newsletter } from '../home/Newsletter'
import { HeroSection } from '../ui/HeroSection'
import { SignatureProducts } from '../home/SignatureProducts'
import { Reveal } from '../../design-system/Reveal'
import { editorialEase } from '../../design-system/motion'

export interface HomeContent {
  heroEyebrow?: string
  heroHeadline?: string
  heroSubtitle?: string
  storyHeadline?: string
  storyBody?: string
}

export interface HomePageProps {
  products: Product[]
  favoriteIds: string[]
  onToggleFavorite: (id: string) => void
  onViewProduct: (product: Product) => void
  onExploreCollection: (category?: string, search?: string) => void
  onDiscoverStory: () => void
  content?: HomeContent
  onQuickView?: (product: Product) => void
  onAddToCart?: (product: Product, size: string, color: string, quantity: number) => void
  onOpenGiftStudio?: () => void
  onOpenFriendFinder?: () => void
}

const DiscoveryTeaser: React.FC<{
  onOpenFriendFinder?: () => void
  onOpenGiftStudio?: () => void
}> = ({ onOpenFriendFinder, onOpenGiftStudio }) => (
  <section className="bg-editorial relative section-y" aria-label="Interactive discovery experiences">
    <div className="relative page-container">
      <Reveal className="mx-auto mb-12 max-w-2xl text-center">
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-cyan-deep" aria-hidden="true" />
          <span className="label-micro text-marron-soft">
            Let us help you choose
          </span>
          <span className="h-px w-10 bg-cyan-deep" aria-hidden="true" />
        </div>
        <h2 className="text-balance font-display text-[length:var(--type-section)] font-medium leading-[1.06] text-marron">
          A little help finding <span className="display-italic">the one.</span>
        </h2>
        <p className="mt-5 text-pretty text-[0.95rem] leading-[1.8] text-muted">
          Two small experiences, made to make choosing feel as lovely as receiving.
        </p>
      </Reveal>

      <div className="grid gap-5 md:grid-cols-2 lg:gap-7">
        <motion.button
          type="button"
          onClick={onOpenFriendFinder}
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: motionTokens.reveal, ease: editorialEase }}
          className="group relative rounded-5xl bg-marron-deep p-8 text-left text-cream shadow-lift ring-1 ring-white/5 sm:p-10"
        >
          <div className="relative">
            <span className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-cyan/20 text-cyan">
              <WandSparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan">Five little questions</p>
            <h3 className="mt-4 font-display text-3xl font-medium leading-tight sm:text-4xl">
              The Little Friend Finder
            </h3>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/70">
              Tell us what kind of companion you have in mind. We’ll introduce you to three real friends from our collection.
            </p>
            <span className="mt-8 inline-flex items-center gap-2 border-b border-cyan pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan transition-all group-hover:gap-3">
              Find my little friend
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </motion.button>

        <motion.button
          type="button"
          onClick={onOpenGiftStudio}
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: motionTokens.reveal, delay: 0.1, ease: editorialEase }}
          className="group relative rounded-5xl border border-marron/12 bg-cream p-8 text-left shadow-soft transition-shadow hover:shadow-lift sm:p-10"
        >
          <div className="relative">
            <span className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-red/10 text-red">
              <Gift className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan">Every occasion, considered</p>
            <h3 className="mt-4 font-display text-3xl font-medium leading-tight text-marron sm:text-4xl">
              The Gift Studio
            </h3>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Birthdays, celebrations, little children, collectors — explore beautiful ideas and a shortlist chosen just for you.
            </p>
            <span className="mt-8 inline-flex items-center gap-2 border-b border-cyan pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-marron transition-all group-hover:gap-3 group-hover:text-cyan">
              Step into the studio
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </motion.button>
      </div>

      <Reveal className="mt-10 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted/70">
        <Sparkles className="h-3 w-3 text-cyan" aria-hidden="true" />
        Every recommendation comes from our real collection
      </Reveal>
    </div>
  </section>
)

export const HomePage: React.FC<HomePageProps> = ({
  products,
  favoriteIds,
  onToggleFavorite,
  onViewProduct,
  onExploreCollection,
  onDiscoverStory,
  content,
  onQuickView,
  onAddToCart,
  onOpenGiftStudio,
  onOpenFriendFinder,
}) => {
  const scrollToCompanions = () => {
    scrollToId('favorite-companions')
  }

  return (
    <>
      <HeroSection
        eyebrow={content?.heroEyebrow}
        headline={content?.heroHeadline}
        subtitle={content?.heroSubtitle}
        onExploreCollection={() => onExploreCollection()}
        onMeetFriends={scrollToCompanions}
      />

      <WelcomeStory
        headline={content?.storyHeadline}
        body={content?.storyBody}
        onExploreCollection={() => onExploreCollection()}
        onMeetFriends={scrollToCompanions}
      />

      <CollectionShowcase onExploreCollection={(category) => onExploreCollection(category)} />

      <FeaturedCampaign
        onExploreGifts={() => onExploreCollection('gift')}
        onExploreNew={() => onExploreCollection('new')}
        onOpenGiftStudio={onOpenGiftStudio}
      />

      <GiftInspiration
        products={products}
        onExploreGifts={(query) => onExploreCollection('gift', query)}
        onOpenGiftStudio={onOpenGiftStudio}
      />

      <DiscoveryTeaser onOpenFriendFinder={onOpenFriendFinder} onOpenGiftStudio={onOpenGiftStudio} />

      <LittleFriendsWorld
        products={products}
        onProductSelect={onViewProduct}
        onExploreCollection={(category) => onExploreCollection(category)}
      />

      <SignatureProducts
        products={products}
        favoriteIds={favoriteIds}
        onToggleFavorite={onToggleFavorite}
        onViewProduct={onViewProduct}
        onViewAll={() => onExploreCollection()}
        onQuickView={onQuickView}
        onAddToCart={onAddToCart}
      />

      <OurStory onReadStory={onDiscoverStory} />
      <WhyChooseUs />
      <CustomerLove />
      <Newsletter />
    </>
  )
}

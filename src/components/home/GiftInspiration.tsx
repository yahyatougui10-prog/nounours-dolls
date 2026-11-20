import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Gift, Sparkles } from 'lucide-react'
import type { Product } from '../../data/products'
import { Badge } from '../../design-system/Badge'
import { Reveal } from '../../design-system/Reveal'
import { SectionHeading } from '../../design-system/SectionHeading'
import { imageSwap } from '../../design-system/motion'
import { assetUrl } from '../../lib/assets'

export interface GiftInspirationProps {
  products: Product[]
  onExploreGifts: (query?: string) => void
  onOpenGiftStudio?: () => void
}

interface Occasion {
  id: string
  number: string
  label: string
  title: string
  description: string
  image: string
  productId: string
}

const occasions: Occasion[] = [
  {
    id: 'birthdays',
    number: '01',
    label: 'Birthdays',
    title: 'For the big little day.',
    description: 'A little box of joy, ready to be given and remembered long after the candles.',
    image: assetUrl('/products/toys/nounours/nounours_013.png'),
    productId: 'toy-073',
  },
  {
    id: 'celebrations',
    number: '02',
    label: 'Celebrations',
    title: 'For moments worth keeping.',
    description: 'A charming companion for the days that deserve something a little more special.',
    image: assetUrl('/products/toys/dolls/doll_001.png'),
    productId: 'toy-001',
  },
  {
    id: 'moments',
    number: '03',
    label: 'Special moments',
    title: 'For a friend who stays.',
    description: 'A keepsake with a story of its own, chosen for someone who truly matters.',
    image: assetUrl('/products/toys/dolls/doll_003.png'),
    productId: 'toy-003',
  },
]

export const GiftInspiration: React.FC<GiftInspirationProps> = ({ products, onExploreGifts, onOpenGiftStudio }) => {
  const [activeId, setActiveId] = React.useState(occasions[0].id)
  const active = occasions.find((occasion) => occasion.id === activeId) ?? occasions[0]
  const product = products.find((item) => item.id === active.productId)

  return (
    <section className="relative bg-paper-texture section-y" id="gift-inspiration">
      <div className="relative page-container">
        <SectionHeading
          eyebrow="Gift discovery · The Gift Studio"
          title={<>The sweetest way to say “I thought of you.”</>}
          description="Tell us the occasion. We’ll help you find a little friend that feels exactly right."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14">
          <div className="flex flex-col justify-center">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-marron/60">
                Choose an occasion
              </p>
              {onOpenGiftStudio && (
                <button
                  type="button"
                  onClick={onOpenGiftStudio}
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan transition-colors hover:text-marron"
                >
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  Open the Gift Studio
                </button>
              )}
            </div>
            <div className="divide-y divide-marron/10 border-y border-marron/10">
              {occasions.map((occasion) => {
                const isActive = occasion.id === activeId
                return (
                  <button
                    key={occasion.id}
                    type="button"
                    onClick={() => setActiveId(occasion.id)}
                    aria-pressed={isActive}
                    className="group relative flex w-full items-center gap-5 py-6 text-left"
                  >
                    <span
                      className={`font-display text-sm tabular-nums transition-colors ${isActive ? 'text-cyan-deep' : 'text-marron/35'}`}
                    >
                      {occasion.number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block font-display text-[length:var(--type-subhead)] transition-colors ${
                          isActive ? 'text-marron' : 'text-marron/45 group-hover:text-marron/75'
                        }`}
                      >
                        {occasion.label}
                      </span>
                      {isActive && (
                        <motion.span
                          layoutId="occasion-underline"
                          className="mt-3 block h-0.5 w-12 origin-left rounded-full bg-cyan"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </span>
                    <ArrowUpRight
                      className={`h-4 w-4 shrink-0 transition-all duration-300 ${
                        isActive ? 'text-cyan' : 'text-marron/25 group-hover:translate-x-1 group-hover:text-marron/60'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="mt-8 min-h-[120px]"
              >
                <h3 className="font-display text-2xl font-medium text-marron sm:text-3xl">{active.title}</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{active.description}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <Reveal y={30}>
            <div className="relative h-[430px] overflow-hidden rounded-[2.5rem_7rem_2.5rem_2.5rem] bg-sand shadow-lift ring-1 ring-marron/10 sm:h-[560px]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={active.image}
                  src={active.image}
                  alt={`${active.label} gift inspiration`}
                  variants={imageSwap}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>
              <span className="absolute inset-0 bg-gradient-to-t from-marron/75 via-transparent to-transparent" aria-hidden="true" />

              <div className="absolute left-5 top-5 sm:left-7 sm:top-7">
                <Badge tone="cream" className="bg-marron/80 text-cream ring-cream/25">
                  <Gift className="mr-1.5 h-3 w-3" aria-hidden="true" />
                  Gift guide
                </Badge>
              </div>

              {product && (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.1 }}
                  className="absolute inset-x-5 bottom-5 flex flex-wrap items-center justify-between gap-4 rounded-4xl border border-cream/20 bg-cream/95 p-5 shadow-lift backdrop-blur-sm sm:inset-x-7 sm:bottom-7 sm:p-6"
                >
                  <div className="min-w-0">
                    <p className="label-micro text-cyan-deep">
                      Our pick for {active.label.toLowerCase()}
                    </p>
                    <p className="mt-1 line-clamp-2 min-h-[2.6rem] font-display text-xl font-medium leading-tight text-marron sm:min-h-0 sm:text-2xl">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs text-muted">${product.price} · {product.category}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onExploreGifts(product.name)}
                    className="inline-flex items-center gap-2 rounded-full bg-marron px-5 py-3 text-xs font-semibold text-cream transition-colors hover:bg-cyan-deep hover:text-cream"
                  >
                    Discover this gift
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </motion.div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, BookOpen, Sparkles } from 'lucide-react'
import { Badge } from '../../design-system/Badge'
import { SectionHeading } from '../../design-system/SectionHeading'
import { staggerContainer, staggerItem } from '../../design-system/motion'
import { formatPrice, type Product } from '../../data/products'
import { Button } from '../ui/Button'
import { imageSource } from '../discovery/signals'

export interface LittleFriendsWorldProps {
  products: Product[]
  onProductSelect: (product: Product) => void
  onExploreCollection?: (category?: string) => void
}

/**
 * These fields are being introduced to the Product model. Reading them through
 * a narrow local shape keeps this section honest whether or not a given friend
 * has a story configured yet.
 */
interface StoryAttributes {
  personality?: string
  shortStory?: string
  favoriteThings?: string[]
  collection?: string
}

type StoryProduct = Product & StoryAttributes

const hasStory = (product: Product): product is StoryProduct => {
  const candidate = product as unknown as StoryAttributes
  return Boolean(
    (typeof candidate.personality === 'string' && candidate.personality.trim()) ||
      (typeof candidate.shortStory === 'string' && candidate.shortStory.trim()) ||
      (Array.isArray(candidate.favoriteThings) && candidate.favoriteThings.length > 0) ||
      (typeof candidate.collection === 'string' && candidate.collection.trim()),
  )
}

export const LittleFriendsWorld: React.FC<LittleFriendsWorldProps> = ({
  products,
  onProductSelect,
  onExploreCollection,
}) => {
  const storyProducts = products.filter(hasStory).slice(0, 3)

  return (
    <section className="relative bg-paper-texture section-y">
      <div className="relative page-container">
        <SectionHeading
          eyebrow="LITTLE FRIENDS, BIG STORIES"
          title="Every friend has a story."
          description="A small corner of our boutique for the personalities, little dreams and favourite things behind each companion."
        />

        {storyProducts.length === 0 ? (
          <RevealEmptyState onExploreCollection={onExploreCollection} />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.12 }}
            className="mt-14 space-y-8"
          >
            {storyProducts.map((product, index) => (
              <motion.article
                key={product.id}
                variants={staggerItem}
                className={`grid items-center gap-8 rounded-6xl border border-marron/10 bg-cream p-5 shadow-soft sm:p-7 lg:grid-cols-2 ${
                  index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
                }`}
              >
                <div className="frame-image relative aspect-[4/3] overflow-hidden rounded-5xl">
                  <img
                    src={imageSource(product.image)}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  {product.collection && (
                    <Badge tone="cyan" className="absolute left-4 top-4 bg-cream/90">
                      {product.collection}
                    </Badge>
                  )}
                </div>

                <div className="px-1 pb-3 sm:px-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan">
                    A little story · {product.category}
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-medium leading-tight text-marron sm:text-4xl">
                    Meet {product.name}
                  </h3>

                  {product.personality && (
                    <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-cyan">
                      <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {product.personality}
                    </p>
                  )}

                  {product.shortStory && (
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                      {product.shortStory}
                    </p>
                  )}

                  {product.favoriteThings && product.favoriteThings.length > 0 && (
                    <div className="mt-6">
                      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-marron/70">
                        Favourite things
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.favoriteThings.map((thing, thingIndex) => (
                          <span
                            key={`${thing}-${thingIndex}`}
                            className="rounded-full border border-cyan/30 bg-cyan/10 px-3.5 py-1.5 text-xs font-medium text-marron"
                          >
                            {thing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-marron/10 pt-5">
                    <span className="font-display text-xl font-semibold text-marron">
                      {formatPrice(product.price)}
                    </span>
                    <Button variant="secondary" size="sm" onClick={() => onProductSelect(product)}>
                      See the details
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                    {onExploreCollection && (
                      <button
                        type="button"
                        onClick={() => onExploreCollection(product.categoryKey)}
                        className="text-xs font-semibold text-muted underline decoration-cyan/50 underline-offset-4 transition-colors hover:text-marron"
                      >
                        More {product.category.toLowerCase()}
                      </button>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

interface RevealEmptyStateProps {
  onExploreCollection?: (category?: string) => void
}

const RevealEmptyState: React.FC<RevealEmptyStateProps> = ({ onExploreCollection }) => (
  <div className="mx-auto mt-14 max-w-3xl rounded-6xl border border-dashed border-marron/25 bg-cream/75 px-6 py-14 text-center shadow-soft sm:px-12">
    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan/15 text-cyan">
      <BookOpen className="h-7 w-7" aria-hidden="true" />
    </span>
    <h3 className="mx-auto mt-6 max-w-lg text-balance font-display text-2xl font-medium leading-tight text-marron sm:text-3xl">
      Every friend has a story. Our boutique team is writing theirs.
    </h3>
    <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted">
      Until those stories are ready, the whole little world is still here to explore — with only
      the details we truly know.
    </p>
    {onExploreCollection && (
      <Button variant="primary" className="mt-8" onClick={() => onExploreCollection()}>
        Explore the collection
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    )}
  </div>
)

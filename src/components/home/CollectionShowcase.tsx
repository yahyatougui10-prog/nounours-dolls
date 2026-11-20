import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Badge } from '../../design-system/Badge'
import { Reveal } from '../../design-system/Reveal'
import { editorialEase } from '../../design-system/motion'
import { assetUrl } from '../../lib/assets'

export interface CollectionShowcaseProps {
  onExploreCollection: (category?: string) => void
}

interface WallTile {
  category: string
  number: string
  label: string
  title: string
  description: string
  image: string
  className: string
  imageClassName?: string
  anchor?: string
}

const tiles: WallTile[] = [
  {
    category: 'teddy',
    number: '02',
    label: 'Teddy Bears',
    title: 'The softest side of friendship.',
    description: 'Sixty illustrated companions, each with its own colours, accessories and pastel world.',
    image: assetUrl('/products/toys/nounours/nounours_001.png'),
    className: 'lg:col-span-7 lg:row-span-2 lg:min-h-[640px]',
    anchor: 'teddy-bears',
  },
  {
    category: 'teddy',
    number: '02',
    label: 'Crown favourites',
    title: 'A little royalty.',
    description: 'Bright crowns, soft fur and cheerful pastel backdrops.',
    image: assetUrl('/products/toys/nounours/nounours_002.png'),
    className: 'lg:col-span-5 lg:min-h-[306px]',
  },
  {
    category: 'doll',
    number: '03',
    label: 'Beautiful Dolls',
    title: 'Dreamers, dressed to impress.',
    description: 'Braids, buns and hand-picked outfits for a thousand imaginary worlds.',
    image: assetUrl('/products/toys/dolls/doll_001.png'),
    className: 'lg:col-span-5 lg:min-h-[306px]',
    anchor: 'dolls',
  },
  {
    category: 'doll',
    number: '03',
    label: 'Storybook details',
    title: 'Made to be cherished.',
    description: 'Hearts, stripes and tiny flowers — the details that make each friend one of a kind.',
    image: assetUrl('/products/toys/dolls/doll_002.png'),
    className: 'lg:col-span-12 lg:min-h-[322px]',
  },
]

export const CollectionShowcase: React.FC<CollectionShowcaseProps> = ({ onExploreCollection }) => (
  <section className="bg-blush-soft relative section-y" aria-label="Explore our collections">
    <div className="relative page-container">
      <div className="mb-12 flex flex-col gap-6 sm:mb-16 lg:flex-row lg:items-end lg:justify-between">
        <Reveal className="max-w-2xl">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-12 bg-cyan-deep" aria-hidden="true" />
            <span className="label-micro text-marron-soft">
              The collection wall · 02 &amp; 03
            </span>
          </div>
          <h2 className="text-balance font-display text-[length:var(--type-section)] font-medium leading-[1.05] text-marron">
            Two little worlds. <span className="display-italic">One big heart.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-md text-pretty text-sm leading-[1.8] text-muted sm:text-base">
            Follow the softness, follow the sparkle — every companion here has been chosen for the feeling it leaves behind.
          </p>
        </Reveal>
      </div>

      <div className="grid auto-rows-[minmax(260px,auto)] grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
        {tiles.map((tile, index) => (
          <motion.div
            key={`${tile.category}-${tile.number}-${index}`}
            id={tile.anchor}
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.14 }}
            transition={{ duration: 0.75, delay: index * 0.08, ease: editorialEase }}
            className={`group relative overflow-hidden rounded-5xl bg-sand shadow-soft transition-shadow duration-500 hover:shadow-campaign ${tile.className}`}
          >
            <button
              type="button"
              onClick={() => onExploreCollection(tile.category)}
              aria-label={`Explore ${tile.label}`}
              className="absolute inset-0 h-full w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan"
            >
              <img
                src={tile.image}
                alt={tile.label}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.07]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-marron-deep/88 via-marron-deep/20 to-transparent" aria-hidden="true" />

              <span className="absolute left-5 top-5 flex items-center gap-2 sm:left-7 sm:top-7">
                <Badge tone="cream" className="bg-cream/90 text-marron ring-cream/40">
                  {tile.number} · {tile.label}
                </Badge>
              </span>

              <span className="absolute right-5 top-5 hidden h-11 w-11 items-center justify-center rounded-full border border-cream/40 text-cream transition-all duration-500 group-hover:rotate-45 group-hover:bg-cyan group-hover:text-marron sm:flex">
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>

              <span className="absolute inset-x-5 bottom-5 block sm:inset-x-7 sm:bottom-7">
                <span className="block text-balance font-display text-[length:var(--type-subhead)] font-medium leading-[1.12] text-cream">
                  {tile.title}
                </span>
                <span className="mt-3 block max-w-sm text-pretty text-xs leading-[1.7] text-cream/75 sm:text-sm">
                  {tile.description}
                </span>
                <span className="mt-5 inline-flex items-center gap-2 border-b border-cyan pb-1 label-micro text-cyan transition-all group-hover:gap-3">
                  Explore {tile.label.toLowerCase()}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

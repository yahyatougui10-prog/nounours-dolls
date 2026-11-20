import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import type { Product } from '../../data/products'
import { Badge } from '../../design-system/Badge'
import { Reveal } from '../../design-system/Reveal'
import { editorialEase } from '../../design-system/motion'
import { ProductCard } from '../ui/ProductCard'

export interface SignatureProductsProps {
  products: Product[]
  favoriteIds: string[]
  onToggleFavorite: (id: string) => void
  onViewProduct: (product: Product) => void
  onViewAll: () => void
  onQuickView?: (product: Product) => void
  onAddToCart?: (product: Product, size: string, color: string, quantity: number) => void
}

export const SignatureProducts: React.FC<SignatureProductsProps> = ({
  products,
  favoriteIds,
  onToggleFavorite,
  onViewProduct,
  onViewAll,
  onQuickView,
  onAddToCart,
}) => {
  const featured = products.filter((product) => product.featured)
  const pool = featured.length >= 5 ? featured : products
  const [lead, ...supporting] = pool.slice(0, 5)

  if (!lead) return null

  const quickAdd = (product: Product) =>
    onAddToCart
      ? () => onAddToCart(product, product.sizes[0] ?? 'One size', product.colors[0] ?? '', 1)
      : undefined

  return (
    <section className="bg-warm relative section-y" id="favorite-companions" aria-labelledby="favorite-headline">
      <div className="relative page-container">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between sm:mb-16">
          <div className="max-w-2xl">
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px w-12 bg-cyan-deep" aria-hidden="true" />
              <span className="label-micro text-marron-soft">
                05 / 05 · Favorite companions
              </span>
            </div>
            <h2 id="favorite-headline" className="text-balance font-display text-[length:var(--type-section)] font-medium leading-[1.05] text-marron">
              The friends everyone <span className="display-italic">falls for.</span>
            </h2>
          </div>
          <Reveal delay={0.08}>
            <p className="max-w-md text-pretty text-sm leading-[1.8] text-muted sm:text-base">
              A few little treasures our visitors return to again and again. Look closer — there is always more to notice.
            </p>
          </Reveal>
        </div>

        <div className="space-y-5 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.8, ease: editorialEase }}
          >
            <ProductCard
              layout="featured"
              index={0}
              name={lead.name}
              category={lead.category}
              price={lead.price}
              image={lead.image}
              secondaryImage={lead.gallery[1]}
              gallery={lead.gallery}
              description={lead.description}
              tag={lead.tag}
              isFeatured={lead.featured}
              stock={lead.stock}
              isFavorite={favoriteIds.includes(lead.id)}
              onToggleFavorite={() => onToggleFavorite(lead.id)}
              onViewDetails={() => onViewProduct(lead)}
              onQuickView={onQuickView ? () => onQuickView(lead) : undefined}
              onAddToCart={quickAdd(lead)}
            />
          </motion.div>

          <div className="product-grid">
            {supporting.map((product, index) => (
              <motion.div
                key={product.id}
                className="h-full"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: 0.65, delay: index * 0.07, ease: editorialEase }}
              >
                <ProductCard
                  index={index + 1}
                  name={product.name}
                  category={product.category}
                  price={product.price}
                  image={product.image}
                  secondaryImage={product.gallery[1]}
                  gallery={product.gallery}
                  description={product.description}
                  tag={product.tag}
                  isFeatured={product.featured}
                  stock={product.stock}
                  isFavorite={favoriteIds.includes(product.id)}
                  onToggleFavorite={() => onToggleFavorite(product.id)}
                  onViewDetails={() => onViewProduct(product)}
                  onQuickView={onQuickView ? () => onQuickView(product) : undefined}
                  onAddToCart={quickAdd(product)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        <Reveal className="mt-12 flex flex-col items-center gap-5 text-center" delay={0.1}>
          <Badge tone="cyan"><Sparkles className="mr-1.5 h-3 w-3" aria-hidden="true" /> Handpicked, always</Badge>
          <button
            type="button"
            onClick={onViewAll}
            className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-marron transition-colors hover:text-cyan"
          >
            Discover the full collection
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
          </button>
        </Reveal>
      </div>
    </section>
  )
}

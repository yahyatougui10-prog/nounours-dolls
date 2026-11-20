import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import type { CartLine, Product } from '../../data/products'
import { Badge } from '../../design-system/Badge'
import { EmptyBag } from '../../design-system/EmptyBag'
import { Reveal } from '../../design-system/Reveal'
import { Button } from '../ui/Button'
import { CartItemRow } from '../ui/CartItemRow'
import { CartSummary } from '../ui/CartSummary'
import { ProductCard } from '../ui/ProductCard'

export interface CartPageProps {
  items: CartLine[]
  recommendations: Product[]
  favoriteIds: string[]
  onToggleFavorite: (id: string) => void
  onQuantityChange: (index: number, delta: number) => void
  onRemove: (index: number) => void
  onCheckout: () => void
  onExplore: () => void
  onProductSelect: (product: Product) => void
}

export const CartPage: React.FC<CartPageProps> = ({
  items,
  recommendations,
  favoriteIds,
  onToggleFavorite,
  onQuantityChange,
  onRemove,
  onCheckout,
  onExplore,
  onProductSelect,
}) => {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <section className="bg-paper-texture pb-28 pt-28 sm:pt-32" id="cart">
      <div className="page-container">
        <div className="mb-12">
          <Badge tone="cyan" className="mb-5">Your little bag</Badge>
          <h1 className="max-w-2xl text-balance font-display text-4xl font-medium leading-[1.05] text-marron sm:text-6xl">
            A little collection of things you love.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
            Take a moment to look them over. When you’re ready, our boutique team will help you
            complete your order personally.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center rounded-5xl border border-dashed border-marron/20 bg-cream/70 px-6 py-16 text-center">
            <EmptyBag size={156} className="mb-5" />
            <h2 className="font-display text-3xl font-medium text-marron">Your bag is waiting</h2>
            <p className="mt-3 max-w-sm text-sm text-muted">
              Every little friend needs a home. Find the one that feels just right.
            </p>
            <Button variant="accent" className="mt-7" onClick={onExplore}>
              Explore the collection
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="rounded-5xl border border-marron/10 bg-cream p-5 shadow-soft sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-cyan" aria-hidden="true" />
                <h2 className="font-display text-2xl font-medium text-marron">
                  {itemCount} {itemCount === 1 ? 'little friend' : 'little friends'} in your bag
                </h2>
              </div>
              <ul className="space-y-4">
                <AnimatePresence initial={false}>
                  {items.map((item, index) => (
                    <CartItemRow
                      key={`${item.product.id}-${item.size}-${item.color}-${index}`}
                      item={item}
                      index={index}
                      onQuantityChange={onQuantityChange}
                      onRemove={onRemove}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </div>

            <div className="overflow-hidden rounded-5xl border border-marron/10 shadow-soft lg:sticky lg:top-28 lg:self-start">
              <CartSummary total={total} itemCount={itemCount} onCheckout={onCheckout} onExplore={onExplore} />
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <Reveal className="mt-20">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan">
                  You might also love
                </p>
                <h2 className="font-display text-3xl font-medium text-marron sm:text-4xl">
                  More little wonders
                </h2>
              </div>
            </div>
            <div className="product-grid">
              {recommendations.map((product, index) => (
                <motion.div
                  key={product.id}
                  className="h-full"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.07 }}
                >
                  <ProductCard
                    index={index}
                    name={product.name}
                    category={product.category}
                    price={product.price}
                    image={product.image}
                    secondaryImage={product.gallery[1]}
                    description={product.description}
                    tag={product.tag}
                    isFavorite={favoriteIds.includes(product.id)}
                    onToggleFavorite={() => onToggleFavorite(product.id)}
                    onViewDetails={() => onProductSelect(product)}
                  />
                </motion.div>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}

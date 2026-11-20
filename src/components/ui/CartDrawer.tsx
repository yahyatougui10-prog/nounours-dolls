import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ShoppingBag, X } from 'lucide-react'
import type { CartLine } from '../../data/products'
import { Button } from './Button'
import { CartItemRow } from './CartItemRow'
import { CartSummary } from './CartSummary'
import { EmptyBag } from '../../design-system/EmptyBag'
import { drawerVariants } from '../../design-system/motion'

export type { CartLine } from '../../data/products'

export interface CartDrawerProps {
  open: boolean
  items: CartLine[]
  onClose: () => void
  onQuantityChange: (index: number, delta: number) => void
  onRemove: (index: number) => void
  onCheckout: () => void
  onExplore: () => void
  onViewCart: () => void
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  items,
  onClose,
  onQuantityChange,
  onRemove,
  onCheckout,
  onExplore,
  onViewCart,
}) => {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            type="button"
            aria-label="Close cart"
            onClick={onClose}
            className="absolute inset-0 bg-marron/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.aside
            className="relative ml-auto flex h-full w-full max-w-md flex-col bg-cream shadow-lift"
            variants={drawerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="flex items-center justify-between border-b border-marron/10 px-6 py-5">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-cyan" aria-hidden="true" />
                <h2 className="font-display text-2xl font-medium text-marron">Your little bag</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-marron transition-colors hover:bg-marron/5 hover:text-red"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <EmptyBag size={132} className="mb-4" />
                <h3 className="font-display text-2xl text-marron">Your bag is waiting</h3>
                <p className="mt-3 max-w-xs text-sm text-muted">
                  Every little friend needs a home. Find the one that feels just right.
                </p>
                <Button variant="accent" className="mt-7" onClick={onExplore}>
                  Explore collection
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <>
                <ul className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-6">
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

                <button
                  type="button"
                  onClick={onViewCart}
                  className="mx-6 mb-3 inline-flex items-center justify-center gap-2 rounded-full border border-marron/12 py-3 text-xs font-semibold text-marron transition-colors hover:border-cyan/50 hover:text-cyan"
                >
                  View full bag
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                <CartSummary
                  total={total}
                  itemCount={itemCount}
                  onCheckout={onCheckout}
                  onExplore={onExplore}
                />
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

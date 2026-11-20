import React from 'react'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartLine } from '../../data/products'
import { imageSource } from '../../lib/assets'

export interface CartItemRowProps {
  item: CartLine
  index: number
  onQuantityChange: (index: number, delta: number) => void
  onRemove: (index: number) => void
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  index,
  onQuantityChange,
  onRemove,
}) => (
  <motion.li
    layout
    initial={{ opacity: 0, x: 16 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 16 }}
    className="flex items-center gap-4 rounded-3xl border border-marron/10 bg-white p-3"
  >
    <img
      src={imageSource(item.product.image)}
      alt={item.product.name}
      className="h-20 w-16 shrink-0 rounded-2xl object-cover"
    />
    <div className="min-w-0 flex-1">
      <p className="truncate font-display text-base font-medium text-marron">{item.product.name}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
        Size · {item.size}
        {item.color && (
          <span className="inline-flex items-center gap-1">
            <span
              className="h-2.5 w-2.5 rounded-full ring-1 ring-marron/15"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
          </span>
        )}
      </p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-full border border-marron/12 bg-cream p-0.5">
          <button
            type="button"
            onClick={() => onQuantityChange(index, -1)}
            aria-label={`Decrease quantity of ${item.product.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-full text-marron transition-colors hover:bg-sand"
          >
            <Minus className="h-3 w-3" aria-hidden="true" />
          </button>
          <span className="w-7 text-center text-xs font-semibold text-marron" aria-live="polite">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(index, 1)}
            aria-label={`Increase quantity of ${item.product.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-full text-marron transition-colors hover:bg-sand"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
        <span className="font-semibold text-cyan">${item.product.price * item.quantity}</span>
      </div>
    </div>
    <button
      type="button"
      onClick={() => onRemove(index)}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-red/10 hover:text-red"
      aria-label={`Remove ${item.product.name} from bag`}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </button>
  </motion.li>
)

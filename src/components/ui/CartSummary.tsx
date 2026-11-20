import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from './Button'

export interface CartSummaryProps {
  total: number
  itemCount: number
  onCheckout: () => void
  onExplore?: () => void
  className?: string
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  total,
  itemCount,
  onCheckout,
  onExplore,
  className = '',
}) => (
  <div className={`border-t border-marron/10 bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 ${className}`}>
    <div className="mb-4 flex items-center justify-between text-sm text-muted">
      <span>{itemCount} {itemCount === 1 ? 'little friend' : 'little friends'}</span>
      <span>Delivery calculated with your order</span>
    </div>
    <div className="mb-5 flex items-center justify-between">
      <span className="text-sm text-muted">Subtotal</span>
      <span className="font-display text-2xl font-semibold text-marron">${total}</span>
    </div>
    <Button variant="primary" fullWidth onClick={onCheckout}>
      Contact us to order
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Button>
    {onExplore && (
      <button
        type="button"
        onClick={onExplore}
        className="mt-3 w-full text-center text-xs font-semibold text-marron underline decoration-cyan/50 underline-offset-4 transition-colors hover:text-cyan"
      >
        Continue exploring
      </button>
    )}
    <p className="mt-4 rounded-2xl bg-cyan/8 px-4 py-3 text-[11px] leading-relaxed text-muted">
      Checkout integration point: payment is not processed here. Orders are handled personally by
      our boutique team through the contact form.
    </p>
  </div>
)

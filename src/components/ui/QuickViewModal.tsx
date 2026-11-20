import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Heart, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { Badge } from '../../design-system/Badge'
import { imageSwap, modalVariants } from '../../design-system/motion'
import { formatPrice, type Product } from '../../data/products'
import { imageSource } from '../discovery/signals'
import { Button } from './Button'

export interface QuickViewModalProps {
  product: Product
  isFavorite: boolean
  relatedProducts?: Product[]
  onClose: () => void
  onToggleFavorite: (id: string) => void
  onAddToCart: (product: Product, size: string, color: string, quantity: number) => void
  onViewDetails: (product: Product) => void
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isFavorite,
  relatedProducts = [],
  onClose,
  onToggleFavorite,
  onAddToCart,
  onViewDetails,
}) => {
  const dialogRef = React.useRef<HTMLDivElement>(null)
  const closeButtonRef = React.useRef<HTMLButtonElement>(null)
  const titleId = React.useId()

  const [previousProductId, setPreviousProductId] = React.useState(product.id)
  const [currentImage, setCurrentImage] = React.useState(0)
  const [selectedSize, setSelectedSize] = React.useState(product.sizes[0] ?? 'One size')
  const [selectedColor, setSelectedColor] = React.useState(0)
  const [quantity, setQuantity] = React.useState(1)

  // Reset the selection during render when the parent swaps products in place.
  if (previousProductId !== product.id) {
    setPreviousProductId(product.id)
    setCurrentImage(0)
    setSelectedSize(product.sizes[0] ?? 'One size')
    setSelectedColor(0)
    setQuantity(1)
  }

  const gallery = product.gallery.length > 0 ? product.gallery : [product.image]
  const sizes = product.sizes.length > 0 ? product.sizes : ['One size']
  const selectedColorValue = product.colors[selectedColor] ?? product.colors[0] ?? ''
  const related = relatedProducts.filter((item) => item.id !== product.id).slice(0, 3)

  React.useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusables = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus()
      }
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6">
      <motion.div
        aria-hidden="true"
        onMouseDown={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.24 }}
        className="absolute inset-0 bg-marron-deep/80 backdrop-blur-md"
      />

      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        variants={modalVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-5xl bg-cream shadow-modal ring-1 ring-white/10"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={`Close quick view of ${product.name}`}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-cream text-marron shadow-lift ring-1 ring-marron/10 transition-colors hover:bg-red hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-deep"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="grid overflow-y-auto lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
          {/* Gallery */}
          <div className="border-b border-marron/10 bg-sand/70 p-4 sm:p-6 lg:border-b-0 lg:border-r">
            <div className="frame-image relative overflow-hidden rounded-4xl bg-cream">
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={`${product.id}-${currentImage}`}
                  src={imageSource(gallery[currentImage] ?? product.image)}
                  alt={product.name}
                  variants={imageSwap}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="aspect-[4/5] w-full object-cover object-center"
                />
              </AnimatePresence>
              {product.tag && (
                <Badge tone="red" className="absolute left-4 top-4 bg-red text-white ring-white/30">
                  {product.tag}
                </Badge>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
                {gallery.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setCurrentImage(index)}
                    aria-label={`View image ${index + 1} of ${product.name}`}
                    aria-pressed={currentImage === index}
                    className={`h-16 w-14 shrink-0 overflow-hidden rounded-2xl border-2 transition-[border-color,box-shadow,opacity] sm:h-20 sm:w-16 ${
                      currentImage === index
                        ? 'border-cyan shadow-glow'
                        : 'border-transparent opacity-65 hover:opacity-100'
                    }`}
                  >
                    <img src={imageSource(image)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8">
            <div className="pr-12">
              <Badge tone="cyan">{product.category}</Badge>
              <h2
                id={titleId}
                className="mt-4 font-display text-[length:var(--type-subhead)] font-medium leading-[1.12] text-marron"
              >
                {product.name}
              </h2>
              <div className="mt-3 flex items-center gap-4">
                <span className="font-display text-2xl font-semibold text-marron">
                  {formatPrice(product.price)}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleFavorite(product.id)}
                  aria-pressed={isFavorite}
                  aria-label={
                    isFavorite
                      ? `Remove ${product.name} from favorites`
                      : `Add ${product.name} to favorites`
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-marron/15 bg-cream text-marron shadow-soft transition-colors hover:border-red/40 hover:text-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-deep"
                >
                  <motion.span
                    animate={isFavorite ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                    transition={{ duration: 0.38 }}
                    className="flex"
                  >
                    <Heart
                      className={`h-5 w-5 ${isFavorite ? 'fill-red text-red' : 'text-marron'}`}
                      aria-hidden="true"
                    />
                  </motion.span>
                </button>
              </div>
            </div>

            <p className="mt-5 text-sm leading-[1.8] text-muted">{product.description}</p>
            {product.story && (
              <div className="mt-5 rounded-3xl bg-cyan-tint p-4 ring-1 ring-cyan/20">
                <p className="label-micro mb-2 text-cyan-deep">
                  The story
                </p>
                <p className="font-display text-sm leading-[1.75] text-marron">
                  {product.story}
                </p>
              </div>
            )}

            <div className="mt-7">
              <p className="mb-3 label-micro text-marron-soft">
                Choose a size
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={selectedSize === size}
                    className={`rounded-full border px-4 py-2 text-xs font-medium transition-all ${
                      selectedSize === size
                        ? 'border-cyan bg-cyan/15 text-marron shadow-glow'
                        : 'border-marron/15 bg-white text-muted hover:border-cyan/50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {product.colors.length > 0 && (
              <div className="mt-7">
                <p className="mb-3 label-micro text-marron-soft">
                  Colour story
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((swatch, index) => (
                    <button
                      key={`${swatch}-${index}`}
                      type="button"
                      onClick={() => setSelectedColor(index)}
                      aria-label={`Select colour ${index + 1}`}
                      aria-pressed={selectedColor === index}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        selectedColor === index
                          ? 'border-cyan shadow-glow'
                          : 'border-cream ring-1 ring-marron/10 hover:ring-cyan/50'
                      }`}
                    >
                      <span
                        className="h-6 w-6 rounded-full"
                        style={{ backgroundColor: swatch }}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7 grid gap-6 sm:grid-cols-2">
              {product.materials.length > 0 && (
                <div>
                  <p className="mb-3 label-micro text-marron-soft">
                    Materials
                  </p>
                  <ul className="space-y-2 text-xs leading-relaxed text-muted">
                    {product.materials.map((material) => (
                      <li key={material} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan" aria-hidden="true" />
                        {material}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {product.dimensions.length > 0 && (
                <div>
                  <p className="mb-3 label-micro text-marron-soft">
                    Dimensions
                  </p>
                  <ul className="space-y-2 text-xs leading-relaxed text-muted">
                    {product.dimensions.map((dimension) => (
                      <li key={dimension} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red" aria-hidden="true" />
                        {dimension}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-7 border-t border-marron/10 pt-6">
              <p className="mb-3 label-micro text-marron-soft">
                Quantity
              </p>
              <div className="inline-flex items-center rounded-full border border-marron/15 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-marron transition-colors hover:bg-sand disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span
                  className="w-10 text-center font-display text-lg font-semibold text-marron"
                  aria-live="polite"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.min(10, current + 1))}
                  disabled={quantity >= 10}
                  aria-label="Increase quantity"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-marron transition-colors hover:bg-sand disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  variant="accent"
                  size="lg"
                  fullWidth
                  onClick={() => onAddToCart(product, selectedSize, selectedColorValue, quantity)}
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  Add to bag
                </Button>
                <Button variant="secondary" fullWidth onClick={() => onViewDetails(product)}>
                  View full details
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            {related.length > 0 && (
              <div className="mt-8 border-t border-marron/10 pt-6">
                <p className="mb-4 label-micro text-marron-soft">
                  More little friends
                </p>
                <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
                  {related.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onViewDetails(item)}
                      title={item.name}
                      className="group flex w-44 shrink-0 items-center gap-3 rounded-3xl border border-marron/10 bg-cream p-2 text-left transition-colors hover:border-cyan/40"
                    >
                      <img
                        src={imageSource(item.image)}
                        alt={item.name}
                        loading="lazy"
                        className="h-14 w-12 shrink-0 rounded-2xl object-cover"
                      />
                      <span className="min-w-0">
                        <span className="line-clamp-2 block font-display text-sm font-medium leading-tight text-marron">
                          {item.name}
                        </span>
                        <span className="mt-1 block text-xs font-semibold tabular-nums text-cyan-deep">
                          {formatPrice(item.price)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

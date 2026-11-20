import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Maximize2,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../../design-system/Badge'
import { Reveal } from '../../design-system/Reveal'
import { imageSwap, modalVariants } from '../../design-system/motion'
import type { Product } from '../../data/products'
import { imageSource } from '../../lib/assets'

export interface ProductDetailPageProps {
  product: Product
  onBack: () => void
  onAddToCart: (product: Product, size: string, color: string, quantity: number) => void
  onToggleFavorite: (id: string) => void
  isFavorite: boolean
  relatedProducts: Product[]
  recentlyViewed: Product[]
  onSelectRelated: (product: Product) => void
  onContact: () => void
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
  relatedProducts,
  recentlyViewed,
  onSelectRelated,
  onContact,
}) => {
  const [currentImage, setCurrentImage] = React.useState(0)
  const [selectedSize, setSelectedSize] = React.useState(product.sizes[0] ?? 'One size')
  const [selectedColor, setSelectedColor] = React.useState(0)
  const [quantity, setQuantity] = React.useState(1)
  const [isLightboxOpen, setLightboxOpen] = React.useState(false)
  const gallery = product.gallery.length > 0 ? product.gallery : [product.image]
  const color = product.colors[selectedColor] ?? product.colors[0] ?? ''

  const goToImage = React.useCallback(
    (direction: number) => {
      setCurrentImage((current) => (current + direction + gallery.length) % gallery.length)
    },
    [gallery.length],
  )

  React.useEffect(() => {
    if (!isLightboxOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false)
      if (event.key === 'ArrowRight') goToImage(1)
      if (event.key === 'ArrowLeft') goToImage(-1)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isLightboxOpen, goToImage])

  const miniList = (items: Product[], eyebrow: string, title: string, emptyMessage?: string) => {
    if (items.length === 0 && !emptyMessage) return null
    return (
      <Reveal className="mt-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="label-micro mb-4 text-cyan-deep">
              {eyebrow}
            </p>
            <h2 className="font-display text-[length:var(--type-subhead)] font-medium leading-[1.12] text-marron">{title}</h2>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={onBack}
              className="hidden items-center gap-2 text-xs font-semibold text-marron hover:text-cyan sm:inline-flex"
            >
              View all
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        {items.length === 0 ? (
          <div className="rounded-4xl border border-marron/15 bg-cream px-6 py-10 text-center shadow-soft">
            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => onSelectRelated(item)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group flex items-center gap-4 rounded-4xl border border-marron/12 bg-cream p-4 text-left shadow-soft transition-[border-color,box-shadow] hover:border-cyan/45 hover:shadow-lift"
              >
                <img
                  src={imageSource(item.image)}
                  alt={item.name}
                  className="h-24 w-20 rounded-3xl object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="min-w-0 flex-1">
                  <span className="label-micro block text-cyan-deep">
                    {item.category}
                  </span>
                  <span className="mt-1 line-clamp-2 block font-display text-lg font-medium leading-tight text-marron">
                    {item.name}
                  </span>
                  <span className="mt-1 block font-semibold text-marron">${item.price}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-marron/40 transition-colors group-hover:text-cyan" aria-hidden="true" />
              </motion.button>
            ))}
          </div>
        )}
      </Reveal>
    )
  }

  return (
    <section className="bg-paper-texture pb-40 pt-28 sm:pt-32 lg:pb-28">
      <div className="page-container">
        <button
          type="button"
          onClick={onBack}
          className="label-micro mb-8 inline-flex items-center gap-2 text-muted transition-colors hover:text-marron"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to collection
        </button>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-14">
          {/* Gallery */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="frame-image relative mx-auto overflow-hidden rounded-5xl bg-cream shadow-lift ring-1 ring-marron/10 lg:max-w-[calc((100vh-14rem)*0.8)]">
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label={`Open full-screen view of ${product.name}`}
                className="relative block h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`${product.id}-${currentImage}`}
                    src={imageSource(gallery[currentImage] ?? product.image)}
                    alt={product.name}
                    variants={imageSwap}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="aspect-[4/5] w-full object-cover"
                  />
                </AnimatePresence>
                <span className="label-micro absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-cream/95 px-4 py-2.5 text-marron shadow-lift backdrop-blur-sm">
                  <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Full view
                </span>
              </button>
            </div>

            <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2">
              {gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setCurrentImage(index)}
                  aria-label={`View image ${index + 1} of ${product.name}`}
                  aria-pressed={currentImage === index}
                  className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-2xl border-2 transition-all sm:h-24 sm:w-20 ${
                    currentImage === index
                      ? 'border-cyan shadow-glow'
                      : 'border-transparent opacity-65 hover:opacity-100'
                  }`}
                >
                  <img src={imageSource(image)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="rounded-5xl border border-marron/12 bg-cream p-6 shadow-soft sm:p-9">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <Badge tone="cyan">{product.category}</Badge>
              {product.tag && <Badge tone="red">{product.tag}</Badge>}
            </div>

            <h1 className="text-balance font-display text-[length:var(--type-subhead)] font-medium leading-[1.08] text-marron">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="font-display text-3xl font-semibold tabular-nums text-marron">${product.price}</span>
              <span className="text-xs text-muted">A little keepsake, made to be loved</span>
              {typeof product.stock === 'number' && product.stock <= 0 && (
                <Badge tone="red">Currently unavailable</Badge>
              )}
              {typeof product.stock === 'number' && product.stock > 0 && product.stock <= 3 && (
                <Badge tone="red">Only {product.stock} left</Badge>
              )}
            </div>

            <p className="mt-6 text-pretty text-base leading-[1.8] text-muted">{product.description}</p>

            {product.story && (
              <div className="mt-6 rounded-3xl bg-cyan-tint p-5 ring-1 ring-cyan/20">
                <div className="mb-2 flex items-center gap-2 text-cyan-deep">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span className="label-micro">The story</span>
                </div>
                <p className="font-display text-sm leading-[1.75] text-marron">{product.story}</p>
              </div>
            )}

            {/* Optional editorial storytelling — rendered only when configured in product data. */}
            {(product.personality || product.shortStory || product.favoriteThings?.length || product.collection) && (
              <div className="mt-6 overflow-hidden rounded-4xl border border-cyan/25 bg-gradient-to-br from-cyan-tint via-cream to-red-tint p-6">
                <div className="flex items-center gap-2 text-cyan-deep">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span className="label-micro">From The Little Friends World</span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-medium text-marron">Meet {product.name}</h2>
                {product.personality && (
                  <p className="mt-3 text-sm font-medium italic leading-relaxed text-marron/85">
                    “{product.personality}”
                  </p>
                )}
                {product.shortStory && (
                  <p className="mt-3 text-sm leading-relaxed text-muted">{product.shortStory}</p>
                )}
                {product.collection && (
                  <p className="label-micro mt-4 text-cyan-deep">
                    Part of the {product.collection} collection
                  </p>
                )}
                {product.favoriteThings && product.favoriteThings.length > 0 && (
                  <div className="mt-4 border-t border-marron/10 pt-4">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                      Favorite things
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.favoriteThings.map((thing) => (
                        <span key={thing} className="rounded-full bg-cream/90 px-3 py-1.5 text-xs text-marron ring-1 ring-cyan/25">
                          {thing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8">
              <h2 className="mb-3 label-micro text-marron-soft">
                Choose a size
              </h2>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={selectedSize === size}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium transition-[background-color,border-color,box-shadow] ${
                      selectedSize === size
                        ? 'border-cyan bg-cyan-tint text-marron shadow-glow'
                        : 'border-marron/15 bg-white text-muted hover:border-cyan/50 hover:text-marron'
                    }`}
                  >
                    {selectedSize === size && <Check className="h-3 w-3" aria-hidden="true" />}
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {product.colors.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 label-micro text-marron-soft">
                  Color story
                </h2>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((swatch, index) => (
                    <button
                      key={`${swatch}-${index}`}
                      type="button"
                      onClick={() => setSelectedColor(index)}
                      aria-label={`Select color ${index + 1}`}
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

            <div className="mt-8 grid gap-7 sm:grid-cols-2">
              <div>
                <h2 className="mb-3 label-micro text-marron-soft">
                  Materials
                </h2>
                <ul className="space-y-2 text-xs leading-relaxed text-muted">
                  {product.materials.map((material) => (
                    <li key={material} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan" aria-hidden="true" />
                      {material}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="mb-3 label-micro text-marron-soft">
                  Dimensions
                </h2>
                <ul className="space-y-2 text-xs leading-relaxed text-muted">
                  {product.dimensions.map((dimension) => (
                    <li key={dimension} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red" aria-hidden="true" />
                      {dimension}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-9 border-t border-marron/10 pt-7">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <h2 className="mb-3 label-micro text-marron-soft">
                    Quantity
                  </h2>
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
                    <span className="w-10 text-center font-display text-lg font-semibold text-marron" aria-live="polite">
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
                </div>
                <p className="text-xs text-muted">
                  {selectedSize}
                  {color && <span className="ml-2 inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full ring-1 ring-marron/15" style={{ backgroundColor: color }} aria-hidden="true" /> Color {selectedColor + 1}</span>}
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button variant="accent" size="lg" onClick={() => onAddToCart(product, selectedSize, color, quantity)}>
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  Add to Cart
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => onToggleFavorite(product.id)}
                  aria-pressed={isFavorite}
                >
                  <Heart
                    className={`h-4 w-4 ${isFavorite ? 'fill-red text-red' : 'text-marron'}`}
                    aria-hidden="true"
                  />
                  {isFavorite ? 'Saved to Favorites' : 'Add to Wishlist'}
                </Button>
                <Button variant="ghost" size="lg" onClick={onContact}>
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Ask a Question
                </Button>
              </div>
            </div>
          </div>
        </div>

        {miniList(relatedProducts, 'More to love', 'You may also love')}
        {miniList(
          recentlyViewed.filter((item) => item.id !== product.id).slice(0, 3),
          'Your little trail',
          'Recently viewed',
          'Your trail starts here. Visit another little friend and it will appear on this page.',
        )}
      </div>

      {/* Sticky mobile purchase action */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-marron/12 bg-cream/95 px-5 py-4 shadow-[0_-18px_48px_-30px_rgba(91,62,51,0.5)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-medium text-marron">{product.name}</p>
            <p className="text-sm font-semibold tabular-nums text-cyan-deep">${product.price}</p>
          </div>
          <Button
            variant="accent"
            onClick={() => onAddToCart(product, selectedSize, color, quantity)}
            aria-label="Add to bag"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Add to bag
          </Button>
        </div>
      </div>

      {/* Full-screen image viewer */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={`Full-screen view of ${product.name}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close full-screen view"
              onClick={() => setLightboxOpen(false)}
              className="absolute inset-0 bg-marron-deep/95 backdrop-blur-md"
            />
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative flex w-full max-w-5xl flex-col items-center"
            >
              <div className="frame-image relative flex max-h-[78vh] w-full items-center justify-center overflow-hidden rounded-5xl bg-cream">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`lightbox-${currentImage}`}
                    src={imageSource(gallery[currentImage] ?? product.image)}
                    alt={product.name}
                    variants={imageSwap}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="max-h-[78vh] w-auto max-w-full object-contain object-center"
                  />
                </AnimatePresence>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => goToImage(-1)}
                  aria-label="Previous image"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 bg-cream/5 text-cream transition-colors hover:bg-cyan hover:text-marron-deep"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="min-w-[64px] text-center font-display text-sm text-cream">
                  {currentImage + 1} / {gallery.length}
                </span>
                <button
                  type="button"
                  onClick={() => goToImage(1)}
                  aria-label="Next image"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 bg-cream/5 text-cream transition-colors hover:bg-cyan hover:text-marron-deep"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  aria-label="Close full-screen view"
                  className="ml-3 flex h-11 w-11 items-center justify-center rounded-full bg-cream text-marron transition-colors hover:bg-red hover:text-white"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

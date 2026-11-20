import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Check, Eye, Heart, ShoppingBag } from 'lucide-react'
import { Badge } from '../../design-system/Badge'
import { editorialEase } from '../../design-system/motion'
import { formatPrice } from '../../data/products'
import { imageSource } from '../../lib/assets'

export type ProductCardLayout = 'standard' | 'featured' | 'compact'

export interface ProductCardProps {
  name: string
  category: string
  price: number | string
  image: string
  secondaryImage?: string
  gallery?: string[]
  description: string
  tag?: string
  layout?: ProductCardLayout
  index?: number
  isFavorite?: boolean
  isFeatured?: boolean
  stock?: number
  onToggleFavorite?: () => void
  onViewDetails?: () => void
  onQuickView?: () => void
  onAddToCart?: () => void
}

export const ProductCard: React.FC<ProductCardProps> = ({
  name,
  category,
  price,
  image,
  secondaryImage,
  gallery,
  description,
  tag,
  layout = 'standard',
  index = 0,
  isFavorite = false,
  isFeatured = false,
  stock,
  onToggleFavorite,
  onViewDetails,
  onQuickView,
  onAddToCart,
}) => {
  const primary = imageSource(image)
  const previewImages = (gallery && gallery.length > 0 ? gallery : [image, ...(secondaryImage ? [secondaryImage] : [])])
    .map(imageSource)
    .filter((source, position, list) => list.indexOf(source) === position)
  const [activeImage, setActiveImage] = React.useState(0)
  const [justAdded, setJustAdded] = React.useState(false)
  const addTimer = React.useRef<number | null>(null)

  const isNew = Boolean(tag?.toLowerCase().includes('new'))
  const isSoldOut = typeof stock === 'number' && stock <= 0
  const lowStock = typeof stock === 'number' && stock > 0 && stock <= 3
  const priceLabel = typeof price === 'number' ? formatPrice(price) : price

  React.useEffect(() => () => {
    if (addTimer.current) window.clearTimeout(addTimer.current)
  }, [])

  const handleAdd = (event: React.MouseEvent) => {
    stop(event)
    if (isSoldOut || !onAddToCart) return
    onAddToCart()
    setJustAdded(true)
    if (addTimer.current) window.clearTimeout(addTimer.current)
    addTimer.current = window.setTimeout(() => setJustAdded(false), 1600)
  }

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onViewDetails?.()
    }
  }

  const stop = (event: React.MouseEvent) => event.stopPropagation()

  // One image layer driven by the preview dots. A hover-only secondary layer
  // made dots change an invisible image and fought the selected preview.
  const images = (
    <AnimatePresence initial={false}>
      <motion.img
        key={previewImages[activeImage] ?? primary}
        src={previewImages[activeImage] ?? primary}
        alt={name}
        loading="lazy"
        decoding="async"
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.055 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.55, ease: editorialEase }}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </AnimatePresence>
  )

  const favoriteButton = (className: string) => (
    <button
      type="button"
      onClick={(event) => {
        stop(event)
        onToggleFavorite?.()
      }}
      className={className}
      aria-label={isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
      aria-pressed={isFavorite}
      data-cursor="favorite"
    >
      <Heart
        key={isFavorite ? 'favorite-on' : 'favorite-off'}
        className={`h-4 w-4 transition-colors ${isFavorite ? 'heart-pop fill-current text-red' : 'text-marron'}`}
        aria-hidden="true"
      />
    </button>
  )

  const quickView = (className: string) => (
    <button
      type="button"
      onClick={(event) => {
        stop(event)
        if (onQuickView) onQuickView()
        else onViewDetails?.()
      }}
      className={className}
      aria-label={`Quick view ${name}`}
      data-cursor="view"
    >
      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
      Quick view
      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  )

  const previewDots = previewImages.length > 1 && layout !== 'compact' ? (
    <div
      className={`pointer-events-auto absolute left-3 z-10 flex gap-1.5 ${layout === 'standard' ? 'bottom-[4.75rem]' : 'bottom-3'}`}
      role="group"
      aria-label={`${name} image previews`}
    >
      {previewImages.slice(0, 4).map((source, dotIndex) => (
        <button
          key={`${source}-${dotIndex}`}
          type="button"
          onClick={(event) => {
            stop(event)
            setActiveImage(dotIndex)
          }}
          aria-label={`View image ${dotIndex + 1} of ${name}`}
          aria-pressed={activeImage === dotIndex}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            activeImage === dotIndex ? 'w-6 bg-cyan shadow-glow' : 'w-1.5 bg-marron/30 hover:bg-marron/60'
          }`}
        />
      ))}
    </div>
  ) : null

  const displayedTag = isNew ? undefined : tag
  const newBadge = isNew ? (
    <Badge tone="red" className="bg-red text-white ring-white/30">New</Badge>
  ) : null

  const badge = (
    <>
      {displayedTag && (
        <Badge tone="cream" className="bg-marron-deep/90 ring-white/20">
          {displayedTag}
        </Badge>
      )}
      {isFeatured && !displayedTag && <Badge tone="cyan" className="bg-cream/90">Boutique pick</Badge>}
    </>
  ) || null

  const stockLabel =
    isSoldOut
      ? <Badge tone="red" className="bg-red/90 text-white ring-white/30">Currently unavailable</Badge>
      : lowStock
        ? <Badge tone="red" className="bg-red/90 text-white ring-white/30">Only {stock} left</Badge>
        : null

  const addButton = (extraClassName = '') => {
    if (!onAddToCart) return null
    return (
      <button
        type="button"
        onClick={handleAdd}
        disabled={isSoldOut}
        aria-label={justAdded ? `${name} added to bag` : `Add ${name} to bag`}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold shadow-lg backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan disabled:opacity-50 ${
          justAdded
            ? 'bg-cyan text-marron'
            : 'bg-marron text-cream hover:bg-cyan hover:text-marron'
        } ${extraClassName}`}
      >
        {justAdded ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />}
        {justAdded ? 'Added to bag' : 'Add to bag'}
      </button>
    )
  }

  const outerClassName = [
    'group relative cursor-pointer border border-marron/12 bg-cream shadow-soft',
    'transition-[border-color,box-shadow] duration-500',
    'hover:border-cyan/45 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-deep',
    layout === 'featured'
      ? 'overflow-hidden rounded-5xl'
      : layout === 'compact'
        ? 'overflow-hidden rounded-4xl'
        : 'flex h-full flex-col overflow-hidden rounded-4xl p-3',
  ].join(' ')

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.055, 0.35), ease: editorialEase }}
      whileHover={{ y: layout === 'compact' ? -3 : -6 }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${name}`}
      onClick={onViewDetails}
      onKeyDown={handleCardKeyDown}
      className={outerClassName}
      data-cursor="product"
    >
      {layout === 'featured' && (
        <div className="grid h-full md:grid-cols-[1.02fr_0.98fr]">
          <div className="frame-image relative min-h-[340px] overflow-hidden rounded-[2rem_2rem_6rem_2rem] md:min-h-[560px]">
            {images}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5">
              <div className="flex flex-wrap gap-2">
                {badge}
                {newBadge}
              </div>
              {stockLabel}
            </div>
            {favoriteButton(
              'absolute right-5 top-20 flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 text-marron shadow-sm backdrop-blur-sm transition-colors hover:bg-red hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red',
            )}
            <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
              {quickView(
                'inline-flex items-center gap-2 rounded-full bg-cream/95 px-5 py-3 text-xs font-semibold text-marron shadow-lg backdrop-blur-sm transition-colors hover:bg-cyan',
              )}
              {addButton()}
            </div>
            {previewDots}
          </div>

          <div className="flex flex-col justify-center px-6 py-8 sm:px-9 sm:py-10">
            <span className="label-micro mb-5 text-cyan-deep">
              Signature pick · {category}
            </span>
            <h3 className="text-balance font-display text-[length:var(--type-subhead)] font-medium leading-[1.12] text-marron">
              {name}
            </h3>
            <p className="mt-5 max-w-md text-pretty text-sm leading-[1.8] text-muted">{description}</p>
            <div className="mt-8 flex items-center gap-5">
              <span className="font-display text-3xl font-semibold tabular-nums text-marron">{priceLabel}</span>
              <span className="h-px flex-1 bg-marron/15" aria-hidden="true" />
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={(event) => {
                  stop(event)
                  onViewDetails?.()
                }}
                className="inline-flex w-fit items-center gap-2 border-b border-cyan pb-1 text-xs font-semibold uppercase tracking-[0.16em] text-marron transition-colors hover:text-cyan"
              >
                View the story
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
              {onQuickView && (
                <button
                  type="button"
                  onClick={(event) => {
                    stop(event)
                    onQuickView()
                  }}
                  className="inline-flex w-fit items-center gap-2 border-b border-marron/20 pb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted transition-colors hover:text-marron"
                >
                  Quick look
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {layout === 'compact' && (
        <div className="flex h-full min-h-[150px] items-center gap-4 p-3">
          <div className="frame-image relative h-28 w-24 shrink-0 overflow-hidden rounded-3xl sm:h-32 sm:w-28">
            {images}
            <div className="pointer-events-none absolute left-2 top-2 flex scale-90 flex-wrap gap-1">
              {badge}
              {newBadge}
              {stockLabel}
            </div>
          </div>
          <div className="min-w-0 flex-1 py-2 pr-1">
            <span className="label-micro block truncate text-cyan-deep">
              {category}
            </span>
            <h3 className="mt-1.5 truncate font-display text-lg font-medium text-marron">{name}</h3>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="font-display text-base font-semibold tabular-nums text-marron">{priceLabel}</span>
              <div className="flex items-center gap-1.5">
                {favoriteButton(
                  'flex h-8 w-8 items-center justify-center rounded-full bg-marron/5 text-marron transition-colors hover:bg-red hover:text-white',
                )}
                {onQuickView ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      stop(event)
                      onQuickView()
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-marron text-cream transition-colors hover:bg-cyan hover:text-marron"
                    aria-label={`Quick view ${name}`}
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(event) => {
                      stop(event)
                      onViewDetails?.()
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-marron text-cream transition-colors hover:bg-cyan hover:text-marron"
                    aria-label={`View details for ${name}`}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {layout === 'standard' && (
        <>
          <div className="frame-image relative aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-sand/40">
            {images}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
              <div className="flex flex-wrap gap-2">{badge}</div>
              {stockLabel ?? newBadge}
            </div>
            {favoriteButton(
              'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/95 text-marron shadow-soft ring-1 ring-marron/10 backdrop-blur-sm transition-colors hover:bg-red hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red hover-reveal',
            )}
            {previewDots}
            <div className="absolute inset-x-3 bottom-3 flex justify-center gap-2 hover-reveal">
              {quickView(
                'inline-flex items-center gap-2 rounded-full bg-cream/95 px-4 py-2.5 text-[11px] font-semibold text-marron shadow-lift ring-1 ring-marron/10 backdrop-blur-sm transition-colors hover:bg-cyan hover:text-marron-deep',
              )}
              {addButton('hover-reveal')}
            </div>
          </div>

          <div className="flex flex-1 flex-col px-3 pb-3 pt-6">
            <span className="label-micro mb-2.5 text-cyan-deep">
              {category}
            </span>
            <h3 className="line-clamp-2 min-h-[3.25rem] font-display text-[length:var(--type-card)] font-medium leading-[1.2] text-marron">
              {name}
            </h3>
            <p className="mt-2.5 line-clamp-2 min-h-[2.4rem] flex-1 pb-5 text-xs leading-[1.7] text-muted">{description}</p>
            <div className="mt-auto flex items-center justify-between border-t border-marron/10 pt-4">
              <span className="font-display text-xl font-semibold tabular-nums text-marron">{priceLabel}</span>
              <button
                type="button"
                onClick={(event) => {
                  stop(event)
                  if (onQuickView) onQuickView()
                  else onViewDetails?.()
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-marron/5 text-marron ring-1 ring-marron/10 transition-colors hover:bg-cyan hover:text-marron-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-deep"
                aria-label={`Quick view ${name}`}
              >
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}

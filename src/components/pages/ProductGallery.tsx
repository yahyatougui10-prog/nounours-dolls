import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Heart, SearchX, ShoppingBag, Sparkles } from 'lucide-react'
import { CollectionFilters } from '../ui/CollectionFilters'
import { ProductCard } from '../ui/ProductCard'
import { Button } from '../ui/Button'
import { Badge } from '../../design-system/Badge'
import { BrandMark } from '../../design-system/BrandMark'
import { ProductSkeleton } from '../../design-system/ProductSkeleton'
import {
  CATEGORY_OPTIONS,
  productMatchesCategory,
  productSearchText,
  type Product,
} from '../../data/products'
import { assetUrl, imageSource } from '../../lib/assets'

export interface ProductGalleryProps {
  products: Product[]
  onProductSelect: (product: Product) => void
  initialCategory?: string
  initialSearch?: string
  favoritesOnly?: boolean
  favoriteIds?: string[]
  onToggleFavorite?: (id: string) => void
  onClearFavoritesOnly?: () => void
  mode?: 'collection' | 'wishlist'
  recentlyViewed?: Product[]
  onQuickView?: (product: Product) => void
  onAddToCart?: (product: Product, size: string, color: string, quantity: number) => void
  onAddAllToCart?: (products: Product[]) => void
}

const coverForCategory = (category: string, mode: 'collection' | 'wishlist') => {
  if (mode === 'wishlist') return assetUrl('/about-hero.jpg')
  if (category === 'teddy') return assetUrl('/products/toys/nounours/nounours_001.png')
  if (category === 'doll') return assetUrl('/products/toys/dolls/doll_001.png')
  if (category === 'gift') return assetUrl('/products/toys/nounours/nounours_013.png')
  if (category === 'new') return assetUrl('/products/toys/dolls/doll_003.png')
  return assetUrl('/about-hero.jpg')
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  products,
  onProductSelect,
  initialCategory = '',
  initialSearch = '',
  favoritesOnly = false,
  favoriteIds = [],
  onToggleFavorite,
  onClearFavoritesOnly,
  mode = 'collection',
  recentlyViewed = [],
  onQuickView,
  onAddToCart,
  onAddAllToCart,
}) => {
  const [category, setCategory] = React.useState<string>(initialCategory)
  const [search, setSearch] = React.useState<string>(initialSearch)
  const [sortBy, setSortBy] = React.useState<'name' | 'price' | 'price-desc'>('name')
  const [maxPrice, setMaxPrice] = React.useState<number>(priceLimitFor(products))
  const [isPending, startTransition] = React.useTransition()

  const priceLimit = priceLimitFor(products)
  const query = search.trim().toLowerCase()

  const filteredProducts = products.filter((product) => {
    if (!productMatchesCategory(product, category)) return false
    if (favoritesOnly && !favoriteIds.includes(product.id)) return false
    if (product.price > maxPrice) return false
    if (query && !productSearchText(product).includes(query)) return false
    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    return a.name.localeCompare(b.name)
  })

  const activeFilterCount =
    (category ? 1 : 0) + (query ? 1 : 0) + (maxPrice < priceLimit ? 1 : 0) + (favoritesOnly ? 1 : 0)

  const clearFilters = () => {
    startTransition(() => {
      setCategory('')
      setSearch('')
      setMaxPrice(priceLimit)
    })
    onClearFavoritesOnly?.()
  }

  const quickAdd = (product: Product) =>
    onAddToCart
      ? () => onAddToCart(product, product.sizes[0] ?? 'One size', product.colors[0] ?? '', 1)
      : undefined

  const tabs = [
    { value: '', label: favoritesOnly ? 'Saved favorites' : 'All treasures' },
    ...CATEGORY_OPTIONS,
  ]

  const heading = mode === 'wishlist'
    ? 'Your saved little friends'
    : category === 'new'
      ? 'The newest little wonders'
      : 'A world of little wonders'

  const description = mode === 'wishlist'
    ? 'The companions you loved enough to keep close. Ready when you are.'
    : category === 'new'
      ? 'Fresh arrivals and small-batch finds — the first of their stories to be told.'
      : 'Teddy bears to cuddle, dolls to cherish, and gifts that say more than words. Every piece is chosen with care.'

  return (
    <section className="pb-28 pt-28 sm:pt-32" id="collection">
      <div className="page-container">
        {/* Editorial cover */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-10 overflow-hidden rounded-5xl bg-marron-deep shadow-lift sm:mb-14"
        >
          <img
            src={coverForCategory(category, mode)}
            alt="A curated collection of teddy bears and dolls"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-marron-deep via-marron-deep/90 to-marron-deep/40" aria-hidden="true" />
          <div className="relative flex min-h-[300px] flex-col justify-end p-7 sm:min-h-[380px] sm:p-12 lg:p-16">
            <Badge tone="cream" className="mb-5 w-fit bg-cyan/20 text-cream ring-cyan/40">
              {mode === 'wishlist' ? 'Your little circle' : 'The boutique edit'}
            </Badge>
            <h1 className="max-w-2xl text-balance font-display text-[length:var(--type-section)] font-medium leading-[1.05] text-cream">
              {heading}
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-sm leading-[1.8] text-cream/75 sm:text-base">
              {description}
            </p>
          </div>
        </motion.div>

        {/* Recently viewed — a quiet personal touch */}
        {recentlyViewed.length > 0 && (
          <div className="mb-9 rounded-4xl border border-marron/10 bg-cream/70 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-marron/60">
                  Pick up where you left off
                </p>
                <h2 className="mt-1 font-display text-lg font-medium text-marron">Recently viewed</h2>
              </div>
              <span className="hidden text-xs text-muted sm:block">Your little trail through the boutique</span>
            </div>
            <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
              {recentlyViewed.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onProductSelect(product)}
                  aria-label={`Revisit ${product.name}`}
                  className="group flex shrink-0 items-center gap-3 rounded-full border border-marron/10 bg-white py-2 pl-2 pr-4 text-left transition-colors hover:border-cyan/50"
                >
                  <img
                    src={imageSource(product.image)}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span>
                    <span className="block max-w-[140px] truncate font-display text-sm font-medium text-marron">
                      {product.name}
                    </span>
                    <span className="block text-[10px] text-muted">${product.price}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Premium wishlist action */}
        {mode === 'wishlist' && sortedProducts.length > 0 && onAddAllToCart && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col gap-4 overflow-hidden rounded-4xl border border-cyan/25 bg-sky-soft p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan/25 text-marron">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-lg font-medium text-marron">Ready to bring them home?</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Add all {sortedProducts.length} saved {sortedProducts.length === 1 ? 'friend' : 'friends'} to your bag with one tap. Your favorites stay saved.
                </p>
              </div>
            </div>
            <Button variant="accent" onClick={() => onAddAllToCart(sortedProducts)} className="shrink-0">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Add all to bag
            </Button>
          </motion.div>
        )}

        {/* Category navigation */}
        <div className="no-scrollbar -mx-5 mb-7 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
          {tabs.map((tab) => {
            const isActive = category === tab.value
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => startTransition(() => setCategory(tab.value))}
                aria-pressed={isActive}
                className={`relative shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold transition-colors ${
                  isActive ? 'text-cream' : 'text-muted hover:text-marron'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="category-tab"
                    className="absolute inset-0 rounded-full bg-marron shadow-soft ring-1 ring-marron/20"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{tab.label}</span>
              </button>
            )
          })}
        </div>

        <CollectionFilters
          categories={CATEGORY_OPTIONS}
          selectedCategory={category}
          onCategoryChange={(value) => startTransition(() => setCategory(value))}
          searchQuery={search}
          onSearchChange={(value) => startTransition(() => setSearch(value))}
          sortBy={sortBy}
          onSortChange={(value) => startTransition(() => setSortBy(value))}
          maxPrice={maxPrice}
          priceLimit={priceLimit}
          onPriceChange={(value) => startTransition(() => setMaxPrice(value))}
          activeFilterCount={activeFilterCount}
          onClearFilters={clearFilters}
          resultCount={sortedProducts.length}
          favoritesOnly={favoritesOnly}
          onClearFavoritesOnly={onClearFavoritesOnly ?? clearFilters}
        />

        <div className="product-grid mt-10">
          {isPending
            ? Array.from({ length: 4 }, (_, index) => <ProductSkeleton key={index} />)
            : (
              <AnimatePresence mode="popLayout">
                {sortedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    index={index}
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
                    onToggleFavorite={() => onToggleFavorite?.(product.id)}
                    onViewDetails={() => onProductSelect(product)}
                    onQuickView={onQuickView ? () => onQuickView(product) : undefined}
                    onAddToCart={quickAdd(product)}
                  />
                ))}
              </AnimatePresence>
            )}
        </div>

        <AnimatePresence>
          {!isPending && sortedProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-10 flex flex-col items-center rounded-5xl border border-marron/15 bg-cream px-6 py-16 text-center shadow-soft"
            >
              <div className="relative mb-6">
                <BrandMark size={72} className="opacity-70" />
                {favoritesOnly && favoriteIds.length === 0 ? (
                  <Heart className="absolute -right-2 -top-1 h-6 w-6 text-red" aria-hidden="true" />
                ) : (
                  <SearchX className="absolute -right-3 -top-1 h-6 w-6 text-cyan" aria-hidden="true" />
                )}
              </div>
              <h2 className="font-display text-2xl font-medium text-marron">
                {favoritesOnly && favoriteIds.length === 0
                  ? 'No favorites just yet'
                  : 'No little friends found'}
              </h2>
              <p className="mt-3 max-w-sm text-sm text-muted">
                {favoritesOnly && favoriteIds.length === 0
                  ? 'Tap the heart on any product to keep it close, then come back to find it here.'
                  : 'Try a different search, category or price range — your perfect companion is waiting.'}
              </p>
              <Button variant="accent" className="mt-7" onClick={clearFilters}>
                Show all products
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function priceLimitFor(products: Product[]): number {
  const highest = products.reduce((max, product) => Math.max(max, product.price), 0)
  return Math.max(50, Math.ceil(highest / 25) * 25)
}

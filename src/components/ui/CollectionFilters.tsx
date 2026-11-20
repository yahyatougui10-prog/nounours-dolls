import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { FilterOption } from '../../data/products'

export interface CollectionFiltersProps {
  categories: FilterOption[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: 'name' | 'price' | 'price-desc'
  onSortChange: (sortBy: 'name' | 'price' | 'price-desc') => void
  maxPrice: number
  priceLimit: number
  onPriceChange: (price: number) => void
  activeFilterCount: number
  onClearFilters: () => void
  resultCount: number
  favoritesOnly?: boolean
  onClearFavoritesOnly?: () => void
}

const controlClassName =
  'w-full rounded-2xl border border-marron/15 bg-white py-3 pl-11 pr-4 text-sm text-marron shadow-soft outline-none transition-[border-color,box-shadow] placeholder:text-muted/60 focus:border-cyan-deep focus:ring-2 focus:ring-cyan/25'

export const CollectionFilters: React.FC<CollectionFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  maxPrice,
  priceLimit,
  onPriceChange,
  activeFilterCount,
  onClearFilters,
  resultCount,
  favoritesOnly = false,
  onClearFavoritesOnly,
}) => {
  const selectedLabel = categories.find((option) => option.value === selectedCategory)?.label

  return (
    <div className="glass-panel rounded-4xl p-5 sm:p-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-tint text-cyan-deep">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-lg font-medium text-marron">Find your little friend</h2>
            <p className="text-xs text-muted">Refine the collection to suit your story</p>
          </div>
          {activeFilterCount > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red px-1.5 text-[10px] font-bold text-white" aria-label={`${activeFilterCount} active filters`}>
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-muted" aria-live="polite">
            <strong className="font-semibold text-marron">{resultCount}</strong>{' '}
            {resultCount === 1 ? 'little friend' : 'little friends'}
          </span>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="rounded-full text-xs font-semibold text-red underline decoration-red/30 underline-offset-4 transition-colors hover:decoration-red"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="product-search" className="label-micro mb-2 block text-marron-soft">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="product-search"
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search the collection…"
              className={controlClassName}
            />
          </div>
        </div>

        <div>
          <label htmlFor="category-filter" className="label-micro mb-2 block text-marron-soft">
            Category
          </label>
          <div className="relative">
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(event) => onCategoryChange(event.target.value)}
              className={`${controlClassName} appearance-none pr-10`}
            >
              <option value="">All treasures</option>
              {categories.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted" aria-hidden="true">▾</span>
          </div>
        </div>

        <div>
          <label htmlFor="sort-filter" className="label-micro mb-2 block text-marron-soft">
            Sort by
          </label>
          <div className="relative">
            <select
              id="sort-filter"
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value as 'name' | 'price' | 'price-desc')}
              className={`${controlClassName} appearance-none pr-10`}
            >
              <option value="name">Name · A–Z</option>
              <option value="price">Price · Low to high</option>
              <option value="price-desc">Price · High to low</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted" aria-hidden="true">▾</span>
          </div>
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="price-filter" className="label-micro block text-marron-soft">
              Max price
            </label>
            <span className="font-display text-sm font-semibold text-cyan">${maxPrice}</span>
          </div>
          <div className="flex h-[46px] items-center">
            <input
              id="price-filter"
              type="range"
              min={0}
              max={priceLimit}
              step={5}
              value={maxPrice}
              onChange={(event) => onPriceChange(Number(event.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-marron/10 accent-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/25"
            />
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-marron/10 pt-5">
              <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Active</span>

              {favoritesOnly && (
                <FilterChip label="Favorites" tone="red" onClick={onClearFavoritesOnly} />
              )}
              {selectedLabel && <FilterChip label={selectedLabel} onClick={() => onCategoryChange('')} />}
              {searchQuery.trim() && (
                <FilterChip label={`“${searchQuery.trim()}”`} onClick={() => onSearchChange('')} />
              )}
              {maxPrice < priceLimit && (
                <FilterChip label={`Under $${maxPrice}`} onClick={() => onPriceChange(priceLimit)} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface FilterChipProps {
  label: string
  onClick?: () => void
  tone?: 'cyan' | 'red'
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onClick, tone = 'cyan' }) => (
  <motion.button
    type="button"
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
      tone === 'red' ? 'bg-red/10 text-red hover:bg-red/20' : 'bg-cyan/15 text-marron hover:bg-cyan/25'
    }`}
  >
    {label}
    <X className="h-3 w-3" aria-hidden="true" />
  </motion.button>
)

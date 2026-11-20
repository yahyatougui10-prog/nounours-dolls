import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Clock3, Search, Sparkles, X } from 'lucide-react'
import {
  CATEGORY_OPTIONS,
  formatPrice,
  productMatchesCategory,
  productSearchText,
  type FilterOption,
  type Product,
} from '../../data/products'
import { modalVariants } from '../../design-system/motion'
import { imageSource } from '../../lib/assets'
import type { NavView } from './Navbar'

export interface SearchOverlayProps {
  open: boolean
  products: Product[]
  onClose: () => void
  onSearch: (query: string) => void
  onProductSelect: (product: Product) => void
  onNavigate: (view: NavView, category?: string) => void
}

interface ProductOption {
  id: string
  kind: 'product'
  label: string
  product: Product
}

interface CategoryOption {
  id: string
  kind: 'category'
  label: string
  category: FilterOption
}

type SearchOption = ProductOption | CategoryOption

const RECENT_KEY = 'noosh-recent-searches'
const MAX_RECENT = 6

const uniqueTerms = (values: string[]): string[] =>
  values.filter(
    (value, index) =>
      values.findIndex((other) => other.toLowerCase() === value.toLowerCase()) === index,
  )

const loadRecent = (): string[] => {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return uniqueTerms(
      parsed
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim()),
    ).slice(0, MAX_RECENT)
  } catch {
    return []
  }
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  open,
  products,
  onClose,
  onSearch,
  onProductSelect,
  onNavigate,
}) => {
  const [query, setQuery] = React.useState('')
  const [recent, setRecent] = React.useState<string[]>(loadRecent)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const close = React.useCallback(() => {
    setQuery('')
    setActiveIndex(-1)
    onClose()
  }, [onClose])

  const term = query.trim().toLowerCase()

  const productResults = React.useMemo(() => {
    if (!term) return []
    return products.filter((product) => productSearchText(product).includes(term)).slice(0, 6)
  }, [products, term])

  const categoryResults = React.useMemo(
    () =>
      CATEGORY_OPTIONS.filter(
        (option) =>
          !term ||
          option.label.toLowerCase().includes(term) ||
          option.value.toLowerCase().includes(term),
      ),
    [term],
  )

  const options: SearchOption[] = React.useMemo(
    () => [
      ...productResults.map((product): ProductOption => ({
        id: `noosh-option-product-${product.id}`,
        kind: 'product',
        label: product.name,
        product,
      })),
      ...categoryResults.map((category): CategoryOption => ({
        id: `noosh-option-category-${category.value}`,
        kind: 'category',
        label: category.label,
        category,
      })),
    ],
    [productResults, categoryResults],
  )

  const popularSearches = React.useMemo(() => {
    const counts = new Map<string, number>()
    products.forEach((product) => {
      const tag = product.tag?.trim()
      if (tag) counts.set(tag, (counts.get(tag) ?? 0) + 1)
    })
    CATEGORY_OPTIONS.filter((option) =>
      products.some((product) => productMatchesCategory(product, option.value)),
    ).forEach((option) => counts.set(option.label, (counts.get(option.label) ?? 0) + 1))

    return uniqueTerms(
      [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([label]) => label),
    ).slice(0, MAX_RECENT)
  }, [products])

  React.useEffect(() => {
    try {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(recent))
    } catch {
      // Storage can be unavailable (private mode); search still works in memory.
    }
  }, [recent])

  React.useEffect(() => {
    if (!open) return
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 60)
    return () => window.clearTimeout(focusTimer)
  }, [open])

  // Keep the page behind the modal still, matching the other overlays.
  React.useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, close])

  const openProduct = (product: Product) => {
    onProductSelect(product)
    close()
  }

  const openCategory = (category: FilterOption) => {
    onNavigate('collection', category.value)
    close()
  }

  const selectOption = (option: SearchOption) => {
    if (option.kind === 'product') openProduct(option.product)
    else openCategory(option.category)
  }

  const submit = (value: string = query) => {
    const trimmed = value.trim()
    if (!trimmed) return
    setRecent((previous) => uniqueTerms([trimmed, ...previous]).slice(0, MAX_RECENT))
    onSearch(trimmed)
    close()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => (options.length ? (current + 1) % options.length : -1))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) =>
        options.length ? (current <= 0 ? options.length - 1 : current - 1) : -1,
      )
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const activeOption = options[activeIndex]
      if (activeOption) selectOption(activeOption)
      else submit()
    }
  }

  const resultCount = productResults.length + categoryResults.length

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto p-3 pt-24 sm:p-6 sm:pt-28"
          role="dialog"
          aria-modal="true"
          aria-label="Search the collection"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            type="button"
            aria-label="Close search"
            onClick={close}
            className="fixed inset-0 cursor-default bg-marron-deep/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full max-w-3xl overflow-hidden rounded-4xl border border-cream/70 bg-cream shadow-modal"
          >
            <div className="flex items-center justify-between gap-3 border-b border-marron/10 px-5 py-4 sm:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-tint text-cyan-deep">
                  <Search className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-lg leading-tight text-marron">
                    Find a little happiness
                  </span>
                  <span className="label-micro mt-1 block text-muted">
                    Search friends, gifts &amp; stories
                  </span>
                </span>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-marron transition-colors hover:bg-red-tint hover:text-red-deep"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form
              role="search"
              onSubmit={(event) => {
                event.preventDefault()
                submit()
              }}
              className="border-b border-marron/10 px-5 py-4 sm:px-7"
            >
              <div className="flex items-center gap-2 rounded-full border border-marron/15 bg-white px-4 py-2.5 shadow-soft transition-[border-color,box-shadow] focus-within:border-cyan-deep focus-within:ring-2 focus-within:ring-cyan/25">
                <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setActiveIndex(-1)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Teddy bears, dolls, gifts…"
                  aria-label="Search the collection"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={options.length > 0}
                  aria-controls="noosh-search-options"
                  aria-activedescendant={
                    activeIndex >= 0 && options[activeIndex] ? options[activeIndex].id : undefined
                  }
                  className="min-w-0 flex-1 bg-transparent text-sm text-marron outline-none placeholder:text-muted/70"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('')
                      setActiveIndex(-1)
                      inputRef.current?.focus()
                    }}
                    aria-label="Clear search"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-sand hover:text-marron"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-cyan px-4 py-2 text-xs font-semibold text-marron-deep shadow-soft transition-colors hover:bg-cyan-deep hover:text-cream"
                >
                  Search
                </button>
              </div>
              {term && (
                <p className="mt-3 text-[11px] text-muted" aria-live="polite">
                  {resultCount} {resultCount === 1 ? 'result' : 'results'} for “{query.trim()}”
                </p>
              )}
            </form>

            <div className="max-h-[min(58vh,480px)] overflow-y-auto px-5 py-4 sm:px-7">
              <div id="noosh-search-options" role="listbox" aria-label="Search suggestions">
                {productResults.length > 0 && (
                  <>
                    <p
                      role="presentation"
                      className="pb-2 label-micro text-muted"
                    >
                      Little friends
                    </p>
                    {productResults.map((product, index) => (
                      <button
                        key={product.id}
                        id={`noosh-option-product-${product.id}`}
                        type="button"
                        role="option"
                        aria-selected={activeIndex === index}
                        onClick={() => openProduct(product)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`flex w-full items-center gap-3 rounded-3xl p-2 text-left transition-colors ${
                          activeIndex === index ? 'bg-cyan/15' : 'hover:bg-sand/70'
                        }`}
                      >
                        <img
                          src={imageSource(product.image)}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-2xl object-cover"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-sm font-medium text-marron">
                            {product.name}
                          </span>
                          <span className="block truncate text-[11px] text-muted">
                            {product.category}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-cyan">
                          {formatPrice(product.price)}
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted/60" aria-hidden="true" />
                      </button>
                    ))}
                  </>
                )}

                {categoryResults.length > 0 && (
                  <>
                    <p
                      role="presentation"
                      className={`label-micro text-muted ${
                        productResults.length > 0 ? 'pb-2 pt-4' : 'pb-2'
                      }`}
                    >
                      Categories
                    </p>
                    {categoryResults.map((category, index) => {
                      const optionIndex = productResults.length + index
                      return (
                        <button
                          key={category.value}
                          id={`noosh-option-category-${category.value}`}
                          type="button"
                          role="option"
                          aria-selected={activeIndex === optionIndex}
                          onClick={() => openCategory(category)}
                          onMouseEnter={() => setActiveIndex(optionIndex)}
                          className={`flex w-full items-center justify-between rounded-3xl px-2 py-2.5 text-left text-sm transition-colors ${
                            activeIndex === optionIndex
                              ? 'bg-cyan-tint text-cyan-deep'
                              : 'text-marron hover:bg-sand/70'
                          }`}
                        >
                          {category.label}
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )
                    })}
                  </>
                )}
              </div>

              {term && resultCount === 0 && (
                <p className="px-4 py-9 text-center text-sm text-muted">
                  No little friends found for “{query.trim()}”. Try another name or category.
                </p>
              )}

              {!term && recent.length > 0 && (
                <section className="mt-5 border-t border-marron/10 pt-4">
                  <div className="mb-3 flex items-center justify-between px-3">
                    <p className="label-micro text-muted">
                      Recent searches
                    </p>
                    <button
                      type="button"
                      onClick={() => setRecent([])}
                      className="text-[10px] font-medium text-muted transition-colors hover:text-red"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => submit(value)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-marron/12 bg-white/70 px-3.5 py-2 text-xs text-marron transition-colors hover:border-cyan/50 hover:text-cyan"
                      >
                        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                        {value}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {!term && popularSearches.length > 0 && (
                <section className="mt-5 border-t border-marron/10 pt-4">
                  <p className="mb-3 px-3 label-micro text-muted">
                    Popular in the little world
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => submit(value)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-sand/70 px-3.5 py-2 text-xs text-marron transition-colors hover:bg-cyan/20"
                      >
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        {value}
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <p className="hidden border-t border-marron/10 px-7 py-3 text-[10px] text-muted/70 sm:block">
              ↑ ↓ to browse · Enter to open · Esc to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

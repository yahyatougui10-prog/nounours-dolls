import React from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { ArrowUpRight, Heart, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { BrandMark } from '../../design-system/BrandMark'
import type { Product } from '../../data/products'
import { assetUrl } from '../../lib/assets'
import { CustomCursor } from './CustomCursor'
import { MobileTabBar } from './MobileTabBar'
import { SearchOverlay } from './SearchOverlay'

export type NavView =
  | 'home'
  | 'collection'
  | 'about'
  | 'gallery'
  | 'contact'
  | 'wishlist'
  | 'cart'
  | 'gift-studio'
  | 'friend-finder'
  | 'admin'

export interface NavbarProps {
  activeView: NavView
  activeCategory?: string
  isMobileMenuOpen: boolean
  toggleMobileMenu: () => void
  favoriteCount: number
  cartCount: number
  products: Product[]
  onNavigate: (view: NavView, category?: string) => void
  onOpenCart: () => void
  onProductSelect: (product: Product) => void
  onSearch: (query: string) => void
  /** Extra hide signal for the bottom tab bar (e.g. an open cart drawer). */
  isMobileTabBarHidden?: boolean
  /** Space reserved above the header, e.g. for the server-offline banner. */
  topOffset?: number
}

interface NavItem {
  label: string
  view: NavView
  category?: string
  hasMenu?: boolean
  /** Hide at the compact `lg` breakpoint; still available via the menu. */
  secondary?: boolean
}

const navItems: NavItem[] = [
  { label: 'Home', view: 'home' },
  { label: 'Our Collection', view: 'collection', hasMenu: true },
  { label: 'Dolls', view: 'collection', category: 'doll' },
  { label: 'Gift Studio', view: 'gift-studio' },
  { label: 'Friend Finder', view: 'friend-finder' },
  { label: 'About', view: 'about' },
  { label: 'Gallery', view: 'gallery', secondary: true },
  { label: 'Contact', view: 'contact', secondary: true },
]

const collectionMenu: Array<{ label: string; category: string; image: string }> = [
  { label: 'Teddy Bears', category: 'teddy', image: assetUrl('/products/toys/nounours/nounours_001.png') },
  { label: 'Beautiful Dolls', category: 'doll', image: assetUrl('/products/toys/dolls/doll_001.png') },
  { label: 'Special Gifts', category: 'gift', image: assetUrl('/products/toys/nounours/nounours_013.png') },
  { label: 'New Arrivals', category: 'new', image: assetUrl('/products/toys/dolls/doll_003.png') },
]

const mobileCategoryItems: NavItem[] = [
  { label: 'Teddy Bears', view: 'collection', category: 'teddy' },
  { label: 'Beautiful Dolls', view: 'collection', category: 'doll' },
  { label: 'Special Gifts', view: 'collection', category: 'gift' },
  { label: 'New Arrivals', view: 'collection', category: 'new' },
]

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  activeCategory = '',
  isMobileMenuOpen,
  toggleMobileMenu,
  favoriteCount,
  cartCount,
  products,
  onNavigate,
  onOpenCart,
  onProductSelect,
  onSearch,
  isMobileTabBarHidden = false,
  topOffset = 0,
}) => {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [isCollectionMenuOpen, setCollectionMenuOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const { scrollY, scrollYProgress } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 24)
  })

  const goTo = (view: NavView, category?: string) => {
    onNavigate(view, category)
    setCollectionMenuOpen(false)
    setIsSearchOpen(false)
    // App closes the mobile menu on every navigation; toggling here would
    // race with that update and reopen it.
  }

  const isItemActive = (item: NavItem) => {
    if (item.view === 'collection' && item.category) {
      return activeView === 'collection' && activeCategory === item.category
    }
    if (item.view === 'collection') {
      return activeView === 'collection' && !activeCategory
    }
    return activeView === item.view
  }

  // Gift Studio starts with a dark hero, so scroll position alone cannot
  // decide the header theme. Keep the header legible on that view at rest.
  const useDarkHeader = isScrolled || activeView === 'gift-studio'

  const iconButtonClass = `relative flex h-11 w-11 items-center justify-center rounded-full border shadow-soft transition-[background-color,border-color,color,transform] duration-300 hover:-translate-y-0.5 ${
    useDarkHeader
      ? 'border-white/15 bg-white/5 text-cream hover:border-cyan/50 hover:bg-white/10 hover:text-cyan'
      : 'border-marron/15 bg-cream/70 text-marron hover:border-cyan/50 hover:bg-white hover:text-cyan-deep'
  }`

  return (
    <>
      <motion.nav
        initial={{ y: -90 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        style={{ top: topOffset }}
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${
          isScrolled
            ? 'border-marron-deep/40 bg-marron-deep/95 shadow-lift backdrop-blur-xl'
            : activeView === 'gift-studio'
              ? 'border-cyan/15 bg-marron'
              : 'border-transparent bg-transparent'
        }`}
        aria-label="Primary navigation"
      >
        <div className="page-container grid h-20 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
          <button
            type="button"
            onClick={() => goTo('home')}
            className="group col-start-1 flex shrink-0 items-center justify-self-start gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            aria-label="Noosh and Friends home"
          >
            <BrandMark size={40} title="Noosh & Friends" className="shrink-0" />
            <span className="hidden text-left sm:block">
              <span
                className={`block font-display text-lg font-semibold leading-none tracking-tight transition-colors duration-500 ${
                  useDarkHeader ? 'text-cream' : 'text-marron'
                }`}
              >
                NOOSH &amp; FRIENDS
              </span>
              <span
                className={`mt-1 hidden text-[8px] font-semibold uppercase tracking-[0.28em] xl:block ${
                  useDarkHeader ? 'text-cyan-tint' : 'text-marron'
                }`}
              >
                A Little World of Happiness
              </span>
            </span>
          </button>

          <div className="col-start-2 hidden min-w-0 items-center justify-self-center gap-1.5 lg:flex xl:gap-2">
            {navItems.map((item) => {
              const isActive = isItemActive(item)
              const button = (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => goTo(item.view, item.category)}
                  onFocus={item.hasMenu ? () => setCollectionMenuOpen(true) : undefined}
                  className={`group relative whitespace-nowrap rounded-full px-2 py-2 text-[12px] font-medium transition-colors xl:px-3.5 xl:text-[13px] ${
                    item.secondary ? 'hidden xl:inline-flex' : 'inline-flex'
                  } ${
                    useDarkHeader ? 'text-cream/80 hover:text-cyan' : 'text-marron/80 hover:text-marron'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-cyan"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-cyan/60 transition-transform duration-300 group-hover:scale-x-100" />
                </button>
              )

              return item.hasMenu ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setCollectionMenuOpen(true)}
                  onMouseLeave={() => setCollectionMenuOpen(false)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setCollectionMenuOpen(false)
                    }
                  }}
                >
                  {button}
                  <AnimatePresence>
                    {isCollectionMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.25 }}
                        className="absolute left-1/2 top-full w-[min(520px,88vw)] -translate-x-1/2 pt-4"
                      >
                        <div className="glass-panel rounded-4xl p-3 sm:p-4">
                          <p className="label-micro mb-3 px-2 text-marron-soft">
                            Enter a little world
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {collectionMenu.map((entry) => (
                              <button
                                key={entry.category}
                                type="button"
                                onClick={() => goTo('collection', entry.category)}
                                className="group/menu flex items-center gap-3 rounded-3xl p-2 text-left ring-1 ring-transparent transition-[background-color,box-shadow] hover:bg-sand/60 hover:ring-cyan/30"
                              >
                                <img
                                  src={entry.image}
                                  alt=""
                                  className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-soft"
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate font-display text-sm font-medium text-marron">
                                    {entry.label}
                                  </span>
                                  <span className="mt-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-deep">
                                    Discover
                                    <ArrowUpRight
                                      className="h-3 w-3 transition-transform group-hover/menu:translate-x-0.5 group-hover/menu:-translate-y-0.5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                </span>
                              </button>
                            ))}
                          </div>
                          <div className="mt-3 flex items-center justify-between border-t border-marron/10 px-2 pt-3">
                            <button
                              type="button"
                              onClick={() => goTo('admin')}
                              className="text-[10px] font-medium text-muted transition-colors hover:text-cyan"
                            >
                              Admin
                            </button>
                            <span className="text-[9px] uppercase tracking-[0.18em] text-muted/60">
                              For the little team
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                button
              )
            })}
          </div>

          <div className={`col-start-3 flex shrink-0 items-center justify-self-end gap-1 sm:gap-2 ${useDarkHeader ? 'text-cream' : 'text-marron'}`}>
            <button
              type="button"
              onClick={() => setIsSearchOpen((current) => !current)}
              className={iconButtonClass}
              aria-label={isSearchOpen ? 'Close search' : 'Open search'}
              aria-expanded={isSearchOpen}
            >
              <Search className="h-[18px] w-[18px]" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => goTo('wishlist')}
              className={iconButtonClass}
              aria-label={`Favorites, ${favoriteCount} saved`}
            >
              <Heart className="h-[18px] w-[18px]" aria-hidden="true" />
              {favoriteCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red px-1 text-[10px] font-bold text-white ring-2 ring-cream">
                  {favoriteCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className={iconButtonClass}
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-cyan px-1 text-[10px] font-bold text-marron-deep ring-2 ring-cream">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={toggleMobileMenu}
              className={`${iconButtonClass} lg:hidden`}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-cyan/70"
          aria-hidden="true"
        />
      </motion.nav>

      {/* Animated mobile navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-x-0 bottom-0 top-20 z-40 overflow-y-auto overscroll-contain bg-marron/97 px-6 pb-24 pt-8 backdrop-blur-2xl lg:hidden"
            style={{ top: `calc(${topOffset}px + 5rem)` }}
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
          >
            <div className="mx-auto flex max-w-md flex-col">
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan">
                A Little World of Happiness
              </p>
              {navItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  type="button"
                  onClick={() => goTo(item.view, item.category)}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="border-b border-white/10 py-3 text-left font-display text-2xl font-medium text-cream/90 transition-colors hover:text-cyan"
                >
                  {item.label}
                </motion.button>
              ))}

              <p className="mb-3 mt-6 text-[9px] font-semibold uppercase tracking-[0.28em] text-cyan/70">
                Explore categories
              </p>
              <div className="flex flex-wrap gap-2">
                {mobileCategoryItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => goTo('collection', item.category)}
                    className="rounded-full border border-white/15 px-3.5 py-2 text-xs text-cream/80 transition-colors hover:border-cyan/50 hover:text-cyan"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => goTo('wishlist')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan/40 px-5 py-3 text-sm font-medium text-cyan transition-colors hover:bg-cyan/10"
                >
                  <Heart className="h-4 w-4" aria-hidden="true" />
                  Saved ({favoriteCount})
                </button>
                <button
                  type="button"
                  onClick={() => goTo('cart')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-cream/80 transition-colors hover:border-cyan/40 hover:text-cyan"
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  Bag ({cartCount})
                </button>
              </div>

              <button
                type="button"
                onClick={() => goTo('admin')}
                className="mt-8 self-start text-[11px] text-cream/40 transition-colors hover:text-cyan/80"
              >
                Admin
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay
        open={isSearchOpen}
        products={products}
        onClose={() => setIsSearchOpen(false)}
        onSearch={onSearch}
        onProductSelect={(product) => {
          setIsSearchOpen(false)
          onProductSelect(product)
        }}
        onNavigate={goTo}
      />

      <MobileTabBar
        activeView={activeView}
        hidden={isMobileMenuOpen || isSearchOpen || isMobileTabBarHidden}
        favoriteCount={favoriteCount}
        cartCount={cartCount}
        onNavigate={goTo}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <CustomCursor />
    </>
  )
}

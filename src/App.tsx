import React from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Navbar, type NavView } from './components/ui/Navbar'
import { Footer } from './components/ui/Footer'
import { CartDrawer } from './components/ui/CartDrawer'
import { AssistanceButton } from './components/ui/AssistanceButton'
import { Toast } from './components/ui/Toast'
import { HomePage } from './components/pages/HomePage'
import { ProductGallery } from './components/pages/ProductGallery'
import { AboutPage } from './components/pages/AboutPage'
import { GalleryPage } from './components/pages/GalleryPage'
import { ContactPage } from './components/pages/ContactPage'
import { CartPage } from './components/pages/CartPage'
import { ProductDetailPage } from './components/pages/ProductDetailPage'
import { pageVariants } from './design-system/motion'
import { useCatalog } from './hooks/useCatalog'
import { isStaticSite, staticCatalogNotice } from './lib/environment'
import {
  PRODUCTS,
  type CartItem,
  type CartLine,
  type Product,
} from './data/products'

// Heavier, less frequently visited experiences load on demand to keep the
// boutique's first paint fast.
const QuickViewModal = React.lazy(() =>
  import('./components/ui/QuickViewModal').then((module) => ({ default: module.QuickViewModal })),
)
const FriendFinderPage = React.lazy(() =>
  import('./components/pages/FriendFinderPage').then((module) => ({ default: module.FriendFinderPage })),
)
const GiftStudioPage = React.lazy(() =>
  import('./components/pages/GiftStudioPage').then((module) => ({ default: module.GiftStudioPage })),
)
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'))

type View = NavView | 'product-detail'

interface PersistedState {
  favoriteIds: string[]
  cartItems: CartItem[]
  recentlyViewedIds: string[]
}

const STORAGE_KEY = 'noosh-and-friends-state'

const defaultPersisted: PersistedState = {
  favoriteIds: [],
  cartItems: [],
  recentlyViewedIds: [],
}

const loadPersisted = (): PersistedState => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultPersisted
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return {
      favoriteIds: Array.isArray(parsed.favoriteIds) ? parsed.favoriteIds.filter((id) => typeof id === 'string') : [],
      cartItems: Array.isArray(parsed.cartItems)
        ? parsed.cartItems.filter(
            (item): item is CartItem =>
              Boolean(item) &&
              typeof item.productId === 'string' &&
              typeof item.size === 'string' &&
              typeof item.color === 'string' &&
              typeof item.quantity === 'number',
          )
        : [],
      recentlyViewedIds: Array.isArray(parsed.recentlyViewedIds)
        ? parsed.recentlyViewedIds.filter((id) => typeof id === 'string')
        : [],
    }
  } catch {
    return defaultPersisted
  }
}

const BoutiqueLoader: React.FC = () => (
  <div className="bg-warm flex min-h-screen flex-col items-center justify-center gap-5 text-center" role="status" aria-live="polite">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
      className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-marron/10 border-t-cyan"
    >
      <Sparkles className="h-5 w-5 text-marron/40" aria-hidden="true" />
    </motion.div>
    <div>
      <p className="font-display text-2xl font-medium text-marron">Opening our little world…</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
        NOOSH &amp; FRIENDS
      </p>
    </div>
  </div>
)

const ViewLoader: React.FC = () => (
  <div
    className="flex min-h-[55vh] items-center justify-center"
    role="status"
    aria-live="polite"
  >
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-marron/10 border-t-cyan"
      >
        <Sparkles className="h-4 w-4 text-marron/40" aria-hidden="true" />
      </motion.div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">
        Opening this little corner…
      </span>
    </div>
  </div>
)

export default function App() {
  const persisted = React.useMemo(() => loadPersisted(), [])
  const { catalog, products: liveProducts, loading: catalogLoading, error: catalogError } = useCatalog()
  const [view, setView] = React.useState<View>('home')
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
  const [quickViewProduct, setQuickViewProduct] = React.useState<Product | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isCartOpen, setIsCartOpen] = React.useState(false)
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>(persisted.favoriteIds)
  const [cartItems, setCartItems] = React.useState<CartItem[]>(persisted.cartItems)
  const [recentlyViewedIds, setRecentlyViewedIds] = React.useState<string[]>(persisted.recentlyViewedIds)
  const [collectionCategory, setCollectionCategory] = React.useState('')
  const [collectionSearch, setCollectionSearch] = React.useState('')
  const [favoritesOnly, setFavoritesOnly] = React.useState(false)
  const [contactSubject, setContactSubject] = React.useState('')
  const [toast, setToast] = React.useState<string | null>(null)
  const toastTimer = React.useRef<number | null>(null)

  // Never invent catalog data. Only fall back to the known seed collection when
  // the API is unreachable, and say so visibly.
  const usingFallback = Boolean(catalogError)
  const products: Product[] = usingFallback ? PRODUCTS : liveProducts
  const detailProduct = selectedProduct ?? products[0] ?? PRODUCTS[0]
  const activeView: NavView = view === 'product-detail' ? 'collection' : view
  const activeCategory = view === 'collection' ? collectionCategory : ''
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const pageKey =
    view === 'product-detail'
      ? `product-${detailProduct.id}`
      : `${view}-${collectionCategory}-${collectionSearch}-${favoritesOnly ? 'favorites' : 'all'}`

  React.useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ favoriteIds, cartItems, recentlyViewedIds }),
    )
  }, [favoriteIds, cartItems, recentlyViewedIds])

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [view, selectedProduct?.id, collectionCategory, collectionSearch, favoritesOnly])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCartOpen(false)
        setIsMobileMenuOpen(false)
        setQuickViewProduct(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  React.useEffect(() => {
    const shouldLock = isCartOpen || isMobileMenuOpen || Boolean(quickViewProduct)
    document.body.style.overflow = shouldLock ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isCartOpen, isMobileMenuOpen, quickViewProduct])

  React.useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
  }, [])

  const showToast = (message: string) => {
    setToast(message)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3400)
  }

  const openCollection = (category = '', search = '', showFavorites = false) => {
    setCollectionCategory(category)
    setCollectionSearch(search)
    setFavoritesOnly(showFavorites)
    setSelectedProduct(null)
    setQuickViewProduct(null)
    setIsMobileMenuOpen(false)
    setView('collection')
  }

  const navigate = (next: NavView, category?: string) => {
    if (next === 'collection') {
      openCollection(category ?? '', '', false)
      return
    }
    setSelectedProduct(null)
    setQuickViewProduct(null)
    setIsMobileMenuOpen(false)
    setView(next)
  }

  const openContact = (subject = '') => {
    setContactSubject(subject)
    setSelectedProduct(null)
    setQuickViewProduct(null)
    setIsMobileMenuOpen(false)
    setView('contact')
  }

  const handleNavigate = (next: NavView, category?: string) => {
    if (next === 'contact') {
      openContact()
      return
    }
    navigate(next, category)
  }

  const openProduct = (product: Product) => {
    setQuickViewProduct(null)
    setIsMobileMenuOpen(false)
    setSelectedProduct(product)
    setRecentlyViewedIds((previous) =>
      [product.id, ...previous.filter((id) => id !== product.id)].slice(0, 8),
    )
    setView('product-detail')
  }

  const openQuickView = (product: Product) => setQuickViewProduct(product)

  const toggleFavorite = (id: string) => {
    setFavoriteIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    )
  }

  const addToCart = (product: Product, size: string, color: string, quantity: number) => {
    setCartItems((previous) => {
      const existingIndex = previous.findIndex(
        (item) => item.productId === product.id && item.size === size && item.color === color,
      )
      if (existingIndex === -1) {
        return [...previous, { productId: product.id, size, color, quantity }]
      }
      return previous.map((item, index) =>
        index === existingIndex
          ? { ...item, quantity: Math.min(10, item.quantity + quantity) }
          : item,
      )
    })
    showToast(`${product.name} · ${size} added to your little bag`)
    setIsCartOpen(true)
  }

  const addAllToCart = (items: Product[]) => {
    if (items.length === 0) return
    setCartItems((previous) => {
      const next = [...previous]
      items.forEach((product) => {
        const size = product.sizes[0] ?? 'One size'
        const color = product.colors[0] ?? ''
        const existingIndex = next.findIndex(
          (item) => item.productId === product.id && item.size === size && item.color === color,
        )
        if (existingIndex === -1) {
          next.push({ productId: product.id, size, color, quantity: 1 })
        } else {
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: Math.min(10, next[existingIndex].quantity + 1),
          }
        }
      })
      return next
    })
    showToast(`${items.length} ${items.length === 1 ? 'friend' : 'friends'} added to your little bag`)
    setIsCartOpen(true)
  }

  const updateCartQuantity = (index: number, delta: number) => {
    setCartItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, quantity: Math.max(1, Math.min(10, item.quantity + delta)) }
          : item,
      ),
    )
  }

  const removeFromCart = (index: number) => {
    setCartItems((previous) => previous.filter((_, itemIndex) => itemIndex !== index))
  }

  const cartLines: CartLine[] = cartItems.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId)
    return product
      ? [{ product, size: item.size, color: item.color, quantity: item.quantity }]
      : []
  })

  const cartProductIds = new Set(cartItems.map((item) => item.productId))
  const recommendations = products.filter((product) => !cartProductIds.has(product.id)).slice(0, 4)

  const recentlyViewedProducts = recentlyViewedIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product))
    .filter((product) => product.id !== selectedProduct?.id)

  const sameCategory = products.filter(
    (product) => product.id !== detailProduct.id && product.categoryKey === detailProduct.categoryKey,
  )
  const relatedProducts = (sameCategory.length > 0
    ? sameCategory
    : products.filter((product) => product.id !== detailProduct.id)
  ).slice(0, 3)

  const quickViewRelated = quickViewProduct
    ? products
        .filter((product) => product.id !== quickViewProduct.id && product.categoryKey === quickViewProduct.categoryKey)
        .slice(0, 3)
    : []

  const handleCheckout = () => {
    setIsCartOpen(false)
    const label = `${cartLines.length} ${cartLines.length === 1 ? 'little friend' : 'little friends'}`
    openContact(`Order inquiry — ${label} from my little bag`)
  }

  const renderView = () => {
    switch (view) {
      case 'home':
        return (
          <HomePage
            products={products}
            favoriteIds={favoriteIds}
            content={catalog?.content}
            onToggleFavorite={toggleFavorite}
            onViewProduct={openProduct}
            onExploreCollection={(category = '', search = '') => openCollection(category, search, false)}
            onDiscoverStory={() => navigate('about')}
            onQuickView={openQuickView}
            onAddToCart={addToCart}
            onOpenGiftStudio={() => navigate('gift-studio')}
            onOpenFriendFinder={() => navigate('friend-finder')}
          />
        )
      case 'collection':
        return (
          <ProductGallery
            key={`${collectionCategory}-${collectionSearch}-${favoritesOnly ? 'favorites' : 'all'}`}
            products={products}
            initialCategory={collectionCategory}
            initialSearch={collectionSearch}
            favoritesOnly={favoritesOnly}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            onClearFavoritesOnly={() => openCollection('', '', false)}
            onProductSelect={openProduct}
            onQuickView={openQuickView}
            onAddToCart={addToCart}
            recentlyViewed={recentlyViewedProducts}
          />
        )
      case 'wishlist':
        return (
          <ProductGallery
            key={`wishlist-${favoriteIds.join('-')}`}
            products={products}
            favoritesOnly
            favoriteIds={favoriteIds}
            mode="wishlist"
            onToggleFavorite={toggleFavorite}
            onClearFavoritesOnly={() => navigate('collection')}
            onProductSelect={openProduct}
            onQuickView={openQuickView}
            onAddToCart={addToCart}
            onAddAllToCart={addAllToCart}
            recentlyViewed={recentlyViewedProducts}
          />
        )
      case 'product-detail':
        return (
          <ProductDetailPage
            key={detailProduct.id}
            product={detailProduct}
            onBack={() => openCollection()}
            onAddToCart={addToCart}
            onToggleFavorite={toggleFavorite}
            isFavorite={favoriteIds.includes(detailProduct.id)}
            relatedProducts={relatedProducts}
            recentlyViewed={recentlyViewedProducts}
            onSelectRelated={openProduct}
            onContact={() => openContact(`Question about ${detailProduct.name}`)}
          />
        )
      case 'gift-studio':
        return (
          <GiftStudioPage
            products={products}
            onProductSelect={openProduct}
            onExploreCollection={(category, search) => openCollection(category ?? '', search ?? '')}
          />
        )
      case 'friend-finder':
        return (
          <FriendFinderPage
            products={products}
            onProductSelect={openProduct}
            onExploreCollection={(category, search) => openCollection(category ?? '', search ?? '')}
            onAddToCart={addToCart}
          />
        )
      case 'admin':
        return <AdminDashboard />
      case 'about':
        return <AboutPage onExplore={() => openCollection()} onContact={() => openContact()} />
      case 'gallery':
        return <GalleryPage products={products} />
      case 'contact':
        return (
          <ContactPage
            key={contactSubject || 'contact'}
            initialSubject={contactSubject}
            content={catalog?.content}
            settings={catalog?.settings}
          />
        )
      case 'cart':
        return (
          <CartPage
            items={cartLines}
            recommendations={recommendations}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            onQuantityChange={updateCartQuantity}
            onRemove={removeFromCart}
            onCheckout={handleCheckout}
            onExplore={() => openCollection()}
            onProductSelect={openProduct}
          />
        )
      default:
        return null
    }
  }

  if (catalogLoading && !catalogError) {
    return (
      <MotionConfig reducedMotion="user">
        <BoutiqueLoader />
      </MotionConfig>
    )
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col bg-ivory">
        {usingFallback && (
          <div
            role="status"
            className="bg-red px-5 py-2.5 text-center text-xs font-medium text-white"
          >
            {isStaticSite
              ? staticCatalogNotice
              : 'The boutique server is temporarily offline — showing our full collection locally. Messages and admin will be available when it reconnects.'}
          </div>
        )}

        <Navbar
          activeView={activeView}
          activeCategory={activeCategory}
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={() => setIsMobileMenuOpen((open) => !open)}
          favoriteCount={favoriteIds.length}
          cartCount={cartCount}
          products={products}
          onNavigate={handleNavigate}
          onOpenCart={() => setIsCartOpen(true)}
          onProductSelect={openProduct}
          onSearch={(query) => openCollection('', query, false)}
          isMobileTabBarHidden={
            isCartOpen || isMobileMenuOpen || view === 'product-detail' || view === 'admin' || Boolean(quickViewProduct)
          }
          topOffset={usingFallback ? 36 : 0}
        />

        <main className="flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pageKey}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <React.Suspense fallback={<ViewLoader />}>{renderView()}</React.Suspense>
            </motion.div>
          </AnimatePresence>
        </main>

        {view !== 'admin' && <Footer onNavigate={handleNavigate} content={catalog?.content} settings={catalog?.settings} />}

        <CartDrawer
          open={isCartOpen}
          items={cartLines}
          onClose={() => setIsCartOpen(false)}
          onQuantityChange={updateCartQuantity}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
          onExplore={() => {
            setIsCartOpen(false)
            openCollection()
          }}
          onViewCart={() => {
            setIsCartOpen(false)
            setSelectedProduct(null)
            setView('cart')
          }}
        />

        <React.Suspense fallback={null}>
          <AnimatePresence>
            {quickViewProduct && (
              <QuickViewModal
                key={quickViewProduct.id}
                product={quickViewProduct}
                isFavorite={favoriteIds.includes(quickViewProduct.id)}
                relatedProducts={quickViewRelated}
                onClose={() => setQuickViewProduct(null)}
                onToggleFavorite={toggleFavorite}
                onAddToCart={(product, size, color, quantity) => {
                  addToCart(product, size, color, quantity)
                  setQuickViewProduct(null)
                }}
                onViewDetails={openProduct}
              />
            )}
          </AnimatePresence>
        </React.Suspense>

        <AssistanceButton
          hidden={isCartOpen || isMobileMenuOpen || view === 'product-detail' || view === 'admin' || Boolean(quickViewProduct)}
          onClick={() => openContact('Boutique assistance request')}
        />
        <Toast
          message={toast}
          position={isCartOpen || isMobileMenuOpen || Boolean(quickViewProduct) ? 'top' : 'bottom'}
        />
      </div>
    </MotionConfig>
  )
}

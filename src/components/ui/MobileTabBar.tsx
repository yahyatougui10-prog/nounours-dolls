import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, House, Search, ShoppingBag, Users } from 'lucide-react'
import type { NavView } from './Navbar'

export interface MobileTabBarProps {
  activeView: NavView
  hidden?: boolean
  favoriteCount: number
  cartCount: number
  onNavigate: (view: NavView) => void
  onOpenSearch: () => void
}

interface Tab {
  key: string
  label: string
  view: NavView
  icon: React.ReactNode
}

const tabs: Tab[] = [
  { key: 'home', label: 'Home', view: 'home', icon: <House className="h-5 w-5" aria-hidden="true" /> },
  { key: 'search', label: 'Search', view: 'home', icon: <Search className="h-5 w-5" aria-hidden="true" /> },
  {
    key: 'saved',
    label: 'Saved',
    view: 'wishlist',
    icon: <Heart className="h-5 w-5" aria-hidden="true" />,
  },
  {
    key: 'bag',
    label: 'Bag',
    view: 'cart',
    icon: <ShoppingBag className="h-5 w-5" aria-hidden="true" />,
  },
  {
    key: 'finder',
    label: 'Finder',
    view: 'friend-finder',
    icon: <Users className="h-5 w-5" aria-hidden="true" />,
  },
]

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeView,
  hidden = false,
  favoriteCount,
  cartCount,
  onNavigate,
  onOpenSearch,
}) => (
  <AnimatePresence>
    {!hidden && (
      <motion.nav
        key="noosh-mobile-tab-bar"
        aria-label="Quick navigation"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-marron/10 bg-cream/95 shadow-[0_-12px_40px_-24px_rgba(121,85,72,0.45)] backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 items-stretch px-2 pt-1.5">
          {tabs.map((tab) => {
            const isActive = tab.key !== 'search' && activeView === tab.view
            const count = tab.key === 'saved' ? favoriteCount : tab.key === 'bag' ? cartCount : 0

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => (tab.key === 'search' ? onOpenSearch() : onNavigate(tab.view))}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex min-h-[54px] min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-cyan-deep' : 'text-marron/70 hover:text-marron'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="noosh-mobile-tab-indicator"
                    className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-cyan"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">
                  {tab.icon}
                  {count > 0 && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-1 text-[9px] font-bold leading-none text-white"
                    >
                      {count}
                    </motion.span>
                  )}
                </span>
                <span className="max-w-full truncate leading-none">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </motion.nav>
    )}
  </AnimatePresence>
)

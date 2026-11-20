import React from 'react'
import {
  FileText,
  Layers3,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Package,
  Settings as SettingsIcon,
  ShieldCheck,
  X,
} from 'lucide-react'
import { api } from '../../lib/api'
import type {
  Catalog,
  Message,
  Overview,
  Session,
} from '../../types/catalog'
import { ContentPanel } from './ContentPanel'
import { CollectionsPanel } from './CollectionsPanel'
import { LoginScreen } from './LoginScreen'
import { MessagesPanel } from './MessagesPanel'
import { OverviewPanel } from './OverviewPanel'
import { ProductsPanel } from './ProductsPanel'
import { SettingsPanel } from './SettingsPanel'
import { ErrorBanner, Skeleton, Toast } from './admin-ui'
import { errorMessage, type Mutate } from './admin-shared'

type Section = 'overview' | 'products' | 'collections' | 'content' | 'messages' | 'settings'

interface NavItem {
  id: Section
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'collections', label: 'Collections', icon: Layers3 },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

export const AdminDashboard: React.FC = () => {
  const [session, setSession] = React.useState<Session | null>(null)
  const [checkingSession, setCheckingSession] = React.useState(true)
  const [catalog, setCatalog] = React.useState<Catalog | null>(null)
  const [overview, setOverview] = React.useState<Overview | null>(null)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [loadingData, setLoadingData] = React.useState(false)
  const [catalogError, setCatalogError] = React.useState<string | null>(null)
  const [overviewError, setOverviewError] = React.useState<string | null>(null)
  const [section, setSection] = React.useState<Section>('overview')
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [toast, setToast] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    api
      .getSession()
      .then((next) => {
        if (active) setSession(next)
      })
      .catch(() => {
        if (active) setSession({ authenticated: false })
      })
      .finally(() => {
        if (active) setCheckingSession(false)
      })
    return () => {
      active = false
    }
  }, [])

  const loadData = React.useCallback(async () => {
    setLoadingData(true)
    const [catalogResult, overviewResult, messagesResult] = await Promise.allSettled([
      api.getCatalog(),
      api.getOverview(),
      api.getMessages(),
    ])

    if (catalogResult.status === 'fulfilled') {
      setCatalog(catalogResult.value)
      setCatalogError(null)
    } else {
      setCatalogError(errorMessage(catalogResult.reason))
    }
    if (overviewResult.status === 'fulfilled') {
      setOverview(overviewResult.value)
      setOverviewError(null)
    } else {
      setOverviewError(errorMessage(overviewResult.reason))
    }
    if (messagesResult.status === 'fulfilled') {
      setMessages(messagesResult.value)
    } else {
      setCatalogError((previous) => previous ?? errorMessage(messagesResult.reason))
    }
    setLoadingData(false)
  }, [])

  React.useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- async loads intentionally update state
    if (session?.authenticated) void loadData()
  }, [session?.authenticated, loadData])

  React.useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const mutate: Mutate = React.useCallback(
    async (task, success) => {
      setBusy(true)
      setCatalogError(null)
      try {
        await task()
        await loadData()
        if (success) setToast(success)
        return true
      } catch (caught) {
        setCatalogError(errorMessage(caught))
        return false
      } finally {
        setBusy(false)
      }
    },
    [loadData],
  )

  const handleLogout = async () => {
    setBusy(true)
    try {
      await api.logout()
    } catch {
      // Clear local state even if the session already expired on the server.
    } finally {
      setSession({ authenticated: false })
      setCatalog(null)
      setOverview(null)
      setMessages([])
      setBusy(false)
    }
  }

  const selectSection = (next: Section) => {
    setSection(next)
    setMobileNavOpen(false)
  }

  const renderNav = (onSelect: (next: Section) => void) => (
    <nav aria-label="Admin sections" className="space-y-1.5">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const active = section === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={active ? 'page' : undefined}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              active ? 'bg-marron text-cream shadow-soft' : 'text-marron/80 hover:bg-cyan/10 hover:text-marron'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
            {item.id === 'messages' && overview && overview.messagesNew > 0 && (
              <span className="ml-auto rounded-full bg-red px-2 py-0.5 text-[10px] font-bold text-cream">
                {overview.messagesNew}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper-texture">
        <div className="flex items-center gap-3 text-sm text-muted" role="status">
          <Loader2 className="h-5 w-5 animate-spin text-cyan" aria-hidden="true" />
          Checking your session…
        </div>
      </div>
    )
  }

  if (!session?.authenticated) {
    return <LoginScreen onAuthenticated={(email) => setSession({ authenticated: true, email })} />
  }

  return (
    <div className="min-h-screen bg-paper-texture">
      <div className="mx-auto flex max-w-[1700px]">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-marron/10 bg-cream/80 px-5 py-7 lg:flex">
          <div className="px-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan">The Little World</p>
            <h1 className="mt-2 font-display text-2xl font-medium tracking-editorial text-marron">
              {catalog?.settings.brandName ?? 'Nounours & Dolls'}
            </h1>
            <p className="mt-1 text-xs text-muted">Boutique admin</p>
          </div>
          <div className="mt-10 flex-1">{renderNav(selectSection)}</div>
          <div className="border-t border-marron/10 pt-5">
            <p className="truncate px-2 text-xs text-muted" title={session.email}>
              Signed in as {session.email ?? 'admin'}
            </p>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={busy}
              className="mt-3 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red transition hover:bg-red/10 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
          <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open admin navigation"
              className="flex items-center gap-2 rounded-full border border-marron/15 bg-cream px-4 py-2 text-sm font-semibold text-marron"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
              Menu
            </button>
            <span className="font-display text-lg text-marron">Boutique admin</span>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={busy}
              aria-label="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-red/20 text-red"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mb-8 hidden items-center justify-between gap-4 lg:flex">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan">Admin console</p>
              <h2 className="mt-2 font-display text-3xl font-medium tracking-editorial text-marron sm:text-4xl">
                {NAV_ITEMS.find((item) => item.id === section)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-cyan/30 bg-cream px-4 py-2 text-xs font-semibold text-marron">
              <ShieldCheck className="h-4 w-4 text-cyan" aria-hidden="true" />
              Server session active
            </div>
          </div>

          <ErrorBanner message={catalogError} />

          {loadingData && !catalog && section !== 'overview' ? (
            <div className="space-y-5">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-72" />
              <Skeleton className="h-72" />
            </div>
          ) : (
            <>
              {section === 'overview' && (
                <OverviewPanel
                  overview={overview}
                  loading={loadingData}
                  error={overviewError}
                  onRetry={() => void loadData()}
                />
              )}
              {section === 'products' && catalog && (
                <ProductsPanel
                  products={catalog.products}
                  collections={catalog.collections}
                  busy={busy}
                  onMutate={mutate}
                />
              )}
              {section === 'collections' && catalog && (
                <CollectionsPanel collections={catalog.collections} busy={busy} onMutate={mutate} />
              )}
              {section === 'content' && catalog && (
                <ContentPanel content={catalog.content} busy={busy} onMutate={mutate} />
              )}
              {section === 'messages' && (
                <MessagesPanel messages={messages} busy={busy} onMutate={mutate} />
              )}
              {section === 'settings' && catalog && (
                <SettingsPanel
                  settings={catalog.settings}
                  address={catalog.content.address}
                  busy={busy}
                  onMutate={mutate}
                />
              )}
              {!catalog && section !== 'overview' && section !== 'messages' && (
                <p className="text-sm text-muted">Reload the page once the API is reachable.</p>
              )}
            </>
          )}
        </div>
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="presentation">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-ink/50"
          />
          <div className="relative flex h-full w-72 max-w-[85%] flex-col bg-cream p-6 shadow-lift">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan">Admin</p>
                <p className="mt-1 font-display text-xl text-marron">Navigate</p>
              </div>
              <button type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close menu" className="text-muted hover:text-marron">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {renderNav(selectSection)}
            <p className="mt-auto truncate text-xs text-muted">Signed in as {session.email ?? 'admin'}</p>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}

export default AdminDashboard

import React from 'react'
import { api } from '../lib/api'
import { isStaticSite, staticCatalogNotice } from '../lib/environment'
import type { Catalog, CatalogProduct } from '../types/catalog'

export interface UseCatalogResult {
  catalog: Catalog | null
  products: CatalogProduct[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const messageFrom = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unable to load the catalog.'

/** Loads the live catalog. Errors are exposed, never replaced with fake data. */
export function useCatalog(): UseCatalogResult {
  const [catalog, setCatalog] = React.useState<Catalog | null>(null)
  const [loading, setLoading] = React.useState(!isStaticSite)
  const [error, setError] = React.useState<string | null>(isStaticSite ? staticCatalogNotice : null)

  const refresh = React.useCallback(async () => {
    if (isStaticSite) {
      setCatalog(null)
      setError(staticCatalogNotice)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const next = await api.getCatalog()
      setCatalog(next)
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load the catalog.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (isStaticSite) return
    let active = true
    api
      .getCatalog()
      .then((next) => {
        if (!active) return
        setCatalog(next)
        setError(null)
      })
      .catch((caught: unknown) => {
        if (!active) return
        setError(messageFrom(caught))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const products = React.useMemo(() => catalog?.products ?? [], [catalog])

  return { catalog, products, loading, error, refresh }
}

export default useCatalog

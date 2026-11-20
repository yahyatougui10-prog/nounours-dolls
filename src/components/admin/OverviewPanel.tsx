import React from 'react'
import { Boxes, Box, Layers3, Mail, Package, RefreshCw, TrendingUp, Unplug } from 'lucide-react'
import type { Overview } from '../../types/catalog'
import { Card, EmptyState, ErrorBanner, SectionTitle, Skeleton } from './admin-ui'

interface OverviewPanelProps {
  overview: Overview | null
  loading: boolean
  error: string | null
  onRetry: () => void
}

const formatAt = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const StatCard: React.FC<{
  label: string
  value: string | number
  note: string
  icon: React.ComponentType<{ className?: string }>
  tone?: 'marron' | 'cyan' | 'red'
}> = ({ label, value, note, icon: Icon, tone = 'marron' }) => (
  <div className="rounded-3xl border border-marron/10 bg-cream p-5 shadow-soft">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">{label}</p>
        <p className="mt-3 font-display text-3xl font-medium text-marron">{value}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted">{note}</p>
      </div>
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
          tone === 'cyan' ? 'bg-cyan/15 text-cyan' : tone === 'red' ? 'bg-red/10 text-red' : 'bg-marron/10 text-marron'
        }`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
    </div>
  </div>
)

export const OverviewPanel: React.FC<OverviewPanelProps> = ({ overview, loading, error, onRetry }) => (
  <div>
    <SectionTitle
      eyebrow="Live overview"
      title="The boutique at a glance"
      description="Every number below is derived from data stored on this server. Nothing is estimated or simulated."
      actions={
        <button type="button" onClick={onRetry} className="inline-flex items-center gap-2 rounded-full border border-marron/15 bg-cream px-4 py-2 text-xs font-semibold text-marron transition hover:border-cyan/50">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Refresh
        </button>
      }
    />
    <ErrorBanner message={error} />

    {loading && !overview ? (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-36" />
        ))}
      </div>
    ) : overview ? (
      <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Products" value={overview.products} note="Catalog items currently saved" icon={Package} />
          <StatCard label="Categories" value={overview.categories} note="Distinct product category keys" icon={Layers3} tone="cyan" />
          <StatCard label="Collections" value={overview.collections} note="Curated collections on disk" icon={Boxes} />
          <StatCard label="New messages" value={overview.messagesNew} note={`${overview.messagesTotal} messages total`} icon={Mail} tone="red" />
          <StatCard label="Stock tracked" value={overview.trackedStockProducts} note="Products with an explicit stock value" icon={Box} tone="cyan" />
          <StatCard label="Units in stock" value={overview.totalTrackedStock} note="Sum of explicitly tracked stock" icon={TrendingUp} />
          <div className="rounded-3xl border border-dashed border-marron/20 bg-cream/60 p-5 shadow-soft sm:col-span-2">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sand text-muted">
                <Unplug className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Orders</p>
                <p className="mt-3 font-display text-xl font-medium text-marron">Orders — not connected</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Checkout, payments and order records are not part of this build. No sales figures
                  are reported.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="mt-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl text-marron">Recent activity</h3>
              <p className="mt-1 text-xs text-muted">The last eight real changes recorded by this server.</p>
            </div>
          </div>
          {overview.activity.length === 0 ? (
            <EmptyState title="No activity yet" message="Changes you make in the admin area will appear here with a timestamp." />
          ) : (
            <ul className="divide-y divide-marron/10">
              {overview.activity.map((entry) => (
                <li key={entry.id} className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  <span className="text-sm text-ink">{entry.summary}</span>
                  <time dateTime={entry.at} className="shrink-0 text-xs text-muted">
                    {formatAt(entry.at)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </>
    ) : (
      <ErrorBanner message="No overview data is available yet." />
    )}
  </div>
)

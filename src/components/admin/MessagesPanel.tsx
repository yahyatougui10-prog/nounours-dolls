import React from 'react'
import { Archive, Check, Mail, Trash2 } from 'lucide-react'
import { api } from '../../lib/api'
import type { Message, MessageStatus } from '../../types/catalog'
import {
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  SectionTitle,
  SelectField,
} from './admin-ui'
import type { Mutate } from './admin-shared'

interface MessagesPanelProps {
  messages: Message[]
  busy: boolean
  onMutate: Mutate
}

type Filter = 'all' | MessageStatus

const statusClasses: Record<MessageStatus, string> = {
  new: 'bg-red/10 text-red',
  read: 'bg-cyan/15 text-marron',
  archived: 'bg-sand text-muted',
}

const formatDate = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export const MessagesPanel: React.FC<MessagesPanelProps> = ({ messages, busy, onMutate }) => {
  const [filter, setFilter] = React.useState<Filter>('all')
  const [error, setError] = React.useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = React.useState<Message | null>(null)

  const visible = React.useMemo(
    () => (filter === 'all' ? messages : messages.filter((message) => message.status === filter)),
    [messages, filter],
  )

  const changeStatus = async (message: Message, status: MessageStatus) => {
    setError(null)
    await onMutate(() => api.updateMessage(message.id, status), `Message marked ${status}`)
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    const done = await onMutate(() => api.deleteMessage(pendingDelete.id), 'Message deleted')
    if (done) setPendingDelete(null)
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Inbox"
        title="Messages"
        description="Real messages submitted through the contact form and saved on this server."
      />
      <ErrorBanner message={error} />

      <div className="mb-6 max-w-xs">
        <SelectField
          id="message-filter"
          label="Filter by status"
          value={filter}
          onChange={(value) => setFilter(value as Filter)}
          options={[
            { value: 'all', label: `All (${messages.length})` },
            { value: 'new', label: `New (${messages.filter((message) => message.status === 'new').length})` },
            { value: 'read', label: 'Read' },
            { value: 'archived', label: 'Archived' },
          ]}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          message={filter === 'all' ? 'Contact form submissions will appear here.' : 'No messages with this status.'}
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((message) => (
            <Card key={message.id} className="flex h-full flex-col">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl text-marron">{message.subject}</p>
                  <p className="mt-1 text-xs text-muted">
                    {message.name} · <a href={`mailto:${message.email}`} className="text-cyan underline decoration-cyan/40 underline-offset-4 hover:text-marron">{message.email}</a>
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${statusClasses[message.status]}`}>
                  {message.status}
                </span>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{message.message}</p>
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
                <time dateTime={message.createdAt} className="mr-auto text-xs text-muted">
                  {formatDate(message.createdAt)}
                </time>
                {message.status !== 'read' && (
                  <button type="button" disabled={busy} onClick={() => void changeStatus(message, 'read')} className="inline-flex items-center gap-1 rounded-full border border-marron/15 px-3 py-1.5 text-xs font-semibold text-marron transition hover:border-cyan/50 disabled:opacity-50">
                    <Check className="h-3 w-3" aria-hidden="true" />
                    Mark read
                  </button>
                )}
                {message.status !== 'archived' && (
                  <button type="button" disabled={busy} onClick={() => void changeStatus(message, 'archived')} className="inline-flex items-center gap-1 rounded-full border border-marron/15 px-3 py-1.5 text-xs font-semibold text-marron transition hover:border-cyan/50 disabled:opacity-50">
                    <Archive className="h-3 w-3" aria-hidden="true" />
                    Archive
                  </button>
                )}
                <a href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`} className="inline-flex items-center gap-1 rounded-full border border-cyan/40 px-3 py-1.5 text-xs font-semibold text-marron transition hover:bg-cyan/10">
                  <Mail className="h-3 w-3" aria-hidden="true" />
                  Reply
                </a>
                <button type="button" onClick={() => setPendingDelete(message)} className="inline-flex items-center gap-1 rounded-full border border-red/20 px-3 py-1.5 text-xs font-semibold text-red transition hover:bg-red/10">
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this message?"
        message={`This permanently removes the message from ${pendingDelete?.name ?? 'this sender'} from the store on disk.`}
        busy={busy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}

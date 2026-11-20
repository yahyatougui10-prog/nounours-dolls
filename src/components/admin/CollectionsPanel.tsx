import React from 'react'
import { Layers3, Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../../lib/api'
import type { Collection } from '../../types/catalog'
import {
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  FormActions,
  ImagePicker,
  SectionTitle,
  TextAreaField,
  TextField,
  ToggleField,
} from './admin-ui'
import type { Mutate } from './admin-shared'

interface CollectionsPanelProps {
  collections: Collection[]
  busy: boolean
  onMutate: Mutate
}

interface CollectionForm {
  title: string
  slug: string
  cover: string
  order: string
  featured: boolean
  description: string
}

const emptyForm = (): CollectionForm => ({
  title: '',
  slug: '',
  cover: '',
  order: '',
  featured: false,
  description: '',
})

const fromCollection = (collection: Collection): CollectionForm => ({
  title: collection.title,
  slug: collection.slug,
  cover: collection.cover,
  order: String(collection.order),
  featured: collection.featured,
  description: collection.description,
})

export const CollectionsPanel: React.FC<CollectionsPanelProps> = ({ collections, busy, onMutate }) => {
  const [form, setForm] = React.useState<CollectionForm>(emptyForm)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = React.useState<Collection | null>(null)

  const set = <K extends keyof CollectionForm>(key: K, value: CollectionForm[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }))

  const resetForm = () => {
    setForm(emptyForm())
    setEditingId(null)
    setError(null)
  }

  const startEdit = (collection: Collection) => {
    setForm(fromCollection(collection))
    setEditingId(collection.id)
    setError(null)
  }

  const submit = async () => {
    setError(null)
    if (!form.title.trim()) {
      setError('A collection title is required.')
      return
    }
    const order = form.order.trim() === '' ? undefined : Number(form.order)
    if (order !== undefined && (!Number.isInteger(order) || order < 0)) {
      setError('Order must be a whole number of zero or more.')
      return
    }
    const slug =
      form.slug.trim() ||
      form.title
        .trim()
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    if (!slug) {
      setError('Enter a valid slug for this collection.')
      return
    }
    const common = {
      title: form.title.trim(),
      slug,
      cover: form.cover.trim(),
      featured: form.featured,
      description: form.description.trim(),
    }
    const saved = editingId
      ? await onMutate(
          () => api.updateCollection(editingId, order === undefined ? common : { ...common, order }),
          'Collection updated',
        )
      : await onMutate(
          () => api.createCollection({ ...common, order: order ?? collections.length + 1 }),
          'Collection created',
        )
    if (saved) resetForm()
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    const done = await onMutate(() => api.deleteCollection(pendingDelete.id), 'Collection deleted')
    if (done) {
      if (editingId === pendingDelete.id) resetForm()
      setPendingDelete(null)
    }
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Merchandising"
        title="Collections"
        description="Curate the collections stored on disk. Slugs are used to link products to a collection."
        actions={
          <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-full border border-marron/15 bg-cream px-4 py-2 text-xs font-semibold text-marron transition hover:border-cyan/50">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New collection
          </button>
        }
      />
      <ErrorBanner message={error} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          {collections.length === 0 ? (
            <EmptyState title="No collections yet" message="Create your first collection to group products." />
          ) : (
            <ul className="space-y-3">
              {[...collections]
                .sort((a, b) => a.order - b.order)
                .map((collection) => (
                  <li key={collection.id} className="flex gap-3 rounded-3xl border border-marron/10 bg-cream/70 p-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-sand">
                      {collection.cover ? (
                        <img src={collection.cover} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Layers3 className="h-6 w-6 text-muted" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-base text-marron">{collection.title}</p>
                      <p className="mt-1 text-xs text-muted">/{collection.slug} · order {collection.order}{collection.featured ? ' · featured' : ''}</p>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        <button type="button" onClick={() => startEdit(collection)} className="inline-flex items-center gap-1 rounded-full border border-marron/15 px-3 py-1 text-xs font-semibold text-marron transition hover:border-cyan/50">
                          <Pencil className="h-3 w-3" aria-hidden="true" />
                          Edit
                        </button>
                        <button type="button" onClick={() => setPendingDelete(collection)} className="inline-flex items-center gap-1 rounded-full border border-red/20 px-3 py-1 text-xs font-semibold text-red transition hover:bg-red/10">
                          <Trash2 className="h-3 w-3" aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="mb-6 font-display text-xl text-marron">
            {editingId ? 'Edit collection' : 'Add a collection'}
          </h3>
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField id="collection-title" label="Title" value={form.title} onChange={(event) => set('title', event.target.value)} placeholder="Teddy Bears" />
              <TextField id="collection-slug" label="Slug" value={form.slug} onChange={(event) => set('slug', event.target.value)} placeholder="teddy (generated from title if blank)" />
            </div>
            <TextField id="collection-order" label="Display order" type="number" min="0" value={form.order} onChange={(event) => set('order', event.target.value)} placeholder="1" />
            <ImagePicker
              id="collection-cover"
              label="Cover image"
              value={form.cover}
              onChange={(value) => set('cover', value)}
              onError={setError}
              disabled={busy}
            />
            <TextAreaField id="collection-description" label="Description" value={form.description} onChange={(event) => set('description', event.target.value)} />
            <ToggleField id="collection-featured" label="Featured collection" checked={form.featured} onChange={(checked) => set('featured', checked)} />
            <FormActions
              onSubmit={() => void submit()}
              submitLabel={editingId ? 'Save changes' : 'Create collection'}
              busy={busy}
              onCancel={editingId ? resetForm : undefined}
            />
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.title ?? 'collection'}?`}
        message="The collection will be removed from the store on disk. Products are not deleted."
        busy={busy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}

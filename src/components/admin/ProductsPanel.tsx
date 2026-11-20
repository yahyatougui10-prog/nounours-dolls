import React from 'react'
import { ImagePlus, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { api } from '../../lib/api'
import { imageSource } from '../../lib/assets'
import { prefersReducedMotion } from '../../lib/scroll'
import type { CatalogProduct, Collection } from '../../types/catalog'
import {
  ArrayField,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  Field,
  FormActions,
  ImagePicker,
  SectionTitle,
  SelectField,
  TextAreaField,
  TextField,
  ToggleField,
} from './admin-ui'
import { errorMessage, ghostClass, inputClass, readFileAsDataUrl, type Mutate } from './admin-shared'

interface ProductsPanelProps {
  products: CatalogProduct[]
  collections: Collection[]
  busy: boolean
  onMutate: Mutate
}

type CategoryKey = CatalogProduct['categoryKey']

interface ProductForm {
  name: string
  category: string
  categoryKey: CategoryKey
  price: string
  image: string
  gallery: string[]
  description: string
  sizes: string[]
  dimensions: string[]
  materials: string[]
  colors: string[]
  story: string
  tag: string
  featured: boolean
  stock: string
  personality: string
  shortStory: string
  favoriteThings: string[]
  collection: string
}

const emptyForm = (): ProductForm => ({
  name: '',
  category: '',
  categoryKey: 'teddy',
  price: '',
  image: '',
  gallery: [],
  description: '',
  sizes: [],
  dimensions: [],
  materials: [],
  colors: [],
  story: '',
  tag: '',
  featured: false,
  stock: '',
  personality: '',
  shortStory: '',
  favoriteThings: [],
  collection: '',
})

const fromProduct = (product: CatalogProduct): ProductForm => ({
  name: product.name,
  category: product.category,
  categoryKey: product.categoryKey,
  price: String(product.price),
  image: product.image,
  gallery: [...product.gallery],
  description: product.description,
  sizes: [...product.sizes],
  dimensions: [...product.dimensions],
  materials: [...product.materials],
  colors: [...product.colors],
  story: product.story ?? '',
  tag: product.tag ?? '',
  featured: product.featured ?? false,
  stock: typeof product.stock === 'number' ? String(product.stock) : '',
  personality: product.personality ?? '',
  shortStory: product.shortStory ?? '',
  favoriteThings: [...(product.favoriteThings ?? [])],
  collection: product.collection ?? '',
})

export const ProductsPanel: React.FC<ProductsPanelProps> = ({ products, collections, busy, onMutate }) => {
  const [search, setSearch] = React.useState('')
  const [form, setForm] = React.useState<ProductForm>(emptyForm)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [localBusy, setLocalBusy] = React.useState(false)
  const [pendingDelete, setPendingDelete] = React.useState<CatalogProduct | null>(null)
  const galleryRef = React.useRef<HTMLInputElement>(null)

  const set = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }))

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return products
    return products.filter((product) =>
      [product.name, product.category, product.tag ?? '', product.collection ?? '']
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [products, search])

  const resetForm = () => {
    setForm(emptyForm())
    setEditingId(null)
    setError(null)
  }

  const startEdit = (product: CatalogProduct) => {
    setForm(fromProduct(product))
    setEditingId(product.id)
    setError(null)
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  const handleGalleryFile = async (file: File | undefined) => {
    if (!file) return
    setLocalBusy(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      const result = await api.uploadImage(file.name, dataUrl)
      set('gallery', [...form.gallery, result.url])
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setLocalBusy(false)
      if (galleryRef.current) galleryRef.current.value = ''
    }
  }

  const submit = async () => {
    setError(null)
    const price = Number(form.price)
    if (!form.name.trim()) {
      setError('A product name is required.')
      return
    }
    if (!form.image.trim()) {
      setError('An image path or upload is required.')
      return
    }
    if (!Number.isFinite(price) || price < 0) {
      setError('Enter a valid price.')
      return
    }
    const stock = form.stock.trim() === '' ? undefined : Number(form.stock)
    if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
      setError('Stock must be a whole number of zero or more.')
      return
    }

    const base = {
      name: form.name.trim(),
      category: form.category.trim() || 'Uncategorised',
      categoryKey: form.categoryKey,
      price,
      image: form.image.trim(),
      gallery: form.gallery.length ? form.gallery : [form.image.trim()],
      description: form.description.trim(),
      sizes: form.sizes,
      dimensions: form.dimensions,
      materials: form.materials,
      colors: form.colors,
      featured: form.featured,
    }
    const optional: Partial<CatalogProduct> = {}
    const assignText = (key: 'story' | 'tag' | 'personality' | 'shortStory' | 'collection', value: string) => {
      if (value.trim() || editingId) optional[key] = value.trim()
    }
    assignText('story', form.story)
    assignText('tag', form.tag)
    assignText('personality', form.personality)
    assignText('shortStory', form.shortStory)
    assignText('collection', form.collection)
    if (form.favoriteThings.length || editingId) optional.favoriteThings = form.favoriteThings
    if (stock !== undefined) optional.stock = stock
    else if (editingId) delete optional.stock

    const payload = { ...base, ...optional }
    const saved = editingId
      ? await onMutate(() => api.updateProduct(editingId, payload), 'Product updated')
      : await onMutate(() => api.createProduct(payload), 'Product created')
    if (saved) resetForm()
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    const done = await onMutate(() => api.deleteProduct(pendingDelete.id), 'Product deleted')
    if (done) {
      if (editingId === pendingDelete.id) resetForm()
      setPendingDelete(null)
    }
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Catalog"
        title="Products"
        description="Create and edit the real products served by /api/catalog. Uploaded images are stored on this server."
        actions={
          <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-full border border-marron/15 bg-cream px-4 py-2 text-xs font-semibold text-marron transition hover:border-cyan/50">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New product
          </button>
        }
      />
      <ErrorBanner message={error} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          <div className="relative mb-5">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search products"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products…"
              className={`${inputClass} pl-11`}
            />
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="No products found" message="Try a different search, or add a new product." />
          ) : (
            <ul className="max-h-[720px] space-y-3 overflow-y-auto pr-1">
              {filtered.map((product) => (
                <li
                  key={product.id}
                  className={`flex gap-3 rounded-3xl border p-3 transition ${
                    editingId === product.id
                      ? 'border-cyan/50 bg-cyan/5'
                      : 'border-marron/10 bg-cream/70 hover:border-cyan/30'
                  }`}
                >
                  <img
                    src={imageSource(product.image)}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-2xl bg-sand object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base text-marron">{product.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {product.category} · ${product.price}
                      {typeof product.stock === 'number' ? ` · ${product.stock} in stock` : ''}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <button type="button" onClick={() => startEdit(product)} className="inline-flex items-center gap-1 rounded-full border border-marron/15 px-3 py-1 text-xs font-semibold text-marron transition hover:border-cyan/50">
                        <Pencil className="h-3 w-3" aria-hidden="true" />
                        Edit
                      </button>
                      <button type="button" onClick={() => setPendingDelete(product)} className="inline-flex items-center gap-1 rounded-full border border-red/20 px-3 py-1 text-xs font-semibold text-red transition hover:bg-red/10">
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
            {editingId ? 'Edit product' : 'Add a product'}
          </h3>
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField id="product-name" label="Name" value={form.name} onChange={(event) => set('name', event.target.value)} placeholder="Red teddy bear with a golden crown" />
              <TextField id="product-category" label="Category label" value={form.category} onChange={(event) => set('category', event.target.value)} placeholder="Teddy Bears" />
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <SelectField
                id="product-category-key"
                label="Category"
                value={form.categoryKey}
                onChange={(value) => set('categoryKey', value as CategoryKey)}
                options={[
                  { value: 'teddy', label: 'Teddy bears' },
                  { value: 'doll', label: 'Dolls' },
                  { value: 'gift', label: 'Gifts' },
                ]}
              />
              <TextField id="product-price" label="Price" type="number" min="0" step="0.01" value={form.price} onChange={(event) => set('price', event.target.value)} placeholder="45" />
              <TextField id="product-stock" label="Stock (optional)" type="number" min="0" step="1" value={form.stock} onChange={(event) => set('stock', event.target.value)} placeholder="Leave blank if not tracked" />
            </div>

            <ImagePicker
              id="product-image"
              label="Main image"
              value={form.image}
              onChange={(value) => set('image', value)}
              onError={setError}
              disabled={busy || localBusy}
            />

            <div>
              <Field id="product-gallery" label="Gallery" hint="One image path per line, or upload images to append them.">
                <div className="flex items-center gap-2">
                  <input
                    ref={galleryRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    className="sr-only"
                    aria-label="Upload gallery image"
                    onChange={(event) => void handleGalleryFile(event.target.files?.[0])}
                  />
                  <button type="button" disabled={busy || localBusy} onClick={() => galleryRef.current?.click()} className={ghostClass}>
                    {localBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="h-4 w-4" aria-hidden="true" />}
                    Add gallery image
                  </button>
                </div>
              </Field>
              <div className="mt-3">
                <ArrayField id="product-gallery-list" label="Gallery paths" value={form.gallery} onChange={(value) => set('gallery', value)} />
              </div>
            </div>

            <TextAreaField id="product-description" label="Description" value={form.description} onChange={(event) => set('description', event.target.value)} />
            <TextAreaField id="product-story" label="Story" value={form.story} onChange={(event) => set('story', event.target.value)} />

            <div className="grid gap-5 sm:grid-cols-2">
              <ArrayField id="product-sizes" label="Sizes" value={form.sizes} onChange={(value) => set('sizes', value)} />
              <ArrayField id="product-dimensions" label="Dimensions" value={form.dimensions} onChange={(value) => set('dimensions', value)} />
              <ArrayField id="product-materials" label="Materials" value={form.materials} onChange={(value) => set('materials', value)} />
              <ArrayField id="product-colors" label="Colors" value={form.colors} onChange={(value) => set('colors', value)} />
            </div>

            <TextField id="product-tag" label="Tag" value={form.tag} onChange={(event) => set('tag', event.target.value)} placeholder="New arrival" />
            <ToggleField id="product-featured" label="Featured product" checked={form.featured} onChange={(checked) => set('featured', checked)} hint="Editorial flag for curated merchandising." />

            <div className="rounded-3xl border border-cyan/20 bg-cyan/5 p-4 sm:p-5">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan">Optional editorial fields</p>
              <div className="space-y-5">
                <TextField id="product-personality" label="Personality" value={form.personality} onChange={(event) => set('personality', event.target.value)} placeholder="Only fill this in when it reflects a real product" />
                <TextAreaField id="product-short-story" label="Short story" value={form.shortStory} onChange={(event) => set('shortStory', event.target.value)} rows={3} />
                <ArrayField id="product-favorite-things" label="Favorite things" value={form.favoriteThings} onChange={(value) => set('favoriteThings', value)} />
                <SelectField
                  id="product-collection"
                  label="Collection"
                  value={form.collection}
                  onChange={(value) => set('collection', value)}
                  options={[
                    { value: '', label: 'No collection' },
                    ...collections.map((collection) => ({ value: collection.slug, label: collection.title })),
                  ]}
                />
              </div>
            </div>

            <FormActions
              onSubmit={() => void submit()}
              submitLabel={editingId ? 'Save changes' : 'Create product'}
              busy={busy || localBusy}
              onCancel={editingId ? resetForm : undefined}
            />
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.name ?? 'product'}?`}
        message="This removes the product from the store on disk. This action cannot be undone."
        busy={busy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}

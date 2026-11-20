import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Badge } from '../../design-system/Badge'
import { SectionHeading } from '../../design-system/SectionHeading'
import { type Product } from '../../data/products'
import { imageSource } from '../../lib/assets'

type GalleryCategory = 'all' | 'teddy' | 'doll' | 'gift' | 'details'

interface GalleryItem {
  product: Product
  caption: string
  category: Exclude<GalleryCategory, 'all'>
  ratio: string
}

const editorialSelections: Array<{ id: string; caption: string; category: Exclude<GalleryCategory, 'all'>; ratio: string }> = [
  { id: 'toy-061', caption: 'A familiar friend, ready for the very first hug.', category: 'teddy', ratio: 'aspect-[4/5]' },
  { id: 'toy-001', caption: 'A charming personality in every little detail.', category: 'doll', ratio: 'aspect-square' },
  { id: 'toy-062', caption: 'Beautifully considered, ready to be given.', category: 'gift', ratio: 'aspect-[4/3]' },
  { id: 'toy-002', caption: 'Stitching, colour and the beauty of small things.', category: 'details', ratio: 'aspect-[4/5]' },
  { id: 'toy-063', caption: 'A soft-hearted companion with a story of its own.', category: 'teddy', ratio: 'aspect-square' },
  { id: 'toy-003', caption: 'An heirloom-inspired keepsake piece.', category: 'doll', ratio: 'aspect-[4/5]' },
  { id: 'toy-064', caption: 'Thoughtful little gifts, chosen with care.', category: 'gift', ratio: 'aspect-square' },
  { id: 'toy-004', caption: 'The finishing touches that make each friend unique.', category: 'details', ratio: 'aspect-[4/3]' },
]

const tabs: Array<{ value: GalleryCategory; label: string }> = [
  { value: 'all', label: 'All moments' },
  { value: 'teddy', label: 'Teddy bears' },
  { value: 'doll', label: 'Dolls' },
  { value: 'gift', label: 'Gifts' },
  { value: 'details', label: 'Close-ups' },
]

export interface GalleryPageProps {
  products: Product[]
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ products }) => {
  const [category, setCategory] = React.useState<GalleryCategory>('all')
  const [selected, setSelected] = React.useState<GalleryItem | null>(null)

  const galleryItems = React.useMemo<GalleryItem[]>(
    () =>
      editorialSelections.flatMap((selection) => {
        const product = products.find((item) => item.id === selection.id)
        if (!product) return []
        return [{
          product,
          caption: selection.caption,
          category: selection.category,
          ratio: selection.ratio,
        }]
      }),
    [products],
  )

  const visibleItems = category === 'all'
    ? galleryItems
    : galleryItems.filter((item) => item.category === category)

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  React.useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [selected])

  return (
    <section className="bg-ivory pb-28 pt-28 sm:pt-32" id="gallery">
      <div className="page-container">
        <SectionHeading
          headingLevel="h1"
          eyebrow="Visual gallery"
          title={<>Little details, big feelings.</>}
          description="A closer look at the textures, expressions and finishing touches that make our collection feel so special."
          align="center"
        />

        <div className="no-scrollbar -mx-4 mt-10 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setCategory(tab.value)}
              aria-pressed={category === tab.value}
              className={`relative shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold transition-colors ${
                category === tab.value ? 'text-cream' : 'text-muted hover:text-marron'
              }`}
            >
              {category === tab.value && (
                <motion.span
                  layoutId="gallery-tab"
                  className="absolute inset-0 rounded-full bg-marron shadow-soft ring-1 ring-marron/20"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative">{tab.label}</span>
            </button>
          ))}
        </div>

        <motion.div layout className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
          <AnimatePresence mode="popLayout">
            {visibleItems.map((item) => (
              <motion.button
                key={`${item.product.id}-${item.category}`}
                type="button"
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45 }}
                onClick={() => setSelected(item)}
                aria-label={`Open ${item.product.name} in gallery view`}
                className="group mb-5 block w-full break-inside-avoid overflow-hidden rounded-4xl border border-marron/12 bg-cream p-2 text-left shadow-soft transition-[border-color,box-shadow] duration-500 hover:border-cyan/45 hover:shadow-lift"
              >
                <span className={`frame-image relative block w-full ${item.ratio} rounded-[1.5rem]`}>
                  <img
                    src={imageSource(item.product.image)}
                    alt={item.product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </span>
                <span className="block px-3 pb-2 pt-4">
                  <span className="block font-display text-lg font-medium text-marron">{item.product.name}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">{item.caption}</span>
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={selected.product.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close gallery view"
              onClick={() => setSelected(null)}
              className="absolute inset-0 bg-marron/75 backdrop-blur-sm"
            />
            <motion.figure
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.35 }}
              className="relative w-full max-w-3xl rounded-5xl bg-cream p-3 shadow-lift"
            >
              <div className="frame-image relative aspect-[4/3] rounded-4xl sm:aspect-[16/10]">
                <img src={imageSource(selected.product.image)} alt={selected.product.name} className="h-full w-full object-cover" />
              </div>
              <figcaption className="flex items-start justify-between gap-4 px-4 py-5">
                <div>
                  <Badge tone="cyan">{tabs.find((tab) => tab.value === selected.category)?.label ?? 'Gallery'}</Badge>
                  <h2 className="mt-3 font-display text-2xl font-medium text-marron">{selected.product.name}</h2>
                  <p className="mt-1 text-sm text-muted">{selected.caption}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close gallery view"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-marron/5 text-marron transition-colors hover:bg-red/10 hover:text-red"
                >
                  <X className="h-5 w-5" />
                </button>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

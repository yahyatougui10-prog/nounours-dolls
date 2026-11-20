import { PRODUCTS as GENERATED_PRODUCTS } from './generated-products'

export type CategoryKey = 'teddy' | 'doll' | 'gift'
export type CollectionKey = CategoryKey | 'new'

export interface Product {
  id: string
  name: string
  category: string
  categoryKey: CategoryKey
  price: number
  image: string
  gallery: string[]
  description: string
  sizes: string[]
  dimensions: string[]
  materials: string[]
  colors: string[]
  story?: string
  tag?: string
  /** Searchable tags imported from the toy illustration database. */
  tags?: string[]

  /** Optional editorial storytelling — configured by the boutique team only. */
  personality?: string
  shortStory?: string
  favoriteThings?: string[]
  collection?: string
  featured?: boolean
  stock?: number
}

export interface FilterOption {
  value: string
  label: string
}

export interface CartItem {
  productId: string
  size: string
  color: string
  quantity: number
}

export interface CartLine {
  product: Product
  size: string
  color: string
  quantity: number
}

export const CATEGORY_OPTIONS: FilterOption[] = [
  { value: 'teddy', label: 'Teddy Bears' },
  { value: 'doll', label: 'Beautiful Dolls' },
  { value: 'gift', label: 'Special Gifts' },
  { value: 'new', label: 'New Arrivals' },
]

export const productMatchesCategory = (product: Product, category: string): boolean => {
  if (!category) return true
  if (category === 'new') return Boolean(product.tag?.toLowerCase().includes('new'))
  // Every illustrated companion is gift-ready; the database has no separate gift products.
  if (category === 'gift') return true
  return product.categoryKey === category
}

export const productSearchText = (product: Product): string =>
  [
    product.name,
    product.category,
    product.description,
    product.story ?? '',
    product.tag ?? '',
    (product.tags ?? []).join(' '),
    product.materials.join(' '),
  ]
    .join(' ')
    .toLowerCase()

export const formatPrice = (price: number): string => `$${price}`

export const isNewProduct = (product: Product): boolean =>
  Boolean(product.tag?.toLowerCase().includes('new'))

export const PRODUCTS: Product[] = GENERATED_PRODUCTS

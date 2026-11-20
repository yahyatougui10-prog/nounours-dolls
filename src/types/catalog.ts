import type { Product } from '../data/products'

/**
 * A catalog product keeps the exact shape the storefront already consumes.
 * Editorial/admin fields are optional so seeded and legacy products remain valid.
 */
export interface CatalogProduct extends Product {
  personality?: string
  shortStory?: string
  favoriteThings?: string[]
  collection?: string
  featured?: boolean
  stock?: number
}

export interface Collection {
  id: string
  title: string
  slug: string
  cover: string
  order: number
  featured: boolean
  description: string
}

export interface SiteContent {
  heroEyebrow: string
  heroHeadline: string
  heroSubtitle: string
  primaryCta: string
  secondaryCta: string
  storyHeadline: string
  storyBody: string
  contactEmail: string
  contactPhone: string
  address: string
}

export interface StoreSettings {
  brandName: string
  worldName: string
  tagline: string
  currency: string
  locale: string
  social: {
    instagram?: string
    facebook?: string
    pinterest?: string
  }
  storeEmail: string
}

export type MessageStatus = 'new' | 'read' | 'archived'

export interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: MessageStatus
  createdAt: string
}

export interface Activity {
  id: string
  at: string
  summary: string
}

export interface Overview {
  products: number
  categories: number
  collections: number
  messagesNew: number
  messagesTotal: number
  trackedStockProducts: number
  totalTrackedStock: number
  activity: Activity[]
}

export interface Catalog {
  products: CatalogProduct[]
  collections: Collection[]
  content: SiteContent
  settings: StoreSettings
}

export interface Session {
  authenticated: boolean
  email?: string
}

export interface MessageInput {
  name: string
  email: string
  subject: string
  message: string
}

export interface UploadResult {
  url: string
  name: string
  size: number
  mime: string
}

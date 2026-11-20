import type {
  Catalog,
  CatalogProduct,
  Collection,
  Message,
  MessageInput,
  MessageStatus,
  Overview,
  Session,
  SiteContent,
  StoreSettings,
  UploadResult,
} from '../types/catalog'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type ProductInput = Omit<CatalogProduct, 'id'>
type CollectionInput = Omit<Collection, 'id'>

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
}

const errorMessage = (payload: unknown, fallback: string): string => {
  if (payload && typeof payload === 'object') {
    const candidate = (payload as { error?: unknown; message?: unknown })
    if (typeof candidate.error === 'string' && candidate.error.trim()) return candidate.error
    if (typeof candidate.message === 'string' && candidate.message.trim()) return candidate.message
  }
  return fallback
}

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body } = options
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  if (method !== 'GET' || body !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(path, {
      method,
      headers,
      credentials: 'same-origin',
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Unable to reach the server. Please try again.', 0)
  }

  const text = await response.text()
  let payload: unknown = null
  if (text) {
    try {
      payload = JSON.parse(text) as unknown
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    throw new ApiError(errorMessage(payload, response.statusText || 'Request failed'), response.status)
  }

  return (payload ?? undefined) as T
}

export const api = {
  getSession: () => request<Session>('/api/session'),

  login: (email: string, password: string) =>
    request<Session>('/api/login', { method: 'POST', body: { email, password } }),

  logout: () => request<{ ok: true }>('/api/logout', { method: 'POST' }),

  getCatalog: () => request<Catalog>('/api/catalog'),

  createProduct: (product: ProductInput) =>
    request<CatalogProduct>('/api/products', { method: 'POST', body: product }),

  updateProduct: (id: string, patch: Partial<ProductInput>) =>
    request<CatalogProduct>(`/api/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: patch,
    }),

  deleteProduct: (id: string) =>
    request<{ ok: true }>(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  uploadImage: (fileName: string, dataUrl: string) =>
    request<UploadResult>('/api/uploads', { method: 'POST', body: { fileName, dataUrl } }),

  createCollection: (collection: CollectionInput) =>
    request<Collection>('/api/collections', { method: 'POST', body: collection }),

  updateCollection: (id: string, patch: Partial<CollectionInput>) =>
    request<Collection>(`/api/collections/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: patch,
    }),

  deleteCollection: (id: string) =>
    request<{ ok: true }>(`/api/collections/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  updateContent: (patch: Partial<SiteContent>) =>
    request<SiteContent>('/api/content', { method: 'PUT', body: patch }),

  updateSettings: (patch: Partial<StoreSettings>) =>
    request<StoreSettings>('/api/settings', { method: 'PUT', body: patch }),

  getMessages: () => request<Message[]>('/api/messages'),

  updateMessage: (id: string, status: MessageStatus) =>
    request<Message>(`/api/messages/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: { status },
    }),

  deleteMessage: (id: string) =>
    request<{ ok: true }>(`/api/messages/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  sendMessage: (payload: MessageInput) =>
    request<Message>('/api/messages', { method: 'POST', body: payload }),

  getOverview: () => request<Overview>('/api/overview'),
}

export type { ProductInput, CollectionInput }

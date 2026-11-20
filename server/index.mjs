import { existsSync } from 'node:fs'
import { createReadStream } from 'node:fs'
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { seed } from './data/seed.mjs'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA_DIR = path.join(PROJECT_ROOT, 'server', 'data')
const STORE_FILE = path.join(DATA_DIR, 'store.json')
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json')
const UPLOADS_DIR = path.join(PROJECT_ROOT, 'server', 'uploads')
const DIST_DIR = path.join(PROJECT_ROOT, 'dist')

const PRODUCTION = process.env.NODE_ENV === 'production'
const PORT = Number.parseInt(process.env.PORT ?? '', 10) || (PRODUCTION ? 4173 : 3001)
const SESSION_TTL_SECONDS = 8 * 60 * 60
const COOKIE_NAME = 'noosh_admin'
const MAX_JSON_BYTES = 8 * 1024 * 1024
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const MAX_ACTIVITY = 200
const PBKDF2_ITERATIONS = 150_000
const STATIC_ENABLED = PRODUCTION || existsSync(path.join(DIST_DIR, 'index.html'))

const UPLOAD_TYPES = Object.freeze({
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
})
const MIME_TO_EXTENSION = Object.freeze({
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
})
const STATIC_TYPES = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
})

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const sendJson = (res, status, body, extraHeaders = {}) => {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  })
  res.end(payload)
}

const sendError = (res, error) => {
  const status = error instanceof HttpError ? error.status : 500
  if (status >= 500) console.error('[server]', error)
  if (res.headersSent) {
    res.end()
    return
  }
  sendJson(res, status, {
    error: status >= 500 ? 'Internal server error.' : error.message,
  })
}

const stringField = (value, label, { min = 1, max = 500, optional = false } = {}) => {
  if (value === undefined || value === null) {
    if (optional) return undefined
    throw new HttpError(400, `${label} is required.`)
  }
  if (typeof value !== 'string') throw new HttpError(400, `${label} must be text.`)
  const trimmed = value.trim()
  if (trimmed.length < min || trimmed.length > max) {
    throw new HttpError(400, `${label} must be between ${min} and ${max} characters.`)
  }
  return trimmed
}

const arrayField = (value, label, { max = 40, itemMax = 300 } = {}) => {
  if (!Array.isArray(value)) throw new HttpError(400, `${label} must be a list.`)
  if (value.length > max) throw new HttpError(400, `${label} has too many entries.`)
  return value.map((entry) => stringField(entry, `${label} entry`, { min: 0, max: itemMax }))
}

const numberField = (value, label, { min = 0, integer = false } = {}) => {
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed) || parsed < min || (integer && !Number.isInteger(parsed))) {
    throw new HttpError(400, `${label} must be a valid ${integer ? 'whole ' : ''}number.`)
  }
  return parsed
}

const assertKnownKeys = (body, keys, label) => {
  for (const key of Object.keys(body)) {
    if (!keys.includes(key)) throw new HttpError(400, `Unknown ${label} field: ${key}.`)
  }
}

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

const decodeSegment = (value) => {
  try {
    return decodeURIComponent(value)
  } catch {
    throw new HttpError(400, 'Invalid path encoding.')
  }
}

const isWithin = (root, target) => target === root || target.startsWith(root + path.sep)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

let store = structuredClone(seed)
let admin = null
let writeQueue = Promise.resolve()

const persistStore = () => {
  writeQueue = writeQueue.catch(() => {}).then(async () => {
    await mkdir(DATA_DIR, { recursive: true })
    const temporary = `${STORE_FILE}.${process.pid}.tmp`
    await writeFile(temporary, JSON.stringify(store, null, 2), { mode: 0o600 })
    await rename(temporary, STORE_FILE)
  })
  return writeQueue
}

const normalizeStore = (raw) => {
  if (!isObject(raw)) return structuredClone(seed)
  return {
    products: Array.isArray(raw.products) ? raw.products.filter(isObject) : [],
    collections: Array.isArray(raw.collections) ? raw.collections.filter(isObject) : [],
    content: { ...seed.content, ...(isObject(raw.content) ? raw.content : {}) },
    settings: {
      ...seed.settings,
      ...(isObject(raw.settings) ? raw.settings : {}),
      social: {
        ...seed.settings.social,
        ...(isObject(raw.settings?.social) ? raw.settings.social : {}),
      },
    },
    messages: Array.isArray(raw.messages) ? raw.messages.filter(isObject) : [],
    activity: Array.isArray(raw.activity) ? raw.activity.filter(isObject) : [],
  }
}

const loadStore = async () => {
  await mkdir(DATA_DIR, { recursive: true })
  await mkdir(UPLOADS_DIR, { recursive: true })
  try {
    store = normalizeStore(JSON.parse(await readFile(STORE_FILE, 'utf8')))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    store = structuredClone(seed)
    await persistStore()
    console.log('[server] Created server/data/store.json from seed data.')
  }
}

const recordActivity = (summary) => {
  const clean = String(summary).replace(/\s+/g, ' ').trim().slice(0, 180)
  store.activity.push({ id: randomUUID(), at: new Date().toISOString(), summary: clean })
  if (store.activity.length > MAX_ACTIVITY) {
    store.activity = store.activity.slice(-MAX_ACTIVITY)
  }
}

const commit = async (summary) => {
  recordActivity(summary)
  await persistStore()
}

// ---------------------------------------------------------------------------
// Admin credentials and sessions
// ---------------------------------------------------------------------------

const hashPassword = (password, salt, iterations = PBKDF2_ITERATIONS) =>
  pbkdf2Sync(password, salt, iterations, 32, 'sha256')

const ensureAdmin = async () => {
  try {
    const parsed = JSON.parse(await readFile(ADMIN_FILE, 'utf8'))
    if (
      !isObject(parsed) ||
      typeof parsed.email !== 'string' ||
      typeof parsed.salt !== 'string' ||
      typeof parsed.hash !== 'string' ||
      !/^[0-9a-f]{64}$/i.test(parsed.hash)
    ) {
      throw new Error(`server/data/admin.json is invalid; fix or remove it and restart.`)
    }
    admin = {
      email: parsed.email,
      salt: parsed.salt,
      hash: parsed.hash,
      iterations: Number(parsed.iterations) || PBKDF2_ITERATIONS,
    }
    return
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  const email = process.env.ADMIN_EMAIL?.trim() || 'admin@nounoursdolls.local'
  const generated = !process.env.ADMIN_PASSWORD
  const password = process.env.ADMIN_PASSWORD || randomBytes(18).toString('base64url')
  const salt = randomBytes(16).toString('hex')
  const hash = hashPassword(password, salt).toString('hex')

  await writeFile(
    ADMIN_FILE,
    JSON.stringify({ email, salt, hash, iterations: PBKDF2_ITERATIONS }, null, 2),
    { mode: 0o600, flag: 'wx' },
  )
  admin = { email, salt, hash, iterations: PBKDF2_ITERATIONS }

  if (generated) {
    console.log('[server] ──────────────────────────────────────────────')
    console.log('[server] First-run admin credentials (shown once):')
    console.log(`[server]   Email:    ${email}`)
    console.log(`[server]   Password: ${password}`)
    console.log('[server] Stored only as a PBKDF2 hash in server/data/admin.json.')
    console.log('[server] ──────────────────────────────────────────────')
  } else {
    console.log(`[server] Admin credentials initialised for ${email}.`)
  }
}

const verifyCredentials = (email, password) => {
  const candidate = hashPassword(password, admin.salt, admin.iterations)
  const expected = Buffer.from(admin.hash, 'hex')
  const passwordMatches =
    candidate.length === expected.length && timingSafeEqual(candidate, expected)

  const candidateEmail = Buffer.from(String(email).toLowerCase())
  const expectedEmail = Buffer.from(admin.email.toLowerCase())
  const emailMatches =
    candidateEmail.length === expectedEmail.length && timingSafeEqual(candidateEmail, expectedEmail)

  return passwordMatches && emailMatches
}

const sessions = new Map()

const cookiesFor = (req) => {
  const result = {}
  for (const part of String(req.headers.cookie ?? '').split(';')) {
    const index = part.indexOf('=')
    if (index < 0) continue
    const key = part.slice(0, index).trim()
    if (key) result[key] = part.slice(index + 1).trim()
  }
  return result
}

const tokenFor = (req) => cookiesFor(req)[COOKIE_NAME]

const sessionFor = (req) => {
  const token = tokenFor(req)
  if (!token) return null
  const session = sessions.get(token)
  if (!session) return null
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token)
    return null
  }
  return session
}

const requireAuth = (req) => {
  const session = sessionFor(req)
  if (!session) throw new HttpError(401, 'Please sign in to continue.')
  return session
}

const secureCookie = (req) =>
  PRODUCTION &&
  (process.env.PUBLIC_HTTPS === 'true' ||
    String(req.headers['x-forwarded-proto'] ?? '')
      .split(',')[0]
      .trim()
      .toLowerCase() === 'https')

const cookieSuffix = (req, maxAge) =>
  [`Path=/`, `HttpOnly`, `SameSite=Lax`, `Max-Age=${maxAge}`, secureCookie(req) ? 'Secure' : '']
    .filter(Boolean)
    .join('; ')

const checkCsrf = (req) => {
  const contentType = String(req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase()
  if (contentType !== 'application/json') {
    throw new HttpError(400, 'Mutations require Content-Type: application/json.')
  }

  const origin = req.headers.origin
  if (!origin) return // same-origin curl/tests may omit Origin

  let originHost
  try {
    originHost = new URL(origin).host
  } catch {
    throw new HttpError(403, 'Invalid Origin header.')
  }

  const allowed = new Set([String(req.headers.host ?? '')])
  for (const entry of String(process.env.ALLOWED_ORIGINS ?? '').split(',')) {
    const value = entry.trim()
    if (!value) continue
    try {
      allowed.add(new URL(value).host)
    } catch {
      allowed.add(value)
    }
  }
  if (!allowed.has(originHost)) throw new HttpError(403, 'Origin does not match this server.')
}

const readJson = async (req) => {
  const chunks = []
  let size = 0
  let tooLarge = false
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_JSON_BYTES) tooLarge = true
    if (!tooLarge) chunks.push(chunk)
  }
  if (tooLarge) throw new HttpError(413, 'Request body is too large.')
  if (size === 0) return {}
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    if (!isObject(value)) throw new Error('not an object')
    return value
  } catch {
    throw new HttpError(400, 'Malformed JSON body.')
  }
}

// ---------------------------------------------------------------------------
// Field parsing for real store records
// ---------------------------------------------------------------------------

const PRODUCT_KEYS = [
  'name',
  'category',
  'categoryKey',
  'price',
  'image',
  'gallery',
  'description',
  'sizes',
  'dimensions',
  'materials',
  'colors',
  'story',
  'tag',
  'tags',
  'personality',
  'shortStory',
  'favoriteThings',
  'collection',
  'featured',
  'stock',
]
const OPTIONAL_PRODUCT_KEYS = [
  'story',
  'tag',
  'tags',
  'personality',
  'shortStory',
  'favoriteThings',
  'collection',
  'featured',
  'stock',
]
const REQUIRED_PRODUCT_KEYS = [
  'name',
  'category',
  'categoryKey',
  'price',
  'image',
  'gallery',
  'description',
  'sizes',
  'dimensions',
  'materials',
  'colors',
]

const parseProductPatch = (body) => {
  assertKnownKeys(body, PRODUCT_KEYS, 'product')
  const fields = {}
  const clears = []

  for (const key of OPTIONAL_PRODUCT_KEYS) {
    if (Object.hasOwn(body, key) && body[key] === null) clears.push(key)
  }

  if (Object.hasOwn(body, 'name')) fields.name = stringField(body.name, 'Name', { max: 120 })
  if (Object.hasOwn(body, 'category')) fields.category = stringField(body.category, 'Category', { max: 120 })
  if (Object.hasOwn(body, 'categoryKey')) {
    if (!['teddy', 'doll', 'gift'].includes(body.categoryKey)) {
      throw new HttpError(400, 'categoryKey must be teddy, doll or gift.')
    }
    fields.categoryKey = body.categoryKey
  }
  if (Object.hasOwn(body, 'price')) fields.price = numberField(body.price, 'Price')
  if (Object.hasOwn(body, 'image')) fields.image = stringField(body.image, 'Image', { max: 500 })
  if (Object.hasOwn(body, 'gallery')) fields.gallery = arrayField(body.gallery, 'Gallery', { max: 30 })
  if (Object.hasOwn(body, 'description')) {
    fields.description = stringField(body.description, 'Description', { min: 0, max: 3000 })
  }
  for (const key of ['sizes', 'dimensions', 'materials', 'colors']) {
    if (Object.hasOwn(body, key)) fields[key] = arrayField(body[key], key, { max: 30 })
  }
  for (const key of ['story', 'tag', 'personality', 'shortStory', 'collection']) {
    if (Object.hasOwn(body, key) && body[key] !== null) {
      fields[key] = stringField(body[key], key, { min: 0, max: 2000 })
    }
  }
  if (Object.hasOwn(body, 'tags') && body.tags !== null) {
    fields.tags = arrayField(body.tags, 'tags', { max: 60, itemMax: 100 })
  }
  if (Object.hasOwn(body, 'favoriteThings') && body.favoriteThings !== null) {
    fields.favoriteThings = arrayField(body.favoriteThings, 'favoriteThings', { max: 30 })
  }
  if (Object.hasOwn(body, 'featured') && body.featured !== null) {
    if (typeof body.featured !== 'boolean') throw new HttpError(400, 'featured must be true or false.')
    fields.featured = body.featured
  }
  if (Object.hasOwn(body, 'stock') && body.stock !== null) {
    fields.stock = numberField(body.stock, 'Stock', { integer: true })
  }

  return { fields, clears }
}

const applyProductPatch = (product, { fields, clears }) => {
  let next = { ...product }
  for (const key of clears) delete next[key]
  next = { ...next, ...fields }
  return next
}

const COLLECTION_KEYS = ['title', 'slug', 'cover', 'order', 'featured', 'description']

const parseCollectionPatch = (body) => {
  assertKnownKeys(body, COLLECTION_KEYS, 'collection')
  const fields = {}
  if (Object.hasOwn(body, 'title')) fields.title = stringField(body.title, 'Title', { max: 120 })
  if (Object.hasOwn(body, 'slug')) {
    const slug = stringField(body.slug, 'Slug', { max: 120 })
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new HttpError(400, 'Slug may only contain lowercase letters, numbers and hyphens.')
    }
    fields.slug = slug
  }
  if (Object.hasOwn(body, 'cover')) fields.cover = stringField(body.cover, 'Cover', { max: 500 })
  if (Object.hasOwn(body, 'order')) fields.order = numberField(body.order, 'Order', { integer: true })
  if (Object.hasOwn(body, 'featured')) {
    if (typeof body.featured !== 'boolean') throw new HttpError(400, 'featured must be true or false.')
    fields.featured = body.featured
  }
  if (Object.hasOwn(body, 'description')) {
    fields.description = stringField(body.description, 'Description', { min: 0, max: 2000 })
  }
  return fields
}

// ---------------------------------------------------------------------------
// Static and uploaded files
// ---------------------------------------------------------------------------

const serveFile = (res, filePath, mime, cacheControl = 'no-cache') => {
  res.writeHead(200, {
    'Content-Type': mime,
    'Cache-Control': cacheControl,
    'X-Content-Type-Options': 'nosniff',
    ...(mime === 'image/svg+xml'
      ? { 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox" }
      : {}),
  })
  createReadStream(filePath).on('error', () => res.destroy()).pipe(res)
}

const serveUpload = async (req, res, pathname) => {
  const rawName = pathname.startsWith('/uploads/') ? pathname.slice('/uploads/'.length) : ''
  if (!rawName) throw new HttpError(404, 'Image not found.')
  const name = decodeSegment(rawName)
  if (name.includes('/') || name.includes('\\') || name.includes('\0')) {
    throw new HttpError(404, 'Image not found.')
  }
  const mime = UPLOAD_TYPES[path.extname(name).toLowerCase()]
  if (!mime) throw new HttpError(404, 'Image not found.')

  const filePath = path.resolve(UPLOADS_DIR, name)
  if (!isWithin(UPLOADS_DIR, filePath)) throw new HttpError(404, 'Image not found.')

  const info = await stat(filePath).catch(() => null)
  if (!info?.isFile() || info.size > MAX_UPLOAD_BYTES) throw new HttpError(404, 'Image not found.')
  serveFile(res, filePath, mime, 'public, max-age=86400')
}

const serveStatic = async (req, res, pathname) => {
  const decoded = decodeSegment(pathname)
  if (decoded.includes('\0') || decoded.includes('\\')) throw new HttpError(400, 'Invalid path.')
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '')
  let filePath = path.resolve(DIST_DIR, relative)
  if (!isWithin(DIST_DIR, filePath)) throw new HttpError(403, 'Forbidden.')

  let info = await stat(filePath).catch(() => null)
  if (info?.isDirectory()) {
    filePath = path.join(filePath, 'index.html')
    info = await stat(filePath).catch(() => null)
  }
  if (!info?.isFile()) {
    if (path.extname(relative)) throw new HttpError(404, 'Not found.')
    filePath = path.join(DIST_DIR, 'index.html')
    info = await stat(filePath).catch(() => null)
    if (!info?.isFile()) throw new HttpError(404, 'Frontend build not found.')
  }

  const mime = STATIC_TYPES[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream'
  const cache = filePath.includes(`${path.sep}assets${path.sep}`)
    ? 'public, max-age=31536000, immutable'
    : 'no-cache'
  serveFile(res, filePath, mime, cache)
}

// ---------------------------------------------------------------------------
// API routing
// ---------------------------------------------------------------------------

const routeApi = async (req, res, pathname) => {
  const method = req.method ?? 'GET'
  if (!pathname.startsWith('/api/')) return false

  if (method !== 'GET') checkCsrf(req)

  const session = sessionFor(req)

  if (pathname === '/api/catalog' && method === 'GET') {
    sendJson(res, 200, {
      products: store.products,
      collections: store.collections,
      content: store.content,
      settings: store.settings,
    })
    return true
  }

  if (pathname === '/api/session' && method === 'GET') {
    sendJson(res, 200, {
      authenticated: Boolean(session),
      ...(session ? { email: session.email } : {}),
    })
    return true
  }

  if (pathname === '/api/login' && method === 'POST') {
    const body = await readJson(req)
    const email = stringField(body.email, 'Email', { max: 200 })
    const password = stringField(body.password, 'Password', { max: 300 })
    if (!verifyCredentials(email, password)) throw new HttpError(401, 'Invalid email or password.')

    const token = randomBytes(32).toString('base64url')
    sessions.set(token, { email: admin.email, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 })
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; ${cookieSuffix(req, SESSION_TTL_SECONDS)}`)
    await commit('Admin signed in')
    sendJson(res, 200, { authenticated: true, email: admin.email })
    return true
  }

  if (pathname === '/api/logout' && method === 'POST') {
    requireAuth(req)
    const token = tokenFor(req)
    if (token) sessions.delete(token)
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; ${cookieSuffix(req, 0)}`)
    await commit('Admin signed out')
    sendJson(res, 200, { ok: true })
    return true
  }

  // Public contact form: writes a real message to the store, no admin cookie.
  if (pathname === '/api/messages' && method === 'POST') {
    const body = await readJson(req)
    const message = {
      id: randomUUID(),
      name: stringField(body.name, 'Name', { max: 120 }),
      email: stringField(body.email, 'Email', { max: 200 }),
      subject: stringField(body.subject, 'Subject', { max: 200 }),
      message: stringField(body.message, 'Message', { min: 10, max: 4000 }),
      status: 'new',
      createdAt: new Date().toISOString(),
    }
    if (!EMAIL_PATTERN.test(message.email)) throw new HttpError(400, 'Enter a valid email address.')
    store.messages.push(message)
    await commit(`New message from ${message.name}: ${message.subject}`)
    sendJson(res, 201, message)
    return true
  }

  // Everything below this point is admin-only.
  requireAuth(req)

  if (pathname === '/api/uploads' && method === 'POST') {
    const body = await readJson(req)
    stringField(body.fileName, 'File name', { max: 200 })
    const dataUrl = stringField(body.dataUrl, 'Image data', { max: MAX_JSON_BYTES })
    const match = /^data:(image\/(?:jpeg|png|webp|gif|svg\+xml));base64,([A-Za-z0-9+/=]+)$/.exec(
      dataUrl.replace(/\s/g, ''),
    )
    if (!match) throw new HttpError(400, 'Unsupported image format. Use JPEG, PNG, WebP, GIF or SVG.')
    const mime = match[1]
    const buffer = Buffer.from(match[2], 'base64')
    if (!buffer.length) throw new HttpError(400, 'The uploaded image is empty.')
    if (buffer.length > MAX_UPLOAD_BYTES) throw new HttpError(413, 'Images must be 5 MB or smaller.')

    const extension = MIME_TO_EXTENSION[mime]
    const cleanBase =
      path
        .basename(String(body.fileName))
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/\.[a-z0-9]+$/i, '')
        .slice(0, 50) || 'image'
    const name = `${cleanBase}-${randomUUID()}.${extension}`
    await writeFile(path.join(UPLOADS_DIR, name), buffer, { flag: 'wx' })
    await commit(`Uploaded image ${name}`)
    sendJson(res, 201, { url: `/uploads/${name}`, name, size: buffer.length, mime })
    return true
  }

  const productMatch = pathname.match(/^\/api\/products\/([^/]+)$/)
  if (pathname === '/api/products' && method === 'POST') {
    const body = await readJson(req)
    const { fields } = parseProductPatch(body)
    for (const key of REQUIRED_PRODUCT_KEYS) {
      if (!Object.hasOwn(fields, key)) throw new HttpError(400, `${key} is required.`)
    }
    const product = { id: randomUUID(), ...fields }
    store.products.push(product)
    await commit(`Added product ${product.name}`)
    sendJson(res, 201, product)
    return true
  }
  if (productMatch && (method === 'PUT' || method === 'DELETE')) {
    const id = decodeSegment(productMatch[1])
    const index = store.products.findIndex((product) => product.id === id)
    if (index < 0) throw new HttpError(404, 'Product not found.')
    if (method === 'DELETE') {
      const [removed] = store.products.splice(index, 1)
      await commit(`Removed product ${removed.name}`)
      sendJson(res, 200, { ok: true })
      return true
    }
    const updated = applyProductPatch(store.products[index], parseProductPatch(await readJson(req)))
    store.products[index] = updated
    await commit(`Updated product ${updated.name}`)
    sendJson(res, 200, updated)
    return true
  }

  const collectionMatch = pathname.match(/^\/api\/collections\/([^/]+)$/)
  if (pathname === '/api/collections' && method === 'GET') {
    sendJson(res, 200, store.collections)
    return true
  }
  if (pathname === '/api/collections' && method === 'POST') {
    const body = await readJson(req)
    const fields = parseCollectionPatch(body)
    if (!fields.title) throw new HttpError(400, 'title is required.')
    const slug = fields.slug ?? slugify(fields.title)
    if (!slug) throw new HttpError(400, 'A valid slug could not be generated.')
    const collection = {
      id: randomUUID(),
      title: fields.title,
      slug,
      cover: fields.cover ?? '',
      order: fields.order ?? store.collections.length + 1,
      featured: fields.featured ?? false,
      description: fields.description ?? '',
    }
    store.collections.push(collection)
    await commit(`Added collection ${collection.title}`)
    sendJson(res, 201, collection)
    return true
  }
  if (collectionMatch && (method === 'PUT' || method === 'DELETE')) {
    const id = decodeSegment(collectionMatch[1])
    const index = store.collections.findIndex((collection) => collection.id === id)
    if (index < 0) throw new HttpError(404, 'Collection not found.')
    if (method === 'DELETE') {
      const [removed] = store.collections.splice(index, 1)
      await commit(`Removed collection ${removed.title}`)
      sendJson(res, 200, { ok: true })
      return true
    }
    const updated = { ...store.collections[index], ...parseCollectionPatch(await readJson(req)) }
    store.collections[index] = updated
    await commit(`Updated collection ${updated.title}`)
    sendJson(res, 200, updated)
    return true
  }

  const CONTENT_KEYS = Object.keys(seed.content)
  if (pathname === '/api/content' && method === 'PUT') {
    const body = await readJson(req)
    assertKnownKeys(body, CONTENT_KEYS, 'content')
    const patch = {}
    for (const key of CONTENT_KEYS) {
      if (Object.hasOwn(body, key)) {
        patch[key] = stringField(body[key], key, { min: 0, max: key === 'storyBody' ? 5000 : 500 })
      }
    }
    store.content = { ...store.content, ...patch }
    await commit('Updated site content')
    sendJson(res, 200, store.content)
    return true
  }

  const SETTINGS_KEYS = ['brandName', 'worldName', 'tagline', 'currency', 'locale', 'storeEmail', 'social']
  const SOCIAL_KEYS = ['instagram', 'facebook', 'pinterest']
  if (pathname === '/api/settings' && method === 'PUT') {
    const body = await readJson(req)
    assertKnownKeys(body, SETTINGS_KEYS, 'settings')
    const patch = {}
    for (const key of SETTINGS_KEYS.filter((entry) => entry !== 'social')) {
      if (Object.hasOwn(body, key)) {
        patch[key] = stringField(body[key], key, { min: 0, max: 300 })
      }
    }
    if (Object.hasOwn(body, 'social')) {
      if (!isObject(body.social)) throw new HttpError(400, 'social must be an object.')
      assertKnownKeys(body.social, SOCIAL_KEYS, 'social link')
      patch.social = { ...store.settings.social }
      for (const key of SOCIAL_KEYS) {
        if (Object.hasOwn(body.social, key)) {
          patch.social[key] = stringField(body.social[key], key, { min: 0, max: 500 })
        }
      }
    }
    store.settings = { ...store.settings, ...patch }
    await commit('Updated store settings')
    sendJson(res, 200, store.settings)
    return true
  }

  if (pathname === '/api/messages' && method === 'GET') {
    const messages = [...store.messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    sendJson(res, 200, messages)
    return true
  }

  const messageMatch = pathname.match(/^\/api\/messages\/([^/]+)$/)
  if (messageMatch && (method === 'PATCH' || method === 'DELETE')) {
    const id = decodeSegment(messageMatch[1])
    const index = store.messages.findIndex((message) => message.id === id)
    if (index < 0) throw new HttpError(404, 'Message not found.')
    if (method === 'DELETE') {
      const [removed] = store.messages.splice(index, 1)
      await commit(`Deleted message from ${removed.name}`)
      sendJson(res, 200, { ok: true })
      return true
    }
    const body = await readJson(req)
    assertKnownKeys(body, ['status'], 'message')
    if (!['new', 'read', 'archived'].includes(body.status)) {
      throw new HttpError(400, 'status must be new, read or archived.')
    }
    const updated = { ...store.messages[index], status: body.status }
    store.messages[index] = updated
    await commit(`Marked message from ${updated.name} as ${updated.status}`)
    sendJson(res, 200, updated)
    return true
  }

  if (pathname === '/api/overview' && method === 'GET') {
    const tracked = store.products.filter(
      (product) => typeof product.stock === 'number' && Number.isFinite(product.stock),
    )
    sendJson(res, 200, {
      products: store.products.length,
      categories: new Set(store.products.map((product) => product.categoryKey)).size,
      collections: store.collections.length,
      messagesNew: store.messages.filter((message) => message.status === 'new').length,
      messagesTotal: store.messages.length,
      trackedStockProducts: tracked.length,
      totalTrackedStock: tracked.reduce((total, product) => total + product.stock, 0),
      activity: store.activity.slice(-8).reverse(),
    })
    return true
  }

  return false
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

const server = createServer(async (req, res) => {
  try {
    const parsed = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
    let pathname = parsed.pathname
    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1)

    if (pathname === '/uploads' || pathname.startsWith('/uploads/')) {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        throw new HttpError(405, 'Method not allowed.')
      }
      await serveUpload(req, res, pathname)
      return
    }

    if (pathname === '/api' || pathname.startsWith('/api/')) {
      const handled = await routeApi(req, res, pathname)
      if (!handled) throw new HttpError(404, 'API route not found.')
      return
    }

    if (STATIC_ENABLED) {
      await serveStatic(req, res, pathname)
      return
    }

    sendJson(res, 404, { error: 'API server only. Start Vite for the frontend.' })
  } catch (error) {
    sendError(res, error)
  }
})

const shutdown = () => {
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(0), 2000).unref()
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

try {
  await loadStore()
  await ensureAdmin()
  server.listen(PORT, () => {
    console.log(`[server] API listening on http://localhost:${PORT}`)
    console.log(
      `[server] Mode: ${PRODUCTION ? 'production' : 'development'}${STATIC_ENABLED ? ' (serving dist)' : ' (API + uploads only)'}`,
    )
  })
} catch (error) {
  console.error('[server] Failed to start:', error)
  process.exit(1)
}

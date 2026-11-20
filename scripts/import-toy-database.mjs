/**
 * Import the bundled toy illustration database into the storefront catalog.
 *
 * Source: data/toy-database/toys_images.db
 * Output:
 *   - src/data/generated-products.ts (client fallback catalog)
 *   - server/data/toy-products.mjs   (server seed catalog)
 *   - server/data/store.json         (live catalog, preserving messages/activity)
 *
 * No npm dependencies: Node's built-in SQLite and fs APIs are used.
 */
import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DB_PATH = path.join(ROOT, 'data', 'toy-database', 'toys_images.db')
const CLIENT_OUTPUT = path.join(ROOT, 'src', 'data', 'generated-products.ts')
const SERVER_OUTPUT = path.join(ROOT, 'server', 'data', 'toy-products.mjs')
const STORE_PATH = path.join(ROOT, 'server', 'data', 'store.json')

const db = new DatabaseSync(DB_PATH, { readOnly: true })
const rows = db
  .prepare(
    `SELECT
       i.id,
       i.filename,
       i.title_en,
       i.title_fr,
       i.description,
       i.attributes,
       i.split,
       c.slug AS category_slug,
       (SELECT GROUP_CONCAT(t.name, '|')
          FROM image_tags it
          JOIN tags t ON t.id = it.tag_id
         WHERE it.image_id = i.id) AS tags
     FROM images i
     JOIN categories c ON c.id = i.category_id
     ORDER BY i.id`,
  )
  .all()
db.close()

const titleCase = (value) =>
  String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())

const highlightPreference = [
  'crown',
  'party hat',
  'heart',
  'hair flower',
  'hair bow',
  'ear bow',
  'bow tie',
  'braids',
  'hair buns',
  'long hair',
  'polka dots',
  'stripes',
  'blue dress',
  'pink dress',
  'green dress',
  'red dress',
  'purple dress',
  'yellow dress',
  'turquoise dress',
]

const pickTag = (row, tagList, attributes) => {
  if (row.split === 'test') return 'New arrival'
  const lowered = tagList.map((tag) => tag.toLowerCase())
  const preferred = highlightPreference.find((candidate) => lowered.includes(candidate))
  if (preferred) return titleCase(preferred)
  if (attributes.accessory) return titleCase(attributes.accessory)
  if (attributes.hair_style) return titleCase(attributes.hair_style)
  if (attributes.fur) return `${titleCase(attributes.fur)} fur`
  return 'Illustration'
}

const priceFor = (isDoll, tagList, attributes) => {
  let price = isDoll ? 49 : 39
  const tags = new Set(tagList.map((tag) => tag.toLowerCase()))
  const accessory = String(attributes.accessory ?? '')
  if (accessory === 'crown' || accessory === 'party_hat') price += 8
  if (tags.has('heart') || accessory.includes('bow')) price += 4
  if (attributes.pattern && attributes.pattern !== 'plain') price += 2
  if (['braids', 'buns', 'long'].includes(attributes.hair_style)) price += 3
  return price
}

const colorChoices = (attributes) => {
  const candidates = [
    attributes.hair_hex ?? attributes.fur_hex,
    attributes.dress_hex ?? attributes.accent_hex,
    attributes.accent_hex,
    attributes.bg1,
    attributes.bg2,
  ]
  const colors = [...new Set(candidates.filter((value) => typeof value === 'string' && value))]
  return colors.length >= 3 ? colors.slice(0, 4) : ['#C62828', '#22C7D6', '#795548']
}

const byCategory = {
  doll: rows.filter((row) => row.category_slug === 'dolls'),
  teddy: rows.filter((row) => row.category_slug === 'nounours'),
}

const galleryFor = (row, categoryRows) => {
  const index = categoryRows.findIndex((candidate) => candidate.id === row.id)
  return [0, 1, 2].map((offset) => {
    const next = categoryRows[(index + offset) % categoryRows.length]
    return `/products/toys/${next.filename}`
  })
}

const products = rows.map((row) => {
  const isDoll = row.category_slug === 'dolls'
  const attributes = JSON.parse(row.attributes || '{}')
  const tags = String(row.tags ?? '')
    .split('|')
    .map((tag) => tag.trim())
    .filter(Boolean)

  return {
    id: `toy-${String(row.id).padStart(3, '0')}`,
    name: row.title_en,
    category: isDoll ? 'Beautiful Dolls' : 'Teddy Bears',
    categoryKey: isDoll ? 'doll' : 'teddy',
    price: priceFor(isDoll, tags, attributes),
    image: `/products/toys/${row.filename}`,
    gallery: galleryFor(row, isDoll ? byCategory.doll : byCategory.teddy),
    description: row.description || row.title_en,
    sizes: isDoll ? ['30 cm', '45 cm'] : ['25 cm', '40 cm'],
    dimensions: isDoll
      ? ['30 × 12 × 9 cm', '45 × 18 × 12 cm']
      : ['25 × 14 × 12 cm', '40 × 22 × 18 cm'],
    materials: ['Original cartoon illustration', 'Pastel storybook backdrop', 'Collectible companion card'],
    colors: colorChoices(attributes),
    story: row.title_fr,
    tag: pickTag(row, tags, attributes),
    tags,
  }
})

const collectionCovers = {
  teddy: '/products/toys/nounours/nounours_001.png',
  doll: '/products/toys/dolls/doll_001.png',
  gift: '/products/toys/nounours/nounours_013.png',
  new: '/products/toys/dolls/doll_003.png',
}

const generatedNotice = `/* Generated by scripts/import-toy-database.mjs from toys_images.db. Do not edit by hand. */\n`

await writeFile(
  CLIENT_OUTPUT,
  `${generatedNotice}import type { Product } from './products'\n\nexport const PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)}\n`,
)
await writeFile(SERVER_OUTPUT, `${generatedNotice}export const toyProducts = ${JSON.stringify(products, null, 2)}\n`)

const store = JSON.parse(await readFile(STORE_PATH, 'utf8'))
store.products = products
store.collections = (store.collections ?? []).map((collection) => ({
  ...collection,
  cover: collectionCovers[collection.slug] ?? collection.cover,
}))
const summary = `Imported ${products.length} illustrations from the toy image database`
if (!store.activity?.some((entry) => entry.summary === summary)) {
  store.activity = [
    ...(store.activity ?? []),
    { id: randomUUID(), at: new Date().toISOString(), summary },
  ].slice(-200)
}
await writeFile(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`)

console.log(`Imported ${products.length} products from ${path.relative(ROOT, DB_PATH)}`)

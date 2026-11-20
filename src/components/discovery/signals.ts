import { formatPrice, type Product } from '../../data/products'
import { brand, neutrals } from '../../design-system/tokens'

export type StyleKey = 'classic' | 'heritage' | 'collector' | 'playful'
export type ColorFamily = 'marron' | 'cyan' | 'red' | 'cream' | 'ivory'
export type BudgetKey = 'under-60' | '60-100' | '100-plus'

export interface DiscoveryOption<T extends string> {
  value: T
  label: string
  hint: string
  swatch?: string
}

export const STYLE_OPTIONS: DiscoveryOption<StyleKey>[] = [
  { value: 'classic', label: 'Classic & timeless', hint: 'Simple, soft and loved every day' },
  { value: 'heritage', label: 'Vintage & heritage', hint: 'Heirloom details with a gentle finish' },
  { value: 'collector', label: 'Collector & elegant', hint: 'Keepsake pieces with a refined touch' },
  { value: 'playful', label: 'Playful & new', hint: 'Bright spirits, ready for make-believe' },
]

export const COLOR_OPTIONS: DiscoveryOption<ColorFamily>[] = [
  { value: 'marron', label: 'Marron', hint: 'Warm, earthy browns', swatch: brand.marron },
  { value: 'cyan', label: 'Cyan', hint: 'Fresh little pops of colour', swatch: brand.cyan },
  { value: 'red', label: 'Red', hint: 'A cheerful classic', swatch: brand.red },
  { value: 'cream', label: 'Cream', hint: 'Soft and gentle neutrals', swatch: neutrals.cream },
  { value: 'ivory', label: 'Ivory', hint: 'Light, airy neutrals', swatch: neutrals.ivory },
]

export const budgetLabel = (value: BudgetKey): string => {
  if (value === 'under-60') return `Under ${formatPrice(60)}`
  if (value === '60-100') return `${formatPrice(60)} – ${formatPrice(100)}`
  return `${formatPrice(100)}+`
}

export const BUDGET_OPTIONS: DiscoveryOption<BudgetKey>[] = [
  { value: 'under-60', label: budgetLabel('under-60'), hint: 'A little treat' },
  { value: '60-100', label: budgetLabel('60-100'), hint: 'A lovely middle ground' },
  { value: '100-plus', label: budgetLabel('100-plus'), hint: 'Something extra special' },
]

const stylePatterns: Record<StyleKey, RegExp> = {
  heritage: /brown|caramel|honey|ginger|dark|deep|golden|timeless|heirloom/i,
  collector: /crown|golden|heart|flower|card|collectible|keepsake|limited/i,
  playful: /party|bright|pink|turquoise|purple|orange|new arrival|happy|smile|bow/i,
  classic: /plain|striped|cream|ivory|polka|dots|soft|gentle|everyday|simple/i,
}

export const productText = (product: Product): string =>
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

export const productStyles = (product: Product): StyleKey[] => {
  const text = productText(product)
  return STYLE_OPTIONS.map((option) => option.value).filter((style) => stylePatterns[style].test(text))
}

interface Rgb {
  r: number
  g: number
  b: number
}

const parseHex = (hex: string): Rgb | null => {
  const trimmed = hex.trim().replace(/^#/, '')
  const expanded =
    trimmed.length === 3
      ? trimmed
          .split('')
          .map((character) => character + character)
          .join('')
      : trimmed
  if (!/^[0-9a-f]{6}$/i.test(expanded)) return null
  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
  }
}

export const colorFamily = (hex: string): ColorFamily => {
  const parsed = parseHex(hex)
  if (!parsed) return 'marron'

  const { r, g, b } = parsed
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  if (max >= 248 && delta <= 20) return 'ivory'
  if (max >= 208 && delta <= 40) return 'cream'
  if (delta === 0) return max > 180 ? 'cream' : 'marron'

  let hue: number
  if (max === r) hue = 60 * (((g - b) / delta) % 6)
  else if (max === g) hue = 60 * ((b - r) / delta + 2)
  else hue = 60 * ((r - g) / delta + 4)
  if (hue < 0) hue += 360

  if (hue >= 165 && hue <= 205) return 'cyan'
  if (hue >= 20 && hue <= 50) return 'marron'
  if (hue < 20 || hue >= 345) return delta < 80 || max < 170 ? 'marron' : 'red'
  return max > 200 ? 'cream' : 'marron'
}

export const productColorFamilies = (product: Product): ColorFamily[] =>
  Array.from(new Set(product.colors.map(colorFamily)))

export const inBudget = (product: Product, band: BudgetKey): boolean => {
  if (band === 'under-60') return product.price < 60
  if (band === '60-100') return product.price >= 60 && product.price <= 100
  return product.price > 100
}

export { imageSource } from '../../lib/assets'

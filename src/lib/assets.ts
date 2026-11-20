/**
 * Static assets are stored under `public/` and served from Vite's base path.
 * GitHub Pages serves this repo from a subfolder, so asset URLs must stay
 * relative to the deployed document instead of pointing at the host root.
 */
const base = import.meta.env.BASE_URL || '/'

const withBase = (basePath: string, path: string): string => {
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`
  const normalizedPath = path.replace(/^\/+/, '')
  return `${normalizedBase}${normalizedPath}`
}

export const assetUrl = (path: string): string => {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|data:|blob:)/i.test(path)) return path
  return withBase(base, path)
}

/** Resolves product image values from the API or generated catalog. */
export const imageSource = (file: string): string =>
  assetUrl(file.startsWith('/') ? file : `/products/${file}`)

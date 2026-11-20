/**
 * In-page scrolling that honours `prefers-reduced-motion`.
 *
 * An explicit `behavior: 'smooth'` argument overrides the CSS
 * `scroll-behavior` media-query reset, so callers must choose the behavior
 * rather than relying on the stylesheet.
 */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const scrollToId = (id: string): void => {
  const target = document.getElementById(id)
  if (!target) return
  target.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  })
}

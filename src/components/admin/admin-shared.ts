import { ApiError } from '../../lib/api'

export type Mutate = (task: () => Promise<unknown>, success?: string) => Promise<boolean>

export const errorMessage = (error: unknown): string => {
  if (error instanceof ApiError || error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}

export const inputClass =
  'w-full rounded-2xl border border-marron/15 bg-cream/90 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-cyan focus:ring-2 focus:ring-cyan/25 disabled:opacity-60'

const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan disabled:cursor-not-allowed disabled:opacity-60'

export const accentClass = `${buttonClass} bg-cyan text-marron shadow-soft hover:bg-cyan/85`
export const ghostClass = `${buttonClass} border border-marron/15 bg-cream text-marron hover:border-cyan/50`
export const dangerClass = `${buttonClass} bg-red/10 text-red hover:bg-red/20`

export const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.readAsDataURL(file)
  })

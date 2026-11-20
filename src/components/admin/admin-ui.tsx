import React from 'react'
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, Upload, X } from 'lucide-react'
import { api } from '../../lib/api'
import type { UploadResult } from '../../types/catalog'
import { accentClass, dangerClass, errorMessage, ghostClass, inputClass, readFileAsDataUrl } from './admin-shared'

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <section className={`rounded-4xl border border-marron/10 bg-cream p-5 shadow-soft sm:p-7 ${className}`}>
    {children}
  </section>
)

export const SectionTitle: React.FC<{
  eyebrow: string
  title: string
  description?: string
  actions?: React.ReactNode
}> = ({ eyebrow, title, description, actions }) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl font-medium tracking-editorial text-marron sm:text-3xl">
        {title}
      </h2>
      {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
)

export const ErrorBanner: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null
  return (
    <div
      role="alert"
      className="mb-5 flex items-start gap-3 rounded-2xl border border-red/20 bg-red/5 px-4 py-3 text-sm text-red"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}

export const Spinner: React.FC<{ label?: string }> = ({ label = 'Loading' }) => (
  <div className="flex items-center gap-2 text-sm text-muted" role="status">
    <Loader2 className="h-4 w-4 animate-spin text-cyan" aria-hidden="true" />
    {label}
  </div>
)

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton rounded-2xl ${className}`} aria-hidden="true" />
)

interface FieldProps {
  id: string
  label: string
  hint?: string
  children: React.ReactNode
}

export const Field: React.FC<FieldProps> = ({ id, label, hint, children }) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-xs font-semibold text-marron">
      {label}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-xs leading-relaxed text-muted">{hint}</p>}
  </div>
)

type TextFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string
  label: string
  hint?: string
}

export const TextField: React.FC<TextFieldProps> = ({ id, label, hint, className = '', ...props }) => (
  <Field id={id} label={label} hint={hint}>
    <input id={id} className={`${inputClass} ${className}`} {...props} />
  </Field>
)

type TextAreaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  id: string
  label: string
  hint?: string
}

export const TextAreaField: React.FC<TextAreaProps> = ({
  id,
  label,
  hint,
  className = '',
  rows = 4,
  ...props
}) => (
  <Field id={id} label={label} hint={hint}>
    <textarea id={id} rows={rows} className={`${inputClass} resize-y ${className}`} {...props} />
  </Field>
)

export const SelectField: React.FC<{
  id: string
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
  hint?: string
}> = ({ id, label, value, options, onChange, hint }) => (
  <Field id={id} label={label} hint={hint}>
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </Field>
)

export const ToggleField: React.FC<{
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint?: string
}> = ({ id, label, checked, onChange, hint }) => (
  <div className="rounded-2xl border border-marron/10 bg-cream/70 px-4 py-3">
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4">
      <span>
        <span className="block text-xs font-semibold text-marron">{label}</span>
        {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      </span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 shrink-0 accent-cyan"
      />
    </label>
  </div>
)

export const ArrayField: React.FC<{
  id: string
  label: string
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  hint?: string
}> = ({ id, label, value, onChange, placeholder, hint }) => {
  const serialized = value.join('\n')
  const [text, setText] = React.useState(serialized)
  const [lastSerialized, setLastSerialized] = React.useState(serialized)

  // React-recommended render-time adjustment keeps the textarea responsive
  // while typing without replacing the user's text on every parent render.
  if (serialized !== lastSerialized) {
    setLastSerialized(serialized)
    setText(serialized)
  }

  return (
    <TextAreaField
      id={id}
      label={label}
      hint={hint ?? 'One entry per line, or separate with commas.'}
      value={text}
      rows={3}
      placeholder={placeholder}
      onChange={(event) => {
        setText(event.target.value)
        onChange(
          event.target.value
            .split(/[\n,]+/)
            .map((entry) => entry.trim())
            .filter(Boolean),
        )
      }}
    />
  )
}

export const ImagePicker: React.FC<{
  id: string
  label: string
  value: string
  onChange: (url: string) => void
  onError: (message: string) => void
  disabled?: boolean
}> = ({ id, label, value, onChange, onError, disabled = false }) => {
  const fileRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await readFileAsDataUrl(file)
      const result: UploadResult = await api.uploadImage(file.name, dataUrl)
      onChange(result.url)
    } catch (error) {
      onError(errorMessage(error))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <Field id={id} label={label} hint="Paste an image path or upload a JPEG, PNG, WebP, GIF or SVG (max 5 MB).">
      <div className="space-y-3">
        <input
          id={id}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder="/products/toys/nounours/nounours_001.png"
          className={inputClass}
        />
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="sr-only"
            aria-label={`${label} file`}
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={disabled || uploading}
            className={ghostClass}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
            {uploading ? 'Uploading…' : 'Upload image'}
          </button>
          {value && (
            <span className="flex min-w-0 items-center gap-1 text-xs text-muted">
              <ImagePlus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{value}</span>
            </span>
          )}
        </div>
        {value && (
          <img
            src={value}
            alt={`${label} preview`}
            className="h-28 w-full rounded-2xl border border-marron/10 bg-sand object-cover"
          />
        )}
      </div>
    </Field>
  )
}

export const FormActions: React.FC<{
  onSubmit: () => void
  submitLabel: string
  busy?: boolean
  onCancel?: () => void
  cancelLabel?: string
}> = ({ onSubmit, submitLabel, busy = false, onCancel, cancelLabel = 'Cancel' }) => (
  <div className="flex flex-wrap gap-2 pt-2">
    <button type="button" onClick={onSubmit} disabled={busy} className={accentClass}>
      {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {submitLabel}
    </button>
    {onCancel && (
      <button type="button" onClick={onCancel} disabled={busy} className={ghostClass}>
        {cancelLabel}
      </button>
    )}
  </div>
)

export const EmptyState: React.FC<{ title: string; message: string }> = ({ title, message }) => (
  <div className="rounded-3xl border border-dashed border-marron/20 bg-cream/60 px-6 py-10 text-center">
    <p className="font-display text-lg text-marron">{title}</p>
    <p className="mt-2 text-sm text-muted">{message}</p>
  </div>
)

export const ConfirmDialog: React.FC<{
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}> = ({ open, title, message, confirmLabel = 'Delete', busy = false, onConfirm, onCancel }) => {
  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/50 p-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-4xl border border-marron/10 bg-cream p-7 shadow-lift"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 id="confirm-title" className="font-display text-xl text-marron">
            {title}
          </h3>
          <button type="button" onClick={onCancel} aria-label="Close dialog" className="text-muted hover:text-marron">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">{message}</p>
        <div className="mt-7 flex flex-wrap gap-2">
          <button type="button" onClick={onConfirm} disabled={busy} className={dangerClass}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {confirmLabel}
          </button>
          <button type="button" onClick={onCancel} disabled={busy} className={ghostClass}>
            Keep it
          </button>
        </div>
      </div>
    </div>
  )
}

export const Toast: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => (
  <div
    role="status"
    aria-live="polite"
    className="fixed bottom-6 right-6 z-[80] flex max-w-sm items-center gap-3 rounded-2xl border border-cyan/30 bg-marron px-5 py-3 text-sm text-cream shadow-lift"
  >
    <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan" aria-hidden="true" />
    <span>{message}</span>
    <button type="button" onClick={onDismiss} aria-label="Dismiss notification" className="ml-2 text-cream/70 hover:text-cream">
      <X className="h-4 w-4" aria-hidden="true" />
    </button>
  </div>
)

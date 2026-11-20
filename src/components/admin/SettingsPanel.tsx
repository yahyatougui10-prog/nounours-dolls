import React from 'react'
import { api } from '../../lib/api'
import type { StoreSettings } from '../../types/catalog'
import { Card, ErrorBanner, FormActions, SectionTitle, TextField } from './admin-ui'
import type { Mutate } from './admin-shared'

interface SettingsPanelProps {
  settings: StoreSettings
  address: string
  busy: boolean
  onMutate: Mutate
}

interface SettingsForm {
  brandName: string
  worldName: string
  tagline: string
  currency: string
  locale: string
  storeEmail: string
  instagram: string
  facebook: string
  pinterest: string
  address: string
}

const buildForm = (settings: StoreSettings, address: string): SettingsForm => ({
  brandName: settings.brandName,
  worldName: settings.worldName,
  tagline: settings.tagline,
  currency: settings.currency,
  locale: settings.locale,
  storeEmail: settings.storeEmail,
  instagram: settings.social.instagram ?? '',
  facebook: settings.social.facebook ?? '',
  pinterest: settings.social.pinterest ?? '',
  address,
})

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, address, busy, onMutate }) => {
  const [form, setForm] = React.useState<SettingsForm>(() => buildForm(settings, address))
  const [source, setSource] = React.useState({ settings, address })
  const [error, setError] = React.useState<string | null>(null)

  if (source.settings !== settings || source.address !== address) {
    setSource({ settings, address })
    setForm(buildForm(settings, address))
  }

  const set = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }))

  const submit = async () => {
    setError(null)
    if (!form.brandName.trim()) {
      setError('A brand name is required.')
      return
    }
    const addressChanged = form.address.trim() !== address.trim()
    await onMutate(async () => {
      await api.updateSettings({
        brandName: form.brandName.trim(),
        worldName: form.worldName.trim(),
        tagline: form.tagline.trim(),
        currency: form.currency.trim().toUpperCase(),
        locale: form.locale.trim(),
        storeEmail: form.storeEmail.trim(),
        social: {
          instagram: form.instagram.trim(),
          facebook: form.facebook.trim(),
          pinterest: form.pinterest.trim(),
        },
      })
      if (addressChanged) await api.updateContent({ address: form.address.trim() })
    }, 'Store settings saved')
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Boutique"
        title="Settings"
        description="Brand identity, locale and contact links stored on this server."
      />
      <ErrorBanner message={error} />

      <Card>
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField id="settings-brand" label="Brand name" value={form.brandName} onChange={(event) => set('brandName', event.target.value)} />
            <TextField id="settings-world" label="World name" value={form.worldName} onChange={(event) => set('worldName', event.target.value)} />
          </div>
          <TextField id="settings-tagline" label="Tagline" value={form.tagline} onChange={(event) => set('tagline', event.target.value)} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField id="settings-currency" label="Currency code" value={form.currency} onChange={(event) => set('currency', event.target.value)} placeholder="USD" />
            <TextField id="settings-locale" label="Locale" value={form.locale} onChange={(event) => set('locale', event.target.value)} placeholder="en-US" />
          </div>

          <div className="rounded-3xl border border-marron/10 bg-paper/60 p-4 sm:p-5">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-marron">Contact</p>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField id="settings-email" label="Store email" type="email" value={form.storeEmail} onChange={(event) => set('storeEmail', event.target.value)} />
              <TextField id="settings-address" label="Address" value={form.address} onChange={(event) => set('address', event.target.value)} />
            </div>
          </div>

          <div className="rounded-3xl border border-cyan/20 bg-cyan/5 p-4 sm:p-5">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan">Social links</p>
            <div className="grid gap-5 sm:grid-cols-3">
              <TextField id="settings-instagram" label="Instagram" type="url" value={form.instagram} onChange={(event) => set('instagram', event.target.value)} placeholder="https://…" />
              <TextField id="settings-facebook" label="Facebook" type="url" value={form.facebook} onChange={(event) => set('facebook', event.target.value)} placeholder="https://…" />
              <TextField id="settings-pinterest" label="Pinterest" type="url" value={form.pinterest} onChange={(event) => set('pinterest', event.target.value)} placeholder="https://…" />
            </div>
          </div>

          <FormActions onSubmit={() => void submit()} submitLabel="Save settings" busy={busy} />
        </div>
      </Card>
    </div>
  )
}

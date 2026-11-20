import React from 'react'
import { api } from '../../lib/api'
import type { SiteContent } from '../../types/catalog'
import { Card, ErrorBanner, FormActions, SectionTitle, TextAreaField, TextField } from './admin-ui'
import type { Mutate } from './admin-shared'

interface ContentPanelProps {
  content: SiteContent
  busy: boolean
  onMutate: Mutate
}

export const ContentPanel: React.FC<ContentPanelProps> = ({ content, busy, onMutate }) => {
  const [form, setForm] = React.useState<SiteContent>(content)
  const [source, setSource] = React.useState(content)
  const [error, setError] = React.useState<string | null>(null)

  if (source !== content) {
    setSource(content)
    setForm(content)
  }

  const set = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }))

  const submit = async () => {
    setError(null)
    const patch: SiteContent = {
      heroEyebrow: form.heroEyebrow.trim(),
      heroHeadline: form.heroHeadline.trim(),
      heroSubtitle: form.heroSubtitle.trim(),
      primaryCta: form.primaryCta.trim(),
      secondaryCta: form.secondaryCta.trim(),
      storyHeadline: form.storyHeadline.trim(),
      storyBody: form.storyBody.trim(),
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
      address: form.address.trim(),
    }

    if (!patch.heroHeadline.trim()) {
      setError('A hero headline is required.')
      return
    }

    await onMutate(() => api.updateContent(patch), 'Site content saved')
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Editorial"
        title="Site content"
        description="Headlines, story copy and contact details stored in the server's JSON file."
      />
      <ErrorBanner message={error} />

      <Card>
        <div className="space-y-6">
          <div className="rounded-3xl border border-cyan/20 bg-cyan/5 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan">Homepage hero</p>
          </div>
          <TextField id="content-eyebrow" label="Eyebrow" value={form.heroEyebrow} onChange={(event) => set('heroEyebrow', event.target.value)} />
          <TextField id="content-headline" label="Headline" value={form.heroHeadline} onChange={(event) => set('heroHeadline', event.target.value)} />
          <TextAreaField id="content-subtitle" label="Subtitle" value={form.heroSubtitle} onChange={(event) => set('heroSubtitle', event.target.value)} rows={3} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField id="content-primary-cta" label="Primary call to action" value={form.primaryCta} onChange={(event) => set('primaryCta', event.target.value)} />
            <TextField id="content-secondary-cta" label="Secondary call to action" value={form.secondaryCta} onChange={(event) => set('secondaryCta', event.target.value)} />
          </div>

          <div className="rounded-3xl border border-marron/10 bg-paper/60 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-marron">Our story</p>
          </div>
          <TextField id="content-story-headline" label="Story headline" value={form.storyHeadline} onChange={(event) => set('storyHeadline', event.target.value)} />
          <TextAreaField id="content-story-body" label="Story body" value={form.storyBody} onChange={(event) => set('storyBody', event.target.value)} rows={7} />

          <div className="rounded-3xl border border-red/15 bg-red/5 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-red">Contact details</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField id="content-email" label="Contact email" type="email" value={form.contactEmail} onChange={(event) => set('contactEmail', event.target.value)} />
            <TextField id="content-phone" label="Contact phone" value={form.contactPhone} onChange={(event) => set('contactPhone', event.target.value)} placeholder="Optional" />
          </div>
          <TextField id="content-address" label="Address" value={form.address} onChange={(event) => set('address', event.target.value)} />

          <FormActions onSubmit={() => void submit()} submitLabel="Save content" busy={busy} />
        </div>
      </Card>
    </div>
  )
}

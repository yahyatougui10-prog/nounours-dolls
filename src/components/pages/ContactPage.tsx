import React from 'react'
import { motion } from 'framer-motion'
import { Check, Heart, Mail, MapPin, MessageCircle } from 'lucide-react'
import { Badge } from '../../design-system/Badge'
import { Reveal } from '../../design-system/Reveal'
import { SectionHeading } from '../../design-system/SectionHeading'
import { Button } from '../ui/Button'
import { api } from '../../lib/api'

interface FormState {
  name: string
  email: string
  subject: string
  message: string
  errors: Record<string, string>
  isSubmitting: boolean
  isSuccess: boolean
}

const initialState: FormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
  errors: {},
  isSubmitting: false,
  isSuccess: false,
}

const inputClassName =
  'w-full rounded-2xl border border-marron/15 bg-white px-4 py-3.5 text-sm text-marron shadow-soft outline-none transition-[border-color,box-shadow] placeholder:text-muted/60 focus:border-cyan-deep focus:ring-2 focus:ring-cyan/25'

export interface ContactPageProps {
  initialSubject?: string
  content?: {
    contactEmail?: string
    contactPhone?: string
    address?: string
  }
  settings?: {
    brandName?: string
    storeEmail?: string
  }
}

export const ContactPage: React.FC<ContactPageProps> = ({
  initialSubject = '',
  content,
  settings,
}) => {
  const [state, setState] = React.useState<FormState>({
    ...initialState,
    subject: initialSubject,
  })

  const contactEmail = content?.contactEmail || settings?.storeEmail || 'hello@nooshandfriends.com'
  const contactDetails = [
    { icon: Mail, label: 'Email', value: contactEmail, href: `mailto:${contactEmail}` },
    { icon: MapPin, label: 'Location', value: content?.address || 'Paris, France' },
    ...(content?.contactPhone
      ? [{
          icon: MessageCircle,
          label: 'Phone',
          value: content.contactPhone,
          href: `tel:${content.contactPhone.replace(/[^+\d]/g, '')}`,
        }]
      : []),
  ]

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setState((previous) => ({
      ...previous,
      [name]: value,
      errors: { ...previous.errors, [name]: '', general: '' },
    }))
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!state.name.trim()) errors.name = 'Name is required'
    if (!state.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      errors.email = 'Valid email required'
    }
    if (!state.subject.trim()) errors.subject = 'Subject is required'
    if (!state.message.trim()) {
      errors.message = 'Message is required'
    } else if (state.message.length < 10) {
      errors.message = 'Message must be at least 10 characters'
    }

    setState((previous) => ({ ...previous, errors }))
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return

    setState((previous) => ({ ...previous, isSubmitting: true, errors: {} }))

    try {
      await api.sendMessage({
        name: state.name.trim(),
        email: state.email.trim(),
        subject: state.subject.trim(),
        message: state.message.trim(),
      })
      setState({ ...initialState, isSuccess: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again in a moment.'
      setState((previous) => ({
        ...previous,
        isSubmitting: false,
        errors: { general: `We couldn’t send your message. ${message}` },
      }))
    }
  }

  if (state.isSuccess) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-paper-texture px-4 pb-24 pt-32 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-lg rounded-5xl border border-marron/12 bg-cream p-8 text-center shadow-lift sm:p-12"
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-tint text-cyan-deep">
            <Check className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="font-display text-3xl font-medium text-marron">Message sent!</h1>
          <p className="mt-4 text-sm leading-[1.8] text-muted">
            Thank you for contacting {settings?.brandName || 'NOOSH & FRIENDS'}. Your message has been received by our boutique team.
          </p>
          <Button variant="accent" className="mt-8 w-full" onClick={() => setState(initialState)}>
            Send another message
          </Button>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="bg-paper-texture pb-28 pt-28 sm:pt-32" id="contact">
      <div className="page-container">
        <SectionHeading
          headingLevel="h1"
          eyebrow="Get in touch"
          title={<>Let's find your little wonder together.</>}
          description="Questions about a companion, a gift, or the perfect size? Our boutique team is here to help with care."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
          <div className="rounded-5xl border border-marron/12 bg-cream p-6 shadow-soft sm:p-9">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-2 block text-xs font-semibold text-marron">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={state.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className={inputClassName}
                    aria-invalid={Boolean(state.errors.name)}
                    aria-describedby={state.errors.name ? 'contact-name-error' : undefined}
                  />
                  {state.errors.name && <p id="contact-name-error" className="mt-1.5 text-xs text-red">{state.errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="contact-email" className="mb-2 block text-xs font-semibold text-marron">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={state.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={inputClassName}
                    aria-invalid={Boolean(state.errors.email)}
                    aria-describedby={state.errors.email ? 'contact-email-error' : undefined}
                  />
                  {state.errors.email && <p id="contact-email-error" className="mt-1.5 text-xs text-red">{state.errors.email}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="mb-2 block text-xs font-semibold text-marron">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={state.subject}
                  onChange={handleChange}
                  placeholder="Inquiry about..."
                  className={inputClassName}
                  aria-invalid={Boolean(state.errors.subject)}
                  aria-describedby={state.errors.subject ? 'contact-subject-error' : undefined}
                />
                {state.errors.subject && <p id="contact-subject-error" className="mt-1.5 text-xs text-red">{state.errors.subject}</p>}
              </div>

              <div>
                <label htmlFor="contact-message" className="mb-2 block text-xs font-semibold text-marron">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={state.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell us about your inquiry..."
                  className={`${inputClassName} resize-none`}
                  aria-invalid={Boolean(state.errors.message)}
                  aria-describedby={state.errors.message ? 'contact-message-error' : undefined}
                />
                {state.errors.message && <p id="contact-message-error" className="mt-1.5 text-xs text-red">{state.errors.message}</p>}
              </div>

              {state.errors.general && (
                <p className="rounded-2xl bg-red/8 px-4 py-3 text-sm text-red" role="alert">
                  {state.errors.general}
                </p>
              )}

              <Button type="submit" variant="accent" fullWidth disabled={state.isSubmitting}>
                {state.isSubmitting ? 'Sending…' : 'Send Message'}
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            <Reveal>
              <div className="relative overflow-hidden rounded-5xl bg-marron-deep p-7 text-cream shadow-lift ring-1 ring-white/5 sm:p-9">
                <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan/15 blur-2xl" aria-hidden="true" />
                <Heart className="mb-6 h-6 w-6 fill-cyan text-cyan" aria-hidden="true" />
                <h2 className="font-display text-[length:var(--type-subhead)] font-medium leading-[1.12] text-cream">We're here with heart.</h2>
                <p className="mt-4 text-sm leading-[1.8] text-cream/70">
                  Every message reaches a real person who knows our collection and cares about finding
                  the right little friend for you.
                </p>
                <Badge tone="cream" className="mt-7 bg-cream/10 text-cream ring-cream/20">
                  Boutique assistance
                </Badge>
              </div>
            </Reveal>

            <div className="rounded-5xl border border-marron/12 bg-cream p-6 shadow-soft sm:p-8">
              <h3 className="mb-6 font-display text-xl font-medium text-marron">Contact information</h3>
              <div className="space-y-5">
                {contactDetails.map((detail) => (
                  <div key={detail.label} className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-tint text-cyan-deep">
                      <detail.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="label-micro text-muted">
                        {detail.label}
                      </p>
                      {detail.href ? (
                        <a
                          href={detail.href}
                          target={detail.href.startsWith('http') ? '_blank' : undefined}
                          rel={detail.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="mt-1 block text-sm text-marron transition-colors hover:text-cyan"
                        >
                          {detail.value}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-marron">{detail.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

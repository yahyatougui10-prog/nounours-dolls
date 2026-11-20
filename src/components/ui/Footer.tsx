import React from 'react'
import { motion } from 'framer-motion'
import { Camera, Mail, MapPin, MessageCircle, Send, Share2 } from 'lucide-react'
import type { NavView } from './Navbar'
import { BrandMark } from '../../design-system/BrandMark'
import { NewsletterForm } from './NewsletterForm'
import { identity, social } from '../../design-system/tokens'

export interface FooterContent {
  contactEmail?: string
  address?: string
  storyHeadline?: string
}

export interface FooterSettings {
  brandName?: string
  worldName?: string
  tagline?: string
  storeEmail?: string
  social?: {
    instagram?: string
    facebook?: string
    pinterest?: string
  }
}

export interface FooterProps {
  onNavigate: (view: NavView, category?: string) => void
  content?: FooterContent
  settings?: FooterSettings
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, content, settings }) => {
  const brandName = settings?.brandName || identity.name
  const worldName = settings?.worldName || identity.world
  const contactEmail = content?.contactEmail || settings?.storeEmail || 'hello@nooshandfriends.com'
  const address = content?.address || 'Paris, France'
  const socialLinks = [
    { label: 'Instagram', icon: Camera, href: settings?.social?.instagram || social.instagram },
    { label: 'Facebook', icon: Share2, href: settings?.social?.facebook || social.facebook },
    { label: 'Pinterest', icon: Send, href: settings?.social?.pinterest || social.pinterest },
  ]

  return (
    <footer className="relative bg-cocoa text-cream">
      <span className="absolute inset-x-0 top-0 h-px bg-cyan/30" aria-hidden="true" />
      <div className="relative page-container py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_0.9fr_0.9fr_1.15fr] lg:gap-10">
          <div>
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ rotate: -8 }} transition={{ type: 'spring', stiffness: 300 }}>
                <BrandMark size={52} title={brandName} />
              </motion.div>
              <div>
                <p className="font-display text-2xl font-semibold leading-none text-cream">{brandName}</p>
                <p className="label-micro mt-2 text-cyan">
                  {worldName}
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-pretty text-sm leading-[1.8] text-cream/65">
              A boutique of handpicked teddy bears and dolls, chosen for their softness,
              craftsmanship and the stories they inspire. Made to be loved, again and again.
            </p>
            <div className="mt-7 flex gap-2">
              {socialLinks.map(({ label, icon: Icon, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3 }}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 bg-cream/5 text-cream/75 transition-colors hover:border-cyan/60 hover:bg-cyan/10 hover:text-cyan"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="label-micro mb-6 mt-3 text-cyan">
              Explore
            </h2>
            <ul className="space-y-3 text-sm text-cream/70">
              <li><button type="button" onClick={() => onNavigate('home')} className="transition-colors hover:text-cyan">Home</button></li>
              <li><button type="button" onClick={() => onNavigate('collection')} className="transition-colors hover:text-cyan">Our Collection</button></li>
              <li><button type="button" onClick={() => onNavigate('gift-studio')} className="transition-colors hover:text-cyan">The Gift Studio</button></li>
              <li><button type="button" onClick={() => onNavigate('friend-finder')} className="transition-colors hover:text-cyan">Little Friend Finder</button></li>
              <li><button type="button" onClick={() => onNavigate('wishlist')} className="transition-colors hover:text-cyan">Saved Friends</button></li>
              <li><button type="button" onClick={() => onNavigate('cart')} className="transition-colors hover:text-cyan">Your Bag</button></li>
            </ul>
          </div>

          <div>
            <h2 className="label-micro mb-6 mt-3 text-cyan">
              Discover
            </h2>
            <ul className="space-y-3 text-sm text-cream/70">
              <li><button type="button" onClick={() => onNavigate('collection', 'teddy')} className="transition-colors hover:text-cyan">Teddy Bears</button></li>
              <li><button type="button" onClick={() => onNavigate('collection', 'doll')} className="transition-colors hover:text-cyan">Beautiful Dolls</button></li>
              <li><button type="button" onClick={() => onNavigate('collection', 'gift')} className="transition-colors hover:text-cyan">Special Gifts</button></li>
              <li><button type="button" onClick={() => onNavigate('collection', 'new')} className="transition-colors hover:text-cyan">New Arrivals</button></li>
              <li><button type="button" onClick={() => onNavigate('about')} className="transition-colors hover:text-cyan">Our Story</button></li>
              <li><button type="button" onClick={() => onNavigate('gallery')} className="transition-colors hover:text-cyan">Gallery</button></li>
              <li><button type="button" onClick={() => onNavigate('contact')} className="transition-colors hover:text-cyan">Contact</button></li>
            </ul>
          </div>

          <div>
            <h2 className="label-micro mb-6 mt-3 text-cyan">
              Stay close
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-cream/65">
              Little stories, new arrivals and boutique notes — sent with care.
            </p>
            <NewsletterForm tone="dark" />

            <div className="mt-6 space-y-2 text-xs text-cream/60">
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-cyan" /> {contactEmail}</p>
              <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-cyan" /> {address}</p>
              <p className="flex items-center gap-2"><MessageCircle className="h-3.5 w-3.5 text-cyan" /> Chat with our boutique team</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="label-micro mt-5 text-cream/35 transition-colors hover:text-cyan"
            >
              Boutique admin
            </button>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream/10 pt-7 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {brandName}. Made with love.</p>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" aria-hidden="true" />
            <span>{identity.world} — {identity.line}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

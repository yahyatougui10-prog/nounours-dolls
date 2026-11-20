import React from 'react'
import { motion } from 'framer-motion'
import { Loader2, LockKeyhole, Sparkles } from 'lucide-react'
import { api } from '../../lib/api'
import { errorMessage, inputClass } from './admin-shared'

interface LoginScreenProps {
  onAuthenticated: (email: string) => void
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onAuthenticated }) => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const session = await api.login(email.trim(), password)
      onAuthenticated(session.email ?? email.trim())
      setPassword('')
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper-texture px-4 py-16 sm:px-6">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-cyan/15 blur-[110px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-52 -right-40 h-[560px] w-[560px] rounded-full bg-red/10 blur-[120px]" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg rounded-5xl border border-marron/10 bg-cream p-7 shadow-lift sm:p-11"
      >
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-marron text-cream shadow-soft">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan">The Little World</p>
            <h1 className="font-display text-2xl font-medium tracking-editorial text-marron">Boutique admin</h1>
          </div>
        </div>

        <h2 className="font-display text-3xl font-medium tracking-editorial text-marron">Welcome back.</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Sign in with the administrator credentials configured for this server to manage the boutique.
        </p>

        {error && (
          <div role="alert" className="mt-6 rounded-2xl border border-red/20 bg-red/5 px-4 py-3 text-sm text-red">
            {error}
          </div>
        )}

        <form onSubmit={(event) => void submit(event)} className="mt-7 space-y-5">
          <div>
            <label htmlFor="admin-email" className="mb-2 block text-xs font-semibold text-marron">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-2 block text-xs font-semibold text-marron">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••••••"
              className={inputClass}
            />
          </div>
          <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-marron px-6 py-3.5 text-sm font-semibold text-cream shadow-soft transition hover:bg-marron/90 disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Sign in securely
          </button>
        </form>

        <p className="mt-7 flex items-start gap-2 text-xs leading-relaxed text-muted">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan" aria-hidden="true" />
          On first run, the server prints a generated password once in its console. Sessions are
          httpOnly cookies and expire after eight hours.
        </p>
      </motion.div>
    </div>
  )
}

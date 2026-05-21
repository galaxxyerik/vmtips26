'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const origin = window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    })
    setLoading(false)
    if (error) {
      setError('Kunde inte skicka återställningsmail. Kontrollera e-postadressen.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-navy-950">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <Link href="/" className="font-display font-black text-2xl uppercase tracking-[0.06em] text-white">
              VM<span className="text-swe-yellow">-TIPS 26</span>
            </Link>
          </div>
          <div>
            <h1 className="font-display font-black text-4xl uppercase tracking-tight text-white leading-none">
              KOLLA MAILEN
            </h1>
            <div className="h-[2px] w-10 bg-swe-yellow mt-3" />
            <p className="text-white/60 text-sm mt-3 leading-relaxed">
              Vi har skickat ett återställningsmail till{' '}
              <span className="text-white">{email}</span>. Klicka på länken i
              mailet för att sätta ett nytt lösenord.
            </p>
          </div>
          <p className="text-center text-xs text-white/20">
            <Link href="/login" className="hover:text-white transition-colors">
              ← Tillbaka till inloggning
            </Link>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-navy-950">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="font-display font-black text-2xl uppercase tracking-[0.06em] text-white">
            VM<span className="text-swe-yellow">-TIPS 26</span>
          </Link>
        </div>

        <div>
          <h1 className="font-display font-black text-5xl sm:text-6xl uppercase tracking-tight text-white leading-none">
            GLÖMT LÖSEN?
          </h1>
          <div className="h-[2px] w-10 bg-swe-yellow mt-3" />
          <p className="text-white/60 text-sm mt-3 leading-relaxed">
            Ange din e-postadress så skickar vi ett återställningsmail.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label" htmlFor="email">E-post</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="din@epost.se"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {error && (
            <p className="text-sm text-loss-500 bg-loss-900/30 border border-loss-500/30 px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary w-full text-base mt-1"
            disabled={loading || !email.trim()}
          >
            {loading ? 'Skickar...' : 'SKICKA ÅTERSTÄLLNINGSMAIL →'}
          </button>
        </form>

        <p className="text-center text-xs text-white/20">
          <Link href="/login" className="hover:text-white transition-colors">
            ← Tillbaka till inloggning
          </Link>
        </p>
      </div>
    </main>
  )
}

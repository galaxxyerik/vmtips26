'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Lösenordet måste vara minst 8 tecken.'); return }
    if (password !== confirm) { setError('Lösenorden matchar inte.'); return }
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError('Kunde inte uppdatera lösenordet. Länken kan ha gått ut — försök igen från inloggningssidan.')
      return
    }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2500)
  }

  if (done) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-navy-950">
        <div className="w-full max-w-sm space-y-4 text-center">
          <p className="font-display font-black text-3xl uppercase tracking-wide text-white">
            Lösenord uppdaterat!
          </p>
          <p className="text-white/40 text-sm">Omdirigerar till tabellen...</p>
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
            NYTT LÖSEN
          </h1>
          <div className="h-[2px] w-10 bg-swe-yellow mt-3" />
          <p className="text-white/60 text-sm mt-3 leading-relaxed">
            Välj ett nytt lösenord för ditt konto.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label" htmlFor="password">Nytt lösenord</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="Minst 8 tecken..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="label" htmlFor="confirm">Bekräfta lösenord</label>
            <input
              id="confirm"
              type="password"
              className="input"
              placeholder="Upprepa lösenordet..."
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
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
            disabled={loading || !password || !confirm}
          >
            {loading ? 'Sparar...' : 'SPARA NYTT LÖSENORD →'}
          </button>
        </form>
      </div>
    </main>
  )
}

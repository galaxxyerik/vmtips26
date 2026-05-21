'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Fel e-post eller lösenord.')
      setLoading(false)
      return
    }

    const userId = data.user?.id
    if (userId) {
      const { data: submission } = await supabase
        .from('vmt_submissions')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (submission?.id) {
        router.push(`/dashboard/${submission.id}`)
        router.refresh()
        return
      }
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-navy-950">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="font-display font-black text-2xl uppercase tracking-[0.06em] text-white">
            VM<span className="text-swe-yellow">-TIPS 26</span>
          </Link>
        </div>

        {/* Heading */}
        <div>
          <h1 className="font-display font-black text-5xl sm:text-6xl uppercase tracking-tight text-white leading-none">
            LOGGA IN
          </h1>
          <div className="h-[2px] w-10 bg-swe-yellow mt-3" />
          <p className="text-white/60 text-sm mt-3 leading-relaxed">
            Skriv din e-post och ditt lösenord för att se ditt tips och tabellen.
          </p>
        </div>

        {/* Form */}
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

          <div>
            <label className="label" htmlFor="password">Lösenord</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-loss-500 bg-loss-900/30 border border-loss-500/30 px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full text-base mt-1" disabled={loading}>
            {loading ? 'Loggar in...' : 'LOGGA IN →'}
          </button>
        </form>

        <p className="text-xs text-white/30 leading-relaxed text-center">
          Konto skapas automatiskt om du fyllde i lösenord när du skickade in tipset.
        </p>

        <p className="text-center text-xs text-white/20">
          <Link href="/" className="hover:text-white transition-colors">← Tillbaka till startsidan</Link>
        </p>
      </div>
    </main>
  )
}

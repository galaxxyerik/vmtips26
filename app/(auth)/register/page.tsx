'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password.length < 8) {
      setError('Lösenordet måste vara minst 8 tecken.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error) {
      setError(error.message === 'User already registered'
        ? 'E-postadressen är redan registrerad.'
        : 'Något gick fel. Försök igen.'
      )
      setLoading(false)
      return
    }

    // Update name in users table via the trigger (name comes from raw_user_meta_data)
    router.push('/onboarding/group-stage')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <Link href="/" className="text-2xl font-bold">
            VM<span className="text-gradient">-tips 26</span>
          </Link>
          <p className="text-gray-400 text-sm mt-2">Skapa ditt konto och börja tippa</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label" htmlFor="name">Namn</label>
            <input
              id="name"
              type="text"
              className="input"
              placeholder="Förnamn Efternamn"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

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
              placeholder="Minst 8 tecken"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Skapar konto...' : 'Skapa konto'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Har du redan ett konto?{' '}
          <Link href="/login" className="text-pitch-400 hover:text-pitch-300 font-medium">
            Logga in
          </Link>
        </p>
      </div>
    </main>
  )
}

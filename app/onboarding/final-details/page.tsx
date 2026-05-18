'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadDraft, clearDraft } from '@/lib/onboarding-storage'

export default function FinalDetailsPage() {
  const router = useRouter()
  const [tournamentScorer, setTournamentScorer] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [swishChecked, setSwishChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const d = loadDraft()
    setTournamentScorer(d.tournamentScorer || '')
    setName(d.name || '')
    setEmail(d.email || '')
    // Validate previous steps
    if (Object.keys(d.bracketPicks).length === 0) {
      router.push('/onboarding/bracket')
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!swishChecked) { setError('Du måste bekräfta Swish-betalningen.'); return }
    if (!name.trim() || !email.trim()) { setError('Namn och e-post krävs.'); return }
    setSubmitting(true)
    setError(null)

    const draft = loadDraft()

    const res = await fetch('/api/submit-picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password: password || null,
        tournamentScorer: tournamentScorer.trim(),
        matchPicks: draft.matchPicks,
        groupTableOrder: draft.groupTableOrder,
        thirdPlaceSelected: draft.thirdPlaceSelected,
        groupScorers: draft.groupScorers,
        bracketPicks: draft.bracketPicks,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Något gick fel. Försök igen.')
      setSubmitting(false)
      return
    }

    clearDraft()
    router.push('/onboarding/success')
  }

  const canSubmit = name.trim() && email.trim() && swishChecked && !submitting

  return (
    <div className="mx-auto max-w-lg px-3 py-6 pb-12">
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Steg 3 av 3 · Detaljer</div>
        <h1 className="text-xl font-bold">Sista detaljer</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tournament scorer */}
        <div className="border border-surface-600 p-3">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Skyttekung i hela VM
          </label>
          <input
            type="text"
            value={tournamentScorer}
            onChange={e => setTournamentScorer(e.target.value)}
            placeholder="Spelarens namn..."
            className="w-full bg-surface-800 border border-surface-600 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-yellow-500"
          />
          <p className="text-xs text-gray-600 mt-1">Rätt svar ger 5 bonuspoäng</p>
        </div>

        {/* Name & email */}
        <div className="border border-surface-600 p-3 space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ditt namn</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder="Förnamn Efternamn"
              className="w-full bg-surface-800 border border-surface-600 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-yellow-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Din e-post</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="din@epost.se"
              className="w-full bg-surface-800 border border-surface-600 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-yellow-500" />
          </div>
        </div>

        {/* Optional password */}
        <div className="border border-surface-600 border-dashed p-3">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            Lösenord <span className="text-gray-600 font-normal normal-case">(valfritt — för att följa ditt tips i realtid)</span>
          </label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Minst 8 tecken..."
            minLength={8}
            className="w-full bg-surface-800 border border-surface-600 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-yellow-500" />
          <p className="text-xs text-gray-600 mt-1">Om du fyller i lösenord skapas ett konto automatiskt.</p>
        </div>

        {/* Swish box */}
        <div className="border border-yellow-800 bg-yellow-900/10 p-4">
          <div className="text-center mb-3">
            <div className="text-xs text-yellow-600 uppercase tracking-wider mb-1">Betalning</div>
            <div className="text-lg font-bold text-yellow-400">100 kr via Swish</div>
            <div className="text-sm text-yellow-300">Erik Engstrand · 0768919007</div>
          </div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={swishChecked} onChange={e => setSwishChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-yellow-500 flex-shrink-0" />
            <span className="text-xs text-gray-400">
              Jag förstår att mitt deltagande är bindande när jag har swishat 100 kr till Erik Engstrand (0768919007). Jag är med i spelet när Erik bekräftat betalningen.
            </span>
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 px-3 py-2">{error}</p>
        )}

        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => router.push('/onboarding/bracket')}
            className="text-xs text-gray-500 hover:text-white px-3 py-2">← Tillbaka</button>
          <button type="submit" disabled={!canSubmit}
            className={`px-8 py-2.5 text-sm font-bold border transition-colors ${
              canSubmit
                ? 'bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-400'
                : 'bg-surface-700 text-gray-600 border-surface-600 cursor-not-allowed'
            }`}>
            {submitting ? 'Skickar in...' : 'Skicka in mitt tips →'}
          </button>
        </div>
      </form>
    </div>
  )
}

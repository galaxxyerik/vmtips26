'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadDraft, saveDraft, clearDraft } from '@/lib/onboarding-storage'
import NavBar from '@/components/NavBar'

export default function FinalDetailsPage() {
  const router = useRouter()
  const [tournamentScorer, setTournamentScorer] = useState('')
  const [password, setPassword] = useState('')
  const [swishChecked, setSwishChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const d = loadDraft()
    setTournamentScorer(d.tournamentScorer || '')
    if (Object.keys(d.bracketPicks).length === 0) {
      router.push('/onboarding/bracket')
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!swishChecked) { setError('Du måste bekräfta Swish-betalningen.'); return }
    setSubmitting(true)
    setError(null)

    const draft = loadDraft()

    if (!draft.name || !draft.email) {
      setError('Namn eller e-post saknas — gå tillbaka till startsidan.')
      setSubmitting(false)
      return
    }

    const res = await fetch('/api/submit-picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: draft.name,
        email: draft.email,
        password: password || null,
        submissionId: draft.submissionId ?? null,
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
    router.push('/dashboard?submitted=true')
  }

  const canSubmit = swishChecked && !submitting

  return (
    <div>
    <NavBar />
    <div className="mx-auto max-w-lg px-3 py-6 pb-12">
      <div className="mb-6">
        <div className="label">Steg 3 av 3 · Detaljer</div>
        <h1 className="font-display font-black text-2xl uppercase tracking-wide text-white">Sista detaljer</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        {/* Tournament scorer */}
        <div className="card">
          <label className="label">Skyttekung i hela VM</label>
          <input
            id="tournament-scorer"
            name="tournament-scorer"
            type="text"
            value={tournamentScorer}
            onChange={e => setTournamentScorer(e.target.value)}
            placeholder="Spelarens namn..."
            className="input"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            onBlur={e => {
              const trimmed = e.target.value.trim()
              setTournamentScorer(trimmed)
              const d = loadDraft()
              d.tournamentScorer = trimmed
              saveDraft(d)
            }}
          />
          <p className="text-xs text-white/30 mt-2">Rätt svar ger 5 bonuspoäng</p>
        </div>

        {/* Optional password */}
        <div className="border border-dashed border-white/10 p-4">
          <label className="label">
            Lösenord <span className="text-white/25 font-normal normal-case tracking-normal">(valfritt — för att följa ditt tips i realtid)</span>
          </label>
          <input
            id="new-password"
            name="new-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minst 8 tecken..."
            minLength={8}
            className="input"
            autoComplete="new-password"
          />
          <p className="text-xs text-white/30 mt-2">Om du fyller i lösenord skapas ett konto automatiskt.</p>
        </div>

        {/* Swish box */}
        <div className="border border-swe-yellow/30 bg-swe-yellow/5 p-4 space-y-3">
          <div>
            <div className="label text-swe-yellow/70">Betalning</div>
            <div className="font-display font-black text-2xl uppercase text-swe-yellow tracking-wide">100 kr via Swish</div>
            <div className="text-sm text-white/50 mt-1">Erik Engstrand · 0768919007</div>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">
            Swisha 100 kr till <span className="text-white/70 font-medium">0768919007</span> med meddelandet <span className="text-white/70 font-medium">VM-tips 2026</span>.
          </p>
          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={swishChecked}
              onChange={e => setSwishChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-swe-yellow flex-shrink-0"
            />
            <span className="text-xs text-white/45 leading-relaxed">
              Jag har swishat 100 kr till Erik Engstrand (0768919007). Jag förstår att mitt deltagande är bindande och att jag är med i spelet när Erik bekräftat betalningen.
            </span>
          </label>
        </div>

        {error && (
          <p className="text-sm text-loss-500 bg-loss-900/30 border border-loss-500/30 px-3 py-2">{error}</p>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.push('/onboarding/bracket')}
            className="text-xs text-white/35 hover:text-white px-3 py-2 transition-colors"
          >
            ← Tillbaka
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={canSubmit ? 'btn-primary' : 'btn-primary opacity-40 cursor-not-allowed'}
          >
            {submitting ? 'Skickar in...' : 'Skicka in mitt tips →'}
          </button>
        </div>
      </form>
    </div>
    </div>
  )
}

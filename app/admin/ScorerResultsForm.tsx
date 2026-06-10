'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GROUPS } from '@/lib/types'

export default function ScorerResultsForm({
  initialGroupScorers,
  initialTournamentScorer,
}: {
  initialGroupScorers: Record<string, string>
  initialTournamentScorer: string
}) {
  const router = useRouter()
  const [groupScorers, setGroupScorers] = useState(initialGroupScorers)
  const [tournamentScorer, setTournamentScorer] = useState(initialTournamentScorer)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch('/api/admin/scorer-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupScorers, tournamentScorer }),
      })
      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(body.error ?? 'Kunde inte spara skyttarna.')
        return
      }

      setMessage('Sparat. Kör poängräkning för att ge bonuspoäng.')
      router.refresh()
    } catch {
      setError('Nätverksfel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="label" htmlFor="tournament-scorer">Turneringsskyttekung</label>
        <input
          id="tournament-scorer"
          value={tournamentScorer}
          onChange={event => setTournamentScorer(event.target.value)}
          className="input"
          placeholder="Spelarnamn"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {GROUPS.map(group => (
          <div key={group}>
            <label className="label" htmlFor={`group-scorer-${group}`}>Grupp {group}</label>
            <input
              id={`group-scorer-${group}`}
              value={groupScorers[group] ?? ''}
              onChange={event => setGroupScorers(current => ({ ...current, [group]: event.target.value }))}
              className="input"
              placeholder="Spelarnamn"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={loading} className="btn-secondary">
          {loading ? 'Sparar...' : 'Spara skyttekungar'}
        </button>
        {message && <span className="text-xs text-pitch-400">{message}</span>}
        {error && <span className="text-xs text-loss-500">{error}</span>}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

function formatSyncTime(value: string | null) {
  if (!value) return 'Aldrig'
  return new Date(value).toLocaleString('sv-SE')
}

export default function AdminSyncButtons({
  lastMatchSync,
  lastPlayerSync,
}: {
  lastMatchSync: string | null
  lastPlayerSync: string | null
}) {
  const [loading, setLoading] = useState<'matches' | 'players' | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function runSync(kind: 'matches' | 'players') {
    setLoading(kind)
    setMessage(null)
    try {
      const res = await fetch(kind === 'matches' ? '/api/cron/sync-matches' : '/api/players/sync', {
        method: 'POST',
      })
      const json = await res.json()
      setMessage(json.ok ? 'Synken är klar.' : (json.error ?? 'Synken misslyckades.'))
    } catch {
      setMessage('Synken misslyckades.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="border border-white/10">
      <div className="px-4 py-3 border-b border-white/10 bg-navy-900">
        <div className="label">Synka nu</div>
      </div>
      <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
        <div className="space-y-3">
          <div>
            <div className="font-display font-black uppercase tracking-wide text-white text-sm">Matchresultat</div>
            <div className="text-xs text-white/35">Senast synkad: {formatSyncTime(lastMatchSync)}</div>
          </div>
          <button
            onClick={() => runSync('matches')}
            disabled={loading !== null}
            className="btn-primary h-9 px-4 text-sm disabled:opacity-40"
          >
            {loading === 'matches' ? 'Synkar...' : 'Synka matchresultat'}
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <div className="font-display font-black uppercase tracking-wide text-white text-sm">Spelarstatistik</div>
            <div className="text-xs text-white/35">Senast synkad: {formatSyncTime(lastPlayerSync)}</div>
          </div>
          <button
            onClick={() => runSync('players')}
            disabled={loading !== null}
            className="btn-secondary h-9 px-4 text-sm disabled:opacity-40"
          >
            {loading === 'players' ? 'Synkar...' : 'Synka spelarstatistik'}
          </button>
        </div>
        {message && (
          <div className="sm:col-span-2 border border-white/10 bg-navy-900 px-3 py-2 text-xs text-white/60">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

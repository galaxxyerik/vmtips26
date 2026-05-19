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
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  async function runSync(kind: 'matches' | 'players') {
    setLoading(kind)
    setResult(null)
    try {
      const res = await fetch(kind === 'matches' ? '/api/cron/sync-matches' : '/api/players/sync', {
        method: 'POST',
      })
      const json = await res.json()
      if (json.ok) {
        setResult({ ok: true, message: json.message ?? 'Synken är klar.' })
      } else {
        setResult({ ok: false, message: json.error ?? 'Synken misslyckades.' })
      }
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : 'Nätverksfel – kontrollera att du är inloggad.' })
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
        {result && (
          <div className={`sm:col-span-2 border px-3 py-2 text-sm font-medium ${result.ok ? 'border-green-500/40 bg-green-900/20 text-green-300' : 'border-red-500/40 bg-red-900/20 text-red-300'}`}>
            {result.message}
          </div>
        )}
      </div>
    </div>
  )
}

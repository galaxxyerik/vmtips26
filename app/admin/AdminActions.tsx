'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ToggleConfirmButton({ submissionId, confirmed }: { submissionId: string; confirmed: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/toggle-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, confirmed: !confirmed }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Fel')
      } else {
        router.refresh()
      }
    } catch {
      setError('Nätverksfel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <button
        onClick={toggle}
        disabled={loading}
        className={`px-3 py-1 text-xs font-display font-black uppercase tracking-wider border transition-colors disabled:opacity-40 ${
          confirmed
            ? 'border-white/20 text-white/40 hover:border-loss-500/50 hover:text-loss-500'
            : 'border-swe-yellow/40 text-swe-yellow hover:bg-swe-yellow hover:text-navy-950'
        }`}
      >
        {loading ? '...' : confirmed ? 'Avbekräfta' : 'Bekräfta'}
      </button>
      {error && <span className="text-[10px] text-loss-500">{error}</span>}
    </div>
  )
}

export function DeleteButton({ submissionId, name }: { submissionId: string; name: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function del() {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/delete-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Fel')
        setLoading(false)
      } else {
        router.refresh()
      }
    } catch {
      setError('Nätverksfel')
      setLoading(false)
    }
  }

  if (confirming) {
    return (
      <span className="flex flex-col items-end gap-0.5">
        <span className="flex items-center gap-2">
          <span className="text-xs text-white/50">Radera {name}?</span>
          <button
            onClick={del}
            disabled={loading}
            className="px-2 py-1 text-xs font-display font-black uppercase border border-loss-500/60 text-loss-500 hover:bg-loss-500 hover:text-white disabled:opacity-40"
          >
            {loading ? '...' : 'Ja'}
          </button>
          <button
            onClick={() => { setConfirming(false); setError(null) }}
            disabled={loading}
            className="px-2 py-1 text-xs font-display font-black uppercase border border-white/20 text-white/40 hover:text-white disabled:opacity-40"
          >
            Nej
          </button>
        </span>
        {error && <span className="text-[10px] text-loss-500">{error}</span>}
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-2 py-1 text-xs font-display font-black uppercase border border-white/10 text-white/25 hover:border-loss-500/50 hover:text-loss-500 transition-colors"
    >
      Radera
    </button>
  )
}

'use client'

import { useState } from 'react'

export default function SetupAdminButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function run() {
    setLoading(true)
    setResult(null)
    const res = await fetch('/api/setup-admin', { method: 'POST' })
    const json = await res.json()
    setResult(json.message ?? json.error ?? 'OK')
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={run}
        disabled={loading}
        className="btn-secondary text-sm px-4 h-9 disabled:opacity-40"
      >
        {loading ? '...' : 'Kör setup-admin'}
      </button>
      {result && <span className="text-xs text-white/50">{result}</span>}
    </div>
  )
}

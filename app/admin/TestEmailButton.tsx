'use client'

import { useState } from 'react'

export default function TestEmailButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function run() {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/test-email', { method: 'POST' })
      const json = await res.json()
      setResult(json.ok ? 'Testmail skickat.' : (json.error ?? 'Något gick fel.'))
    } catch {
      setResult('Kunde inte skicka testmail.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={run}
        disabled={loading}
        className="btn-secondary text-sm px-4 h-9 disabled:opacity-40"
      >
        {loading ? 'Skickar...' : 'Skicka testmail'}
      </button>
      {result && <span className="text-xs text-white/50">{result}</span>}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminConfirmButton({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function confirm() {
    setLoading(true)
    await fetch('/api/admin/confirm-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={confirm}
      disabled={loading}
      className="rounded-lg bg-pitch-700 hover:bg-pitch-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50"
    >
      {loading ? '...' : 'Bekräfta'}
    </button>
  )
}

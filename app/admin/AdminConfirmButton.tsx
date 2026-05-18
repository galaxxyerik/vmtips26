'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminConfirmButton({ submissionId }: { submissionId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function confirm() {
    setLoading(true)
    await fetch('/api/admin/confirm-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <button onClick={confirm} disabled={loading}
      className="px-3 py-1 text-xs font-bold border border-yellow-700 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-colors disabled:opacity-40">
      {loading ? '...' : 'Bekräfta'}
    </button>
  )
}

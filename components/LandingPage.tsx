'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { hasDraft, getDraftStep, getDraftTimestamp, clearDraft, loadDraft, saveDraft } from '@/lib/onboarding-storage'
import { ONBOARDING_KEY } from '@/lib/types'

const STEP_PATHS: Record<string, string> = {
  'group-stage': '/onboarding/group-stage',
  'bracket': '/onboarding/bracket',
  'final-details': '/onboarding/final-details',
}

function getStoredField(field: 'name' | 'email'): string {
  if (typeof window === 'undefined') return ''
  try { return (JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '{}') as Record<string, string>)[field] ?? '' }
  catch { return '' }
}

export default function LandingPage() {
  const router = useRouter()
  const [name, setName] = useState<string>(() => getStoredField('name'))
  const [email, setEmail] = useState<string>(() => getStoredField('email'))
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [resumePath, setResumePath] = useState('/onboarding/group-stage')
  const [draftTime, setDraftTime] = useState<string | null>(null)

  function handleStart(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) { setError('Namn och e-post krävs.'); return }
    setError('')

    const d = loadDraft()
    d.name = name.trim()
    d.email = email.trim()
    saveDraft(d)

    if (hasDraft()) {
      const step = getDraftStep()
      setResumePath(STEP_PATHS[step] ?? '/onboarding/group-stage')
      setDraftTime(getDraftTimestamp())
      setShowModal(true)
    } else {
      router.push('/onboarding/group-stage')
    }
  }

  function handleResume() {
    setShowModal(false)
    router.push(resumePath)
  }

  function handleRestart() {
    const savedName = name.trim()
    const savedEmail = email.trim()
    clearDraft()
    const d = loadDraft()
    d.name = savedName
    d.email = savedEmail
    saveDraft(d)
    setShowModal(false)
    router.push('/onboarding/group-stage')
  }

  const canStart = name.trim().length > 0 && email.trim().length > 0

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm border border-surface-600 bg-surface-900 p-6 space-y-4">
            <h2 className="font-bold text-white">Du har ett påbörjat tips</h2>
            {draftTime && (
              <p className="text-xs text-gray-500">
                Senast ändrat: {new Date(draftTime).toLocaleString('sv-SE')}
              </p>
            )}
            <div className="flex gap-2">
              <button onClick={handleResume}
                className="flex-1 py-2 bg-yellow-500 text-black text-sm font-bold hover:bg-yellow-400 transition-colors">
                Fortsätt →
              </button>
              <button onClick={handleRestart}
                className="flex-1 py-2 border border-surface-600 text-gray-400 text-sm hover:text-white hover:border-surface-400 transition-colors">
                Börja om
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-2">
            VM<span className="text-yellow-400">-tips 26</span>
          </h1>
          <p className="text-gray-400">Tippa VM 2026 med dina vänner</p>
        </div>

        <form onSubmit={handleStart} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ditt namn</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Förnamn Efternamn"
              autoComplete="name"
              className="w-full bg-surface-800 border border-surface-600 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-yellow-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Din e-post</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="din@epost.se"
              autoComplete="email"
              className="w-full bg-surface-800 border border-surface-600 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-yellow-500"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={!canStart}
            className={`w-full py-3 text-base font-bold transition-colors ${
              canStart
                ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                : 'bg-surface-700 text-gray-600 cursor-not-allowed'
            }`}>
            ⚽ Börja tippa!
          </button>
        </form>

        <div className="flex justify-center gap-6 text-xs text-gray-600">
          <Link href="/dashboard" className="hover:text-white transition-colors">🏆 Se tabellen</Link>
          <Link href="/regler" className="hover:text-white transition-colors">📋 Regler</Link>
          <Link href="/login" className="hover:text-white transition-colors">🔑 Logga in</Link>
        </div>
        <p className="text-center text-xs text-gray-600">Insats: 100 kr · Deadline: 11 juni 2026</p>
      </div>
    </main>
  )
}

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
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-navy-950">
      {/* Resume modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm border border-white/15 bg-navy-900 p-6 space-y-4">
            <div className="label">Påbörjat tips</div>
            <h2 className="font-display font-black text-white text-xl uppercase tracking-wide">
              Vill du fortsätta?
            </h2>
            {draftTime && (
              <p className="text-xs text-white/35 tnum">
                Senast ändrat: {new Date(draftTime).toLocaleString('sv-SE')}
              </p>
            )}
            <div className="flex gap-2 pt-1">
              <button onClick={handleResume} className="btn-primary flex-1">
                Fortsätt →
              </button>
              <button onClick={handleRestart} className="btn-secondary flex-1">
                Börja om
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md w-full space-y-8">
        {/* Hero wordmark */}
        <div className="text-center">
          <h1 className="font-display font-black text-5xl uppercase tracking-[0.04em] text-white leading-none">
            VM<span className="text-swe-yellow">-TIPS</span>
            <span className="block text-3xl text-white/40 mt-1">2026</span>
          </h1>
          <p className="text-white/45 text-sm mt-3">Tippa VM 2026 med dina vänner</p>
        </div>

        {/* Entry form */}
        <form onSubmit={handleStart} className="space-y-3">
          <div>
            <label className="label">Ditt namn</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Förnamn Efternamn"
              autoComplete="name"
              className="input"
            />
          </div>
          <div>
            <label className="label">Din e-post</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="din@epost.se"
              autoComplete="email"
              className="input"
            />
          </div>
          {error && <p className="text-xs text-loss-500">{error}</p>}
          <button type="submit" disabled={!canStart} className="btn-primary w-full mt-1">
            Börja tippa →
          </button>
        </form>

        {/* Footer links */}
        <div className="flex justify-center gap-6 text-xs text-white/30">
          <Link href="/dashboard" className="hover:text-white transition-colors uppercase tracking-wider font-display font-black">Tabell</Link>
          <Link href="/regler" className="hover:text-white transition-colors uppercase tracking-wider font-display font-black">Regler</Link>
          <Link href="/login" className="hover:text-white transition-colors uppercase tracking-wider font-display font-black">Logga in</Link>
        </div>
        <p className="text-center text-xs text-white/20 tnum">Insats: 100 kr · Deadline: 11 juni 2026</p>
      </div>
    </main>
  )
}

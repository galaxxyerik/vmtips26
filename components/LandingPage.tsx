'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { hasDraft, getDraftStep, getDraftTimestamp, clearDraft } from '@/lib/onboarding-storage'

const STEP_PATHS: Record<string, string> = {
  'group-stage': '/onboarding/group-stage',
  'bracket': '/onboarding/bracket',
  'final-details': '/onboarding/final-details',
}

export default function LandingPage() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [resumePath, setResumePath] = useState('/onboarding/group-stage')
  const [draftTime, setDraftTime] = useState<string | null>(null)

  function handleStartGame() {
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
    clearDraft()
    setShowModal(false)
    router.push('/onboarding/group-stage')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {/* Resume modal */}
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

      <div className="max-w-lg w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-black mb-2">
            VM<span className="text-yellow-400">-tips 26</span>
          </h1>
          <p className="text-gray-400">Tippa VM 2026 med dina vänner</p>
        </div>

        <div className="space-y-3">
          <button onClick={handleStartGame}
            className="w-full py-3 bg-yellow-500 text-black font-bold text-base hover:bg-yellow-400 transition-colors">
            ⚽ Påbörja ditt tips
          </button>
          <Link href="/worldcup-guide"
            className="block w-full py-2.5 border border-surface-600 text-gray-400 text-sm hover:text-white hover:border-surface-400 transition-colors">
            📖 Läs mer om lagen och spelarna
          </Link>
          <Link href="/dashboard"
            className="block w-full py-2.5 border border-surface-600 text-gray-400 text-sm hover:text-white hover:border-surface-400 transition-colors">
            🏆 Se tabellen
          </Link>
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <p>Insats: 100 kr · Deadline: 11 juni 2026</p>
          <Link href="/regler" className="text-gray-500 hover:text-white underline">Läs reglerna</Link>
          {' · '}
          <Link href="/login" className="text-gray-500 hover:text-white underline">Logga in</Link>
        </div>
      </div>
    </main>
  )
}

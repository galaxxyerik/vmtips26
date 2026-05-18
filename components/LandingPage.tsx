'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getDraftResumePath, getDraftTimestamp, clearOnboarding } from '@/lib/onboarding-storage'

export default function LandingPage() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [resumePath, setResumePath] = useState<string | null>(null)
  const [draftTime, setDraftTime] = useState<string | null>(null)

  function handleStartGame() {
    const path = getDraftResumePath()
    if (path) {
      const ts = getDraftTimestamp()
      setResumePath(path)
      setDraftTime(ts)
      setShowModal(true)
    } else {
      router.push('/onboarding/group-stage')
    }
  }

  function handleContinue() {
    setShowModal(false)
    if (resumePath) router.push(resumePath)
  }

  function handleStartFresh() {
    clearOnboarding()
    setShowModal(false)
    router.push('/onboarding/group-stage')
  }

  function formatDraftTime(iso: string | null): string {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleString('sv-SE', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const stepLabels: Record<string, string> = {
    'group-stage': 'Gruppspel',
    'third-place': 'Tredjeplacerade',
    'bracket': 'Slutspel',
    'top-scorers': 'Skytteligor',
    'confirm': 'Bekräfta',
  }

  const stepFromPath = resumePath
    ? Object.entries({
        '/onboarding/group-stage': 'group-stage',
        '/onboarding/third-place': 'third-place',
        '/onboarding/bracket': 'bracket',
        '/onboarding/top-scorers': 'top-scorers',
        '/onboarding/confirm': 'confirm',
      }).find(([path]) => path === resumePath)?.[1]
    : null

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-8">
          {/* Logo / Hero */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-5xl">⚽</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              VM<span className="text-gradient">-tips 26</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Tippa VM 2026 och tävla mot dina vänner
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: '🏆', label: 'Gruppspel', desc: '72 matcher' },
              { icon: '⚡', label: 'Slutspel', desc: 'Hela trädet' },
              { icon: '🥅', label: 'Skytteligor', desc: 'Grupp + turnering' },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="card py-4">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-sm font-semibold text-gray-200">{label}</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
            ))}
          </div>

          {/* Main CTAs */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleStartGame}
              className="btn-primary text-base py-3 w-full"
            >
              ⚽ Påbörja ditt spel
            </button>
            <Link href="/worldcup-guide" className="btn-secondary text-base py-3 w-full">
              📖 Läs mer om lagen och spelarna
            </Link>
          </div>

          {/* Auth links */}
          <div className="flex gap-3 justify-center">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Logga in
            </Link>
            <span className="text-gray-700">·</span>
            <Link href="/register" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Skapa konto
            </Link>
          </div>

          {/* Payment note */}
          <p className="text-xs text-gray-600">
            Anmälningsavgift: 100 kr via Swish · Bekräftas av Erik
          </p>
        </div>
      </main>

      {/* Resume Draft Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="card w-full max-w-sm border-surface-500 shadow-2xl space-y-5">
            {/* Header */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Du har ett påbörjat tips</h2>
              <p className="text-sm text-gray-400">
                {draftTime && `Senast sparad ${formatDraftTime(draftTime)}`}
                {stepFromPath && (
                  <span className="ml-1 badge-yellow">
                    {stepLabels[stepFromPath] ?? stepFromPath}
                  </span>
                )}
              </p>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed">
              Vill du fortsätta där du slutade eller börja om från början?
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleContinue}
                className="btn-primary w-full py-3"
              >
                Fortsätt →
              </button>
              <button
                onClick={handleStartFresh}
                className="btn-secondary w-full py-2.5 text-sm"
              >
                Börja om från början
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

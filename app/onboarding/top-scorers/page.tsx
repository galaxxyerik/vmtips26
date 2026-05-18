'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadOnboarding, saveOnboarding, setStep } from '@/lib/onboarding-storage'
import { GROUPS } from '@/lib/types'

const TOURNAMENT_SCOPE = 'tournament'

export default function TopScorersPage() {
  const router = useRouter()
  const [scorerPicks, setScorerPicks] = useState<Record<string, string>>({})

  useEffect(() => {
    setStep('top-scorers')
    const state = loadOnboarding()
    setScorerPicks(state.topScorerPicks ?? {})
  }, [])

  function handleChange(scope: string, value: string) {
    setScorerPicks(prev => {
      const next = { ...prev, [scope]: value }
      const state = loadOnboarding()
      state.topScorerPicks = next
      saveOnboarding(state)
      return next
    })
  }

  const allScopes = [...GROUPS.map(g => `group_${g}`), TOURNAMENT_SCOPE]
  const filledCount = allScopes.filter(s => scorerPicks[s]?.trim()).length
  const allFilled = filledCount === allScopes.length

  function handleNext() {
    router.push('/onboarding/confirm')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
      {/* Header */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-medium">
          <span>Steg 4 av 5</span>
          <span>·</span>
          <span>Skytteligor</span>
        </div>
        <h1 className="text-2xl font-bold">Tippa skytteligor</h1>
        <p className="text-gray-400 text-sm">
          Ange skyttekungen i varje grupp och för hela turneringen. Alla fält är frivilliga.
        </p>
        <div className="flex items-center gap-2">
          <div className={`text-sm font-semibold ${allFilled ? 'text-pitch-400' : 'text-gray-300'}`}>
            {filledCount}/{allScopes.length} ifyllda
          </div>
          <div className="flex-1 h-1.5 bg-surface-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-pitch-600 rounded-full transition-all duration-300"
              style={{ width: `${(filledCount / allScopes.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tournament scorer */}
      <div className="mb-6">
        <div className="card border-pitch-800 bg-pitch-900/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🏆</span>
            <span className="font-semibold text-pitch-300">Turnerings­skyttekung</span>
            <span className="badge-green ml-auto">5 poäng</span>
          </div>
          <input
            type="text"
            className="input"
            placeholder="Spelarens namn..."
            value={scorerPicks[TOURNAMENT_SCOPE] ?? ''}
            onChange={e => handleChange(TOURNAMENT_SCOPE, e.target.value)}
          />
        </div>
      </div>

      {/* Per-group scorers */}
      <h2 className="text-base font-semibold text-gray-300 mb-3 flex items-center gap-2">
        Skyttekung per grupp
        <span className="badge-gray">3 poäng styck</span>
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {GROUPS.map(group => {
          const scope = `group_${group}`
          return (
            <div key={group} className="card py-3">
              <label className="label text-xs text-gray-500 mb-1.5">
                Grupp {group}
              </label>
              <input
                type="text"
                className="input text-sm"
                placeholder="Spelarens namn..."
                value={scorerPicks[scope] ?? ''}
                onChange={e => handleChange(scope, e.target.value)}
              />
            </div>
          )
        })}
      </div>

      {/* Fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-surface-700 bg-surface-900/95 backdrop-blur px-4 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between gap-4">
          <button onClick={() => router.push('/onboarding/bracket')} className="btn-ghost">
            ← Tillbaka
          </button>
          <button onClick={handleNext} className="btn-primary px-8">
            Nästa: Granska & bekräfta →
          </button>
        </div>
      </div>
    </div>
  )
}

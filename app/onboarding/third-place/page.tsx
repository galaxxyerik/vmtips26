'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadOnboarding, saveOnboarding } from '@/lib/onboarding-storage'
import type { GroupLabel } from '@/lib/types'
import { GROUPS } from '@/lib/types'

const REQUIRED = 8

export default function ThirdPlacePage() {
  const router = useRouter()
  const [thirdTeams, setThirdTeams] = useState<Partial<Record<GroupLabel, string>>>({})
  const [selected, setSelected] = useState<GroupLabel[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const state = loadOnboarding()
    if (!state.thirdPlaceGroups || Object.keys(state.thirdPlaceGroups).length === 0) {
      // No third-place data — user came here directly, go back
      router.push('/onboarding/group-stage')
      return
    }
    setThirdTeams(state.thirdPlaceGroups)
    setSelected(state.advancingThirdGroups ?? [])
  }, [])

  function toggle(group: GroupLabel) {
    setError(null)
    setSelected(prev => {
      if (prev.includes(group)) return prev.filter(g => g !== group)
      if (prev.length >= REQUIRED) {
        setError(`Du kan bara välja ${REQUIRED} lag. Avmarkera ett för att välja ett annat.`)
        return prev
      }
      return [...prev, group]
    })
  }

  function handleNext() {
    if (selected.length !== REQUIRED) {
      setError(`Du måste välja exakt ${REQUIRED} lag. Du har valt ${selected.length}.`)
      return
    }
    const state = loadOnboarding()
    state.advancingThirdGroups = selected
    saveOnboarding(state)
    router.push('/onboarding/bracket')
  }

  // Groups that have a derived 3rd-place team
  const availableGroups = GROUPS.filter(g => thirdTeams[g])

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
      {/* Header */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-medium">
          <span>Steg 2 av 5</span>
          <span>·</span>
          <span>Tredjeplacerade</span>
        </div>
        <h1 className="text-2xl font-bold">Välj 8 tredjeplacerade</h1>
        <p className="text-gray-400 text-sm">
          Dessa lag har placerats trea i sina respektive grupper enligt dina tips.
          Välj exakt 8 som du tror går vidare till slutspelet.
        </p>
        <div className="flex items-center gap-2">
          <div className={`text-sm font-semibold ${selected.length === REQUIRED ? 'text-pitch-400' : 'text-gray-300'}`}>
            {selected.length}/{REQUIRED} valda
          </div>
          <div className="flex-1 h-1.5 bg-surface-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-pitch-600 rounded-full transition-all duration-300"
              style={{ width: `${(selected.length / REQUIRED) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of 3rd place teams */}
      {availableGroups.length < 12 ? (
        <div className="card text-center py-8 space-y-2">
          <p className="text-2xl">⚠️</p>
          <p className="text-gray-300 font-semibold">Ofullständiga tips</p>
          <p className="text-gray-500 text-sm">
            Du behöver tippa alla gruppspelets matcher innan du kan gå vidare.
          </p>
          <button onClick={() => router.push('/onboarding/group-stage')} className="btn-secondary mt-2">
            ← Tillbaka till gruppspel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {availableGroups.map(group => {
            const team = thirdTeams[group]!
            const isSelected = selected.includes(group)
            return (
              <button
                key={group}
                onClick={() => toggle(group)}
                className={`relative rounded-xl border-2 p-4 text-left transition-all focus:outline-none ${
                  isSelected
                    ? 'border-pitch-500 bg-pitch-900/30'
                    : 'border-surface-600 bg-surface-800 hover:border-surface-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">Grupp {group} · 3:a</div>
                    <div className="font-semibold text-sm text-gray-100 leading-tight">{team}</div>
                  </div>
                  <div className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-pitch-500 bg-pitch-500' : 'border-surface-500'
                  }`}>
                    {isSelected && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-surface-700 bg-surface-900/95 backdrop-blur px-4 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between gap-4">
          <button
            onClick={() => router.push('/onboarding/group-stage')}
            className="btn-ghost"
          >
            ← Tillbaka
          </button>
          <button
            onClick={handleNext}
            disabled={selected.length !== REQUIRED}
            className="btn-primary px-8"
          >
            Nästa: Slutspel →
          </button>
        </div>
      </div>
    </div>
  )
}

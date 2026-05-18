'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadOnboarding, clearOnboarding } from '@/lib/onboarding-storage'
import { createClient } from '@/lib/supabase/client'
import type { OnboardingState } from '@/lib/types'
import { GROUPS } from '@/lib/types'

export default function ConfirmPage() {
  const router = useRouter()
  const supabase = createClient()
  const [state, setState] = useState<OnboardingState | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [groupMatchCount, setGroupMatchCount] = useState(0)

  useEffect(() => {
    const s = loadOnboarding()
    setState(s)
    setGroupMatchCount(Object.keys(s.groupPicks).length)
  }, [])

  async function handleSubmit() {
    if (!state) return
    setSubmitting(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const res = await fetch('/api/submit-picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupPicks: state.groupPicks,
        thirdPlaceGroups: state.thirdPlaceGroups,
        advancingThirdGroups: state.advancingThirdGroups,
        bracketPicks: state.bracketPicks,
        topScorerPicks: state.topScorerPicks,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Något gick fel. Försök igen.')
      setSubmitting(false)
      return
    }

    clearOnboarding()
    router.push('/dashboard')
  }

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-400">Laddar...</div>
      </div>
    )
  }

  const topScorerScopes = [...GROUPS.map(g => `group_${g}`), 'tournament']

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-medium">
          <span>Steg 5 av 5</span>
          <span>·</span>
          <span>Bekräfta</span>
        </div>
        <h1 className="text-2xl font-bold">Granska dina tips</h1>
        <p className="text-gray-400 text-sm">
          Kontrollera att allt stämmer innan du skickar in. Du kan inte ändra efteråt.
        </p>
      </div>

      {/* Summary cards */}
      <div className="space-y-4 mb-6">
        {/* Group stage */}
        <SummaryCard title="Gruppspel" icon="⚽" count={`${groupMatchCount} matcher tippade`} />

        {/* Third place */}
        <div className="card">
          <h3 className="font-semibold text-sm text-gray-300 mb-3 flex items-center gap-2">
            <span>🔄</span> Tredjeplacerade som går vidare (8 st)
          </h3>
          <div className="flex flex-wrap gap-2">
            {(state.advancingThirdGroups ?? []).map(g => (
              <span key={g} className="badge-green">
                Grupp {g}: {state.thirdPlaceGroups?.[g] ?? '?'}
              </span>
            ))}
            {(state.advancingThirdGroups?.length ?? 0) === 0 && (
              <span className="text-sm text-red-400">Inga val gjorda</span>
            )}
          </div>
        </div>

        {/* Bracket picks (winner only) */}
        <div className="card">
          <h3 className="font-semibold text-sm text-gray-300 mb-3 flex items-center gap-2">
            <span>🏆</span> Mästare
          </h3>
          {state.bracketPicks?.[103] ? (
            <p className="text-pitch-300 font-bold text-lg">{state.bracketPicks[103]}</p>
          ) : (
            <p className="text-sm text-yellow-400">Ingen mästare vald — gå tillbaka till slutspelet</p>
          )}
          <p className="text-xs text-gray-600 mt-1">
            {Object.keys(state.bracketPicks ?? {}).length} matchresultat i slutspelet
          </p>
        </div>

        {/* Top scorers */}
        <div className="card">
          <h3 className="font-semibold text-sm text-gray-300 mb-3 flex items-center gap-2">
            <span>👟</span> Skytteligor
          </h3>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Turnerings­skyttekung</span>
              <span className="text-gray-200 font-medium">
                {state.topScorerPicks?.tournament || <span className="text-gray-600">–</span>}
              </span>
            </div>
            {GROUPS.map(g => (
              <div key={g} className="flex justify-between text-sm">
                <span className="text-gray-500">Grupp {g}</span>
                <span className="text-gray-200 font-medium">
                  {state.topScorerPicks?.[`group_${g}`] || <span className="text-gray-600">–</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Swish payment instruction */}
      <div className="card border-yellow-800 bg-yellow-900/10 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💸</span>
          <div>
            <h3 className="font-semibold text-yellow-300 mb-1">Betalning via Swish</h3>
            <p className="text-sm text-yellow-200/80 leading-relaxed">
              Swisha <strong>100 kr</strong> till{' '}
              <strong>Erik Engstrand (0768919007)</strong>.{' '}
              Du är med när Erik bekräftat din betalning.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-surface-700 bg-surface-900/95 backdrop-blur px-4 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between gap-4">
          <button onClick={() => router.push('/onboarding/top-scorers')} className="btn-ghost" disabled={submitting}>
            ← Tillbaka
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary px-8 bg-pitch-600 hover:bg-pitch-500"
          >
            {submitting ? 'Skickar in...' : '✓ Skicka in mina tips'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ title, icon, count }: { title: string; icon: string; count: string }) {
  return (
    <div className="card flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="font-semibold text-sm text-gray-200">{title}</div>
        <div className="text-xs text-gray-500">{count}</div>
      </div>
    </div>
  )
}

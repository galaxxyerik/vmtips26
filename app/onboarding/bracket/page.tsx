'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadOnboarding, saveOnboarding, setStep } from '@/lib/onboarding-storage'
import { buildR32Bracket, type R32Match } from '@/lib/bracket-logic'
import type { GroupLabel } from '@/lib/types'
import { GROUPS } from '@/lib/types'

interface KnockoutMatch {
  matchNumber: number
  label: string
  team1: string
  team2: string
  phase: 'r32' | 'r16' | 'qf' | 'sf' | 'final'
}

const PHASE_LABELS: Record<string, string> = {
  r32: 'Omgång 32',
  r16: 'Omgång 16',
  qf: 'Kvartsfinal',
  sf: 'Semifinal',
  final: 'Final',
}

export default function BracketPage() {
  const router = useRouter()
  const [r32Matches, setR32Matches] = useState<R32Match[] | null>(null)
  const [bracketPicks, setBracketPicks] = useState<Record<number, string>>({})
  const [allMatches, setAllMatches] = useState<KnockoutMatch[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setStep('bracket')
    const state = loadOnboarding()
    const {
      groupPicks,
      thirdPlaceGroups,
      advancingThirdGroups,
    } = state

    if (!advancingThirdGroups || advancingThirdGroups.length !== 8) {
      router.push('/onboarding/third-place')
      return
    }

    setBracketPicks(state.bracketPicks ?? {})

    // Build group winner/runner-up from picks
    const groupWinners = {} as Record<GroupLabel, string>
    const groupRunnersUp = {} as Record<GroupLabel, string>
    const thirdPlaceTeams = thirdPlaceGroups as Partial<Record<GroupLabel, string>>

    // We compute winners/runners-up by team points from picks
    // (simplified: user doesn't explicitly pick winners — we derive from the match results)
    // For the bracket, we use placeholder team names based on group label
    for (const g of GROUPS) {
      groupWinners[g] = `Etta Grupp ${g}`
      groupRunnersUp[g] = `Tvåa Grupp ${g}`
    }

    // Try to build from actual match data if we have it in localStorage
    const r32 = buildR32Bracket(
      groupWinners,
      groupRunnersUp,
      thirdPlaceTeams as Record<GroupLabel, string>,
      advancingThirdGroups as GroupLabel[]
    )

    if (!r32) {
      setError('Kunde inte bygga slutspelsbracket. Kontrollera dina tredjeplaceringsval.')
      return
    }

    setR32Matches(r32)

    // Build the full bracket chain
    const initial: KnockoutMatch[] = r32.map(m => ({
      matchNumber: m.matchNumber,
      label: `M${m.matchNumber}`,
      team1: m.team1,
      team2: m.team2,
      phase: 'r32',
    }))
    setAllMatches(initial)
  }, [])

  // Resolve bracket forward from r32 picks
  useEffect(() => {
    if (!r32Matches) return
    rebuildBracket(bracketPicks)
  }, [r32Matches, bracketPicks])

  function rebuildBracket(picks: Record<number, string>) {
    if (!r32Matches) return

    const r32: KnockoutMatch[] = r32Matches.map(m => ({
      matchNumber: m.matchNumber,
      label: `M${m.matchNumber}`,
      team1: m.team1,
      team2: m.team2,
      phase: 'r32',
    }))

    // Winners of r32 (match numbers 73-88) → r16 matches (89-96)
    // Pairings from FIFA Art. 12.7: M89=W73 vs W74, M90=W75 vs W76 etc.
    const r32Winners = (r32Matches ?? []).map(m => picks[m.matchNumber] ?? `Vinnare M${m.matchNumber}`)

    // R32 match order: 73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88
    const w = (idx: number) => r32Winners[idx] ?? `Vinnare R32 match ${idx + 1}`

    const r16: KnockoutMatch[] = [
      { matchNumber: 89, label: 'M89', team1: w(0), team2: w(1), phase: 'r16' },
      { matchNumber: 90, label: 'M90', team1: w(2), team2: w(3), phase: 'r16' },
      { matchNumber: 91, label: 'M91', team1: w(4), team2: w(5), phase: 'r16' },
      { matchNumber: 92, label: 'M92', team1: w(6), team2: w(7), phase: 'r16' },
      { matchNumber: 93, label: 'M93', team1: w(8), team2: w(9), phase: 'r16' },
      { matchNumber: 94, label: 'M94', team1: w(10), team2: w(11), phase: 'r16' },
      { matchNumber: 95, label: 'M95', team1: w(12), team2: w(13), phase: 'r16' },
      { matchNumber: 96, label: 'M96', team1: w(14), team2: w(15), phase: 'r16' },
    ]

    const r16w = r16.map(m => picks[m.matchNumber] ?? `Vinnare ${m.label}`)
    const qf: KnockoutMatch[] = [
      { matchNumber: 97, label: 'QF1', team1: r16w[0], team2: r16w[1], phase: 'qf' },
      { matchNumber: 98, label: 'QF2', team1: r16w[2], team2: r16w[3], phase: 'qf' },
      { matchNumber: 99, label: 'QF3', team1: r16w[4], team2: r16w[5], phase: 'qf' },
      { matchNumber: 100, label: 'QF4', team1: r16w[6], team2: r16w[7], phase: 'qf' },
    ]

    const qfw = qf.map(m => picks[m.matchNumber] ?? `Vinnare ${m.label}`)
    const sf: KnockoutMatch[] = [
      { matchNumber: 101, label: 'SF1', team1: qfw[0], team2: qfw[1], phase: 'sf' },
      { matchNumber: 102, label: 'SF2', team1: qfw[2], team2: qfw[3], phase: 'sf' },
    ]

    const sfw = sf.map(m => picks[m.matchNumber] ?? `Vinnare ${m.label}`)
    const final: KnockoutMatch[] = [
      { matchNumber: 103, label: 'Final', team1: sfw[0], team2: sfw[1], phase: 'final' },
    ]

    setAllMatches([...r32, ...r16, ...qf, ...sf, ...final])
  }

  function handlePick(matchNumber: number, team: string) {
    setBracketPicks(prev => {
      const next = { ...prev, [matchNumber]: team }
      // Invalidate downstream picks if team changes
      const state = loadOnboarding()
      state.bracketPicks = next
      saveOnboarding(state)
      return next
    })
  }

  function handleNext() {
    const total = allMatches.length
    const picked = allMatches.filter(m => bracketPicks[m.matchNumber]).length
    if (picked < total) {
      setError(`Du har ${total - picked} matcher kvar att tippa i slutspelet.`)
      return
    }
    router.push('/onboarding/top-scorers')
  }

  const phases: Array<KnockoutMatch['phase']> = ['r32', 'r16', 'qf', 'sf', 'final']
  const pickedCount = allMatches.filter(m => bracketPicks[m.matchNumber]).length
  const totalCount = allMatches.length

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card max-w-md text-center space-y-4">
          <p className="text-red-400">{error}</p>
          <button onClick={() => router.push('/onboarding/third-place')} className="btn-secondary">
            ← Tillbaka
          </button>
        </div>
      </div>
    )
  }

  if (allMatches.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-400">Bygger bracket...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
      {/* Header */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-medium">
          <span>Steg 3 av 5</span>
          <span>·</span>
          <span>Slutspel</span>
        </div>
        <h1 className="text-2xl font-bold">Tippa slutspelet</h1>
        <p className="text-gray-400 text-sm">
          Välj vinnare i varje match. Trädet byggs ut automatiskt baserat på dina val.
        </p>
        <div className="flex items-center gap-2">
          <div className={`text-sm font-semibold ${pickedCount === totalCount ? 'text-pitch-400' : 'text-gray-300'}`}>
            {pickedCount}/{totalCount} tippade
          </div>
          <div className="flex-1 h-1.5 bg-surface-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-pitch-600 rounded-full transition-all duration-300"
              style={{ width: `${totalCount ? (pickedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bracket by phase */}
      {phases.map(phase => {
        const phaseMatches = allMatches.filter(m => m.phase === phase)
        if (phaseMatches.length === 0) return null
        return (
          <div key={phase} className="mb-8">
            <h2 className="text-base font-semibold text-gray-300 mb-3 flex items-center gap-2">
              {PHASE_LABELS[phase]}
              <span className="badge-gray">{phaseMatches.length} matcher</span>
            </h2>
            <div className="space-y-3">
              {phaseMatches.map(match => (
                <BracketMatchCard
                  key={match.matchNumber}
                  match={match}
                  pick={bracketPicks[match.matchNumber] ?? null}
                  onPick={team => handlePick(match.matchNumber, team)}
                />
              ))}
            </div>
          </div>
        )
      })}

      {error && (
        <p className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-surface-700 bg-surface-900/95 backdrop-blur px-4 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between gap-4">
          <button onClick={() => router.push('/onboarding/third-place')} className="btn-ghost">
            ← Tillbaka
          </button>
          <button onClick={handleNext} className="btn-primary px-8">
            Nästa: Skytteliga →
          </button>
        </div>
      </div>
    </div>
  )
}

function BracketMatchCard({
  match,
  pick,
  onPick,
}: {
  match: KnockoutMatch
  pick: string | null
  onPick: (team: string) => void
}) {
  const teams = [match.team1, match.team2]
  const isPlaceholder = (t: string) => t.startsWith('Vinnare') || t.startsWith('Etta') || t.startsWith('Tvåa')

  return (
    <div className={`card transition-all ${pick ? 'border-surface-500' : ''}`}>
      <div className="flex items-center gap-1 mb-2">
        <span className="text-xs text-gray-600 font-mono">{match.label}</span>
        {pick && (
          <span className="badge-green ml-auto">{pick}</span>
        )}
      </div>
      <div className="flex gap-2">
        {teams.map(team => (
          <button
            key={team}
            onClick={() => !isPlaceholder(team) && onPick(team)}
            disabled={isPlaceholder(team)}
            className={`flex-1 rounded-lg border py-2.5 px-2 text-sm font-semibold transition-all text-center ${
              isPlaceholder(team)
                ? 'border-surface-600 bg-surface-800 text-gray-600 cursor-not-allowed'
                : pick === team
                ? 'border-pitch-500 bg-pitch-900/40 text-pitch-300'
                : 'border-surface-500 bg-surface-700 text-gray-300 hover:border-surface-400 hover:text-white'
            }`}
          >
            {team}
          </button>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadDraft, saveDraft, setStep } from '@/lib/onboarding-storage'
import { buildR32Bracket, type R32Match } from '@/lib/bracket-logic'
import type { GroupLabel, OnboardingDraft } from '@/lib/types'
import { GROUPS } from '@/lib/types'

interface KnockoutMatch {
  matchNumber: number
  label: string
  team1: string
  team2: string
  round: 'r32' | 'r16' | 'qf' | 'sf' | 'bronze' | 'final'
}

const ROUND_LABELS: Record<string, string> = {
  r32: 'Omgång 32', r16: 'Åttondelsfinaler', qf: 'Kvartsfinaler',
  sf: 'Semifinaler', bronze: 'Bronsmatch', final: 'Final',
}

export default function BracketPage() {
  const router = useRouter()
  const [draft, setDraft] = useState<OnboardingDraft | null>(null)
  const [allMatches, setAllMatches] = useState<KnockoutMatch[]>([])
  const [r32Base, setR32Base] = useState<R32Match[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setStep('bracket')
    const d = loadDraft()
    setDraft(d)

    // Validate step 1 complete
    if (d.thirdPlaceSelected.length !== 8) {
      router.push('/onboarding/group-stage')
      return
    }

    // Build group winners/runners-up from table order
    const groupWinners: Record<GroupLabel, string> = {} as Record<GroupLabel, string>
    const groupRunnersUp: Record<GroupLabel, string> = {} as Record<GroupLabel, string>
    const thirdPlaceTeams: Partial<Record<GroupLabel, string>> = {}

    for (const g of GROUPS) {
      const order = d.groupTableOrder[g] ?? []
      groupWinners[g] = order[0] ?? `Etta grupp ${g}`
      groupRunnersUp[g] = order[1] ?? `Tvåa grupp ${g}`
      thirdPlaceTeams[g] = order[2] ?? `Trea grupp ${g}`
    }

    const r32 = buildR32Bracket(
      groupWinners,
      groupRunnersUp,
      thirdPlaceTeams as Record<GroupLabel, string>,
      d.thirdPlaceSelected as GroupLabel[]
    )

    if (!r32) {
      setError('Kunde inte bygga slutspelsbracket. Gå tillbaka och kontrollera dina tredjeplatsval.')
      return
    }

    setR32Base(r32)
  }, [])

  useEffect(() => {
    if (!r32Base || !draft) return
    rebuildAllMatches(r32Base, draft.bracketPicks)
  }, [r32Base, draft?.bracketPicks])

  function rebuildAllMatches(r32: R32Match[], picks: Record<number, string>) {
    const r32m: KnockoutMatch[] = r32.map(m => ({
      matchNumber: m.matchNumber,
      label: `M${m.matchNumber}`,
      team1: m.team1,
      team2: m.team2,
      round: 'r32',
    }))

    const w = (mn: number) => picks[mn] ?? `Vinnare M${mn}`

    const r32Nums = r32.map(m => m.matchNumber) // 73-88
    const r16m: KnockoutMatch[] = [
      { matchNumber: 89, label: 'M89', team1: w(r32Nums[0]), team2: w(r32Nums[1]), round: 'r16' },
      { matchNumber: 90, label: 'M90', team1: w(r32Nums[2]), team2: w(r32Nums[3]), round: 'r16' },
      { matchNumber: 91, label: 'M91', team1: w(r32Nums[4]), team2: w(r32Nums[5]), round: 'r16' },
      { matchNumber: 92, label: 'M92', team1: w(r32Nums[6]), team2: w(r32Nums[7]), round: 'r16' },
      { matchNumber: 93, label: 'M93', team1: w(r32Nums[8]), team2: w(r32Nums[9]), round: 'r16' },
      { matchNumber: 94, label: 'M94', team1: w(r32Nums[10]), team2: w(r32Nums[11]), round: 'r16' },
      { matchNumber: 95, label: 'M95', team1: w(r32Nums[12]), team2: w(r32Nums[13]), round: 'r16' },
      { matchNumber: 96, label: 'M96', team1: w(r32Nums[14]), team2: w(r32Nums[15]), round: 'r16' },
    ]

    const r16w = r16m.map(m => picks[m.matchNumber] ?? `Vinnare ${m.label}`)
    const qfm: KnockoutMatch[] = [
      { matchNumber: 97, label: 'QF1', team1: r16w[0], team2: r16w[1], round: 'qf' },
      { matchNumber: 98, label: 'QF2', team1: r16w[2], team2: r16w[3], round: 'qf' },
      { matchNumber: 99, label: 'QF3', team1: r16w[4], team2: r16w[5], round: 'qf' },
      { matchNumber: 100, label: 'QF4', team1: r16w[6], team2: r16w[7], round: 'qf' },
    ]

    const qfw = qfm.map(m => picks[m.matchNumber] ?? `Vinnare ${m.label}`)
    const sfm: KnockoutMatch[] = [
      { matchNumber: 101, label: 'SF1', team1: qfw[0], team2: qfw[1], round: 'sf' },
      { matchNumber: 102, label: 'SF2', team1: qfw[2], team2: qfw[3], round: 'sf' },
    ]

    const sfw = sfm.map(m => picks[m.matchNumber] ?? `Vinnare ${m.label}`)
    const bronzeM: KnockoutMatch = {
      matchNumber: 103, label: 'Bronsmatch',
      team1: `Förlorare ${sfm[0].label}`, team2: `Förlorare ${sfm[1].label}`,
      round: 'bronze',
    }
    const finalM: KnockoutMatch = {
      matchNumber: 104, label: 'Final',
      team1: sfw[0], team2: sfw[1],
      round: 'final',
    }

    setAllMatches([...r32m, ...r16m, ...qfm, ...sfm, bronzeM, finalM])
  }

  function handlePick(matchNumber: number, team: string) {
    if (!draft) return
    const prevPick = draft.bracketPicks[matchNumber]
    if (prevPick === team) return

    // Clear downstream picks if team changes
    const nextPicks = { ...draft.bracketPicks, [matchNumber]: team }
    if (prevPick) {
      // Remove any downstream picks that had the old team
      for (const [key, val] of Object.entries(nextPicks)) {
        if (val === prevPick) delete nextPicks[Number(key)]
      }
    }

    const nextDraft = { ...draft, bracketPicks: nextPicks }
    setDraft(nextDraft)
    saveDraft(nextDraft)
  }

  if (error) return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-sm text-center space-y-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={() => router.push('/onboarding/group-stage')} className="px-4 py-2 border border-surface-600 text-sm text-gray-300 hover:text-white">← Tillbaka</button>
      </div>
    </div>
  )

  if (!draft || allMatches.length === 0) return (
    <div className="flex min-h-screen items-center justify-center text-gray-400 text-sm">Bygger bracket...</div>
  )

  const picks = draft.bracketPicks
  const nonBronzeMatches = allMatches.filter(m => m.round !== 'bronze')
  const pickedKnockout = nonBronzeMatches.filter(m => picks[m.matchNumber]).length
  const canProceed = nonBronzeMatches.every(m => !!picks[m.matchNumber])

  const rounds: KnockoutMatch['round'][] = ['r32', 'r16', 'qf', 'sf', 'bronze', 'final']

  return (
    <div className="mx-auto max-w-2xl px-3 py-4 pb-24">
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Steg 2 av 3 · Slutspel</div>
        <h1 className="text-xl font-bold mb-2">Tippa slutspelet</h1>
        <div className="flex items-center gap-2 text-xs">
          <span className={canProceed ? 'text-yellow-400 font-bold' : 'text-gray-400'}>
            {pickedKnockout}/{nonBronzeMatches.length} matcher
          </span>
          <div className="flex-1 h-1 bg-surface-700">
            <div className="h-full bg-yellow-500 transition-all"
              style={{ width: `${nonBronzeMatches.length ? pickedKnockout/nonBronzeMatches.length*100 : 0}%` }} />
          </div>
        </div>
      </div>

      {rounds.map(round => {
        const roundMatches = allMatches.filter(m => m.round === round)
        if (roundMatches.length === 0) return null
        return (
          <div key={round} className="mb-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              {ROUND_LABELS[round]}
              <span className="text-gray-700">{roundMatches.length} matcher</span>
            </h2>
            <div className="border border-surface-600 divide-y divide-surface-700">
              {roundMatches.map(m => (
                <BracketMatchRow
                  key={m.matchNumber}
                  match={m}
                  pick={picks[m.matchNumber] ?? null}
                  onPick={team => handlePick(m.matchNumber, team)}
                />
              ))}
            </div>
          </div>
        )
      })}

      <div className="fixed bottom-0 left-0 right-0 border-t border-surface-700 bg-surface-900/95 backdrop-blur px-3 py-3">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <button onClick={() => router.push('/onboarding/group-stage')} className="text-xs text-gray-500 hover:text-white px-3 py-2">← Tillbaka</button>
          <button onClick={() => canProceed && router.push('/onboarding/final-details')}
            disabled={!canProceed}
            className={`px-6 py-2 text-sm font-bold border transition-colors ${
              canProceed ? 'bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-400' : 'bg-surface-700 text-gray-600 border-surface-600 cursor-not-allowed'
            }`}>
            Nästa: Detaljer →
          </button>
        </div>
      </div>
    </div>
  )
}

function BracketMatchRow({ match, pick, onPick }: { match: KnockoutMatch; pick: string | null; onPick: (t: string) => void }) {
  const isPlaceholder = (t: string) => t.startsWith('Vinnare') || t.startsWith('Förlorare') || t.startsWith('Etta') || t.startsWith('Tvåa')

  return (
    <div className="flex items-center px-2 py-1.5 gap-1 bg-surface-800/30 hover:bg-surface-800/50">
      <span className="text-xs text-gray-700 font-mono w-8 flex-shrink-0">{match.label}</span>
      <div className="flex-1 flex gap-1">
        {[match.team1, match.team2].map(team => (
          <button key={team} onClick={() => !isPlaceholder(team) && onPick(team)}
            disabled={isPlaceholder(team)}
            className={`flex-1 py-1.5 px-1 text-xs font-medium border text-center transition-colors ${
              isPlaceholder(team)
                ? 'border-surface-700 text-gray-700 bg-surface-800 cursor-not-allowed'
                : pick === team
                ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                : 'border-surface-600 text-gray-400 hover:text-white hover:border-surface-400'
            }`}>
            {team}
          </button>
        ))}
      </div>
      {pick && !isPlaceholder(match.team1) && !isPlaceholder(match.team2) && (
        <span className="text-xs text-yellow-500 w-4 flex-shrink-0">✓</span>
      )}
    </div>
  )
}

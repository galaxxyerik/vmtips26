'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { loadDraft, saveDraft, setStep } from '@/lib/onboarding-storage'
import { buildR32Bracket, sanitizeBracketPicks, type R32Match } from '@/lib/bracket-logic'
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
  r32: 'Sextondelsfinal', r16: 'Åttondelsfinaler', qf: 'Kvartsfinaler',
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

    // Validate step 1 complete
    if (d.thirdPlaceSelected.length !== 8) {
      setDraft(d)
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
      setDraft(d)
      setError('Kunde inte bygga slutspelsbracket. Gå tillbaka och kontrollera dina tredjeplatsval.')
      return
    }

    // Self-heal stale drafts: older drafts can carry bracket picks keyed to
    // outdated match numbers (the repeated-remap bug fixed June 9). Drop any
    // pick that is impossible given the current bracket — the user simply
    // re-picks those slots instead of submitting corrupt data.
    const cleaned = sanitizeBracketPicks(d.bracketPicks, r32)
    if (Object.keys(cleaned).length !== Object.keys(d.bracketPicks).length) {
      const healed = { ...d, bracketPicks: cleaned }
      saveDraft(healed)
      setDraft(healed)
    } else {
      setDraft(d)
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
    const loserOf = (match: KnockoutMatch) => {
      const winner = picks[match.matchNumber]
      if (winner === match.team1) return match.team2
      if (winner === match.team2) return match.team1
      return `Förlorare ${match.label}`
    }

    const bronzeM: KnockoutMatch = {
      matchNumber: 103, label: 'Bronsmatch',
      team1: loserOf(sfm[0]), team2: loserOf(sfm[1]),
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
    const nextPicks = { ...draft.bracketPicks }

    if (prevPick === team) {
      // Toggle off: clear this pick and all downstream occurrences of the team
      delete nextPicks[matchNumber]
    } else {
      nextPicks[matchNumber] = team
    }

    // Clear the old team from downstream matches only (higher match numbers)
    if (prevPick) {
      for (const [key, val] of Object.entries(nextPicks)) {
        if (val === prevPick && Number(key) > matchNumber) {
          delete nextPicks[Number(key)]
        }
      }
    }

    const nextDraft = { ...draft, bracketPicks: nextPicks }
    setDraft(nextDraft)
    saveDraft(nextDraft)
  }

  if (error) return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-sm text-center space-y-4">
        <p className="text-loss-500 text-sm">{error}</p>
        <button onClick={() => router.push('/onboarding/group-stage')} className="btn-secondary">← Tillbaka</button>
      </div>
    </div>
  )

  if (!draft || allMatches.length === 0) return (
    <div className="flex min-h-screen items-center justify-center text-white/35 text-sm">Bygger bracket...</div>
  )

  const picks = draft.bracketPicks
  const pickedKnockout = allMatches.filter(m => picks[m.matchNumber]).length
  const canProceed = allMatches.every(m => !!picks[m.matchNumber])

  const rounds: KnockoutMatch['round'][] = ['r32', 'r16', 'qf', 'sf', 'bronze', 'final']
  const nonBronzeMatches = allMatches.filter(m => m.round !== 'bronze')

  return (
    <div className="mx-auto max-w-2xl px-3 py-4 pb-24">
      <div className="relative overflow-hidden mb-5 border border-white/10">
        <Image
          src="/images/metlife-stadium.jpg"
          alt="MetLife Stadium i New Jersey — VM-finalens arena"
          fill
          sizes="100vw"
          className="object-cover object-center z-0"
        />
        <div className="absolute inset-0 bg-navy-950/80 z-[1]" />
        <div className="relative z-10 flex items-center gap-4 px-4 py-4">
          <Image
            src="/images/wc-trophy.jpg"
            alt="VM-pokalen FIFA World Cup 2026"
            width={48}
            height={64}
            className="object-cover object-center flex-shrink-0 drop-shadow-lg rounded-sm"
          />
          <div className="flex-1 min-w-0">
            <div className="label">Steg 2 av 3 · Slutspel</div>
            <h1 className="font-display font-black text-2xl uppercase tracking-wide text-white leading-tight">Tippa slutspelet</h1>
            <p className="text-[11px] text-swe-yellow/60 mt-0.5 italic">Det här är målet.</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className={`font-display font-black text-xl tnum ${canProceed ? 'text-swe-yellow' : 'text-white/30'}`}>
              {pickedKnockout}<span className="text-white/20 text-sm">/{allMatches.length}</span>
            </div>
            <div className="text-[9px] text-white/30 uppercase tracking-wider">matcher</div>
          </div>
        </div>
        <div className="relative z-10 h-0.5 bg-white/10">
          <div
            className="h-full bg-swe-yellow transition-all"
            style={{ width: `${nonBronzeMatches.length ? (pickedKnockout / nonBronzeMatches.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {rounds.map(round => {
        const roundMatches = allMatches.filter(m => m.round === round)
        if (roundMatches.length === 0) return null
        return (
          <div key={round} className="mb-6">
            <h2 className="font-display font-black text-xs uppercase tracking-wider text-white/40 mb-2 flex items-center gap-2">
              {ROUND_LABELS[round]}
              <span className="text-white/20 font-normal">{roundMatches.length} matcher</span>
            </h2>
            <div className="border border-white/10 divide-y divide-white/5">
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

      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-navy-950/95 backdrop-blur px-3 py-3">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <button onClick={() => router.push('/onboarding/group-stage')} className="text-xs text-white/35 hover:text-white px-3 py-2 transition-colors">← Tillbaka</button>
          <button
            onClick={() => canProceed && router.push('/onboarding/final-details')}
            disabled={!canProceed}
            className={canProceed ? 'btn-primary' : 'btn-primary opacity-40 cursor-not-allowed'}
          >
            Nästa: Detaljer →
          </button>
        </div>
      </div>
    </div>
  )
}

function BracketMatchRow({ match, pick, onPick }: { match: KnockoutMatch; pick: string | null; onPick: (t: string) => void }) {
  const isPlaceholder = (t: string) =>
    t.startsWith('Vinnare') || t.startsWith('Etta') || t.startsWith('Tvåa') || t.startsWith('Förlorare')
  const effectivePick =
    match.round === 'bronze' && pick === 'Förlorare SF1' ? match.team1
    : match.round === 'bronze' && pick === 'Förlorare SF2' ? match.team2
    : pick

  return (
    <div className="flex items-center px-2 py-1.5 gap-1 bg-navy-900/30 hover:bg-navy-900/60 transition-colors">
      <span className="text-xs text-white/20 font-mono w-8 flex-shrink-0 tnum">{match.label}</span>
      <div className="flex-1 flex gap-1">
        {[match.team1, match.team2].map(team => (
          <button key={team} onClick={() => !isPlaceholder(team) && onPick(team)}
            disabled={isPlaceholder(team)}
            title={effectivePick === team ? 'Klicka för att avmarkera' : undefined}
            className={`flex-1 py-1.5 px-1 text-xs font-medium border text-center transition-colors ${
              isPlaceholder(team)
                ? 'border-white/5 text-white/15 bg-navy-900/30 cursor-not-allowed'
                : effectivePick === team
                ? 'border-swe-yellow bg-swe-yellow/10 text-swe-yellow hover:bg-loss-900/20 hover:border-loss-500/40'
                : 'border-white/10 text-white/50 hover:text-white hover:border-white/30'
            }`}>
            {team}
          </button>
        ))}
      </div>
      {pick && !isPlaceholder(match.team1) && !isPlaceholder(match.team2) && (
        <span className="text-xs text-swe-yellow w-4 flex-shrink-0">✓</span>
      )}
    </div>
  )
}

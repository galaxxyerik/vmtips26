'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { loadOnboarding, saveOnboarding, deriveThirdPlaceTeams } from '@/lib/onboarding-storage'
import type { DbMatch, GroupLabel, Pick } from '@/lib/types'
import { GROUPS } from '@/lib/types'

const TOTAL_STEPS = 5

export default function GroupStagePage() {
  const router = useRouter()
  const supabase = createClient()
  const [matches, setMatches] = useState<DbMatch[]>([])
  const [picks, setPicks] = useState<Record<number, Pick>>({})
  const [loading, setLoading] = useState(true)
  const [activeGroup, setActiveGroup] = useState<GroupLabel>('A')

  useEffect(() => {
    const state = loadOnboarding()
    setPicks(state.groupPicks)

    supabase
      .from('matches')
      .select('*')
      .eq('phase', 'group')
      .order('kickoff')
      .then(({ data }) => {
        setMatches((data as DbMatch[]) ?? [])
        setLoading(false)
      })
  }, [])

  const grouped = useCallback(() => {
    const map: Record<GroupLabel, DbMatch[]> = {} as Record<GroupLabel, DbMatch[]>
    for (const g of GROUPS) map[g] = []
    for (const m of matches) {
      if (m.group_label) map[m.group_label].push(m)
    }
    return map
  }, [matches])

  function handlePick(matchId: number, pick: Pick) {
    setPicks(prev => {
      const next = { ...prev, [matchId]: pick }
      const state = loadOnboarding()
      state.groupPicks = next
      saveOnboarding(state)
      return next
    })
  }

  const groupMap = grouped()
  const totalMatches = matches.length
  const pickedCount = Object.keys(picks).length
  const allPicked = pickedCount === totalMatches && totalMatches > 0

  function handleNext() {
    if (!allPicked) return
    // Derive third-place teams from picks and save to state
    const groupMatchesForDerive = matches.map(m => ({
      id: m.id,
      group_label: m.group_label ?? '',
      home_team: m.home_team,
      away_team: m.away_team,
    }))
    const thirdPlaceMap = deriveThirdPlaceTeams(groupMatchesForDerive, picks)
    const state = loadOnboarding()
    state.thirdPlaceGroups = thirdPlaceMap as Record<GroupLabel, string>
    saveOnboarding(state)
    router.push('/onboarding/third-place')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-400">Laddar matcher...</div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-2xl">⏳</p>
          <p className="text-gray-300 font-semibold">Matcher laddas in</p>
          <p className="text-gray-500 text-sm max-w-xs">
            Gruppspelsmatcherna är inte inlagda ännu. Kom tillbaka senare.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28">
      {/* Header */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-medium">
          <span>Steg 1 av {TOTAL_STEPS}</span>
          <span>·</span>
          <span>Gruppspel</span>
        </div>
        <h1 className="text-2xl font-bold">Tippa gruppspelet</h1>
        <p className="text-gray-400 text-sm">
          Välj 1 (hemmavinst), X (oavgjort) eller 2 (bortavinst) för varje match.
          {totalMatches > 0 && (
            <span className="ml-1 text-pitch-400 font-medium">
              {pickedCount}/{totalMatches} tippade
            </span>
          )}
        </p>

        {/* Progress bar */}
        <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-pitch-600 rounded-full transition-all duration-300"
            style={{ width: `${totalMatches ? (pickedCount / totalMatches) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Group tabs */}
      <div className="flex gap-1 flex-wrap mb-6">
        {GROUPS.map(g => {
          const gMatches = groupMap[g]
          const gPicked = gMatches.filter(m => picks[m.id]).length
          const gDone = gMatches.length > 0 && gPicked === gMatches.length
          return (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`relative rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                activeGroup === g
                  ? 'bg-pitch-600 text-white'
                  : gDone
                  ? 'bg-pitch-900/40 text-pitch-400 border border-pitch-800'
                  : 'bg-surface-700 text-gray-400 hover:text-white'
              }`}
            >
              Grupp {g}
              {gDone && activeGroup !== g && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-pitch-500" />
              )}
            </button>
          )
        })}
      </div>

      {/* Matches for active group */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-200">Grupp {activeGroup}</h2>
        {groupMap[activeGroup].length === 0 ? (
          <p className="text-gray-500 text-sm">Inga matcher i denna grupp ännu.</p>
        ) : (
          groupMap[activeGroup].map(match => (
            <MatchCard
              key={match.id}
              match={match}
              pick={picks[match.id] ?? null}
              onPick={pick => handlePick(match.id, pick)}
            />
          ))
        )}
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-surface-700 bg-surface-900/95 backdrop-blur px-4 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            {allPicked ? (
              <span className="text-pitch-400 font-medium">Alla matcher tippade ✓</span>
            ) : (
              <span>{totalMatches - pickedCount} matcher kvar</span>
            )}
          </p>
          <button
            onClick={handleNext}
            disabled={!allPicked}
            className="btn-primary px-8"
          >
            Nästa: Tredjeplacerade →
          </button>
        </div>
      </div>
    </div>
  )
}

function MatchCard({
  match,
  pick,
  onPick,
}: {
  match: DbMatch
  pick: Pick | null
  onPick: (p: Pick) => void
}) {
  const kickoff = new Date(match.kickoff)
  const dateStr = kickoff.toLocaleDateString('sv-SE', {
    weekday: 'short', month: 'short', day: 'numeric'
  })
  const timeStr = kickoff.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`card transition-all ${pick ? 'border-surface-500' : 'border-surface-600'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{dateStr} · {timeStr}</span>
        {pick && (
          <span className={`badge ${
            pick === '1' ? 'badge-green' : pick === 'X' ? 'badge-yellow' : 'badge bg-blue-900/50 text-blue-400 border border-blue-800'
          }`}>
            {pick === '1' ? match.home_team : pick === '2' ? match.away_team : 'Oavgjort'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="flex-1 text-right font-semibold text-sm text-gray-100 truncate">
          {match.home_team}
        </span>
        <span className="text-xs text-gray-600 font-bold px-1">vs</span>
        <span className="flex-1 text-left font-semibold text-sm text-gray-100 truncate">
          {match.away_team}
        </span>
      </div>

      <div className="flex gap-2">
        {(['1', 'X', '2'] as Pick[]).map(opt => (
          <button
            key={opt}
            onClick={() => onPick(opt)}
            className={`pick-btn ${
              pick === opt
                ? opt === '1' ? 'pick-btn-selected-1' : opt === 'X' ? 'pick-btn-selected-X' : 'pick-btn-selected-2'
                : 'pick-btn-unselected'
            }`}
          >
            {opt === '1' ? '1' : opt === 'X' ? 'X' : '2'}
          </button>
        ))}
      </div>
    </div>
  )
}

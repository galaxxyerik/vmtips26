'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { loadDraft, saveDraft, setStep, computeGroupStandings } from '@/lib/onboarding-storage'
import type { VmtMatch, Pick, GroupLabel, OnboardingDraft } from '@/lib/types'
import { GROUPS } from '@/lib/types'

export default function GroupStagePage() {
  const router = useRouter()
  const supabase = createClient()
  const [matches, setMatches] = useState<VmtMatch[]>([])
  const [draft, setDraft] = useState<OnboardingDraft | null>(null)
  const [activeGroup, setActiveGroup] = useState<GroupLabel>('A')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setStep('group-stage')
    const d = loadDraft()
    setDraft(d)
    supabase.from('vmt_matches').select('*').eq('phase', 'group').order('kickoff')
      .then(({ data }) => { setMatches((data as VmtMatch[]) ?? []); setLoading(false) })
  }, [])

  function update(fn: (d: OnboardingDraft) => OnboardingDraft) {
    setDraft(prev => {
      if (!prev) return prev
      const next = fn({ ...prev })
      saveDraft(next)
      return next
    })
  }

  function handlePick(matchId: number, pick: Pick) {
    update(d => {
      const next = { ...d, matchPicks: { ...d.matchPicks, [matchId]: pick } }
      // Auto-compute group table order if all 3 matches in the group are picked
      const match = matches.find(m => m.id === matchId)
      if (!match?.group_label) return next
      const groupMatches = matches.filter(m => m.group_label === match.group_label)
      const allPicked = groupMatches.every(m => m.id === matchId ? true : next.matchPicks[m.id])
      if (allPicked) {
        const standings = computeGroupStandings(groupMatches, next.matchPicks)
        next.groupTableOrder = { ...next.groupTableOrder, [match.group_label]: standings.map(s => s.team) }
      }
      return next
    })
  }

  function handleTableReorder(group: string, fromIdx: number, toIdx: number) {
    update(d => {
      const order = [...(d.groupTableOrder[group] ?? [])]
      const [moved] = order.splice(fromIdx, 1)
      order.splice(toIdx, 0, moved)
      return { ...d, groupTableOrder: { ...d.groupTableOrder, [group]: order } }
    })
  }

  function handleThirdPlace(group: string, checked: boolean) {
    update(d => {
      const selected = d.thirdPlaceSelected.filter(g => g !== group)
      if (checked && selected.length < 8) selected.push(group)
      return { ...d, thirdPlaceSelected: selected }
    })
  }

  function handleScorer(group: string, value: string) {
    update(d => ({ ...d, groupScorers: { ...d.groupScorers, [group]: value } }))
  }

  const groupedMatches = useCallback(() => {
    const map: Record<GroupLabel, VmtMatch[]> = {} as Record<GroupLabel, VmtMatch[]>
    for (const g of GROUPS) map[g] = []
    for (const m of matches) { if (m.group_label) map[m.group_label as GroupLabel].push(m) }
    return map
  }, [matches])

  if (loading || !draft) return <div className="flex min-h-screen items-center justify-center text-white/35">Laddar...</div>

  const gm = groupedMatches()
  const totalMatches = matches.length
  const pickedCount = Object.keys(draft.matchPicks).length
  const allMatchesPicked = pickedCount === totalMatches && totalMatches > 0
  const allTablesConfirmed = GROUPS.every(g => (draft.groupTableOrder[g]?.length ?? 0) === 4)
  const thirdPlaceOk = draft.thirdPlaceSelected.length === 8
  const allScorers = GROUPS.every(g => draft.groupScorers[g]?.trim())
  const canProceed = allMatchesPicked && allTablesConfirmed && thirdPlaceOk && allScorers

  const groupDone = (g: GroupLabel) => {
    const gMatches = gm[g]
    return gMatches.every(m => draft.matchPicks[m.id]) &&
      (draft.groupTableOrder[g]?.length === 4) &&
      draft.groupScorers[g]?.trim()
  }

  return (
    <div className="mx-auto max-w-2xl px-3 py-4 pb-24">
      {/* Header */}
      <div className="mb-4">
        <div className="label">Steg 1 av 3 · Gruppspel</div>
        <h1 className="font-display font-black text-2xl uppercase tracking-wide text-white mb-2">Tippa gruppspelet</h1>
        <div className="flex items-center gap-2 text-xs">
          <span className={`tnum ${pickedCount === totalMatches && totalMatches > 0 ? 'text-swe-yellow font-bold' : 'text-white/40'}`}>
            {pickedCount}/{totalMatches} matcher
          </span>
          <div className="flex-1 h-0.5 bg-white/10">
            <div className="h-full bg-swe-yellow transition-all" style={{ width: `${totalMatches ? pickedCount/totalMatches*100 : 0}%` }} />
          </div>
          <span className={`tnum ${thirdPlaceOk ? 'text-swe-yellow font-bold' : 'text-white/40'}`}>
            {draft.thirdPlaceSelected.length}/8 treor
          </span>
        </div>
      </div>

      {/* Group tabs */}
      <div className="flex flex-wrap gap-1 mb-4">
        {GROUPS.map(g => (
          <button key={g} onClick={() => setActiveGroup(g)}
            className={`px-2.5 py-1 text-xs font-display font-black uppercase border transition-colors ${
              activeGroup === g
                ? 'bg-swe-yellow text-navy-950 border-swe-yellow'
                : groupDone(g)
                ? 'bg-pitch-900/30 text-pitch-400 border-pitch-500/30'
                : 'bg-navy-900 text-white/40 border-white/10 hover:text-white'
            }`}>
            {g}
            {groupDone(g) && activeGroup !== g && <span className="ml-1 text-pitch-400">✓</span>}
          </button>
        ))}
      </div>

      {/* Active group content */}
      <GroupPanel
        group={activeGroup}
        matches={gm[activeGroup]}
        matchPicks={draft.matchPicks}
        tableOrder={draft.groupTableOrder[activeGroup] ?? []}
        thirdPlaceSelected={draft.thirdPlaceSelected.includes(activeGroup)}
        thirdPlaceDisabled={!draft.thirdPlaceSelected.includes(activeGroup) && draft.thirdPlaceSelected.length >= 8}
        scorer={draft.groupScorers[activeGroup] ?? ''}
        onPick={handlePick}
        onReorder={(from, to) => handleTableReorder(activeGroup, from, to)}
        onThirdPlace={checked => handleThirdPlace(activeGroup, checked)}
        onScorer={val => handleScorer(activeGroup, val)}
        onNextGroup={() => {
          const idx = GROUPS.indexOf(activeGroup)
          if (idx < GROUPS.length - 1) setActiveGroup(GROUPS[idx + 1])
        }}
        isLastGroup={GROUPS.indexOf(activeGroup) === GROUPS.length - 1}
        groupDone={!!groupDone(activeGroup)}
      />

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-navy-950/95 backdrop-blur px-3 py-3">
        <div className="mx-auto max-w-2xl flex items-center justify-between gap-3">
          <div className="text-xs text-white/30 space-y-0.5">
            {!allMatchesPicked && <div>· Tippa alla {totalMatches} matcher</div>}
            {!thirdPlaceOk && <div>· Välj exakt 8 treor ({draft.thirdPlaceSelected.length}/8)</div>}
            {!allScorers && <div>· Fyll i skyttekung i alla grupper</div>}
          </div>
          <button
            onClick={() => canProceed && router.push('/onboarding/bracket')}
            disabled={!canProceed}
            className={canProceed ? 'btn-primary' : 'btn-primary opacity-40 cursor-not-allowed'}
          >
            Nästa: Slutspel →
          </button>
        </div>
      </div>
    </div>
  )
}

function GroupPanel({
  group, matches, matchPicks, tableOrder, thirdPlaceSelected,
  thirdPlaceDisabled, scorer, onPick, onReorder, onThirdPlace, onScorer,
  onNextGroup, isLastGroup, groupDone,
}: {
  group: GroupLabel
  matches: VmtMatch[]
  matchPicks: Record<number, Pick>
  tableOrder: string[]
  thirdPlaceSelected: boolean
  thirdPlaceDisabled: boolean
  scorer: string
  onPick: (id: number, pick: Pick) => void
  onReorder: (from: number, to: number) => void
  onThirdPlace: (checked: boolean) => void
  onScorer: (val: string) => void
  onNextGroup: () => void
  isLastGroup: boolean
  groupDone: boolean
}) {
  const allPicked = matches.length > 0 && matches.every(m => matchPicks[m.id])

  return (
    <div className="space-y-3">
      <h2 className="font-display font-black text-sm uppercase tracking-wider text-white/60">Grupp {group}</h2>

      {/* Matches */}
      {matches.length === 0 ? (
        <p className="text-white/30 text-sm">Inga matcher inlagda ännu.</p>
      ) : (
        <div className="border border-white/10 divide-y divide-white/5">
          {matches.map(m => (
            <MatchRow key={m.id} match={m} pick={matchPicks[m.id] ?? null} onPick={p => onPick(m.id, p)} />
          ))}
        </div>
      )}

      {/* Group table (shown after all 3 picked) */}
      {allPicked && tableOrder.length === 4 && (
        <div className="border border-white/10">
          <div className="px-3 py-1.5 bg-navy-900 border-b border-white/10 label">
            Gruppordning (justera med pilarna)
          </div>
          {tableOrder.map((team, idx) => (
            <div key={team} className="flex items-center gap-2 px-3 py-2 border-b border-white/5 last:border-0 bg-navy-900/50">
              <span className="w-5 text-center text-xs font-display font-black text-white/30 tnum">{idx + 1}</span>
              <span className="flex-1 text-sm font-medium text-white/80">{team}</span>
              <div className="flex gap-1">
                <button onClick={() => idx > 0 && onReorder(idx, idx - 1)}
                  disabled={idx === 0}
                  className="w-6 h-6 text-white/35 hover:text-white disabled:opacity-20 text-xs border border-white/10 hover:border-white/30 transition-colors">
                  ↑
                </button>
                <button onClick={() => idx < tableOrder.length - 1 && onReorder(idx, idx + 1)}
                  disabled={idx === tableOrder.length - 1}
                  className="w-6 h-6 text-white/35 hover:text-white disabled:opacity-20 text-xs border border-white/10 hover:border-white/30 transition-colors">
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Third place + scorer (shown after all picked) */}
      {allPicked && (
        <div className="border border-white/10 divide-y divide-white/5">
          <label className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer ${thirdPlaceDisabled && !thirdPlaceSelected ? 'opacity-40' : ''}`}>
            <input
              type="checkbox"
              checked={thirdPlaceSelected}
              disabled={thirdPlaceDisabled && !thirdPlaceSelected}
              onChange={e => onThirdPlace(e.target.checked)}
              className="w-4 h-4 accent-swe-yellow"
            />
            <span className="text-sm text-white/70">
              Trea-laget går vidare ({tableOrder[2] || '?'})
            </span>
          </label>
          <div className="px-3 py-2.5">
            <input
              type="text"
              value={scorer}
              onChange={e => onScorer(e.target.value)}
              placeholder={`Skyttekung grupp ${group}...`}
              className="w-full bg-transparent text-sm text-white/80 placeholder:text-white/25 outline-none border-b border-white/10 pb-1 focus:border-swe-yellow transition-colors"
            />
          </div>
        </div>
      )}

      {/* Next group CTA */}
      {groupDone && !isLastGroup && (
        <div className="flex justify-end pt-1">
          <button
            onClick={onNextGroup}
            className="btn-primary text-sm px-5 h-9 flex items-center gap-1"
          >
            Nästa grupp →
          </button>
        </div>
      )}
      {groupDone && isLastGroup && (
        <div className="border border-pitch-500/20 bg-pitch-900/10 px-4 py-3 text-center">
          <span className="text-xs text-pitch-400 font-display font-black uppercase tracking-wider">
            ✓ Alla grupper klara — fortsätt till slutspelet nedan
          </span>
        </div>
      )}
    </div>
  )
}

function MatchRow({ match, pick, onPick }: { match: VmtMatch; pick: Pick | null; onPick: (p: Pick) => void }) {
  const kickoff = new Date(match.kickoff)
  const dateStr = kickoff.toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' })
  const timeStr = kickoff.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex items-center gap-1 px-2 py-2 bg-navy-900/30 hover:bg-navy-900/70 transition-colors">
      <div className="w-20 text-right text-xs text-white/25 hidden sm:block tnum">{dateStr} {timeStr}</div>
      <div className="flex-1 flex items-center gap-1 min-w-0">
        <span className={`flex-1 text-right text-sm font-medium truncate ${pick === '1' ? 'text-swe-yellow' : 'text-white/75'}`}>
          {match.home_team}
        </span>
        {(['1', 'X', '2'] as Pick[]).map(opt => (
          <button key={opt} onClick={() => onPick(opt)}
            className={`w-8 h-7 text-xs font-display font-black border transition-colors flex-shrink-0 ${
              pick === opt
                ? 'bg-swe-yellow text-navy-950 border-swe-yellow'
                : 'bg-navy-800 text-white/40 border-white/10 hover:text-white hover:border-white/30'
            }`}>
            {opt}
          </button>
        ))}
        <span className={`flex-1 text-left text-sm font-medium truncate ${pick === '2' ? 'text-swe-yellow' : 'text-white/75'}`}>
          {match.away_team}
        </span>
      </div>
    </div>
  )
}

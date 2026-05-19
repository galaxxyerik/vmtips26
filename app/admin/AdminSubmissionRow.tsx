'use client'

import { useState } from 'react'
import { buildR32Bracket, type Group } from '@/lib/bracket-logic'
import { ToggleConfirmButton, DeleteButton } from './AdminActions'

// ── Types ─────────────────────────────────────────────────────────────────────

interface GroupMatch {
  id: number
  home_team: string
  away_team: string
  pick: string | null
}

export interface GroupData {
  matches: GroupMatch[]
  tableOrder: string[]
  thirdPlaceSelected: boolean
  groupScorer: string | null
}

export interface BracketPick {
  match_number: number
  pick_team: string
  round: string
}

interface PicksData {
  groups: Record<string, GroupData>
  bracketPicks: BracketPick[]
  tournamentScorer: string | null
}

export interface SubmissionRowProps {
  id: string
  name: string
  email: string
  submitted_at: string | null
  confirmed: boolean
  total_points: number | null
  scorer: string | null
  champion: string | null
  rank: number | null
}

// ── Constants ──────────────────────────────────────────────────────────────────

const ALL_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

const DISPLAY_ROUNDS = ['r32','r16','qf','sf','final'] as const

const ROUND_LABELS: Record<string, string> = {
  r32: 'Sextondelsfinal',
  r16: 'Åttondelsfinaler',
  qf: 'Kvartsfinaler',
  sf: 'Semifinaler',
  bronze: 'Bronsmatch',
  final: 'Final',
}

type KnockoutRound = 'r32' | 'r16' | 'qf' | 'sf' | 'bronze' | 'final'

interface KnockoutMatchView {
  matchNumber: number
  label: string
  round: KnockoutRound
  team1: string
  team2: string
  winner: string | null
}

// ── Main Row ───────────────────────────────────────────────────────────────────

export function AdminSubmissionRow({
  id, name, email, submitted_at, confirmed, total_points, scorer, champion, rank,
}: SubmissionRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [picksData, setPicksData] = useState<PicksData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [activeGroup, setActiveGroup] = useState('A')

  async function handleToggle() {
    if (!expanded && !picksData && !error) {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/submission-picks?id=${id}`)
        if (res.ok) setPicksData(await res.json())
        else setError(true)
      } catch {
        setError(true)
      }
      setLoading(false)
    }
    setExpanded(v => !v)
  }

  return (
    <div className={`border-b border-white/5 last:border-0 ${!confirmed ? 'opacity-60' : ''}`}>

      {/* ── Collapsed summary row ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-navy-900/40 transition-colors select-none"
        onClick={handleToggle}
      >
        {/* Chevron */}
        <span
          className={`text-[10px] text-white/25 flex-shrink-0 transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
          style={{ display: 'inline-block' }}
        >
          ▶
        </span>

        {/* Rank badge */}
        <div className={`w-7 h-7 flex-shrink-0 flex items-center justify-center border text-xs font-display font-black ${
          rank === 1 ? 'border-swe-yellow/60 text-swe-yellow bg-swe-yellow/5'
          : rank !== null ? 'border-white/15 text-white/35'
          : 'border-white/10 text-white/15'
        }`}>
          {rank ?? '—'}
        </div>

        {/* Name, status badge, email, date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-black uppercase tracking-wide text-white text-sm leading-tight">
              {name}
            </span>
            {confirmed
              ? <span className="text-[9px] font-display font-black border border-pitch-500/30 text-pitch-400 px-1 py-0.5">Bekräftad</span>
              : <span className="text-[9px] font-display font-black border border-swe-yellow/30 text-swe-yellow/70 px-1 py-0.5">Väntar</span>
            }
          </div>
          <div className="text-[10px] text-white/30 truncate mt-0.5">{email}</div>
          {submitted_at && (
            <div className="text-[10px] text-white/20 tnum">
              {new Date(submitted_at).toLocaleDateString('sv-SE', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
            </div>
          )}
        </div>

        {/* Scorer + champion picks — hidden on very small screens */}
        <div className="hidden md:flex flex-col items-end gap-0.5 flex-shrink-0 text-right">
          {scorer
            ? <span className="text-xs text-pitch-400 whitespace-nowrap">⚽ {scorer}</span>
            : <span className="text-[10px] text-white/15">Skyttekung —</span>
          }
          {champion
            ? <span className="text-xs text-swe-yellow/80 whitespace-nowrap">🏆 {champion}</span>
            : <span className="text-[10px] text-white/15">VM-vinnare —</span>
          }
        </div>

        {/* Points */}
        <div className="text-right flex-shrink-0 w-10">
          <div className="font-display font-black tnum text-swe-yellow text-xl leading-none">
            {total_points ?? 0}
          </div>
          <div className="text-[9px] text-white/20 uppercase tracking-wider">p</div>
        </div>

        {/* Action buttons — stop propagation so they don't toggle the row */}
        <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <ToggleConfirmButton submissionId={id} confirmed={confirmed} />
          <DeleteButton submissionId={id} name={name} />
        </div>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="border-t border-white/5 bg-navy-950/40">
          {loading && (
            <div className="px-8 py-6 text-white/30 text-sm">Laddar tips…</div>
          )}
          {error && !loading && (
            <div className="px-8 py-6 text-loss-500 text-sm">Kunde inte hämta tips.</div>
          )}
          {picksData && !loading && (
            <div className="divide-y divide-white/5">
              <GruppspelSection
                groups={picksData.groups}
                activeGroup={activeGroup}
                setActiveGroup={setActiveGroup}
              />
              <SlutspelSection bracketPicks={picksData.bracketPicks} groups={picksData.groups} />
              <OvrigtSection tournamentScorer={picksData.tournamentScorer} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Section: Gruppspel ────────────────────────────────────────────────────────

function GruppspelSection({
  groups,
  activeGroup,
  setActiveGroup,
}: {
  groups: Record<string, GroupData>
  activeGroup: string
  setActiveGroup: (g: string) => void
}) {
  const g = groups[activeGroup]

  return (
    <div>
      {/* Section header */}
      <div className="px-4 pt-4 pb-2">
        <div className="label text-swe-yellow/60 mb-2">Sektion 1 — Gruppspel</div>
        {/* Group tab bar */}
        <div className="flex flex-wrap gap-1">
          {ALL_GROUPS.map(label => {
            const gd = groups[label]
            const done = gd?.matches.every(m => m.pick !== null) && gd.tableOrder.length === 4 && !!gd.groupScorer
            return (
              <button
                key={label}
                onClick={() => setActiveGroup(label)}
                className={`px-2 py-1 text-xs font-display font-black uppercase border transition-colors ${
                  activeGroup === label
                    ? 'bg-swe-yellow text-navy-950 border-swe-yellow'
                    : done
                    ? 'border-pitch-500/30 text-pitch-400 bg-pitch-900/10'
                    : 'border-white/10 text-white/35 hover:text-white'
                }`}
              >
                {label}
                {done && activeGroup !== label && (
                  <span className="ml-0.5 text-pitch-400">✓</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Active group detail */}
      {g && (
        <div className="px-4 pb-4 space-y-3">
          {/* Matches table */}
          {g.matches.length > 0 ? (
            <div className="border border-white/10">
              <div className="grid grid-cols-[1fr_auto_1fr] text-[9px] font-display font-black uppercase tracking-widest text-white/25 px-3 h-7 items-center border-b border-white/5 bg-navy-900/60">
                <span>Hemmalag</span>
                <span className="text-center px-4">Tips</span>
                <span className="text-right">Bortalag</span>
              </div>
              <div className="divide-y divide-white/5">
                {g.matches.map(m => (
                  <div key={m.id} className="grid grid-cols-[1fr_auto_1fr] items-center px-3 py-2 gap-2">
                    <span className={`text-sm font-medium ${m.pick === '1' ? 'text-swe-yellow' : 'text-white/70'}`}>
                      {m.home_team}
                    </span>
                    <div className="flex gap-1 justify-center px-2">
                      {(['1','X','2'] as const).map(v => (
                        <span key={v} className={`w-6 h-6 flex items-center justify-center text-xs font-display font-black border ${
                          m.pick === v
                            ? 'bg-swe-yellow/10 border-swe-yellow text-swe-yellow'
                            : 'border-white/10 text-white/20'
                        }`}>
                          {v}
                        </span>
                      ))}
                    </div>
                    <span className={`text-sm font-medium text-right ${m.pick === '2' ? 'text-swe-yellow' : 'text-white/70'}`}>
                      {m.away_team}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-white/25 italic">Inga matcher registrerade för grupp {activeGroup}.</p>
          )}

          {/* Table order */}
          {g.tableOrder.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <span className="label text-[9px] self-center">Tabellordning</span>
              {g.tableOrder.map((team, i) => (
                <span key={team} className="text-white/55">
                  <span className="text-white/25 font-mono mr-1">{i + 1}.</span>
                  {team}
                </span>
              ))}
            </div>
          )}

          {/* Third-place + group scorer */}
          <div className="flex flex-wrap gap-4 text-xs">
            <span>
              <span className="label text-[9px] mr-1.5">Trea vidare</span>
              <span className={g.thirdPlaceSelected ? 'text-pitch-400' : 'text-white/30'}>
                {g.thirdPlaceSelected ? 'Ja' : 'Nej'}
              </span>
            </span>
            <span>
              <span className="label text-[9px] mr-1.5">Skyttekung</span>
              <span className="text-white/70">{g.groupScorer ?? <em className="text-white/25">—</em>}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Section: Slutspel ─────────────────────────────────────────────────────────

function buildKnockoutMatches(
  groups: Record<string, GroupData>,
  bracketPicks: BracketPick[]
): KnockoutMatchView[] | null {
  const pickByMatch = Object.fromEntries(bracketPicks.map(p => [p.match_number, p.pick_team]))
  const groupWinners = {} as Record<Group, string>
  const groupRunnersUp = {} as Record<Group, string>
  const thirdPlaceTeams: Partial<Record<Group, string>> = {}
  const advancingThirdGroups: Group[] = []

  for (const group of ALL_GROUPS as Group[]) {
    const order = groups[group]?.tableOrder ?? []
    groupWinners[group] = order[0] ?? `Etta ${group}`
    groupRunnersUp[group] = order[1] ?? `Tvåa ${group}`
    thirdPlaceTeams[group] = order[2] ?? `Trea ${group}`
    if (groups[group]?.thirdPlaceSelected) advancingThirdGroups.push(group)
  }

  const r32Base = buildR32Bracket(groupWinners, groupRunnersUp, thirdPlaceTeams, advancingThirdGroups)
  if (!r32Base) return null

  const winnerOf = (matchNumber: number, fallbackLabel: string) => pickByMatch[matchNumber] ?? fallbackLabel

  const r32m: KnockoutMatchView[] = r32Base.map(m => ({
    matchNumber: m.matchNumber,
    label: `M${m.matchNumber}`,
    team1: m.team1,
    team2: m.team2,
    round: 'r32',
    winner: pickByMatch[m.matchNumber] ?? null,
  }))

  const r16m: KnockoutMatchView[] = [
    { matchNumber: 89, label: 'M89', team1: winnerOf(73, 'Vinnare M73'), team2: winnerOf(74, 'Vinnare M74'), round: 'r16', winner: pickByMatch[89] ?? null },
    { matchNumber: 90, label: 'M90', team1: winnerOf(75, 'Vinnare M75'), team2: winnerOf(76, 'Vinnare M76'), round: 'r16', winner: pickByMatch[90] ?? null },
    { matchNumber: 91, label: 'M91', team1: winnerOf(77, 'Vinnare M77'), team2: winnerOf(78, 'Vinnare M78'), round: 'r16', winner: pickByMatch[91] ?? null },
    { matchNumber: 92, label: 'M92', team1: winnerOf(79, 'Vinnare M79'), team2: winnerOf(80, 'Vinnare M80'), round: 'r16', winner: pickByMatch[92] ?? null },
    { matchNumber: 93, label: 'M93', team1: winnerOf(81, 'Vinnare M81'), team2: winnerOf(82, 'Vinnare M82'), round: 'r16', winner: pickByMatch[93] ?? null },
    { matchNumber: 94, label: 'M94', team1: winnerOf(83, 'Vinnare M83'), team2: winnerOf(84, 'Vinnare M84'), round: 'r16', winner: pickByMatch[94] ?? null },
    { matchNumber: 95, label: 'M95', team1: winnerOf(85, 'Vinnare M85'), team2: winnerOf(86, 'Vinnare M86'), round: 'r16', winner: pickByMatch[95] ?? null },
    { matchNumber: 96, label: 'M96', team1: winnerOf(87, 'Vinnare M87'), team2: winnerOf(88, 'Vinnare M88'), round: 'r16', winner: pickByMatch[96] ?? null },
  ]

  const qfm: KnockoutMatchView[] = [
    { matchNumber: 97, label: 'QF1', team1: winnerOf(89, 'Vinnare M89'), team2: winnerOf(90, 'Vinnare M90'), round: 'qf', winner: pickByMatch[97] ?? null },
    { matchNumber: 98, label: 'QF2', team1: winnerOf(91, 'Vinnare M91'), team2: winnerOf(92, 'Vinnare M92'), round: 'qf', winner: pickByMatch[98] ?? null },
    { matchNumber: 99, label: 'QF3', team1: winnerOf(93, 'Vinnare M93'), team2: winnerOf(94, 'Vinnare M94'), round: 'qf', winner: pickByMatch[99] ?? null },
    { matchNumber: 100, label: 'QF4', team1: winnerOf(95, 'Vinnare M95'), team2: winnerOf(96, 'Vinnare M96'), round: 'qf', winner: pickByMatch[100] ?? null },
  ]

  const sfm: KnockoutMatchView[] = [
    { matchNumber: 101, label: 'SF1', team1: winnerOf(97, 'Vinnare QF1'), team2: winnerOf(98, 'Vinnare QF2'), round: 'sf', winner: pickByMatch[101] ?? null },
    { matchNumber: 102, label: 'SF2', team1: winnerOf(99, 'Vinnare QF3'), team2: winnerOf(100, 'Vinnare QF4'), round: 'sf', winner: pickByMatch[102] ?? null },
  ]

  const bronzeM: KnockoutMatchView = {
    matchNumber: 103,
    label: 'BR',
    team1: 'Förlorare SF1',
    team2: 'Förlorare SF2',
    round: 'bronze',
    winner: pickByMatch[103] ?? null,
  }

  const finalM: KnockoutMatchView = {
    matchNumber: 104,
    label: 'FIN',
    team1: winnerOf(101, 'Vinnare SF1'),
    team2: winnerOf(102, 'Vinnare SF2'),
    round: 'final',
    winner: pickByMatch[104] ?? null,
  }

  return [...r32m, ...r16m, ...qfm, ...sfm, bronzeM, finalM]
}

function ReadonlyBracketMatchRow({ match }: { match: KnockoutMatchView }) {
  return (
    <div className="flex items-center px-2 py-1.5 gap-1 bg-navy-900/30">
      <span className="text-xs text-white/20 font-mono w-8 flex-shrink-0 tnum">{match.label}</span>
      <div className="flex-1 flex gap-1">
        {[match.team1, match.team2].map(team => {
          const isWinner = match.winner === team
          return (
            <div
              key={team}
              className={`flex-1 py-1.5 px-1 text-xs font-medium border text-center ${
                isWinner
                  ? 'border-swe-yellow bg-swe-yellow/10 text-swe-yellow'
                  : 'border-white/10 text-white/55'
              }`}
            >
              {team}
            </div>
          )
        })}
      </div>
      {match.winner && <span className="text-xs text-swe-yellow w-4 flex-shrink-0">✓</span>}
    </div>
  )
}

export function SlutspelSection({
  bracketPicks,
  groups,
}: {
  bracketPicks: BracketPick[]
  groups: Record<string, GroupData>
}) {
  const knockoutMatches = buildKnockoutMatches(groups, bracketPicks)

  if (bracketPicks.length === 0) {
    return (
      <div className="px-4 py-4">
        <div className="label text-swe-yellow/60 mb-2">Sektion 2 — Slutspel</div>
        <p className="text-[11px] text-white/25 italic">Inga slutspelstips registrerade.</p>
      </div>
    )
  }

  if (!knockoutMatches) {
    return (
      <div className="px-4 py-4">
        <div className="label text-swe-yellow/60 mb-2">Sektion 2 — Slutspel</div>
        <p className="text-[11px] text-white/25 italic">Kunde inte bygga slutspelets matchträd från sparad data.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="label text-swe-yellow/60">Sektion 2 — Slutspel</div>

      {DISPLAY_ROUNDS.map(round => {
        const roundMatches = knockoutMatches.filter(match => match.round === round)
        if (roundMatches.length === 0) return null

        const isFinal = round === 'final'
        const teamCount = roundMatches.length * 2
        const subtitle = `${teamCount} lag · ${roundMatches.length} matcher`
        const finalWinner = roundMatches[0]?.winner ?? null

        return (
          <div key={round}>
            <div className="flex items-center gap-2 mb-2">
              <span className="label text-[9px]">{ROUND_LABELS[round]}</span>
              <span className="text-[9px] text-white/20">{subtitle}</span>
            </div>

            <div className={`border divide-y divide-white/5 ${isFinal ? 'border-swe-yellow/20 bg-swe-yellow/5' : 'border-white/10'}`}>
              {roundMatches.map(match => (
                <ReadonlyBracketMatchRow key={match.matchNumber} match={match} />
              ))}
            </div>

            {isFinal && (
              <div className="mt-2 border border-swe-yellow/20 bg-swe-yellow/5 px-3 py-2.5">
                <div className="text-xs text-white/60 mb-0.5">
                  Finalist 1: <span className="text-white/80 font-medium">{roundMatches[0].team1}</span>
                </div>
                <div className="text-xs text-white/60 mb-0.5">
                  Finalist 2: <span className="text-white/80 font-medium">{roundMatches[0].team2}</span>
                </div>
                {finalWinner ? (
                  <div className="text-sm font-display font-black text-swe-yellow mt-1">
                    🏆 VM-vinnare: {finalWinner}
                  </div>
                ) : (
                  <div className="text-xs text-white/30 mt-1">VM-vinnare saknas.</div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {(() => {
        const bronzeMatch = knockoutMatches.find(match => match.round === 'bronze')
        if (!bronzeMatch) return null
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="label text-[9px]">Bronsmatch</span>
              <span className="text-[9px] text-white/20">2 lag · 1 match</span>
            </div>
            <div className="border border-white/10">
              <ReadonlyBracketMatchRow match={bronzeMatch} />
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ── Section: Övrigt ───────────────────────────────────────────────────────────

function OvrigtSection({ tournamentScorer }: { tournamentScorer: string | null }) {
  return (
    <div className="px-4 py-4 flex items-center gap-4">
      <div className="label text-swe-yellow/60">Sektion 3 — Övrigt</div>
      <div className="flex items-center gap-2">
        <span className="label text-[9px]">Skyttekung i VM</span>
        <span className={`text-sm font-medium ${tournamentScorer ? 'text-pitch-400' : 'text-white/20'}`}>
          {tournamentScorer ?? '—'}
        </span>
      </div>
    </div>
  )
}

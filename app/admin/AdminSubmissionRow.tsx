'use client'

import { useState } from 'react'
import { ToggleConfirmButton, DeleteButton } from './AdminActions'

// ── Types ─────────────────────────────────────────────────────────────────────

interface GroupMatch {
  id: number
  home_team: string
  away_team: string
  pick: string | null
}

interface GroupData {
  matches: GroupMatch[]
  tableOrder: string[]
  thirdPlaceSelected: boolean
  groupScorer: string | null
}

interface BracketPick {
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

const ROUND_ORDER = ['r32','r16','qf','sf','bronze','final'] as const

const ROUND_LABELS: Record<string, string> = {
  r32: 'Sextondelsfinal',
  r16: 'Åttondelsfinaler',
  qf: 'Kvartsfinaler',
  sf: 'Semifinaler',
  bronze: 'Bronsmatch',
  final: 'Final',
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
              <SlutspelSection bracketPicks={picksData.bracketPicks} />
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

function SlutspelSection({ bracketPicks }: { bracketPicks: BracketPick[] }) {
  const byRound: Record<string, BracketPick[]> = {}
  for (const p of bracketPicks) {
    if (!byRound[p.round]) byRound[p.round] = []
    byRound[p.round].push(p)
  }

  if (bracketPicks.length === 0) {
    return (
      <div className="px-4 py-4">
        <div className="label text-swe-yellow/60 mb-2">Sektion 2 — Slutspel</div>
        <p className="text-[11px] text-white/25 italic">Inga slutspelstips registrerade.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="label text-swe-yellow/60">Sektion 2 — Slutspel</div>

      {ROUND_ORDER.map(round => {
        const picks = byRound[round]
        if (!picks?.length) return null

        const isR32 = round === 'r32'
        const isFinal = round === 'final'
        const isSF = round === 'sf'

        return (
          <div key={round}>
            <div className="flex items-center gap-2 mb-2">
              <span className="label text-[9px]">{ROUND_LABELS[round]}</span>
              {!isFinal && !isSF && (
                <span className="text-[9px] text-white/20">{picks.length} lag vidare</span>
              )}
            </div>

            {isFinal ? (
              // Final — show both finalists from SF picks + champion
              <div className="border border-swe-yellow/20 bg-swe-yellow/5 px-3 py-2.5">
                {(byRound['sf'] ?? []).map((p, i) => (
                  <div key={p.match_number} className="text-xs text-white/60 mb-0.5">
                    Finalist {i + 1}: <span className="text-white/80 font-medium">{p.pick_team}</span>
                  </div>
                ))}
                {picks.map(p => (
                  <div key={p.match_number} className="text-sm font-display font-black text-swe-yellow mt-1">
                    🏆 VM-vinnare: {p.pick_team}
                  </div>
                ))}
              </div>
            ) : isSF ? null /* SF shown inside Final block */ : isR32 ? (
              // R32 — compact 2-column tag cloud
              <div className="flex flex-wrap gap-1.5">
                {picks.map(p => (
                  <span key={p.match_number} className="text-[10px] border border-white/10 text-white/55 px-2 py-0.5">
                    {p.pick_team}
                  </span>
                ))}
              </div>
            ) : (
              // R16, QF — slightly more spaced
              <div className="flex flex-wrap gap-1.5">
                {picks.map(p => (
                  <span key={p.match_number} className="text-xs border border-white/15 text-white/65 px-2 py-0.5">
                    {p.pick_team}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Bronze separately */}
      {(byRound['bronze'] ?? []).map(p => (
        <div key={p.match_number}>
          <div className="label text-[9px] mb-1">Bronsmatch — Trea</div>
          <span className="text-xs border border-white/15 text-white/65 px-2 py-0.5">{p.pick_team}</span>
        </div>
      ))}
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

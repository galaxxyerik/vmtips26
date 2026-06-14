'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { AdminSubmissionRow } from './AdminSubmissionRow'
import SetupAdminButton from './SetupAdminButton'
import TestEmailButton from './TestEmailButton'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SubmissionData {
  id: string
  name: string
  email: string
  submitted_at: string | null
  confirmed: boolean
  total_points: number | null
  admin_locked: boolean
  admin_note: string | null
  admin_edited_at: string | null
  admin_edited_by: string | null
}

export interface MatchData {
  id: number
  match_number: number | null
  phase: string
  group_label: string | null
  home_team: string
  away_team: string
  kickoff: string | null
  result: string | null
  manual_result: string | null
  manual_override: boolean
}

interface Props {
  submissions: SubmissionData[]
  scorerMap: Record<string, string>
  championMap: Record<string, string>
  matches: MatchData[]
  systemConfig: Record<string, string>
  lastMatchSync: string | null
  lastPlayerSync: string | null
  adminLastSeen: string | null
}

type Tab = 'overview' | 'participants' | 'matches' | 'system'

const TAB_LABELS: Record<Tab, string> = {
  overview: 'Översikt',
  participants: 'Deltagare',
  matches: 'Matcher',
  system: 'System',
}

interface Toast {
  id: number
  message: string
  type: 'ok' | 'err'
}

// ── ControlRoom ────────────────────────────────────────────────────────────────

export default function ControlRoom({
  submissions: initialSubmissions,
  scorerMap,
  championMap,
  matches: initialMatches,
  systemConfig: initialConfig,
  lastMatchSync,
  lastPlayerSync,
  adminLastSeen,
}: Props) {
  const [tab, setTab] = useState<Tab>('overview')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [subs, setSubs] = useState(initialSubmissions)
  const [matches, setMatches] = useState(initialMatches)
  const [config, setConfig] = useState(initialConfig)
  const [recalcLoading, setRecalcLoading] = useState(false)

  const toast = useCallback((message: string, type: 'ok' | 'err' = 'ok') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  // ── Submission actions ────────────────────────────────────────────────────────

  function handleLockChange(id: string, locked: boolean) {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, admin_locked: locked } : s))
    toast(locked ? 'Tips låst' : 'Tips upplåst')
  }

  function handleNoteChange(id: string, note: string | null) {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, admin_note: note } : s))
    toast('Anteckning sparad')
  }

  // ── Match override ────────────────────────────────────────────────────────────

  async function handleMatchOverride(matchId: number, result: string | null) {
    const clearOverride = result === null
    const res = await fetch('/api/admin/match-override', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, result, clearOverride }),
    })
    if (res.ok) {
      setMatches(prev => prev.map(m => m.id === matchId
        ? { ...m, manual_override: !clearOverride, manual_result: result }
        : m
      ))
      toast(clearOverride ? 'Override borttaget' : `Override satt: ${result}`)
    } else {
      const body = await res.json().catch(() => ({}))
      toast(body.error ?? 'Fel vid override', 'err')
    }
  }

  // ── System config ─────────────────────────────────────────────────────────────

  async function handleConfigChange(key: string, value: string) {
    const res = await fetch('/api/admin/system-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
    if (res.ok) {
      setConfig(prev => ({ ...prev, [key]: value }))
      toast('Inställning sparad')
    } else {
      toast('Fel vid sparande', 'err')
    }
  }

  // ── Force recalculate ─────────────────────────────────────────────────────────

  async function handleRecalculate() {
    setRecalcLoading(true)
    try {
      const res = await fetch('/api/admin/recalculate-scores', { method: 'POST' })
      const body = await res.json()
      if (body.ok) {
        toast(`Omräknat: ${body.updated} deltagare`)
      } else {
        toast(body.reason === 'scoring_frozen' ? 'Scoring är fryst' : 'Fel vid omräkning', 'err')
      }
    } catch {
      toast('Nätverksfel', 'err')
    } finally {
      setRecalcLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const confirmed = subs.filter(s => s.confirmed)
  const unconfirmed = subs.filter(s => !s.confirmed)
  const maxPoints = Math.max(...confirmed.map(s => s.total_points ?? 0), 1)

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-white/10 mb-8 -mt-2">
        {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-xs font-display font-black uppercase tracking-wider border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-swe-yellow text-swe-yellow'
                : 'border-transparent text-white/35 hover:text-white/60'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <OverviewTab
          subs={subs}
          confirmed={confirmed}
          unconfirmed={unconfirmed}
          maxPoints={maxPoints}
          scorerMap={scorerMap}
          championMap={championMap}
          lastMatchSync={lastMatchSync}
          lastPlayerSync={lastPlayerSync}
          config={config}
          adminLastSeen={adminLastSeen}
        />
      )}

      {/* ── PARTICIPANTS ── */}
      {tab === 'participants' && (
        <ParticipantsTab
          confirmed={confirmed}
          unconfirmed={unconfirmed}
          scorerMap={scorerMap}
          championMap={championMap}
          onLockChange={handleLockChange}
          onNoteChange={handleNoteChange}
          adminLastSeen={adminLastSeen}
        />
      )}

      {/* ── MATCHES ── */}
      {tab === 'matches' && (
        <MatchesTab
          matches={matches}
          onOverride={handleMatchOverride}
          onRecalculate={handleRecalculate}
          recalcLoading={recalcLoading}
          config={config}
        />
      )}

      {/* ── SYSTEM ── */}
      {tab === 'system' && (
        <SystemTab
          config={config}
          onConfigChange={handleConfigChange}
          onRecalculate={handleRecalculate}
          recalcLoading={recalcLoading}
          lastMatchSync={lastMatchSync}
        />
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-2.5 text-sm font-medium border font-display font-black uppercase tracking-wide text-xs ${
              t.type === 'ok'
                ? 'bg-navy-900 border-pitch-500/40 text-pitch-400'
                : 'bg-navy-900 border-loss-500/40 text-loss-500'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Overview Tab ───────────────────────────────────────────────────────────────

function isNew(sub: SubmissionData, adminLastSeen: string | null): boolean {
  if (!adminLastSeen || !sub.submitted_at) return false
  return new Date(sub.submitted_at) > new Date(adminLastSeen)
}

function OverviewTab({
  subs,
  confirmed,
  unconfirmed,
  maxPoints,
  scorerMap,
  championMap,
  lastMatchSync,
  lastPlayerSync,
  config,
  adminLastSeen,
}: {
  subs: SubmissionData[]
  confirmed: SubmissionData[]
  unconfirmed: SubmissionData[]
  maxPoints: number
  scorerMap: Record<string, string>
  championMap: Record<string, string>
  lastMatchSync: string | null
  lastPlayerSync: string | null
  config: Record<string, string>
  adminLastSeen: string | null
}) {
  const pot = confirmed.length * 100
  const locked = confirmed.filter(s => s.admin_locked).length
  const newCount = subs.filter(s => isNew(s, adminLastSeen)).length
  const banner = config['maintenance_banner']
  const globalLock = config['global_lock'] === 'true'
  const emergencyMode = config['emergency_mode'] === 'true'

  const scorerCounts: Record<string, number> = {}
  for (const [sid, name] of Object.entries(scorerMap)) {
    if (confirmed.find(s => s.id === sid)) {
      scorerCounts[name] = (scorerCounts[name] ?? 0) + 1
    }
  }
  const topScorers = Object.entries(scorerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const championCounts: Record<string, number> = {}
  for (const [sid, team] of Object.entries(championMap)) {
    if (confirmed.find(s => s.id === sid)) {
      championCounts[team] = (championCounts[team] ?? 0) + 1
    }
  }
  const topChampions = Object.entries(championCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Alert banners */}
      {(globalLock || emergencyMode || banner) && (
        <div className="space-y-2">
          {emergencyMode && (
            <div className="border border-loss-500/40 bg-loss-900/20 px-4 py-3 text-sm text-loss-500 font-medium">
              NÖDLÄGE AKTIVT — live-uppdateringar och scoring är pausade
            </div>
          )}
          {globalLock && !emergencyMode && (
            <div className="border border-swe-yellow/30 bg-swe-yellow/5 px-4 py-3 text-sm text-swe-yellow font-medium">
              GLOBALT LÅS aktivt — alla tips är låsta
            </div>
          )}
          {banner && (
            <div className="border border-white/20 bg-navy-900/60 px-4 py-3 text-sm text-white/60">
              Banner: {banner}
            </div>
          )}
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-4 border border-white/10">
        {[
          { label: 'Inskickade', value: subs.length },
          { label: 'Bekräftade', value: confirmed.length },
          { label: 'Väntar', value: unconfirmed.length },
          { label: 'Pott', value: `${pot} kr` },
        ].map(({ label, value }) => (
          <div key={label} className="px-5 py-4 border-r border-white/10 last:border-0 relative">
            <div className="label mb-1">{label}</div>
            <div className="font-display font-black text-2xl text-swe-yellow">{value}</div>
            {label === 'Inskickade' && newCount > 0 && (
              <span className="absolute top-3 right-3 text-[9px] font-display font-black border border-swe-yellow text-swe-yellow px-1.5 py-0.5 bg-swe-yellow/10">
                +{newCount} NY
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="border border-white/10">
        <div className="px-4 py-3 border-b border-white/10 bg-navy-900 flex items-center justify-between">
          <div className="label">Poängtabell</div>
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Bekräftade · sorterat efter poäng</span>
        </div>
        {confirmed.length === 0 ? (
          <div className="px-4 py-8 text-center text-white/25 text-sm">Inga bekräftade deltagare ännu.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {confirmed.map((sub, i) => {
              const pts = sub.total_points ?? 0
              const pct = maxPoints > 0 ? (pts / maxPoints) * 100 : 0
              return (
                <div key={sub.id} className={`flex items-center gap-3 px-4 py-3 ${i === 0 ? 'bg-swe-yellow/5' : ''}`}>
                  <div className={`w-7 h-7 flex-shrink-0 flex items-center justify-center border font-display font-black text-xs ${
                    i === 0 ? 'border-swe-yellow text-swe-yellow' :
                    i === 1 ? 'border-white/30 text-white/55' :
                    i === 2 ? 'border-white/20 text-white/40' :
                    'border-white/10 text-white/25'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-black uppercase tracking-wide text-white text-sm">{sub.name}</span>
                      {isNew(sub, adminLastSeen) && <span className="text-[9px] font-display font-black border border-swe-yellow text-swe-yellow px-1.5 py-0.5 bg-swe-yellow/10">NY</span>}
                      {sub.admin_locked && <span className="text-[9px] border border-loss-500/30 text-loss-500/60 px-1">LÅST</span>}
                      {sub.admin_edited_by && <span className="text-[9px] border border-swe-yellow/20 text-swe-yellow/40 px-1">REDIGERAD</span>}
                    </div>
                    <div className="mt-1 h-0.5 bg-white/10">
                      <div className={`h-full ${i === 0 ? 'bg-swe-yellow' : 'bg-white/25'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right hidden md:block">
                    {scorerMap[sub.id] && <div className="text-[10px] text-pitch-400">⚽ {scorerMap[sub.id]}</div>}
                    {championMap[sub.id] && <div className="text-[10px] text-swe-yellow/70">🏆 {championMap[sub.id]}</div>}
                  </div>
                  <div className="text-right flex-shrink-0 w-10">
                    <div className={`font-display font-black text-xl tnum ${i === 0 ? 'text-swe-yellow' : 'text-white/55'}`}>{pts}</div>
                    <div className="text-[9px] text-white/20 uppercase">p</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Aggregated picks */}
      {(topScorers.length > 0 || topChampions.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {topScorers.length > 0 && (
            <div className="border border-white/10">
              <div className="px-4 py-3 border-b border-white/10 bg-navy-900">
                <div className="label">Skyttekungsförslag</div>
              </div>
              <div className="divide-y divide-white/5">
                {topScorers.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm text-white/80">{name}</span>
                    <span className="font-display font-black text-swe-yellow text-sm tnum">{count}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {topChampions.length > 0 && (
            <div className="border border-white/10">
              <div className="px-4 py-3 border-b border-white/10 bg-navy-900">
                <div className="label">VM-vinnare-förslag</div>
              </div>
              <div className="divide-y divide-white/5">
                {topChampions.map(([team, count]) => (
                  <div key={team} className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm text-white/80">{team}</span>
                    <span className="font-display font-black text-swe-yellow text-sm tnum">{count}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sync status */}
      <div className="border border-white/10 px-4 py-3 flex flex-wrap gap-6">
        <div>
          <div className="label text-[9px] mb-1">Senaste matchsync</div>
          <div className="text-xs text-white/50">{lastMatchSync ? new Date(lastMatchSync).toLocaleString('sv-SE') : '—'}</div>
        </div>
        <div>
          <div className="label text-[9px] mb-1">Senaste spelarsync</div>
          <div className="text-xs text-white/50">{lastPlayerSync ? new Date(lastPlayerSync).toLocaleString('sv-SE') : '—'}</div>
        </div>
        {locked > 0 && (
          <div>
            <div className="label text-[9px] mb-1">Individuellt låsta</div>
            <div className="text-xs text-loss-500">{locked} st</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Participants Tab ───────────────────────────────────────────────────────────

function ParticipantsTab({
  confirmed,
  unconfirmed,
  scorerMap,
  championMap,
  onLockChange,
  onNoteChange,
  adminLastSeen,
}: {
  confirmed: SubmissionData[]
  unconfirmed: SubmissionData[]
  scorerMap: Record<string, string>
  championMap: Record<string, string>
  onLockChange: (id: string, locked: boolean) => void
  onNoteChange: (id: string, note: string | null) => void
  adminLastSeen: string | null
}) {
  const newCount = [...confirmed, ...unconfirmed].filter(s => isNew(s, adminLastSeen)).length
  const all = [...confirmed, ...unconfirmed]

  return (
    <div className="border border-white/10">
      <div className="px-4 py-3 border-b border-white/10 bg-navy-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="label">Alla tips</div>
          {newCount > 0 && (
            <span className="text-[9px] font-display font-black border border-swe-yellow text-swe-yellow px-1.5 py-0.5 bg-swe-yellow/10">
              +{newCount} NYA
            </span>
          )}
        </div>
        <span className="text-[10px] text-white/25">Klicka på en rad för att se fullständiga tips</span>
      </div>

      <div className="hidden md:grid grid-cols-[20px_28px_1fr_auto_auto_auto] gap-3 items-center px-4 h-8 border-b border-white/5 bg-navy-900/40">
        <span />
        <span className="label text-[9px]">#</span>
        <span className="label text-[9px]">Deltagare</span>
        <span className="label text-[9px] text-right">Scorer / Vinnare</span>
        <span className="label text-[9px] text-right">Poäng</span>
        <span className="label text-[9px] text-right">Åtgärder</span>
      </div>

      {all.length === 0 ? (
        <div className="px-4 py-12 text-center text-white/30 text-sm">Inga tips inskickade ännu.</div>
      ) : (
        <div>
          {all.map(sub => {
            const rank = confirmed.indexOf(sub)
            return (
              <AdminSubmissionRow
                key={sub.id}
                id={sub.id}
                name={sub.name}
                email={sub.email}
                submitted_at={sub.submitted_at}
                confirmed={sub.confirmed}
                total_points={sub.total_points}
                scorer={scorerMap[sub.id] ?? null}
                champion={championMap[sub.id] ?? null}
                rank={sub.confirmed && rank >= 0 ? rank + 1 : null}
                admin_locked={sub.admin_locked}
                admin_note={sub.admin_note}
                is_new={isNew(sub, adminLastSeen)}
                onLockChange={onLockChange}
                onNoteChange={onNoteChange}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Matches Tab ────────────────────────────────────────────────────────────────

function MatchesTab({
  matches,
  onOverride,
  onRecalculate,
  recalcLoading,
  config,
}: {
  matches: MatchData[]
  onOverride: (matchId: number, result: string | null) => Promise<void>
  onRecalculate: () => Promise<void>
  recalcLoading: boolean
  config: Record<string, string>
}) {
  const [phase, setPhase] = useState<'group' | 'knockout'>('group')
  // Staged 1/X/2 (or 'CLEAR') per match — applied in one go by "Uppdatera poäng".
  const [pendingResult, setPendingResult] = useState<Record<number, string>>({})
  const [updating, setUpdating] = useState(false)

  const scoringFrozen = config['scoring_frozen'] === 'true'
  const emergencyMode = config['emergency_mode'] === 'true'

  // Match-chronological order (by kickoff), match number as tie-breaker.
  function byKickoff(a: MatchData, b: MatchData) {
    const ka = a.kickoff ? Date.parse(a.kickoff) : Number.POSITIVE_INFINITY
    const kb = b.kickoff ? Date.parse(b.kickoff) : Number.POSITIVE_INFINITY
    return (ka - kb) || ((a.match_number ?? 0) - (b.match_number ?? 0))
  }

  const visibleMatches = matches
    .filter(m => (phase === 'group' ? m.phase === 'group' : m.phase !== 'group'))
    .sort(byKickoff)

  const pendingCount = Object.keys(pendingResult).length
  const busy = updating || recalcLoading

  function stage(matchId: number, value: string) {
    setPendingResult(prev => {
      const next = { ...prev }
      if (next[matchId] === value) delete next[matchId]
      else next[matchId] = value
      return next
    })
  }

  // Save every staged result, then recalculate points once for everyone.
  async function handleUpdate() {
    setUpdating(true)
    for (const [id, val] of Object.entries(pendingResult)) {
      await onOverride(Number(id), val === 'CLEAR' ? null : val)
    }
    setPendingResult({})
    await onRecalculate()
    setUpdating(false)
  }

  function formatDate(kickoff: string | null) {
    if (!kickoff) return 'Tid ej satt'
    const d = new Date(kickoff)
    if (Number.isNaN(d.getTime())) return 'Tid ej satt'
    return d.toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' })
  }
  function formatTime(kickoff: string | null) {
    if (!kickoff) return ''
    const d = new Date(kickoff)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
  }

  function MatchRow({ m }: { m: MatchData }) {
    const activeResult = m.manual_override ? m.manual_result : m.result
    const pending = pendingResult[m.id]
    const clearStaged = pending === 'CLEAR'
    // What the row will resolve to once staged changes are applied.
    const effective = pending ? (clearStaged ? null : pending) : activeResult
    // A match "counts" the instant it has an effective result — exactly the rule
    // the scoring engine uses (manual override wins, otherwise the synced result).
    // Keying the admin marking off the same value keeps the panel and the points
    // perfectly in sync: anything shown as Klar here is already in the totals.
    const reported = !!activeResult
    const accent = pending
      ? 'border-l-2 border-l-swe-yellow'
      : reported
      ? 'border-l-2 border-l-pitch-500/60'
      : 'border-l-2 border-l-transparent'

    return (
      <div className={`flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0 ${accent}`}>
        <div className="w-10 shrink-0 text-[10px] font-mono tnum text-white/30">
          {m.kickoff ? formatTime(m.kickoff) : (m.match_number ? `#${m.match_number}` : '')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className={`font-medium ${effective === '1' ? 'text-swe-yellow' : 'text-white/70'}`}>{m.home_team}</span>
            <span className="text-white/20 text-xs">vs</span>
            <span className={`font-medium ${effective === '2' ? 'text-swe-yellow' : 'text-white/70'}`}>{m.away_team}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {m.group_label && (
              <span className="text-[10px] text-white/25">Grupp {m.group_label}</span>
            )}
            {m.result && (
              <span className="text-[10px] text-white/30">API: {m.result}</span>
            )}
            {m.manual_override && (
              <span className="text-[10px] border border-swe-yellow/30 text-swe-yellow/60 px-1">OVERRIDE: {m.manual_result}</span>
            )}
            {pending ? (
              <span className="text-[10px] border border-swe-yellow/50 text-swe-yellow px-1">
                {clearStaged ? 'RENSAS — räknas bort' : `ÄNDRAS → ${pending}`}
              </span>
            ) : reported ? (
              <span className="text-[10px] border border-pitch-500/40 text-pitch-400 px-1">✓ Klar · räknas i poäng</span>
            ) : (
              <span className="text-[10px] text-white/20">Ej inrapporterad</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {(['1','X','2'] as const).map(v => {
            const staged = pending === v
            // Pre-mark the current result whatever its source (manual or synced),
            // so already-reported matches show as set and aren't re-entered.
            const isCurrent = !pending && activeResult === v
            return (
              <button
                key={v}
                onClick={() => stage(m.id, v)}
                disabled={busy}
                className={`w-8 h-8 text-xs font-display font-black border transition-colors disabled:opacity-40 ${
                  staged
                    ? 'bg-swe-yellow text-navy-950 border-swe-yellow'
                    : isCurrent
                    ? 'border-pitch-500/60 text-pitch-400 bg-pitch-900/25'
                    : 'border-white/10 text-white/30 hover:border-white/30 hover:text-white/70'
                }`}
              >
                {v}
              </button>
            )
          })}
          {m.manual_override && (
            <button
              onClick={() => stage(m.id, 'CLEAR')}
              disabled={busy}
              className={`px-2 h-8 text-[10px] font-display font-black uppercase border transition-colors disabled:opacity-40 ${
                clearStaged
                  ? 'border-loss-500 text-loss-500 bg-loss-900/20'
                  : 'border-white/10 text-white/25 hover:border-loss-500/30 hover:text-loss-500'
              }`}
            >
              {clearStaged ? 'Ångra' : 'Rensa'}
            </button>
          )}
        </div>
      </div>
    )
  }

  const reportedCount = visibleMatches.filter(m => (m.manual_override ? m.manual_result : m.result)).length
  let lastDate = ''

  return (
    <div className="space-y-6">
      {(scoringFrozen || emergencyMode) && (
        <div className="border border-loss-500/30 bg-loss-900/10 px-4 py-3 text-sm text-loss-500">
          {emergencyMode ? 'Nödläge aktivt — matchdata synkas inte' : 'Scoring fryst — omräkning hoppar'}
        </div>
      )}

      {/* Fill in results, then apply + recalculate in one go */}
      <div className="border border-white/10 px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-display font-black uppercase tracking-wide text-white">Uppdatera poäng</div>
          <div className="text-xs text-white/35 mt-0.5">
            {pendingCount > 0
              ? `${pendingCount} ${pendingCount === 1 ? 'osparat resultat' : 'osparade resultat'} — sparas och poäng räknas om för alla`
              : `${reportedCount} av ${visibleMatches.length} matcher inrapporterade i denna fas — de räknas redan i poängen`}
          </div>
        </div>
        <button
          onClick={handleUpdate}
          disabled={busy || scoringFrozen}
          className={`px-4 py-2 text-xs font-display font-black uppercase tracking-wide border transition-colors disabled:opacity-40 ${
            pendingCount > 0
              ? 'border-swe-yellow bg-swe-yellow/10 text-swe-yellow hover:bg-swe-yellow/20'
              : 'border-swe-yellow/30 text-swe-yellow hover:bg-swe-yellow/10'
          }`}
        >
          {busy ? 'Uppdaterar…' : pendingCount > 0 ? `Uppdatera (${pendingCount})` : 'Räkna om poäng'}
        </button>
      </div>

      {/* Phase selector */}
      <div className="flex gap-0 border border-white/10">
        {(['group','knockout'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPhase(p)}
            className={`flex-1 py-2.5 text-xs font-display font-black uppercase tracking-wider transition-colors border-r border-white/10 last:border-0 ${
              phase === p ? 'bg-navy-900 text-white' : 'text-white/35 hover:text-white/60'
            }`}
          >
            {p === 'group' ? 'Gruppspel' : 'Slutspel'}
          </button>
        ))}
      </div>

      {/* One chronological list (by kickoff) with date headers */}
      <div className="border border-white/10">
        {visibleMatches.length === 0 ? (
          <div className="px-4 py-6 text-sm text-white/25">
            {phase === 'group' ? 'Inga gruppspelsmatcher hittades.' : 'Inga slutspelsmatcher ännu.'}
          </div>
        ) : (
          visibleMatches.map(m => {
            const dateLabel = formatDate(m.kickoff)
            const showHeader = dateLabel !== lastDate
            lastDate = dateLabel
            return (
              <div key={m.id}>
                {showHeader && (
                  <div className="px-4 py-2 bg-navy-900 border-b border-white/10">
                    <div className="label text-[10px]">{dateLabel}</div>
                  </div>
                )}
                <MatchRow m={m} />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── System Tab ─────────────────────────────────────────────────────────────────

const CONFIG_ITEMS: Array<{
  key: string
  label: string
  description: string
  danger?: boolean
}> = [
  { key: 'global_lock', label: 'Globalt lås', description: 'Stänger alla tips — ingen kan skicka in eller redigera', danger: true },
  { key: 'emergency_mode', label: 'Nödläge', description: 'Fryser live-uppdateringar, scoring och matchsync', danger: true },
  { key: 'disable_submissions', label: 'Stäng nya anmälningar', description: 'Hindrar nya tips från att skickas in' },
  { key: 'scoring_frozen', label: 'Frys scoring', description: 'Stoppar alla omräkningar av poäng' },
]

function SystemTab({
  config,
  onConfigChange,
  onRecalculate,
  recalcLoading,
  lastMatchSync,
}: {
  config: Record<string, string>
  onConfigChange: (key: string, value: string) => Promise<void>
  onRecalculate: () => Promise<void>
  recalcLoading: boolean
  lastMatchSync: string | null
}) {
  const [banner, setBanner] = useState(config['maintenance_banner'] ?? '')
  const [bannerSaving, setBannerSaving] = useState(false)
  const [toggling, setToggling] = useState<Record<string, boolean>>({})

  async function handleToggle(key: string) {
    const current = config[key] === 'true'
    setToggling(prev => ({ ...prev, [key]: true }))
    await onConfigChange(key, current ? 'false' : 'true')
    setToggling(prev => ({ ...prev, [key]: false }))
  }

  async function saveBanner() {
    setBannerSaving(true)
    await onConfigChange('maintenance_banner', banner)
    setBannerSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Toggles */}
      <div className="border border-white/10">
        <div className="px-4 py-3 border-b border-white/10 bg-navy-900">
          <div className="label">System-inställningar</div>
        </div>
        <div className="divide-y divide-white/5">
          {CONFIG_ITEMS.map(item => {
            const active = config[item.key] === 'true'
            const isToggling = toggling[item.key]
            return (
              <div key={item.key} className={`flex items-center justify-between px-4 py-3.5 ${item.danger && active ? 'bg-loss-900/20' : ''}`}>
                <div>
                  <div className={`text-sm font-display font-black uppercase tracking-wide ${item.danger && active ? 'text-loss-500' : 'text-white/80'}`}>
                    {item.label}
                  </div>
                  <div className="text-xs text-white/35 mt-0.5">{item.description}</div>
                </div>
                <button
                  onClick={() => handleToggle(item.key)}
                  disabled={isToggling}
                  className={`flex-shrink-0 w-12 h-6 border transition-colors disabled:opacity-40 ${
                    active
                      ? item.danger ? 'bg-loss-500/20 border-loss-500/50' : 'bg-pitch-900/40 border-pitch-500/50'
                      : 'bg-navy-900 border-white/15 hover:border-white/30'
                  }`}
                >
                  <div className={`w-4 h-4 mx-1 transition-all ${
                    active ? 'translate-x-6 ' + (item.danger ? 'bg-loss-500' : 'bg-pitch-400') : 'bg-white/25'
                  }`} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Maintenance banner */}
      <div className="border border-white/10">
        <div className="px-4 py-3 border-b border-white/10 bg-navy-900">
          <div className="label">Underhållsbanner</div>
        </div>
        <div className="px-4 py-4 space-y-3">
          <div className="text-xs text-white/35">Visas som en banner i appen. Lämna tomt för att dölja.</div>
          <textarea
            value={banner}
            onChange={e => setBanner(e.target.value)}
            placeholder="T.ex. 'Vi är på kort underhåll — kom tillbaka om 5 minuter'"
            rows={2}
            className="w-full bg-navy-950 border border-white/15 px-3 py-2 text-sm text-white/80 placeholder:text-white/20 resize-none focus:outline-none focus:border-white/30"
          />
          <button
            onClick={saveBanner}
            disabled={bannerSaving}
            className="px-4 py-2 text-xs font-display font-black uppercase border border-pitch-500/30 text-pitch-400 hover:bg-pitch-900/20 disabled:opacity-40 transition-colors"
          >
            {bannerSaving ? 'Sparar…' : 'Spara banner'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="border border-white/10">
        <div className="px-4 py-3 border-b border-white/10 bg-navy-900">
          <div className="label">Åtgärder</div>
        </div>
        <div className="divide-y divide-white/5">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <div className="text-sm font-display font-black uppercase tracking-wide text-white/80">Räkna om poäng</div>
              <div className="text-xs text-white/35 mt-0.5">Räknar om total_points för alla bekräftade deltagare</div>
            </div>
            <button
              onClick={onRecalculate}
              disabled={recalcLoading || config['scoring_frozen'] === 'true'}
              className="px-4 py-2 text-xs font-display font-black uppercase border border-swe-yellow/30 text-swe-yellow hover:bg-swe-yellow/10 disabled:opacity-40 transition-colors"
            >
              {recalcLoading ? 'Räknar…' : 'Kör nu'}
            </button>
          </div>

          <div className="flex items-center justify-between px-4 py-3.5">
            <div>
              <div className="text-sm font-display font-black uppercase tracking-wide text-white/80">Exportera CSV</div>
              <div className="text-xs text-white/35 mt-0.5">Deltagare, status, poäng, picks och admin-notat</div>
            </div>
            <a
              href="/api/admin/export"
              download
              className="px-4 py-2 text-xs font-display font-black uppercase border border-white/20 text-white/60 hover:border-white/40 hover:text-white transition-colors"
            >
              Ladda ner
            </a>
          </div>
        </div>
      </div>

      {/* Developer tools */}
      <div className="border border-white/10">
        <div className="px-4 py-3 border-b border-white/10 bg-navy-900">
          <div className="label">Verktyg</div>
        </div>
        <div className="px-4 py-4 space-y-4">
          <div>
            <div className="text-xs text-white/40 mb-2">Återskapa/återställ adminlösenordet i Supabase Auth.</div>
            <SetupAdminButton />
          </div>
          <div>
            <div className="text-xs text-white/40 mb-2">Skicka ett enkelt testmail via Gmail SMTP till adminadressen.</div>
            <TestEmailButton />
          </div>
          <div>
            <div className="text-xs text-white/40 mb-2">Öppna bracket-preview med komplett testdata.</div>
            <Link
              href="/admin/bracket-preview"
              className="inline-flex h-9 items-center border border-white/15 px-4 text-sm font-display font-black text-white/70 hover:border-white/30 hover:text-white transition-colors"
            >
              Bracket-preview
            </Link>
          </div>
          {lastMatchSync && (
            <div className="text-[10px] text-white/25 border-t border-white/5 pt-3 mt-2">
              Senaste matchsync: {new Date(lastMatchSync).toLocaleString('sv-SE')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

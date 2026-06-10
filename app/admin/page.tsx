import { createClient, createServiceClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import { redirect } from 'next/navigation'
import { getSystemConfig, setSystemConfig } from '@/lib/system-config'
import ControlRoom from './ControlRoom'
import type { SubmissionData, MatchData } from './ControlRoom'
import ScorerResultsForm from './ScorerResultsForm'
import { ADMIN_EMAIL } from '@/lib/admin-email'
import { GROUPS } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/')

  const service = createServiceClient()

  const [
    { data: submissionRows },
    { data: scorerPicks },
    { data: finalPicks },
    { data: matchRows },
    { data: syncLogs },
    systemConfig,
  ] = await Promise.all([
    service
      .from('vmt_submissions')
      .select('id, name, email, submitted_at, confirmed, total_points, admin_locked, admin_note, admin_edited_at, admin_edited_by')
      .order('total_points', { ascending: false }),
    service.from('vmt_tournament_scorer_pick').select('submission_id, player_name'),
    service.from('vmt_bracket_picks').select('submission_id, pick_team').eq('match_number', 104),
    service
      .from('vmt_matches')
      .select('id, match_number, phase, group_label, home_team, away_team, result, manual_result, manual_override')
      .order('id'),
    service.from('vmt_sync_log').select('sync_key, synced_at'),
    getSystemConfig(),
  ])

  // Admin-entered scorer facit (drives gruppskyttekung + turneringsskyttekung points)
  const { data: scorerContent } = await service
    .from('vmt_page_content')
    .select('key, value')
    .or('key.like.scoring.group_scorer.%,key.eq.scoring.tournament_scorer')

  const initialGroupScorers: Record<string, string> = Object.fromEntries(GROUPS.map(g => [g, '']))
  let initialTournamentScorer = ''
  for (const row of scorerContent ?? []) {
    if (row.key === 'scoring.tournament_scorer') initialTournamentScorer = row.value ?? ''
    else {
      const group = row.key.split('.').pop()
      if (group && group in initialGroupScorers) initialGroupScorers[group] = row.value ?? ''
    }
  }

  // Capture the previous visit time before bumping it
  const adminLastSeen = systemConfig['admin_last_seen'] ?? null

  // Update last-seen timestamp — fire and forget, don't block render
  setSystemConfig('admin_last_seen', new Date().toISOString(), ADMIN_EMAIL).catch(() => {})

  const submissions: SubmissionData[] = (submissionRows ?? []).map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    submitted_at: s.submitted_at,
    confirmed: s.confirmed,
    total_points: s.total_points,
    admin_locked: s.admin_locked ?? false,
    admin_note: s.admin_note ?? null,
    admin_edited_at: s.admin_edited_at ?? null,
    admin_edited_by: s.admin_edited_by ?? null,
  }))

  const matches: MatchData[] = (matchRows ?? []).map(m => ({
    id: m.id,
    match_number: m.match_number,
    phase: m.phase,
    group_label: m.group_label,
    home_team: m.home_team,
    away_team: m.away_team,
    result: m.result,
    manual_result: m.manual_result ?? null,
    manual_override: m.manual_override ?? false,
  }))

  const scorerMap = Object.fromEntries((scorerPicks ?? []).map(p => [p.submission_id, p.player_name]))
  const championMap = Object.fromEntries((finalPicks ?? []).map(p => [p.submission_id, p.pick_team]))
  const lastMatchSync = syncLogs?.find(r => r.sync_key === 'match_results')?.synced_at ?? null
  const lastPlayerSync = syncLogs?.find(r => r.sync_key === 'player_stats')?.synced_at ?? null

  return (
    <div className="min-h-screen bg-navy-950">
      <NavBar userName={user.email} />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <div className="label mb-1">Admin</div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wide text-white">
            Tournament Control Room
          </h1>
        </div>

        <ControlRoom
          submissions={submissions}
          scorerMap={scorerMap}
          championMap={championMap}
          matches={matches}
          systemConfig={systemConfig}
          lastMatchSync={lastMatchSync}
          lastPlayerSync={lastPlayerSync}
          adminLastSeen={adminLastSeen}
        />

        {/* ── SKYTTEKUNGS-FACIT ── */}
        <div className="mt-12 border border-white/10 p-5">
          <div className="label mb-1">Skyttekungs-facit</div>
          <p className="text-xs text-white/35 mb-5 max-w-xl leading-relaxed">
            Fyll i den faktiska skyttekungen per grupp (när gruppen är färdigspelad) och för hela
            turneringen. Lämna tomt så räknas skytteligan automatiskt från matchdata. Vid delad
            skytteliga: separera namn med komma. Kör därefter &ldquo;Räkna om poäng&rdquo;.
          </p>
          <ScorerResultsForm
            initialGroupScorers={initialGroupScorers}
            initialTournamentScorer={initialTournamentScorer}
          />
        </div>
      </main>
    </div>
  )
}

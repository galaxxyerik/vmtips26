import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { calculateScore, type MatchForScoring, type SubmissionPicks } from '@/lib/scoring'

const ADMIN_EMAIL = 'eeengstrand@gmail.com'

async function isAllowed(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) return true
  if (process.env.NODE_ENV !== 'production') return true
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email === ADMIN_EMAIL
}

export async function POST(req: NextRequest) {
  if (!(await isAllowed(req))) {
    return NextResponse.json({ error: 'Obehörig' }, { status: 401 })
  }

  const service = createServiceClient()

  // Load all match data needed for scoring
  const { data: matchRows, error: matchErr } = await service
    .from('vmt_matches')
    .select('id, match_number, phase, group_label, home_team, away_team, result, home_goal_scorers, away_goal_scorers')
    .order('id')

  if (matchErr || !matchRows) {
    return NextResponse.json({ error: 'Kunde inte hämta matchdata' }, { status: 500 })
  }

  const matches: MatchForScoring[] = matchRows.map(m => ({
    id: m.id,
    match_number: m.match_number,
    phase: m.phase,
    group_label: m.group_label,
    home_team: m.home_team,
    away_team: m.away_team,
    result: m.result as '1' | 'X' | '2' | null,
    home_goal_scorers: (m.home_goal_scorers as string[]) ?? [],
    away_goal_scorers: (m.away_goal_scorers as string[]) ?? [],
  }))

  // Load confirmed submissions
  const { data: submissions } = await service
    .from('vmt_submissions')
    .select('id')
    .eq('confirmed', true)

  if (!submissions || submissions.length === 0) {
    return NextResponse.json({ ok: true, updated: 0, message: 'No confirmed submissions' })
  }

  let updated = 0
  let errors = 0

  for (const sub of submissions) {
    try {
      const picks = await loadSubmissionPicks(service, sub.id)
      if (!picks) continue
      const score = calculateScore(picks, matches)
      await service
        .from('vmt_submissions')
        .update({ total_points: score })
        .eq('id', sub.id)
      updated++
    } catch (err) {
      console.error(`Score error for submission ${sub.id}:`, err)
      errors++
    }
  }

  return NextResponse.json({ ok: true, updated, errors, total: submissions.length })
}

export async function GET(req: NextRequest) {
  return POST(req)
}

// ── Load all picks for one submission ─────────────────────────────────────────

async function loadSubmissionPicks(
  service: Awaited<ReturnType<typeof createServiceClient>>,
  submissionId: string
): Promise<SubmissionPicks | null> {
  const [
    { data: groupPicks },
    { data: tableOrder },
    { data: thirdPlace },
    { data: groupScorers },
    { data: bracketPicks },
    { data: tournamentScorer },
  ] = await Promise.all([
    service.from('vmt_group_picks').select('match_id, pick').eq('submission_id', submissionId),
    service.from('vmt_group_table_picks').select('group_label, position, team').eq('submission_id', submissionId).order('position'),
    service.from('vmt_third_place_picks').select('group_label, selected').eq('submission_id', submissionId),
    service.from('vmt_group_scorer_picks').select('group_label, player_name').eq('submission_id', submissionId),
    service.from('vmt_bracket_picks').select('match_number, pick_team').eq('submission_id', submissionId),
    service.from('vmt_tournament_scorer_pick').select('player_name').eq('submission_id', submissionId).maybeSingle(),
  ])

  if (!groupPicks) return null

  const groupTableOrder: Record<string, string[]> = {}
  for (const row of tableOrder ?? []) {
    if (!groupTableOrder[row.group_label]) groupTableOrder[row.group_label] = []
    groupTableOrder[row.group_label][row.position - 1] = row.team
  }

  return {
    matchPicks: Object.fromEntries((groupPicks ?? []).map(r => [r.match_id, r.pick])),
    groupTableOrder,
    thirdPlaceSelected: (thirdPlace ?? []).filter(r => r.selected).map(r => r.group_label),
    groupScorers: Object.fromEntries((groupScorers ?? []).map(r => [r.group_label, r.player_name])),
    bracketPicks: Object.fromEntries((bracketPicks ?? []).map(r => [r.match_number, r.pick_team])),
    tournamentScorer: tournamentScorer?.player_name ?? '',
  }
}

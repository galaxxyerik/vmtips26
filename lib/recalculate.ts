import type { SupabaseClient } from '@supabase/supabase-js'
import { calculateScore, type MatchForScoring, type ScoringOverrides, type SubmissionPicks } from '@/lib/scoring'
import { getSystemConfig } from '@/lib/system-config'

/**
 * The ONE scoring engine. Both the admin "Räkna om poäng" button and the nightly
 * match sync go through this — never reimplement point calculation elsewhere.
 */
export async function recalculateAllScores(service: SupabaseClient): Promise<
  | { ok: false; skipped: true; reason: string }
  | { ok: true; updated: number; errors: number; total: number }
> {
  const sysConfig = await getSystemConfig()
  if (sysConfig['scoring_frozen'] === 'true') {
    return { ok: false, skipped: true, reason: 'scoring_frozen' }
  }

  const { data: matchRows, error: matchErr } = await service
    .from('vmt_matches')
    .select('id, match_number, phase, group_label, home_team, away_team, result, manual_result, manual_override, home_goal_scorers, away_goal_scorers')
    .order('id')

  if (matchErr || !matchRows) {
    throw new Error(`Kunde inte hämta matchdata: ${matchErr?.message ?? 'okänt fel'}`)
  }

  const matches: MatchForScoring[] = matchRows.map(m => ({
    id: m.id,
    match_number: m.match_number,
    phase: m.phase,
    group_label: m.group_label,
    home_team: m.home_team,
    away_team: m.away_team,
    result: (m.manual_override ? m.manual_result : m.result) as '1' | 'X' | '2' | null,
    home_goal_scorers: m.home_goal_scorers ?? [],
    away_goal_scorers: m.away_goal_scorers ?? [],
  }))

  const overrides = await loadScoringOverrides(service)

  const { data: submissions } = await service
    .from('vmt_submissions')
    .select('id')
    .eq('confirmed', true)

  if (!submissions || submissions.length === 0) {
    return { ok: true, updated: 0, errors: 0, total: 0 }
  }

  let updated = 0
  let errors = 0

  for (const sub of submissions) {
    try {
      const picks = await loadSubmissionPicks(service, sub.id)
      if (!picks) continue
      const score = calculateScore(picks, matches, overrides)
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

  return { ok: true, updated, errors, total: submissions.length }
}

/** Admin-entered scorer facit from vmt_page_content (set via /api/admin/scorer-results). */
export async function loadScoringOverrides(service: SupabaseClient): Promise<ScoringOverrides> {
  const { data } = await service
    .from('vmt_page_content')
    .select('key, value')
    .or('key.like.scoring.group_scorer.%,key.eq.scoring.tournament_scorer')

  const groupScorers: Record<string, string> = {}
  let tournamentScorer: string | undefined

  for (const row of data ?? []) {
    if (!row.value?.trim()) continue
    if (row.key === 'scoring.tournament_scorer') tournamentScorer = row.value
    else {
      const group = row.key.split('.').pop()
      if (group) groupScorers[group] = row.value
    }
  }

  return { groupScorers, tournamentScorer }
}

// ── Load all picks for one submission ─────────────────────────────────────────

export async function loadSubmissionPicks(
  service: SupabaseClient,
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

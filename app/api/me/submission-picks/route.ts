import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { OnboardingDraft } from '@/lib/types'

const ALL_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const { data: submission } = await service
    .from('vmt_submissions')
    .select('id, name, email')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!submission) return NextResponse.json({ error: 'Missing submission' }, { status: 404 })

  const [
    { data: groupPicks },
    { data: tableOrder },
    { data: thirdPlace },
    { data: groupScorers },
    { data: bracketPicks },
    { data: tournamentScorer },
    { data: matches },
  ] = await Promise.all([
    service.from('vmt_group_picks').select('match_id, pick').eq('submission_id', submission.id),
    service.from('vmt_group_table_picks').select('group_label, position, team').eq('submission_id', submission.id).order('position'),
    service.from('vmt_third_place_picks').select('group_label, selected').eq('submission_id', submission.id),
    service.from('vmt_group_scorer_picks').select('group_label, player_name').eq('submission_id', submission.id),
    service.from('vmt_bracket_picks').select('match_number, pick_team, round').eq('submission_id', submission.id).order('match_number'),
    service.from('vmt_tournament_scorer_pick').select('player_name').eq('submission_id', submission.id).maybeSingle(),
    service.from('vmt_matches').select('id, group_label, home_team, away_team').eq('phase', 'group').order('id'),
  ])

  const matchPicks = Object.fromEntries((groupPicks ?? []).map(row => [row.match_id, row.pick]))
  const groupTableOrder: Record<string, string[]> = {}
  for (const group of ALL_GROUPS) {
    groupTableOrder[group] = (tableOrder ?? [])
      .filter(row => row.group_label === group)
      .sort((a, b) => a.position - b.position)
      .map(row => row.team)
  }

  const draft: OnboardingDraft = {
    step: 'group-stage',
    updatedAt: new Date().toISOString(),
    submissionId: submission.id,
    matchPicks,
    groupTableOrder,
    thirdPlaceSelected: (thirdPlace ?? []).filter(row => row.selected).map(row => row.group_label),
    groupScorers: Object.fromEntries((groupScorers ?? []).map(row => [row.group_label, row.player_name])),
    bracketPicks: Object.fromEntries((bracketPicks ?? []).map(row => [row.match_number, row.pick_team])),
    tournamentScorer: tournamentScorer?.player_name ?? '',
    name: submission.name,
    email: submission.email,
  }

  const groups = Object.fromEntries(ALL_GROUPS.map(group => [
    group,
    {
      matches: (matches ?? [])
        .filter(match => match.group_label === group)
        .map(match => ({
          id: match.id,
          home_team: match.home_team,
          away_team: match.away_team,
          pick: matchPicks[match.id] ?? null,
        })),
      tableOrder: groupTableOrder[group] ?? [],
      thirdPlaceSelected: (thirdPlace ?? []).find(row => row.group_label === group)?.selected ?? false,
      groupScorer: (groupScorers ?? []).find(row => row.group_label === group)?.player_name ?? null,
    },
  ]))

  return NextResponse.json({
    submissionId: submission.id,
    draft,
    groups,
    bracketPicks: bracketPicks ?? [],
    tournamentScorer: tournamentScorer?.player_name ?? null,
  })
}

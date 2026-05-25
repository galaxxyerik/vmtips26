import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ADMIN_EMAIL } from '@/lib/admin-email'

const ALL_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sid = req.nextUrl.searchParams.get('id')
  if (!sid) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const service = createServiceClient()

  const [
    { data: groupPicks },
    { data: tableOrder },
    { data: thirdPlace },
    { data: groupScorers },
    { data: bracketPicks },
    { data: tournamentScorer },
    { data: matches },
  ] = await Promise.all([
    service.from('vmt_group_picks').select('match_id, pick').eq('submission_id', sid),
    service.from('vmt_group_table_picks').select('group_label, position, team').eq('submission_id', sid).order('position'),
    service.from('vmt_third_place_picks').select('group_label, selected').eq('submission_id', sid),
    service.from('vmt_group_scorer_picks').select('group_label, player_name').eq('submission_id', sid),
    service.from('vmt_bracket_picks').select('match_number, pick_team, round').eq('submission_id', sid).order('match_number'),
    service.from('vmt_tournament_scorer_pick').select('player_name').eq('submission_id', sid).maybeSingle(),
    service.from('vmt_matches').select('id, group_label, home_team, away_team').eq('phase', 'group').order('id'),
  ])

  const pickByMatch: Record<number, string> = {}
  for (const p of groupPicks ?? []) pickByMatch[p.match_id] = p.pick

  const groups: Record<string, {
    matches: { id: number; home_team: string; away_team: string; pick: string | null }[]
    tableOrder: string[]
    thirdPlaceSelected: boolean
    groupScorer: string | null
  }> = {}

  for (const g of ALL_GROUPS) {
    const gMatches = (matches ?? []).filter(m => m.group_label === g)
    const order = (tableOrder ?? [])
      .filter(r => r.group_label === g)
      .sort((a, b) => a.position - b.position)
      .map(r => r.team)
    const third = (thirdPlace ?? []).find(r => r.group_label === g)
    const scorer = (groupScorers ?? []).find(r => r.group_label === g)

    groups[g] = {
      matches: gMatches.map(m => ({
        id: m.id,
        home_team: m.home_team,
        away_team: m.away_team,
        pick: pickByMatch[m.id] ?? null,
      })),
      tableOrder: order,
      thirdPlaceSelected: third?.selected ?? false,
      groupScorer: scorer?.player_name ?? null,
    }
  }

  return NextResponse.json({
    groups,
    bracketPicks: bracketPicks ?? [],
    tournamentScorer: tournamentScorer?.player_name ?? null,
  })
}

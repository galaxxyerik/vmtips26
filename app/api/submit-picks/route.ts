import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, tournamentScorer, matchPicks, groupTableOrder, thirdPlaceSelected, groupScorers, bracketPicks } = body

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Namn och e-post krävs.' }, { status: 400 })
    }

    const ALL_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']
    const scorerMap = groupScorers as Record<string, string>
    if (!ALL_GROUPS.every(g => scorerMap[g]?.trim())) {
      return NextResponse.json({ error: 'Skyttekung saknas för en eller flera grupper.' }, { status: 400 })
    }

    const matchPickMap = matchPicks as Record<string, string>
    if (Object.keys(matchPickMap).length === 0) {
      return NextResponse.json({ error: 'Gruppspelstips saknas.' }, { status: 400 })
    }

    const bracketPickMap = bracketPicks as Record<string, string>
    const requiredMatches = Array.from({ length: 32 }, (_, i) => 73 + i) // 73–104
    const missingBracket = requiredMatches.filter(n => !bracketPickMap[n])
    if (missingBracket.length > 0) {
      return NextResponse.json({ error: 'Slutspelstips är ofullständigt.' }, { status: 400 })
    }

    if (!tournamentScorer?.trim()) {
      return NextResponse.json({ error: 'Turneringsskyttekung saknas.' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Create auth user if password provided
    let userId: string | null = null
    if (password && password.length >= 8) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { name },
        email_confirm: true,
      })
      if (authError && !authError.message.includes('already registered')) {
        console.error('Auth error:', authError)
      } else if (authData?.user) {
        userId = authData.user.id
      }
    }

    // Create submission
    const { data: submission, error: subError } = await supabase
      .from('vmt_submissions')
      .insert({ name, email, user_id: userId })
      .select('id')
      .single()

    if (subError || !submission) {
      console.error('Submission error:', subError)
      return NextResponse.json({ error: 'Kunde inte spara tips.' }, { status: 500 })
    }

    const sid = submission.id

    // Write group picks (1/X/2)
    const groupPickRows = Object.entries(matchPicks as Record<string, string>).map(([matchId, pick]) => ({
      submission_id: sid, match_id: Number(matchId), pick
    }))
    if (groupPickRows.length > 0) {
      await supabase.from('vmt_group_picks').insert(groupPickRows)
    }

    // Write group table order
    const tableRows: { submission_id: string; group_label: string; position: number; team: string }[] = []
    for (const [group, order] of Object.entries(groupTableOrder as Record<string, string[]>)) {
      order.forEach((team, idx) => tableRows.push({ submission_id: sid, group_label: group, position: idx + 1, team }))
    }
    if (tableRows.length > 0) await supabase.from('vmt_group_table_picks').insert(tableRows)

    // Write third place picks
    const { data: groups } = await supabase.from('vmt_matches').select('group_label').eq('phase','group').not('group_label','is',null)
    const allGroups = [...new Set((groups ?? []).map((g: { group_label: string }) => g.group_label))]
    const thirdRows = allGroups.map(g => ({
      submission_id: sid,
      group_label: g,
      selected: (thirdPlaceSelected as string[]).includes(g),
    }))
    if (thirdRows.length > 0) await supabase.from('vmt_third_place_picks').insert(thirdRows)

    // Write group scorers
    const scorerRows = Object.entries(groupScorers as Record<string, string>)
      .filter(([, v]) => v?.trim())
      .map(([group, player_name]) => ({ submission_id: sid, group_label: group, player_name }))
    if (scorerRows.length > 0) await supabase.from('vmt_group_scorer_picks').insert(scorerRows)

    // Write tournament scorer
    if (tournamentScorer?.trim()) {
      await supabase.from('vmt_tournament_scorer_pick').insert({ submission_id: sid, player_name: tournamentScorer.trim() })
    }

    // Write bracket picks
    const bracketRows = Object.entries(bracketPicks as Record<string, string>).map(([matchNum, team]) => ({
      submission_id: sid,
      match_number: Number(matchNum),
      pick_team: team,
      round: getRound(Number(matchNum)),
    }))
    if (bracketRows.length > 0) await supabase.from('vmt_bracket_picks').insert(bracketRows)

    // Insert notification
    await supabase.from('vmt_notifications').insert({
      type: 'new_submission',
      payload: { name, email, submission_id: sid, submitted_at: new Date().toISOString() },
    })

    return NextResponse.json({ ok: true, submissionId: sid })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Serverfel.' }, { status: 500 })
  }
}

function getRound(matchNumber: number): string {
  if (matchNumber >= 73 && matchNumber <= 88) return 'r32'
  if (matchNumber >= 89 && matchNumber <= 96) return 'r16'
  if (matchNumber >= 97 && matchNumber <= 100) return 'qf'
  if (matchNumber >= 101 && matchNumber <= 102) return 'sf'
  if (matchNumber === 103) return 'bronze'
  if (matchNumber === 104) return 'final'
  return 'r32'
}

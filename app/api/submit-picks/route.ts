import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendMail } from '@/lib/server-mail'
import { canEditPicks } from '@/lib/deadlines'

export async function POST(req: NextRequest) {
  try {
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()
    const body = await req.json()
    const { name, email, password, submissionId, tournamentScorer, matchPicks, groupTableOrder, thirdPlaceSelected, groupScorers, bracketPicks } = body

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Namn och e-post krävs.' }, { status: 400 })
    }

    if (password && password.length < 8) {
      return NextResponse.json({ error: 'Lösenordet måste vara minst 8 tecken.' }, { status: 400 })
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
    const canUpdateExisting = !!submissionId && !!user && canEditPicks()

    // Create auth user if password provided
    let userId: string | null = null
    if (user) {
      userId = user.id
    } else if (password && password.length >= 8) {
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

    let sid: string
    let isUpdate = false

    if (canUpdateExisting) {
      const { data: existing } = await supabase
        .from('vmt_submissions')
        .select('id, user_id')
        .eq('id', submissionId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!existing) {
        return NextResponse.json({ error: 'Kunde inte hitta ditt befintliga tips.' }, { status: 404 })
      }

      isUpdate = true
      sid = existing.id

      const { error: updateError } = await supabase
        .from('vmt_submissions')
        .update({ name, email, submitted_at: new Date().toISOString(), total_points: 0 })
        .eq('id', sid)

      if (updateError) {
        console.error('Submission update error:', updateError)
        return NextResponse.json({ error: 'Kunde inte uppdatera ditt tips.' }, { status: 500 })
      }

      await Promise.all([
        supabase.from('vmt_group_picks').delete().eq('submission_id', sid),
        supabase.from('vmt_group_table_picks').delete().eq('submission_id', sid),
        supabase.from('vmt_third_place_picks').delete().eq('submission_id', sid),
        supabase.from('vmt_group_scorer_picks').delete().eq('submission_id', sid),
        supabase.from('vmt_tournament_scorer_pick').delete().eq('submission_id', sid),
        supabase.from('vmt_bracket_picks').delete().eq('submission_id', sid),
      ])
    } else {
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

      sid = submission.id
    }

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

    // Insert notification only for new submissions
    if (!isUpdate) {
      await supabase.from('vmt_notifications').insert({
        type: 'new_submission',
        payload: { name, email, submission_id: sid, submitted_at: new Date().toISOString() },
      })
    }

    try {
      await sendMail({
        to: email,
        subject: 'Ditt VM-tips har skickats in',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="margin:0 0 12px">Tack ${escapeHtml(name)}!</h2>
            <p>${isUpdate ? 'Ditt tips för VM-tips 26 har nu uppdaterats.' : 'Ditt tips för VM-tips 26 har nu skickats in.'}</p>
            ${isUpdate ? '<p>Din tidigare inlämning har ersatts med den nya versionen.</p>' : '<p>Glöm inte att swisha 100 kr till Erik Engstrand på 0768919007.</p><p>Vi skickar ett nytt mail när tipset har bekräftats.</p>'}
          </div>
        `,
      })
    } catch (error) {
      console.error('Submission email error:', error)
    }

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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

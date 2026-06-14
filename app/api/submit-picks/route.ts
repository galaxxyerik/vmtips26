import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendMail } from '@/lib/server-mail'
import { canEditPicks, hasPostDeadlineEditException } from '@/lib/deadlines'
import { getSystemConfig, isGloballyLocked } from '@/lib/system-config'
import { logAdminAction } from '@/lib/admin-guard'
import { ADMIN_EMAIL } from '@/lib/admin-email'
import { buildR32Bracket, sanitizeBracketPicks, type Group } from '@/lib/bracket-logic'

export async function POST(req: NextRequest) {
  try {
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()
    const body = await req.json()
    const { name, email, password, submissionId, tournamentScorer, matchPicks, groupTableOrder, thirdPlaceSelected, groupScorers, bracketPicks, adminOverride } = body
    const isAdmin = !!user && user.email === ADMIN_EMAIL

    const normalizedName = name?.trim()
    const normalizedEmail = normalizeEmail(email)

    if (!normalizedName || !normalizedEmail) {
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

    // Reject brackets that are impossible given the user's own group picks —
    // last line of defence against stale drafts with picks keyed to the wrong
    // match numbers (the repeated-remap bug fixed June 9).
    {
      const tableOrder = groupTableOrder as Record<string, string[]>
      const winners = {} as Record<Group, string>
      const runners = {} as Record<Group, string>
      const thirdTeams: Partial<Record<Group, string>> = {}
      for (const [g, order] of Object.entries(tableOrder)) {
        winners[g as Group] = order[0]
        runners[g as Group] = order[1]
        thirdTeams[g as Group] = order[2]
      }
      const r32 = buildR32Bracket(winners, runners, thirdTeams, thirdPlaceSelected as Group[])
      if (!r32) {
        return NextResponse.json({ error: 'Ogiltigt tredjeplatsval — gå tillbaka till gruppspelssteget.' }, { status: 400 })
      }
      const numericPicks: Record<number, string> = {}
      for (const [k, v] of Object.entries(bracketPickMap)) numericPicks[Number(k)] = v
      const valid = sanitizeBracketPicks(numericPicks, r32)
      const invalid = requiredMatches.filter(n => !valid[n])
      if (invalid.length > 0) {
        return NextResponse.json({
          error: 'Dina slutspelstips stämmer inte längre med ditt gruppspel. Öppna slutspelssteget igen och kontrollera dina val.',
        }, { status: 400 })
      }
    }

    if (!tournamentScorer?.trim()) {
      return NextResponse.json({ error: 'Turneringsskyttekung saknas.' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: existingByEmail } = await supabase
      .from('vmt_submissions')
      .select('id, user_id, admin_locked, name')
      .ilike('email', normalizedEmail)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Bypass deadline + lock checks for admin
    const bypassLock = isAdmin && adminOverride === true
    // Post-deadline edit exception: a named user redoing slutspel picks lost in
    // the May 28 incident. Only applies to UPDATING their own existing tip — it
    // never opens new submissions after the deadline.
    const exceptionEdit = !bypassLock && !canEditPicks() && hasPostDeadlineEditException(existingByEmail?.name)
    if (!bypassLock) {
      if (!canEditPicks() && !exceptionEdit) {
        return NextResponse.json({ error: 'Deadlinen har passerat — inga fler ändringar tillåtna.' }, { status: 403 })
      }
      const sysConfig = await getSystemConfig()
      if (isGloballyLocked(sysConfig)) {
        return NextResponse.json({ error: 'Tips är för tillfället låsta av administratören.' }, { status: 403 })
      }
    }

    const canEdit = bypassLock || canEditPicks() || exceptionEdit

    const canUpdateProvidedSubmission = !!submissionId && !!user && canEdit
    const canUpdateOwnSubmissionByEmail = !!existingByEmail && !!user && existingByEmail.user_id === user.id && canEdit
    // Non-auth users who have submissionId matching the email's existing submission (UUID is unguessable)
    const canUpdateBySubmissionIdMatch = !!submissionId && !!existingByEmail && existingByEmail.id === submissionId && canEdit

    // Create auth user if password provided
    let userId: string | null = null
    if (user) {
      userId = user.id
    } else if (password && password.length >= 8) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password,
        user_metadata: { name: normalizedName },
        email_confirm: true,
      })
      if (authError && authError.code !== 'email_exists') {
        console.error('Auth error:', authError)
      } else if (authData?.user) {
        userId = authData.user.id
      }
    }

    let sid: string
    let isUpdate = false

    if (canUpdateProvidedSubmission || canUpdateOwnSubmissionByEmail || canUpdateBySubmissionIdMatch) {
      const existing = (canUpdateOwnSubmissionByEmail || canUpdateBySubmissionIdMatch)
        ? existingByEmail
        : await supabase
            .from('vmt_submissions')
            .select('id, user_id, admin_locked')
            .eq('id', submissionId)
            .eq('user_id', user!.id)
            .maybeSingle()
            .then(({ data }) => data)

      if (!existing) {
        return NextResponse.json({ error: 'Kunde inte hitta ditt befintliga tips.' }, { status: 404 })
      }

      if (!bypassLock && existing.admin_locked) {
        return NextResponse.json({ error: 'Det här tipset är låst av administratören och kan inte ändras.' }, { status: 403 })
      }

      isUpdate = true
      sid = existing.id

      const updatePayload: Record<string, unknown> = {
        name: normalizedName,
        email: normalizedEmail,
        submitted_at: new Date().toISOString(),
        total_points: 0,
      }
      if (bypassLock) {
        updatePayload.admin_edited_at = new Date().toISOString()
        updatePayload.admin_edited_by = user!.email
      }
      const { error: updateError } = await supabase
        .from('vmt_submissions')
        .update(updatePayload)
        .eq('id', sid)

      if (updateError) {
        console.error('Submission update error:', updateError)
        return NextResponse.json({ error: 'Kunde inte uppdatera ditt tips.' }, { status: 500 })
      }
    } else {
      if (existingByEmail) {
        return NextResponse.json({
          error: 'Det finns redan ett tips registrerat på den här e-posten. Logga in för att uppdatera det befintliga tipset eller använd en annan e-postadress.',
        }, { status: 409 })
      }

      // Create submission
      const { data: submission, error: subError } = await supabase
        .from('vmt_submissions')
        .insert({ name: normalizedName, email: normalizedEmail, user_id: userId })
        .select('id')
        .single()

      if (subError || !submission) {
        console.error('Submission error:', subError)
        return NextResponse.json({ error: 'Kunde inte spara tips.' }, { status: 500 })
      }

      sid = submission.id
    }

    // Build all pick rows and write them atomically via the vmt_replace_picks RPC.
    // The RPC deletes old picks + inserts the new ones in ONE transaction — a failure
    // rolls everything back, so existing picks can never be lost halfway.
    const VALID_PICKS = ['1', 'X', '2']
    const groupPickRows = Object.entries(matchPicks as Record<string, string>)
      .filter(([, pick]) => VALID_PICKS.includes(pick))
      .map(([matchId, pick]) => ({ match_id: Number(matchId), pick }))

    const tableRows: { group_label: string; position: number; team: string }[] = []
    for (const [group, order] of Object.entries(groupTableOrder as Record<string, string[]>)) {
      order.forEach((team, idx) => tableRows.push({ group_label: group, position: idx + 1, team }))
    }

    const { data: groups } = await supabase.from('vmt_matches').select('group_label').eq('phase','group').not('group_label','is',null)
    const allGroups = [...new Set((groups ?? []).map((g: { group_label: string }) => g.group_label))]
    const thirdRows = allGroups.map(g => ({
      group_label: g,
      selected: (thirdPlaceSelected as string[]).includes(g),
    }))

    const scorerRows = Object.entries(groupScorers as Record<string, string>)
      .filter(([, v]) => v?.trim())
      .map(([group, player_name]) => ({ group_label: group, player_name: player_name.trim() }))

    const bracketRows = Object.entries(bracketPicks as Record<string, string>).map(([matchNum, team]) => ({
      match_number: Number(matchNum),
      pick_team: team,
      round: getRound(Number(matchNum)),
    }))

    const { error: picksError } = await supabase.rpc('vmt_replace_picks', {
      p_submission_id: sid,
      p_group_picks: groupPickRows,
      p_table_picks: tableRows,
      p_third_place_picks: thirdRows,
      p_group_scorer_picks: scorerRows,
      p_tournament_scorer: tournamentScorer?.trim() ?? null,
      p_bracket_picks: bracketRows,
    })

    if (picksError) {
      console.error('vmt_replace_picks error:', picksError)
      if (!isUpdate) {
        // Roll back the freshly created submission so a retry isn't blocked by the 409 duplicate-email check
        await supabase.from('vmt_submissions').delete().eq('id', sid)
      }
      return NextResponse.json({ error: 'Kunde inte spara dina tips. Inga ändringar har sparats — försök igen.' }, { status: 500 })
    }

    // Clear any server-side draft for this email — anonymous users can't call
    // DELETE /api/draft themselves (it requires login), so do it here with the service role.
    const { error: draftDeleteError } = await supabase.from('vmt_drafts').delete().eq('email', normalizedEmail)
    if (draftDeleteError) console.error('Draft cleanup error:', draftDeleteError)

    // Audit log for admin edits
    if (bypassLock && isUpdate) {
      await logAdminAction({
        adminEmail: user!.email!,
        action: 'admin_edit_submission',
        targetId: sid,
        targetName: normalizedName,
        details: { email: normalizedEmail },
      })
    }

    // Insert notification only for new submissions
    if (!isUpdate) {
      await supabase.from('vmt_notifications').insert({
        type: 'new_submission',
        payload: { name: normalizedName, email: normalizedEmail, submission_id: sid, submitted_at: new Date().toISOString() },
      })
    }

    try {
      await sendMail({
        to: normalizedEmail,
        subject: 'Ditt VM-tips har skickats in',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="margin:0 0 12px">Tack ${escapeHtml(normalizedName)}!</h2>
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

function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { GroupLabel, Pick } from '@/lib/types'

interface SubmitBody {
  groupPicks: Record<number, Pick>
  thirdPlaceGroups: Partial<Record<GroupLabel, string>>
  advancingThirdGroups: GroupLabel[]
  bracketPicks: Record<number, string>
  topScorerPicks: Record<string, string>
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Prevent re-submission
  const { data: existing } = await supabase
    .from('submission_status')
    .select('submitted')
    .eq('user_id', user.id)
    .single()

  if (existing?.submitted) {
    return NextResponse.json({ error: 'Redan inskickad.' }, { status: 409 })
  }

  const body: SubmitBody = await req.json()
  const { groupPicks, thirdPlaceGroups, advancingThirdGroups, bracketPicks, topScorerPicks } = body

  const service = createServiceClient()

  // 1. Upsert group stage picks
  const pickRows = Object.entries(groupPicks).map(([matchId, pick]) => ({
    user_id: user.id,
    match_id: Number(matchId),
    pick,
    submitted_at: new Date().toISOString(),
  }))

  if (pickRows.length > 0) {
    const { error } = await service.from('picks').upsert(pickRows, { onConflict: 'user_id,match_id' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 2. Third place picks — all 12 groups, mark 8 as advancing
  const thirdRows = Object.entries(thirdPlaceGroups).map(([group, team]) => ({
    user_id: user.id,
    team: team!,
    advances: advancingThirdGroups.includes(group as GroupLabel),
  }))

  if (thirdRows.length > 0) {
    const { error } = await service.from('third_place_picks').upsert(thirdRows, { onConflict: 'user_id,team' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 3. Bracket picks
  const bracketRows = Object.entries(bracketPicks).map(([matchId, pickTeam]) => ({
    user_id: user.id,
    match_id: Number(matchId),
    pick_team: pickTeam,
  }))

  if (bracketRows.length > 0) {
    const { error } = await service.from('bracket_picks').upsert(bracketRows, { onConflict: 'user_id,match_id' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 4. Top scorer picks
  const scorerRows = Object.entries(topScorerPicks)
    .filter(([, name]) => name?.trim())
    .map(([scope, playerName]) => ({
      user_id: user.id,
      scope,
      player_name: playerName.trim(),
    }))

  if (scorerRows.length > 0) {
    const { error } = await service.from('top_scorer_picks').upsert(scorerRows, { onConflict: 'user_id,scope' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 5. Set submission status
  const { error: statusError } = await service
    .from('submission_status')
    .upsert({ user_id: user.id, submitted: true }, { onConflict: 'user_id' })

  if (statusError) return NextResponse.json({ error: statusError.message }, { status: 500 })

  // 6. Get user info for notification
  const { data: dbUser } = await service
    .from('users')
    .select('name, email')
    .eq('id', user.id)
    .single()

  // 7. Insert notification
  await service.from('notifications').insert({
    user_id: user.id,
    type: 'new_submission',
    payload: {
      name: dbUser?.name ?? '',
      email: dbUser?.email ?? user.email ?? '',
      submitted_at: new Date().toISOString(),
    },
  })

  // 8. Trigger email via Supabase Edge Function
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        to: 'eeengstrand@gmail.com',
        name: dbUser?.name ?? '',
        email: dbUser?.email ?? user.email ?? '',
        submitted_at: new Date().toISOString(),
      }),
    })
  } catch {
    // Email failure is non-fatal
  }

  return NextResponse.json({ ok: true })
}

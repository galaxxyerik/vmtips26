import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, logAdminAction } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const { matchId, result, clearOverride } = await req.json()
  if (!matchId) {
    return NextResponse.json({ error: 'matchId krävs' }, { status: 400 })
  }

  const service = createServiceClient()

  const { data: match } = await service
    .from('vmt_matches')
    .select('match_number, home_team, away_team')
    .eq('id', matchId)
    .single()

  if (!match) {
    return NextResponse.json({ error: 'Match hittades inte' }, { status: 404 })
  }

  let update: Record<string, unknown>

  if (clearOverride) {
    update = { manual_override: false, manual_result: null, manual_winner: null }
  } else {
    if (!result || !['1','X','2'].includes(result)) {
      return NextResponse.json({ error: 'Ogiltigt resultat (1/X/2)' }, { status: 400 })
    }
    const winner = result === '1' ? match?.home_team : result === '2' ? match?.away_team : null
    update = { manual_override: true, manual_result: result, manual_winner: winner }
  }

  const { error } = await service.from('vmt_matches').update(update).eq('id', matchId)
  if (error) {
    return NextResponse.json({ error: 'Kunde inte uppdatera match' }, { status: 500 })
  }

  await logAdminAction({
    adminEmail: auth.email,
    action: clearOverride ? 'clear_match_override' : 'set_match_override',
    targetId: String(matchId),
    targetName: match ? `${match.home_team} vs ${match.away_team}` : undefined,
    details: clearOverride ? {} : { result },
  })

  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = 'eeengstrand@gmail.com'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { submissionId, playerName } = await req.json()
  if (!submissionId || !playerName?.trim()) {
    return NextResponse.json({ error: 'Missing submissionId or playerName' }, { status: 400 })
  }

  const service = createServiceClient()
  const { error } = await service
    .from('vmt_tournament_scorer_pick')
    .upsert({ submission_id: submissionId, player_name: playerName.trim() }, { onConflict: 'submission_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

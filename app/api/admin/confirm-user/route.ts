import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: dbUser } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!dbUser?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const service = createServiceClient()
  const { error } = await service
    .from('submission_status')
    .update({ confirmed: true, confirmed_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update is_verified flag on user
  await service.from('users').update({ is_verified: true }).eq('id', userId)

  return NextResponse.json({ ok: true })
}

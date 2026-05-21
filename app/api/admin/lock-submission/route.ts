import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, logAdminAction } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const { submissionId, locked } = await req.json()
  if (!submissionId || typeof locked !== 'boolean') {
    return NextResponse.json({ error: 'submissionId och locked krävs' }, { status: 400 })
  }

  const service = createServiceClient()

  const { data: sub } = await service
    .from('vmt_submissions')
    .select('name')
    .eq('id', submissionId)
    .single()

  const { error } = await service
    .from('vmt_submissions')
    .update({ admin_locked: locked })
    .eq('id', submissionId)

  if (error) {
    return NextResponse.json({ error: 'Kunde inte uppdatera' }, { status: 500 })
  }

  await logAdminAction({
    adminEmail: auth.email,
    action: locked ? 'lock_submission' : 'unlock_submission',
    targetId: submissionId,
    targetName: sub?.name ?? undefined,
    details: { locked },
  })

  return NextResponse.json({ ok: true })
}

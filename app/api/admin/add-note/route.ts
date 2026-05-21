import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, logAdminAction } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const { submissionId, note } = await req.json()
  if (!submissionId) {
    return NextResponse.json({ error: 'submissionId krävs' }, { status: 400 })
  }

  const service = createServiceClient()

  const { data: sub } = await service
    .from('vmt_submissions')
    .select('name')
    .eq('id', submissionId)
    .single()

  const { error } = await service
    .from('vmt_submissions')
    .update({ admin_note: note?.trim() || null })
    .eq('id', submissionId)

  if (error) {
    return NextResponse.json({ error: 'Kunde inte spara anteckning' }, { status: 500 })
  }

  await logAdminAction({
    adminEmail: auth.email,
    action: 'add_note',
    targetId: submissionId,
    targetName: sub?.name ?? undefined,
    details: { note: note?.trim() || null },
  })

  return NextResponse.json({ ok: true })
}

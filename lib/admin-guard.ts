import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ADMIN_EMAIL } from '@/lib/admin-email'

type AdminResult =
  | { ok: true; email: string }
  | { ok: false; response: NextResponse }

export async function requireAdmin(_req: NextRequest): Promise<AdminResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Obehörig' }, { status: 401 }),
    }
  }
  return { ok: true, email: user.email }
}

export async function logAdminAction({
  adminEmail,
  action,
  targetId,
  targetName,
  details,
}: {
  adminEmail: string
  action: string
  targetId?: string
  targetName?: string
  details?: Record<string, unknown>
}) {
  try {
    const service = createServiceClient()
    await service.from('vmt_admin_log').insert({
      admin_email: adminEmail,
      action,
      target_id: targetId ?? null,
      target_name: targetName ?? null,
      details: details ?? null,
    })
  } catch (err) {
    console.error('Failed to log admin action:', err)
  }
}

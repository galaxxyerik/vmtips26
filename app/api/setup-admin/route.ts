import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ADMIN_EMAIL } from '@/lib/admin-email'

// One-time endpoint to create/reset the admin auth account.
// Requires an active admin session to call.
export async function POST() {
  // Require authenticated admin session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD env var not set' }, { status: 500 })
  }

  const service = createServiceClient()
  const { data: list } = await service.auth.admin.listUsers()
  const existing = list?.users?.find(u => u.email === ADMIN_EMAIL)

  if (existing) {
    const { error } = await service.auth.admin.updateUserById(existing.id, { password: adminPassword })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, message: 'Lösenord återställt.' })
  }

  const { error } = await service.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: adminPassword,
    email_confirm: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, message: 'Admin-konto skapat.' })
}

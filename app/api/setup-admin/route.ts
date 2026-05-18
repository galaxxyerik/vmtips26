import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// One-time endpoint to create the admin auth account.
// Safe to call multiple times — idempotent.
export async function POST() {
  const service = createServiceClient()

  const ADMIN_EMAIL = 'eeengstrand@gmail.com'
  const ADMIN_PASSWORD = '96Swedroid!'

  // Check if already exists
  const { data: list } = await service.auth.admin.listUsers()
  const exists = list?.users?.some(u => u.email === ADMIN_EMAIL)

  if (exists) {
    // Update password in case it needs resetting
    const existing = list!.users.find(u => u.email === ADMIN_EMAIL)!
    await service.auth.admin.updateUserById(existing.id, { password: ADMIN_PASSWORD })
    return NextResponse.json({ ok: true, message: 'Admin already existed — password reset.' })
  }

  const { error } = await service.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, message: 'Admin account created.' })
}

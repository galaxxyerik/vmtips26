import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ADMIN_EMAIL } from '@/lib/admin-email'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email, newPassword } = await req.json()
  if (!email || !newPassword) {
    return NextResponse.json({ error: 'email och newPassword krävs' }, { status: 400 })
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'Lösenordet måste vara minst 8 tecken' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: list } = await service.auth.admin.listUsers()
  const target = list?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase().trim())

  if (!target) {
    return NextResponse.json({ error: `Hittade ingen användare med e-post: ${email}` }, { status: 404 })
  }

  const { error } = await service.auth.admin.updateUserById(target.id, { password: newPassword })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, userId: target.id })
}

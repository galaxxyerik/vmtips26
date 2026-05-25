import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, logAdminAction } from '@/lib/admin-guard'
import { getSystemConfig, setSystemConfig } from '@/lib/system-config'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const config = await getSystemConfig()
  return NextResponse.json(config)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const { key, value } = await req.json()
  const ALLOWED_KEYS = ['global_lock', 'emergency_mode', 'disable_submissions', 'maintenance_banner', 'scoring_frozen']
  if (!key || typeof value !== 'string') {
    return NextResponse.json({ error: 'key och value krävs' }, { status: 400 })
  }
  if (!ALLOWED_KEYS.includes(key)) {
    return NextResponse.json({ error: `Okänd konfigurationsnyckel: ${key}` }, { status: 400 })
  }

  await setSystemConfig(key, value, auth.email)
  await logAdminAction({
    adminEmail: auth.email,
    action: 'system_config_change',
    details: { key, value },
  })

  return NextResponse.json({ ok: true })
}

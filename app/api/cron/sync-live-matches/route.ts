import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncLiveMatchdayMatches } from '@/lib/match-sync'
import { getSystemConfig } from '@/lib/system-config'
import { ADMIN_EMAIL } from '@/lib/admin-email'

async function isAllowed(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) return true
  if (process.env.NODE_ENV !== 'production') return true
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email === ADMIN_EMAIL
}

export async function GET(req: NextRequest) {
  if (!(await isAllowed(req))) {
    return NextResponse.json({ error: 'Obehörig' }, { status: 401 })
  }

  try {
    const sysConfig = await getSystemConfig()
    if (sysConfig['emergency_mode'] === 'true') {
      return NextResponse.json({ ok: false, skipped: true, reason: 'emergency_mode' }, { status: 503 })
    }

    const result = await syncLiveMatchdayMatches()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error(`[${new Date().toISOString()}] sync-live-matches error:`, err)
    return NextResponse.json({ ok: false, error: 'Kunde inte livesynka matchdata' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}

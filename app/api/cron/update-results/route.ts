import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateResults } from '@/lib/result-update'
import { getSystemConfig } from '@/lib/system-config'
import { ADMIN_EMAIL } from '@/lib/admin-email'

// API-Football/scrape + full point recalculation must fit in one invocation
export const maxDuration = 60

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

    const result = await updateResults()
    return NextResponse.json(result)
  } catch (err) {
    console.error(`[${new Date().toISOString()}] update-results error:`, err)
    return NextResponse.json({ ok: false, error: 'Kunde inte uppdatera resultat' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}

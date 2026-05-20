import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncMatches } from '@/lib/match-sync'

const ADMIN_EMAIL = 'eeengstrand@gmail.com'

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
    const result = await syncMatches({ includePlayers: true })
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error(`[${new Date().toISOString()}] sync-matches error:`, err)
    return NextResponse.json({ ok: false, error: 'Kunde inte synka matchdata' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}

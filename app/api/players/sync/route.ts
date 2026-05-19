import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncPlayerStats } from '@/lib/player-stats-sync'

export const maxDuration = 300

const ADMIN_EMAIL = 'eeengstrand@gmail.com'

async function isAllowed(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) return true
  if (process.env.NODE_ENV !== 'production') return true
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email === ADMIN_EMAIL
}

export async function GET(req: NextRequest) {
  if (!(await isAllowed(req))) {
    return NextResponse.json({ ok: false, error: 'Obehörig' }, { status: 401 })
  }

  if (!process.env.API_FOOTBALL_KEY) {
    console.error(`[${new Date().toISOString()}] players sync: API_FOOTBALL_KEY saknas`)
    return NextResponse.json({ ok: false, error: 'API_FOOTBALL_KEY är inte satt i miljövariablerna' }, { status: 500 })
  }

  try {
    const result = await syncPlayerStats()
    const message = `${result.synced} spelare synkade, ${result.skipped} hoppades över`
    console.log(`[${new Date().toISOString()}] players sync klar: ${message}`)
    if (result.synced === 0) {
      return NextResponse.json({ ok: false, error: `Alla ${result.skipped} spelare hoppades över – kontrollera API_FOOTBALL_KEY och Vercel-loggar`, ...result })
    }
    return NextResponse.json({ ok: true, message, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[${new Date().toISOString()}] players sync error:`, err)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}

import { NextResponse } from 'next/server'
import { fetchAndStoreLiveMatches } from '@/lib/match-sync'

let cachedAt = 0
let cachedPayload: unknown = null

export async function GET() {
  try {
    if (cachedPayload && Date.now() - cachedAt < 45_000) {
      return NextResponse.json(cachedPayload)
    }

    const matches = await fetchAndStoreLiveMatches()
    cachedPayload = { ok: true, matches, cachedAt: new Date().toISOString() }
    cachedAt = Date.now()
    return NextResponse.json(cachedPayload)
  } catch (err) {
    console.error(`[${new Date().toISOString()}] live matches error:`, err)
    return NextResponse.json({ ok: false, error: 'Kunde inte hämta live-matcher', matches: [] }, { status: 200 })
  }
}

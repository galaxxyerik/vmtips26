import { NextResponse, after } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { refreshLiveData } from '@/lib/result-update'

// The after()-triggered live refresh (ESPN fetch + upserts + point recalc) must
// fit within the function's lifetime
export const maxDuration = 60

interface MatchRow {
  match_number: number
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  status: string
  kickoff: string
  home_goal_scorers: { player: string; minute: number | null }[] | null
  away_goal_scorers: { player: string; minute: number | null }[] | null
  result: '1' | 'X' | '2' | null
  live_minute: string | null
}

// VM-matchdagar löper ~13:00 UTC → ~05:00 UTC (sena Nordamerika-kvällsmatcher).
// Vila bara under döda timmarna 06–13 UTC.
function isLiveSyncWindow(date = new Date()) {
  const hour = date.getUTCHours()
  return hour >= 13 || hour < 6
}

function isTodayUtc(iso: string, date = new Date()) {
  return iso.slice(0, 10) === date.toISOString().slice(0, 10)
}

// Per-instance in-memory cache for the Supabase read result (not the ESPN call)
let cachedAt = 0
let cachedPayload: unknown = null
const CACHE_TTL_MS = 15_000  // 15s — keeps live scores fresh, cheap on Supabase

export async function GET() {
  try {
    // Serve from memory cache when fresh
    if (cachedPayload && Date.now() - cachedAt < CACHE_TTL_MS) {
      return NextResponse.json(cachedPayload)
    }

    const service = createServiceClient()
    const cols = 'match_number, home_team, away_team, home_score, away_score, status, kickoff, home_goal_scorers, away_goal_scorers, result, live_minute'

    // Read authoritative match data from Supabase (written by the ESPN refresh
    // below). Live + scheduled, plus matches finished within the last few hours
    // so the panel can flip a just-ended match to its final score instead of
    // leaving it LIVE.
    const recentFinishedFrom = new Date(Date.now() - 180 * 60 * 1000).toISOString()
    const [{ data: openRows, error: openErr }, { data: finishedRows, error: finishedErr }] = await Promise.all([
      service.from('vmt_matches').select(cols).in('status', ['live', 'scheduled']).order('kickoff', { ascending: true }),
      service.from('vmt_matches').select(cols).eq('status', 'finished').gte('kickoff', recentFinishedFrom).order('kickoff', { ascending: true }),
    ])
    const error = openErr ?? finishedErr
    const liveRows = [...(openRows ?? []), ...(finishedRows ?? [])]

    if (error) throw error

    const matches = (liveRows as MatchRow[] ?? []).map(row => ({
      fixtureId: row.match_number,
      homeTeam: row.home_team,
      awayTeam: row.away_team,
      homeScore: row.home_score,
      awayScore: row.away_score,
      status: row.status,
      kickoff: row.kickoff,
      result: row.result,
      minute: row.live_minute,
      homeGoalScorers: row.home_goal_scorers ?? [],
      awayGoalScorers: row.away_goal_scorers ?? [],
    }))

    const now = new Date()
    const shouldRefresh = isLiveSyncWindow(now) && (liveRows as MatchRow[] ?? []).some(row =>
      row.status === 'live' || isTodayUtc(row.kickoff, now)
    )
    if (shouldRefresh) {
      // Vercel freezes the instance as soon as the response is sent — a bare
      // floating promise dies mid-flight (scores never updated; sync_log stuck
      // on 'running'). after() keeps the function alive until the refresh is done.
      // refreshLiveData self-throttles, so polling at 30s won't hammer ESPN.
      after(() =>
        refreshLiveData(now).catch(err =>
          console.warn(`[${now.toISOString()}] Live refresh skipped/failed:`, err)
        )
      )
    }

    cachedPayload = { ok: true, matches, cachedAt: new Date().toISOString() }
    cachedAt = Date.now()
    return NextResponse.json(cachedPayload)
  } catch (err) {
    console.error(`[${new Date().toISOString()}] live matches error:`, err)
    return NextResponse.json({ ok: false, error: 'Kunde inte hämta live-matcher', matches: [] }, { status: 500 })
  }
}

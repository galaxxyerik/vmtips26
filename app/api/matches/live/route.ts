import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

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
}

// Per-instance in-memory cache for the Supabase read result (not the API-Football call)
let cachedAt = 0
let cachedPayload: unknown = null
const CACHE_TTL_MS = 30_000  // 30s — fast enough for live scores, cheap on Supabase

export async function GET() {
  try {
    // Serve from memory cache when fresh
    if (cachedPayload && Date.now() - cachedAt < CACHE_TTL_MS) {
      return NextResponse.json(cachedPayload)
    }

    const service = createServiceClient()

    // Read authoritative match data from Supabase (written by cron via fetchAndStoreLiveMatches)
    const { data: liveRows, error } = await service
      .from('vmt_matches')
      .select('match_number, home_team, away_team, home_score, away_score, status, kickoff, home_goal_scorers, away_goal_scorers')
      .in('status', ['live', 'scheduled'])
      .order('kickoff', { ascending: true })

    if (error) throw error

    const matches = (liveRows as MatchRow[] ?? []).map(row => ({
      fixtureId: row.match_number,
      homeTeam: row.home_team,
      awayTeam: row.away_team,
      homeScore: row.home_score,
      awayScore: row.away_score,
      status: row.status,
      kickoff: row.kickoff,
      homeGoalScorers: row.home_goal_scorers ?? [],
      awayGoalScorers: row.away_goal_scorers ?? [],
    }))

    cachedPayload = { ok: true, matches, cachedAt: new Date().toISOString() }
    cachedAt = Date.now()
    return NextResponse.json(cachedPayload)
  } catch (err) {
    console.error(`[${new Date().toISOString()}] live matches error:`, err)
    return NextResponse.json({ ok: false, error: 'Kunde inte hämta live-matcher', matches: [] }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const API_BASE = 'https://v3.football.api-sports.io'
const WC2026_LEAGUE_ID = 1
const WC2026_SEASON = 2026

interface APIFixture {
  fixture: { id: number; status: { short: string }; date: string }
  league: { round: string }
  teams: { home: { name: string }; away: { name: string } }
  score: { fulltime: { home: number | null; away: number | null } }
}

function roundToPhase(round: string): string | null {
  if (round.includes('Group')) return 'group'
  if (round.includes('Round of 32')) return 'r32'
  if (round.includes('Round of 16')) return 'r16'
  if (round.includes('Quarter-final')) return 'qf'
  if (round.includes('Semi-final')) return 'sf'
  if (round.includes('3rd Place')) return 'bronze'
  if (round.includes('Final')) return 'final'
  return null
}

function roundToGroup(round: string): string | null {
  const match = round.match(/Group ([A-L])/i)
  return match ? match[1].toUpperCase() : null
}

function deriveResult(homeScore: number | null, awayScore: number | null): '1' | 'X' | '2' | null {
  if (homeScore === null || awayScore === null) return null
  if (homeScore > awayScore) return '1'
  if (homeScore === awayScore) return 'X'
  return '2'
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.API_FOOTBALL_KEY
  if (!apiKey) return NextResponse.json({ error: 'Missing API_FOOTBALL_KEY' }, { status: 500 })

  const service = createServiceClient()

  try {
    const res = await fetch(
      `${API_BASE}/fixtures?league=${WC2026_LEAGUE_ID}&season=${WC2026_SEASON}`,
      { headers: { 'x-apisports-key': apiKey }, cache: 'no-store' }
    )

    if (!res.ok) {
      return NextResponse.json({ error: `API-Football error: ${res.status}` }, { status: 502 })
    }

    const json = await res.json()
    const fixtures: APIFixture[] = json.response ?? []

    if (fixtures.length === 0) {
      return NextResponse.json({ message: 'No fixtures returned' })
    }

    let upserted = 0
    for (const f of fixtures) {
      const phase = roundToPhase(f.league.round)
      if (!phase) continue

      const isFinished = ['FT', 'AET', 'PEN'].includes(f.fixture.status.short)
      const isLive = ['1H', '2H', 'HT', 'ET', 'P'].includes(f.fixture.status.short)
      const homeScore = isFinished ? (f.score.fulltime.home ?? null) : null
      const awayScore = isFinished ? (f.score.fulltime.away ?? null) : null

      const { error } = await service
        .from('vmt_matches')
        .upsert({
          match_number: f.fixture.id,
          phase,
          group_label: roundToGroup(f.league.round),
          home_team: f.teams.home.name,
          away_team: f.teams.away.name,
          kickoff: f.fixture.date,
          home_score: homeScore,
          away_score: awayScore,
          result: deriveResult(homeScore, awayScore),
          status: isFinished ? 'finished' : isLive ? 'live' : 'scheduled',
        }, { onConflict: 'match_number' })

      if (!error) upserted++
    }

    return NextResponse.json({ ok: true, upserted, total: fixtures.length })
  } catch (err) {
    console.error('sync-matches error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

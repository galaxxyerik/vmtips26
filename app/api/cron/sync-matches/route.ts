import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { calcPickPoints } from '@/lib/scoring'
import type { Phase } from '@/lib/types'

const API_BASE = 'https://v3.football.api-sports.io'
const WC2026_LEAGUE_ID = 1 // FIFA World Cup — verify this ID in API-Football docs
const WC2026_SEASON = 2026

interface APIFixture {
  fixture: {
    id: number
    status: { short: string }
    date: string
  }
  league: { round: string; season: number; id: number }
  teams: {
    home: { name: string }
    away: { name: string }
  }
  goals: { home: number | null; away: number | null }
  score: { fulltime: { home: number | null; away: number | null } }
  events?: Array<{
    type: string
    detail: string
    player: { name: string }
    team: { id: number }
  }>
}

function roundToPhase(round: string): Phase | null {
  if (round.includes('Group')) return 'group'
  if (round.includes('Round of 32') || round.includes('Round of 64')) return 'r32'
  if (round.includes('Round of 16')) return 'r16'
  if (round.includes('Quarter-final')) return 'qf'
  if (round.includes('Semi-final')) return 'sf'
  if (round.includes('Final')) return 'final'
  return null
}

function roundToGroup(round: string): string | null {
  const match = round.match(/Group (\w+)/)
  return match ? match[1] : null
}

function extractGoalScorers(events: APIFixture['events'] = [], teamId: number): string[] {
  return events
    .filter(e => e.type === 'Goal' && e.detail !== 'Missed Penalty' && e.team.id === teamId)
    .map(e => e.player.name)
}

export async function GET(req: NextRequest) {
  // Verify cron secret in production
  const authHeader = req.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.API_FOOTBALL_KEY
  if (!apiKey) return NextResponse.json({ error: 'Missing API_FOOTBALL_KEY' }, { status: 500 })

  const service = createServiceClient()

  try {
    // Fetch all fixtures for WC 2026
    const res = await fetch(
      `${API_BASE}/fixtures?league=${WC2026_LEAGUE_ID}&season=${WC2026_SEASON}`,
      { headers: { 'x-apisports-key': apiKey }, next: { revalidate: 0 } }
    )

    if (!res.ok) {
      return NextResponse.json({ error: `API-Football error: ${res.status}` }, { status: 502 })
    }

    const json = await res.json()
    const fixtures: APIFixture[] = json.response ?? []

    if (fixtures.length === 0) {
      return NextResponse.json({ message: 'No fixtures returned', count: 0 })
    }

    const matchRows = fixtures.map(f => {
      const phase = roundToPhase(f.league.round)
      if (!phase) return null

      const isFinished = ['FT', 'AET', 'PEN'].includes(f.fixture.status.short)
      const homeScore = isFinished ? (f.score.fulltime.home ?? null) : null
      const awayScore = isFinished ? (f.score.fulltime.away ?? null) : null

      // Goal scorers — only available when fetching per-fixture details, so skip if not present
      const homeScorers: string[] = []
      const awayScorers: string[] = []

      return {
        id: f.fixture.id,
        phase,
        group_label: roundToGroup(f.league.round),
        home_team: f.teams.home.name,
        away_team: f.teams.away.name,
        home_score: homeScore,
        away_score: awayScore,
        home_goal_scorers: homeScorers,
        away_goal_scorers: awayScorers,
        kickoff: f.fixture.date,
        api_updated_at: new Date().toISOString(),
      }
    }).filter(Boolean)

    // Upsert matches
    const { error: upsertError } = await service
      .from('matches')
      .upsert(matchRows as any[], { onConflict: 'id' })

    if (upsertError) throw upsertError

    // Recalculate points for all completed matches
    const completedMatchIds = matchRows
      .filter((m: any) => m?.home_score !== null)
      .map((m: any) => m?.id)

    if (completedMatchIds.length > 0) {
      await recalcPoints(service, completedMatchIds, matchRows as any[])
    }

    return NextResponse.json({
      ok: true,
      matchesUpserted: matchRows.length,
      completedMatches: completedMatchIds.length,
    })
  } catch (err) {
    console.error('sync-matches error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

async function recalcPoints(
  service: ReturnType<typeof createServiceClient>,
  matchIds: number[],
  matchRows: Array<{ id: number; phase: Phase; home_score: number | null; away_score: number | null }>
) {
  const { data: picks } = await service
    .from('picks')
    .select('id, user_id, match_id, pick')
    .in('match_id', matchIds)

  if (!picks || picks.length === 0) return

  const matchMap = Object.fromEntries(matchRows.map(m => [m.id, m]))

  const updates = picks.map(p => {
    const match = matchMap[p.match_id]
    if (!match) return null
    const points = calcPickPoints(match.phase, p.pick, match.home_score, match.away_score)
    return { id: p.id, points }
  }).filter(Boolean)

  // Batch update picks with new points
  for (const u of updates) {
    if (u) {
      await service.from('picks').update({ points: u.points }).eq('id', u.id)
    }
  }
}

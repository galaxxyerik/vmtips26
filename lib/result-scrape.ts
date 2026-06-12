import { syncLog } from '@/lib/api-football'
import type { ApiFixture } from '@/lib/match-sync'

/**
 * Fallback result source when API-Football is down or returns nothing.
 *
 * Source choice: Sofascore. Their site is backed by a public, unauthenticated
 * JSON API (api.sofascore.com) that serves the exact data the website renders —
 * no HTML parsing and no JS execution needed. livescore.com was considered but
 * rejected: it is a client-rendered SPA whose initial HTML contains no results,
 * which makes it unscrapeable without a headless browser (not available in a
 * Vercel function).
 *
 * Endpoint used: GET /api/v1/sport/football/scheduled-events/{YYYY-MM-DD}
 * — every football event for that UTC date. We filter on the FIFA World Cup
 * unique tournament id (16) and finished status, then reshape each event into
 * the same ApiFixture shape API-Football returns so the existing
 * upsertFixtures() matcher in lib/match-sync.ts stays the single write path
 * to vmt_matches. Goal scorers are NOT available this way — the fallback only
 * delivers scores/results, scorers arrive when API-Football recovers.
 */

const SCRAPE_BASE = process.env.RESULT_SCRAPE_BASE_URL || 'https://api.sofascore.com'
const FIFA_WORLD_CUP_UNIQUE_TOURNAMENT_ID = 16
// Sofascore blocks default fetch UAs; a browser UA is required for a 200
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

// Sofascore team names that differ from API-Football's (which lib/team-names.ts
// maps to Swedish). Unknown names pass through and the fixture matcher skips
// + logs them rather than guessing.
const SOFASCORE_TEAM_ALIASES: Record<string, string> = {
  'South Korea': 'Korea Republic',
  'Czech Republic': 'Czechia',
  'Bosnia and Herzegovina': 'Bosnia & Herzegovina',
  'Bosnia & Herzegovina': 'Bosnia & Herzegovina',
  'Cape Verde': 'Cabo Verde',
  'Ivory Coast': "Côte d'Ivoire",
  'DR Congo': 'Congo DR',
  'Congo DR': 'Congo DR',
  'United States': 'USA',
}

interface SofaTeam { name?: string }
interface SofaScore {
  current?: number | null
  normaltime?: number | null
  penalties?: number | null
}
interface SofaEvent {
  tournament?: {
    name?: string
    uniqueTournament?: { id?: number }
  }
  roundInfo?: { round?: number; name?: string }
  status?: { type?: string; code?: number }
  winnerCode?: number // 1 = home, 2 = away, 3 = draw
  homeTeam?: SofaTeam
  awayTeam?: SofaTeam
  homeScore?: SofaScore
  awayScore?: SofaScore
  startTimestamp?: number
  id?: number
}
interface SofaDayResponse { events?: SofaEvent[] }

function aliasedName(name: string | undefined) {
  if (!name) return null
  return SOFASCORE_TEAM_ALIASES[name] ?? name
}

/**
 * Map a Sofascore event to the round string roundToPhase() in match-sync
 * understands. Group games carry "Group X" in the tournament name; knockout
 * rounds are identified from roundInfo.name. Unclassifiable events return null
 * and are skipped (logged by the caller).
 */
function roundString(event: SofaEvent): string | null {
  const tournamentName = event.tournament?.name ?? ''
  if (/group/i.test(tournamentName)) return 'Group'
  const round = event.roundInfo?.name ?? ''
  if (/group/i.test(round)) return 'Group'
  if (/32/.test(round)) return 'Round of 32'
  if (/16/.test(round)) return 'Round of 16'
  if (/quarter/i.test(round)) return 'Quarter-finals'
  if (/semi/i.test(round)) return 'Semi-finals'
  if (/(3rd|third)/i.test(round)) return '3rd Place Final'
  if (/final/i.test(round)) return 'Final'
  return null
}

function toApiFixture(event: SofaEvent): ApiFixture | null {
  const round = roundString(event)
  const home = aliasedName(event.homeTeam?.name)
  const away = aliasedName(event.awayTeam?.name)
  const kickoff = event.startTimestamp
  if (!round || !home || !away || !kickoff) return null

  // Fulltime = 90-minute score when Sofascore provides it (KO games went to
  // extra time/penalties), otherwise the final score. Group games never differ.
  const homeFt = event.homeScore?.normaltime ?? event.homeScore?.current ?? null
  const awayFt = event.awayScore?.normaltime ?? event.awayScore?.current ?? null
  const homePen = event.homeScore?.penalties ?? null
  const awayPen = event.awayScore?.penalties ?? null

  return {
    fixture: {
      id: event.id ?? 0,
      date: new Date(kickoff * 1000).toISOString(),
      status: { short: 'FT' },
    },
    league: { round },
    teams: {
      home: { name: home, winner: event.winnerCode === 1 ? true : event.winnerCode === 2 ? false : null },
      away: { name: away, winner: event.winnerCode === 2 ? true : event.winnerCode === 1 ? false : null },
    },
    goals: {
      home: event.homeScore?.current ?? null,
      away: event.awayScore?.current ?? null,
    },
    score: {
      fulltime: { home: homeFt, away: awayFt },
      penalty: homePen !== null && awayPen !== null ? { home: homePen, away: awayPen } : undefined,
    },
  }
}

/**
 * Scrape finished World Cup fixtures for the given UTC dates (YYYY-MM-DD).
 * Returns ApiFixture-shaped objects ready for upsertFixtures(). Throws only
 * when EVERY date fails — partial data is better than none.
 */
export async function scrapeFinishedFixtures(dates: string[]): Promise<ApiFixture[]> {
  const fixtures: ApiFixture[] = []
  let lastError: unknown = null
  let succeededDates = 0

  for (const date of dates) {
    try {
      const res = await fetch(`${SCRAPE_BASE}/api/v1/sport/football/scheduled-events/${date}`, {
        headers: { 'user-agent': BROWSER_UA, accept: 'application/json' },
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`Sofascore svarade ${res.status} för ${date}`)
      const json = (await res.json()) as SofaDayResponse
      succeededDates++

      const wcFinished = (json.events ?? []).filter(event =>
        event.tournament?.uniqueTournament?.id === FIFA_WORLD_CUP_UNIQUE_TOURNAMENT_ID &&
        event.status?.type === 'finished'
      )

      for (const event of wcFinished) {
        const fixture = toApiFixture(event)
        if (fixture) {
          fixtures.push(fixture)
        } else {
          syncLog(`Scrape: kunde inte tolka event ${event.id} (${event.homeTeam?.name} – ${event.awayTeam?.name}) — hoppar över`)
        }
      }
    } catch (err) {
      lastError = err
      syncLog(`Scrape misslyckades för ${date}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  if (succeededDates === 0 && dates.length > 0) {
    throw lastError instanceof Error ? lastError : new Error('Scrape misslyckades för alla datum')
  }

  return fixtures
}

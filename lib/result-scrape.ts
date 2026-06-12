import { syncLog } from '@/lib/api-football'
import { teamNameSv } from '@/lib/team-names'
import type { ApiFixture } from '@/lib/match-sync'

/**
 * Fallback result sources when API-Football is down or returns nothing
 * (in production the free plan lacks season 2026 entirely, so the fallback
 * is effectively the primary automatic source until the plan is upgraded).
 *
 * Sources, in order:
 *
 *  1. ESPN — site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard
 *     Public unauthenticated JSON API that has been stable for years and,
 *     crucially, serves datacenter IPs (Vercel) without blocking. Primary
 *     fallback for that reason.
 *  2. Sofascore — api.sofascore.com/api/v1/sport/football/scheduled-events/{date}
 *     Same idea, but observed returning 403 to Vercel's IP range in prod
 *     (June 12, 2026), so it is only tried when ESPN yields nothing.
 *
 * livescore.com was considered and rejected: client-rendered SPA whose HTML
 * contains no results without executing JS — unscrapeable in a Vercel function.
 *
 * Architecture: each source is reduced to neutral RawResult objects; those are
 * then anchored against OUR pending vmt_matches rows (Swedish team pair, or
 * phase + kickoff for knockout rows that still hold placeholder names) and
 * emitted in API-Football's ApiFixture shape, oriented to our row's home/away
 * and stamped with our kickoff. That keeps upsertFixtures() in lib/match-sync.ts
 * as the single write path, makes the result immune to sources listing the
 * teams in swapped order, and never moves our kickoff times. Goal scorers are
 * NOT available via fallback — they arrive when API-Football works.
 */

const ESPN_BASE = process.env.ESPN_SCRAPE_BASE_URL || 'https://site.api.espn.com'
const SOFA_BASE = process.env.SOFASCORE_SCRAPE_BASE_URL || 'https://api.sofascore.com'
const FIFA_WORLD_CUP_SOFA_ID = 16
// Sofascore blocks default fetch UAs; a browser-like request is required
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

// Names the sources use that differ from API-Football's (which
// lib/team-names.ts maps to Swedish). Unknown names simply fail to match a
// pending row and are skipped + logged — never guessed.
const SCRAPE_TEAM_ALIASES: Record<string, string> = {
  'South Korea': 'Korea Republic',
  'Czech Republic': 'Czechia',
  'Bosnia and Herzegovina': 'Bosnia & Herzegovina',
  'Cape Verde': 'Cabo Verde',
  'Cape Verde Islands': 'Cabo Verde',
  'Ivory Coast': "Côte d'Ivoire",
  'DR Congo': 'Congo DR',
  'Democratic Republic of the Congo': 'Congo DR',
  'United States': 'USA',
  Curacao: 'Curaçao',
}

export interface PendingMatchForScrape {
  id: number
  match_number: number | null
  phase: string
  home_team: string
  away_team: string
  kickoff: string
}

interface RawResult {
  home: string // source's home team name (English)
  away: string
  homeScore: number | null // 90-minute score when distinguishable
  awayScore: number | null
  homePen: number | null
  awayPen: number | null
  winner: 'home' | 'away' | 'draw' | null
  kickoffIso: string
  sourceId: string
}

export interface ScrapeOutcome {
  fixtures: ApiFixture[]
  source: 'espn' | 'sofascore' | null
}

function svName(name: string) {
  return teamNameSv(SCRAPE_TEAM_ALIASES[name] ?? name)
}

// Inverse of roundToPhase() in lib/match-sync.ts
const PHASE_TO_ROUND: Record<string, string> = {
  group: 'Group',
  r32: 'Round of 32',
  r16: 'Round of 16',
  qf: 'Quarter-finals',
  sf: 'Semi-finals',
  bronze: '3rd Place Final',
  final: 'Final',
}

const KO_KICKOFF_TOLERANCE_MS = 3 * 60 * 60 * 1000

/** Find the pending vmt_matches row a raw result belongs to. */
function matchPendingRow(raw: RawResult, pending: PendingMatchForScrape[]): PendingMatchForScrape | null {
  const home = svName(raw.home)
  const away = svName(raw.away)

  const byTeams = pending.filter(m =>
    (m.home_team === home && m.away_team === away) || (m.home_team === away && m.away_team === home)
  )
  if (byTeams.length === 1) return byTeams[0]

  // Knockout rows may still hold placeholder names ("Vinnare M73") — match on
  // phase + kickoff proximity instead, but only when unambiguous.
  const kickoff = Date.parse(raw.kickoffIso)
  const byKickoff = pending.filter(m =>
    m.phase !== 'group' &&
    Math.abs(new Date(m.kickoff).getTime() - kickoff) <= KO_KICKOFF_TOLERANCE_MS
  )
  return byKickoff.length === 1 ? byKickoff[0] : null
}

/**
 * Turn a raw scraped result into an ApiFixture oriented to OUR row: if the
 * source listed the teams in the opposite home/away order, scores/pens/winner
 * are flipped so result derivation can never be inverted.
 */
function toApiFixture(raw: RawResult, row: PendingMatchForScrape): ApiFixture | null {
  const srcHome = svName(raw.home)
  const namesMatchRow = srcHome === row.home_team || srcHome === row.away_team
  const flipped = namesMatchRow ? srcHome === row.away_team : false
  // Placeholder KO row (kickoff-matched): trust the source's own orientation
  const homeName = namesMatchRow ? (flipped ? svName(raw.away) : srcHome) : svName(raw.home)
  const awayName = namesMatchRow ? (flipped ? srcHome : svName(raw.away)) : svName(raw.away)

  const homeScore = flipped ? raw.awayScore : raw.homeScore
  const awayScore = flipped ? raw.homeScore : raw.awayScore
  const homePen = flipped ? raw.awayPen : raw.homePen
  const awayPen = flipped ? raw.homePen : raw.awayPen
  const winner = raw.winner === 'draw' || raw.winner === null
    ? null
    : (raw.winner === 'home') !== flipped ? 'home' : 'away'

  if (homeScore === null || awayScore === null) return null

  return {
    fixture: {
      id: Number(raw.sourceId) || 0,
      // Our seeded kickoff, NOT the source's — upsertFixtures writes this back
      date: row.kickoff,
      status: { short: homePen !== null ? 'PEN' : 'FT' },
    },
    league: { round: PHASE_TO_ROUND[row.phase] ?? 'Group' },
    teams: {
      home: { name: homeName, winner: winner === null ? null : winner === 'home' },
      away: { name: awayName, winner: winner === null ? null : winner === 'away' },
    },
    goals: { home: homeScore, away: awayScore },
    score: {
      fulltime: { home: homeScore, away: awayScore },
      penalty: homePen !== null && awayPen !== null ? { home: homePen, away: awayPen } : undefined,
    },
  }
}

// ── Source 1: ESPN ─────────────────────────────────────────────────────────────

interface EspnCompetitor {
  homeAway?: string
  winner?: boolean
  score?: string | number
  shootoutScore?: string | number
  team?: { displayName?: string }
}
interface EspnEvent {
  id?: string
  date?: string
  status?: { type?: { completed?: boolean; state?: string } }
  competitions?: { competitors?: EspnCompetitor[] }[]
}

async function fetchEspnDay(date: string): Promise<RawResult[]> {
  const espnDate = date.replaceAll('-', '')
  const res = await fetch(
    `${ESPN_BASE}/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${espnDate}`,
    { headers: { accept: 'application/json', 'user-agent': BROWSER_UA }, cache: 'no-store' }
  )
  if (!res.ok) throw new Error(`ESPN svarade ${res.status} för ${date}`)
  const json = (await res.json()) as { events?: EspnEvent[] }

  const out: RawResult[] = []
  for (const ev of json.events ?? []) {
    if (ev.status?.type?.completed !== true) continue
    const comps = ev.competitions?.[0]?.competitors ?? []
    const home = comps.find(c => c.homeAway === 'home')
    const away = comps.find(c => c.homeAway === 'away')
    if (!home?.team?.displayName || !away?.team?.displayName || !ev.date) continue

    const homeScore = home.score != null ? Number(home.score) : null
    const awayScore = away.score != null ? Number(away.score) : null
    const homePen = home.shootoutScore != null ? Number(home.shootoutScore) : null
    const awayPen = away.shootoutScore != null ? Number(away.shootoutScore) : null
    out.push({
      home: home.team.displayName,
      away: away.team.displayName,
      homeScore: Number.isFinite(homeScore as number) ? homeScore : null,
      awayScore: Number.isFinite(awayScore as number) ? awayScore : null,
      homePen: Number.isFinite(homePen as number) ? homePen : null,
      awayPen: Number.isFinite(awayPen as number) ? awayPen : null,
      winner: home.winner === true ? 'home' : away.winner === true ? 'away' : null,
      kickoffIso: ev.date,
      sourceId: ev.id ?? '',
    })
  }
  return out
}

// ── Source 2: Sofascore ────────────────────────────────────────────────────────

interface SofaScoreSide { current?: number | null; normaltime?: number | null; penalties?: number | null }
interface SofaEvent {
  id?: number
  tournament?: { uniqueTournament?: { id?: number } }
  status?: { type?: string }
  winnerCode?: number // 1 home, 2 away, 3 draw
  homeTeam?: { name?: string }
  awayTeam?: { name?: string }
  homeScore?: SofaScoreSide
  awayScore?: SofaScoreSide
  startTimestamp?: number
}

async function fetchSofascoreDay(date: string): Promise<RawResult[]> {
  const res = await fetch(`${SOFA_BASE}/api/v1/sport/football/scheduled-events/${date}`, {
    headers: {
      accept: 'application/json',
      'user-agent': BROWSER_UA,
      referer: 'https://www.sofascore.com/',
      origin: 'https://www.sofascore.com',
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Sofascore svarade ${res.status} för ${date}`)
  const json = (await res.json()) as { events?: SofaEvent[] }

  const out: RawResult[] = []
  for (const ev of json.events ?? []) {
    if (ev.tournament?.uniqueTournament?.id !== FIFA_WORLD_CUP_SOFA_ID) continue
    if (ev.status?.type !== 'finished') continue
    if (!ev.homeTeam?.name || !ev.awayTeam?.name || !ev.startTimestamp) continue
    out.push({
      home: ev.homeTeam.name,
      away: ev.awayTeam.name,
      homeScore: ev.homeScore?.normaltime ?? ev.homeScore?.current ?? null,
      awayScore: ev.awayScore?.normaltime ?? ev.awayScore?.current ?? null,
      homePen: ev.homeScore?.penalties ?? null,
      awayPen: ev.awayScore?.penalties ?? null,
      winner: ev.winnerCode === 1 ? 'home' : ev.winnerCode === 2 ? 'away' : ev.winnerCode === 3 ? 'draw' : null,
      kickoffIso: new Date(ev.startTimestamp * 1000).toISOString(),
      sourceId: String(ev.id ?? ''),
    })
  }
  return out
}

// ── Orchestration ──────────────────────────────────────────────────────────────

const SOURCES: { name: 'espn' | 'sofascore'; fetchDay: (date: string) => Promise<RawResult[]> }[] = [
  { name: 'espn', fetchDay: fetchEspnDay },
  { name: 'sofascore', fetchDay: fetchSofascoreDay },
]

/**
 * Scrape finished results for the pending matches. Tries each source in order
 * and returns as soon as one produces at least one fixture that maps onto a
 * pending row; partial data is fine — the rest is retried on the next run.
 * Throws only if every source failed on every date.
 */
export async function scrapeFinishedFixtures(pending: PendingMatchForScrape[]): Promise<ScrapeOutcome> {
  const dates = [...new Set(pending.map(m => m.kickoff.slice(0, 10)))]
  let lastError: unknown = null
  let anySourceResponded = false

  for (const source of SOURCES) {
    const raws: RawResult[] = []
    let sourceResponded = false
    for (const date of dates) {
      try {
        raws.push(...await source.fetchDay(date))
        sourceResponded = true
      } catch (err) {
        lastError = err
        syncLog(`Scrape (${source.name}) misslyckades för ${date}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    anySourceResponded ||= sourceResponded

    const fixtures: ApiFixture[] = []
    for (const raw of raws) {
      const row = matchPendingRow(raw, pending)
      if (!row) continue // not one of our pending matches (other game or unknown name)
      const fixture = toApiFixture(raw, row)
      if (fixture) {
        fixtures.push(fixture)
      } else {
        syncLog(`Scrape (${source.name}): ofullständigt resultat för ${raw.home} – ${raw.away} — hoppar över`)
      }
    }

    if (fixtures.length > 0) {
      syncLog(`Scrape (${source.name}): ${fixtures.length} färdiga matcher mappade`)
      return { fixtures, source: source.name }
    }
    syncLog(`Scrape (${source.name}): inga matchande resultat — provar nästa källa`)
  }

  if (!anySourceResponded && dates.length > 0) {
    throw lastError instanceof Error ? lastError : new Error('Scrape misslyckades för alla källor och datum')
  }
  return { fixtures: [], source: null }
}

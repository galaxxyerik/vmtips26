import { createServiceClient } from '@/lib/supabase/server'
import { apiFootballFetch, syncLog } from '@/lib/api-football'
import { syncPlayerStats } from '@/lib/player-stats-sync'
import { teamNameSv } from '@/lib/team-names'
import { recalculateAllScores } from '@/lib/recalculate'

const WC2026_LEAGUE_ID = 1
const WC2026_SEASON = 2026

interface ApiFixture {
  fixture: {
    id: number
    date: string
    venue?: { name?: string; city?: string }
    status: { short: string; elapsed?: number | null }
  }
  league: { round: string }
  teams: { home: { name: string; winner?: boolean | null }; away: { name: string; winner?: boolean | null } }
  goals?: { home: number | null; away: number | null }
  score: {
    fulltime: { home: number | null; away: number | null }
    extratime?: { home: number | null; away: number | null }
    penalty?: { home: number | null; away: number | null }
  }
  events?: ApiFixtureEvent[]
}

interface ApiFixtureResponse {
  response?: ApiFixture[]
}

interface ApiFixtureEvent {
  time?: { elapsed?: number | null }
  team?: { name?: string }
  player?: { name?: string }
  type?: string
  detail?: string
}

interface ApiEventsResponse {
  response?: ApiFixtureEvent[]
}

function roundToPhase(round: string): string | null {
  if (round.includes('Group')) return 'group'
  if (round.includes('Round of 32')) return 'r32'
  if (round.includes('Round of 16')) return 'r16'
  if (round.includes('Quarter')) return 'qf'
  if (round.includes('Semi')) return 'sf'
  if (round.includes('3rd Place')) return 'bronze'
  if (round.includes('Final')) return 'final'
  return null
}

function deriveResult(homeScore: number | null, awayScore: number | null): '1' | 'X' | '2' | null {
  if (homeScore === null || awayScore === null) return null
  if (homeScore > awayScore) return '1'
  if (homeScore === awayScore) return 'X'
  return '2'
}

/**
 * Knockout matches can't end in a draw — when fulltime is level the winner came
 * via extra time or penalties. Prefer the API's explicit winner flag, then the
 * penalty/extra-time scores.
 */
function deriveKnockoutResult(f: ApiFixture): '1' | '2' | null {
  if (f.teams.home.winner === true) return '1'
  if (f.teams.away.winner === true) return '2'
  for (const score of [f.score.penalty, f.score.extratime, f.score.fulltime, f.goals]) {
    if (score?.home != null && score?.away != null && score.home !== score.away) {
      return score.home > score.away ? '1' : '2'
    }
  }
  return null
}

function statusFromShort(short: string): 'scheduled' | 'live' | 'finished' {
  if (['FT', 'AET', 'PEN'].includes(short)) return 'finished'
  if (['1H', '2H', 'HT', 'ET', 'P', 'BT'].includes(short)) return 'live'
  return 'scheduled'
}

function venueName(fixture: ApiFixture) {
  const name = fixture.fixture.venue?.name
  const city = fixture.fixture.venue?.city
  return [name, city].filter(Boolean).join(', ') || null
}

async function goalScorersForFixture(fixture: ApiFixture) {
  const events = fixture.events ?? (await apiFootballFetch<ApiEventsResponse>(`/fixtures/events?fixture=${fixture.fixture.id}`))?.response ?? []
  const goals = events.filter(event =>
    event.type === 'Goal' &&
    event.detail !== 'Missed Penalty' &&
    event.detail !== 'Penalty Shootout'
  )

  return {
    home: goals
      .filter(event => event.team?.name === fixture.teams.home.name)
      .map(event => ({ player: event.player?.name ?? 'Okänd målskytt', minute: event.time?.elapsed ?? null })),
    away: goals
      .filter(event => event.team?.name === fixture.teams.away.name)
      .map(event => ({ player: event.player?.name ?? 'Okänd målskytt', minute: event.time?.elapsed ?? null })),
  }
}

interface ExistingMatchRow {
  id: number
  match_number: number | null
  phase: string
  home_team: string
  away_team: string
  kickoff: string
  home_score: number | null
  away_score: number | null
  status: string | null
}

const KO_KICKOFF_TOLERANCE_MS = 3 * 60 * 60 * 1000

/**
 * Map an API-Football fixture onto one of OUR 104 seeded vmt_matches rows.
 * API fixture ids are NOT our match numbers — group matches are matched on the
 * (Swedish) team pair, knockout matches on phase + kickoff (placeholder teams).
 * Fixtures that can't be matched are skipped and logged — we NEVER insert rows.
 */
function findExistingMatch(f: ApiFixture, phase: string, existing: ExistingMatchRow[]): ExistingMatchRow | null {
  const home = teamNameSv(f.teams.home.name)
  const away = teamNameSv(f.teams.away.name)

  if (phase === 'group') {
    return existing.find(m =>
      m.phase === 'group' &&
      ((m.home_team === home && m.away_team === away) || (m.home_team === away && m.away_team === home))
    ) ?? null
  }

  // Knockout: teams are placeholders until the round is set — match on phase + kickoff
  const apiKickoff = new Date(f.fixture.date).getTime()
  const candidates = existing.filter(m =>
    m.phase === phase &&
    Math.abs(new Date(m.kickoff).getTime() - apiKickoff) <= KO_KICKOFF_TOLERANCE_MS
  )
  if (candidates.length === 1) return candidates[0]

  // Several KO matches near the same kickoff — disambiguate on already-known teams
  const byTeams = candidates.filter(m =>
    (m.home_team === home || m.away_team === home) && (m.home_team === away || m.away_team === away)
  )
  return byTeams.length === 1 ? byTeams[0] : null
}

async function upsertFixtures(fixtures: ApiFixture[], includeScorers: boolean) {
  const service = createServiceClient()
  let upserted = 0
  const updatedMatchIds: number[] = []

  const { data: existingRows, error: existingErr } = await service
    .from('vmt_matches')
    .select('id, match_number, phase, home_team, away_team, kickoff, home_score, away_score, status')

  if (existingErr || !existingRows) {
    syncLog(`Fel: kunde inte läsa befintliga matcher: ${existingErr?.message ?? 'okänt'}`)
    return { upserted, updatedMatchIds }
  }

  for (const f of fixtures) {
    const phase = roundToPhase(f.league.round)
    if (!phase) continue

    const existing = findExistingMatch(f, phase, existingRows as ExistingMatchRow[])
    if (!existing) {
      syncLog(`Varning: ingen matchande rad för API-fixture ${f.fixture.id} (${f.teams.home.name} – ${f.teams.away.name}, ${f.league.round}) — hoppar över`)
      continue
    }

    const status = statusFromShort(f.fixture.status.short)
    const homeScore = status === 'finished' ? (f.score.fulltime.home ?? f.goals?.home ?? null) : (status === 'live' ? f.goals?.home ?? null : null)
    const awayScore = status === 'finished' ? (f.score.fulltime.away ?? f.goals?.away ?? null) : (status === 'live' ? f.goals?.away ?? null : null)
    const scorers = includeScorers || status === 'live'
      ? await goalScorersForFixture(f)
      : { home: [], away: [] }

    const result = phase === 'group'
      ? deriveResult(homeScore, awayScore)
      : (status === 'finished' ? deriveKnockoutResult(f) : null)

    const update: Record<string, unknown> = {
      kickoff: f.fixture.date,
      venue: venueName(f),
      home_score: homeScore,
      away_score: awayScore,
      home_goal_scorers: scorers.home,
      away_goal_scorers: scorers.away,
      result,
      status,
    }
    // Knockout rows are seeded with placeholders ("Vinnare M73") — fill in the
    // real teams once known. Group rows already have canonical Swedish names.
    if (phase !== 'group') {
      update.home_team = teamNameSv(f.teams.home.name)
      update.away_team = teamNameSv(f.teams.away.name)
    }

    const { error } = await service.from('vmt_matches').update(update).eq('id', existing.id)

    if (error) {
      syncLog(`Varning: kunde inte uppdatera match ${existing.match_number}: ${error.message}`)
      continue
    }

    upserted++
    const scoreChanged = existing.home_score !== homeScore || existing.away_score !== awayScore
    if (status === 'finished' && (existing.status !== 'finished' || scoreChanged)) updatedMatchIds.push(existing.id)
  }

  return { upserted, updatedMatchIds }
}

export async function fetchAndStoreLiveMatches() {
  syncLog('Hämtar live-matcher från API-Football')
  const json = await apiFootballFetch<ApiFixtureResponse>(`/fixtures?live=all&league=${WC2026_LEAGUE_ID}&season=${WC2026_SEASON}`)
  const fixtures = json?.response ?? []
  const { upserted } = await upsertFixtures(fixtures, true)
  return fixtures.map(f => ({
    fixtureId: f.fixture.id,
    homeTeam: teamNameSv(f.teams.home.name),
    awayTeam: teamNameSv(f.teams.away.name),
    homeTeamApi: f.teams.home.name,
    awayTeamApi: f.teams.away.name,
    homeScore: f.goals?.home ?? null,
    awayScore: f.goals?.away ?? null,
    elapsed: f.fixture.status.elapsed ?? null,
    status: f.fixture.status.short,
    events: f.events ?? [],
    upserted,
  }))
}

export async function recalculateAllSubmissionPoints() {
  const service = createServiceClient()
  syncLog('Räknar om poäng för alla tips')

  // Delegate to the shared engine (lib/recalculate.ts) — the same one the admin
  // button uses. It covers ALL categories (tabeller, treor, skyttar, annan väg)
  // and respects manual overrides + scoring_frozen.
  const result = await recalculateAllScores(service)

  if (!result.ok) {
    syncLog(`Poängräkning hoppades över: ${result.reason}`)
    return 0
  }

  syncLog(`Poäng omräknade för ${result.updated} tips`)
  return result.updated
}

export async function syncMatches(options: { includePlayers?: boolean } = {}) {
  const service = createServiceClient()
  syncLog('Startar matchsynk')

  const allJson = await apiFootballFetch<ApiFixtureResponse>(`/fixtures?league=${WC2026_LEAGUE_ID}&season=${WC2026_SEASON}`)
  const allFixtures = allJson?.response ?? []

  if (allFixtures.length === 0) {
    await service.from('vmt_sync_log').upsert({
      sync_key: 'match_results',
      synced_at: new Date().toISOString(),
      status: 'empty',
      message: 'Data tillgänglig från 11 juni 2026',
    }, { onConflict: 'sync_key' })
    syncLog('API-Football returnerade inga VM-fixtures')
    return { fixtures: 0, finished: 0, recalculated: 0, message: 'Data tillgänglig från 11 juni 2026' }
  }

  const allResult = await upsertFixtures(allFixtures, false)
  syncLog(`${allResult.upserted} fixtures uppdaterade`)

  const finishedJson = await apiFootballFetch<ApiFixtureResponse>(`/fixtures?league=${WC2026_LEAGUE_ID}&season=${WC2026_SEASON}&status=FT`)
  const finishedFixtures = finishedJson?.response ?? []
  const finishedResult = await upsertFixtures(finishedFixtures, true)
  syncLog(`${finishedResult.upserted} färdiga matcher uppdaterade`)

  const recalculated = finishedResult.updatedMatchIds.length > 0
    ? await recalculateAllSubmissionPoints()
    : 0

  if (options.includePlayers) await syncPlayerStats()

  await service.from('vmt_sync_log').upsert({
    sync_key: 'match_results',
    synced_at: new Date().toISOString(),
    status: 'ok',
    message: `${allResult.upserted} fixtures, ${finishedResult.upserted} resultat, ${recalculated} tips omräknade`,
  }, { onConflict: 'sync_key' })

  syncLog('Matchsynk klar')
  return { fixtures: allResult.upserted, finished: finishedResult.upserted, recalculated }
}

import { createServiceClient } from '@/lib/supabase/server'
import { apiFootballFetch, syncLog } from '@/lib/api-football'
import { GROUP_PICK_POINTS, PHASE_POINTS } from '@/lib/scoring'
import { syncPlayerStats } from '@/lib/player-stats-sync'
import { teamNameSv } from '@/lib/team-names'

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
  teams: { home: { name: string }; away: { name: string } }
  goals?: { home: number | null; away: number | null }
  score: { fulltime: { home: number | null; away: number | null } }
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

async function upsertFixtures(fixtures: ApiFixture[], includeScorers: boolean) {
  const service = createServiceClient()
  let upserted = 0
  const updatedMatchIds: number[] = []

  for (const f of fixtures) {
    const phase = roundToPhase(f.league.round)
    if (!phase) continue

    const status = statusFromShort(f.fixture.status.short)
    const homeScore = status === 'finished' ? (f.score.fulltime.home ?? f.goals?.home ?? null) : (status === 'live' ? f.goals?.home ?? null : null)
    const awayScore = status === 'finished' ? (f.score.fulltime.away ?? f.goals?.away ?? null) : (status === 'live' ? f.goals?.away ?? null : null)
    const scorers = includeScorers || status === 'live'
      ? await goalScorersForFixture(f)
      : { home: [], away: [] }

    const { data: existing } = await service
      .from('vmt_matches')
      .select('id, home_score, away_score')
      .eq('match_number', f.fixture.id)
      .maybeSingle()

    const { error, data } = await service
      .from('vmt_matches')
      .upsert({
        match_number: f.fixture.id,
        phase,
        group_label: roundToGroup(f.league.round),
        home_team: teamNameSv(f.teams.home.name),
        away_team: teamNameSv(f.teams.away.name),
        kickoff: f.fixture.date,
        venue: venueName(f),
        home_score: homeScore,
        away_score: awayScore,
        home_goal_scorers: scorers.home,
        away_goal_scorers: scorers.away,
        result: deriveResult(homeScore, awayScore),
        status,
      }, { onConflict: 'match_number' })
      .select('id')
      .single()

    if (error) {
      syncLog(`Varning: kunde inte spara match ${f.fixture.id}: ${error.message}`)
      continue
    }

    upserted++
    const scoreChanged = existing && (existing.home_score !== homeScore || existing.away_score !== awayScore)
    if (status === 'finished' && data?.id && (!existing || scoreChanged)) updatedMatchIds.push(data.id)
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

  const [
    { data: submissions },
    { data: groupPicks },
    { data: bracketPicks },
    { data: matches },
  ] = await Promise.all([
    service.from('vmt_submissions').select('id'),
    service.from('vmt_group_picks').select('submission_id, match_id, pick'),
    service.from('vmt_bracket_picks').select('submission_id, match_number, pick_team, round'),
    service.from('vmt_matches').select('id, match_number, phase, home_team, away_team, home_score, away_score, result, status'),
  ])

  const matchById = new Map((matches ?? []).map(match => [match.id, match]))
  const matchByNumber = new Map((matches ?? []).map(match => [match.match_number, match]))
  let updated = 0

  for (const submission of submissions ?? []) {
    let total = 0
    for (const pick of groupPicks?.filter(p => p.submission_id === submission.id) ?? []) {
      const match = matchById.get(pick.match_id)
      if (match?.status === 'finished' && match.result === pick.pick) total += GROUP_PICK_POINTS
    }

    for (const pick of bracketPicks?.filter(p => p.submission_id === submission.id) ?? []) {
      const match = matchByNumber.get(pick.match_number)
      if (!match || match.status !== 'finished') continue
      const winner = (match.home_score ?? 0) > (match.away_score ?? 0) ? match.home_team : match.away_team
      if (winner === pick.pick_team) total += PHASE_POINTS[pick.round]?.exact ?? 0
    }

    const { error } = await service.from('vmt_submissions').update({ total_points: total }).eq('id', submission.id)
    if (!error) updated++
  }

  syncLog(`Poäng omräknade för ${updated} tips`)
  return updated
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

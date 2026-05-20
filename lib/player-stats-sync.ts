import { createServiceClient } from '@/lib/supabase/server'
import { apiFootballFetch, syncLog } from '@/lib/api-football'
import { PLAYER_REGISTRY, type PlayerRegistryEntry } from '@/lib/player-registry'
import { PLAYER_STATS_SEASON } from '@/lib/player-stats-config'

const nationalTeamCache = new Map<string, number | null>()
const squadCache = new Map<string, { id: number; name: string }[]>()

interface ApiPlayerResponse {
  response?: {
    player: { id: number; name: string; nationality?: string }
    statistics?: {
      team?: { id: number; name: string }
      league?: { name: string; season: number; type?: string }
      games?: { minutes?: number; appearences?: number }
      goals?: { total?: number; assists?: number; saves?: number }
      fixtures?: { lineups?: number }
    }[]
  }[]
}

interface ApiTeamResponse {
  response?: { team: { id: number; name: string; national?: boolean } }[]
}

interface ApiSquadResponse {
  response?: {
    team?: { id: number; name: string }
    players?: { id: number; name: string }[]
  }[]
}

interface ApiPlayerSearchResponse {
  response?: {
    player: { id: number; name: string; nationality?: string }
  }[]
}

function isFatalSupabaseError(message: string) {
  const normalized = message.toLowerCase()
  return (
    normalized.includes('invalid api key') ||
    normalized.includes('jwt') ||
    normalized.includes('permission denied') ||
    normalized.includes('row-level security') ||
    normalized.includes('relation "player_stats" does not exist') ||
    normalized.includes('schema cache')
  )
}

function intValue(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function normalizeName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function firstInitial(value: string) {
  return normalizeName(value).split(' ')[0]?.[0] ?? ''
}

function surname(value: string) {
  const parts = normalizeName(value).split(' ')
  return parts[parts.length - 1] ?? ''
}

function pickLeagueStats(
  rows: NonNullable<ApiPlayerResponse['response']>[number]['statistics'] = [],
  nationalTeamId: number | null
) {
  const nonNationalRows = rows.filter(row => row.team?.id !== nationalTeamId)
  const leagueRows = nonNationalRows.filter(row => row.league?.type === 'League')
  const selected = [...leagueRows, ...nonNationalRows]
    .sort((a, b) => intValue(b.games?.minutes) - intValue(a.games?.minutes))[0]
  return {
    club: selected?.team?.name ?? null,
    league: selected?.league?.name ?? null,
    goals: intValue(selected?.goals?.total),
    assists: intValue(selected?.goals?.assists),
    minutes: intValue(selected?.games?.minutes),
    cleanSheets: intValue(selected?.fixtures?.lineups),
  }
}

function pickNationalStats(
  rows: NonNullable<ApiPlayerResponse['response']>[number]['statistics'] = [],
  nationalTeamId: number | null
) {
  const nationalRows = rows.filter(row => row.team?.id === nationalTeamId)
  return {
    caps: nationalRows.reduce((sum, row) => sum + intValue(row.games?.appearences), 0),
    goals: nationalRows.reduce((sum, row) => sum + intValue(row.goals?.total), 0),
  }
}

async function squadForNationality(player: PlayerRegistryEntry): Promise<{ id: number; name: string }[]> {
  if (squadCache.has(player.nationality)) return squadCache.get(player.nationality) ?? []
  const nationalTeamId = await resolveNationalTeamId(player)
  if (!nationalTeamId) return []

  const json = await apiFootballFetch<ApiSquadResponse>(`/players/squads?team=${nationalTeamId}`)
  const squad = json?.response?.[0]?.players ?? []
  squadCache.set(player.nationality, squad)
  return squad
}

async function searchPlayerDirectly(player: PlayerRegistryEntry): Promise<number | null> {
  const nationalTeamId = await resolveNationalTeamId(player)
  if (!nationalTeamId) return null

  const query = encodeURIComponent(surname(player.name))
  const json = await apiFootballFetch<ApiPlayerSearchResponse>(
    `/players?search=${query}&team=${nationalTeamId}&season=${PLAYER_STATS_SEASON}`
  )
  const candidates = json?.response ?? []
  const normalizedTarget = normalizeName(player.name)
  const targetSurname = surname(player.name)
  const targetInitial = firstInitial(player.name)

  const match = candidates.find(row => {
    const candidate = normalizeName(row.player.name)
    return (
      candidate === normalizedTarget ||
      (surname(row.player.name) === targetSurname && firstInitial(row.player.name) === targetInitial) ||
      candidate.includes(normalizedTarget) ||
      normalizedTarget.includes(candidate)
    )
  })

  if (match?.player.id) {
    syncLog(`Direkt sökning hittade ${player.name} → id ${match.player.id}`)
    return match.player.id
  }
  return null
}

async function resolvePlayerId(player: PlayerRegistryEntry): Promise<number | null> {
  if (player.apiFootballId) return player.apiFootballId

  const squad = await squadForNationality(player)
  const normalizedTarget = normalizeName(player.name)
  const targetSurname = surname(player.name)
  const targetInitial = firstInitial(player.name)

  const match = squad.find(row => {
    const candidate = normalizeName(row.name)
    return (
      candidate === normalizedTarget ||
      (surname(row.name) === targetSurname && firstInitial(row.name) === targetInitial) ||
      candidate.includes(normalizedTarget) ||
      normalizedTarget.includes(candidate)
    )
  })

  if (match?.id) return match.id

  syncLog(`Squad-uppslag misslyckades för ${player.name}, försöker direkt sökning...`)
  return searchPlayerDirectly(player)
}

async function resolveNationalTeamId(player: PlayerRegistryEntry): Promise<number | null> {
  if (player.nationalTeamId) return player.nationalTeamId
  if (nationalTeamCache.has(player.nationality)) return nationalTeamCache.get(player.nationality) ?? null

  const json = await apiFootballFetch<ApiTeamResponse>(`/teams?search=${encodeURIComponent(player.nationality)}`)
  const match = json?.response?.find(row => row.team.national) ?? json?.response?.[0]
  if (!match?.team.id) {
    syncLog(`Varning: landslag hittades inte i API-Football: ${player.nationality}`)
    nationalTeamCache.set(player.nationality, null)
    return null
  }
  nationalTeamCache.set(player.nationality, match.team.id)
  return match.team.id
}

async function syncOnePlayer(player: PlayerRegistryEntry) {
  const service = createServiceClient()
  const playerId = await resolvePlayerId(player)
  if (!playerId) return { skipped: true }
  const nationalTeamId = await resolveNationalTeamId(player)

  const clubJson = await apiFootballFetch<ApiPlayerResponse>(`/players?id=${playerId}&season=${PLAYER_STATS_SEASON}`)
  if (!clubJson?.response?.length) {
    syncLog(`Varning: ingen spelardata hämtades för ${player.name}`)
    return { skipped: true }
  }
  const clubRow = clubJson?.response?.[0]
  const clubStats = pickLeagueStats(clubRow?.statistics, nationalTeamId)
  const nationalStats = pickNationalStats(clubRow?.statistics, nationalTeamId)

  const { error } = await service.from('player_stats').upsert({
    player_id: playerId,
    player_name: player.name,
    nationality: player.nationality,
    club: clubStats.club,
    league: clubStats.league,
    season: PLAYER_STATS_SEASON,
    goals_club: clubStats.goals,
    assists_club: clubStats.assists,
    minutes_club: clubStats.minutes,
    clean_sheets: player.isGoalkeeper ? clubStats.cleanSheets : null,
    goals_national: nationalStats.goals,
    caps_national: nationalStats.caps,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'player_id,season' })

  if (error) {
    if (isFatalSupabaseError(error.message)) throw error
    syncLog(`Varning: kunde inte spara spelarstatistik för ${player.name}: ${error.message}`)
    return { skipped: true }
  }

  return { skipped: false }
}

export async function syncPlayerStats() {
  const service = createServiceClient()
  syncLog('Startar synk av spelarstatistik')

  const { data: existingRows, error: preflightError } = await service
    .from('player_stats')
    .select('player_name')
    .eq('season', PLAYER_STATS_SEASON)

  if (preflightError) {
    throw new Error(`Supabase service-role kan inte läsa player_stats: ${preflightError.message}`)
  }

  const existingPlayerNames = new Set((existingRows ?? []).map(row => row.player_name))
  let synced = 0
  let skipped = 0
  let alreadySynced = 0

  for (const player of PLAYER_REGISTRY) {
    if (existingPlayerNames.has(player.name)) {
      alreadySynced++
      continue
    }

    try {
      const result = await syncOnePlayer(player)
      if (result.skipped) skipped++
      else synced++
    } catch (err) {
      skipped++
      syncLog(`Varning: spelarstatistik hoppades över för ${player.name}: ${String(err)}`)
    }
  }

  const status = synced > 0 || alreadySynced > 0 ? 'ok' : 'error'
  const message = `${synced} spelare synkade, ${alreadySynced} fanns redan, ${skipped} hoppades över`

  const { error: logError } = await service.from('vmt_sync_log').upsert({
    sync_key: 'player_stats',
    synced_at: new Date().toISOString(),
    status,
    message,
  }, { onConflict: 'sync_key' })

  if (logError) {
    throw new Error(`Kunde inte skriva synklogg för player_stats: ${logError.message}`)
  }

  syncLog(`Klar med spelarstatistik: ${message}`)
  return { synced, skipped, alreadySynced }
}

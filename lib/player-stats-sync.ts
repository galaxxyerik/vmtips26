import { createServiceClient } from '@/lib/supabase/server'
import { apiFootballFetch, syncLog } from '@/lib/api-football'
import { PLAYER_REGISTRY, type PlayerRegistryEntry } from '@/lib/player-registry'

const CLUB_SEASON = 2024
const nationalTeamCache = new Map<string, number | null>()

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

function intValue(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function pickLeagueStats(rows: NonNullable<ApiPlayerResponse['response']>[number]['statistics'] = []) {
  const leagueRows = rows.filter(row => row.league?.type === 'League')
  const selected = leagueRows[0] ?? rows[0]
  return {
    club: selected?.team?.name ?? null,
    league: selected?.league?.name ?? null,
    goals: intValue(selected?.goals?.total),
    assists: intValue(selected?.goals?.assists),
    minutes: intValue(selected?.games?.minutes),
    cleanSheets: intValue(selected?.fixtures?.lineups),
  }
}

async function resolvePlayerId(player: PlayerRegistryEntry): Promise<number | null> {
  if (player.apiFootballId) return player.apiFootballId

  const json = await apiFootballFetch<ApiPlayerResponse>(
    `/players?search=${encodeURIComponent(player.name)}&season=${CLUB_SEASON}`
  )
  const match = json?.response?.find(row =>
    row.player.name.toLowerCase() === player.name.toLowerCase() ||
    row.player.name.toLowerCase().includes(player.name.toLowerCase().split(' ')[0])
  ) ?? json?.response?.[0]

  if (!match?.player.id) {
    syncLog(`Varning: spelare hittades inte i API-Football: ${player.name}`)
    return null
  }

  return match.player.id
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

  const clubJson = await apiFootballFetch<ApiPlayerResponse>(`/players?id=${playerId}&season=${CLUB_SEASON}`)
  const clubRow = clubJson?.response?.[0]
  const clubStats = pickLeagueStats(clubRow?.statistics)

  let caps = 0
  let goals = 0
  const nationalTeamId = await resolveNationalTeamId(player)
  if (nationalTeamId) {
    const nationalJson = await apiFootballFetch<ApiPlayerResponse>(
      `/players?id=${playerId}&season=${CLUB_SEASON}&team=${nationalTeamId}`
    )
    const nationalRows = nationalJson?.response?.[0]?.statistics ?? []
    caps = nationalRows.reduce((sum, row) => sum + intValue(row.games?.appearences), 0)
    goals = nationalRows.reduce((sum, row) => sum + intValue(row.goals?.total), 0)
  }

  const { error } = await service.from('player_stats').upsert({
    player_id: playerId,
    player_name: player.name,
    nationality: player.nationality,
    club: clubStats.club,
    league: clubStats.league,
    season: CLUB_SEASON,
    goals_club: clubStats.goals,
    assists_club: clubStats.assists,
    minutes_club: clubStats.minutes,
    clean_sheets: player.isGoalkeeper ? clubStats.cleanSheets : null,
    goals_national: goals,
    caps_national: caps,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'player_id,season' })

  if (error) {
    syncLog(`Varning: kunde inte spara spelarstatistik för ${player.name}: ${error.message}`)
    return { skipped: true }
  }

  return { skipped: false }
}

export async function syncPlayerStats() {
  const service = createServiceClient()
  syncLog('Startar synk av spelarstatistik')

  let synced = 0
  let skipped = 0

  for (const player of PLAYER_REGISTRY) {
    try {
      const result = await syncOnePlayer(player)
      if (result.skipped) skipped++
      else synced++
    } catch (err) {
      skipped++
      syncLog(`Varning: spelarstatistik hoppades över för ${player.name}: ${String(err)}`)
    }
  }

  await service.from('vmt_sync_log').upsert({
    sync_key: 'player_stats',
    synced_at: new Date().toISOString(),
    status: 'ok',
    message: `${synced} spelare synkade, ${skipped} hoppades över`,
  }, { onConflict: 'sync_key' })

  syncLog(`Klar med spelarstatistik: ${synced} synkade, ${skipped} hoppades över`)
  return { synced, skipped }
}

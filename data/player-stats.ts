import { PLAYER_REGISTRY } from '../lib/player-registry'
import { PLAYER_STATS_SEASON } from '../lib/player-stats-config'
import type { PlayerStatRecord } from '../lib/player-stats-types'

type RawVerifiedPlayerStat = Omit<
  PlayerStatRecord,
  | 'player_id'
  | 'season'
  | 'data_source'
  | 'verified_at'
  | 'source_note'
  | 'appearances_club'
  | 'starts_club'
> & {
  appearances_club?: number | null
  starts_club?: number | null
}

const VERIFIED_AT = '2026-05-20T00:00:00.000Z'
const VERIFIED_SOURCE_NOTE =
  'Verifierad 2025/26-statistik från officiella liga-, klubb- och landslagssidor uppdaterad 20 maj 2026.'

const REGISTRY_PLAYER_IDS = new Map(
  PLAYER_REGISTRY
    .filter(player => typeof player.apiFootballId === 'number')
    .map(player => [player.name, player.apiFootballId as number])
)

const SYNTHETIC_PLAYER_ID_START = 700000

function playerIdFor(name: string, index: number) {
  return REGISTRY_PLAYER_IDS.get(name) ?? (SYNTHETIC_PLAYER_ID_START + index)
}

const RAW_STATS: RawVerifiedPlayerStat[] = [
  // ── Världsstjärnor (STARS-tab) ─────────────────────────────────────────────
  { player_name: 'Viktor Gyökeres', club: 'Arsenal', league: 'Premier League', goals_club: 14, assists_club: 1, minutes_club: 2223, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Kylian Mbappé', club: 'Real Madrid', league: 'La Liga', goals_club: 22, assists_club: 9, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Vinicius Jr', club: 'Real Madrid', league: 'La Liga', goals_club: 15, assists_club: 5, minutes_club: 2825, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Jude Bellingham', club: 'Real Madrid', league: 'La Liga', goals_club: 5, assists_club: 4, minutes_club: 1756, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Lamine Yamal', club: 'FC Barcelona', league: 'La Liga', goals_club: 16, assists_club: 11, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Erling Haaland', club: 'Manchester City', league: 'Premier League', goals_club: 26, assists_club: 8, minutes_club: 2868, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Pedri', club: 'FC Barcelona', league: 'La Liga', goals_club: 2, assists_club: 9, minutes_club: 2107, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Jamal Musiala', club: 'Bayern München', league: 'Bundesliga', goals_club: 3, assists_club: 4, minutes_club: 609, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Bukayo Saka', club: 'Arsenal', league: 'Premier League', goals_club: 7, assists_club: 5, minutes_club: 2136, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Achraf Hakimi', club: 'Paris Saint-Germain', league: 'Ligue 1', goals_club: 2, assists_club: 2, minutes_club: 1374, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Cody Gakpo', club: 'Liverpool', league: 'Premier League', goals_club: 7, assists_club: 4, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Julián Álvarez', club: 'Atlético Madrid', league: 'La Liga', goals_club: 8, assists_club: 4, minutes_club: 1904, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },

  // ── Övriga världsstjärnor ──────────────────────────────────────────────────
  { player_name: 'Mohamed Salah', club: 'Liverpool', league: 'Premier League', goals_club: 7, assists_club: 6, minutes_club: 2075, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Harry Kane', club: 'Bayern München', league: 'Bundesliga', goals_club: 36, assists_club: 5, minutes_club: 2379, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Federico Valverde', club: 'Real Madrid', league: 'La Liga', goals_club: 5, assists_club: 8, minutes_club: 2656, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },

  // ── Talanger ───────────────────────────────────────────────────────────────
  { player_name: 'Endrick', club: 'Olympique Lyonnais', league: 'Ligue 1', goals_club: 5, assists_club: 7, minutes_club: 1151, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Arda Güler', club: 'Real Madrid', league: 'La Liga', goals_club: 4, assists_club: 9, minutes_club: 2012, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Takefusa Kubo', club: 'Real Sociedad', league: 'La Liga', goals_club: 2, assists_club: 4, minutes_club: 1508, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Estêvão Willian', club: 'Chelsea', league: 'Premier League', goals_club: 2, assists_club: 2, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Sverre Nypan', club: 'Middlesbrough', league: 'Championship', goals_club: 0, assists_club: 0, minutes_club: 624, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Kendry Páez', club: 'Strasbourg', league: 'Ligue 1', goals_club: 1, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: 20, updated_at: VERIFIED_AT },
  { player_name: 'Warren Zaïre-Emery', club: 'Paris Saint-Germain', league: 'Ligue 1', goals_club: 3, assists_club: 4, minutes_club: 2393, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },

  // ── Sverige — nyckelspelare ────────────────────────────────────────────────
  { player_name: 'Alexander Isak', club: 'Liverpool', league: 'Premier League', goals_club: 3, assists_club: 1, minutes_club: 703, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Victor Nilsson Lindelöf', club: 'Aston Villa', league: 'Premier League', goals_club: 0, assists_club: 1, minutes_club: 752, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Lucas Bergvall', club: 'Tottenham Hotspur', league: 'Premier League', goals_club: 1, assists_club: 3, minutes_club: 966, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Yasin Ayari', club: 'Brighton', league: 'Premier League', goals_club: 3, assists_club: 3, minutes_club: 1917, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Anthony Elanga', club: 'Newcastle United', league: 'Premier League', goals_club: 0, assists_club: 1, minutes_club: 1283, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },

  // ── Sverige — hela truppen ─────────────────────────────────────────────────
  { player_name: 'Viktor Johansson', club: 'Stoke City', league: 'Championship', goals_club: 0, assists_club: 0, minutes_club: 2250, clean_sheets: 8, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Kristoffer Nordfeldt', club: 'AIK', league: 'Allsvenskan', goals_club: 0, assists_club: 0, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Jacob Widell Zetterström', club: 'Derby County', league: 'Championship', goals_club: 0, assists_club: 0, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Hjalmar Ekdal', club: 'Burnley', league: 'Premier League', goals_club: 0, assists_club: 0, minutes_club: 1539, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Gabriel Gudmundsson', club: 'Leeds United', league: 'Championship', goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Isak Hien', club: 'Atalanta', league: 'Serie A', goals_club: 1, assists_club: 0, minutes_club: 1874, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Emil Holm', club: 'Juventus', league: 'Serie A', goals_club: 1, assists_club: 4, minutes_club: 709, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Gustaf Lagerbielke', club: 'SC Braga', league: 'Primeira Liga', goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Eric Smith', club: 'FC St Pauli', league: 'Bundesliga', goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Carl Starfelt', club: 'Celta de Vigo', league: 'La Liga', goals_club: 0, assists_club: 0, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Elliot Stroud', club: 'Mjällby AIF', league: 'Allsvenskan', goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Daniel Svensson', club: 'Borussia Dortmund', league: 'Bundesliga', goals_club: 2, assists_club: 2, minutes_club: 2333, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Taha Ali', club: 'Malmö FF', league: 'Allsvenskan', goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Alexander Bernhardsson', club: 'Holstein Kiel', league: '2. Bundesliga', goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Besfort Zeneli', club: 'Union Saint-Gilloise', league: 'Belgian Pro League', goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Jesper Karlström', club: 'Udinese', league: 'Serie A', goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Gustaf Nilsson', club: 'Club Brugge', league: 'Belgian Pro League', goals_club: 0, assists_club: 0, minutes_club: 31, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Benjamin Nygren', club: 'Celtic', league: 'Scottish Premiership', goals_club: 15, assists_club: 5, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Ken Sema', club: 'Pafos FC', league: 'Cypriot First Division', goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Mattias Svanberg', club: 'VfL Wolfsburg', league: 'Bundesliga', goals_club: 3, assists_club: 1, minutes_club: 738, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },

  // ── Grupp F — övriga ──────────────────────────────────────────────────────
  { player_name: 'Virgil van Dijk', club: 'Liverpool', league: 'Premier League', goals_club: 4, assists_club: 0, minutes_club: 3330, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Frenkie de Jong', club: 'FC Barcelona', league: 'La Liga', goals_club: 1, assists_club: 5, minutes_club: 1603, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Tijjani Reijnders', club: 'Manchester City', league: 'Premier League', goals_club: 5, assists_club: 2, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Ritsu Doan', club: 'Eintracht Frankfurt', league: 'Bundesliga', goals_club: 5, assists_club: 5, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Daichi Kamada', club: 'Crystal Palace', league: 'Premier League', goals_club: 0, assists_club: null, appearances_club: 29, starts_club: null, minutes_club: 2043, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Youssef Msakni', club: 'Al Arabi', league: 'Qatar Stars League', goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
  { player_name: 'Wahbi Khazri', club: null, league: null, goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: VERIFIED_AT },
]

export const VERIFIED_PLAYER_STATS_LIST: PlayerStatRecord[] = RAW_STATS.map((stat, index) => ({
  player_id: playerIdFor(stat.player_name, index),
  season: PLAYER_STATS_SEASON,
  data_source: 'verified_static',
  verified_at: VERIFIED_AT,
  source_note: VERIFIED_SOURCE_NOTE,
  appearances_club: null,
  starts_club: null,
  ...stat,
}))

export const VERIFIED_PLAYER_STATS: Record<string, PlayerStatRecord> = Object.fromEntries(
  VERIFIED_PLAYER_STATS_LIST.map(stat => [stat.player_name, stat])
)

export const VERIFIED_PLAYER_STATS_UPDATED_AT = VERIFIED_AT

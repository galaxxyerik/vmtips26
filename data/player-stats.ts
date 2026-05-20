// Static 2025/26 season stats for all tracked players.
// Sources: Premier League, Bundesliga, La Liga, Ligue 1 official sites + Transfermarkt / FotMob (as of May 2026).
// Supabase rows from cron syncs take precedence at runtime.
// Only use real verified figures — leave null where unverified.

export interface StaticPlayerStat {
  player_name: string
  club: string | null
  league: string | null
  goals_club: number | null
  assists_club: number | null
  minutes_club: number | null
  clean_sheets: number | null
  goals_national: number | null
  caps_national: number | null
  updated_at: string
}

const UPDATED = '2026-05-20T00:00:00.000Z'

const STATS: StaticPlayerStat[] = [
  // ── Världsstjärnor (STARS-tab) ─────────────────────────────────────────────
  // Sources: premierleague.com, bundesliga.com, laliga.com, ligue1.com
  { player_name: 'Viktor Gyökeres',    club: 'Arsenal',               league: 'Premier League',     goals_club: 14, assists_club: 1,  minutes_club: 2223, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Kylian Mbappé',      club: 'Real Madrid',           league: 'La Liga',             goals_club: 22, assists_club: 9,  minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Vinicius Jr',        club: 'Real Madrid',           league: 'La Liga',             goals_club: 15, assists_club: 5,  minutes_club: 2825, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Jude Bellingham',    club: 'Real Madrid',           league: 'La Liga',             goals_club: 5,  assists_club: 4,  minutes_club: 1756, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Lamine Yamal',       club: 'FC Barcelona',          league: 'La Liga',             goals_club: 16, assists_club: 11, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Erling Haaland',     club: 'Manchester City',       league: 'Premier League',     goals_club: 26, assists_club: 8,  minutes_club: 2868, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Pedri',              club: 'FC Barcelona',          league: 'La Liga',             goals_club: 2,  assists_club: 9,  minutes_club: 2107, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Jamal Musiala',      club: 'Bayern München',        league: 'Bundesliga',         goals_club: 3,  assists_club: 4,  minutes_club: 609,  clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Bukayo Saka',        club: 'Arsenal',               league: 'Premier League',     goals_club: 7,  assists_club: 5,  minutes_club: 2136, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Achraf Hakimi',      club: 'Paris Saint-Germain',   league: 'Ligue 1',            goals_club: 2,  assists_club: 2,  minutes_club: 1374, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Cody Gakpo',         club: 'Liverpool',             league: 'Premier League',     goals_club: 7,  assists_club: 4,  minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Julián Álvarez',     club: 'Atlético Madrid',       league: 'La Liga',             goals_club: 8,  assists_club: 4,  minutes_club: 1904, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },

  // ── Övriga världsstjärnor ──────────────────────────────────────────────────
  { player_name: 'Mohamed Salah',      club: 'Liverpool',             league: 'Premier League',     goals_club: 7,  assists_club: 6,  minutes_club: 2075, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Harry Kane',         club: 'Bayern München',        league: 'Bundesliga',         goals_club: 36, assists_club: 5,  minutes_club: 2379, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Federico Valverde',  club: 'Real Madrid',           league: 'La Liga',             goals_club: 5,  assists_club: 8,  minutes_club: 2656, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },

  // ── Talanger ───────────────────────────────────────────────────────────────
  // Note: Endrick on loan at Lyon (not Real Madrid), Kendry Páez on loan at Strasbourg→River Plate
  { player_name: 'Endrick',            club: 'Olympique Lyonnais',    league: 'Ligue 1',            goals_club: 5,  assists_club: 7,  minutes_club: 1151, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Arda Güler',         club: 'Real Madrid',           league: 'La Liga',             goals_club: 4,  assists_club: 9,  minutes_club: 2012, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Takefusa Kubo',      club: 'Real Sociedad',         league: 'La Liga',             goals_club: 2,  assists_club: 4,  minutes_club: 1508, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Estêvão Willian',    club: 'Chelsea',               league: 'Premier League',     goals_club: 2,  assists_club: 2,  minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Sverre Nypan',       club: 'Middlesbrough',         league: 'Championship',       goals_club: 0,  assists_club: 0,  minutes_club: 624,  clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Kendry Páez',        club: 'Strasbourg',            league: 'Ligue 1',            goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Warren Zaïre-Emery', club: 'Paris Saint-Germain',   league: 'Ligue 1',            goals_club: 3,  assists_club: 4,  minutes_club: 2393, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },

  // ── Sverige — nyckelspelare ────────────────────────────────────────────────
  { player_name: 'Alexander Isak',            club: 'Liverpool',       league: 'Premier League', goals_club: 3,  assists_club: 1,  minutes_club: 703,  clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Victor Nilsson Lindelöf',   club: 'Aston Villa',     league: 'Premier League', goals_club: 0,  assists_club: 1,  minutes_club: 752,  clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Lucas Bergvall',            club: 'Tottenham Hotspur', league: 'Premier League', goals_club: 1, assists_club: 3,  minutes_club: 966,  clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Yasin Ayari',               club: 'Brighton',        league: 'Premier League', goals_club: 3,  assists_club: 3,  minutes_club: 1917, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Anthony Elanga',            club: 'Newcastle United', league: 'Premier League', goals_club: 0, assists_club: 1,  minutes_club: 1283, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },

  // ── Sverige — hela truppen ─────────────────────────────────────────────────
  { player_name: 'Viktor Johansson',          club: 'Stoke City',       league: 'Championship',   goals_club: 0,  assists_club: 0,  minutes_club: 2250, clean_sheets: 8,    goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Kristoffer Nordfeldt',      club: 'AIK',              league: 'Allsvenskan',    goals_club: 0,  assists_club: 0,  minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Jacob Widell Zetterström',  club: 'Derby County',     league: 'Championship',   goals_club: 0,  assists_club: 0,  minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Hjalmar Ekdal',             club: 'Burnley',          league: 'Premier League', goals_club: 0,  assists_club: 0,  minutes_club: 1539, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Gabriel Gudmundsson',       club: 'Leeds United',     league: 'Championship',   goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Isak Hien',                 club: 'Atalanta',         league: 'Serie A',        goals_club: 1,  assists_club: 0,  minutes_club: 1874, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Emil Holm',                 club: 'Juventus',         league: 'Serie A',        goals_club: 1,  assists_club: 4,  minutes_club: 709,  clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Gustaf Lagerbielke',        club: 'SC Braga',         league: 'Primeira Liga',  goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Eric Smith',                club: 'FC St Pauli',      league: 'Bundesliga',     goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Carl Starfelt',             club: 'Celta de Vigo',    league: 'La Liga',         goals_club: 0,  assists_club: 0,  minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Elliot Stroud',             club: 'Mjällby AIF',      league: 'Allsvenskan',    goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Daniel Svensson',           club: 'Borussia Dortmund', league: 'Bundesliga',    goals_club: 2,  assists_club: 2,  minutes_club: 2333, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Taha Ali',                  club: 'Malmö FF',         league: 'Allsvenskan',    goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Alexander Bernhardsson',    club: 'Holstein Kiel',    league: '2. Bundesliga',  goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Besfort Zeneli',            club: 'Union Saint-Gilloise', league: 'Belgian Pro League', goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Jesper Karlström',          club: 'Udinese',          league: 'Serie A',        goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Gustaf Nilsson',            club: 'Club Brugge',      league: 'Belgian Pro League', goals_club: 0, assists_club: 0, minutes_club: 31,   clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Benjamin Nygren',           club: 'Celtic',           league: 'Scottish Premiership', goals_club: 15, assists_club: 5, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Ken Sema',                  club: 'Pafos FC',         league: 'Cypriot First Division', goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Mattias Svanberg',          club: 'VfL Wolfsburg',    league: 'Bundesliga',     goals_club: 3,  assists_club: 1,  minutes_club: 738,  clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },

  // ── Grupp F — övriga ──────────────────────────────────────────────────────
  { player_name: 'Virgil van Dijk',    club: 'Liverpool',             league: 'Premier League',     goals_club: 4,  assists_club: 0,  minutes_club: 3330, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Frenkie de Jong',    club: 'FC Barcelona',          league: 'La Liga',             goals_club: 1,  assists_club: 5,  minutes_club: 1603, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Tijjani Reijnders',  club: 'Manchester City',       league: 'Premier League',     goals_club: 5,  assists_club: 2,  minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Ritsu Doan',         club: 'Eintracht Frankfurt',   league: 'Bundesliga',         goals_club: 5,  assists_club: 5,  minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Daichi Kamada',      club: 'Crystal Palace',        league: 'Premier League',     goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Youssef Msakni',     club: 'Al Arabi',              league: 'Qatar Stars League', goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
  { player_name: 'Wahbi Khazri',       club: 'Montpellier',           league: 'Ligue 1',            goals_club: null, assists_club: null, minutes_club: null, clean_sheets: null, goals_national: null, caps_national: null, updated_at: UPDATED },
]

// Keyed by player_name for O(1) lookup
export const STATIC_PLAYER_STATS: Record<string, StaticPlayerStat> = Object.fromEntries(
  STATS.map(s => [s.player_name, s])
)

// Flat list for seed script / bulk upsert
export { STATS as STATS_LIST }

export type PlayerStatDataSource =
  | 'verified_static'
  | 'api_football'
  | 'verified_static+api_football'

export interface PlayerStatRecord {
  player_id: number
  player_name: string
  nationality?: string | null
  club: string | null
  league: string | null
  season: number
  goals_club: number | null
  assists_club: number | null
  appearances_club: number | null
  starts_club: number | null
  minutes_club: number | null
  clean_sheets: number | null
  goals_national: number | null
  caps_national: number | null
  updated_at: string
  data_source: PlayerStatDataSource
  verified_at: string | null
  source_note: string | null
}

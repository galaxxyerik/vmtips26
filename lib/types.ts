export type Pick = '1' | 'X' | '2'

export type Phase = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final'

export type GroupLabel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L'

export interface DbUser {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  is_verified: boolean
  is_admin: boolean
  created_at: string
}

export interface DbMatch {
  id: number
  phase: Phase
  group_label: GroupLabel | null
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  home_goal_scorers: string[]
  away_goal_scorers: string[]
  kickoff: string
  api_updated_at: string | null
}

export interface DbPick {
  id: string
  user_id: string
  match_id: number
  pick: Pick
  points: number | null
  submitted_at: string
}

export interface DbThirdPlacePick {
  user_id: string
  team: string
  advances: boolean
}

export interface DbBracketPick {
  user_id: string
  match_id: number
  pick_team: string
}

export interface DbTopScorerPick {
  user_id: string
  scope: string
  player_name: string
}

export interface DbSubmissionStatus {
  user_id: string
  submitted: boolean
  confirmed: boolean
  confirmed_at: string | null
}

export interface DbNotification {
  id: string
  user_id: string
  type: string
  payload: Record<string, unknown>
  read: boolean
  created_at: string
}

// Onboarding local state (stored in localStorage)
export interface OnboardingState {
  groupPicks: Record<number, Pick>           // matchId -> pick
  thirdPlaceGroups: Record<GroupLabel, string> // group -> team name (team that finished 3rd)
  advancingThirdGroups: GroupLabel[]          // 8 selected 3rd-place groups
  bracketPicks: Record<number, string>        // matchNumber -> winning team name
  topScorerPicks: Record<string, string>      // scope -> player name
}

export const ONBOARDING_KEY = 'vmtips26_onboarding'

export const GROUPS: GroupLabel[] = ['A','B','C','D','E','F','G','H','I','J','K','L']

export const PHASE_LABELS: Record<Phase, string> = {
  group: 'Gruppspel',
  r32: 'Omgång 32',
  r16: 'Omgång 16',
  qf: 'Kvartsfinal',
  sf: 'Semifinal',
  final: 'Final',
}

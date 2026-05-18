export type Pick = '1' | 'X' | '2'
export type GroupLabel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L'
export const GROUPS: GroupLabel[] = ['A','B','C','D','E','F','G','H','I','J','K','L']

export const ONBOARDING_KEY = 'vmtips26_draft'

export interface VmtMatch {
  id: number
  match_number: number | null
  phase: 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'bronze' | 'final'
  group_label: string | null
  home_team: string
  away_team: string
  kickoff: string
  venue: string | null
  home_score: number | null
  away_score: number | null
  result: Pick | null
  status: 'scheduled' | 'live' | 'finished'
}

export interface OnboardingDraft {
  step: 'group-stage' | 'bracket' | 'final-details'
  updatedAt: string
  // Step 1
  matchPicks: Record<number, Pick>           // matchId -> '1'|'X'|'2'
  groupTableOrder: Record<string, string[]>  // groupLabel -> [1st,2nd,3rd,4th]
  thirdPlaceSelected: string[]               // groupLabels of selected third-place teams (max 8)
  groupScorers: Record<string, string>       // groupLabel -> playerName
  // Step 2
  bracketPicks: Record<number, string>       // matchNumber -> teamName
  // Step 3
  tournamentScorer: string
  name: string
  email: string
}

export const PHASE_POINTS: Record<string, { exact: number; partial: number }> = {
  r32:    { exact: 2,   partial: 1 },
  r16:    { exact: 3,   partial: 1.5 },
  qf:     { exact: 4,   partial: 2 },
  sf:     { exact: 5,   partial: 2.5 },
  bronze: { exact: 3,   partial: 1.5 },
  final:  { exact: 6,   partial: 3 },
}
export const GROUP_PICK_POINTS = 1
export const GROUP_TABLE_EXACT_POINTS = 2
export const GROUP_TABLE_NEAR_POINTS = 1
export const GROUP_SCORER_POINTS = 3
export const THIRD_PLACE_POINTS = 1
export const TOURNAMENT_SCORER_POINTS = 5

import type { Phase, Pick } from './types'

export const PHASE_POINTS: Record<Phase, number> = {
  group: 1,
  r32: 2,
  r16: 3,
  qf: 4,
  sf: 5,
  final: 6,
}

export const TOP_SCORER_GROUP_POINTS = 3
export const TOP_SCORER_TOURNAMENT_POINTS = 5
export const THIRD_PLACE_CORRECT_POINTS = 1

/**
 * Derive the 1/X/2 result from a completed match.
 * Returns null if the match isn't finished (no scores).
 */
export function matchResult(homeScore: number | null, awayScore: number | null): Pick | null {
  if (homeScore === null || awayScore === null) return null
  if (homeScore > awayScore) return '1'
  if (homeScore === awayScore) return 'X'
  return '2'
}

/**
 * Calculate points for a single group/knockout pick.
 */
export function calcPickPoints(
  phase: Phase,
  userPick: Pick,
  homeScore: number | null,
  awayScore: number | null,
): number {
  const result = matchResult(homeScore, awayScore)
  if (result === null) return 0
  return userPick === result ? PHASE_POINTS[phase] : 0
}

/**
 * Calculate total points for a user across all their picks (summary view).
 */
export function calcTotalPoints(params: {
  pickPoints: number[]
  thirdPlaceCorrect: number
  topScorerGroupCorrect: number
  topScorerTournamentCorrect: boolean
}): number {
  const { pickPoints, thirdPlaceCorrect, topScorerGroupCorrect, topScorerTournamentCorrect } = params
  const picks = pickPoints.reduce((sum, p) => sum + p, 0)
  const thirds = thirdPlaceCorrect * THIRD_PLACE_CORRECT_POINTS
  const groupScorers = topScorerGroupCorrect * TOP_SCORER_GROUP_POINTS
  const tournamentScorer = topScorerTournamentCorrect ? TOP_SCORER_TOURNAMENT_POINTS : 0
  return picks + thirds + groupScorers + tournamentScorer
}

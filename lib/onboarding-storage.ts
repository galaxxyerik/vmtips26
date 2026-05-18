import type { OnboardingState, GroupLabel, Pick } from './types'
import { ONBOARDING_KEY, GROUPS } from './types'

function emptyState(): OnboardingState {
  return {
    groupPicks: {},
    thirdPlaceGroups: {} as Record<GroupLabel, string>,
    advancingThirdGroups: [],
    bracketPicks: {},
    topScorerPicks: {},
  }
}

export function loadOnboarding(): OnboardingState {
  if (typeof window === 'undefined') return emptyState()
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY)
    if (!raw) return emptyState()
    return JSON.parse(raw) as OnboardingState
  } catch {
    return emptyState()
  }
}

export function saveOnboarding(state: OnboardingState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state))
}

export function clearOnboarding(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ONBOARDING_KEY)
}

export function setGroupPick(matchId: number, pick: Pick): void {
  const state = loadOnboarding()
  state.groupPicks[matchId] = pick
  saveOnboarding(state)
}

export function setThirdPlaceGroup(group: GroupLabel, team: string): void {
  const state = loadOnboarding()
  state.thirdPlaceGroups[group] = team
  saveOnboarding(state)
}

export function setAdvancingThirdGroups(groups: GroupLabel[]): void {
  const state = loadOnboarding()
  state.advancingThirdGroups = groups
  saveOnboarding(state)
}

export function setBracketPick(matchNumber: number, team: string): void {
  const state = loadOnboarding()
  state.bracketPicks[matchNumber] = team
  saveOnboarding(state)
}

export function setTopScorerPick(scope: string, playerName: string): void {
  const state = loadOnboarding()
  state.topScorerPicks[scope] = playerName
  saveOnboarding(state)
}

/** Derives which team finished 3rd in each group from a set of match picks + match data */
export function deriveThirdPlaceTeams(
  groupMatches: Array<{ id: number; group_label: string; home_team: string; away_team: string }>,
  picks: Record<number, Pick>
): Partial<Record<GroupLabel, string>> {
  // Track wins, draws, losses for each team per group
  const groupStats: Record<string, Record<string, { w: number; d: number; l: number; pts: number }>> = {}

  for (const m of groupMatches) {
    const g = m.group_label as GroupLabel
    if (!groupStats[g]) groupStats[g] = {}
    if (!groupStats[g][m.home_team]) groupStats[g][m.home_team] = { w: 0, d: 0, l: 0, pts: 0 }
    if (!groupStats[g][m.away_team]) groupStats[g][m.away_team] = { w: 0, d: 0, l: 0, pts: 0 }

    const pick = picks[m.id]
    if (!pick) continue

    const home = groupStats[g][m.home_team]
    const away = groupStats[g][m.away_team]

    if (pick === '1') { home.w++; home.pts += 3; away.l++ }
    else if (pick === 'X') { home.d++; home.pts += 1; away.d++; away.pts += 1 }
    else { away.w++; away.pts += 3; home.l++ }
  }

  const result: Partial<Record<GroupLabel, string>> = {}

  for (const [g, teams] of Object.entries(groupStats)) {
    const sorted = Object.entries(teams).sort((a, b) => b[1].pts - a[1].pts)
    if (sorted.length >= 3) {
      result[g as GroupLabel] = sorted[2][0]
    }
  }

  return result
}

import type { OnboardingDraft, Pick } from './types'
import { ONBOARDING_KEY } from './types'

export type OnboardingStep = 'group-stage' | 'bracket' | 'final-details'

function emptyDraft(): OnboardingDraft {
  return {
    step: 'group-stage',
    updatedAt: new Date().toISOString(),
    matchPicks: {},
    groupTableOrder: {},
    thirdPlaceSelected: [],
    groupScorers: {},
    bracketPicks: {},
    tournamentScorer: '',
    name: '',
    email: '',
  }
}

export function loadDraft(): OnboardingDraft {
  if (typeof window === 'undefined') return emptyDraft()
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY)
    if (!raw) return emptyDraft()
    const p = JSON.parse(raw) as Partial<OnboardingDraft>
    return {
      step: p.step ?? 'group-stage',
      updatedAt: p.updatedAt ?? new Date().toISOString(),
      matchPicks: p.matchPicks ?? {},
      groupTableOrder: p.groupTableOrder ?? {},
      thirdPlaceSelected: p.thirdPlaceSelected ?? [],
      groupScorers: p.groupScorers ?? {},
      bracketPicks: p.bracketPicks ?? {},
      tournamentScorer: p.tournamentScorer ?? '',
      name: p.name ?? '',
      email: p.email ?? '',
    }
  } catch {
    return emptyDraft()
  }
}

export function saveDraft(draft: OnboardingDraft): boolean {
  if (typeof window === 'undefined') return false
  try {
    draft.updatedAt = new Date().toISOString()
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(draft))
    return true
  } catch {
    return false
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ONBOARDING_KEY)
}

export function setStep(step: OnboardingStep): void {
  const d = loadDraft()
  d.step = step
  saveDraft(d)
}

export function hasDraft(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY)
    if (!raw) return false
    const p = JSON.parse(raw) as Partial<OnboardingDraft>
    return Object.keys(p.matchPicks ?? {}).length > 0
  } catch { return false }
}

export function getDraftStep(): OnboardingStep {
  const d = loadDraft()
  return d.step
}

export function getDraftTimestamp(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY)
    if (!raw) return null
    return (JSON.parse(raw) as Partial<OnboardingDraft>).updatedAt ?? null
  } catch { return null }
}

// Helpers for computing group standings from picks
export interface TeamStats {
  team: string
  pts: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
}

export function computeGroupStandings(
  matches: Array<{ id: number; home_team: string; away_team: string }>,
  picks: Record<number, Pick>
): TeamStats[] {
  const stats: Record<string, TeamStats> = {}
  const initTeam = (t: string) => {
    if (!stats[t]) stats[t] = { team: t, pts: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }
  }
  for (const m of matches) {
    initTeam(m.home_team)
    initTeam(m.away_team)
    const pick = picks[m.id]
    if (!pick) continue
    const h = stats[m.home_team]
    const a = stats[m.away_team]
    if (pick === '1') { h.pts += 3; h.w++; a.l++ }
    else if (pick === 'X') { h.pts += 1; h.d++; a.pts += 1; a.d++ }
    else { a.pts += 3; a.w++; h.l++ }
  }
  return Object.values(stats).sort((a, b) =>
    b.pts - a.pts || b.w - a.w || b.d - a.d || a.team.localeCompare(b.team)
  )
}

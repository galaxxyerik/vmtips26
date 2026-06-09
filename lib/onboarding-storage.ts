import type { OnboardingDraft, Pick } from './types'
import { ONBOARDING_KEY } from './types'

export type OnboardingStep = 'group-stage' | 'bracket' | 'final-details'

function emptyDraft(): OnboardingDraft {
  return {
    step: 'group-stage',
    updatedAt: new Date().toISOString(),
    submissionId: undefined,
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

/**
 * One-time remapping applied when loading a stale localStorage draft.
 * Matches the vmt_bracket_picks migration in 20260528120000_fix_bracket_and_add_ko_matches.sql.
 * Keys 75→77, 76→75, 77→78, 78→76, 81→84, 82→83, 83→82, 84→81,
 *      85→87, 86→88, 87→86, 88→85. R16+ (≥89) cleared.
 */
const BRACKET_REMAP: Record<number, number> = {
  75: 77, 76: 75, 77: 78, 78: 76,
  81: 84, 82: 83, 83: 82, 84: 81,
  85: 87, 86: 88, 87: 86, 88: 85,
}
const BRACKET_REMAP_VERSION = 2

function migrateBracketPicks(picks: Record<number, string>): Record<number, string> {
  const out: Record<number, string> = {}
  for (const [k, v] of Object.entries(picks)) {
    const num = Number(k)
    // R16+ match numbers (89-104) are unchanged — keep them as-is.
    // Only remap the R32 slots (73-88) that were reordered.
    const newKey = BRACKET_REMAP[num] ?? num
    out[newKey] = v
  }
  return out
}

export function loadDraft(): OnboardingDraft {
  if (typeof window === 'undefined') return emptyDraft()
  try {
    let raw = localStorage.getItem(ONBOARDING_KEY)
    if (!raw) return emptyDraft()

    // One-time fix for drafts saved while vmt_matches group G still said "Belgium"
    // (corrected to "Belgien" in migration 20260609123000). Idempotent.
    if (raw.includes('"Belgium"')) {
      raw = raw.replaceAll('"Belgium"', '"Belgien"')
      try { localStorage.setItem(ONBOARDING_KEY, raw) } catch { /* ignore */ }
    }

    const p = JSON.parse(raw) as Partial<OnboardingDraft> & { _bpv?: number }
    let bracketPicks = p.bracketPicks ?? {}

    // Migrate stale bracket match numbers exactly once
    if ((p._bpv ?? 1) < BRACKET_REMAP_VERSION) {
      bracketPicks = migrateBracketPicks(bracketPicks)
      // Persist migrated draft back so this only runs once
      const migrated = { ...p, bracketPicks, _bpv: BRACKET_REMAP_VERSION }
      try { localStorage.setItem(ONBOARDING_KEY, JSON.stringify(migrated)) } catch { /* ignore */ }
    }

    return {
      step: p.step ?? 'group-stage',
      updatedAt: p.updatedAt ?? new Date().toISOString(),
      submissionId: p.submissionId,
      matchPicks: p.matchPicks ?? {},
      groupTableOrder: p.groupTableOrder ?? {},
      thirdPlaceSelected: p.thirdPlaceSelected ?? [],
      groupScorers: p.groupScorers ?? {},
      bracketPicks,
      tournamentScorer: p.tournamentScorer ?? '',
      name: p.name ?? '',
      email: p.email ?? '',
    }
  } catch {
    return emptyDraft()
  }
}

// Write to localStorage only — no server push. Used when restoring from server.
export function restoreDraft(draft: OnboardingDraft): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(draft))
  } catch { /* ignore */ }
}

export function saveDraft(draft: OnboardingDraft): boolean {
  if (typeof window === 'undefined') return false
  try {
    draft.updatedAt = new Date().toISOString()
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(draft))
    // Fire-and-forget server sync so the draft survives a device switch
    if (draft.email) {
      fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: draft.email.trim().toLowerCase(), draft }),
      }).catch(() => {})
    }
    return true
  } catch {
    return false
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY)
    const email = raw ? (JSON.parse(raw) as Partial<OnboardingDraft>).email : undefined
    localStorage.removeItem(ONBOARDING_KEY)
    if (email) {
      fetch('/api/draft', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      }).catch(() => {})
    }
  } catch {
    localStorage.removeItem(ONBOARDING_KEY)
  }
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

export const PICKS_DEADLINE_AT = new Date('2026-06-11T19:30:00Z') // 21:30 Europe/Stockholm (CEST = UTC+2)

export function canEditPicks(now = new Date()) {
  return now < PICKS_DEADLINE_AT
}

// Post-deadline edit exceptions.
//
// A handful of users had their knockout (R16+) picks hard-deleted in the May 28
// incident and could not redo them before the deadline. They are granted a
// one-off exception to edit their tip AFTER the deadline — but only from the
// slutspel (bracket) step onward. The group stage stays locked for them (those
// matches are already being played), so their group picks are preserved as-is.
//
// Keyed by normalized full name (email isn't reachable from every call site, and
// names are unique in this friends pool). Remove a name here once they've
// re-submitted to re-lock their tip.
const POST_DEADLINE_EDIT_NAMES = new Set<string>([
  'max rundström',
])

// The onboarding step an exception user resumes at — their group stage is locked.
export const POST_DEADLINE_EDIT_START_STEP = 'bracket' as const

function normalizeName(name?: string | null): string {
  return (name ?? '').trim().toLowerCase()
}

// True if this named user has a standing post-deadline edit exception.
export function hasPostDeadlineEditException(name?: string | null): boolean {
  return POST_DEADLINE_EDIT_NAMES.has(normalizeName(name))
}

// True if this named user may edit picks right now — either the deadline hasn't
// passed, or they hold a post-deadline exception.
export function canEditPicksFor(name?: string | null, now = new Date()): boolean {
  return canEditPicks(now) || hasPostDeadlineEditException(name)
}

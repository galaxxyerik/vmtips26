export const PICKS_DEADLINE_AT = new Date('2026-06-11T15:00:00Z')

export function canEditPicks(now = new Date()) {
  return now < PICKS_DEADLINE_AT
}

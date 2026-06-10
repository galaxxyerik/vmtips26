export const PICKS_DEADLINE_AT = new Date('2026-06-11T19:00:00Z') // 21:00 Europe/Stockholm (CEST = UTC+2)

export function canEditPicks(now = new Date()) {
  return now < PICKS_DEADLINE_AT
}

export const PHASE_POINTS: Record<string, { exact: number; partial: number }> = {
  r32:    { exact: 2,   partial: 1 },
  r16:    { exact: 3,   partial: 1.5 },
  qf:     { exact: 4,   partial: 2 },
  sf:     { exact: 5,   partial: 2.5 },
  bronze: { exact: 3,   partial: 1.5 },
  final:  { exact: 6,   partial: 3 },
}
export const GROUP_PICK_POINTS        = 1
export const GROUP_TABLE_EXACT_POINTS = 2
export const GROUP_TABLE_NEAR_POINTS  = 1
export const GROUP_SCORER_POINTS      = 3
export const THIRD_PLACE_POINTS       = 1
export const TOURNAMENT_SCORER_POINTS = 5

// ── Types ──────────────────────────────────────────────────────────────────────

/** DB stores scorers as jsonb — either plain names or { player, minute } objects (API-Football sync). */
export type ScorerEntry = string | { player: string; minute?: number | null }

export function scorerName(entry: ScorerEntry): string {
  return typeof entry === 'string' ? entry : entry.player
}

export interface MatchForScoring {
  id: number
  match_number: number | null
  phase: string
  group_label: string | null
  home_team: string
  away_team: string
  result: '1' | 'X' | '2' | null  // null = not finished
  home_goal_scorers: ScorerEntry[]
  away_goal_scorers: ScorerEntry[]
}

/**
 * Admin-entered facit (vmt_page_content `scoring.group_scorer.*` / `scoring.tournament_scorer`).
 * A non-empty override is authoritative and replaces the scorer derivation from match data —
 * use comma-separated names for a shared golden boot.
 */
export interface ScoringOverrides {
  groupScorers?: Record<string, string>
  tournamentScorer?: string
}

function overrideNames(value: string | undefined): string[] | null {
  const names = (value ?? '').split(',').map(s => s.trim()).filter(Boolean)
  return names.length > 0 ? names : null
}

export interface SubmissionPicks {
  matchPicks: Record<number, string>       // matchId → '1'|'X'|'2'
  groupTableOrder: Record<string, string[]> // group → [1st,2nd,3rd,4th]
  thirdPlaceSelected: string[]              // group labels
  groupScorers: Record<string, string>      // group → playerName
  bracketPicks: Record<number, string>      // matchNumber → teamName
  tournamentScorer: string
}

// ── Main entry point ───────────────────────────────────────────────────────────

export function calculateScore(
  picks: SubmissionPicks,
  matches: MatchForScoring[],
  overrides: ScoringOverrides = {}
): number {
  let total = 0

  const groupMatches    = matches.filter(m => m.phase === 'group')
  const knockoutMatches = matches.filter(m => m.phase !== 'group')

  total += scoreGroupResults(picks, groupMatches)
  total += scoreGroupTables(picks, groupMatches)
  total += scoreThirdPlace(picks, groupMatches)
  total += scoreGroupScorers(picks, groupMatches, overrides)
  total += scoreBracket(picks, knockoutMatches)
  total += scoreTournamentScorer(picks, matches, overrides)

  return total
}

// ── Group match results ────────────────────────────────────────────────────────

function scoreGroupResults(picks: SubmissionPicks, groupMatches: MatchForScoring[]): number {
  let pts = 0
  for (const m of groupMatches) {
    if (m.result && picks.matchPicks[m.id] === m.result) pts += GROUP_PICK_POINTS
  }
  return pts
}

// ── Group table order ──────────────────────────────────────────────────────────

interface TeamStats { team: string; pts: number; w: number; d: number; gf: number; ga: number }

function actualGroupStandings(matches: MatchForScoring[]): string[] {
  const stats: Record<string, TeamStats> = {}
  const init = (t: string) => { if (!stats[t]) stats[t] = { team: t, pts: 0, w: 0, d: 0, gf: 0, ga: 0 } }

  for (const m of matches) {
    if (!m.result) continue
    init(m.home_team); init(m.away_team)
    const h = stats[m.home_team], a = stats[m.away_team]
    if (m.result === '1') { h.pts += 3; h.w++; h.gf++; a.ga++ }
    else if (m.result === 'X') { h.pts++; h.d++; a.pts++; a.d++ }
    else { a.pts += 3; a.w++; a.gf++; h.ga++ }
  }

  return Object.values(stats)
    .sort((a, b) => b.pts - a.pts || b.w - a.w || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || a.team.localeCompare(b.team))
    .map(s => s.team)
}

function scoreGroupTables(picks: SubmissionPicks, groupMatches: MatchForScoring[]): number {
  const ALL_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']
  let pts = 0

  for (const group of ALL_GROUPS) {
    const gm = groupMatches.filter(m => m.group_label === group && m.result !== null)
    if (gm.length < 6) continue // not all finished yet

    const actual    = actualGroupStandings(groupMatches.filter(m => m.group_label === group))
    const predicted = picks.groupTableOrder[group] ?? []

    for (let i = 0; i < actual.length; i++) {
      const predIdx = predicted.indexOf(actual[i])
      if (predIdx === i) pts += GROUP_TABLE_EXACT_POINTS
      else if (predIdx !== -1 && Math.abs(predIdx - i) === 1) pts += GROUP_TABLE_NEAR_POINTS
    }
  }
  return pts
}

// ── Third-place teams (8 best thirds advance) ─────────────────────────────────

function scoreThirdPlace(picks: SubmissionPicks, groupMatches: MatchForScoring[]): number {
  const ALL_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']
  // Only score when all groups are complete (6 matches each)
  for (const g of ALL_GROUPS) {
    if (groupMatches.filter(m => m.group_label === g && m.result !== null).length < 6) return 0
  }

  // Collect each group's 3rd-place team stats
  const thirds: Array<{ group: string } & TeamStats> = []
  for (const group of ALL_GROUPS) {
    const standings = actualGroupStandings(groupMatches.filter(m => m.group_label === group))
    const team = standings[2]
    if (!team) continue
    const s = getTeamStats(team, groupMatches.filter(m => m.group_label === group))
    thirds.push({ group, ...s, team })
  }

  // FIFA ranking: points, then GD, then GF, then alpha by group
  thirds.sort((a, b) =>
    b.pts - a.pts ||
    (b.gf - b.ga) - (a.gf - a.ga) ||
    b.gf - a.gf ||
    a.group.localeCompare(b.group)
  )

  const advancing = new Set(thirds.slice(0, 8).map(t => t.group))
  let pts = 0
  for (const g of picks.thirdPlaceSelected) {
    if (advancing.has(g)) pts += THIRD_PLACE_POINTS
  }
  return pts
}

function getTeamStats(team: string, matches: MatchForScoring[]): Omit<TeamStats, 'team'> {
  let pts = 0, w = 0, d = 0, gf = 0, ga = 0
  for (const m of matches) {
    if (!m.result) continue
    const isHome = m.home_team === team
    if (isHome) {
      if (m.result === '1') { pts += 3; w++; gf++ }
      else if (m.result === 'X') { pts++; d++ }
      else { ga++ }
    } else if (m.away_team === team) {
      if (m.result === '2') { pts += 3; w++; gf++ }
      else if (m.result === 'X') { pts++; d++ }
      else { ga++ }
    }
  }
  return { pts, w, d, gf, ga }
}

// ── Group scorers ──────────────────────────────────────────────────────────────

function scoreGroupScorers(
  picks: SubmissionPicks,
  groupMatches: MatchForScoring[],
  overrides: ScoringOverrides
): number {
  const ALL_GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L']
  let pts = 0

  for (const group of ALL_GROUPS) {
    const pick = picks.groupScorers[group]
    if (!pick) continue

    // Admin-entered facit takes precedence over derivation from match data
    const override = overrideNames(overrides.groupScorers?.[group])
    if (override) {
      if (override.some(s => nameMatch(pick, s))) pts += GROUP_SCORER_POINTS
      continue
    }

    const gm = groupMatches.filter(m => m.group_label === group && m.result !== null)
    if (gm.length < 6) continue // group not complete yet

    const topScorers = groupTopScorers(gm)
    if (topScorers.some(s => nameMatch(pick, s))) pts += GROUP_SCORER_POINTS
  }
  return pts
}

/** All players tied at the highest goal count (a shared golden boot counts for everyone). */
function groupTopScorers(matches: MatchForScoring[]): string[] {
  const goals: Record<string, number> = {}
  for (const m of matches) {
    for (const p of m.home_goal_scorers ?? []) goals[scorerName(p)] = (goals[scorerName(p)] ?? 0) + 1
    for (const p of m.away_goal_scorers ?? []) goals[scorerName(p)] = (goals[scorerName(p)] ?? 0) + 1
  }
  const entries = Object.entries(goals)
  if (entries.length === 0) return []
  const max = Math.max(...entries.map(([, n]) => n))
  return entries.filter(([, n]) => n === max).map(([name]) => name)
}

// ── Bracket picks ──────────────────────────────────────────────────────────────

function scoreBracket(picks: SubmissionPicks, knockoutMatches: MatchForScoring[]): number {
  // Build lookup: matchNumber → actual winner
  const winnerOf: Record<number, string> = {}
  // phase → teams that WON a match in that phase (advanced through the round)
  const winnersInPhase: Record<string, Set<string>> = {}
  // phase → teams that PLAYED in that phase
  const teamsInPhase: Record<string, Set<string>> = {}

  for (const m of knockoutMatches) {
    if (m.match_number === null || !m.result) continue
    const winner = m.result === '1' ? m.home_team : m.away_team
    winnerOf[m.match_number] = winner
    if (!winnersInPhase[m.phase]) winnersInPhase[m.phase] = new Set()
    winnersInPhase[m.phase].add(winner)
    if (!teamsInPhase[m.phase]) teamsInPhase[m.phase] = new Set()
    teamsInPhase[m.phase].add(m.home_team)
    teamsInPhase[m.phase].add(m.away_team)
  }

  let pts = 0
  for (const [matchNumStr, pickedTeam] of Object.entries(picks.bracketPicks)) {
    const matchNum = Number(matchNumStr)
    const match = knockoutMatches.find(m => m.match_number === matchNum)
    if (!match || !match.result) continue

    const phase = match.phase
    const phasePts = PHASE_POINTS[phase]
    if (!phasePts) continue

    if (winnerOf[matchNum] === pickedTeam) {
      pts += phasePts.exact
    } else if (phase === 'final' || phase === 'bronze') {
      // Single-match rounds (per Erik June 9): partial if the picked team
      // reached the match but lost — e.g. 3 p for a losing finalist.
      if (teamsInPhase[phase]?.has(pickedTeam)) pts += phasePts.partial
    } else if (winnersInPhase[phase]?.has(pickedTeam)) {
      // R32–SF: the picked team advanced through this round, but via a
      // different bracket path (annan väg). Merely playing (and losing) a
      // match in the round gives nothing — the rules page says the team
      // must "ta sig igenom" the round.
      pts += phasePts.partial
    }
  }
  return pts
}

// ── Tournament top scorer ──────────────────────────────────────────────────────

function scoreTournamentScorer(
  picks: SubmissionPicks,
  matches: MatchForScoring[],
  overrides: ScoringOverrides
): number {
  if (!picks.tournamentScorer) return 0

  // Admin-entered facit takes precedence over derivation from match data
  const override = overrideNames(overrides.tournamentScorer)
  if (override) {
    return override.some(s => nameMatch(picks.tournamentScorer, s)) ? TOURNAMENT_SCORER_POINTS : 0
  }

  const goals: Record<string, number> = {}
  for (const m of matches) {
    if (!m.result) continue
    for (const p of m.home_goal_scorers ?? []) goals[scorerName(p)] = (goals[scorerName(p)] ?? 0) + 1
    for (const p of m.away_goal_scorers ?? []) goals[scorerName(p)] = (goals[scorerName(p)] ?? 0) + 1
  }
  const entries = Object.entries(goals)
  if (entries.length === 0) return 0
  const max = Math.max(...entries.map(([, n]) => n))
  const topScorers = entries.filter(([, n]) => n === max).map(([name]) => name)
  return topScorers.some(s => nameMatch(picks.tournamentScorer, s)) ? TOURNAMENT_SCORER_POINTS : 0
}

// ── Name matching (case-insensitive, handles "Last, First" vs "First Last") ────

export function nameMatch(pick: string, actual: string): boolean {
  const normalize = (s: string) =>
    s.toLowerCase().trim().replace(/[.,\-]/g, ' ').replace(/\s+/g, ' ')
  const p = normalize(pick)
  const a = normalize(actual)
  if (p === a) return true
  // Check if one includes the other (handles partial last-name picks)
  if (a.includes(p) || p.includes(a)) return true
  // Compare last names
  const lastName = (s: string) => s.split(' ').pop() ?? s
  return lastName(p) === lastName(a)
}

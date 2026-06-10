/**
 * Scoring verification (no DB, pure functions): runs the QA scenarios against
 * lib/scoring.ts with synthetic match data.
 *
 *   A — 36 of 72 correct match outcomes ⇒ exactly 36 p
 *   B — Grupp F exact table (Sverige, Nederländerna, Japan, Tunisien) ⇒ 8 p
 *   C — annan väg: exact 2p, other-path 1p, loser 0p, losing finalist 3p ⇒ 6 p
 *   MAX — a perfect submission ⇒ exactly 308 p (212 group + 91 KO + 5 bonus)
 *
 * Usage: npx tsx scripts/verify-scoring.ts
 */
import { calculateScore, type MatchForScoring, type SubmissionPicks } from '../lib/scoring'
import { buildR32Bracket, type Group } from '../lib/bracket-logic'

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'] as Group[]

const emptyPicks = (): SubmissionPicks => ({
  matchPicks: {}, groupTableOrder: {}, thirdPlaceSelected: [],
  groupScorers: {}, bracketPicks: {}, tournamentScorer: '',
})

let failures = 0
function check(name: string, actual: number, expected: number) {
  const ok = actual === expected
  if (!ok) failures++
  console.log(`${ok ? 'OK ' : 'FAIL'} ${name}: expected ${expected}, actual ${actual}`)
}

// ── Synthetic group stage ────────────────────────────────────────────────────
// Teams G_A1..G_A4 etc. Fixtures per group: (1v2)(1v3)(1v4)(2v3)(2v4)(3v4),
// all home wins ⇒ standings T1 9p, T2 6p, T3 3p, T4 0p.
function groupMatches(withScorers = false): MatchForScoring[] {
  const out: MatchForScoring[] = []
  let id = 1
  for (const g of GROUPS) {
    const T = (n: number) => `G_${g}${n}`
    const fixtures: [number, number][] = [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]
    fixtures.forEach(([h, a], idx) => {
      out.push({
        id: id++, match_number: null, phase: 'group', group_label: g,
        home_team: T(h), away_team: T(a), result: '1',
        home_goal_scorers: withScorers && idx === 0 ? [`Scorer_${g}`] : [],
        away_goal_scorers: [],
      })
    })
  }
  return out
}

// ── Scenario A ───────────────────────────────────────────────────────────────
{
  const matches = groupMatches()
  const picks = emptyPicks()
  // 36 correct ('1' on match ids 1–36), 36 wrong ('X' on 37–72)
  for (let i = 1; i <= 72; i++) picks.matchPicks[i] = i <= 36 ? '1' : 'X'
  check('Scenario A (36 rätta matchutfall)', calculateScore(picks, matches), 36)
}

// ── Scenario B ───────────────────────────────────────────────────────────────
{
  // Only group F finished, with real names. No outcome picks (isolate table pts).
  const teams = ['Sverige', 'Nederländerna', 'Japan', 'Tunisien']
  const fixtures: [number, number][] = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]
  const matches: MatchForScoring[] = fixtures.map(([h, a], i) => ({
    id: 100 + i, match_number: null, phase: 'group', group_label: 'F',
    home_team: teams[h], away_team: teams[a], result: '1',
    home_goal_scorers: [], away_goal_scorers: [],
  }))
  const picks = emptyPicks()
  picks.groupTableOrder['F'] = ['Sverige', 'Nederländerna', 'Japan', 'Tunisien']
  check('Scenario B (Grupp F exakt tabell, 4 × 2 p)', calculateScore(picks, matches), 8)
}

// ── Scenario C ───────────────────────────────────────────────────────────────
{
  const ko: MatchForScoring[] = [
    // M73: Frankrike wins — user picked Frankrike here ⇒ exact 2 p
    { id: 201, match_number: 73, phase: 'r32', group_label: null, home_team: 'Frankrike', away_team: 'Irland', result: '1', home_goal_scorers: [], away_goal_scorers: [] },
    // M76: Sverige wins — user picked Sverige to win M77 ⇒ annan väg 1 p
    { id: 202, match_number: 76, phase: 'r32', group_label: null, home_team: 'Sverige', away_team: 'Wales', result: '1', home_goal_scorers: [], away_goal_scorers: [] },
    { id: 203, match_number: 77, phase: 'r32', group_label: null, home_team: 'Polen', away_team: 'Ungern', result: '1', home_goal_scorers: [], away_goal_scorers: [] },
    // M78: Tyskland PLAYS but LOSES — user picked Tyskland to win M75 ⇒ 0 p (old bug gave 1)
    { id: 204, match_number: 78, phase: 'r32', group_label: null, home_team: 'Grekland', away_team: 'Tyskland', result: '1', home_goal_scorers: [], away_goal_scorers: [] },
    { id: 205, match_number: 75, phase: 'r32', group_label: null, home_team: 'Serbien', away_team: 'Albanien', result: '1', home_goal_scorers: [], away_goal_scorers: [] },
    // Final M104: Spanien beats England — user picked England as champion ⇒ losing finalist 3 p
    { id: 206, match_number: 104, phase: 'final', group_label: null, home_team: 'Spanien', away_team: 'England', result: '1', home_goal_scorers: [], away_goal_scorers: [] },
  ]
  const picks = emptyPicks()
  picks.bracketPicks = { 73: 'Frankrike', 77: 'Sverige', 75: 'Tyskland', 104: 'England' }
  check('Scenario C (2 exakt + 1 annan väg + 0 förlorare + 3 finalist)', calculateScore(picks, ko), 6)
}

// ── MAX: perfect submission ⇒ 308 ────────────────────────────────────────────
{
  const matches = groupMatches(true)
  const picks = emptyPicks()

  // 72 correct outcomes
  for (let i = 1; i <= 72; i++) picks.matchPicks[i] = '1'

  // Exact tables + scorers
  const winners = {} as Record<Group, string>
  const runners = {} as Record<Group, string>
  const thirds: Partial<Record<Group, string>> = {}
  for (const g of GROUPS) {
    picks.groupTableOrder[g] = [1, 2, 3, 4].map(n => `G_${g}${n}`)
    winners[g] = `G_${g}1`; runners[g] = `G_${g}2`; thirds[g] = `G_${g}3`
    picks.groupScorers[g] = `Scorer_${g}`
  }

  // All 12 thirds are tied ⇒ ranked alphabetically by group ⇒ A–H advance
  picks.thirdPlaceSelected = ['A','B','C','D','E','F','G','H']

  // Build the actual R32 from the same data and let every pick be exact
  const r32 = buildR32Bracket(winners, runners, thirds, picks.thirdPlaceSelected as Group[])
  if (!r32) throw new Error('Annex C lookup failed for A–H')

  const ko: MatchForScoring[] = []
  let id = 500
  const phaseOf = (n: number) => n <= 88 ? 'r32' : n <= 96 ? 'r16' : n <= 100 ? 'qf' : n <= 102 ? 'sf' : n === 103 ? 'bronze' : 'final'
  for (const m of r32) {
    picks.bracketPicks[m.matchNumber] = m.team1
    ko.push({ id: id++, match_number: m.matchNumber, phase: 'r32', group_label: null, home_team: m.team1, away_team: m.team2, result: '1', home_goal_scorers: [], away_goal_scorers: [] })
  }
  const FEEDERS: Record<number, [number, number]> = {
    89: [73,74], 90: [75,76], 91: [77,78], 92: [79,80],
    93: [81,82], 94: [83,84], 95: [85,86], 96: [87,88],
    97: [89,90], 98: [91,92], 99: [93,94], 100: [95,96],
    101: [97,98], 102: [99,100],
  }
  for (let n = 89; n <= 102; n++) {
    const [a, b] = FEEDERS[n]
    const t1 = picks.bracketPicks[a], t2 = picks.bracketPicks[b]
    picks.bracketPicks[n] = t1
    ko.push({ id: id++, match_number: n, phase: phaseOf(n), group_label: null, home_team: t1, away_team: t2, result: '1', home_goal_scorers: [], away_goal_scorers: [] })
  }
  // Bronze: SF losers; final: SF winners — all picked exactly
  const sfLoser1 = picks.bracketPicks[98], sfLoser2 = picks.bracketPicks[100]
  picks.bracketPicks[103] = sfLoser1
  ko.push({ id: id++, match_number: 103, phase: 'bronze', group_label: null, home_team: sfLoser1, away_team: sfLoser2, result: '1', home_goal_scorers: [], away_goal_scorers: [] })
  picks.bracketPicks[104] = picks.bracketPicks[101]
  ko.push({ id: id++, match_number: 104, phase: 'final', group_label: null, home_team: picks.bracketPicks[101], away_team: picks.bracketPicks[102], result: '1', home_goal_scorers: ['SuperScorer', 'SuperScorer'], away_goal_scorers: [] })

  picks.tournamentScorer = 'SuperScorer'

  check('MAX (perfekt tips = 212 + 91 + 5)', calculateScore(picks, [...matches, ...ko]), 308)
}

// ── Scorer shapes + admin overrides ──────────────────────────────────────────
{
  // Group A complete; scorers stored as { player, minute } objects (API-Football shape)
  const matches = groupMatches().map(m => m.group_label === 'A'
    ? { ...m, home_goal_scorers: [{ player: 'Objektsson', minute: 12 }] }
    : m)

  const picks = emptyPicks()
  picks.groupScorers['A'] = 'Objektsson'
  check('Objekt-målgörare ({player,minute} räknas)', calculateScore(picks, matches), 3)

  // Admin override beats derived data: facit says Annansson, not Objektsson
  check(
    'Override slår härledd skytt (fel namn ⇒ 0)',
    calculateScore(picks, matches, { groupScorers: { A: 'Annansson' } }),
    0
  )
  picks.groupScorers['A'] = 'Annansson'
  check(
    'Override ger poäng vid rätt namn',
    calculateScore(picks, matches, { groupScorers: { A: 'Annansson' } }),
    3
  )

  // Tournament scorer override incl. shared golden boot (comma-separated)
  picks.tournamentScorer = 'Isak'
  check(
    'Turneringsskytt via override (delad skytteliga)',
    calculateScore(picks, matches, { groupScorers: { A: 'Annansson' }, tournamentScorer: 'Mbappé, Isak' }),
    3 + 5
  )
}

if (failures > 0) { console.error(`\n${failures} scenario(s) FAILED`); process.exit(1) }
console.log('\nAll scoring scenarios passed.')

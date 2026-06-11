/**
 * E2E scoring simulation against the REAL fixture list and REAL code paths.
 *
 * verify-scoring.ts tests the scoring engine with synthetic teams and hand-built
 * SubmissionPicks objects — it never touches the DB row shapes. This script closes
 * that gap: it builds a complete simulated tournament facit on the LIVE vmt_matches
 * fixture list (scripts/fixtures/vmt-matches-live.json), constructs a "perfect"
 * submission the same way the onboarding client posts it, and verifies the score
 * both directly and after a round-trip through the real database tables.
 *
 * Modes:
 *   npx tsx scripts/e2e-scoring-simulation.ts
 *       Local simulation: perfect submission ⇒ 308 p, plus per-rule delta checks
 *       (wrong 1X2 pick, swapped table places, wrong scorers, bracket partials).
 *
 *   npx tsx scripts/e2e-scoring-simulation.ts --emit-sql
 *       Prints SQL that creates a clearly-marked TEST submission and stores the
 *       perfect picks via the real vmt_replace_picks RPC (the same one
 *       /api/submit-picks uses), plus the query to read every pick row back and
 *       the cleanup DELETE. Run via Supabase SQL Editor / MCP.
 *
 *   npx tsx scripts/e2e-scoring-simulation.ts --verify <pick-rows.json>
 *       Takes the pick rows read back from the DB, feeds them through the REAL
 *       loadSubmissionPicks row mapping (lib/recalculate.ts) via an in-memory
 *       Supabase stub, and asserts that the reconstructed picks are identical to
 *       the original payload and score exactly 308 p. This is the test that would
 *       have caught the {player,minute} scorer-shape bug.
 */
import { readFileSync } from 'fs'
import { randomUUID } from 'crypto'
import { calculateScore, type MatchForScoring, type ScorerEntry, type SubmissionPicks } from '../lib/scoring'
import { buildR32Bracket, sanitizeBracketPicks, type Group } from '../lib/bracket-logic'
import { loadSubmissionPicks } from '../lib/recalculate'

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'] as Group[]
const MAX_POINTS = 308

interface DbMatch {
  id: number
  match_number: number
  phase: string
  group_label: string | null
  home_team: string
  away_team: string
}

const dbMatches: DbMatch[] = JSON.parse(
  readFileSync(new URL('./fixtures/vmt-matches-live.json', import.meta.url), 'utf8')
)
const byMatchNumber = new Map(dbMatches.map(m => [m.match_number, m]))

let failures = 0
function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) failures++
  console.log(`${ok ? 'OK ' : 'FAIL'} ${name}: expected ${JSON.stringify(expected)}, actual ${JSON.stringify(actual)}`)
}

// ── Simulated facit ────────────────────────────────────────────────────────────
// Group results: within each group the alphabetically first team always wins
// ⇒ standings = alphabetical order with 9/6/3/0 points, no ties anywhere.
// Every third-place team ends on 3 p, GD −1, GF 1 ⇒ thirds tie-break falls back
// to group letter ⇒ groups A–H advance (same shape as the verify-scoring MAX case).
// Scorers: "Skytt <grupp>" scores once in each group's first match (stored as
// {player, minute} objects — the API-Football sync shape); "Guldskytten" scores
// twice in the final and wins the golden boot outright.

function groupTeamsInStrengthOrder(group: Group): string[] {
  const teams = new Set<string>()
  for (const m of dbMatches) {
    if (m.group_label === group) { teams.add(m.home_team); teams.add(m.away_team) }
  }
  return [...teams].sort((a, b) => a.localeCompare(b, 'sv'))
}

function buildSimulation() {
  const strength: Record<Group, string[]> = {} as Record<Group, string[]>
  for (const g of GROUPS) strength[g] = groupTeamsInStrengthOrder(g)

  const matches: MatchForScoring[] = []
  const matchPicks: Record<number, string> = {}
  const seenGroups = new Set<string>()

  for (const m of dbMatches.filter(m => m.phase === 'group')) {
    const g = m.group_label as Group
    const order = strength[g]
    const result: '1' | '2' = order.indexOf(m.home_team) < order.indexOf(m.away_team) ? '1' : '2'
    const firstOfGroup = !seenGroups.has(g)
    seenGroups.add(g)
    const scorer: ScorerEntry[] = firstOfGroup ? [{ player: `Skytt ${g}`, minute: 9 }] : []
    matches.push({
      id: m.id, match_number: m.match_number, phase: 'group', group_label: g,
      home_team: m.home_team, away_team: m.away_team, result,
      home_goal_scorers: result === '1' ? scorer : [],
      away_goal_scorers: result === '2' ? scorer : [],
    })
    matchPicks[m.id] = result
  }

  const winners = {} as Record<Group, string>
  const runners = {} as Record<Group, string>
  const thirds: Partial<Record<Group, string>> = {}
  const groupTableOrder: Record<string, string[]> = {}
  const groupScorers: Record<string, string> = {}
  for (const g of GROUPS) {
    groupTableOrder[g] = strength[g]
    winners[g] = strength[g][0]
    runners[g] = strength[g][1]
    thirds[g] = strength[g][2]
    groupScorers[g] = `Skytt ${g}`
  }

  const thirdPlaceSelected: Group[] = ['A','B','C','D','E','F','G','H']
  const r32 = buildR32Bracket(winners, runners, thirds, thirdPlaceSelected)
  if (!r32) throw new Error('buildR32Bracket returned null for thirds A–H')

  // KO facit: team1 (the higher seed) always wins. Picks are exact everywhere.
  const bracketPicks: Record<number, string> = {}
  for (const m of r32) {
    bracketPicks[m.matchNumber] = m.team1
    const db = byMatchNumber.get(m.matchNumber)!
    matches.push({
      id: db.id, match_number: m.matchNumber, phase: db.phase, group_label: null,
      home_team: m.team1, away_team: m.team2, result: '1',
      home_goal_scorers: [], away_goal_scorers: [],
    })
  }

  const FEEDERS: Record<number, [number, number]> = {
    89: [73,74], 90: [75,76], 91: [77,78], 92: [79,80],
    93: [81,82], 94: [83,84], 95: [85,86], 96: [87,88],
    97: [89,90], 98: [91,92], 99: [93,94], 100: [95,96],
    101: [97,98], 102: [99,100],
  }
  for (let n = 89; n <= 102; n++) {
    const [a, b] = FEEDERS[n]
    const db = byMatchNumber.get(n)!
    bracketPicks[n] = bracketPicks[a]
    matches.push({
      id: db.id, match_number: n, phase: db.phase, group_label: null,
      home_team: bracketPicks[a], away_team: bracketPicks[b], result: '1',
      home_goal_scorers: [], away_goal_scorers: [],
    })
  }

  // Bronze = SF losers, final = SF winners; Guldskytten scores twice in the final.
  const bronze = byMatchNumber.get(103)!
  bracketPicks[103] = bracketPicks[98]
  matches.push({
    id: bronze.id, match_number: 103, phase: 'bronze', group_label: null,
    home_team: bracketPicks[98], away_team: bracketPicks[100], result: '1',
    home_goal_scorers: [], away_goal_scorers: [],
  })
  const final = byMatchNumber.get(104)!
  bracketPicks[104] = bracketPicks[101]
  matches.push({
    id: final.id, match_number: 104, phase: 'final', group_label: null,
    home_team: bracketPicks[101], away_team: bracketPicks[102], result: '1',
    home_goal_scorers: [{ player: 'Guldskytten', minute: 12 }, { player: 'Guldskytten', minute: 67 }],
    away_goal_scorers: [],
  })

  const picks: SubmissionPicks = {
    matchPicks, groupTableOrder, thirdPlaceSelected, groupScorers,
    bracketPicks, tournamentScorer: 'Guldskytten',
  }
  return { matches, picks, r32 }
}

function clonePicks(p: SubmissionPicks): SubmissionPicks {
  return JSON.parse(JSON.stringify(p))
}

/** Canonical form for deep comparison (sorted keys, sorted third-place list). */
function canonical(p: SubmissionPicks): string {
  const sortObj = (o: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)))
  return JSON.stringify({
    matchPicks: sortObj(p.matchPicks as Record<string, unknown>),
    groupTableOrder: sortObj(p.groupTableOrder),
    thirdPlaceSelected: [...p.thirdPlaceSelected].sort(),
    groupScorers: sortObj(p.groupScorers),
    bracketPicks: sortObj(p.bracketPicks as unknown as Record<string, unknown>),
    tournamentScorer: p.tournamentScorer,
  })
}

// ── Local simulation + rule delta checks ──────────────────────────────────────

function runLocalSimulation() {
  const { matches, picks, r32 } = buildSimulation()

  // The payload must survive the same server-side validation submit-picks runs:
  // all 32 bracket picks must be possible under the user's own group picks
  const sanitized = sanitizeBracketPicks(picks.bracketPicks, r32)
  check('Alla 32 KO-picks giltiga mot eget gruppspel (submit-picks-validering)',
    Object.keys(sanitized).length, 32)

  check('Perfekt tips på riktig spelplan ⇒ MAX', calculateScore(picks, matches), MAX_POINTS)

  {
    const p = clonePicks(picks)
    const firstGroupMatchId = Number(Object.keys(p.matchPicks)[0])
    p.matchPicks[firstGroupMatchId] = p.matchPicks[firstGroupMatchId] === '1' ? 'X' : '1'
    check('Ett fel 1X2-val ⇒ −1', calculateScore(p, matches), MAX_POINTS - 1)
  }
  {
    const p = clonePicks(picks)
    const order = p.groupTableOrder['A']
    ;[order[2], order[3]] = [order[3], order[2]]
    check('Trea/fyra bytta i grupp A ⇒ −2 (2×2 p blir 2×1 p)', calculateScore(p, matches), MAX_POINTS - 2)
  }
  {
    const p = clonePicks(picks)
    p.thirdPlaceSelected = ['A','B','C','D','E','F','G','I'] // I:s trea går inte vidare
    check('En fel trea-grupp ⇒ −1', calculateScore(p, matches), MAX_POINTS - 1)
  }
  {
    const p = clonePicks(picks)
    p.groupScorers['A'] = 'Fel Spelare'
    check('Fel skyttekung i grupp A ⇒ −3', calculateScore(p, matches), MAX_POINTS - 3)
  }
  {
    const p = clonePicks(picks)
    p.tournamentScorer = 'Fel Spelare'
    check('Fel turneringsskytt ⇒ −5', calculateScore(p, matches), MAX_POINTS - 5)
  }
  {
    const p = clonePicks(picks)
    p.bracketPicks[104] = picks.bracketPicks[102] // förlorande finalist
    check('Förlorande finalist som mästare ⇒ −3 (6 p blir 3 p)', calculateScore(p, matches), MAX_POINTS - 3)
  }
  {
    const p = clonePicks(picks)
    const m73 = matches.find(m => m.match_number === 73)!
    p.bracketPicks[73] = m73.away_team // laget åker ut direkt ⇒ 0 p på M73
    check('Utslaget lag i M73 ⇒ −2', calculateScore(p, matches), MAX_POINTS - 2)
  }
  {
    const p = clonePicks(picks)
    p.bracketPicks[73] = picks.bracketPicks[74] // vinner sin R32, men annan väg
    check('Annan väg i M73 ⇒ −1 (2 p blir 1 p)', calculateScore(p, matches), MAX_POINTS - 1)
  }
}

// ── --emit-sql: create the test submission via the real RPC ───────────────────

const TEST_NAME = 'ZZZ TESTKONTO poängtest (raderas)'
const TEST_EMAIL = 'eeengstrand+poangtest@gmail.com'

function jsonbLiteral(value: unknown): string {
  return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`
}

function emitSql() {
  const { picks } = buildSimulation()
  const sid = process.env.TEST_SUBMISSION_ID || randomUUID()

  const groupPickRows = Object.entries(picks.matchPicks)
    .map(([matchId, pick]) => ({ match_id: Number(matchId), pick }))
  const tableRows: { group_label: string; position: number; team: string }[] = []
  for (const [group, order] of Object.entries(picks.groupTableOrder)) {
    order.forEach((team, idx) => tableRows.push({ group_label: group, position: idx + 1, team }))
  }
  const thirdRows = GROUPS.map(g => ({ group_label: g, selected: picks.thirdPlaceSelected.includes(g) }))
  const scorerRows = Object.entries(picks.groupScorers)
    .map(([group_label, player_name]) => ({ group_label, player_name }))
  const roundOf = (n: number) =>
    n <= 88 ? 'r32' : n <= 96 ? 'r16' : n <= 100 ? 'qf' : n <= 102 ? 'sf' : n === 103 ? 'bronze' : 'final'
  const bracketRows = Object.entries(picks.bracketPicks)
    .map(([n, pick_team]) => ({ match_number: Number(n), pick_team, round: roundOf(Number(n)) }))

  console.log(`-- 1. Create test submission (confirmed=false so recalc/leaderboard ignore it)
INSERT INTO vmt_submissions (id, name, email, confirmed)
VALUES ('${sid}', '${TEST_NAME}', '${TEST_EMAIL}', false);

-- 2. Store all picks atomically via the production RPC
SELECT vmt_replace_picks(
  '${sid}'::uuid,
  ${jsonbLiteral(groupPickRows)},
  ${jsonbLiteral(tableRows)},
  ${jsonbLiteral(thirdRows)},
  ${jsonbLiteral(scorerRows)},
  'Guldskytten',
  ${jsonbLiteral(bracketRows)}
);

-- 3. Read every stored pick row back (save output as JSON for --verify)
SELECT json_build_object(
  'vmt_group_picks', (SELECT json_agg(json_build_object('match_id', match_id, 'pick', pick) ORDER BY match_id) FROM vmt_group_picks WHERE submission_id = '${sid}'),
  'vmt_group_table_picks', (SELECT json_agg(json_build_object('group_label', group_label, 'position', position, 'team', team) ORDER BY group_label, position) FROM vmt_group_table_picks WHERE submission_id = '${sid}'),
  'vmt_third_place_picks', (SELECT json_agg(json_build_object('group_label', group_label, 'selected', selected) ORDER BY group_label) FROM vmt_third_place_picks WHERE submission_id = '${sid}'),
  'vmt_group_scorer_picks', (SELECT json_agg(json_build_object('group_label', group_label, 'player_name', player_name) ORDER BY group_label) FROM vmt_group_scorer_picks WHERE submission_id = '${sid}'),
  'vmt_bracket_picks', (SELECT json_agg(json_build_object('match_number', match_number, 'pick_team', pick_team) ORDER BY match_number) FROM vmt_bracket_picks WHERE submission_id = '${sid}'),
  'vmt_tournament_scorer_pick', (SELECT json_agg(json_build_object('player_name', player_name)) FROM vmt_tournament_scorer_pick WHERE submission_id = '${sid}')
) AS rows;

-- 4. Cleanup when done (FKs cascade to all six pick tables)
-- DELETE FROM vmt_submissions WHERE id = '${sid}';`)
}

// ── --verify: round-trip DB rows through the REAL loadSubmissionPicks ─────────

function fakeService(tables: Record<string, unknown[] | null>) {
  return {
    from(table: string) {
      const rows = tables[table] ?? []
      const builder = {
        select: () => builder,
        eq: () => builder,
        order: () => builder,
        maybeSingle: async () => ({ data: rows[0] ?? null, error: null }),
        then: (onF: (v: unknown) => unknown, onR: (e: unknown) => unknown) =>
          Promise.resolve({ data: rows, error: null }).then(onF, onR),
      }
      return builder
    },
  // Matches only the query-builder surface loadSubmissionPicks actually uses
  } as unknown as Parameters<typeof loadSubmissionPicks>[0]
}

async function runVerify(rowsFile: string) {
  const tables = JSON.parse(readFileSync(rowsFile, 'utf8'))
  const { matches, picks: expected } = buildSimulation()

  const loaded = await loadSubmissionPicks(fakeService(tables), 'test-submission')
  if (!loaded) throw new Error('loadSubmissionPicks returned null')

  check('DB-rader ⇒ identiska picks efter loadSubmissionPicks', canonical(loaded), canonical(expected))
  check('DB-roundtrip ⇒ samma poäng som payload', calculateScore(loaded, matches), calculateScore(expected, matches))
  check('DB-roundtrip ⇒ MAX', calculateScore(loaded, matches), MAX_POINTS)
}

// ── Entry point ────────────────────────────────────────────────────────────────

async function main() {
  const [, , flag, arg] = process.argv
  if (flag === '--emit-sql') {
    emitSql()
    return
  }
  runLocalSimulation()
  if (flag === '--verify') {
    if (!arg) throw new Error('--verify kräver en JSON-fil med pick-rader')
    await runVerify(arg)
  }
  if (failures > 0) {
    console.error(`\n${failures} kontroll(er) FAILED`)
    process.exit(1)
  }
  console.log('\nAlla E2E-simuleringskontroller passerade.')
}

main().catch(err => { console.error(err); process.exit(1) })

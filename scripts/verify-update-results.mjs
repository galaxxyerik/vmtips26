/**
 * End-to-end verification of /api/cron/update-results + Mitt tips indicators
 * against the local stub (scripts/stub-services.mjs).
 *
 * Prerequisites: stub on :54321 and the production build (`next start`) on
 * :3000, both launched with the env vars listed in stub-services.mjs plus
 * CRON_SECRET=test-cron-secret.
 *
 * What it proves:
 *   1. Cron endpoint returns 200; ESPN (scrape chain) is the DEFAULT priority
 *      source — and re-orients the Mexico game the stub serves with home/away
 *      swapped.
 *   2. Match results land in vmt_matches; points are distributed by the
 *      existing engine (TEST Anna +1, TEST Bertil +1); processed markers are
 *      written to vmt_sync_log.
 *   3. NOTHING else changed: pick tables byte-identical, submissions identical
 *      except total_points, zero DELETEs in the oplog.
 *   4. Second trigger is a no-op (skipped: no_pending_matches).
 *   5. ESPN down → Sofascore delivers the same end state.
 *   6. ESPN + Sofascore down → API-Football as last resort (incl. scorers).
 *   7. ALL sources down → graceful 200, nothing processed, nothing touched.
 *   8. ?primary=api-football flips the order for one run.
 *   9. /api/me/submission-picks reports server-computed outcomes:
 *      match 1 correct, match 2 wrong, match 3 pending.
 */

const STUB = 'http://localhost:54321'
const APP = 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET || 'test-cron-secret'

let failures = 0
function check(name, cond, extra = '') {
  if (cond) console.log(`  ✓ ${name}`)
  else { failures++; console.error(`  ✗ ${name}${extra ? ` — ${extra}` : ''}`) }
}

async function getState() {
  return (await fetch(`${STUB}/control/state`)).json()
}

async function reset(modes) {
  await fetch(`${STUB}/control/reset`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(modes),
  })
}

async function triggerCron(query = '') {
  const res = await fetch(`${APP}/api/cron/update-results${query}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${CRON_SECRET}` },
  })
  return { status: res.status, body: await res.json() }
}

const stripPoints = subs => subs.map(({ total_points, ...rest }) => rest)

function assertIntegrity(before, after) {
  const pickTables = ['vmt_group_picks', 'vmt_group_table_picks', 'vmt_third_place_picks',
    'vmt_group_scorer_picks', 'vmt_bracket_picks', 'vmt_tournament_scorer_pick']
  for (const t of pickTables) {
    check(`${t} untouched`, JSON.stringify(before.db[t]) === JSON.stringify(after.db[t]))
  }
  check('vmt_submissions: same rows, only total_points changed',
    JSON.stringify(stripPoints(before.db.vmt_submissions)) === JSON.stringify(stripPoints(after.db.vmt_submissions)))
  check('no DELETE issued anywhere', !after.oplog.some(op => op.method === 'DELETE'),
    JSON.stringify(after.oplog.filter(op => op.method === 'DELETE')))
  check('no writes outside vmt_matches/vmt_submissions/vmt_sync_log',
    after.oplog.every(op => ['vmt_matches', 'vmt_submissions', 'vmt_sync_log'].includes(op.table)),
    [...new Set(after.oplog.map(op => op.table))].join(','))
  check('vmt_submissions writes only set total_points',
    after.oplog.filter(op => op.table === 'vmt_submissions')
      .every(op => op.method === 'PATCH' && Object.keys(op.body).join(',') === 'total_points'))
  check('match count still 104', after.db.vmt_matches.length === 104)
}

function assertResultState(state, label) {
  const m1 = state.db.vmt_matches.find(m => m.id === 1)
  const m2 = state.db.vmt_matches.find(m => m.id === 2)
  const m3 = state.db.vmt_matches.find(m => m.id === 3)
  check(`${label}: match 1 finished 2–1 → '1'`,
    m1.status === 'finished' && m1.home_score === 2 && m1.away_score === 1 && m1.result === '1',
    JSON.stringify({ status: m1.status, hs: m1.home_score, as: m1.away_score, r: m1.result }))
  check(`${label}: match 2 finished 1–1 → 'X'`,
    m2.status === 'finished' && m2.home_score === 1 && m2.away_score === 1 && m2.result === 'X')
  check(`${label}: match 3 untouched (scheduled)`, m3.status === 'scheduled' && m3.result === null)
  check(`${label}: match 1 venue preserved`, m1.venue !== null, String(m1.venue))

  const a = state.db.vmt_submissions.find(s => s.id.startsWith('1111'))
  const b = state.db.vmt_submissions.find(s => s.id.startsWith('2222'))
  check(`${label}: TEST Anna has 1 point (1 correct, 1 wrong, 1 pending)`, a.total_points === 1, `got ${a.total_points}`)
  check(`${label}: TEST Bertil has 1 point`, b.total_points === 1, `got ${b.total_points}`)

  const markers = state.db.vmt_sync_log.filter(r => String(r.sync_key).startsWith('points_processed_match_'))
  check(`${label}: matches 1+2 marked processed`,
    markers.length === 2 && markers.some(r => r.sync_key === 'points_processed_match_1') && markers.some(r => r.sync_key === 'points_processed_match_2'),
    JSON.stringify(markers.map(r => r.sync_key)))
  const summary = state.db.vmt_sync_log.find(r => r.sync_key === 'update_results')
  check(`${label}: summary row written`, !!summary, '')
  if (summary) console.log(`    summary: [${summary.status}] ${summary.message}`)
}

async function checkMittTips() {
  // Build the @supabase/ssr session cookie the way the lib expects it:
  // base64url-encoded JSON session under sb-localhost-auth-token.
  const session = {
    access_token: 'stub-access-token-a',
    refresh_token: 'stub-refresh',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id: 'user-aaaaaaaa', aud: 'authenticated', role: 'authenticated', email: 'test-a@example.com' },
  }
  const cookie = `sb-localhost-auth-token=base64-${Buffer.from(JSON.stringify(session)).toString('base64url')}`
  const res = await fetch(`${APP}/api/me/submission-picks`, { headers: { cookie } })
  check('Mitt tips API responds 200 for logged-in test user', res.status === 200, `got ${res.status}`)
  if (res.status !== 200) return
  const data = await res.json()
  const groupA = data.groups?.A?.matches ?? []
  const m1 = groupA.find(m => m.id === 1)
  const m2 = groupA.find(m => m.id === 2)
  const allMatches = Object.values(data.groups ?? {}).flatMap(g => g.matches)
  const m3 = allMatches.find(m => m.id === 3)
  check("Mitt tips: match 1 outcome 'correct' (picked 1, result 1)", m1?.outcome === 'correct', JSON.stringify(m1))
  check("Mitt tips: match 2 outcome 'wrong' (picked 1, result X)", m2?.outcome === 'wrong', JSON.stringify(m2))
  check("Mitt tips: match 3 outcome 'pending' (picked X, not played)", m3?.outcome === 'pending', JSON.stringify(m3))
  const unpicked = allMatches.find(m => m.pick === null)
  check('Mitt tips: unpicked match has no outcome', unpicked?.outcome === null, JSON.stringify(unpicked))
}

console.log('── Scenario 1: default priority = ESPN (scrape), with swapped home/away ──')
await reset({})
const before = await getState()
check('before: all matches scheduled', before.db.vmt_matches.every(m => m.status === 'scheduled'))
check('before: zero points everywhere', before.db.vmt_submissions.every(s => s.total_points === 0))

const run1 = await triggerCron()
check('cron endpoint returns 200', run1.status === 200, JSON.stringify(run1.body))
check("default source is 'scrape' via 'espn'", run1.body.source === 'scrape' && run1.body.scrapeSource === 'espn',
  `${run1.body.source}/${run1.body.scrapeSource}`)
check('2 matches newly processed', run1.body.newlyProcessed?.length === 2, JSON.stringify(run1.body.newlyProcessed))
check('2 submissions recalculated', run1.body.recalculatedSubmissions === 2)

const after1 = await getState()
assertResultState(after1, 'espn-default')
assertIntegrity(before, after1)

console.log('── Scenario 2: second trigger is a no-op ──')
const run2 = await triggerCron()
check('second run returns 200', run2.status === 200)
check("second run skipped: 'no_pending_matches'", run2.body.skipped === 'no_pending_matches', JSON.stringify(run2.body))
const after2 = await getState()
check('second run changed nothing', JSON.stringify(after1.db) === JSON.stringify(after2.db))

console.log('── Scenario 3: Mitt tips indicators (server-side) ──')
await checkMittTips()

console.log('── Scenario 4: ESPN down → Sofascore fallback ──')
await reset({ espnMode: 'fail' })
const run3 = await triggerCron()
check('cron returns 200 despite ESPN failure', run3.status === 200, JSON.stringify(run3.body))
check("scrape source is 'sofascore'", run3.body.source === 'scrape' && run3.body.scrapeSource === 'sofascore',
  `${run3.body.source}/${run3.body.scrapeSource}`)
check('sofascore processed both matches', run3.body.newlyProcessed?.length === 2, JSON.stringify(run3.body))
const after3 = await getState()
assertResultState(after3, 'sofascore')
check('sofascore: noise events filtered (match 3 still scheduled, only 2 markers)',
  after3.db.vmt_sync_log.filter(r => String(r.sync_key).startsWith('points_processed_match_')).length === 2)

console.log('── Scenario 5: ESPN + Sofascore down → API-Football as last resort ──')
await reset({ espnMode: 'fail', sofaMode: 'fail' })
const run4 = await triggerCron()
check('cron returns 200 with only API-Football alive', run4.status === 200, JSON.stringify(run4.body))
check("source is 'api-football'", run4.body.source === 'api-football', run4.body.source)
check('api-football processed both matches', run4.body.newlyProcessed?.length === 2, JSON.stringify(run4.body))
const after4 = await getState()
assertResultState(after4, 'api-football-fallback')
const m1Scorers = after4.db.vmt_matches.find(m => m.id === 1)
check('api-football: goal scorers stored', (m1Scorers.home_goal_scorers ?? []).length === 2, JSON.stringify(m1Scorers.home_goal_scorers))

console.log('── Scenario 6: ALL sources down → graceful degraded response ──')
await reset({ apiFootballMode: 'fail', espnMode: 'fail', sofaMode: 'fail' })
const run5 = await triggerCron()
check('cron still returns 200 with everything down', run5.status === 200, JSON.stringify(run5.body))
check("source is 'none', nothing processed", run5.body.source === 'none' && run5.body.newlyProcessed?.length === 0, JSON.stringify(run5.body))
const after5 = await getState()
check('all-down: matches untouched', after5.db.vmt_matches.every(m => m.status === 'scheduled'))

console.log('── Scenario 7: ?primary=api-football flips the order ──')
await reset({})
const run6 = await triggerCron('?primary=api-football')
check('override run returns 200', run6.status === 200, JSON.stringify(run6.body))
check("override source is 'api-football'", run6.body.source === 'api-football', run6.body.source)
assertResultState(await getState(), 'api-football-primary')

console.log('── Scenario 8: unauthorized callers rejected ──')
const unauth = await fetch(`${APP}/api/cron/update-results`, { method: 'POST' })
check('missing CRON_SECRET → 401', unauth.status === 401, `got ${unauth.status}`)

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)

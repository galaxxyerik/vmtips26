/**
 * Local verification stub for /api/cron/update-results.
 *
 * Emulates, on one port (54321), just enough of:
 *   - Supabase PostgREST (/rest/v1/:table) — the filters/headers supabase-js
 *     actually sends for the code paths under test (eq, lt, in, like, is, or,
 *     order, limit, select projection, upsert via Prefer: resolution=merge-duplicates)
 *   - Supabase Auth   (/auth/v1/user) — returns the seeded test user for the
 *     stub access token so /api/me/submission-picks can authenticate
 *   - API-Football    (/apifootball/...) — finished fixtures for two matches;
 *     can be switched to fail mode to exercise the scrape fallback
 *   - ESPN            (/espn/apis/site/v2/sports/soccer/fifa.world/scoreboard)
 *     — serves the Mexico match with home/away SWAPPED to prove the scraper
 *     re-orients results to our own row
 *   - Sofascore       (/sofascore/api/v1/sport/football/scheduled-events/:date)
 *
 * Every write is recorded in an oplog so the verify driver can prove no user
 * data or picks were touched. Control endpoints:
 *   POST /control/reset  {"apiFootballMode":"ok"|"fail"}  — reseed + set mode
 *   GET  /control/state                                    — full DB + oplog dump
 *
 * Run the app against it with:
 *   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
 *   SUPABASE_SERVICE_ROLE_KEY=stub-service  NEXT_PUBLIC_SUPABASE_ANON_KEY=stub-anon
 *   API_FOOTBALL_BASE_URL=http://localhost:54321/apifootball
 *   ESPN_SCRAPE_BASE_URL=http://localhost:54321/espn
 *   SOFASCORE_SCRAPE_BASE_URL=http://localhost:54321/sofascore
 */
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'

const PORT = Number(process.env.STUB_PORT || 54321)

const fixtureMatches = JSON.parse(
  readFileSync(new URL('./fixtures/vmt-matches-live.json', import.meta.url), 'utf8')
)

const SUB_A = '11111111-1111-4111-8111-111111111111'
const SUB_B = '22222222-2222-4222-8222-222222222222'
const USER_A = 'user-aaaaaaaa'
const ACCESS_TOKEN_A = 'stub-access-token-a'

// Matches 1+2 kicked off June 11 (finished out there in the world), match 3 is
// today but in the future, everything else is spread over later days.
const KICKOFFS = {
  1: '2026-06-11T16:00:00.000Z',
  2: '2026-06-11T19:00:00.000Z',
}
function kickoffFor(m) {
  if (KICKOFFS[m.id]) return KICKOFFS[m.id]
  const day = 13 + Math.floor((m.id - 3) / 4)
  return `2026-06-${String(Math.min(day, 30)).padStart(2, '0')}T18:00:00.000Z`
}

let db = {}
let oplog = []
let apiFootballMode = 'ok'
let espnMode = 'ok'
let sofaMode = 'ok'

function seed() {
  db = {
    vmt_matches: fixtureMatches.map(m => ({
      ...m,
      kickoff: kickoffFor(m),
      venue: m.id === 1 ? 'Estadio Azteca, Mexico City' : null,
      home_score: null,
      away_score: null,
      home_goal_scorers: [],
      away_goal_scorers: [],
      result: null,
      manual_result: null,
      manual_override: false,
      status: 'scheduled',
    })),
    vmt_submissions: [
      { id: SUB_A, user_id: USER_A, name: 'TEST Anna', email: 'test-a@example.com', confirmed: true, total_points: 0, submitted_at: '2026-06-10T10:00:00.000Z' },
      { id: SUB_B, user_id: 'user-bbbbbbbb', name: 'TEST Bertil', email: 'test-b@example.com', confirmed: true, total_points: 0, submitted_at: '2026-06-10T11:00:00.000Z' },
    ],
    vmt_group_picks: [
      { submission_id: SUB_A, match_id: 1, pick: '1' }, // correct (2-1)
      { submission_id: SUB_A, match_id: 2, pick: '1' }, // wrong (1-1)
      { submission_id: SUB_A, match_id: 3, pick: 'X' }, // pending (not played)
      { submission_id: SUB_B, match_id: 1, pick: '2' }, // wrong
      { submission_id: SUB_B, match_id: 2, pick: 'X' }, // correct
    ],
    vmt_group_table_picks: [],
    vmt_third_place_picks: [],
    vmt_group_scorer_picks: [],
    vmt_bracket_picks: [],
    vmt_tournament_scorer_pick: [],
    vmt_sync_log: [],
    vmt_page_content: [],
    vmt_system_config: [
      { key: 'global_lock', value: 'false' },
      { key: 'emergency_mode', value: 'false' },
      { key: 'disable_submissions', value: 'false' },
      { key: 'scoring_frozen', value: 'false' },
    ],
  }
  oplog = []
}
seed()

// ── API-Football payloads ──────────────────────────────────────────────────────
// Match 1: Mexiko–Sydafrika 2–1 → '1'. Match 2: Sydkorea–Tjeckien 1–1 → 'X'.
const API_FOOTBALL_FINISHED = [
  {
    fixture: { id: 9001001, date: KICKOFFS[1], venue: { name: 'Estadio Azteca', city: 'Mexico City' }, status: { short: 'FT', elapsed: 90 } },
    league: { round: 'Group Stage - 1' },
    teams: { home: { name: 'Mexico', winner: true }, away: { name: 'South Africa', winner: false } },
    goals: { home: 2, away: 1 },
    score: { fulltime: { home: 2, away: 1 }, extratime: { home: null, away: null }, penalty: { home: null, away: null } },
    events: [
      { time: { elapsed: 23 }, team: { name: 'Mexico' }, player: { name: 'Raúl Jiménez' }, type: 'Goal', detail: 'Normal Goal' },
      { time: { elapsed: 55 }, team: { name: 'South Africa' }, player: { name: 'Lyle Foster' }, type: 'Goal', detail: 'Normal Goal' },
      { time: { elapsed: 78 }, team: { name: 'Mexico' }, player: { name: 'Santiago Giménez' }, type: 'Goal', detail: 'Normal Goal' },
    ],
  },
  {
    fixture: { id: 9001002, date: KICKOFFS[2], venue: { name: 'Estadio Akron', city: 'Guadalajara' }, status: { short: 'FT', elapsed: 90 } },
    league: { round: 'Group Stage - 1' },
    teams: { home: { name: 'Korea Republic', winner: null }, away: { name: 'Czechia', winner: null } },
    goals: { home: 1, away: 1 },
    score: { fulltime: { home: 1, away: 1 }, extratime: { home: null, away: null }, penalty: { home: null, away: null } },
    events: [
      { time: { elapsed: 12 }, team: { name: 'Korea Republic' }, player: { name: 'Son Heung-min' }, type: 'Goal', detail: 'Normal Goal' },
      { time: { elapsed: 67 }, team: { name: 'Czechia' }, player: { name: 'Patrik Schick' }, type: 'Goal', detail: 'Penalty' },
    ],
  },
]

// Same two results as ESPN would serve them. The Mexico game is deliberately
// listed with home/away SWAPPED (South Africa as "home") — the scraper must
// re-orient it to our seeded row (Mexiko home) and still produce result '1'.
const ESPN_EVENTS_BY_DATE = {
  '20260611': {
    events: [
      {
        id: '8001', date: KICKOFFS[1],
        status: { type: { completed: true, state: 'post' } },
        competitions: [{
          competitors: [
            { homeAway: 'home', winner: false, score: '1', team: { displayName: 'South Africa' } },
            { homeAway: 'away', winner: true, score: '2', team: { displayName: 'Mexico' } },
          ],
        }],
      },
      {
        id: '8002', date: KICKOFFS[2],
        status: { type: { completed: true, state: 'post' } },
        competitions: [{
          competitors: [
            { homeAway: 'home', winner: false, score: '1', team: { displayName: 'South Korea' } },
            { homeAway: 'away', winner: false, score: '1', team: { displayName: 'Czechia' } },
          ],
        }],
      },
      // Unfinished game the same day — must be ignored
      {
        id: '8003', date: '2026-06-11T22:00:00.000Z',
        status: { type: { completed: false, state: 'in' } },
        competitions: [{
          competitors: [
            { homeAway: 'home', score: '0', team: { displayName: 'Canada' } },
            { homeAway: 'away', score: '0', team: { displayName: 'Bosnia and Herzegovina' } },
          ],
        }],
      },
    ],
  },
}

// Same two results as Sofascore would serve them (English/Sofascore team names,
// incl. names that differ from API-Football: South Korea, Czech Republic).
const SOFASCORE_EVENTS_BY_DATE = {
  '2026-06-11': {
    events: [
      {
        id: 7001, tournament: { name: 'World Cup, Group A', uniqueTournament: { id: 16 } },
        roundInfo: { round: 1 }, status: { type: 'finished', code: 100 }, winnerCode: 1,
        homeTeam: { name: 'Mexico' }, awayTeam: { name: 'South Africa' },
        homeScore: { current: 2, normaltime: 2 }, awayScore: { current: 1, normaltime: 1 },
        startTimestamp: Math.floor(Date.parse(KICKOFFS[1]) / 1000),
      },
      {
        id: 7002, tournament: { name: 'World Cup, Group A', uniqueTournament: { id: 16 } },
        roundInfo: { round: 1 }, status: { type: 'finished', code: 100 }, winnerCode: 3,
        homeTeam: { name: 'South Korea' }, awayTeam: { name: 'Czech Republic' },
        homeScore: { current: 1, normaltime: 1 }, awayScore: { current: 1, normaltime: 1 },
        startTimestamp: Math.floor(Date.parse(KICKOFFS[2]) / 1000),
      },
      // Noise that must be filtered out: other tournament + unfinished WC game
      {
        id: 7003, tournament: { name: 'Allsvenskan', uniqueTournament: { id: 40 } },
        status: { type: 'finished' }, winnerCode: 1,
        homeTeam: { name: 'AIK' }, awayTeam: { name: 'Hammarby' },
        homeScore: { current: 3 }, awayScore: { current: 0 }, startTimestamp: 1781200000,
      },
      {
        id: 7004, tournament: { name: 'World Cup, Group B', uniqueTournament: { id: 16 } },
        status: { type: 'inprogress' }, homeTeam: { name: 'Canada' }, awayTeam: { name: 'Bosnia and Herzegovina' },
        homeScore: { current: 0 }, awayScore: { current: 0 }, startTimestamp: 1781400000,
      },
    ],
  },
}

// ── Tiny PostgREST query engine ────────────────────────────────────────────────
function parseValue(raw) {
  if (raw === 'null') return null
  if (raw === 'true') return true
  if (raw === 'false') return false
  return raw
}

function matchesCond(row, col, op, raw) {
  const val = row[col]
  switch (op) {
    case 'eq': {
      const target = parseValue(raw)
      if (target === null) return val === null
      return String(val) === String(target)
    }
    case 'neq': return String(val) !== String(parseValue(raw))
    case 'lt': return val !== null && String(val) < raw
    case 'lte': return val !== null && String(val) <= raw
    case 'gt': return val !== null && String(val) > raw
    case 'gte': return val !== null && String(val) >= raw
    case 'is': return raw === 'null' ? val === null || val === undefined : String(val) === raw
    case 'in': {
      const items = raw.replace(/^\(/, '').replace(/\)$/, '').split(',').map(s => s.trim().replace(/^"|"$/g, ''))
      return items.some(item => String(val) === item)
    }
    case 'like': case 'ilike': {
      const rx = new RegExp('^' + raw.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/[%*]/g, '.*') + '$', op === 'ilike' ? 'i' : '')
      return rx.test(String(val ?? ''))
    }
    default:
      throw new Error(`stub: unsupported operator ${op}`)
  }
}

function applyFilters(rows, params) {
  let out = rows
  for (const [key, rawValue] of params.entries()) {
    if (['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].includes(key)) continue
    if (key === 'or') {
      const conds = rawValue.replace(/^\(/, '').replace(/\)$/, '').split(',')
      out = out.filter(row => conds.some(cond => {
        const [col, op, ...rest] = cond.split('.')
        return matchesCond(row, col, op, rest.join('.'))
      }))
      continue
    }
    const dot = rawValue.indexOf('.')
    const op = rawValue.slice(0, dot)
    const value = rawValue.slice(dot + 1)
    if (op === 'not') {
      const dot2 = value.indexOf('.')
      const innerOp = value.slice(0, dot2)
      const innerVal = value.slice(dot2 + 1)
      out = out.filter(row => !matchesCond(row, key, innerOp, innerVal))
    } else {
      out = out.filter(row => matchesCond(row, key, op, value))
    }
  }
  return out
}

function applyOrderLimit(rows, params) {
  let out = [...rows]
  const order = params.get('order')
  if (order) {
    const specs = order.split(',').map(spec => {
      const [col, dir] = spec.split('.')
      return { col, desc: dir === 'desc' }
    })
    out.sort((a, b) => {
      for (const { col, desc } of specs) {
        const av = a[col], bv = b[col]
        if (av === bv) continue
        const cmp = av === null ? 1 : bv === null ? -1 : av < bv ? -1 : 1
        return desc ? -cmp : cmp
      }
      return 0
    })
  }
  const limit = params.get('limit')
  if (limit) out = out.slice(0, Number(limit))
  return out
}

function project(rows, params) {
  const select = params.get('select')
  if (!select || select === '*') return rows
  const cols = select.split(',').map(s => s.trim()).filter(Boolean)
  return rows.map(row => Object.fromEntries(cols.map(c => [c, row[c]])))
}

function readBody(req) {
  return new Promise(resolve => {
    let raw = ''
    req.on('data', chunk => { raw += chunk })
    req.on('end', () => resolve(raw ? JSON.parse(raw) : null))
  })
}

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(body))
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const params = url.searchParams

  try {
    // ── Control plane ─────────────────────────────────────────────────────────
    if (url.pathname === '/control/reset') {
      const body = await readBody(req)
      seed()
      apiFootballMode = body?.apiFootballMode ?? 'ok'
      espnMode = body?.espnMode ?? 'ok'
      sofaMode = body?.sofaMode ?? 'ok'
      return json(res, 200, { ok: true, apiFootballMode, espnMode, sofaMode })
    }
    if (url.pathname === '/control/state') {
      return json(res, 200, { db, oplog, apiFootballMode, espnMode, sofaMode })
    }

    // ── API-Football stub ─────────────────────────────────────────────────────
    if (url.pathname.startsWith('/apifootball/')) {
      if (apiFootballMode === 'fail') return json(res, 500, { message: 'stub: API-Football down' })
      if (url.pathname === '/apifootball/fixtures') {
        const status = params.get('status') ?? ''
        const response = status.includes('FT') ? API_FOOTBALL_FINISHED : API_FOOTBALL_FINISHED
        return json(res, 200, { errors: [], results: response.length, response })
      }
      if (url.pathname === '/apifootball/fixtures/events') {
        return json(res, 200, { errors: [], response: [] })
      }
      return json(res, 200, { errors: [], response: [] })
    }

    // ── ESPN stub ─────────────────────────────────────────────────────────────
    if (url.pathname === '/espn/apis/site/v2/sports/soccer/fifa.world/scoreboard') {
      if (espnMode === 'fail') return json(res, 403, { error: 'stub: ESPN blocked' })
      return json(res, 200, ESPN_EVENTS_BY_DATE[params.get('dates')] ?? { events: [] })
    }

    // ── Sofascore stub ────────────────────────────────────────────────────────
    const sofaMatch = url.pathname.match(/^\/sofascore\/api\/v1\/sport\/football\/scheduled-events\/(\d{4}-\d{2}-\d{2})$/)
    if (sofaMatch) {
      if (sofaMode === 'fail') return json(res, 403, { error: 'stub: Sofascore blocked' })
      return json(res, 200, SOFASCORE_EVENTS_BY_DATE[sofaMatch[1]] ?? { events: [] })
    }

    // ── Auth stub ─────────────────────────────────────────────────────────────
    if (url.pathname === '/auth/v1/user') {
      const token = (req.headers.authorization ?? '').replace(/^Bearer\s+/i, '')
      if (token === ACCESS_TOKEN_A) {
        return json(res, 200, {
          id: USER_A, aud: 'authenticated', role: 'authenticated', email: 'test-a@example.com',
          email_confirmed_at: '2026-06-01T00:00:00.000Z', app_metadata: { provider: 'email' },
          user_metadata: {}, created_at: '2026-06-01T00:00:00.000Z', updated_at: '2026-06-01T00:00:00.000Z',
        })
      }
      return json(res, 401, { code: 401, msg: 'invalid token' })
    }
    if (url.pathname.startsWith('/auth/')) return json(res, 404, { msg: 'stub: not implemented' })

    // ── PostgREST stub ────────────────────────────────────────────────────────
    const restMatch = url.pathname.match(/^\/rest\/v1\/([a-zA-Z0-9_]+)$/)
    if (restMatch) {
      const table = restMatch[1]
      if (!(table in db)) return json(res, 404, { message: `stub: unknown table ${table}` })
      const rows = db[table]
      const wantsObject = (req.headers.accept ?? '').includes('vnd.pgrst.object')

      if (req.method === 'GET' || req.method === 'HEAD') {
        const result = project(applyOrderLimit(applyFilters(rows, params), params), params)
        if (wantsObject) {
          if (result.length === 1) return json(res, 200, result[0])
          return json(res, 406, { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned', details: `${result.length} rows` })
        }
        return json(res, 200, result)
      }

      if (req.method === 'PATCH') {
        const body = await readBody(req)
        const targets = applyFilters(rows, params)
        for (const row of targets) Object.assign(row, body)
        oplog.push({ method: 'PATCH', table, filters: url.search, body, affected: targets.length })
        res.writeHead(204).end()
        return
      }

      if (req.method === 'POST') {
        const body = await readBody(req)
        const incoming = Array.isArray(body) ? body : [body]
        const prefer = req.headers.prefer ?? ''
        const conflictKey = params.get('on_conflict')
        for (const item of incoming) {
          const existing = conflictKey && prefer.includes('merge-duplicates')
            ? rows.find(r => String(r[conflictKey]) === String(item[conflictKey]))
            : null
          if (existing) Object.assign(existing, item)
          else rows.push({ ...item })
        }
        oplog.push({ method: 'POST', table, filters: url.search, body, prefer })
        res.writeHead(201).end()
        return
      }

      if (req.method === 'DELETE') {
        const targets = applyFilters(rows, params)
        db[table] = rows.filter(r => !targets.includes(r))
        oplog.push({ method: 'DELETE', table, filters: url.search, affected: targets.length })
        res.writeHead(204).end()
        return
      }
    }

    json(res, 404, { message: `stub: no route for ${req.method} ${url.pathname}` })
  } catch (err) {
    console.error('stub error:', err)
    json(res, 500, { message: String(err) })
  }
})

server.listen(PORT, () => console.log(`stub services listening on :${PORT}`))

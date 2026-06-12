import { createServiceClient } from '@/lib/supabase/server'
import { apiFootballFetch, syncLog } from '@/lib/api-football'
import { upsertFixtures, type ApiFixture } from '@/lib/match-sync'
import { recalculateAllScores } from '@/lib/recalculate'
import { scrapeFinishedFixtures } from '@/lib/result-scrape'

const WC2026_LEAGUE_ID = 1
const WC2026_SEASON = 2026

/**
 * Per-match "points distributed" marker. Stored as rows in vmt_sync_log
 * (sync_key is the primary key) instead of a new vmt_matches column so no
 * schema migration is needed on the live database mid-tournament. Scoring is
 * an idempotent full recalculation (lib/recalculate.ts), so the marker exists
 * for bookkeeping/observability — double-counting is impossible by design.
 */
const PROCESSED_KEY_PREFIX = 'points_processed_match_'
const SUMMARY_KEY = 'update_results'

interface ApiFixtureResponse { response?: ApiFixture[] }

interface PendingMatch {
  id: number
  match_number: number | null
  phase: string
  home_team: string
  away_team: string
  kickoff: string
  home_score: number | null
  away_score: number | null
  result: string | null
  manual_result: string | null
  manual_override: boolean | null
  status: string | null
}

function effectiveResult(m: Pick<PendingMatch, 'result' | 'manual_result' | 'manual_override'>) {
  return m.manual_override ? m.manual_result : m.result
}

export interface UpdateResultsSummary {
  ok: boolean
  skipped?: string
  source: 'api-football' | 'scrape' | 'none'
  fixturesFetched: number
  matchesUpdated: number
  recalculatedSubmissions: number
  newlyProcessed: { id: number; match_number: number | null; label: string }[]
  pendingRemaining: number
  warnings: string[]
}

/**
 * Fetch finished WC2026 results and distribute points.
 *
 * 1. Find seeded vmt_matches whose kickoff has passed and that have no
 *    processed marker yet — nothing pending means no API calls at all.
 * 2. Fetch finished fixtures from API-Football; if that fails or returns
 *    nothing, fall back to scraping Sofascore (lib/result-scrape.ts).
 * 3. Update vmt_matches via the existing upsertFixtures() (only the matches
 *    table is ever written — user picks are never touched).
 * 4. Distribute points via the existing engine recalculateAllScores()
 *    (lib/recalculate.ts) — called as-is, not reimplemented.
 * 5. Mark matches that are now finished with a result as processed, but only
 *    if points were actually recalculated (e.g. not when scoring_frozen).
 */
export async function updateResults(now = new Date()): Promise<UpdateResultsSummary> {
  const service = createServiceClient()
  const warnings: string[] = []

  // ── 1. Pending = kicked off, not yet processed ─────────────────────────────
  const { data: pastMatches, error: pastErr } = await service
    .from('vmt_matches')
    .select('id, match_number, phase, home_team, away_team, kickoff, home_score, away_score, result, manual_result, manual_override, status')
    .lt('kickoff', now.toISOString())
    .order('kickoff')

  if (pastErr) throw new Error(`Kunde inte läsa matcher: ${pastErr.message}`)

  const { data: markerRows, error: markerErr } = await service
    .from('vmt_sync_log')
    .select('sync_key')
    .like('sync_key', `${PROCESSED_KEY_PREFIX}%`)

  if (markerErr) throw new Error(`Kunde inte läsa processade markörer: ${markerErr.message}`)

  const processedIds = new Set(
    (markerRows ?? []).map(r => Number.parseInt(String(r.sync_key).slice(PROCESSED_KEY_PREFIX.length), 10))
  )
  const pending = ((pastMatches ?? []) as PendingMatch[]).filter(m => !processedIds.has(m.id))

  if (pending.length === 0) {
    syncLog('update-results: inga obearbetade matcher — hoppar över')
    return {
      ok: true,
      skipped: 'no_pending_matches',
      source: 'none',
      fixturesFetched: 0,
      matchesUpdated: 0,
      recalculatedSubmissions: 0,
      newlyProcessed: [],
      pendingRemaining: 0,
      warnings,
    }
  }

  syncLog(`update-results: ${pending.length} matcher väntar på resultat/poäng`)

  // ── 2. Primary source: API-Football ────────────────────────────────────────
  let fixtures: ApiFixture[] = []
  let source: UpdateResultsSummary['source'] = 'api-football'
  try {
    const json = await apiFootballFetch<ApiFixtureResponse>(
      `/fixtures?league=${WC2026_LEAGUE_ID}&season=${WC2026_SEASON}&status=FT-AET-PEN`
    )
    fixtures = json?.response ?? []
    if (fixtures.length === 0) warnings.push('API-Football returnerade 0 färdiga fixtures')
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    warnings.push(`API-Football misslyckades: ${message}`)
    syncLog(`update-results: API-Football misslyckades: ${message}`)
  }

  // ── 2b. Fallback: scrape Sofascore for the pending matchdays ───────────────
  if (fixtures.length === 0) {
    source = 'scrape'
    const dates = [...new Set(pending.map(m => m.kickoff.slice(0, 10)))]
    try {
      fixtures = await scrapeFinishedFixtures(dates)
      syncLog(`update-results: fallback-scrape gav ${fixtures.length} färdiga matcher`)
      if (fixtures.length === 0) warnings.push('Fallback-scrape returnerade 0 färdiga matcher')
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      warnings.push(`Fallback-scrape misslyckades: ${message}`)
      syncLog(`update-results: fallback-scrape misslyckades: ${message}`)
      source = 'none'
    }
  }

  // ── 3. Write results to vmt_matches (existing single write path) ──────────
  let matchesUpdated = 0
  if (fixtures.length > 0) {
    const { upserted } = await upsertFixtures(fixtures, { includeScorers: source === 'api-football' })
    matchesUpdated = upserted
  }

  // ── 4. Points: the existing engine, untouched ─────────────────────────────
  const recalc = await recalculateAllScores(service)
  if (!recalc.ok) {
    warnings.push(`Poängberäkning hoppades över: ${recalc.reason}`)
    syncLog(`update-results: poängberäkning hoppades över (${recalc.reason})`)
  }

  // ── 5. Mark finished+scored matches as processed ───────────────────────────
  const newlyProcessed: UpdateResultsSummary['newlyProcessed'] = []
  if (recalc.ok) {
    const { data: refreshedRows, error: refreshErr } = await service
      .from('vmt_matches')
      .select('id, match_number, phase, home_team, away_team, home_score, away_score, result, manual_result, manual_override, status')
      .in('id', pending.map(m => m.id))

    if (refreshErr) {
      warnings.push(`Kunde inte läsa tillbaka matcher: ${refreshErr.message}`)
    } else {
      const done = ((refreshedRows ?? []) as PendingMatch[]).filter(
        m => m.status === 'finished' && !!effectiveResult(m)
      )
      if (done.length > 0) {
        const markers = done.map(m => ({
          sync_key: `${PROCESSED_KEY_PREFIX}${m.id}`,
          synced_at: now.toISOString(),
          status: 'processed',
          message: `M${m.match_number ?? m.id} ${m.home_team} ${m.home_score ?? '?'}–${m.away_score ?? '?'} ${m.away_team} → ${effectiveResult(m)}`,
        }))
        const { error: markErr } = await service
          .from('vmt_sync_log')
          .upsert(markers, { onConflict: 'sync_key' })
        if (markErr) {
          warnings.push(`Kunde inte markera matcher som processade: ${markErr.message}`)
        } else {
          for (const m of done) {
            newlyProcessed.push({
              id: m.id,
              match_number: m.match_number,
              label: `${m.home_team} ${m.home_score ?? '?'}–${m.away_score ?? '?'} ${m.away_team}`,
            })
          }
        }
      }
    }
  }

  const pendingRemaining = pending.length - newlyProcessed.length
  const summaryMessage =
    `källa=${source}, ${fixtures.length} fixtures, ${matchesUpdated} matcher uppdaterade, ` +
    `${recalc.ok ? recalc.updated : 0} tips omräknade, ${newlyProcessed.length} matcher processade, ` +
    `${pendingRemaining} kvar${warnings.length ? ` — ${warnings.join('; ')}` : ''}`

  await service.from('vmt_sync_log').upsert({
    sync_key: SUMMARY_KEY,
    synced_at: now.toISOString(),
    status: warnings.length ? 'degraded' : 'ok',
    message: summaryMessage,
  }, { onConflict: 'sync_key' })

  syncLog(`update-results: ${summaryMessage}`)

  return {
    ok: true,
    source,
    fixturesFetched: fixtures.length,
    matchesUpdated,
    recalculatedSubmissions: recalc.ok ? recalc.updated : 0,
    newlyProcessed,
    pendingRemaining,
    warnings,
  }
}

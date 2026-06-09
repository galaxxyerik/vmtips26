/**
 * Diagnostic (READ-ONLY): for every submission, rebuild the R32 bracket from the
 * user's own group table picks + third-place picks (exactly like the app does),
 * then check every saved bracket pick against the fixture it sits on.
 *
 * Usage: npx tsx scripts/diagnose-bracket-picks.ts
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { buildR32Bracket, type Group } from '../lib/bracket-logic'

// Minimal .env.local parser (no dotenv dependency)
const env: Record<string, string> = {}
for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function main() {
  // NB: Supabase caps each query at 1000 rows — fetch everything explicitly
  async function fetchAll<T>(table: string, cols: string): Promise<T[]> {
    const out: T[] = []
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabase.from(table).select(cols).range(from, from + 999)
      if (error) throw error
      out.push(...(data as T[]))
      if (!data || data.length < 1000) return out
    }
  }

  const [subs, tablePicks, thirds, brackets] = await Promise.all([
    fetchAll<{ id: string; name: string; submitted_at: string }>('vmt_submissions', 'id, name, submitted_at'),
    fetchAll<{ submission_id: string; group_label: string; position: number; team: string }>('vmt_group_table_picks', 'submission_id, group_label, position, team'),
    fetchAll<{ submission_id: string; group_label: string; selected: boolean }>('vmt_third_place_picks', 'submission_id, group_label, selected'),
    fetchAll<{ id: number; submission_id: string; match_number: number; pick_team: string }>('vmt_bracket_picks', 'id, submission_id, match_number, pick_team'),
  ])
  subs.sort((a, b) => a.submitted_at.localeCompare(b.submitted_at))

  let totalMismatch = 0
  const summary: string[] = []
  const moves: { sub: string; id: number; from: number; to: number; team: string }[] = []
  const unresolvable: string[] = []

  for (const sub of subs) {
    const winners = {} as Record<Group, string>
    const runners = {} as Record<Group, string>
    const thirdTeams: Partial<Record<Group, string>> = {}
    for (const tp of tablePicks.filter(t => t.submission_id === sub.id)) {
      const g = tp.group_label as Group
      if (tp.position === 1) winners[g] = tp.team
      if (tp.position === 2) runners[g] = tp.team
      if (tp.position === 3) thirdTeams[g] = tp.team
    }
    const advancing = thirds
      .filter(t => t.submission_id === sub.id && t.selected)
      .map(t => t.group_label as Group)

    const r32 = buildR32Bracket(winners, runners, thirdTeams, advancing)
    const picks = new Map<number, string>()
    const rowIds = new Map<number, number>()
    for (const b of brackets.filter(b => b.submission_id === sub.id)) {
      picks.set(b.match_number, b.pick_team)
      rowIds.set(b.match_number, b.id)
    }

    if (!r32) {
      summary.push(`${sub.name}: ANNEX C LOOKUP FAILED (advancing: ${advancing.sort().join(',')})`)
      continue
    }

    // R32 check + where each mismatched pick actually belongs
    const fixture = new Map<number, [string, string]>()
    for (const m of r32) fixture.set(m.matchNumber, [m.team1, m.team2])

    const mismatches: string[] = []
    for (let n = 73; n <= 88; n++) {
      const pick = picks.get(n)
      if (!pick) { mismatches.push(`M${n}: NO PICK`); continue }
      const [t1, t2] = fixture.get(n)!
      if (pick !== t1 && pick !== t2) {
        const belongs = r32.filter(m => m.team1 === pick || m.team2 === pick).map(m => m.matchNumber)
        mismatches.push(`M${n}: pick="${pick}" not in [${t1} | ${t2}] (team appears in: ${belongs.map(b => 'M' + b).join(',') || 'NOWHERE'})`)
        if (belongs.length === 1) {
          moves.push({ sub: sub.name, id: rowIds.get(n)!, from: n, to: belongs[0], team: pick })
        } else {
          unresolvable.push(`${sub.name} M${n} "${pick}" -> ${belongs.length} candidates`)
        }
      }
    }

    // KO rounds: each match's allowed teams = picks of its two feeder matches
    const feeders: Record<number, [number, number]> = {
      89: [73, 74], 90: [75, 76], 91: [77, 78], 92: [79, 80],
      93: [81, 82], 94: [83, 84], 95: [85, 86], 96: [87, 88],
      97: [89, 90], 98: [91, 92], 99: [93, 94], 100: [95, 96],
      101: [97, 98], 102: [99, 100], 103: [101, 102], 104: [101, 102],
    }
    const hasKo = [...picks.keys()].some(k => k >= 89)
    if (hasKo) {
      for (let n = 89; n <= 104; n++) {
        const pick = picks.get(n)
        if (!pick) { mismatches.push(`M${n}: NO PICK`); continue }
        const [f1, f2] = feeders[n]
        const allowed = n === 103
          ? [picks.get(101), picks.get(102), picks.get(97), picks.get(98), picks.get(99), picks.get(100)] // losers — can't know, allow finalists' feeders
          : [picks.get(f1), picks.get(f2)]
        if (n !== 103 && !allowed.includes(pick)) {
          mismatches.push(`M${n}: pick="${pick}" not among feeder picks [${allowed.join(' | ')}]`)
        }
      }
    }

    const koNote = hasKo ? '' : ' [KO PICKS MISSING — incident user]'
    if (mismatches.length > 0) {
      totalMismatch += mismatches.length
      summary.push(`\n=== ${sub.name} (${sub.submitted_at})${koNote}\n  ${mismatches.join('\n  ')}`)
    } else {
      summary.push(`OK: ${sub.name} (${sub.submitted_at})${koNote}`)
    }
  }

  console.log(summary.join('\n'))
  console.log(`\nTotal mismatch lines: ${totalMismatch}`)

  if (unresolvable.length > 0) {
    console.log('\nUNRESOLVABLE (manual review needed):\n  ' + unresolvable.join('\n  '))
  }

  if (moves.length > 0 && process.argv.includes('--emit-sql')) {
    // Sanity: within each submission the moves must form a bijection
    const bySub = new Map<string, typeof moves>()
    for (const m of moves) {
      if (!bySub.has(m.sub)) bySub.set(m.sub, [])
      bySub.get(m.sub)!.push(m)
    }
    for (const [sub, ms] of bySub) {
      const froms = new Set(ms.map(m => m.from))
      const tos = new Set(ms.map(m => m.to))
      if (froms.size !== ms.length || tos.size !== ms.length ||
          [...tos].some(t => !froms.has(t))) {
        throw new Error(`NOT a clean permutation for ${sub} — aborting SQL emit`)
      }
    }
    console.log(`\n-- ${moves.length} row moves across ${bySub.size} submissions (pure id-based permutation)`)
    console.log('-- Step 1: park affected rows out of the way (unique constraint)')
    console.log(`UPDATE vmt_bracket_picks SET match_number = match_number + 1000 WHERE id IN (${moves.map(m => m.id).join(',')});`)
    console.log('-- Step 2: place each row on its correct fixture')
    console.log('UPDATE vmt_bracket_picks p SET match_number = v.new_number FROM (VALUES')
    console.log(moves.map(m => `  (${m.id}, ${m.to})`).join(',\n'))
    console.log(') AS v(id, new_number) WHERE p.id = v.id;')
  }
}

main().catch(e => { console.error(e); process.exit(1) })

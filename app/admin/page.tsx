import { createClient, createServiceClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SetupAdminButton from './SetupAdminButton'
import TestEmailButton from './TestEmailButton'
import { AdminSubmissionRow } from './AdminSubmissionRow'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'eeengstrand@gmail.com'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/')

  const service = createServiceClient()

  const [
    { data: submissions },
    { data: scorerPicks },
    { data: finalPicks },
  ] = await Promise.all([
    service
      .from('vmt_submissions')
      .select('id, name, email, submitted_at, confirmed, total_points')
      .order('total_points', { ascending: false }),
    service
      .from('vmt_tournament_scorer_pick')
      .select('submission_id, player_name'),
    service
      .from('vmt_bracket_picks')
      .select('submission_id, pick_team')
      .eq('match_number', 104),
  ])

  const scorerMap = Object.fromEntries((scorerPicks ?? []).map(p => [p.submission_id, p.player_name]))
  const championMap = Object.fromEntries((finalPicks ?? []).map(p => [p.submission_id, p.pick_team]))

  const total = submissions?.length ?? 0
  const confirmedCount = submissions?.filter(s => s.confirmed).length ?? 0
  const pot = confirmedCount * 100
  const maxPoints = Math.max(...(submissions?.map(s => s.total_points ?? 0) ?? [0]), 1)

  // Aggregated stats (confirmed only)
  const scorerCounts: Record<string, number> = {}
  for (const p of (scorerPicks ?? [])) {
    const sub = submissions?.find(s => s.id === p.submission_id)
    if (sub?.confirmed) scorerCounts[p.player_name] = (scorerCounts[p.player_name] ?? 0) + 1
  }
  const topScorers = Object.entries(scorerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const championCounts: Record<string, number> = {}
  for (const p of (finalPicks ?? [])) {
    const sub = submissions?.find(s => s.id === p.submission_id)
    if (sub?.confirmed) championCounts[p.pick_team] = (championCounts[p.pick_team] ?? 0) + 1
  }
  const topChampions = Object.entries(championCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const confirmed = (submissions ?? []).filter(s => s.confirmed)
  const unconfirmed = (submissions ?? []).filter(s => !s.confirmed)

  return (
    <div className="min-h-screen bg-navy-950">
      <NavBar userName={user.email} />

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">

        {/* Header */}
        <div>
          <div className="label mb-1">Admin</div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wide text-white">Adminpanel</h1>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 border border-white/10">
          {[
            { label: 'Inskickade', value: total },
            { label: 'Bekräftade', value: confirmedCount },
            { label: 'Väntar', value: total - confirmedCount },
            { label: 'Pott', value: `${pot} kr` },
          ].map(({ label, value }) => (
            <div key={label} className="px-5 py-4 border-r border-white/10 last:border-0">
              <div className="label mb-1">{label}</div>
              <div className="font-display font-black text-2xl text-swe-yellow">{value}</div>
            </div>
          ))}
        </div>

        {/* ── Leaderboard ── */}
        <div className="border border-white/10">
          <div className="px-4 py-3 border-b border-white/10 bg-navy-900 flex items-center justify-between">
            <div className="label">Poängtabell</div>
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Bekräftade · sorterat efter poäng</span>
          </div>

          {confirmed.length === 0 ? (
            <div className="px-4 py-8 text-center text-white/25 text-sm">Inga bekräftade deltagare ännu.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {confirmed.map((sub, i) => {
                const pts = sub.total_points ?? 0
                const pct = maxPoints > 0 ? (pts / maxPoints) * 100 : 0
                return (
                  <div key={sub.id} className={`flex items-center gap-3 px-4 py-3 ${i === 0 ? 'bg-swe-yellow/5' : 'hover:bg-navy-900/20'} transition-colors`}>
                    <div className={`w-7 h-7 flex-shrink-0 flex items-center justify-center border font-display font-black text-xs ${
                      i === 0 ? 'border-swe-yellow text-swe-yellow' :
                      i === 1 ? 'border-white/30 text-white/55' :
                      i === 2 ? 'border-white/20 text-white/40' :
                      'border-white/10 text-white/25'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-black uppercase tracking-wide text-white text-sm">{sub.name}</div>
                      <div className="mt-1 h-0.5 bg-white/10">
                        <div className={`h-full ${i === 0 ? 'bg-swe-yellow' : 'bg-white/25'} transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {scorerMap[sub.id] && <div className="text-[10px] text-pitch-400">⚽ {scorerMap[sub.id]}</div>}
                      {championMap[sub.id] && <div className="text-[10px] text-swe-yellow/70">🏆 {championMap[sub.id]}</div>}
                    </div>
                    <div className="text-right flex-shrink-0 w-10">
                      <div className={`font-display font-black text-xl tnum ${i === 0 ? 'text-swe-yellow' : 'text-white/55'}`}>{pts}</div>
                      <div className="text-[9px] text-white/20 uppercase">p</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Aggregated picks ── */}
        {(topScorers.length > 0 || topChampions.length > 0) && (
          <div className="grid grid-cols-2 gap-4">
            {topScorers.length > 0 && (
              <div className="border border-white/10">
                <div className="px-4 py-3 border-b border-white/10 bg-navy-900">
                  <div className="label">Skyttekungsförslag</div>
                </div>
                <div className="divide-y divide-white/5">
                  {topScorers.map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between px-4 py-2">
                      <span className="text-sm text-white/80">{name}</span>
                      <span className="font-display font-black text-swe-yellow text-sm tnum">{count}×</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {topChampions.length > 0 && (
              <div className="border border-white/10">
                <div className="px-4 py-3 border-b border-white/10 bg-navy-900">
                  <div className="label">VM-vinnare-förslag</div>
                </div>
                <div className="divide-y divide-white/5">
                  {topChampions.map(([team, count]) => (
                    <div key={team} className="flex items-center justify-between px-4 py-2">
                      <span className="text-sm text-white/80">{team}</span>
                      <span className="font-display font-black text-swe-yellow text-sm tnum">{count}×</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── All submissions — expandable rows ── */}
        <div className="border border-white/10">
          <div className="px-4 py-3 border-b border-white/10 bg-navy-900 flex items-center justify-between">
            <div className="label">Alla tips</div>
            <span className="text-[10px] text-white/25">Klicka på en rad för att se fullständiga tips</span>
          </div>

          {/* Column headers */}
          <div className="hidden md:grid grid-cols-[20px_28px_1fr_auto_auto_auto] gap-3 items-center px-4 h-8 border-b border-white/5 bg-navy-900/40">
            <span />
            <span className="label text-[9px]">#</span>
            <span className="label text-[9px]">Deltagare</span>
            <span className="label text-[9px] text-right">Scorer / Vinnare</span>
            <span className="label text-[9px] text-right">Poäng</span>
            <span className="label text-[9px] text-right">Åtgärder</span>
          </div>

          {total === 0 ? (
            <div className="px-4 py-12 text-center text-white/30 text-sm">Inga tips inskickade ännu.</div>
          ) : (
            <div>
              {/* Confirmed participants first, then unconfirmed */}
              {[...confirmed, ...unconfirmed].map(sub => {
                const rank = confirmed.indexOf(sub)
                return (
                  <AdminSubmissionRow
                    key={sub.id}
                    id={sub.id}
                    name={sub.name}
                    email={sub.email}
                    submitted_at={sub.submitted_at}
                    confirmed={sub.confirmed}
                    total_points={sub.total_points}
                    scorer={scorerMap[sub.id] ?? null}
                    champion={championMap[sub.id] ?? null}
                    rank={sub.confirmed && rank >= 0 ? rank + 1 : null}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* ── Admin utilities ── */}
        <div className="border border-white/10">
          <div className="px-4 py-3 border-b border-white/10 bg-navy-900">
            <div className="label">Verktyg</div>
          </div>
          <div className="px-4 py-4 space-y-6">
            <div>
              <div className="text-xs text-white/50 mb-2">Återskapa/återställ adminlösenordet i Supabase Auth.</div>
              <SetupAdminButton />
            </div>
            <div>
              <div className="text-xs text-white/50 mb-2">Skicka ett enkelt testmail via Resend till adminadressen.</div>
              <TestEmailButton />
            </div>
            <div>
              <div className="text-xs text-white/50 mb-2">Öppna en fast preview av admin-vyns slutspel med komplett testdata.</div>
              <Link
                href="/admin/bracket-preview"
                className="inline-flex h-9 items-center border border-white/15 px-4 text-sm font-display font-black text-white/70 transition-colors hover:border-white/30 hover:text-white"
              >
                Öppna bracket-preview
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

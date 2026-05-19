import { createClient, createServiceClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import { redirect } from 'next/navigation'
import { ToggleConfirmButton, DeleteButton } from './AdminActions'
import SetupAdminButton from './SetupAdminButton'

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
    { data: keyBracketPicks },
    { data: groupScorers },
  ] = await Promise.all([
    service
      .from('vmt_submissions')
      .select('id, name, email, submitted_at, confirmed, total_points')
      .order('total_points', { ascending: false }),
    service
      .from('vmt_tournament_scorer_pick')
      .select('submission_id, player_name'),
    // Fetch SF + final bracket picks for rich display
    service
      .from('vmt_bracket_picks')
      .select('submission_id, match_number, pick_team, round')
      .in('round', ['sf', 'bronze', 'final']),
    service
      .from('vmt_group_scorer_picks')
      .select('submission_id, group_label, player_name')
      .order('group_label'),
  ])

  // Build lookup maps
  const scorerMap = Object.fromEntries((scorerPicks ?? []).map(p => [p.submission_id, p.player_name]))

  // Bracket picks: finalist picks (matches 101 & 102 = SF winners → finalists), 103 = bronze, 104 = champion
  const bracketMap: Record<string, { finalist1?: string; finalist2?: string; bronze?: string; champion?: string }> = {}
  for (const p of keyBracketPicks ?? []) {
    if (!bracketMap[p.submission_id]) bracketMap[p.submission_id] = {}
    if (p.match_number === 101) bracketMap[p.submission_id].finalist1 = p.pick_team
    if (p.match_number === 102) bracketMap[p.submission_id].finalist2 = p.pick_team
    if (p.match_number === 103) bracketMap[p.submission_id].bronze = p.pick_team
    if (p.match_number === 104) bracketMap[p.submission_id].champion = p.pick_team
  }

  // Group scorers per submission → group by submission_id
  const groupScorerMap: Record<string, { group_label: string; player_name: string }[]> = {}
  for (const g of (groupScorers ?? [])) {
    if (!groupScorerMap[g.submission_id]) groupScorerMap[g.submission_id] = []
    groupScorerMap[g.submission_id].push(g)
  }

  const total = submissions?.length ?? 0
  const confirmedCount = submissions?.filter(s => s.confirmed).length ?? 0
  const pot = confirmedCount * 100
  const maxPoints = Math.max(...(submissions?.map(s => s.total_points ?? 0) ?? [0]), 1)

  // Aggregate scorer and champion stats (confirmed only)
  const scorerCounts: Record<string, number> = {}
  for (const p of (scorerPicks ?? [])) {
    const sub = submissions?.find(s => s.id === p.submission_id)
    if (sub?.confirmed) scorerCounts[p.player_name] = (scorerCounts[p.player_name] ?? 0) + 1
  }
  const topScorers = Object.entries(scorerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const championCounts: Record<string, number> = {}
  for (const p of (keyBracketPicks ?? []).filter(p => p.match_number === 104)) {
    const sub = submissions?.find(s => s.id === p.submission_id)
    if (sub?.confirmed) championCounts[p.pick_team] = (championCounts[p.pick_team] ?? 0) + 1
  }
  const topChampions = Object.entries(championCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Ranked list (confirmed first, then unconfirmed, within each group sorted by points)
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
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Sorterat efter poäng</span>
          </div>

          {confirmed.length === 0 ? (
            <div className="px-4 py-8 text-center text-white/25 text-sm">
              Inga bekräftade deltagare ännu.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {confirmed.map((sub, i) => {
                const pts = sub.total_points ?? 0
                const bracket = bracketMap[sub.id] ?? {}
                const scorer = scorerMap[sub.id]
                const pct = maxPoints > 0 ? (pts / maxPoints) * 100 : 0
                return (
                  <div key={sub.id} className={`flex items-center gap-3 px-4 py-3 ${i === 0 ? 'bg-swe-yellow/5' : 'hover:bg-navy-900/30'} transition-colors`}>
                    {/* Rank */}
                    <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center border font-display font-black text-sm ${
                      i === 0 ? 'border-swe-yellow text-swe-yellow bg-swe-yellow/10' :
                      i === 1 ? 'border-white/30 text-white/60' :
                      i === 2 ? 'border-white/20 text-white/40' :
                      'border-white/10 text-white/25'
                    }`}>
                      {i + 1}
                    </div>

                    {/* Name + key picks */}
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-black uppercase tracking-wide text-white text-sm leading-tight">{sub.name}</div>
                      <div className="text-[10px] text-white/30 mt-0.5 truncate">{sub.email}</div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {bracket.champion && (
                          <span className="text-[9px] font-display font-black uppercase border border-swe-yellow/30 text-swe-yellow/80 px-1.5 py-0.5">
                            🏆 {bracket.champion}
                          </span>
                        )}
                        {scorer && (
                          <span className="text-[9px] font-display font-black uppercase border border-pitch-500/30 text-pitch-400 px-1.5 py-0.5">
                            ⚽ {scorer}
                          </span>
                        )}
                        {bracket.finalist1 && bracket.finalist2 && (
                          <span className="text-[9px] text-white/30 px-1 py-0.5">
                            Final: {bracket.finalist1} vs {bracket.finalist2}
                          </span>
                        )}
                      </div>
                      {/* Points bar */}
                      <div className="mt-2 h-0.5 bg-white/10 overflow-hidden">
                        <div
                          className={`h-full transition-all ${i === 0 ? 'bg-swe-yellow' : 'bg-white/30'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right flex-shrink-0">
                      <div className={`font-display font-black text-2xl tnum ${i === 0 ? 'text-swe-yellow' : 'text-white/70'}`}>
                        {pts}
                      </div>
                      <div className="text-[9px] text-white/25 uppercase tracking-wider">poäng</div>
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
                  <div className="label">Toppskytteförslag</div>
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

        {/* ── Full submissions table ── */}
        <div className="border border-white/10">
          <div className="px-4 py-3 border-b border-white/10 bg-navy-900 flex items-center justify-between">
            <div className="label">Alla tips · hantering</div>
            <span className="text-[10px] text-white/25">Bekräftade visas först</span>
          </div>

          {total === 0 ? (
            <div className="px-4 py-12 text-center text-white/30 text-sm">Inga tips inskickade ännu.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {/* Confirmed first, then unconfirmed */}
              {[...confirmed, ...unconfirmed].map((sub, i) => {
                const bracket = bracketMap[sub.id] ?? {}
                const scorer = scorerMap[sub.id]
                const groupScoreList = groupScorerMap[sub.id] ?? []
                const rank = confirmed.indexOf(sub)

                return (
                  <div key={sub.id} className={`${!sub.confirmed ? 'opacity-55' : ''}`}>
                    {/* Main row */}
                    <div className="grid grid-cols-[auto_2fr_2fr_auto_auto_auto] gap-3 px-4 py-3 items-center">
                      {/* Rank / status badge */}
                      <div className={`w-7 h-7 flex-shrink-0 flex items-center justify-center border text-xs font-display font-black ${
                        sub.confirmed && rank >= 0
                          ? rank === 0 ? 'border-swe-yellow/60 text-swe-yellow'
                          : 'border-white/20 text-white/40'
                          : 'border-white/10 text-white/20'
                      }`}>
                        {sub.confirmed && rank >= 0 ? rank + 1 : '—'}
                      </div>

                      {/* Name + submitted */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-bold uppercase tracking-wide text-[13px] text-white">{sub.name}</span>
                          {sub.confirmed
                            ? <span className="text-[9px] font-display font-black uppercase border border-pitch-500/30 text-pitch-400 px-1 py-0.5">Bekräftad</span>
                            : <span className="text-[9px] font-display font-black uppercase border border-swe-yellow/30 text-swe-yellow/70 px-1 py-0.5">Väntar</span>
                          }
                        </div>
                        <div className="text-[10px] text-white/25 mt-0.5 tnum">
                          {sub.submitted_at
                            ? new Date(sub.submitted_at).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </div>
                      </div>

                      {/* Email */}
                      <span className="text-xs text-white/40 truncate">{sub.email}</span>

                      {/* Tournament scorer + champion pick */}
                      <div className="text-right space-y-0.5">
                        {scorer && (
                          <div className="text-xs text-pitch-400 whitespace-nowrap font-medium">⚽ {scorer}</div>
                        )}
                        {bracket.champion && (
                          <div className="text-xs text-swe-yellow/80 whitespace-nowrap">🏆 {bracket.champion}</div>
                        )}
                        {!scorer && !bracket.champion && <span className="text-white/15 text-xs">—</span>}
                      </div>

                      {/* Points */}
                      <div className="text-right flex-shrink-0">
                        <div className="font-display font-black tnum text-swe-yellow text-xl">{sub.total_points ?? 0}</div>
                        <div className="text-[9px] text-white/20 uppercase tracking-wider">p</div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2">
                        <ToggleConfirmButton submissionId={sub.id} confirmed={sub.confirmed} />
                        <DeleteButton submissionId={sub.id} name={sub.name} />
                      </div>
                    </div>

                    {/* Picks detail strip */}
                    <div className="px-4 pb-3 ml-10">
                      <div className="border border-white/5 bg-navy-900/40 divide-y divide-white/5">
                        {/* Bracket picks: final info */}
                        {(bracket.finalist1 || bracket.finalist2 || bracket.champion || bracket.bronze) && (
                          <div className="px-3 py-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/40">
                            <span className="label text-[9px] self-center mr-1">Slutspel</span>
                            {bracket.finalist1 && <span>SF1-vinnare: <span className="text-white/65">{bracket.finalist1}</span></span>}
                            {bracket.finalist2 && <span>SF2-vinnare: <span className="text-white/65">{bracket.finalist2}</span></span>}
                            {bracket.bronze && <span>Bronsmatch: <span className="text-white/65">{bracket.bronze}</span></span>}
                            {bracket.champion && <span className="font-display font-black text-swe-yellow/80">VM-vinnare: {bracket.champion}</span>}
                          </div>
                        )}

                        {/* Group scorers */}
                        {groupScoreList.length > 0 && (
                          <div className="px-3 py-2">
                            <span className="label text-[9px] block mb-1.5">Gruppskytte</span>
                            <div className="flex flex-wrap gap-2">
                              {groupScoreList.map(g => (
                                <span key={g.group_label} className="text-[10px] text-white/50">
                                  <span className="text-white/25">Gr.{g.group_label}:</span> {g.player_name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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
              <div className="text-xs text-white/50 mb-2">
                Återskapa/återställ adminlösenordet i Supabase Auth.
              </div>
              <SetupAdminButton />
            </div>

            <div>
              <div className="label mb-2">Skapa innehållstabell (kör en gång i Supabase SQL-editor)</div>
              <pre className="bg-navy-950 border border-white/10 text-[11px] text-white/60 p-3 overflow-x-auto leading-relaxed font-mono select-all">{`create table if not exists vmt_page_content (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);
alter table vmt_page_content enable row level security;
create policy "Public read" on vmt_page_content
  for select using (true);`}</pre>
              <div className="text-[11px] text-white/30 mt-1">
                När tabellen finns kan du trycka på &ldquo;✎ Redigera sida&rdquo;-knappen (nere till höger) för att redigera text och bilder direkt på sidan.
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

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
    { data: bracketPicks },
    { data: groupScorers },
  ] = await Promise.all([
    service
      .from('vmt_submissions')
      .select('id, name, email, submitted_at, confirmed, total_points')
      .order('submitted_at', { ascending: false }),
    service
      .from('vmt_tournament_scorer_pick')
      .select('submission_id, player_name'),
    service
      .from('vmt_bracket_picks')
      .select('submission_id, pick_team')
      .eq('match_number', 104),
    service
      .from('vmt_group_scorer_picks')
      .select('submission_id, player_name'),
  ])

  const scorerMap = Object.fromEntries((scorerPicks ?? []).map(p => [p.submission_id, p]))
  const championMap = Object.fromEntries((bracketPicks ?? []).map(p => [p.submission_id, p]))
  const groupScorerMap: Record<string, { player_name: string }[]> = {}
  for (const g of (groupScorers ?? [])) {
    if (!groupScorerMap[g.submission_id]) groupScorerMap[g.submission_id] = []
    groupScorerMap[g.submission_id].push(g)
  }

  const total = submissions?.length ?? 0
  const confirmedCount = submissions?.filter(s => s.confirmed).length ?? 0
  const pot = confirmedCount * 100

  // Aggregate top scorer guesses across all confirmed submissions
  const scorerCounts: Record<string, number> = {}
  for (const p of (scorerPicks ?? [])) {
    const sub = submissions?.find(s => s.id === p.submission_id)
    if (sub?.confirmed) {
      const key = p.player_name
      scorerCounts[key] = (scorerCounts[key] ?? 0) + 1
    }
  }
  const topScorers = Object.entries(scorerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const championCounts: Record<string, number> = {}
  for (const p of (bracketPicks ?? [])) {
    const sub = submissions?.find(s => s.id === p.submission_id)
    if (sub?.confirmed) {
      championCounts[p.pick_team] = (championCounts[p.pick_team] ?? 0) + 1
    }
  }
  const topChampions = Object.entries(championCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-navy-950">
      <NavBar userName={user.email} />

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">

        {/* Header + summary */}
        <div>
          <div className="label mb-1">Admin</div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wide text-white">Adminpanel</h1>
        </div>

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

        {/* Aggregated picks */}
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
                      <span className="font-display font-black text-swe-yellow text-sm">{count}×</span>
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
                      <span className="font-display font-black text-swe-yellow text-sm">{count}×</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submissions list */}
        <div className="border border-white/10">
          <div className="grid grid-cols-[2fr_2fr_auto_auto_auto_auto] gap-3 px-4 h-9 items-center bg-navy-900 border-b border-white/10">
            <div className="label">Namn</div>
            <div className="label">E-post</div>
            <div className="label">Skyttekung</div>
            <div className="label">VM-vinnare</div>
            <div className="label">Poäng</div>
            <div className="label text-right">Åtgärder</div>
          </div>

          {total === 0 ? (
            <div className="px-4 py-12 text-center text-white/30 text-sm">
              Inga tips inskickade ännu.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {(submissions ?? []).map(sub => {
                const scorer = scorerMap[sub.id]
                const champion = championMap[sub.id]
                return (
                  <div key={sub.id} className={`grid grid-cols-[2fr_2fr_auto_auto_auto_auto] gap-3 px-4 py-3 items-center ${
                    sub.confirmed ? '' : 'opacity-60'
                  }`}>
                    <div>
                      <span className="font-display font-bold uppercase tracking-wide text-[13px] text-white">
                        {sub.name}
                      </span>
                      {sub.confirmed && (
                        <span className="ml-2 text-[10px] text-pitch-400">✓</span>
                      )}
                      <div className="text-[10px] text-white/30 mt-0.5">
                        {sub.submitted_at
                          ? new Date(sub.submitted_at).toLocaleDateString('sv-SE', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                            })
                          : '—'}
                      </div>
                    </div>
                    <span className="text-sm text-white/45 truncate">{sub.email}</span>
                    <span className="text-xs text-white/60 whitespace-nowrap">
                      {scorer ? `${scorer.player_name}` : <span className="text-white/20">—</span>}
                    </span>
                    <span className="text-xs text-white/60 whitespace-nowrap">
                      {champion ? champion.pick_team : <span className="text-white/20">—</span>}
                    </span>
                    <span className="font-display font-black tnum text-swe-yellow text-lg">
                      {sub.total_points ?? 0}
                    </span>
                    <div className="flex items-center justify-end gap-2">
                      <ToggleConfirmButton submissionId={sub.id} confirmed={sub.confirmed} />
                      <DeleteButton submissionId={sub.id} name={sub.name} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Admin utilities */}
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

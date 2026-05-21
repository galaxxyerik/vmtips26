import { createClient, createServiceClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import LiveMatches from './LiveMatches'

export const dynamic = 'force-dynamic'

const OPENS_AT = new Date('2026-06-11T19:00:00Z')

const SWEDEN_MATCHES = [
  {
    date: '15 JUNI',
    time: '04:00',
    opponent: 'Tunisien',
    flag: '/images/flag-tn.svg',
    venue: 'Estadio BBVA',
    city: 'Monterrey',
    tv: 'SVT',
    kickoffUtc: new Date('2026-06-15T02:00:00Z'),
  },
  {
    date: '20 JUNI',
    time: '19:00',
    opponent: 'Nederländerna',
    flag: '/images/flag-nl.svg',
    venue: 'NRG Stadium',
    city: 'Houston',
    tv: 'TV4',
    kickoffUtc: new Date('2026-06-20T17:00:00Z'),
  },
  {
    date: '26 JUNI',
    time: '01:00',
    opponent: 'Japan',
    flag: '/images/flag-jp.svg',
    venue: 'AT&T Stadium',
    city: 'Dallas',
    tv: 'SVT',
    kickoffUtc: new Date('2026-06-25T23:00:00Z'),
  },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const service = createServiceClient()
  const now = new Date()
  const isOpen = now >= OPENS_AT

  const { data: allParticipants } = await service
    .from('vmt_submissions')
    .select('id, name, confirmed, user_id')
    .order('confirmed', { ascending: false })
    .order('submitted_at', { ascending: true })

  const confirmedCount = allParticipants?.filter(p => p.confirmed).length ?? 0
  const totalCount = allParticipants?.length ?? 0
  const pot = confirmedCount * 100
  const daysLeft = Math.max(0, Math.floor((OPENS_AT.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  const daysUntilSweden = Math.max(0, Math.floor((SWEDEN_MATCHES[0].kickoffUtc.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  const nextMatch = SWEDEN_MATCHES.find(m => now < new Date(m.kickoffUtc.getTime() + 2 * 60 * 60 * 1000)) ?? SWEDEN_MATCHES[SWEDEN_MATCHES.length - 1]

  let mySubmission: { id: string; name: string; total_points: number; confirmed: boolean } | null = null
  if (user) {
    const { data: mine } = await supabase
      .from('vmt_submissions')
      .select('id, name, total_points, confirmed')
      .eq('user_id', user.id)
      .maybeSingle()
    mySubmission = mine
  }

  let myTournamentScorer: string | null = null
  let myChampion: string | null = null
  let myGroupFWinner: string | null = null

  if (mySubmission) {
    const [{ data: scorer }, { data: finalPick }, { data: groupFPick }] = await Promise.all([
      service
        .from('vmt_tournament_scorer_pick')
        .select('player_name')
        .eq('submission_id', mySubmission.id)
        .maybeSingle(),
      service
        .from('vmt_bracket_picks')
        .select('pick_team')
        .eq('submission_id', mySubmission.id)
        .eq('round', 'final')
        .maybeSingle(),
      service
        .from('vmt_group_table_picks')
        .select('team')
        .eq('submission_id', mySubmission.id)
        .eq('group_label', 'F')
        .eq('position', 1)
        .maybeSingle(),
    ])
    myTournamentScorer = scorer?.player_name ?? null
    myChampion = finalPick?.pick_team ?? null
    myGroupFWinner = groupFPick?.team ?? null
  }

  let submissions: { id: string; name: string; total_points: number; confirmed: boolean; user_id: string | null }[] = []
  if (isOpen) {
    const { data } = await supabase
      .from('vmt_submissions')
      .select('id, name, total_points, confirmed, user_id')
      .eq('confirmed', true)
      .order('total_points', { ascending: false })
    submissions = data ?? []
  }
  const ranked = submissions.map((s, i) => ({ ...s, rank: i + 1 }))

  const { data: liveCandidateMatches } = await service
    .from('vmt_matches')
    .select('id, match_number, home_team, away_team, kickoff, home_score, away_score, home_goal_scorers, away_goal_scorers, status')
    .gte('kickoff', new Date(now.getTime() - 130 * 60 * 1000).toISOString())
    .lte('kickoff', new Date(now.getTime() + 5 * 60 * 1000).toISOString())
    .order('kickoff')

  const { data: myGroupPicks } = mySubmission
    ? await service.from('vmt_group_picks').select('match_id, pick').eq('submission_id', mySubmission.id)
    : { data: [] }
  const userPicks = Object.fromEntries((myGroupPicks ?? []).map(row => [row.match_id, row.pick]))

  return (
    <div className="min-h-screen bg-navy-950">
      <NavBar userName={user?.email ?? null} />

      {!isOpen && (
        <div className="relative overflow-hidden" style={{ minHeight: '60vh' }}>
          <Image
            src="/images/sweden-poland-wc-qual-1.jpg"
            alt="Sverige firar VM-kvalet mot Polen"
            fill
            sizes="100vw"
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-16 pb-12 lg:pb-16">
            <div className="label text-swe-yellow/60 mb-3">VM-TIPS 26 · POÄNGTAVLAN ÖPPNAR OM</div>
            <div className="font-mono font-bold leading-none text-white tnum" style={{ fontSize: 'clamp(96px, 18vw, 220px)' }}>
              {daysLeft}
            </div>
            <div className="mt-1 mb-5 text-white/60 text-[14px] font-sans">dagar till VM-start</div>
            <div className="font-display font-black text-swe-yellow uppercase tracking-wide text-base leading-tight mb-1.5">
              SVERIGE MÖTER TUNISIEN OM {daysUntilSweden} DAGAR
            </div>
            <div className="text-white/50 text-[13px] font-sans">15 JUNI · 04:00 CEST · ESTADIO BBVA, MONTERREY</div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 lg:px-8 py-10 space-y-12">
        <LiveMatches initialMatches={liveCandidateMatches ?? []} userPicks={userPicks} />

        <div>
          <div className="label mb-1">Poängtabell</div>
          <h1 className="font-display font-black text-5xl sm:text-6xl uppercase tracking-tight text-white leading-none">Ledartavla</h1>
        </div>

        {!isOpen ? (
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row border-t border-b border-white/10">
              {[
                { value: String(totalCount), label: 'DELTAGARE', yellow: false },
                { value: `${pot.toLocaleString('sv-SE')} KR`, label: 'I POTTEN', yellow: true },
                { value: '11 JUNI', label: 'DEADLINE', yellow: false },
              ].map((stat, i) => (
                <div key={stat.label} className={`flex-1 px-4 sm:px-6 lg:px-10 py-7 ${i > 0 ? 'border-t sm:border-t-0 sm:border-l border-white/15' : ''}`}>
                  <div
                    className={`font-mono font-bold leading-none tnum whitespace-nowrap ${stat.yellow ? 'text-swe-yellow' : 'text-white'}`}
                    style={{ fontSize: 'clamp(32px, 4.5vw, 64px)' }}
                  >
                    {stat.value}
                  </div>
                  <div className="font-display font-black uppercase text-[10px] tracking-[0.18em] text-white/50 mt-2.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {user && !mySubmission && (
              <div>
                <div className="font-display font-black text-swe-yellow uppercase tracking-wide text-sm mb-1.5">DEADLINE: 11 JUNI</div>
                <p className="text-white text-sm mb-4">Du har inte lagt ditt tips än.</p>
                <Link href="/" className="btn-primary text-sm px-6 h-10 inline-flex items-center">TIPPA NU →</Link>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between pl-3 border-l-2 border-swe-yellow mb-5">
                <span className="font-display font-black uppercase text-white text-xl tracking-wide">Deltagare</span>
                <span className="font-mono text-white/40 text-sm tnum">{totalCount} st</span>
              </div>
              <div>
                {(allParticipants ?? []).map(p => (
                  <div key={p.id} className="group flex items-center justify-between min-h-[44px] py-2.5 border-b border-white/10 last:border-0">
                    <span className="font-display font-black uppercase text-[18px] tracking-wide text-white/90">{p.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[12px] font-sans text-white/40 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
                        {p.confirmed ? 'Tips inlagt' : 'Inväntar tips'}
                      </span>
                      <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${p.confirmed ? 'bg-swe-yellow' : 'bg-white/30'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {mySubmission && (
              <div>
                <div className="pl-3 border-l-2 border-swe-yellow mb-5">
                  <span className="font-display font-black uppercase text-white text-xl tracking-wide">Ditt tips i korthet</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-b border-white/10 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
                  {[
                    { label: 'VM-VINNARE', value: myChampion ?? '—' },
                    { label: 'SKYTTEKUNG', value: myTournamentScorer ?? '—' },
                    { label: 'VINNER GRUPP F', value: myGroupFWinner ?? '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="px-4 sm:px-6 py-6">
                      <div className="font-display font-black uppercase text-[9px] tracking-[0.18em] text-white/40 mb-2">{label}</div>
                      <div className="font-display font-black uppercase text-white text-xl tracking-wide leading-tight">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="pl-3 border-l-2 border-swe-yellow mb-5">
                <span className="font-display font-black uppercase text-white text-xl tracking-wide">Nästa match</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
                <div className="flex items-center gap-3">
                  <Image src="/images/flag-se.svg" alt="Sverige" width={44} height={30} className="object-contain" />
                  <span className="font-display font-black uppercase text-white text-2xl tracking-wide">Sverige</span>
                </div>
                <span className="font-display font-black text-white/25 uppercase tracking-widest text-sm">vs</span>
                <div className="flex items-center gap-3">
                  <Image src={nextMatch.flag} alt={nextMatch.opponent} width={44} height={30} className="object-contain" />
                  <span className="font-display font-black uppercase text-white text-2xl tracking-wide">{nextMatch.opponent}</span>
                </div>
                <div className="sm:ml-auto">
                  <div className="font-display font-black uppercase text-swe-yellow text-sm tracking-wide mb-1">{nextMatch.date} · {nextMatch.time} CEST</div>
                  <div className="text-white/50 text-[13px] font-sans">{nextMatch.venue}, {nextMatch.city}</div>
                  <div className="text-white/35 text-[11px] font-sans uppercase tracking-wider mt-0.5">Sänds på {nextMatch.tv}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {mySubmission && (
              <div className={`border px-4 py-3 text-sm ${mySubmission.confirmed ? 'border-swe-yellow/30 bg-swe-yellow/5 text-swe-yellow' : 'border-white/10 text-white/40'}`}>
                {mySubmission.confirmed ? `✓ Ditt tips är bekräftat — ${mySubmission.total_points} poäng` : '⏳ Ditt tips väntar på betalningsbekräftelse'}
              </div>
            )}

            {ranked.length === 0 ? (
              <div className="border border-white/10 py-16 text-center text-white/35 text-sm">Inga bekräftade deltagare ännu.</div>
            ) : (
              <div className="border border-white/10">
                <div className="grid grid-cols-12 px-4 h-8 items-center bg-navy-900 border-b border-white/10">
                  <div className="col-span-1 label text-[9px]">#</div>
                  <div className="col-span-9 label text-[9px]">Spelare</div>
                  <div className="col-span-2 text-right label text-[9px]">Poäng</div>
                </div>
                {ranked.map(entry => (
                  <div key={entry.id} className={`grid grid-cols-12 items-center px-4 h-11 border-b border-white/5 last:border-0 ${entry.user_id === user?.id ? 'bg-swe-yellow/10 border-l-2 border-l-swe-yellow' : ''}`}>
                    <div className="col-span-1">
                      <span className={`font-display font-black tnum text-lg ${entry.rank === 1 ? 'text-swe-yellow' : entry.rank === 2 ? 'text-white/70' : entry.rank === 3 ? 'text-amber-600' : 'text-white/25'}`}>
                        {String(entry.rank).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="col-span-9">
                      <span className="font-display font-bold uppercase tracking-wider text-[13px] text-white/80">
                        {entry.name}{entry.user_id === user?.id && <span className="ml-2 text-[10px] text-swe-yellow">DU</span>}
                      </span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="font-display font-black tnum text-lg text-swe-yellow">{entry.total_points ?? 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer userName={user?.email ?? null} />
    </div>
  )
}

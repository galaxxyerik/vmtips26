import { createClient, createServiceClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import LiveMatches from './LiveMatches'
import TournamentLeaderboard from './TournamentLeaderboard'
import { getDashboardLeaderboard, TOURNAMENT_START } from '@/lib/leaderboard'
import { canEditPicks } from '@/lib/deadlines'

export const dynamic = 'force-dynamic'

const SWEDEN_MATCHES = [
  {
    date: '15 JUNI',
    day: 'Måndag',
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
    day: 'Lördag',
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
    day: 'Fredag',
    time: '01:00',
    opponent: 'Japan',
    flag: '/images/flag-jp.svg',
    venue: 'AT&T Stadium',
    city: 'Dallas',
    tv: 'SVT',
    kickoffUtc: new Date('2026-06-25T23:00:00Z'),
  },
]

type DashboardPageProps = {
  searchParams?: Promise<{ leaderboardPreview?: string; preview?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams
  const previewParam = params?.leaderboardPreview ?? params?.preview
  const leaderboardPreview = previewParam === 'mid' || previewParam === 'pre' ? previewParam : null
  const now = leaderboardPreview === 'mid'
    ? new Date('2026-06-21T12:00:00Z')
    : leaderboardPreview === 'pre'
      ? new Date('2026-06-01T12:00:00Z')
      : new Date()
  const isOpen = now >= TOURNAMENT_START
  const service = createServiceClient()
  const leaderboardData = await getDashboardLeaderboard(service, user?.id ?? null, now, leaderboardPreview)

  // All participants — confirmed first, then by sign-up order
  const { data: allParticipants } = await service
    .from('vmt_submissions')
    .select('id, name, confirmed, user_id')
    .order('confirmed', { ascending: false })
    .order('submitted_at', { ascending: true })

  const confirmedCount = allParticipants?.filter(p => p.confirmed).length ?? 0
  const totalCount = allParticipants?.length ?? 0
  const pot = confirmedCount * 100

  // Countdown to leaderboard opening
  const msLeft = TOURNAMENT_START.getTime() - now.getTime()
  const daysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)))

  // Days until Sweden's first group match
  const daysUntilSweden = Math.max(
    0,
    Math.floor((SWEDEN_MATCHES[0].kickoffUtc.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  )

  // Next upcoming Sweden match
  const nextMatch =
    SWEDEN_MATCHES.find(m => now < new Date(m.kickoffUtc.getTime() + 2 * 60 * 60 * 1000)) ??
    SWEDEN_MATCHES[SWEDEN_MATCHES.length - 1]

  // Logged-in user's own submission (always check, not just when isOpen)
  let mySubmission: { id: string; name: string; total_points: number; confirmed: boolean } | null = null
  if (user) {
    const { data: mine } = await supabase
      .from('vmt_submissions')
      .select('id, name, total_points, confirmed')
      .eq('user_id', user.id)
      .maybeSingle()
    mySubmission = mine
  }

  // User's tip summary for "Ditt tips i korthet"
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

  // Live match data
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

  // Next match card — live first, then next scheduled
  let nextDbMatch: { id: number; home_team: string; away_team: string; kickoff: string; status: string; home_score: number | null; away_score: number | null } | null = null
  if (mySubmission) {
    const currentLive = (liveCandidateMatches ?? []).find(m => m.status === 'live') ?? null
    if (currentLive) {
      nextDbMatch = currentLive
    } else {
      const { data } = await service
        .from('vmt_matches')
        .select('id, home_team, away_team, kickoff, status, home_score, away_score')
        .eq('status', 'scheduled')
        .gt('kickoff', now.toISOString())
        .order('kickoff', { ascending: true })
        .limit(1)
        .maybeSingle()
      nextDbMatch = data
    }
  }

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-navy-950">
      <NavBar userName={user?.email ?? null} />

      {/* ── HERO ── */}
      <div className="relative overflow-hidden" style={{ minHeight: '60vh' }}>
        <Image
          src="/images/hero1.jpeg"
          alt="Sverige firar VM-kvalet mot Polen"
          fill
          sizes="100vw"
          className="object-cover object-[center_38%]"
          priority
        />
        {/* Heavy at bottom for text, light at top so photo breathes */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.15) 100%)' }}
        />
        {/* Left-edge vignette behind countdown text */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 40%)' }}
        />

        {/* Bottom-left: editorial countdown / tournament-open message */}
        <div className="absolute bottom-0 left-0 px-6 sm:px-10 pb-8 sm:pb-10">
          {isOpen ? (
            <>
              <div
                className="font-display font-black text-white leading-none"
                style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
              >
                TURNERINGEN ÄR IGÅNG
              </div>
              <div className="my-4" style={{ width: '120px', height: '1px', background: 'rgba(255,255,255,0.3)' }} />
              <div
                className="font-sans uppercase tracking-[0.1em] text-white/50"
                style={{ fontSize: '12px' }}
              >
                {nextMatch.date} · {nextMatch.time} CEST · SVERIGE MOT {nextMatch.opponent.toUpperCase()}
              </div>
            </>
          ) : (
            <>
              {/* Kicker overline */}
              <div
                className="font-sans uppercase tracking-[0.12em] text-white/60 mb-3"
                style={{ fontSize: '13px' }}
              >
                Sverige möter Tunisien
              </div>
              {/* Primary display: "OM 20 DAGAR" — editorial headline */}
              <div
                className="font-display font-black text-white leading-none"
                style={{ fontSize: 'clamp(56px, 8vw, 96px)' }}
              >
                OM {daysUntilSweden} DAGAR
              </div>
              {/* Thin editorial rule */}
              <div className="my-4" style={{ width: '120px', height: '1px', background: 'rgba(255,255,255,0.3)' }} />
              {/* Detail line */}
              <div
                className="font-sans uppercase tracking-[0.1em] text-white/50"
                style={{ fontSize: '12px' }}
              >
                15 JUNI · 04:00 CEST · ESTADIO BBVA, MONTERREY
              </div>
            </>
          )}
        </div>

        {/* Bottom-right: subtle edit link for confirmed users — hidden after the deadline */}
        {mySubmission?.confirmed && canEditPicks(now) && (
          <div className="absolute bottom-0 right-0 px-6 sm:px-10 pb-8 sm:pb-10">
            <Link
              href={`/dashboard/${mySubmission.id}`}
              className="font-sans text-[13px] text-white/40 hover:text-white/70 transition-colors"
            >
              Redigera mitt tips →
            </Link>
          </div>
        )}
      </div>

      <main className="mx-auto max-w-5xl px-4 lg:px-8">
        <LiveMatches initialMatches={liveCandidateMatches ?? []} userPicks={userPicks} />

        {/* ── NÄSTA MATCH / LIVE-KORT ── */}
        {mySubmission && nextDbMatch && (() => {
          const match = nextDbMatch
          const myPick = userPicks[match.id] ?? null
          const isLive = match.status === 'live'
          const pickLabels: Record<string, string> = { '1': 'hemmaseger', 'X': 'oavgjort', '2': 'bortaseger' }
          const kickoffDate = new Date(match.kickoff)
          const weekday = kickoffDate.toLocaleDateString('sv-SE', { weekday: 'long', timeZone: 'Europe/Stockholm' })
          const dateStr = kickoffDate.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', timeZone: 'Europe/Stockholm' })
          const timeStr = kickoffDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Stockholm' })
          return (
            <div className="mb-6 border border-white/10">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
                {isLive && <span className="h-2 w-2 rounded-full bg-swe-yellow animate-pulse" />}
                <span className="font-display font-black uppercase text-[10px] tracking-[0.15em] text-white/40">
                  {isLive ? 'Live just nu' : 'Nästa match'}
                </span>
              </div>
              <div className="px-4 py-4">
                <div className="font-display font-black uppercase text-white text-xl tracking-wide leading-none">
                  {match.home_team}
                  {isLive
                    ? <span className="mx-3 text-white/50">{match.home_score ?? 0}–{match.away_score ?? 0}</span>
                    : <span className="mx-3 text-white/20 text-sm">vs</span>
                  }
                  {match.away_team}
                </div>
                {!isLive && (
                  <div className="mt-1.5 text-white/35 text-[11px] uppercase tracking-[0.12em] font-sans capitalize">
                    {weekday} {dateStr} · {timeStr} CEST
                  </div>
                )}
                {myPick ? (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="border border-swe-yellow/25 bg-swe-yellow/[0.06] px-3 py-1.5 flex items-center gap-2.5">
                      <span className="font-display font-black text-swe-yellow text-lg leading-none">{myPick}</span>
                      <span className="text-white/40 text-[12px] font-sans">{pickLabels[myPick]}</span>
                    </div>
                    <span className="text-white/30 text-[13px] font-sans">Nu håller vi tummarna!</span>
                  </div>
                ) : (
                  <div className="mt-3 text-white/25 text-[12px] font-sans italic">
                    Inget tips registrerat för den här matchen.
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        {/* ── STAT STRIP (pre-tournament only) ── */}
        {!isOpen && (
          <div className="flex flex-col sm:flex-row border-t border-b border-white/10">
            {[
              { value: String(totalCount), label: 'DELTAGARE', yellow: false },
              { value: `${pot.toLocaleString('sv-SE')} KR`, label: 'I POTTEN', yellow: true },
              { value: '11 JUNI', label: 'DEADLINE KL 21:30', yellow: false },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`flex-1 px-4 sm:px-6 lg:px-10 py-4 sm:py-7 ${
                  i > 0 ? 'border-t sm:border-t-0 sm:border-l border-white/10 sm:border-white/15' : ''
                }`}
              >
                <div
                  className={`font-mono font-bold leading-none tnum whitespace-nowrap ${
                    stat.yellow ? 'text-swe-yellow' : 'text-white'
                  }`}
                  style={{ fontSize: 'clamp(48px, 5vw, 64px)' }}
                >
                  {stat.value}
                </div>
                <div className="font-display font-black uppercase text-[10px] tracking-[0.18em] text-white/50 mt-2.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section divider */}
        <div className="h-px bg-white/[0.08]" />

        {/* ── LEDARTAVLA HEADING ── */}
        <div className="pt-12 pb-8">
          <div className="label mb-2">Poängtabell</div>
          <h1
            className="font-display font-black uppercase tracking-tight text-white leading-none"
            style={{ fontSize: 'clamp(56px, 6vw, 72px)' }}
          >
            Ledartavla
          </h1>
        </div>

        {/* Section divider */}
        <div className="h-px bg-white/[0.08]" />

        {/* ── MAIN CONTENT ── */}
        <div className="pt-10 pb-16 space-y-12">
          {!isOpen ? (
            <>
              {/* CTA — only for logged-in users with no submission */}
              {user && !mySubmission && (
                <div>
                  <div className="font-display font-black text-swe-yellow uppercase tracking-wide text-sm mb-1.5">
                    DEADLINE: 11 JUNI KL 21:30
                  </div>
                  <p className="text-white text-sm mb-4">Du har inte lagt ditt tips än.</p>
                  <Link href="/" className="btn-primary text-sm px-6 h-10 inline-flex items-center">
                    TIPPA NU →
                  </Link>
                </div>
              )}

              <TournamentLeaderboard initialData={leaderboardData} previewMode={leaderboardPreview} />

              {/* ── DITT TIPS I KORTHET ── */}
              {mySubmission && (
                <div>
                  <div className="pl-3 border-l-2 border-swe-yellow mb-5">
                    <div className="font-display font-black uppercase text-white text-xl tracking-wide">
                      Ditt tips i korthet
                    </div>
                    <div className="text-white/45 text-[13px] font-sans mt-1">
                      Dina stora val att jämföra mot resten när turneringen rullar.
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-b border-white/10 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
                    {[
                      { label: 'VINNER GRUPP F', value: myGroupFWinner ?? '—' },
                      { label: 'SKYTTEKUNG', value: myTournamentScorer ?? '—' },
                      { label: 'VM-VINNARE', value: myChampion ?? '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="px-4 sm:px-6 py-6">
                        <div className="font-display font-black uppercase text-[9px] tracking-[0.18em] text-white/40 mb-2">
                          {label}
                        </div>
                        <div className="font-display font-black uppercase text-white text-xl tracking-wide leading-tight">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── NÄSTA MATCH ── */}
              <div>
                <div className="pl-3 border-l-2 border-swe-yellow mb-5">
                  <span className="font-display font-black uppercase text-white text-xl tracking-wide">
                    Nästa match
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/flag-se.svg" alt="Sverige" className="h-[30px] w-auto" />
                    <span className="font-display font-black uppercase text-white text-2xl tracking-wide">
                      Sverige
                    </span>
                  </div>
                  <span className="font-display font-black text-white/25 uppercase tracking-widest text-sm">
                    vs
                  </span>
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={nextMatch.flag} alt={nextMatch.opponent} className="h-[30px] w-auto" />
                    <span className="font-display font-black uppercase text-white text-2xl tracking-wide">
                      {nextMatch.opponent}
                    </span>
                  </div>
                  <div className="sm:ml-auto">
                    <div className="font-display font-black uppercase text-swe-yellow text-sm tracking-wide mb-1">
                      {nextMatch.date} · {nextMatch.time} CEST
                    </div>
                    <div className="text-white/50 text-[13px] font-sans">
                      {nextMatch.venue}, {nextMatch.city}
                    </div>
                    <div className="text-white/35 text-[11px] font-sans uppercase tracking-wider mt-0.5">
                      Sänds på {nextMatch.tv}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ── LEADERBOARD (post-open) ── */
            <>
              {mySubmission && (
                <div className={`border px-4 py-3 text-sm ${
                  mySubmission.confirmed
                    ? 'border-swe-yellow/30 bg-swe-yellow/5 text-swe-yellow'
                    : 'border-white/10 text-white/40'
                }`}>
                  {mySubmission.confirmed
                    ? `✓ Ditt tips är bekräftat — ${mySubmission.total_points} poäng`
                    : '⏳ Ditt tips väntar på betalningsbekräftelse'}
                </div>
              )}
              <TournamentLeaderboard initialData={leaderboardData} previewMode={leaderboardPreview} />
            </>
          )}
        </div>
      </main>

      <Footer userName={user?.email ?? null} />
    </div>
  )
}

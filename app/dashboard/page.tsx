import { createClient, createServiceClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import LiveMatches from './LiveMatches'

export const dynamic = 'force-dynamic'

// June 11 2026 at 21:00 Swedish summer time (UTC+2) = 19:00 UTC
const OPENS_AT = new Date('2026-06-11T19:00:00Z')

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const isOpen = now >= OPENS_AT

  // Always fetch participant count
  const service = createServiceClient()
  const { count: totalParticipants } = await service
    .from('vmt_submissions')
    .select('id', { count: 'exact', head: true })
  const { count: confirmedParticipants } = await service
    .from('vmt_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('confirmed', true)

  let submissions: { id: string; name: string; total_points: number; confirmed: boolean; user_id: string | null }[] = []
  let mySubmission: { id: string; name: string; total_points: number; confirmed: boolean } | null = null

  if (isOpen) {
    const { data } = await supabase
      .from('vmt_submissions')
      .select('id, name, total_points, confirmed, user_id')
      .eq('confirmed', true)
      .order('total_points', { ascending: false })
    submissions = data ?? []

    if (user) {
      const { data: mine } = await supabase
        .from('vmt_submissions')
        .select('id, name, total_points, confirmed')
        .eq('user_id', user.id)
        .single()
      mySubmission = mine
    }
  }

  const ranked = submissions.map((s, i) => ({ ...s, rank: i + 1 }))
  const pot = (confirmedParticipants ?? 0) * 100
  const { data: liveCandidateMatches } = await service
    .from('vmt_matches')
    .select('id, match_number, home_team, away_team, kickoff, home_score, away_score, home_goal_scorers, away_goal_scorers, status')
    .gte('kickoff', new Date(now.getTime() - 130 * 60 * 1000).toISOString())
    .lte('kickoff', new Date(now.getTime() + 5 * 60 * 1000).toISOString())
    .order('kickoff')
  const { data: myGroupPicks } = mySubmission
    ? await service
        .from('vmt_group_picks')
        .select('match_id, pick')
        .eq('submission_id', mySubmission.id)
    : { data: [] }
  const userPicks = Object.fromEntries((myGroupPicks ?? []).map(row => [row.match_id, row.pick]))

  // Countdown
  const msLeft = OPENS_AT.getTime() - now.getTime()
  const daysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)))
  const hoursLeft = Math.max(0, Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))

  return (
    <div className="min-h-screen bg-navy-950">
      <NavBar userName={user?.email ?? null} />

      {/* Hero strip — Friends Arena */}
      {!isOpen && (
        <div className="relative h-[35vh] min-h-[200px] overflow-hidden">
          <Image
            src="/images/friends-arena-stockholm.jpg"
            alt="Friends Arena i Stockholm — Sveriges hemmaplan"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-navy-950/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 max-w-3xl mx-auto">
            <div className="label text-swe-yellow/60 mb-1">Nästa nyckelMatch · Grupp F</div>
            <div className="font-display font-black text-2xl uppercase tracking-wide text-white">Sverige vs Nederländerna</div>
            <div className="text-white/50 text-sm">20 juni · 19:00 CEST · NRG Stadium, Houston</div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-3xl px-4 py-8">
        <LiveMatches initialMatches={liveCandidateMatches ?? []} userPicks={userPicks} />

        <div className="mb-6">
          <div className="label">Poängtabell</div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wide text-white">Ledartavla</h1>
          {isOpen && (
            <p className="text-white/35 text-sm mt-1">
              Visar bekräftade deltagare. Uppdateras efter varje matchdag.
            </p>
          )}
        </div>

        {!isOpen ? (
          <div className="space-y-4">
            {/* Countdown */}
            <div className="border border-white/10 bg-navy-900 px-6 py-8 text-center">
              <div className="label mb-3">Ledartavlan öppnar om</div>
              <div className="font-display font-black text-5xl uppercase text-swe-yellow tracking-wider">
                {daysLeft}d {hoursLeft}h
              </div>
              <div className="text-white/40 text-sm mt-2">11 juni · kl 21:00 (CEST)</div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 border border-white/10">
              <div className="px-5 py-5 border-r border-white/10">
                <div className="label mb-1">Anmälda</div>
                <div className="font-display font-black text-3xl text-white">
                  {totalParticipants ?? 0}
                  <span className="text-base text-white/40 ml-1">deltagare</span>
                </div>
              </div>
              <div className="px-5 py-5">
                <div className="label mb-1">Bekräftad pott</div>
                <div className="font-display font-black text-3xl text-swe-yellow">
                  {pot.toLocaleString('sv-SE')}
                  <span className="text-base text-swe-yellow/60 ml-1">kr</span>
                </div>
              </div>
            </div>

            {/* Sverige info */}
            <div className="border border-white/10">
              <div className="px-4 py-3 border-b border-white/10 bg-navy-900">
                <div className="label">Sverige i VM 2026</div>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { label: 'Grupp', value: 'F — "Dödsgruppen"' },
                  { label: 'Motståndare', value: 'Nederländerna, Japan, Tunisien' },
                  { label: 'Förbundskapten', value: 'Graham Potter' },
                  { label: 'Kapten', value: 'Victor Lindelöf' },
                  { label: 'Hetaste namn', value: 'Viktor Gyökeres (Arsenal)' },
                  { label: 'Senaste VM', value: '2018 i Ryssland (kvartsfinal)' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-white/40 uppercase tracking-wide">{label}</span>
                    <span className="text-sm text-white/80 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="border border-swe-yellow/20 bg-swe-yellow/5 px-5 py-4 flex items-center justify-between">
              <div>
                <div className="font-display font-black uppercase tracking-wide text-white text-sm">
                  Inte lagt in ditt tips ännu?
                </div>
                <div className="text-xs text-white/40 mt-0.5">Sista chansen innan 11 juni.</div>
              </div>
              <Link href="/" className="btn-primary text-sm px-5 h-9 flex items-center">
                Tippa nu →
              </Link>
            </div>
          </div>
        ) : (
          <>
            {mySubmission && (
              <div className={`mb-6 border px-4 py-3 text-sm ${
                mySubmission.confirmed
                  ? 'border-pitch-500/30 bg-pitch-900/20 text-pitch-400'
                  : 'border-white/10 text-white/40'
              }`}>
                {mySubmission.confirmed
                  ? `✓ Ditt tips är bekräftat — ${mySubmission.total_points} poäng`
                  : '⏳ Ditt tips väntar på betalningsbekräftelse'}
              </div>
            )}

            {ranked.length === 0 ? (
              <div className="border border-white/10 py-16 text-center text-white/35 text-sm">
                Inga bekräftade deltagare ännu.
              </div>
            ) : (
              <div className="border border-white/10">
                <div className="grid grid-cols-12 px-4 h-8 items-center bg-navy-900 border-b border-white/10">
                  <div className="col-span-1 font-display font-black uppercase text-[9px] tracking-[0.16em] text-white/40">#</div>
                  <div className="col-span-9 font-display font-black uppercase text-[9px] tracking-[0.16em] text-white/40">Spelare</div>
                  <div className="col-span-2 text-right font-display font-black uppercase text-[9px] tracking-[0.16em] text-white/40">Poäng</div>
                </div>
                {ranked.map((entry) => (
                  <div key={entry.id} className={`grid grid-cols-12 items-center px-4 h-11 border-b border-white/5 last:border-0 ${
                    entry.user_id === user?.id ? 'bg-swe-yellow/8 border-l-2 border-l-swe-yellow' : ''
                  }`}>
                    <div className="col-span-1">
                      <span className={`font-display font-black tnum text-lg ${
                        entry.rank === 1 ? 'text-swe-yellow' :
                        entry.rank === 2 ? 'text-white/70' :
                        entry.rank === 3 ? 'text-amber-600' : 'text-white/25'
                      }`}>
                        {String(entry.rank).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="col-span-9">
                      <span className="font-display font-bold uppercase tracking-wider text-[13px] text-white/80">
                        {entry.name}
                        {entry.user_id === user?.id && <span className="ml-2 text-[10px] text-swe-yellow">DU</span>}
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

        <div className="mt-8 text-center">
          <Link href="/" className="btn-primary">
            Lämna in tips →
          </Link>
        </div>
      </main>

      <Footer userName={user?.email ?? null} />
    </div>
  )
}

import { createClient, createServiceClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import LiveMatches from './LiveMatches'
import SubmittedBanner from './SubmittedBanner'

export const dynamic = 'force-dynamic'

// VM opens for scoring on June 11 at 21:00 CEST = 19:00 UTC
const OPENS_AT = new Date('2026-06-11T19:00:00Z')
// Sweden vs Tunisia: June 15 at 04:00 CEST = 02:00 UTC
const SWEDEN_VS_TUNISIA = new Date('2026-06-15T02:00:00Z')

function nameInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase()
}

function nameColor(name: string): string {
  const palette = ['#1c3a7e', '#1e2f6e', '#0f2660', '#243d8f', '#162d7a', '#0d2455', '#2a3d8c']
  let h = 0
  for (const c of name) h = ((h << 5) - h + c.charCodeAt(0)) | 0
  return palette[Math.abs(h) % palette.length]
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>
}) {
  const params = await searchParams
  const showBanner = params.submitted === 'true'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const isOpen = now >= OPENS_AT

  const service = createServiceClient()

  // All participants for participant list (pre-tournament)
  const { data: allParticipants } = await service
    .from('vmt_submissions')
    .select('id, name, confirmed')
    .order('submitted_at', { ascending: true })

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
  const msToOpen = OPENS_AT.getTime() - now.getTime()
  const daysLeft = Math.max(0, Math.floor(msToOpen / (1000 * 60 * 60 * 24)))
  const msToTunisia = SWEDEN_VS_TUNISIA.getTime() - now.getTime()
  const daysToTunisia = Math.max(0, Math.ceil(msToTunisia / (1000 * 60 * 60 * 24)))

  const participants = allParticipants ?? []
  const totalCount = participants.length

  return (
    <div className="min-h-screen bg-navy-950">
      <NavBar userName={user?.email ?? null} />

      {/* Post-submission banner */}
      {showBanner && <SubmittedBanner />}

      {/* Hero — full-bleed countdown (hidden once tournament starts) */}
      {!isOpen && (
        <div className="relative overflow-hidden" style={{ minHeight: '62vh' }}>
          <Image
            src="/images/friends-arena-stockholm.jpg"
            alt="Friends Arena i Stockholm — Sveriges hemmaplan"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-navy-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-6 lg:px-16 pb-12">
            <div className="label text-swe-yellow/60 mb-3">VM-TIPS 26 · Poängtavlan öppnar om</div>
            <div
              className="font-mono font-bold leading-none text-white tnum"
              style={{ fontSize: 'clamp(80px, 16vw, 160px)' }}
            >
              {daysLeft}
            </div>
            <div className="text-white/60 mt-2" style={{ fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif' }}>
              dagar till VM-start
            </div>
            <div className="font-display font-black text-swe-yellow uppercase tracking-wide mt-3" style={{ fontSize: '18px' }}>
              SVERIGE MÖTER TUNISIEN OM {daysToTunisia} DAGAR · 15 JUNI · 04:00 CEST
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 lg:px-8 py-8">
        <LiveMatches initialMatches={liveCandidateMatches ?? []} userPicks={userPicks} />

        <div className="mb-6">
          <div className="label">Poängtabell</div>
          <h1 className="font-display font-black text-5xl sm:text-6xl uppercase tracking-tight text-white leading-none">Ledartavla</h1>
          {isOpen && (
            <p className="text-white/35 text-sm mt-1">
              Visar bekräftade deltagare. Uppdateras efter varje matchdag.
            </p>
          )}
        </div>

        {!isOpen ? (
          <div className="space-y-6">
            {/* Stats — big mono numbers */}
            <div className="grid grid-cols-2 border border-white/10">
              <div className="px-6 lg:px-10 py-8 border-r border-white/10">
                <div className="label mb-3">Anmälda deltagare</div>
                <div
                  className="font-mono font-bold leading-none text-white tnum"
                  style={{ fontSize: 'clamp(56px, 9vw, 100px)' }}
                >
                  {totalCount}
                </div>
                <div className="text-white/25 text-xs uppercase tracking-wider mt-2">st</div>
              </div>
              <div className="px-6 lg:px-10 py-8">
                <div className="label mb-3">Bekräftad pott</div>
                <div
                  className="font-mono font-bold leading-none text-swe-yellow tnum"
                  style={{ fontSize: 'clamp(56px, 9vw, 100px)' }}
                >
                  {pot.toLocaleString('sv-SE')}
                </div>
                <div className="text-swe-yellow/30 text-xs uppercase tracking-wider mt-2">kronor</div>
              </div>
            </div>

            {/* Participant list */}
            {participants.length > 0 && (
              <div className="border border-white/10">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-navy-900">
                  <div className="w-1 h-5 bg-swe-yellow shrink-0" />
                  <span className="font-display font-black uppercase text-[11px] tracking-[0.18em] text-white">DELTAGARE</span>
                  <span className="ml-auto font-mono text-xs text-white/30 tnum">{totalCount} st</span>
                </div>
                <div className="divide-y divide-white/5">
                  {participants.map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div
                        className="w-8 h-8 flex items-center justify-center shrink-0 font-display font-black text-sm text-white"
                        style={{ backgroundColor: nameColor(p.name) }}
                      >
                        {nameInitial(p.name)}
                      </div>
                      <span className="flex-1 font-display font-black uppercase tracking-wide text-sm text-white/80">
                        {p.name}
                      </span>
                      {p.confirmed ? (
                        <span className="text-[10px] font-display font-black uppercase tracking-wider border border-swe-yellow/40 text-swe-yellow px-2 py-0.5 shrink-0">
                          Tips inlagt ✓
                        </span>
                      ) : (
                        <span className="text-[10px] font-display font-black uppercase tracking-wider border border-white/15 text-white/40 px-2 py-0.5 shrink-0">
                          Inväntar tips
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* Login prompt for logged-out users who have already submitted */}
            {!user && (
              <div className="border border-white/10 px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-display font-black uppercase tracking-wide text-white text-sm">
                    Har du redan tippat?
                  </div>
                  <div className="text-xs text-white/40 mt-0.5 leading-relaxed">
                    Logga in för att följa ditt tips och göra ändringar — det går fram till VM-start den 11 juni.
                  </div>
                </div>
                <Link href="/login" className="btn-primary text-sm px-5 h-9 flex items-center shrink-0">
                  Logga in →
                </Link>
              </div>
            )}

            {/* CTA */}
            <div className="border border-swe-yellow/20 bg-swe-yellow/5 px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-display font-black uppercase tracking-wide text-white text-sm">
                  Inte lagt in ditt tips ännu?
                </div>
                <div className="text-xs text-white/40 mt-0.5">Sista chansen innan 11 juni.</div>
              </div>
              <Link href="/" className="btn-primary text-sm px-5 h-9 flex items-center shrink-0">
                Tippa nu →
              </Link>
            </div>

            {/* Leaderboard placeholder */}
            <div className="border border-white/10">
              <div className="grid grid-cols-12 px-4 h-9 items-center bg-navy-900 border-b border-white/10">
                <div className="col-span-1 label mb-0">#</div>
                <div className="col-span-9 label mb-0">Spelare</div>
                <div className="col-span-2 text-right label mb-0">Poäng</div>
              </div>
              <div className="py-12 text-center">
                <p className="font-display font-black uppercase tracking-wide text-white/20 text-sm">
                  Turneringen börjar 11 juni — tabellen uppdateras live.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Logged-out prompt when tournament is live */}
            {!user && (
              <div className="mb-6 border border-white/10 px-6 py-8 text-center">
                <h2 className="font-display font-black uppercase text-3xl text-white leading-none">SE TABELLEN</h2>
                <p className="text-white/55 text-sm mt-3">Logga in för att se poängtabellen och ditt tips.</p>
                <Link href="/login" className="btn-primary mt-5 inline-flex">LOGGA IN →</Link>
              </div>
            )}

            {mySubmission && (
              <div className={`mb-6 border px-4 py-3 text-sm ${
                mySubmission.confirmed
                  ? 'border-swe-yellow/30 bg-swe-yellow/5 text-swe-yellow'
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
                  <div className="col-span-1 label mb-0">#</div>
                  <div className="col-span-9 label mb-0">Spelare</div>
                  <div className="col-span-2 text-right label mb-0">Poäng</div>
                </div>
                {ranked.map((entry) => (
                  <div
                    key={entry.id}
                    className={`grid grid-cols-12 items-center px-4 h-11 border-b border-white/5 last:border-0 ${
                      entry.rank === 1 ? 'border-l-2 border-l-swe-yellow' : ''
                    } ${entry.user_id === user?.id ? 'bg-swe-yellow/[0.06]' : ''}`}
                  >
                    <div className="col-span-1">
                      <span className={`font-mono font-bold tnum text-lg ${
                        entry.rank === 1 ? 'text-swe-yellow' :
                        entry.rank === 2 ? 'text-white/70' :
                        entry.rank === 3 ? 'text-amber-600' : 'text-white/25'
                      }`}>
                        {String(entry.rank).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="col-span-9 flex items-center gap-2 min-w-0">
                      <div
                        className="w-6 h-6 flex items-center justify-center shrink-0 font-display font-black text-[11px] text-white"
                        style={{ backgroundColor: nameColor(entry.name) }}
                      >
                        {nameInitial(entry.name)}
                      </div>
                      <span className="font-display font-bold uppercase tracking-wider text-[13px] text-white/80 truncate">
                        {entry.name}
                      </span>
                      {entry.user_id === user?.id && (
                        <span className="text-[10px] text-swe-yellow font-display font-black shrink-0">DU</span>
                      )}
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="font-mono font-bold tnum text-lg text-swe-yellow">{entry.total_points ?? 0}</span>
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

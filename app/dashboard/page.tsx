import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// June 11 2026 at 21:00 Swedish summer time (UTC+2) = 19:00 UTC
const OPENS_AT = new Date('2026-06-11T19:00:00Z')

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const isOpen = now >= OPENS_AT

  let submissions: { id: string; name: string; total_points: number; confirmed: boolean; user_id: string | null }[] = []
  let mySubmission = null

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

  return (
    <div className="min-h-screen bg-navy-950">
      <NavBar userName={user?.email ?? null} />

      <main className="mx-auto max-w-3xl px-4 py-8">
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
          <div className="border border-white/10 bg-navy-900 py-16 text-center space-y-3">
            <div className="font-display font-black text-4xl uppercase text-swe-yellow">11 JUNI · 21:00</div>
            <p className="text-white/40 text-sm">Tabellen öppnar när första matchen sparkar igång.</p>
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
                {ranked.map((entry, i) => (
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
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: submissions } = await supabase
    .from('vmt_submissions')
    .select('id, name, total_points, confirmed, user_id')
    .eq('confirmed', true)
    .order('total_points', { ascending: false })

  const ranked = (submissions ?? []).map((s, i) => ({ ...s, rank: i + 1 }))

  let mySubmission = null
  if (user) {
    const { data } = await supabase
      .from('vmt_submissions')
      .select('id, name, total_points, confirmed')
      .eq('user_id', user.id)
      .single()
    mySubmission = data
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <NavBar userName={user?.email ?? null} />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <div className="label">Poängtabell</div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wide text-white">Ledartavla</h1>
          <p className="text-white/35 text-sm mt-1">
            Visar bekräftade deltagare. Uppdateras efter varje matchdag.
          </p>
        </div>

        {/* My status */}
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
            Inga bekräftade deltagare ännu. Kom tillbaka efter 12 juni!
          </div>
        ) : (
          <div className="border border-white/10 divide-y divide-white/5">
            {ranked.map(entry => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                <span className={`w-7 text-center font-display font-black text-sm tnum ${
                  entry.rank === 1 ? 'text-swe-yellow' :
                  entry.rank === 2 ? 'text-gray-300' :
                  entry.rank === 3 ? 'text-amber-600' : 'text-white/25'
                }`}>
                  {entry.rank}
                </span>
                <span className="flex-1 text-sm font-medium text-white/80">{entry.name}</span>
                <span className="font-display font-black text-swe-yellow tnum">{entry.total_points ?? 0}</span>
                <span className="text-xs text-white/25 w-10">poäng</span>
              </div>
            ))}
          </div>
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

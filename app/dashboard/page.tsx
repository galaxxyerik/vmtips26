import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Leaderboard: confirmed submissions sorted by total_points
  const { data: submissions } = await supabase
    .from('vmt_submissions')
    .select('id, name, total_points, confirmed, user_id')
    .eq('confirmed', true)
    .order('total_points', { ascending: false })

  const ranked = (submissions ?? []).map((s, i) => ({ ...s, rank: i + 1 }))

  // Current user's submission (if logged in)
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
    <div className="min-h-screen bg-surface-900">
      <NavBar userName={user?.email ?? null} />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Poängtabell</h1>
          <p className="text-gray-500 text-sm mt-1">
            Visar bekräftade deltagare. Tabellen uppdateras efter varje matchdag.
          </p>
        </div>

        {/* My status */}
        {mySubmission && (
          <div className={`mb-6 border px-4 py-3 text-sm ${
            mySubmission.confirmed
              ? 'border-pitch-800 bg-pitch-900/20 text-pitch-300'
              : 'border-surface-600 text-gray-400'
          }`}>
            {mySubmission.confirmed
              ? `✓ Ditt tips är bekräftat — ${mySubmission.total_points} poäng`
              : '⏳ Ditt tips väntar på betalningsbekräftelse'}
          </div>
        )}

        {ranked.length === 0 ? (
          <div className="border border-surface-600 py-16 text-center text-gray-500 text-sm">
            Inga bekräftade deltagare ännu. Kom tillbaka efter 12 juni!
          </div>
        ) : (
          <div className="border border-surface-600 divide-y divide-surface-700">
            {ranked.map(entry => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                <span className={`w-7 text-center text-sm font-bold ${
                  entry.rank === 1 ? 'text-yellow-400' :
                  entry.rank === 2 ? 'text-gray-300' :
                  entry.rank === 3 ? 'text-yellow-700' : 'text-gray-600'
                }`}>
                  {entry.rank}
                </span>
                <span className="flex-1 text-sm font-medium text-gray-200">{entry.name}</span>
                <span className="text-sm font-bold text-yellow-400">{entry.total_points ?? 0}</span>
                <span className="text-xs text-gray-600 w-10">poäng</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/onboarding/group-stage"
            className="inline-block border border-yellow-500 text-yellow-400 px-6 py-2 text-sm hover:bg-yellow-500 hover:text-black transition-colors">
            Lämna in tips →
          </Link>
        </div>
      </main>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import Link from 'next/link'

interface LeaderboardEntry {
  user_id: string
  name: string
  total_points: number
  rank: number
}

async function getLeaderboard(supabase: ReturnType<typeof createClient>) {
  // Fetch all confirmed users with their points
  const { data: confirmedUsers } = await supabase
    .from('submission_status')
    .select('user_id')
    .eq('confirmed', true)

  if (!confirmedUsers || confirmedUsers.length === 0) return []

  const userIds = confirmedUsers.map(u => u.user_id)

  const { data: users } = await supabase
    .from('users')
    .select('id, name')
    .in('id', userIds)

  // Sum up points from picks table
  const { data: picks } = await supabase
    .from('picks')
    .select('user_id, points')
    .in('user_id', userIds)
    .not('points', 'is', null)

  const pointsByUser: Record<string, number> = {}
  for (const p of picks ?? []) {
    pointsByUser[p.user_id] = (pointsByUser[p.user_id] ?? 0) + (p.points ?? 0)
  }

  const entries: LeaderboardEntry[] = (users ?? []).map(u => ({
    user_id: u.id,
    name: u.name ?? 'Okänd',
    total_points: pointsByUser[u.id] ?? 0,
    rank: 0,
  }))

  entries.sort((a, b) => b.total_points - a.total_points)
  entries.forEach((e, i) => { e.rank = i + 1 })

  return entries
}

async function getTopScorers(supabase: ReturnType<typeof createClient>) {
  const { data: matches } = await supabase
    .from('matches')
    .select('home_goal_scorers, away_goal_scorers, group_label')
    .not('home_score', 'is', null)

  const scorerCounts: Record<string, number> = {}
  for (const m of matches ?? []) {
    const all = [...(m.home_goal_scorers ?? []), ...(m.away_goal_scorers ?? [])]
    for (const s of all) {
      scorerCounts[s] = (scorerCounts[s] ?? 0) + 1
    }
  }

  return Object.entries(scorerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, goals]) => ({ name, goals }))
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: dbUser } = await supabase.from('users').select('name, is_admin').eq('id', user?.id).single()

  const [leaderboard, topScorers] = await Promise.all([
    getLeaderboard(supabase),
    getTopScorers(supabase),
  ])

  return (
    <div className="min-h-screen bg-surface-900">
      <NavBar userName={dbUser?.name} isAdmin={dbUser?.is_admin} />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Poängtabell</h1>
          <p className="text-gray-400 text-sm mt-1">
            Visar poäng för alla bekräftade deltagare
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Leaderboard */}
          <div className="lg:col-span-2">
            {leaderboard.length === 0 ? (
              <div className="card text-center py-12 space-y-3">
                <p className="text-3xl">🏆</p>
                <p className="text-gray-300 font-semibold">Inga resultat ännu</p>
                <p className="text-gray-500 text-sm">
                  Tabellen visas när matcher spelats och betalningar bekräftats.
                </p>
              </div>
            ) : (
              <div className="card p-0 overflow-hidden">
                <div className="px-5 py-4 border-b border-surface-700">
                  <h2 className="font-semibold">Deltagare</h2>
                </div>
                <div className="divide-y divide-surface-700">
                  {leaderboard.map(entry => (
                    <Link
                      key={entry.user_id}
                      href={`/dashboard/${entry.user_id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-surface-700/50 transition-colors"
                    >
                      <div className={`w-8 text-center font-bold text-sm ${
                        entry.rank === 1 ? 'text-yellow-400' :
                        entry.rank === 2 ? 'text-gray-300' :
                        entry.rank === 3 ? 'text-yellow-700' : 'text-gray-600'
                      }`}>
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-100 truncate">{entry.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-pitch-400">{entry.total_points}</div>
                        <div className="text-xs text-gray-600">poäng</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: top scorers */}
          <div className="space-y-4">
            <div className="card">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <span>👟</span> Skytteligatopplista
              </h2>
              {topScorers.length === 0 ? (
                <p className="text-sm text-gray-500">Inga mål registrerade ännu.</p>
              ) : (
                <div className="space-y-2">
                  {topScorers.map(({ name, goals }, i) => (
                    <div key={name} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-4 text-right">{i + 1}</span>
                      <span className="flex-1 text-sm text-gray-200 truncate">{name}</span>
                      <span className="text-sm font-bold text-pitch-400">{goals}</span>
                      <span className="text-xs text-gray-600">mål</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My status */}
            {user && (
              <MyStatus userId={user.id} supabase={supabase} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

async function MyStatus({ userId, supabase }: { userId: string; supabase: ReturnType<typeof createClient> }) {
  const { data: status } = await supabase
    .from('submission_status')
    .select('submitted, confirmed')
    .eq('user_id', userId)
    .single()

  if (!status?.submitted) {
    return (
      <div className="card border-yellow-800 bg-yellow-900/10">
        <p className="text-sm font-semibold text-yellow-300 mb-1">Inte inskickad</p>
        <p className="text-xs text-yellow-200/70 mb-3">Du har inte skickat in dina tips än.</p>
        <Link href="/onboarding/group-stage" className="btn-primary text-xs py-2">
          Gå till tips →
        </Link>
      </div>
    )
  }

  if (!status.confirmed) {
    return (
      <div className="card border-surface-600">
        <p className="text-sm font-semibold text-gray-300 mb-1">⏳ Väntar på bekräftelse</p>
        <p className="text-xs text-gray-500">
          Dina tips är inskickade. Erik bekräftar din betalning inom kort.
        </p>
      </div>
    )
  }

  return (
    <div className="card border-pitch-800 bg-pitch-900/20">
      <p className="text-sm font-semibold text-pitch-300 mb-1">✓ Bekräftad</p>
      <p className="text-xs text-gray-500">Du är med i tävlingen!</p>
    </div>
  )
}

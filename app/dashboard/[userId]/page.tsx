import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PHASE_LABELS } from '@/lib/types'

export const dynamic = 'force-dynamic'
import type { Phase } from '@/lib/types'

interface Props {
  params: { userId: string }
}

export default async function UserProfilePage({ params }: Props) {
  const supabase = createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const { data: currentDbUser } = await supabase
    .from('users')
    .select('name, is_admin')
    .eq('id', currentUser?.id)
    .single()

  const { data: profileUser } = await supabase
    .from('users')
    .select('id, name, created_at')
    .eq('id', params.userId)
    .single()

  if (!profileUser) notFound()

  // Check if confirmed
  const { data: status } = await supabase
    .from('submission_status')
    .select('confirmed')
    .eq('user_id', params.userId)
    .single()

  if (!status?.confirmed && currentUser?.id !== params.userId) {
    return (
      <div className="min-h-screen bg-surface-900">
        <NavBar userName={currentDbUser?.name} isAdmin={currentDbUser?.is_admin} />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center space-y-3">
          <p className="text-4xl">🔒</p>
          <p className="text-xl font-semibold text-gray-300">Tips ej synliga</p>
          <p className="text-gray-500 text-sm">
            Tips visas först när betalning bekräftats av Erik.
          </p>
          <Link href="/dashboard" className="btn-secondary inline-flex">← Tillbaka</Link>
        </main>
      </div>
    )
  }

  // Fetch picks with match data
  const { data: picks } = await supabase
    .from('picks')
    .select('*, matches(*)')
    .eq('user_id', params.userId)
    .order('match_id')

  // Fetch bracket picks
  const { data: bracketPicks } = await supabase
    .from('bracket_picks')
    .select('match_id, pick_team')
    .eq('user_id', params.userId)

  // Fetch top scorer picks
  const { data: scorerPicks } = await supabase
    .from('top_scorer_picks')
    .select('scope, player_name')
    .eq('user_id', params.userId)

  // Fetch third place picks
  const { data: thirdPicks } = await supabase
    .from('third_place_picks')
    .select('team, advances')
    .eq('user_id', params.userId)

  const groupPicks = (picks ?? []).filter((p: any) => p.matches?.phase === 'group')
  const knockoutPicks = (picks ?? []).filter((p: any) => p.matches?.phase !== 'group')
  const totalPoints = (picks ?? []).reduce((sum: number, p: any) => sum + (p.points ?? 0), 0)

  const phases: Phase[] = ['group', 'r32', 'r16', 'qf', 'sf', 'final']

  return (
    <div className="min-h-screen bg-surface-900">
      <NavBar userName={currentDbUser?.name} isAdmin={currentDbUser?.is_admin} />

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 rounded-full bg-pitch-900 border border-pitch-700 flex items-center justify-center text-2xl font-bold text-pitch-300">
            {(profileUser.name ?? 'U')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profileUser.name}</h1>
            <p className="text-sm text-gray-500">
              {totalPoints} poäng totalt
            </p>
          </div>
          <Link href="/dashboard" className="ml-auto btn-ghost text-xs">← Tabell</Link>
        </div>

        <div className="space-y-6">
          {/* Points summary */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Gruppspel" value={(groupPicks as any[]).reduce((s, p) => s + (p.points ?? 0), 0)} />
            <StatCard label="Slutspel" value={(knockoutPicks as any[]).reduce((s, p) => s + (p.points ?? 0), 0)} />
            <StatCard label="Totalt" value={totalPoints} highlight />
          </div>

          {/* Group stage picks by group */}
          {phases.map(phase => {
            const phasePicks = (picks ?? []).filter((p: any) => p.matches?.phase === phase)
            if (phasePicks.length === 0) return null

            return (
              <div key={phase}>
                <h2 className="text-base font-semibold text-gray-300 mb-3">{PHASE_LABELS[phase]}</h2>
                <div className="space-y-2">
                  {phasePicks.map((p: any) => {
                    const match = p.matches
                    const correct = p.points !== null && p.points > 0
                    const scored = p.points !== null
                    return (
                      <div key={p.id} className="card py-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-200 truncate">
                            {match?.home_team} vs {match?.away_team}
                          </div>
                          {match?.home_score !== null && (
                            <div className="text-xs text-gray-500">
                              {match.home_score} – {match.away_score}
                            </div>
                          )}
                        </div>
                        <span className={`badge ${
                          p.pick === '1' ? 'badge-green' :
                          p.pick === 'X' ? 'badge-yellow' :
                          'badge bg-blue-900/50 text-blue-400 border border-blue-800'
                        }`}>{p.pick}</span>
                        {scored && (
                          <span className={`text-sm font-bold ${correct ? 'text-pitch-400' : 'text-red-400'}`}>
                            {correct ? `+${p.points}` : '0'}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Bracket picks */}
          {(bracketPicks ?? []).length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-300 mb-3">Slutspelstips</h2>
              <div className="card p-0 overflow-hidden divide-y divide-surface-700">
                {(bracketPicks ?? []).map((bp: any) => (
                  <div key={bp.match_id} className="px-4 py-3 flex justify-between text-sm">
                    <span className="text-gray-500">Match {bp.match_id}</span>
                    <span className="text-gray-200 font-medium">{bp.pick_team}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Third place picks */}
          {(thirdPicks ?? []).length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-300 mb-3">Tredjeplacerade</h2>
              <div className="flex flex-wrap gap-2">
                {(thirdPicks ?? []).map((tp: any) => (
                  <span key={tp.team} className={tp.advances ? 'badge-green' : 'badge-gray'}>
                    {tp.team} {tp.advances ? '✓' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top scorer picks */}
          {(scorerPicks ?? []).length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-300 mb-3">Skytteligatips</h2>
              <div className="card p-0 overflow-hidden divide-y divide-surface-700">
                {(scorerPicks ?? []).map((sp: any) => (
                  <div key={sp.scope} className="px-4 py-3 flex justify-between text-sm">
                    <span className="text-gray-500">
                      {sp.scope === 'tournament' ? 'Turneringsskyttekung' : `Grupp ${sp.scope.replace('group_', '')}`}
                    </span>
                    <span className="text-gray-200 font-medium">{sp.player_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`card text-center py-4 ${highlight ? 'border-pitch-700 bg-pitch-900/20' : ''}`}>
      <div className={`text-2xl font-bold ${highlight ? 'text-pitch-400' : 'text-gray-200'}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}

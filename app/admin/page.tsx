import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import { redirect } from 'next/navigation'
import AdminConfirmButton from './AdminConfirmButton'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: dbUser } = await supabase
    .from('users')
    .select('name, is_admin')
    .eq('id', user?.id)
    .single()

  if (!dbUser?.is_admin) redirect('/dashboard')

  // Fetch all submissions
  const { data: submissions } = await supabase
    .from('submission_status')
    .select('user_id, submitted, confirmed, confirmed_at')
    .eq('submitted', true)
    .order('confirmed', { ascending: true })

  const userIds = (submissions ?? []).map(s => s.user_id)
  const { data: users } = await supabase
    .from('users')
    .select('id, name, email, created_at')
    .in('id', userIds)

  const userMap = Object.fromEntries((users ?? []).map(u => [u.id, u]))

  return (
    <div className="min-h-screen bg-surface-900">
      <NavBar userName={dbUser?.name} isAdmin={true} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="text-gray-400 text-sm mt-1">
            {(submissions ?? []).length} inskickade tips ·{' '}
            {(submissions ?? []).filter(s => s.confirmed).length} bekräftade
          </p>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-700 grid grid-cols-4 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span>Namn</span>
            <span>E-post</span>
            <span>Inskickad</span>
            <span className="text-right">Status</span>
          </div>

          {(submissions ?? []).length === 0 ? (
            <div className="px-5 py-12 text-center text-gray-500 text-sm">
              Inga tips inskickade ännu.
            </div>
          ) : (
            <div className="divide-y divide-surface-700">
              {(submissions ?? []).map(sub => {
                const u = userMap[sub.user_id]
                return (
                  <div key={sub.user_id} className="px-5 py-4 grid grid-cols-4 gap-4 items-center">
                    <div className="text-sm font-medium text-gray-200 truncate">
                      {u?.name ?? '—'}
                    </div>
                    <div className="text-sm text-gray-400 truncate">{u?.email ?? '—'}</div>
                    <div className="text-xs text-gray-500">
                      {u?.created_at
                        ? new Date(u.created_at).toLocaleDateString('sv-SE')
                        : '—'}
                    </div>
                    <div className="flex justify-end">
                      {sub.confirmed ? (
                        <span className="badge-green">✓ Bekräftad</span>
                      ) : (
                        <AdminConfirmButton userId={sub.user_id} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

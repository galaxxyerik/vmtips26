import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import { redirect } from 'next/navigation'
import AdminConfirmButton from './AdminConfirmButton'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'eeengstrand@gmail.com'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/')

  const service = createServiceClient()

  const { data: submissions } = await service
    .from('vmt_submissions')
    .select('id, name, email, submitted_at, confirmed, total_points, user_id')
    .order('submitted_at', { ascending: false })

  const total = submissions?.length ?? 0
  const confirmed = submissions?.filter(s => s.confirmed).length ?? 0

  return (
    <div className="min-h-screen bg-surface-900">
      <NavBar userName={user.email} isAdmin />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} inskickade · {confirmed} bekräftade · {total - confirmed} väntar
          </p>
        </div>

        <div className="border border-surface-600">
          <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-2 bg-surface-800 border-b border-surface-600 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span>Namn</span>
            <span>E-post</span>
            <span>Inskickad</span>
            <span className="text-right">Status</span>
          </div>

          {total === 0 ? (
            <div className="px-4 py-12 text-center text-gray-600 text-sm">
              Inga tips inskickade ännu.
            </div>
          ) : (
            <div className="divide-y divide-surface-700">
              {(submissions ?? []).map(sub => (
                <div key={sub.id} className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-3 items-center">
                  <span className="text-sm font-medium text-gray-200 truncate">{sub.name}</span>
                  <span className="text-sm text-gray-500 truncate">{sub.email}</span>
                  <span className="text-xs text-gray-600">
                    {sub.submitted_at
                      ? new Date(sub.submitted_at).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </span>
                  <div className="flex justify-end">
                    {sub.confirmed ? (
                      <span className="text-xs text-pitch-400 font-bold">✓ Bekräftad</span>
                    ) : (
                      <AdminConfirmButton submissionId={sub.id} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ userId: string }>
}

export default async function UserProfilePage({ params }: Props) {
  const { userId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: submission } = await supabase
    .from('vmt_submissions')
    .select('id, name, total_points, confirmed, submitted_at')
    .eq('id', userId)
    .single()

  if (!submission) notFound()

  const isOwn = user && submission && true // simplified — expand later

  return (
    <div className="min-h-screen bg-surface-900">
      <NavBar userName={user?.email ?? null} />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{submission.name}</h1>
          {submission.confirmed ? (
            <p className="text-yellow-400 font-bold text-lg mt-1">{submission.total_points ?? 0} poäng</p>
          ) : (
            <p className="text-gray-500 text-sm mt-1">⏳ Väntar på bekräftelse</p>
          )}
        </div>

        {!submission.confirmed && (
          <div className="border border-surface-600 px-4 py-8 text-center text-gray-500 text-sm">
            Tips och poäng visas när betalningen är bekräftad.
          </div>
        )}
      </main>
    </div>
  )
}

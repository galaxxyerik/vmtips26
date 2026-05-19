import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import { notFound } from 'next/navigation'
import { canEditPicks } from '@/lib/deadlines'
import MyTipDetails from './MyTipDetails'

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
    .select('id, name, total_points, confirmed, submitted_at, user_id')
    .eq('id', userId)
    .single()

  if (!submission) notFound()

  const isOwn = !!user && user.id === submission.user_id
  const editable = isOwn && canEditPicks()

  return (
    <div className="min-h-screen bg-navy-950">
      <NavBar userName={user?.email ?? null} />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <div className="label mb-1">Deltagare</div>
          <h1 className="font-display font-black text-2xl uppercase tracking-wide text-white">
            {submission.name}
            {isOwn && <span className="ml-3 text-sm text-swe-yellow font-normal normal-case">(ditt tips)</span>}
          </h1>
          {submission.confirmed ? (
            <div className="font-display font-black text-4xl text-swe-yellow mt-2 tnum">
              {submission.total_points ?? 0}
              <span className="text-base text-swe-yellow/50 ml-1 font-normal">poäng</span>
            </div>
          ) : (
            <p className="text-white/40 text-sm mt-2">⏳ Väntar på betalningsbekräftelse</p>
          )}
          {editable && (
            <p className="text-white/35 text-sm mt-2">
              Ditt tips är fortfarande öppet för ändringar fram till 11 juni kl 17:00.
            </p>
          )}
        </div>

        {isOwn ? (
          <MyTipDetails />
        ) : !submission.confirmed ? (
          <div className="border border-white/10 px-4 py-8 text-center text-white/30 text-sm">
            Tips och poäng visas när betalningen är bekräftad.
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}

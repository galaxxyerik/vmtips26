import { redirect } from 'next/navigation'
import { canEditPicks, hasPostDeadlineEditException } from '@/lib/deadlines'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ADMIN_EMAIL } from '@/lib/admin-email'

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // After the deadline the whole onboarding flow is closed — except for the
  // admin (who can still fix picks via the deadline bypass in submit-picks) and
  // for users granted a one-off post-deadline edit exception (redoing slutspel
  // picks lost in the May 28 incident). Exception users are routed to the bracket
  // step; the group-stage page itself bounces them onward (it's locked for them).
  if (!canEditPicks()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email === ADMIN_EMAIL) return <>{children}</>

    if (user) {
      const service = createServiceClient()
      const { data: sub } = await service
        .from('vmt_submissions')
        .select('name')
        .eq('user_id', user.id)
        .maybeSingle()
      if (hasPostDeadlineEditException(sub?.name)) return <>{children}</>
    }

    redirect('/')
  }
  return <>{children}</>
}

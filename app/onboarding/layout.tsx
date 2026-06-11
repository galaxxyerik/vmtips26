import { redirect } from 'next/navigation'
import { canEditPicks } from '@/lib/deadlines'
import { createClient } from '@/lib/supabase/server'
import { ADMIN_EMAIL } from '@/lib/admin-email'

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // After the deadline the whole onboarding flow is closed — except for the
  // admin, who can still fix picks via the deadline bypass in submit-picks.
  if (!canEditPicks()) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email !== ADMIN_EMAIL) redirect('/')
  }
  return <>{children}</>
}

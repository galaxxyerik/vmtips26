import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LandingPage from '@/components/LandingPage'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: status } = await supabase
      .from('submission_status')
      .select('submitted')
      .eq('user_id', user.id)
      .single()

    if (status?.submitted) redirect('/dashboard')
    else redirect('/onboarding/group-stage')
  }

  return <LandingPage />
}

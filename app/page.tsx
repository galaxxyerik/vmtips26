import { createClient } from '@/lib/supabase/server'
import LandingPage from '@/components/LandingPage'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If logged in, check if they have a submission
  if (user) {
    const { data: submission } = await supabase
      .from('vmt_submissions')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (submission) {
      const { redirect } = await import('next/navigation')
      redirect('/dashboard')
    }
  }

  return <LandingPage />
}

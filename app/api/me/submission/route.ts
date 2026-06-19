import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveMySubmission } from '@/lib/resolve-submission'

export const dynamic = 'force-dynamic'

// Tells the navbar which submission belongs to the logged-in user so it can
// show the "Mitt tips" link. Goes through the service role (and self-heals an
// unlinked submission by email) because the client can't read the email column
// and an anonymously submitted tip may not have user_id set yet.
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ submissionId: null })

  const service = createServiceClient()
  const submission = await resolveMySubmission<{ id: string }>(service, user, 'id')

  return NextResponse.json({ submissionId: submission?.id ?? null })
}

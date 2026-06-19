import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { resolveMySubmission } from '@/lib/resolve-submission'
import { canEditPicks, hasPostDeadlineEditException, POST_DEADLINE_EDIT_START_STEP } from '@/lib/deadlines'

export const dynamic = 'force-dynamic'

// Lightweight status used by the "Fortsätt ditt tips" prompt and the dashboard
// edit affordances. Tells the client whether the logged-in user still has an
// open path to edit their tip after the deadline (post-deadline exception).
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ eligible: false })

  const service = createServiceClient()
  const submission = await resolveMySubmission<{ id: string; name: string | null }>(service, user, 'id, name')

  if (!submission) return NextResponse.json({ eligible: false })

  // Only surface the prompt as a post-deadline exception — before the deadline
  // the normal "Fortsätt tippa" affordances already cover everyone.
  const exception = !canEditPicks() && hasPostDeadlineEditException(submission.name)
  const firstName = (submission.name ?? '').trim().split(/\s+/)[0] || null

  return NextResponse.json({
    eligible: exception,
    firstName,
    name: submission.name ?? null,
    submissionId: submission.id,
    startStep: POST_DEADLINE_EDIT_START_STEP,
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

// Returns whether a submission exists for the given email.
// Used by the landing page to detect returning users who should log in instead of re-tippa.
export async function GET(req: NextRequest) {
  const email = normalizeEmail(req.nextUrl.searchParams.get('email'))
  if (!email) return NextResponse.json({ hasSubmission: false })

  const service = createServiceClient()
  const { data } = await service
    .from('vmt_submissions')
    .select('id')
    .ilike('email', email)
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ hasSubmission: !!data })
}

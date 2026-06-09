import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

// GET: fetch draft by email.
// Anonymous users allowed (cross-device resume before login).
// Authenticated users may only fetch their own email's draft.
export async function GET(req: NextRequest) {
  const email = normalizeEmail(req.nextUrl.searchParams.get('email'))
  if (!email) return NextResponse.json({ error: 'email krävs' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user && normalizeEmail(user.email) !== email) {
    return NextResponse.json({ error: 'Ej behörig' }, { status: 403 })
  }

  try {
    const service = createServiceClient()
    const { data, error } = await service
      .from('vmt_drafts')
      .select('draft')
      .eq('email', email)
      .maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ draft: null }, { status: 404 })
    return NextResponse.json({ draft: data.draft })
  } catch {
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}

// POST: save draft.
// Anonymous users allowed (onboarding starts before auth).
// Authenticated users may only save to their own email.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = normalizeEmail(body.email)
    if (!email || !body.draft) return NextResponse.json({ error: 'email och draft krävs' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user && normalizeEmail(user.email) !== email) {
      return NextResponse.json({ error: 'Ej behörig' }, { status: 403 })
    }

    const service = createServiceClient()

    // Guard against clobbering: never overwrite a draft that has real picks with
    // one that has none (e.g. a fresh device posting an empty draft for an email
    // that already has a server draft). No-op instead of error — callers are
    // fire-and-forget.
    const incomingPickCount = Object.keys((body.draft as { matchPicks?: Record<string, string> })?.matchPicks ?? {}).length
    if (incomingPickCount === 0) {
      const { data: existing } = await service
        .from('vmt_drafts')
        .select('draft')
        .eq('email', email)
        .maybeSingle()
      const existingPickCount = Object.keys((existing?.draft as { matchPicks?: Record<string, string> })?.matchPicks ?? {}).length
      if (existing && existingPickCount > 0) {
        return NextResponse.json({ ok: true, skipped: true })
      }
    }

    const { error } = await service
      .from('vmt_drafts')
      .upsert({ email, draft: body.draft, updated_at: new Date().toISOString() }, { onConflict: 'email' })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}

// DELETE: clear draft after submission.
// Requires authentication — no reason to delete a draft without being logged in.
// Authenticated user's email must match the requested email.
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Inloggning krävs' }, { status: 401 })

    const body = await req.json()
    const email = normalizeEmail(body.email)
    if (!email) return NextResponse.json({ error: 'email krävs' }, { status: 400 })
    if (normalizeEmail(user.email) !== email) {
      return NextResponse.json({ error: 'Ej behörig' }, { status: 403 })
    }

    const service = createServiceClient()
    await service.from('vmt_drafts').delete().eq('email', email)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}

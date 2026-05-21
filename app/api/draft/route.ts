import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

function normalizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export async function GET(req: NextRequest) {
  const email = normalizeEmail(req.nextUrl.searchParams.get('email'))
  if (!email) return NextResponse.json({ error: 'email krävs' }, { status: 400 })
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = normalizeEmail(body.email)
    if (!email || !body.draft) return NextResponse.json({ error: 'email och draft krävs' }, { status: 400 })
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('vmt_drafts')
      .upsert({ email, draft: body.draft, updated_at: new Date().toISOString() }, { onConflict: 'email' })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const email = normalizeEmail(body.email)
    if (!email) return NextResponse.json({ error: 'email krävs' }, { status: 400 })
    const supabase = createServiceClient()
    await supabase.from('vmt_drafts').delete().eq('email', email)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { GROUPS } from '@/lib/types'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'eeengstrand@gmail.com'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const groupScorers = body.groupScorers as Record<string, string> | undefined
  const tournamentScorer = typeof body.tournamentScorer === 'string' ? body.tournamentScorer : ''

  const rows = [
    {
      key: 'scoring.tournament_scorer',
      value: tournamentScorer.trim(),
      updated_at: new Date().toISOString(),
    },
    ...GROUPS.map(group => ({
      key: `scoring.group_scorer.${group}`,
      value: groupScorers?.[group]?.trim() ?? '',
      updated_at: new Date().toISOString(),
    })),
  ]

  const service = createServiceClient()
  const { error } = await service
    .from('vmt_page_content')
    .upsert(rows, { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

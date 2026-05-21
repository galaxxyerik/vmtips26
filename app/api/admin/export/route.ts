import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.response

  const service = createServiceClient()

  const [
    { data: submissions },
    { data: scorerPicks },
    { data: finalPicks },
  ] = await Promise.all([
    service
      .from('vmt_submissions')
      .select('id, name, email, submitted_at, confirmed, total_points, admin_locked, admin_note')
      .order('total_points', { ascending: false }),
    service.from('vmt_tournament_scorer_pick').select('submission_id, player_name'),
    service.from('vmt_bracket_picks').select('submission_id, pick_team').eq('match_number', 104),
  ])

  const scorerMap = Object.fromEntries((scorerPicks ?? []).map(p => [p.submission_id, p.player_name]))
  const championMap = Object.fromEntries((finalPicks ?? []).map(p => [p.submission_id, p.pick_team]))

  const rows = (submissions ?? []).map((s, i) => [
    i + 1,
    s.name,
    s.email,
    s.confirmed ? 'Bekräftad' : 'Väntar',
    s.total_points ?? 0,
    scorerMap[s.id] ?? '',
    championMap[s.id] ?? '',
    s.submitted_at ? new Date(s.submitted_at).toLocaleString('sv-SE') : '',
    s.admin_locked ? 'Låst' : '',
    s.admin_note ?? '',
  ])

  const header = ['Plats','Namn','E-post','Status','Poäng','Skyttekung','VM-vinnare','Inskickad','Låst','Admin-anteckning']
  const csv = [header, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="vmtips26-export-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  })
}

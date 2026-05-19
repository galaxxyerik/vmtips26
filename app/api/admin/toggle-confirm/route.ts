import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendMail } from '@/lib/server-mail'

const ADMIN_EMAIL = 'eeengstrand@gmail.com'
const SITE_URL = 'https://vmtips26.vercel.app'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { submissionId, confirmed } = await req.json()
  if (!submissionId) return NextResponse.json({ error: 'Missing submissionId' }, { status: 400 })

  const service = createServiceClient()
  const { data: submission } = await service
    .from('vmt_submissions')
    .select('id, name, email, user_id')
    .eq('id', submissionId)
    .maybeSingle()

  const { error } = await service
    .from('vmt_submissions')
    .update({ confirmed })
    .eq('id', submissionId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (confirmed && submission?.email) {
    const [
      { data: championPick },
      { data: scorerPick },
    ] = await Promise.all([
      service
        .from('vmt_bracket_picks')
        .select('pick_team')
        .eq('submission_id', submissionId)
        .eq('match_number', 104)
        .maybeSingle(),
      service
        .from('vmt_tournament_scorer_pick')
        .select('player_name')
        .eq('submission_id', submissionId)
        .maybeSingle(),
    ])

    const firstName = getFirstName(submission.name)
    const champion = championPick?.pick_team ?? 'ditt vinnarlag'
    const tournamentScorer = scorerPick?.player_name ?? 'din skyttekung'
    const myTipUrl = submission.user_id ? `${SITE_URL}/dashboard/${submission.id}` : null

    try {
      await sendMail({
        to: submission.email,
        subject: 'Ditt VM-tips är bekräftat',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;line-height:1.5">
            <p>Hej igen ${escapeHtml(firstName)}!</p>
            <p>Ditt tips till VM-tipset 2026 har nu registrerats i systemet. Vi håller tummarna för att ${escapeHtml(champion)} går långt och att ${escapeHtml(tournamentScorer)} gör riktigt många mål.</p>
            <div style="border:1px solid #e5e7eb;padding:14px;margin:18px 0">
              <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Dina picks</div>
              <table style="width:100%;border-collapse:collapse;font-size:14px">
                <tr><td style="padding:6px 0;color:#6b7280">Vinnare</td><td style="padding:6px 0;text-align:right;font-weight:700">${escapeHtml(champion)}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280">Skyttekung</td><td style="padding:6px 0;text-align:right;font-weight:700">${escapeHtml(tournamentScorer)}</td></tr>
              </table>
            </div>
            <p>Under VM kommer du att kunna följa både din och andras poängutveckling i en spännande livetabell. Så länge kan du passa på att läsa lite på VM-bibeln.</p>
            <p>
              ${myTipUrl ? `<a href="${myTipUrl}" style="display:inline-block;background:#ffd84d;color:#07111f;text-decoration:none;font-weight:700;padding:10px 14px;margin:0 8px 8px 0">Mitt tips</a>` : ''}
              <a href="${SITE_URL}/worldcup-guide" style="display:inline-block;border:1px solid #07111f;color:#07111f;text-decoration:none;font-weight:700;padding:9px 13px;margin:0 8px 8px 0">VM-bibeln väntar</a>
              <a href="${SITE_URL}/" style="display:inline-block;color:#07111f;text-decoration:underline;font-weight:700;padding:10px 0">Till hemsidan</a>
            </p>
            <p>Lycka till i tipset!</p>
            <p>Hälsar<br/>Erik Engstrand</p>
            <p style="font-size:12px;color:#6b7280">OBS! Detta mail är automatiserat och genererat av AI.</p>
          </div>
        `,
      })
    } catch (mailError) {
      console.error('Confirmation email error:', mailError)
    }
  }

  return NextResponse.json({ ok: true })
}

function getFirstName(name: string | null): string {
  const trimmed = name?.trim()
  return trimmed ? trimmed.split(/\s+/)[0] : 'där'
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

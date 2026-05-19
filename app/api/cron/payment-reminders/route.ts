import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendMail } from '@/lib/server-mail'

const SITE_URL = 'https://vmtips26.vercel.app'

type Submission = {
  id: string
  name: string
  email: string
  user_id: string | null
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceClient()

  const { data: submissions, error } = await service
    .from('vmt_submissions')
    .select('id, name, email, user_id')
    .eq('confirmed', false)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let sent = 0
  let skipped = 0
  const failed: { id: string; error: string }[] = []

  for (const submission of (submissions ?? []) as Submission[]) {
    const { data: existing } = await service
      .from('vmt_notifications')
      .select('id')
      .eq('type', 'payment_reminder_sent')
      .contains('payload', { submission_id: submission.id })
      .maybeSingle()

    if (existing) {
      skipped++
      continue
    }

    const myTipUrl = submission.user_id ? `${SITE_URL}/dashboard/${submission.id}` : null

    try {
      await sendMail({
        to: submission.email,
        subject: 'Påminnelse: swisha för VM-tipset 2026',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;line-height:1.5">
            <p>Hej ${escapeHtml(getFirstName(submission.name))}!</p>
            <p>En liten påminnelse: deadline för VM-tipset närmar sig och ditt tips väntar fortfarande på betalningsbekräftelse.</p>
            <p>Swisha 100 kr till Erik Engstrand på <strong>0768919007</strong> så är du med när betalningen har bekräftats.</p>
            <p>
              ${myTipUrl ? `<a href="${myTipUrl}" style="display:inline-block;background:#ffd84d;color:#07111f;text-decoration:none;font-weight:700;padding:10px 14px;margin:0 8px 8px 0">Mitt tips</a>` : ''}
              <a href="${SITE_URL}/worldcup-guide" style="display:inline-block;border:1px solid #07111f;color:#07111f;text-decoration:none;font-weight:700;padding:9px 13px;margin:0 8px 8px 0">Ladda upp med VM-bibeln</a>
            </p>
            <p>Hälsar<br/>Erik Engstrand</p>
            <p style="font-size:12px;color:#6b7280">OBS! Detta mail är automatiserat och genererat av AI.</p>
          </div>
        `,
      })

      await service.from('vmt_notifications').insert({
        type: 'payment_reminder_sent',
        payload: {
          submission_id: submission.id,
          email: submission.email,
          sent_at: new Date().toISOString(),
        },
        sent: true,
      })

      sent++
    } catch (err) {
      failed.push({ id: submission.id, error: String(err) })
    }
  }

  return NextResponse.json({ ok: failed.length === 0, sent, skipped, failed })
}

function getFirstName(name: string): string {
  const trimmed = name.trim()
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

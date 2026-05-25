import { NextResponse } from 'next/server'
import { sendMail } from '@/lib/server-mail'
import { ADMIN_EMAIL } from '@/lib/admin-email'

export async function POST() {
  const to = ADMIN_EMAIL
  const from = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? 'okänd avsändare'

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return NextResponse.json({
      error: 'Missing SMTP_USER or SMTP_PASS. Lägg in Gmail SMTP-uppgifterna i Environment Variables för den deployade appen.',
    }, { status: 500 })
  }

  try {
    await sendMail({
      to,
      subject: 'VM-tips 26 testmail',
      html: '<p>Det här är ett <strong>testmail från VM-tips 26 via Gmail</strong>.</p>',
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    message: `Testmail skickat till ${to} från ${from}.`,
  })
}

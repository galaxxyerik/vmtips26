import { NextResponse } from 'next/server'

const RESEND_API_URL = 'https://api.resend.com/emails'

export async function POST() {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.ADMIN_EMAIL ?? 'eeengstrand@gmail.com'

  if (!apiKey) {
    return NextResponse.json({
      error: 'Missing RESEND_API_KEY. Lägg in RESEND_API_KEY i Vercels Environment Variables för den deployade appen.',
    }, { status: 500 })
  }

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: [to],
      subject: 'Hello World',
      html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
    }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    return NextResponse.json({ error: errorText }, { status: 500 })
  }

  const data = await res.json()
  return NextResponse.json({ ok: true, data })
}

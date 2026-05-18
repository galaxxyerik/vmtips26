import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_URL = 'https://api.resend.com/emails'

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    return new Response(JSON.stringify({ error: 'Missing RESEND_API_KEY' }), { status: 500 })
  }

  let body: { to: string; name: string; email: string; submitted_at: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { to, name, email, submitted_at } = body
  const submittedDate = new Date(submitted_at).toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' })

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'VM-tips 26 <noreply@vmtips26.se>',
      to: [to],
      subject: `Nya tips inskickade: ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#16a34a;margin-bottom:4px">Nya tips inskickade 🎉</h2>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px">Namn</td>
              <td style="padding:8px 0;font-weight:600;font-size:14px">${name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px">E-post</td>
              <td style="padding:8px 0;font-size:14px">${email}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280;font-size:14px">Inskickad</td>
              <td style="padding:8px 0;font-size:14px">${submittedDate}</td>
            </tr>
          </table>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
          <p style="font-size:14px;color:#374151">
            Logga in på admin-sidan för att bekräfta betalning och aktivera användaren.
          </p>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    return new Response(JSON.stringify({ error: text }), { status: 500 })
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

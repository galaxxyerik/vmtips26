import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendMail } from '@/lib/server-mail'

const ADMIN_EMAIL = 'eeengstrand@gmail.com'

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
    .select('name, email')
    .eq('id', submissionId)
    .maybeSingle()

  const { error } = await service
    .from('vmt_submissions')
    .update({ confirmed })
    .eq('id', submissionId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (confirmed && submission?.email) {
    try {
      await sendMail({
        to: submission.email,
        subject: 'Ditt VM-tips är bekräftat',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="margin:0 0 12px">Ditt tips är nu bekräftat</h2>
            <p>Hej ${submission.name ?? 'där'}!</p>
            <p>Vi har nu bekräftat ditt tips i VM-tips 26.</p>
            <p>Du är med i tävlingen och ditt resultat kommer att synas när ställningarna uppdateras.</p>
          </div>
        `,
      })
    } catch (mailError) {
      console.error('Confirmation email error:', mailError)
    }
  }

  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { recalculateAllScores } from '@/lib/recalculate'
import { ADMIN_EMAIL } from '@/lib/admin-email'

async function isAllowed(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) return true
  if (process.env.NODE_ENV !== 'production') return true
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email === ADMIN_EMAIL
}

export async function POST(req: NextRequest) {
  if (!(await isAllowed(req))) {
    return NextResponse.json({ error: 'Obehörig' }, { status: 401 })
  }

  try {
    const result = await recalculateAllScores(createServiceClient())
    return NextResponse.json(result)
  } catch (err) {
    console.error('Recalculate error:', err)
    return NextResponse.json({ error: 'Kunde inte räkna om poäng' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return POST(req)
}

import { NextRequest, NextResponse } from 'next/server'
import { getDashboardLeaderboard } from '@/lib/leaderboard'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const previewParam = request.nextUrl.searchParams.get('preview')
  const preview = previewParam === 'pre' || previewParam === 'mid' ? previewParam : null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const data = await getDashboardLeaderboard(createServiceClient(), user?.id ?? null, new Date(), preview)

  return NextResponse.json(data)
}

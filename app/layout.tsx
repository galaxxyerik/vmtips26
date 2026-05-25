import type { Metadata } from 'next'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import { ContentProvider } from '@/contexts/AdminEditContext'
import AdminEditBar from '@/components/AdminEditBar'
import FloatingReturnToTips from '@/components/FloatingReturnToTips'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ADMIN_EMAIL } from '@/lib/admin-email'

export const metadata: Metadata = {
  title: 'VM-tips 26',
  description: 'Tippa VM 2026 med dina vänner',
  icons: { icon: '/favicon.ico' },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.email === ADMIN_EMAIL

  let content: Record<string, string> = {}
  try {
    const { data } = await supabase.from('vmt_page_content').select('key, value')
    if (data) content = Object.fromEntries(data.map(r => [r.key, r.value]))
  } catch {
    // Table may not exist yet — ignore
  }

  return (
    <html lang="sv" className="dark">
      <body className="min-h-screen bg-navy-950 text-gray-100">
        <ContentProvider initialContent={content} isAdmin={isAdmin}>
          {children}
          <FloatingReturnToTips />
          <AdminEditBar />
          <SpeedInsights />
        </ContentProvider>
      </body>
    </html>
  )
}

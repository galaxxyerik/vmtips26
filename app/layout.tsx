import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VM-tips 26',
  description: 'Tippa VM 2026 med dina vänner',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className="dark">
      <body className="min-h-screen bg-surface-900 text-gray-100">
        {children}
      </body>
    </html>
  )
}

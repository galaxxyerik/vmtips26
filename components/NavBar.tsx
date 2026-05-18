'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface NavBarProps {
  userName?: string | null
  isAdmin?: boolean
}

export default function NavBar({ userName, isAdmin }: NavBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const linkClass = (path: string) =>
    `px-2.5 py-1 text-xs font-medium transition-colors border ${
      pathname.startsWith(path)
        ? 'border-surface-500 text-white bg-surface-700'
        : 'border-transparent text-gray-400 hover:text-white'
    }`

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-700 bg-surface-900/95 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-bold text-white text-sm">
          VM<span className="text-yellow-400">-tips 26</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/worldcup-guide" className={linkClass('/worldcup-guide')}>VM-guide</Link>
          <Link href="/regler" className={linkClass('/regler')}>Regler</Link>
          <Link href="/dashboard" className={linkClass('/dashboard')}>Tabell</Link>
          {isAdmin && <Link href="/admin" className={linkClass('/admin')}>Admin</Link>}

          <div className="ml-2 flex items-center gap-2">
            {userName ? (
              <>
                <span className="text-xs text-gray-500 hidden sm:block">{userName}</span>
                <button onClick={handleSignOut}
                  className="px-2.5 py-1 text-xs border border-surface-600 text-gray-400 hover:text-white hover:border-surface-400 transition-colors">
                  Logga ut
                </button>
              </>
            ) : (
              <Link href="/login" className="px-2.5 py-1 text-xs border border-surface-600 text-gray-400 hover:text-white hover:border-surface-400 transition-colors">
                Logga in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

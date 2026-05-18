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

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-700 bg-surface-900/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <span className="text-xl">⚽</span>
          <span>VM<span className="text-gradient">-tips 26</span></span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              pathname.startsWith('/dashboard')
                ? 'bg-surface-700 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Tabell
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname.startsWith('/admin')
                  ? 'bg-surface-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Admin
            </Link>
          )}

          {/* User menu */}
          <div className="ml-2 flex items-center gap-2">
            {userName && (
              <span className="text-xs text-gray-500 hidden sm:block">{userName}</span>
            )}
            <button
              onClick={handleSignOut}
              className="rounded-lg bg-surface-700 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-surface-600 hover:text-white"
            >
              Logga ut
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

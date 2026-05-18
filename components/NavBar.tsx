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

  const navLink = (path: string, label: string) => {
    const active = pathname.startsWith(path)
    return (
      <Link
        href={path}
        className={`relative flex h-14 items-center px-3 text-xs font-display font-black uppercase tracking-[0.1em] transition-colors ${
          active ? 'text-white' : 'text-white/45 hover:text-white'
        }`}
      >
        {label}
        {active && (
          <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-swe-yellow" />
        )}
      </Link>
    )
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-navy-950">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Wordmark */}
        <Link href="/" className="font-display font-black text-white text-lg uppercase tracking-[0.06em]">
          VM<span className="text-swe-yellow">-TIPS 26</span>
        </Link>

        <div className="flex items-center">
          {navLink('/worldcup-guide', 'VM-guide')}
          {navLink('/regler', 'Regler')}
          {navLink('/dashboard', 'Tabell')}
          {isAdmin && navLink('/admin', 'Admin')}

          {userName && (
            <div className="ml-3 flex items-center gap-2">
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-xs font-display font-black uppercase tracking-[0.1em] border border-white/15 text-white/45 hover:text-white hover:border-white/30 transition-colors"
              >
                Logga ut
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

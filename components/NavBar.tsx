'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useContent } from '@/contexts/AdminEditContext'

interface NavBarProps {
  userName?: string | null
}

export default function NavBar({ userName }: NavBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])
  const { isAdmin } = useContent()
  const [resolvedUserName, setResolvedUserName] = useState<string | null>(userName ?? null)
  const [mySubmissionId, setMySubmissionId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function resolveUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!cancelled) setResolvedUserName(user?.email ?? userName ?? null)
      return user
    }

    async function loadMySubmission() {
      const user = await resolveUser()
      if (!user) {
        if (!cancelled) setMySubmissionId(null)
        return
      }

      const { data } = await supabase
        .from('vmt_submissions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!cancelled) setMySubmissionId(data?.id ?? null)
    }

    loadMySubmission()

    return () => {
      cancelled = true
    }
  }, [supabase, userName])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLink = (path: string, label: string) => {
    const active = path === '/dashboard' ? pathname === path : pathname.startsWith(path)
    return (
      <Link
        href={path}
        className={`relative flex h-14 shrink-0 items-center px-3 text-xs font-display font-black uppercase tracking-[0.1em] transition-colors ${
          active ? 'text-white' : 'text-white/45 hover:text-white'
        }`}
      >
        {label}
        {active && (
          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-swe-yellow" />
        )}
      </Link>
    )
  }

  return (
    <nav className="sticky top-0 z-50 bg-navy-950" style={{ borderTop: '2px solid #FFCD00', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 overflow-hidden px-4 lg:px-8">
        <Link href="/" className="shrink-0 whitespace-nowrap font-display font-black text-white text-base uppercase tracking-[0.04em] sm:text-xl sm:tracking-[0.06em]">
          VM<span className="text-swe-yellow">-TIPS 26</span>
        </Link>

        <div className="ml-auto flex min-w-0 items-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navLink('/dashboard', 'Tabell')}
          {mySubmissionId && navLink(`/dashboard/${mySubmissionId}`, 'Mitt tips')}
          {navLink('/worldcup-guide', 'VM-bibel')}
          {navLink('/regler', 'Regler')}
          {isAdmin && navLink('/admin', 'Admin')}
          {!resolvedUserName && (
            <Link
              href="/"
              className="ml-2 shrink-0 btn-primary h-8 px-4 text-xs"
            >
              Tippa nu →
            </Link>
          )}

          {resolvedUserName && (
            <div className="ml-3 shrink-0">
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

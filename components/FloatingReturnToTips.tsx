'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { hasDraft, getDraftStep, clearDraft } from '@/lib/onboarding-storage'
import { ONBOARDING_KEY } from '@/lib/types'

const STEP_PATHS: Record<string, string> = {
  'group-stage': '/onboarding/group-stage',
  'bracket': '/onboarding/bracket',
  'final-details': '/onboarding/final-details',
}

function draftHasEmail(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const d = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '{}') as Record<string, unknown>
    return typeof d.email === 'string' && d.email.length > 0
  } catch { return false }
}

export default function FloatingReturnToTips() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [show, setShow] = useState(false)
  const [tipPath, setTipPath] = useState('/onboarding/group-stage')

  useEffect(() => {
    if (!pathname || pathname === '/' || pathname.startsWith('/onboarding')) {
      setShow(false)
      return
    }

    if (!hasDraft() || !draftHasEmail()) {
      setShow(false)
      return
    }

    // Draft exists — check if user already has a submission in Supabase.
    // If so, the draft is stale: clear it and don't show the button.
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        const step = getDraftStep()
        setTipPath(STEP_PATHS[step] ?? '/onboarding/group-stage')
        setShow(true)
        return
      }

      supabase
        .from('vmt_submissions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.id) {
            // Already submitted — clear stale draft silently
            clearDraft()
            setShow(false)
          } else {
            const step = getDraftStep()
            setTipPath(STEP_PATHS[step] ?? '/onboarding/group-stage')
            setShow(true)
          }
        })
    })
  }, [pathname, supabase])

  if (!show) return null

  return (
    <button
      onClick={() => router.push(tipPath)}
      aria-label="Fortsätt tippa"
      className="fixed bottom-20 right-5 z-50 bg-swe-yellow text-navy-950 font-display font-black text-sm uppercase tracking-wide px-5 py-3.5 transition-colors hover:bg-white active:scale-95"
      style={{
        boxShadow: '0 0 24px rgba(255, 205, 0, 0.55), 0 0 8px rgba(255, 205, 0, 0.3), 0 6px 20px rgba(0,0,0,0.5)',
      }}
    >
      Fortsätt tippa! →
    </button>
  )
}

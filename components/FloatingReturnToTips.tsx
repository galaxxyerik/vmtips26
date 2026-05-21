'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { hasDraft, getDraftStep } from '@/lib/onboarding-storage'
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
  const [show, setShow] = useState(false)
  const [tipPath, setTipPath] = useState('/onboarding/group-stage')

  useEffect(() => {
    if (!pathname || pathname === '/' || pathname.startsWith('/onboarding')) {
      setShow(false)
      return
    }
    if (hasDraft() && draftHasEmail()) {
      const step = getDraftStep()
      setTipPath(STEP_PATHS[step] ?? '/onboarding/group-stage')
      setShow(true)
    } else {
      setShow(false)
    }
  }, [pathname])

  if (!show) return null

  return (
    <button
      onClick={() => router.push(tipPath)}
      aria-label="Fortsätt tipsa"
      className="fixed bottom-5 right-5 z-50 bg-swe-yellow text-navy-950 font-display font-black text-xs uppercase tracking-wide px-3 py-2.5 shadow-lg hover:bg-white transition-colors"
    >
      Tipset →
    </button>
  )
}

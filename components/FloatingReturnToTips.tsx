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
    // Hide only on the landing page (which has its own resume modal)
    if (!pathname || pathname === '/') {
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
      aria-label="Fortsätt tippa"
      className="fixed bottom-6 right-6 z-50 bg-swe-yellow text-navy-950 font-display font-black text-sm uppercase tracking-wide px-5 py-3.5 transition-colors hover:bg-white active:scale-95"
      style={{
        boxShadow: '0 0 24px rgba(255, 205, 0, 0.55), 0 0 8px rgba(255, 205, 0, 0.3), 0 6px 20px rgba(0,0,0,0.5)',
      }}
    >
      Fortsätt tippa! →
    </button>
  )
}

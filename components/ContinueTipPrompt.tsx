'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { restoreDraft } from '@/lib/onboarding-storage'
import type { OnboardingDraft } from '@/lib/types'

const DISMISS_KEY = 'vmt_continue_tip_dismissed'

interface EditStatus {
  eligible: boolean
  firstName?: string | null
}

// Shown to a logged-in user who holds a post-deadline edit exception (e.g. Max,
// whose slutspel picks were lost in the May 28 incident). Greets them by name and
// drops them straight into the bracket step with their existing picks preloaded.
export default function ContinueTipPrompt() {
  const router = useRouter()
  const pathname = usePathname()
  const [firstName, setFirstName] = useState<string | null>(null)
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Don't interrupt the onboarding/login flows themselves.
    if (!pathname || pathname.startsWith('/onboarding') || pathname.startsWith('/login')) {
      setShow(false)
      return
    }
    if (typeof window !== 'undefined' && sessionStorage.getItem(DISMISS_KEY) === '1') return

    let cancelled = false
    fetch('/api/me/edit-status')
      .then(res => (res.ok ? res.json() : null))
      .then((status: EditStatus | null) => {
        if (cancelled || !status?.eligible) return
        setFirstName(status.firstName ?? null)
        setShow(true)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [pathname])

  function dismiss() {
    try { sessionStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
    setShow(false)
  }

  async function handleContinue() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/me/submission-picks')
      if (!res.ok) throw new Error()
      const { draft } = (await res.json()) as { draft: OnboardingDraft }
      restoreDraft({ ...draft, step: 'bracket' })
    } catch {
      setBusy(false)
      setError('Kunde inte hämta ditt tips. Försök igen.')
      return
    }
    router.push('/onboarding/bracket')
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 px-4">
      <div className="w-full max-w-sm border border-white/15 bg-navy-900 p-6 space-y-4">
        <div className="label">Slutför ditt tips</div>
        <h2 className="font-display font-black text-white text-xl uppercase tracking-wide">
          Fortsätt ditt tips{firstName ? `, ${firstName}` : ''}!
        </h2>
        <p className="text-sm text-white/60 leading-snug">
          Dina slutspelsval försvann tyvärr i en bugg. Du kan göra om dem nu — ditt
          gruppspel ligger kvar, du fyller bara i slutspelet och skickar in igen.
        </p>
        {error && <p className="text-xs text-loss-500">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button onClick={handleContinue} disabled={busy} className="btn-primary flex-1 disabled:opacity-40">
            {busy ? 'Öppnar…' : 'Fortsätt →'}
          </button>
          <button onClick={dismiss} disabled={busy} className="btn-secondary flex-1">Inte nu</button>
        </div>
      </div>
    </div>
  )
}

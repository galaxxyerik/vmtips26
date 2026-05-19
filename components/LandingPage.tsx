'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { hasDraft, getDraftStep, getDraftTimestamp, clearDraft, loadDraft, saveDraft } from '@/lib/onboarding-storage'
import { ONBOARDING_KEY } from '@/lib/types'
import { useContent } from '@/contexts/AdminEditContext'
import { Editable } from '@/components/Editable'

const STEP_PATHS: Record<string, string> = {
  'group-stage': '/onboarding/group-stage',
  'bracket': '/onboarding/bracket',
  'final-details': '/onboarding/final-details',
}

function getStoredField(field: 'name' | 'email'): string {
  if (typeof window === 'undefined') return ''
  try { return (JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '{}') as Record<string, string>)[field] ?? '' }
  catch { return '' }
}

export default function LandingPage() {
  const router = useRouter()
  const { isAdmin } = useContent()
  const [name, setName] = useState<string>(() => getStoredField('name'))
  const [email, setEmail] = useState<string>(() => getStoredField('email'))
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [resumePath, setResumePath] = useState('/onboarding/group-stage')
  const [draftTime, setDraftTime] = useState<string | null>(null)

  function handleStart(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) { setError('Namn och e-post krävs.'); return }
    setError('')

    const d = loadDraft()
    d.name = name.trim()
    d.email = email.trim()
    saveDraft(d)

    if (hasDraft()) {
      const step = getDraftStep()
      setResumePath(STEP_PATHS[step] ?? '/onboarding/group-stage')
      setDraftTime(getDraftTimestamp())
      setShowModal(true)
    } else {
      router.push('/onboarding/group-stage')
    }
  }

  function handleResume() {
    setShowModal(false)
    router.push(resumePath)
  }

  function handleRestart() {
    const savedName = name.trim()
    const savedEmail = email.trim()
    clearDraft()
    const d = loadDraft()
    d.name = savedName
    d.email = savedEmail
    saveDraft(d)
    setShowModal(false)
    router.push('/onboarding/group-stage')
  }

  const canStart = name.trim().length > 0 && email.trim().length > 0

  return (
    <main className="relative min-h-screen bg-navy-950 text-white overflow-hidden">
      {/* Stadium background */}
      <Image
        src="/images/potm.avif"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover object-center z-0"
        priority
      />
      {/* Overlays — left-heavy gradient to darken bg behind content */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 via-navy-950/75 to-navy-950 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/60 to-transparent z-[1]" />

      {/* Resume modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div className="w-full max-w-sm border border-white/15 bg-navy-900 p-6 space-y-4">
            <div className="label">Påbörjat tips</div>
            <h2 className="font-display font-black text-white text-xl uppercase tracking-wide">
              Vill du fortsätta?
            </h2>
            {draftTime && (
              <p className="text-xs text-white/35 tnum">
                Senast ändrat: {new Date(draftTime).toLocaleString('sv-SE')}
              </p>
            )}
            <div className="flex gap-2 pt-1">
              <button onClick={handleResume} className="btn-primary flex-1">
                Fortsätt →
              </button>
              <button onClick={handleRestart} className="btn-secondary flex-1">
                Börja om
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 overflow-hidden px-4">
          <span className="shrink-0 whitespace-nowrap font-display font-black text-white text-base uppercase tracking-[0.04em] sm:text-lg sm:tracking-[0.06em]">
            VM<span className="text-swe-yellow">-TIPS 26</span>
          </span>
          <div className="ml-auto flex min-w-0 items-center gap-4 overflow-x-auto text-xs font-display font-black uppercase tracking-[0.1em] text-white/40 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link href="/dashboard" className="shrink-0 hover:text-white transition-colors">Tabell</Link>
            <Link href="/worldcup-guide" className="shrink-0 hover:text-white transition-colors">VM-bibel</Link>
            <Link href="/regler" className="shrink-0 hover:text-white transition-colors">Regler</Link>
            <Link href={isAdmin ? '/admin' : '/login'} className="shrink-0 hover:text-white transition-colors">{isAdmin ? 'Admin' : 'Logga in'}</Link>
          </div>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 px-6 sm:px-10 pt-12 sm:pt-16 max-w-2xl">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-8 bg-swe-yellow" />
          <Editable
            contentKey="landing.eyebrow"
            fallback="11 juni — 19 juli 2026 · USA / CAN / MEX"
            className="font-display font-black uppercase tracking-[0.22em] text-[10px] text-swe-yellow"
          />
        </div>

        {/* Giant headline */}
        <h1 className="font-display font-black uppercase leading-[0.82] tracking-[-0.02em] text-[clamp(72px,14vw,160px)]">
          <Editable contentKey="landing.hero.line1" fallback="HELA VM." /><br />
          <span className="text-swe-yellow">
            <Editable contentKey="landing.hero.line2" fallback="ETT TIPS." />
          </span>
        </h1>

        <Editable
          contentKey="landing.subtitle"
          fallback="48 matcher. 12 grupper. Ett slutspel. En insats. En vinnare. Alla andra köper öl."
          multiline
          as="p"
          className="mt-6 text-base sm:text-lg text-white/60 max-w-md leading-snug font-medium"
        />

        {/* Entry form */}
        <form onSubmit={handleStart} className="mt-8 space-y-2 max-w-sm">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ditt namn"
            autoComplete="name"
            className="input"
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Din e-post"
            autoComplete="email"
            className="input"
          />
          {error && <p className="text-xs text-loss-500">{error}</p>}
          <button type="submit" disabled={!canStart} className="btn-primary w-full text-base">
            Påbörja ditt tips →
          </button>
        </form>

        <Editable
          contentKey="landing.deadline"
          fallback="Insats: 100 kr · Deadline: 11 juni 2026"
          as="p"
          className="mt-4 text-xs text-white/20 tnum"
        />
      </div>

      {/* Bottom strap — Sverige info */}
      <div className="absolute bottom-0 inset-x-0 z-10">
        <div className="h-0.5 bg-gradient-to-r from-swe-yellow via-swe-blue to-swe-yellow opacity-60" />
        <div className="bg-navy-950/90 border-t border-white/10">
          <div className="px-6 h-14 flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2 shrink-0">
              <img src="/images/flag-se.svg" alt="Sveriges flagga" className="w-6 h-4 object-cover" />
              <span className="font-display font-black text-swe-yellow uppercase tracking-wider text-sm">SVERIGE</span>
              <span className="text-white/30">·</span>
              <span className="font-mono tnum text-white/50">Grupp F</span>
              <span className="text-white/20">·</span>
              {/* Group F opponent flags */}
              <img src="/images/flag-nl.svg" alt="Nederländernas flagga" className="w-5 h-3.5 object-cover opacity-50 hover:opacity-80 transition-opacity" title="Nederländerna" />
              <img src="/images/flag-jp.svg" alt="Japans flagga" className="w-5 h-3.5 object-cover opacity-50 hover:opacity-80 transition-opacity" title="Japan" />
              <img src="/images/flag-tn.svg" alt="Tunisiens flagga" className="w-5 h-3.5 object-cover opacity-50 hover:opacity-80 transition-opacity" title="Tunisien" />
            </div>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-5 text-white/35 font-display font-black uppercase tracking-wider text-xs">
              <Link href="/dashboard" className="hover:text-white transition-colors">Tabell</Link>
              <Link href="/worldcup-guide" className="hover:text-white transition-colors">VM-bibel</Link>
              <Link href="/regler" className="hover:text-white transition-colors">Regler</Link>
            </div>
            <div className="ml-auto font-mono text-[10px] tnum text-white/25 uppercase tracking-wider">100 kr · 1 vinnare</div>
          </div>
        </div>
      </div>
    </main>
  )
}

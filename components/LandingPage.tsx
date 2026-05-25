'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { hasDraft, getDraftStep, getDraftTimestamp, clearDraft, loadDraft, saveDraft, restoreDraft } from '@/lib/onboarding-storage'
import { ONBOARDING_KEY } from '@/lib/types'
import { Editable } from '@/components/Editable'
import NavBar from '@/components/NavBar'

const STEP_PATHS: Record<string, string> = {
  'group-stage': '/onboarding/group-stage',
  'bracket': '/onboarding/bracket',
  'final-details': '/onboarding/final-details',
}

interface LandingPageProps {
  userName?: string | null
}

function getStoredField(field: 'name' | 'email'): string {
  if (typeof window === 'undefined') return ''
  try { return (JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '{}') as Record<string, string>)[field] ?? '' }
  catch { return '' }
}

const EDITORIAL_STATEMENTS = [
  {
    claim: 'TIPPA HELA VM I ETT DRAG',
    support: 'Gruppspel, slutspel och skyttekung — ett sammanhållet tips.',
  },
  {
    claim: 'SWISHA 100 KR. KLART.',
    support: 'Betalning när du är redo. Du kan alltid komma tillbaka.',
  },
  {
    claim: 'FÖLJ TABELLEN LIVE UNDER VM',
    support: 'Se poängen ticka in match för match mot dina kompisar.',
  },
]

export default function LandingPage({ userName }: LandingPageProps) {
  const router = useRouter()
  const [name, setName] = useState<string>(() => getStoredField('name'))
  const [email, setEmail] = useState<string>(() => getStoredField('email'))
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [resumePath, setResumePath] = useState('/onboarding/group-stage')
  const [draftTime, setDraftTime] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  async function handleStart(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Read actual DOM values to handle browser autofill (autofill doesn't fire onChange)
    const form = e.currentTarget
    const nameVal = (form.elements.namedItem('entry-name') as HTMLInputElement)?.value?.trim() || name.trim()
    const emailVal = (form.elements.namedItem('entry-email') as HTMLInputElement)?.value?.trim() || email.trim()
    if (!nameVal || !emailVal) { setError('Namn och e-post krävs.'); return }
    if (nameVal !== name) setName(nameVal)
    if (emailVal !== email) setEmail(emailVal)
    setError('')
    setIsStarting(true)

    const normalizedEmail = emailVal.toLowerCase()
    const d = loadDraft()
    d.name = nameVal
    d.email = normalizedEmail
    saveDraft(d)

    const localHasPicks = Object.keys(d.matchPicks).length > 0

    if (!localHasPicks) {
      // No local picks — check server in case the user is on a new device
      try {
        const res = await fetch(`/api/draft?email=${encodeURIComponent(normalizedEmail)}`)
        if (res.ok) {
          const { draft: serverDraft } = await res.json() as { draft: import('@/lib/types').OnboardingDraft }
          if (serverDraft && Object.keys(serverDraft.matchPicks ?? {}).length > 0) {
            restoreDraft({ ...serverDraft, name: nameVal, email: normalizedEmail })
            const step = serverDraft.step ?? 'group-stage'
            setResumePath(STEP_PATHS[step] ?? '/onboarding/group-stage')
            setDraftTime(serverDraft.updatedAt ?? null)
            setIsStarting(false)
            setShowModal(true)
            return
          }
        }
      } catch { /* network error — fall through to normal flow */ }

      // No draft found — check if email already has a submitted tip.
      // If so, the user should log in to edit rather than starting from scratch.
      try {
        const res = await fetch(`/api/check-submission?email=${encodeURIComponent(normalizedEmail)}`)
        if (res.ok) {
          const { hasSubmission } = await res.json() as { hasSubmission: boolean }
          if (hasSubmission) {
            setIsStarting(false)
            setShowLoginPrompt(true)
            return
          }
        }
      } catch { /* network error — fall through */ }
    }

    setIsStarting(false)

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
      {/* Background photography */}
      <Image
        src="/images/sweden-poland-wc-qual-2.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover object-[62%_center] z-0"
        priority
      />
      {/* Vertical darkening — heavier at bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/50 via-navy-950/65 to-navy-950 z-[1]" />
      {/* Horizontal darkening — left side nearly opaque, fades right to reveal photography */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/55 to-transparent z-[1]" />

      {/* Already-submitted modal — shown when email has an existing submission but no active draft */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div className="w-full max-w-sm border border-white/15 bg-navy-900 p-6 space-y-4">
            <div className="label">Tips redan inlämnat</div>
            <h2 className="font-display font-black text-white text-xl uppercase tracking-wide">
              Du har redan ett tips
            </h2>
            <p className="text-sm text-white/60 leading-snug">
              Den här e-postadressen har redan ett inlämnat tips. Logga in för att se eller redigera det.
            </p>
            <div className="flex gap-2 pt-1">
              <a href="/login" className="btn-primary flex-1 text-center">Logga in →</a>
              <button onClick={() => setShowLoginPrompt(false)} className="btn-secondary flex-1">Stäng</button>
            </div>
          </div>
        </div>
      )}

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
              <button onClick={handleResume} className="btn-primary flex-1">Fortsätt →</button>
              <button onClick={handleRestart} className="btn-secondary flex-1">Börja om</button>
            </div>
          </div>
        </div>
      )}

      <NavBar userName={userName ?? null} />

      {/* Two-column hero layout */}
      <div className="relative z-10 lg:grid lg:grid-cols-2 lg:min-h-screen">

        {/* ── Left column: headline + form ─────────────────────────── */}
        <div className="px-6 sm:px-10 pt-12 sm:pt-16 pb-10 lg:pb-28 flex flex-col justify-start">

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
            className="mt-6 text-base sm:text-lg text-white/60 max-w-[420px] leading-snug font-medium"
          />

          {/* Entry form */}
          <form onSubmit={handleStart} className="mt-8 space-y-2 max-w-[420px]">
            <input
              name="entry-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ditt namn"
              autoComplete="name"
              className="input"
            />
            <input
              name="entry-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Din e-post"
              autoComplete="email"
              className="input"
            />
            {error && <p className="text-xs text-loss-500">{error}</p>}
            <button type="submit" disabled={isStarting} className="btn-primary w-full text-base">
              {isStarting ? 'Kollar...' : 'Påbörja ditt tips →'}
            </button>
            <p className="text-center text-sm mt-1">
              <a href="/login" className="text-white/50 hover:text-white/80 transition-colors">
                Redan anmäld? Logga in här →
              </a>
            </p>
            <p className="text-xs text-white/35 leading-relaxed">
              Börja nu och fyll klart senare. Om du kommer tillbaka med samma mejl ligger det du redan fyllt i kvar. Har du redan skickat in ditt tips kan du logga in och ändra det fram till VM-start den 11 juni.
            </p>
          </form>

          <Editable
            contentKey="landing.deadline"
            fallback="Insats: 100 kr · Deadline: 11 juni 2026"
            as="p"
            className="mt-4 text-xs text-white/20 tnum"
          />
        </div>

        {/* ── Right column: editorial statements ──────────────────── */}
        <div className="relative px-6 sm:px-10 lg:px-14 xl:px-20 pt-10 lg:pt-0 pb-28 flex flex-col justify-center">
          {/* Subtle dark wash behind type so it's legible against photography */}
          <div className="absolute inset-0 hidden lg:block pointer-events-none bg-gradient-to-r from-navy-950/30 via-black/20 to-transparent" />

          <div className="relative">
            {EDITORIAL_STATEMENTS.map((s, i) => (
              <div key={s.claim}>
                {i > 0 && <div className="border-t border-white/15" />}
                <div className="py-7 lg:py-9">
                  <p className="font-display font-black uppercase leading-[0.88] tracking-tight text-white text-[clamp(30px,3.2vw,48px)]">
                    {s.claim}
                  </p>
                  <p className="mt-2.5 text-sm text-white/60 leading-snug">
                    {s.support}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom strap */}
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

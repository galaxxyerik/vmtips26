'use client'

import { useState } from 'react'

const PHONE = '0768919007'
const SWISH_URL = `swish://payment?phone=${PHONE}&amount=100&message=VM-tips%2026&edit=0`

export default function SwishSection() {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(PHONE).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-4">
      {/* Mobile swish button */}
      <a
        href={SWISH_URL}
        className="btn-primary w-full sm:hidden justify-center text-base"
      >
        SWISHA 100 KR DIREKT →
      </a>

      {/* Desktop: number + copy button */}
      <div className="border border-swe-yellow/30 bg-swe-yellow/5 px-6 py-5">
        <div className="font-mono font-bold tnum text-3xl sm:text-4xl text-swe-yellow leading-none">
          100 KR
        </div>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <span className="font-display font-black text-lg text-white/70 uppercase tracking-wider">
            Erik Engstrand
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold tnum text-white/60 text-lg">{PHONE}</span>
            <button
              onClick={handleCopy}
              className="hidden sm:flex items-center gap-1 px-2 py-1 border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-colors text-xs font-display font-black uppercase tracking-wider"
              title="Kopiera nummer"
            >
              {copied ? '✓ Kopierat' : 'Kopiera'}
            </button>
          </div>
        </div>
      </div>

      <p className="text-white/40 text-xs leading-relaxed">
        Du är officiellt med i spelet när Erik bekräftat din betalning. Bekräftelse syns på din profilsida.
      </p>
    </div>
  )
}

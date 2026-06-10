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
    <div className="space-y-8">
      <div className="space-y-4">
        <a
          href={SWISH_URL}
          className="btn-primary w-full sm:hidden justify-center text-base"
        >
          SWISHA 100 KR DIREKT →
        </a>

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

      <div className="border-t border-white/10 pt-8">
        <div className="label mb-4">Prispott &amp; utbetalning</div>
        <p className="text-white/60 text-sm leading-relaxed mb-5">
          Den totala potten fördelas mellan topp tre när VM är färdigspelat.
        </p>
        <div className="border-t border-b border-white/10 divide-y divide-white/10">
          <PayoutRow place="1:a plats" share="70 %" example="3 500 kr" />
          <PayoutRow place="2:a plats" share="20 %" example="1 000 kr" />
          <PayoutRow place="3:e plats" share="10 %" example="500 kr" />
        </div>
        <p className="text-white/35 text-xs mt-3 leading-relaxed">
          Exempel: om potten är <strong className="text-white/60">5 000 kr</strong> får vinnaren 3 500 kr,
          andraplatsen 1 000 kr och tredjeplatsen 500 kr.
        </p>
      </div>
    </div>
  )
}

function PayoutRow({ place, share, example }: { place: string; share: string; example: string }) {
  return (
    <div className="grid grid-cols-12 items-center gap-3 py-4">
      <div className="col-span-5 sm:col-span-4 font-display font-black uppercase text-white text-lg tracking-wide">
        {place}
      </div>
      <div className="col-span-3 sm:col-span-4 font-mono font-bold text-swe-yellow text-2xl tnum">
        {share}
      </div>
      <div className="col-span-4 text-right text-white/45 text-sm">
        Vid 5 000 kr: <span className="text-white/75">{example}</span>
      </div>
    </div>
  )
}

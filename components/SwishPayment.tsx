'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

const SWISH_NUMBER = '0768919007'
const AMOUNT = 100
const MESSAGE = 'VM-tips 2026'

function buildSwishLink(phoneNumber: string) {
  const params = new URLSearchParams({
    sw: SWISH_NUMBER.replace(/\D/g, ''),
    amt: String(AMOUNT),
    msg: MESSAGE,
    src: 'app',
  })

  const cleanedPhone = phoneNumber.replace(/\D/g, '')
  if (cleanedPhone) params.set('pnum', cleanedPhone)

  return `https://app.swish.nu/1/p/sw/?${params.toString()}`
}

const QR_LINK = buildSwishLink('')

export default function SwishPayment() {
  const [mode, setMode] = useState<'choose' | 'this' | 'other'>('choose')
  const [phone, setPhone] = useState('')

  function formatPhone(raw: string) {
    return raw.replace(/[^\d+]/g, '').slice(0, 13)
  }

  return (
    <div className="p-5 space-y-4 w-full">
      <div className="text-center space-y-0.5">
        <div className="label text-swe-yellow/70">Betalning</div>
        <div className="font-display font-black text-2xl uppercase text-swe-yellow tracking-wide">100 kr via Swish</div>
        <div className="text-sm text-white/50">Erik Engstrand · {SWISH_NUMBER}</div>
      </div>

      {mode === 'choose' && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode('this')}
            className="flex flex-col items-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors px-4 py-4 text-sm text-white/80"
          >
            <span className="text-2xl">📱</span>
            <span className="font-medium">Swisha på<br />den här enheten</span>
          </button>
          <button
            onClick={() => setMode('other')}
            className="flex flex-col items-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors px-4 py-4 text-sm text-white/80"
          >
            <span className="text-2xl">📷</span>
            <span className="font-medium">Skanna QR<br />med annan enhet</span>
          </button>
        </div>
      )}

      {mode === 'this' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-white/50 uppercase tracking-wide">Ditt mobilnummer</label>
            <input
              type="tel"
              inputMode="tel"
              placeholder="07X XXX XX XX"
              value={phone}
              onChange={e => setPhone(formatPhone(e.target.value))}
              className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30"
            />
          </div>
          <a
            href={buildSwishLink(phone)}
            target="_blank"
            rel="noreferrer"
            className="btn-primary flex items-center justify-center gap-2 h-10 text-sm w-full"
          >
            Öppna Swish
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <button onClick={() => setMode('choose')} className="text-xs text-white/35 hover:text-white/60 w-full text-center transition-colors">
            ← Tillbaka
          </button>
        </div>
      )}

      {mode === 'other' && (
        <div className="space-y-3">
          <div className="bg-white p-4 mx-auto w-fit">
            <QRCodeSVG value={QR_LINK} size={180} />
          </div>
          <p className="text-xs text-white/40 text-center">
            Öppna Swish-appen → tryck på QR-ikonen → skanna
          </p>
          <button onClick={() => setMode('choose')} className="text-xs text-white/35 hover:text-white/60 w-full text-center transition-colors">
            ← Tillbaka
          </button>
        </div>
      )}
    </div>
  )
}

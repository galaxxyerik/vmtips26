'use client'

import { QRCodeSVG } from 'qrcode.react'

const SWISH_NUMBER = '0768919007'
const AMOUNT = 100
const MESSAGE = 'VM-tips 2026'

const SWISH_LINK = `swish://payment?data=${encodeURIComponent(
  JSON.stringify({
    version: 1,
    payee: { value: SWISH_NUMBER, editable: false },
    amount: { value: AMOUNT, editable: false },
    message: { value: MESSAGE, editable: false },
  })
)}`

export default function SwishPayment() {
  return (
    <div className="p-5 space-y-4 w-full">
      <div className="text-center space-y-0.5">
        <div className="label text-swe-yellow/70">Betalning</div>
        <div className="font-display font-black text-2xl uppercase text-swe-yellow tracking-wide">100 kr via Swish</div>
        <div className="text-sm text-white/50">Erik Engstrand · {SWISH_NUMBER}</div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="bg-white p-3">
          <QRCodeSVG value={SWISH_LINK} size={164} />
        </div>
        <p className="text-[11px] text-white/35 text-center">På dator: skanna med Swish-appen</p>
      </div>

      <a
        href={SWISH_LINK}
        className="btn-primary flex items-center justify-center gap-2 h-11 text-sm w-full"
      >
        Öppna Swish på den här telefonen
      </a>
      <p className="text-[11px] text-white/30 text-center -mt-1">
        Belopp och mottagare är förifyllda
      </p>
    </div>
  )
}

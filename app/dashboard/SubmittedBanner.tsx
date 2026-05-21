'use client'

import { useEffect, useState } from 'react'

export default function SubmittedBanner() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 6000)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div className="w-full bg-swe-yellow px-4 py-3 text-center">
      <p className="font-display font-black uppercase tracking-wide text-black text-sm sm:text-base">
        Ditt tips är inlagt! Vi ses i tabellen den 11 juni.
      </p>
    </div>
  )
}

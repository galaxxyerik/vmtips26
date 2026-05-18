'use client'

import { useContent } from '@/contexts/AdminEditContext'

export default function AdminEditBar() {
  const { isAdmin, editMode, toggleEditMode } = useContent()
  if (!isAdmin) return null

  return (
    <div className="fixed bottom-5 right-5 z-[100]">
      <button
        onClick={toggleEditMode}
        className={`px-4 py-2.5 text-xs font-display font-black uppercase tracking-wider border transition-colors shadow-lg ${
          editMode
            ? 'bg-swe-yellow text-navy-950 border-swe-yellow'
            : 'bg-navy-900 text-white/60 border-white/20 hover:text-white hover:border-white/40'
        }`}
      >
        {editMode ? '✓ Redigeringsläge' : '✎ Redigera sida'}
      </button>
    </div>
  )
}

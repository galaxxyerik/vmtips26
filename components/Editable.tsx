'use client'

import { useState, useRef, useEffect } from 'react'
import { useContent } from '@/contexts/AdminEditContext'

async function saveContent(key: string, value: string) {
  await fetch('/api/admin/update-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  })
}

// ── Editable text ─────────────────────────────────────────────────────────────

interface EditableProps {
  contentKey: string
  fallback: string
  multiline?: boolean
  className?: string
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2'
}

export function Editable({ contentKey, fallback, multiline = false, className = '', as: Tag = 'span' }: EditableProps) {
  const { content, editMode, updateContent } = useContent()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  const value = content[contentKey] ?? fallback

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  // Not in edit mode — render normally
  if (!editMode) {
    return <Tag className={className}>{value}</Tag>
  }

  // Edit mode, currently editing this field
  if (editing) {
    async function save() {
      setSaving(true)
      await saveContent(contentKey, draft)
      updateContent(contentKey, draft)
      setSaving(false)
      setEditing(false)
    }

    return (
      <span className="inline-block w-full align-top">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={3}
            className="w-full bg-navy-900 border border-swe-yellow text-white p-2 text-sm outline-none resize-y font-sans"
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className={`bg-navy-900 border border-swe-yellow text-white p-1 outline-none w-full ${className}`}
          />
        )}
        <span className="flex gap-2 mt-1">
          <button
            onClick={save}
            disabled={saving}
            className="px-3 py-1 text-xs bg-swe-yellow text-navy-950 font-display font-black uppercase disabled:opacity-50"
          >
            {saving ? '...' : 'Spara'}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-1 text-xs border border-white/20 text-white/50 font-display font-black uppercase"
          >
            Avbryt
          </button>
        </span>
      </span>
    )
  }

  // Edit mode, not currently editing — show highlight on hover
  return (
    <Tag
      className={`${className} relative cursor-pointer outline outline-1 outline-dashed outline-swe-yellow/40 hover:outline-swe-yellow transition-all group`}
      onClick={() => { setDraft(value); setEditing(true) }}
      title={contentKey}
    >
      {value}
      <span className="absolute -top-5 right-0 text-[9px] bg-swe-yellow text-navy-950 px-1.5 py-0.5 font-display font-black uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        ✎ {contentKey}
      </span>
    </Tag>
  )
}

// ── Editable image ────────────────────────────────────────────────────────────

interface EditableImageProps {
  contentKey: string
  fallback?: string
  className?: string
  containerClassName?: string
  alt?: string
  placeholderHeight?: string
}

export function EditableImage({
  contentKey,
  fallback,
  className = '',
  containerClassName = '',
  alt = '',
  placeholderHeight = 'h-40',
}: EditableImageProps) {
  const { content, editMode, updateContent } = useContent()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  const src = content[contentKey] ?? fallback ?? ''

  if (editMode && editing) {
    async function save() {
      setSaving(true)
      await saveContent(contentKey, draft)
      updateContent(contentKey, draft)
      setSaving(false)
      setEditing(false)
    }

    return (
      <div className="border border-swe-yellow p-3 space-y-2 my-3">
        <div className="label text-swe-yellow/80">Bild-URL · {contentKey}</div>
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="https://..."
          className="w-full bg-navy-900 border border-white/20 text-white p-2 text-sm outline-none focus:border-swe-yellow transition-colors"
        />
        {draft && (
          <img src={draft} alt="Förhandsgranskning" className="max-h-32 object-contain border border-white/10" />
        )}
        <div className="flex gap-2">
          <button onClick={save} disabled={saving} className="px-3 py-1 text-xs bg-swe-yellow text-navy-950 font-display font-black uppercase disabled:opacity-50">
            {saving ? '...' : 'Spara'}
          </button>
          <button onClick={() => setEditing(false)} className="px-3 py-1 text-xs border border-white/20 text-white/50 font-display font-black uppercase">
            Avbryt
          </button>
        </div>
      </div>
    )
  }

  if (editMode) {
    return (
      <div
        className={`relative group cursor-pointer my-3 ${containerClassName}`}
        onClick={() => { setDraft(src); setEditing(true) }}
      >
        {src ? (
          <img src={src} alt={alt} className={className} />
        ) : (
          <div className={`${placeholderHeight} bg-navy-900/50 border border-dashed border-white/20 flex items-center justify-center`}>
            <span className="text-xs text-white/30 font-display font-black uppercase tracking-wider">+ Lägg till bild</span>
          </div>
        )}
        <div className="absolute inset-0 bg-swe-yellow/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-xs bg-swe-yellow text-navy-950 px-2 py-1 font-display font-black uppercase">✎ Redigera bild</span>
        </div>
      </div>
    )
  }

  if (!src) return null
  return (
    <div className={containerClassName}>
      <img src={src} alt={alt} className={className} />
    </div>
  )
}

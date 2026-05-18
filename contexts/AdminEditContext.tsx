'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface ContentContextValue {
  content: Record<string, string>
  isAdmin: boolean
  editMode: boolean
  toggleEditMode: () => void
  updateContent: (key: string, value: string) => void
}

const ContentContext = createContext<ContentContextValue>({
  content: {},
  isAdmin: false,
  editMode: false,
  toggleEditMode: () => {},
  updateContent: () => {},
})

export function ContentProvider({
  children,
  initialContent,
  isAdmin,
}: {
  children: React.ReactNode
  initialContent: Record<string, string>
  isAdmin: boolean
}) {
  const [content, setContent] = useState(initialContent)
  const [editMode, setEditMode] = useState(false)

  const toggleEditMode = useCallback(() => setEditMode(p => !p), [])
  const updateContent = useCallback((key: string, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }))
  }, [])

  return (
    <ContentContext.Provider value={{ content, isAdmin, editMode, toggleEditMode, updateContent }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  return useContext(ContentContext)
}

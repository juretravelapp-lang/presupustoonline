import { useEffect, useRef } from 'react'

export function useAutoSaveDraft(key: string, data: unknown, enabled = true) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const initialRender = useRef(true)

  useEffect(() => {
    if (!enabled) return

    // Skip auto-save on initial render
    if (initialRender.current) {
      initialRender.current = false
      return
    }

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify({
          data,
          savedAt: Date.now(),
        }))
      } catch (e) {
        console.warn('Failed to save draft:', e)
      }
    }, 1000)

    return () => clearTimeout(timeoutRef.current)
  }, [key, data, enabled])

  const restoreDraft = () => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Discard if older than 7 days
        if (Date.now() - parsed.savedAt > 7 * 24 * 60 * 60 * 1000) {
          localStorage.removeItem(key)
          return null
        }
        return parsed.data
      }
    } catch {
      localStorage.removeItem(key)
    }
    return null
  }

  const clearDraft = () => {
    localStorage.removeItem(key)
  }

  return { restoreDraft, clearDraft }
}

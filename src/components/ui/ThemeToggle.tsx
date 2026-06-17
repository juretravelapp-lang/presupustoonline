import * as React from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [isDark, setIsDark] = React.useState<boolean>(() => {
    try {
      const v = localStorage.getItem('theme')
      if (v) return v === 'dark'
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return false
    }
  })

  React.useEffect(() => {
    try {
      const root = document.documentElement
      if (isDark) {
        root.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        root.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    } catch (e) {
      // noop
    }
  }, [isDark])

  return (
    <button
      onClick={() => setIsDark(v => !v)}
      aria-pressed={isDark}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      className="w-9 h-9 rounded-full bg-border-light flex items-center justify-center text-text-secondary hover:bg-border transition-colors duration-[150ms]"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}

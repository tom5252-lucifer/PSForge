'use client'
import { useState, useEffect } from 'react'
import type { Theme } from '@/types'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('psforge-theme') as Theme | null
    if (saved) applyTheme(saved)
  }, [])

  function applyTheme(t: Theme) {
    setTheme(t)
    localStorage.setItem('psforge-theme', t)
    document.documentElement.classList.toggle('light', t === 'light')
  }

  function toggle() {
    applyTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return { theme, toggle }
}

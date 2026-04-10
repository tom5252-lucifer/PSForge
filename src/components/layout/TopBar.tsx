'use client'
import { Sun, Moon, Code2, Bot } from 'lucide-react'
import { PT_VERSIONS } from '@/config/ptVersions'
import type { Theme, AppTab } from '@/types'

interface TopBarProps {
  activeTab:    AppTab
  ptVersion:    string
  theme:        Theme
  errorCount:   number
  warnCount:    number
  onTabChange:  (t: AppTab)   => void
  onVersionChange: (v: string) => void
  onThemeToggle: () => void
  onRun:        () => void
}

export function TopBar({
  activeTab, ptVersion, theme,
  errorCount, warnCount,
  onTabChange, onVersionChange, onThemeToggle, onRun,
}: TopBarProps) {
  return (
    <header
      className="flex items-center gap-0 h-10 flex-shrink-0 border-b"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 mr-2">
        <div className="flex gap-0.5">
          <div className="w-2 h-2 rounded-sm" style={{ background: 'var(--accent)' }} />
          <div className="w-2 h-2 rounded-sm opacity-50" style={{ background: 'var(--accent)' }} />
        </div>
        <span className="text-xs font-bold tracking-wide" style={{ color: 'var(--accent)' }}>
          PSforge
        </span>
      </div>

      {/* Nav Tabs */}
      <nav className="flex h-full">
        <button
          onClick={() => onTabChange('studio')}
          className="flex items-center gap-1.5 px-4 h-full text-xs font-medium transition-colors relative"
          style={{
            color:       activeTab === 'studio' ? 'var(--text)' : 'var(--muted2)',
            borderBottom: activeTab === 'studio'
              ? '2px solid var(--accent)'
              : '2px solid transparent',
          }}
        >
          <Code2 size={13} />
          Code Studio
        </button>
        <button
          onClick={() => onTabChange('psagent')}
          className="flex items-center gap-1.5 px-4 h-full text-xs font-medium transition-colors relative"
          style={{
            color:       activeTab === 'psagent' ? 'var(--text)' : 'var(--muted2)',
            borderBottom: activeTab === 'psagent'
              ? '2px solid var(--accent)'
              : '2px solid transparent',
          }}
        >
          <Bot size={13} />
          PS Agent
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: 'var(--surface3)', color: 'var(--muted)', fontSize: '9px' }}
          >
            soon
          </span>
        </button>
      </nav>

      {/* Right controls */}
      <div className="ml-auto flex items-center gap-2 px-3">

        {/* Error/Warn counts */}
        {(errorCount > 0 || warnCount > 0) && (
          <div className="flex items-center gap-1">
            {errorCount > 0 && (
              <span
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded"
                style={{ background: 'var(--red-s)', color: 'var(--red)' }}
              >
                ✕ {errorCount}
              </span>
            )}
            {warnCount > 0 && (
              <span
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded"
                style={{ background: 'var(--amber-s)', color: 'var(--amber)' }}
              >
                ⚠ {warnCount}
              </span>
            )}
          </div>
        )}

        {/* PT Version selector */}
        <select
          value={ptVersion}
          onChange={e => onVersionChange(e.target.value)}
          className="text-xs px-2 py-1 rounded outline-none cursor-pointer"
          style={{
            background:   'var(--surface2)',
            border:       '1px solid var(--border)',
            color:        'var(--text2)',
            fontFamily:   'var(--font-sans)',
          }}
        >
          {PT_VERSIONS.map(v => (
            <option key={v.id} value={v.id}>
              {v.label} {v.status === 'current' ? '★' : ''}
            </option>
          ))}
        </select>

        {/* Knowledge Base indicator */}
        <div
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded"
          style={{ background: 'var(--green-s)', color: 'var(--green)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--green)', animation: 'pulseDot 2s ease-in-out infinite' }}
          />
          Knowledge Base
        </div>

        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          className="w-7 h-7 flex items-center justify-center rounded transition-colors"
          style={{ background: 'var(--surface2)', color: 'var(--muted2)' }}
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
        </button>

        {/* Run button */}
        <button
          onClick={onRun}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-opacity hover:opacity-85"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          ▶ Analyse
        </button>
      </div>
    </header>
  )
}

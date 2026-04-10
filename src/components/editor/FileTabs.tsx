'use client'
import { X, Plus } from 'lucide-react'
import type { FileTab } from '@/types'

interface FileTabsProps {
  tabs:         FileTab[]
  activeTabId:  string
  onSelect:     (id: string) => void
  onClose:      (id: string) => void
  onNew:        () => void
}

export function FileTabs({ tabs, activeTabId, onSelect, onClose, onNew }: FileTabsProps) {
  function langIcon(lang: string) {
    switch (lang) {
      case 'peoplecode': return '⊟'
      case 'sql':        return '⊞'
      case 'sqr':        return '≡'
      case 'datamover':  return '⇅'
      default:           return '○'
    }
  }

  function langExt(lang: string) {
    switch (lang) {
      case 'peoplecode': return '.pc'
      case 'sql':        return '.sql'
      case 'sqr':        return '.sqr'
      case 'datamover':  return '.dms'
      default:           return ''
    }
  }

  return (
    <div
      className="flex items-end h-8 flex-shrink-0 overflow-x-auto"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
    >
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId
        const hasErrors = tab.diagnostics.some(d => d.severity === 'error')
        const hasWarns  = tab.diagnostics.some(d => d.severity === 'warning')

        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className="flex items-center gap-1.5 px-3 h-full text-xs flex-shrink-0 group relative transition-colors"
            style={{
              background:   isActive ? 'var(--bg)' : 'transparent',
              color:        isActive ? 'var(--text)' : 'var(--muted2)',
              borderTop:    isActive ? '2px solid var(--accent)' : '2px solid transparent',
              borderRight:  '1px solid var(--border)',
              minWidth:     100,
              maxWidth:     180,
            }}
          >
            <span style={{ color: isActive ? 'var(--accent)' : 'var(--muted)', fontSize: 12 }}>
              {langIcon(tab.language)}
            </span>
            <span className="truncate flex-1" title={tab.label + langExt(tab.language)}>
              {tab.label}
              <span style={{ color: 'var(--muted)', fontSize: 10 }}>{langExt(tab.language)}</span>
            </span>
            {/* Dirty indicator */}
            {tab.isDirty && (
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: hasErrors ? 'var(--red)' : hasWarns ? 'var(--amber)' : 'var(--accent)' }}
              />
            )}
            {/* Close button */}
            <span
              onClick={e => { e.stopPropagation(); onClose(tab.id) }}
              className="w-4 h-4 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              style={{ color: 'var(--muted2)' }}
            >
              <X size={10} />
            </span>
          </button>
        )
      })}

      {/* New tab */}
      <button
        onClick={onNew}
        className="flex items-center justify-center w-8 h-full flex-shrink-0 transition-colors"
        style={{ color: 'var(--muted)' }}
        title="New file"
      >
        <Plus size={13} />
      </button>
    </div>
  )
}

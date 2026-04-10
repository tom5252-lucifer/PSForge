'use client'
import { useState } from 'react'
import { ChevronRight, ChevronDown, ExternalLink } from 'lucide-react'
import { PS_OBJECTS } from '@/config/objectTree'
import type { PSObject, PSEvent } from '@/config/objectTree'

interface ObjectTreeProps {
  selectedObjectId: string
  selectedEventId:  string
  onSelect: (obj: PSObject, ev: PSEvent) => void
}

export function ObjectTree({ selectedObjectId, selectedEventId, onSelect }: ObjectTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['component']))

  function toggle(id: string) {
    setExpanded(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const categories = [
    { key: 'peoplecode', label: 'PEOPLECODE',   color: 'var(--accent)' },
    { key: 'sql',        label: 'SQL & SCRIPTS', color: '#F97316'      },
    { key: 'config',     label: 'CONFIGURATION', color: 'var(--muted)' },
  ]

  return (
    <aside
      className="flex flex-col h-full overflow-hidden"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)', width: 214 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}
      >
        <span className="text-xs font-semibold tracking-widest" style={{ color: 'var(--muted)', fontSize: '9px' }}>
          OBJECT EXPLORER
        </span>
        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{ background: 'var(--accent-s)', color: 'var(--accent)', fontSize: '9px' }}
        >
          App Designer
        </span>
      </div>

      {/* Search */}
      <div className="px-2 py-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <input
          type="text"
          placeholder="Search objects..."
          className="w-full text-xs px-2 py-1.5 rounded outline-none"
          style={{
            background: 'var(--bg)',
            border:     '1px solid var(--border)',
            color:      'var(--text)',
            fontFamily: 'var(--font-sans)',
          }}
        />
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto">
        {categories.map(cat => {
          const objs = PS_OBJECTS.filter(o => o.category === cat.key)
          return (
            <div key={cat.key}>
              {/* Category header */}
              <div
                className="px-3 py-1.5 sticky top-0"
                style={{
                  background: 'var(--bg)',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '9px',
                  letterSpacing: '0.15em',
                  color: cat.color,
                  fontWeight: 600,
                }}
              >
                {cat.label}
              </div>

              {/* Objects */}
              {objs.map(obj => (
                <div key={obj.id}>
                  {/* Object row */}
                  <button
                    onClick={() => !obj.noCode && toggle(obj.id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors"
                    style={{
                      background: expanded.has(obj.id) && !obj.noCode
                        ? 'var(--surface2)' : 'transparent',
                      color: obj.noCode ? 'var(--muted)' : 'var(--text2)',
                      opacity: obj.noCode ? 0.5 : 1,
                    }}
                  >
                    <span style={{ fontSize: 13, color: obj.color, flexShrink: 0 }}>
                      {obj.icon}
                    </span>
                    <span className="flex-1 text-xs truncate">{obj.label}</span>
                    {obj.noCode ? (
                      <span
                        className="flex items-center gap-0.5 text-xs px-1 py-0.5 rounded"
                        style={{ background: 'var(--surface3)', color: 'var(--muted)', fontSize: '8px' }}
                        title={obj.noCodeReason}
                      >
                        <ExternalLink size={8} /> Tab 2
                      </span>
                    ) : (
                      expanded.has(obj.id)
                        ? <ChevronDown size={11} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                        : <ChevronRight size={11} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                    )}
                  </button>

                  {/* No-code tooltip */}
                  {obj.noCode && (
                    <div
                      className="mx-3 mb-1 px-2 py-1.5 rounded text-xs leading-relaxed"
                      style={{
                        background: 'var(--surface2)',
                        color:      'var(--muted)',
                        fontSize:   '10px',
                        borderLeft: `2px solid var(--border2)`,
                      }}
                    >
                      {obj.noCodeReason}
                    </div>
                  )}

                  {/* Events list */}
                  {!obj.noCode && expanded.has(obj.id) && (
                    <div style={{ background: 'var(--bg)' }}>
                      {obj.events.map(ev => {
                        const isActive =
                          selectedObjectId === obj.id &&
                          selectedEventId  === ev.id
                        return (
                          <button
                            key={ev.id}
                            onClick={() => onSelect(obj, ev)}
                            className="w-full flex items-center gap-2 pl-8 pr-3 py-1.5 text-left transition-all"
                            style={{
                              background:   isActive ? 'var(--accent-s)' : 'transparent',
                              borderLeft:   isActive ? '2px solid var(--accent)' : '2px solid transparent',
                              color:        isActive ? 'var(--accent)' : 'var(--muted2)',
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: ev.badgeColor }}
                            />
                            <span className="flex-1 text-xs truncate">{ev.label}</span>
                            <span
                              className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                              style={{
                                background: isActive ? 'var(--accent-s)' : 'var(--surface2)',
                                color:      isActive ? 'var(--accent)' : 'var(--muted)',
                                fontSize:   '8px',
                                fontWeight: 600,
                                letterSpacing: '0.05em',
                              }}
                            >
                              {ev.badge}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

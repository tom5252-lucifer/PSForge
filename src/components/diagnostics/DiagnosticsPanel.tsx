'use client'
import { useState, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import type { DiagnosticResult, TraceStep, BottomTab } from '@/types'

interface DiagnosticsPanelProps {
  errors:      DiagnosticResult[]
  warnings:    DiagnosticResult[]
  good:        DiagnosticResult[]
  trace:       TraceStep[]
  suggestions: string
  ptVersion:   string
  isAnalysing: boolean
  onJumpLine?: (line: number) => void
}

export function DiagnosticsPanel({
  errors, warnings, good, trace,
  suggestions, ptVersion, isAnalysing, onJumpLine,
}: DiagnosticsPanelProps) {
  const [activeTab, setActiveTab] = useState<BottomTab>('errors')
  const [height, setHeight]       = useState(210)
  const [dragging, setDragging]   = useState(false)

  // Auto-switch to errors tab after analysis
  useEffect(() => {
    if (!isAnalysing && errors.length > 0) setActiveTab('errors')
    else if (!isAnalysing && warnings.length > 0) setActiveTab('warnings')
  }, [isAnalysing, errors.length, warnings.length])

  // Drag to resize
  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    setDragging(true)
    const startY = e.clientY
    const startH = height

    function onMove(me: MouseEvent) {
      const delta = startY - me.clientY
      setHeight(Math.max(120, Math.min(420, startH + delta)))
    }
    function onUp() {
      setDragging(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const tabs: { id: BottomTab; label: string; count?: number; color?: string }[] = [
    { id: 'errors',      label: 'Errors',          count: errors.length,   color: 'var(--red)'   },
    { id: 'warnings',    label: 'Warnings',         count: warnings.length, color: 'var(--amber)' },
    { id: 'trace',       label: 'Trace',            count: trace.length                           },
    { id: 'suggestions', label: 'Suggestions'                                                     },
    { id: 'peoplebooks', label: 'PeopleBooks Ref',  count: [...errors, ...warnings].filter(d => d.oracleUrl).length },
  ]

  return (
    <div
      className="flex flex-col flex-shrink-0"
      style={{ height, background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
    >
      {/* Drag handle */}
      <div
        className="w-full flex items-center justify-center cursor-row-resize flex-shrink-0"
        style={{ height: 6, background: dragging ? 'var(--accent-s)' : 'transparent' }}
        onMouseDown={onMouseDown}
      >
        <div className="w-8 h-0.5 rounded" style={{ background: 'var(--border2)' }} />
      </div>

      {/* Tab bar */}
      <div
        className="flex items-center flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', height: 30 }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-4 h-full text-xs transition-colors"
              style={{
                color:        isActive ? 'var(--text)' : 'var(--muted2)',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                  style={{
                    background: tab.color ? `${tab.color}20` : 'var(--surface3)',
                    color:      tab.color ?? 'var(--muted2)',
                    fontSize:   '9px',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}

        {/* Clear button */}
        <button
          className="ml-auto mr-3 text-xs px-2 py-1 rounded transition-colors"
          style={{ color: 'var(--muted)', fontSize: '10px' }}
        >
          Clear
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {isAnalysing ? (
          <div className="flex items-center gap-2 px-4 py-3" style={{ color: 'var(--muted2)' }}>
            <div className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            <span className="text-xs">Analysing code...</span>
          </div>
        ) : (
          <>
            {/* ERRORS TAB */}
            {activeTab === 'errors' && (
              <div>
                {errors.length === 0 && (
                  <EmptyState icon="✓" color="var(--green)" text="No errors detected" />
                )}
                {errors.map((e, i) => (
                  <DiagRow key={i} item={e} onJumpLine={onJumpLine} />
                ))}
                {/* Good patterns */}
                {good.map((g, i) => (
                  <DiagRow key={`g${i}`} item={g} onJumpLine={onJumpLine} />
                ))}
              </div>
            )}

            {/* WARNINGS TAB */}
            {activeTab === 'warnings' && (
              <div>
                {warnings.length === 0 && (
                  <EmptyState icon="✓" color="var(--green)" text="No warnings detected" />
                )}
                {warnings.map((w, i) => (
                  <DiagRow key={i} item={w} onJumpLine={onJumpLine} />
                ))}
              </div>
            )}

            {/* TRACE TAB */}
            {activeTab === 'trace' && (
              <div>
                {trace.length === 0 && (
                  <EmptyState icon="→" color="var(--muted)" text="Run analysis to see execution trace" />
                )}
                {trace.map((step, i) => (
                  <TraceRow key={i} step={step} onJumpLine={onJumpLine} />
                ))}
              </div>
            )}

            {/* SUGGESTIONS TAB */}
            {activeTab === 'suggestions' && (
              <div className="p-4">
                {!suggestions ? (
                  <EmptyState icon="💡" color="var(--accent)" text="Run analysis to get AI suggestions" />
                ) : (
                  <div
                    className="text-xs leading-relaxed ai-content"
                    style={{ color: 'var(--text2)' }}
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(suggestions) }}
                  />
                )}
              </div>
            )}

            {/* PEOPLEBOOKS REF TAB */}
            {activeTab === 'peoplebooks' && (
              <div>
                {[...errors, ...warnings].filter(d => d.oracleUrl).length === 0 && (
                  <EmptyState icon="📖" color="var(--muted)" text="Run analysis — relevant PeopleBooks refs appear here" />
                )}
                {[...errors, ...warnings]
                  .filter(d => d.oracleUrl)
                  .map((d, i) => (
                    <PeopleBooksRow key={i} item={d} ptVersion={ptVersion} />
                  ))
                }
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────

function DiagRow({ item, onJumpLine }: { item: DiagnosticResult; onJumpLine?: (l: number) => void }) {
  const colors: Record<string, string> = {
    error:   'var(--red)',
    warning: 'var(--amber)',
    ok:      'var(--green)',
    info:    'var(--accent)',
  }
  const icons: Record<string, string> = {
    error: '✕', warning: '⚠', ok: '✓', info: 'ℹ',
  }
  const bgColors: Record<string, string> = {
    error:   'rgba(239,68,68,0.04)',
    warning: 'rgba(245,158,11,0.04)',
    ok:      'rgba(34,197,94,0.04)',
    info:    'rgba(79,127,255,0.04)',
  }
  const c = colors[item.severity]  ?? 'var(--muted)'
  const ic = icons[item.severity]  ?? '•'
  const bg = bgColors[item.severity] ?? 'transparent'

  return (
    <div
      className="flex gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:opacity-90"
      style={{
        background:  bg,
        borderLeft:  `2px solid ${c}`,
        borderBottom: '1px solid var(--border)',
      }}
      onClick={() => item.line && onJumpLine?.(item.line)}
    >
      <span className="text-sm flex-shrink-0 mt-0.5" style={{ color: c }}>{ic}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--text)' }}>
          {item.message}
        </div>
        {item.detail && (
          <div className="text-xs mb-1" style={{ color: 'var(--muted2)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
            {item.line && <span className="mr-2" style={{ color: 'var(--muted)' }}>Line {item.line}</span>}
            {item.detail}
          </div>
        )}
        {item.suggestion && item.severity !== 'ok' && (
          <div
            className="text-xs px-2 py-1 rounded mt-1"
            style={{ background: 'var(--green-s)', color: 'var(--green)', fontSize: '10px' }}
          >
            💡 {item.suggestion}
          </div>
        )}
      </div>
    </div>
  )
}

function TraceRow({ step, onJumpLine }: { step: TraceStep; onJumpLine?: (l: number) => void }) {
  const colors: Record<string, string> = {
    var:    'var(--green)',
    sql:    'var(--amber)',
    if:     'var(--accent)',
    end:    'var(--muted)',
    call:   'var(--red)',
    set:    'var(--green)',
    import: 'var(--accent)',
    error:  'var(--amber)',
    info:   'var(--muted2)',
  }
  const c = colors[step.type] ?? 'var(--muted2)'

  return (
    <div
      className="flex items-center gap-3 px-4 py-1 cursor-pointer transition-colors"
      style={{ borderBottom: '1px solid var(--border)', background: 'transparent' }}
      onClick={() => onJumpLine?.(step.line)}
    >
      <span
        className="text-right flex-shrink-0"
        style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '10px', width: 28 }}
      >
        {step.line}
      </span>
      <span
        className="text-xs px-1 py-0.5 rounded flex-shrink-0"
        style={{ background: `${c}20`, color: c, fontFamily: 'var(--font-mono)', fontSize: '9px', width: 44, textAlign: 'center' }}
      >
        {step.icon} {step.label}
      </span>
      <span
        className="text-xs truncate"
        style={{ color: 'var(--muted2)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}
      >
        {step.code}
      </span>
    </div>
  )
}

function PeopleBooksRow({ item, ptVersion }: { item: DiagnosticResult; ptVersion: string }) {
  return (
    <div
      className="px-4 py-3"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div>
          <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text)' }}>
            {item.oracleSection}
          </div>
          <div
            className="text-xs px-1.5 py-0.5 rounded inline-block mb-1"
            style={{ background: 'var(--surface3)', color: 'var(--muted)', fontSize: '9px' }}
          >
            PeopleTools {ptVersion}  ·  Rule: {item.id}
          </div>
        </div>
        {item.oracleUrl && (
          <a
            href={item.oracleUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs px-2 py-1 rounded flex-shrink-0 transition-colors hover:opacity-80"
            style={{ background: 'var(--accent-s)', color: 'var(--accent)', fontSize: '10px' }}
          >
            Oracle Docs <ExternalLink size={9} />
          </a>
        )}
      </div>
      {item.oracleSummary && (
        <div className="text-xs leading-relaxed" style={{ color: 'var(--muted2)' }}>
          {item.oracleSummary}
        </div>
      )}
    </div>
  )
}

function EmptyState({ icon, color, text }: { icon: string; color: string; text: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-4" style={{ color: 'var(--muted)' }}>
      <span style={{ color, fontSize: 14 }}>{icon}</span>
      <span className="text-xs">{text}</span>
    </div>
  )
}

function formatMarkdown(text: string): string {
  return text
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

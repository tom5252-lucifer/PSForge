'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { PSObject, PSEvent } from '@/config/objectTree'
import type { Theme } from '@/types'

// Dynamically import Monaco to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface EditorPanelProps {
  code:       string
  language:   string
  fontSize:   number
  theme:      Theme
  object:     PSObject | null
  event:      PSEvent  | null
  onChange:   (code: string) => void
  onCursorChange: (line: number, col: number) => void
}

export function EditorPanel({
  code, language, fontSize, theme,
  object, event, onChange, onCursorChange,
}: EditorPanelProps) {
  const editorRef = useRef<import('monaco-editor').editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null)
  const [showFindReplace, setShowFindReplace] = useState(false)

  // Register custom languages on mount
  function handleEditorMount(
    editor: import('monaco-editor').editor.IStandaloneCodeEditor,
    monaco: typeof import('monaco-editor')
  ) {
    editorRef.current  = editor
    monacoRef.current  = monaco

    // Register PeopleCode language
    if (!monaco.languages.getLanguages().find(l => l.id === 'peoplecode')) {
      import('@/lib/monacoLanguages').then(
        ({ PEOPLECODE_LANGUAGE_ID, PEOPLECODE_TOKENS,
           PEOPLECODE_THEME_DARK, PEOPLECODE_THEME_LIGHT,
           SQR_LANGUAGE_ID, SQR_TOKENS,
           DM_LANGUAGE_ID, DM_TOKENS }) => {

          monaco.languages.register({ id: PEOPLECODE_LANGUAGE_ID })
          monaco.languages.setMonarchTokensProvider(PEOPLECODE_LANGUAGE_ID, PEOPLECODE_TOKENS)
          monaco.editor.defineTheme('psforge-dark',  PEOPLECODE_THEME_DARK)
          monaco.editor.defineTheme('psforge-light', PEOPLECODE_THEME_LIGHT)

          monaco.languages.register({ id: SQR_LANGUAGE_ID })
          monaco.languages.setMonarchTokensProvider(SQR_LANGUAGE_ID, SQR_TOKENS)

          monaco.languages.register({ id: DM_LANGUAGE_ID })
          monaco.languages.setMonarchTokensProvider(DM_LANGUAGE_ID, DM_TOKENS)

          // Set theme after registration
          monaco.editor.setTheme(theme === 'dark' ? 'psforge-dark' : 'psforge-light')
        }
      )
    }

    // Cursor position tracking
    editor.onDidChangeCursorPosition(e => {
      onCursorChange(e.position.lineNumber, e.position.column)
    })

    // Keyboard shortcuts
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH,
      () => setShowFindReplace(v => !v)
    )
  }

  // Update theme when it changes
  useEffect(() => {
    if (!monacoRef.current) return
    monacoRef.current.editor.setTheme(
      theme === 'dark' ? 'psforge-dark' : 'psforge-light'
    )
  }, [theme])

  // Insert code from AI panel
  const insertCode = useCallback((snippet: string) => {
    const editor = editorRef.current
    if (!editor) return
    const selection = editor.getSelection()
    if (!selection) return
    editor.executeEdits('ai-insert', [{
      range: selection,
      text:  snippet,
    }])
    editor.focus()
  }, [])

  // Expose insertCode globally for AI panel
  useEffect(() => {
    (window as Window & { psforgeInsertCode?: (s: string) => void }).psforgeInsertCode = insertCode
    return () => {
      delete (window as Window & { psforgeInsertCode?: (s: string) => void }).psforgeInsertCode
    }
  }, [insertCode])

  const monacoLang = language === 'peoplecode' ? 'peoplecode'
    : language === 'sql'        ? 'sql'
    : language === 'sqr'        ? 'sqr'
    : language === 'datamover'  ? 'datamover'
    : 'plaintext'

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Breadcrumb + context bar */}
      {object && event && (
        <div
          className="flex items-center gap-2 px-4 py-1.5 flex-shrink-0 flex-wrap"
          style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--muted2)' }}>{object.label}</span>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>›</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{event.label}</span>

          {/* When badge */}
          <span
            className="text-xs px-2 py-0.5 rounded ml-1"
            style={{ background: 'var(--surface3)', color: 'var(--muted2)', fontSize: '10px' }}
          >
            {event.when}
          </span>

          <div className="ml-auto flex items-center gap-1.5 flex-wrap">
            {/* Allowed */}
            {event.allowed.slice(0, 2).map((a, i) => (
              <span
                key={i}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: 'var(--green-s)', color: 'var(--green)', fontSize: '9px' }}
              >
                ✓ {a.length > 20 ? a.substring(0, 20) + '…' : a}
              </span>
            ))}
            {/* Forbidden */}
            {event.forbidden.slice(0, 1).map((f, i) => (
              <span
                key={i}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: 'var(--red-s)', color: 'var(--red)', fontSize: '9px' }}
              >
                ✗ {f.length > 20 ? f.substring(0, 20) + '…' : f}
              </span>
            ))}

            {/* Find/Replace toggle */}
            <button
              onClick={() => setShowFindReplace(v => !v)}
              className="text-xs px-2 py-0.5 rounded transition-colors"
              style={{
                background: showFindReplace ? 'var(--accent-s)' : 'var(--surface3)',
                color:      showFindReplace ? 'var(--accent)'   : 'var(--muted2)',
                border:     `1px solid ${showFindReplace ? 'var(--accent)' : 'var(--border)'}`,
                fontSize:   '10px',
              }}
            >
              Find  ⌘H
            </button>
          </div>
        </div>
      )}

      {/* Find/Replace bar */}
      {showFindReplace && (
        <div
          className="flex items-center gap-2 px-4 py-1.5 flex-shrink-0 animate-slide-up"
          style={{ background: 'var(--surface3)', borderBottom: '1px solid var(--border)' }}
        >
          <input
            autoFocus
            type="text"
            placeholder="Find..."
            className="text-xs px-2 py-1 rounded outline-none w-40"
            style={{
              background: 'var(--surface)',
              border:     '1px solid var(--border2)',
              color:      'var(--text)',
              fontFamily: 'var(--font-mono)',
            }}
            onChange={e => {
              editorRef.current?.getAction('actions.find')?.run()
            }}
          />
          <span style={{ color: 'var(--muted)' }}>→</span>
          <input
            type="text"
            placeholder="Replace..."
            className="text-xs px-2 py-1 rounded outline-none w-40"
            style={{
              background: 'var(--surface)',
              border:     '1px solid var(--border2)',
              color:      'var(--text)',
              fontFamily: 'var(--font-mono)',
            }}
          />
          <button
            className="text-xs px-2 py-1 rounded"
            style={{ background: 'var(--accent-s)', color: 'var(--accent)' }}
            onClick={() => editorRef.current?.getAction('editor.action.startFindReplaceAction')?.run()}
          >
            Replace
          </button>
          <button
            className="text-xs px-2 py-1 rounded ml-auto"
            style={{ color: 'var(--muted2)' }}
            onClick={() => setShowFindReplace(false)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        {!object ? (
          <div
            className="flex flex-col items-center justify-center h-full gap-4"
            style={{ color: 'var(--muted)' }}
          >
            <div style={{ fontSize: 40, opacity: 0.2 }}>⊟</div>
            <div className="text-sm" style={{ color: 'var(--muted2)' }}>
              Select an object and event from the left panel
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              PeopleCode · SQL · SQR · Data Mover
            </div>
          </div>
        ) : (
          <MonacoEditor
            height="100%"
            language={monacoLang}
            value={code}
            theme={theme === 'dark' ? 'psforge-dark' : 'psforge-light'}
            onChange={v => onChange(v ?? '')}
            onMount={handleEditorMount}
            options={{
              fontSize,
              fontFamily:           'JetBrains Mono, Cascadia Code, Fira Code, Consolas, monospace',
              fontLigatures:        true,
              lineHeight:           1.7,
              minimap:              { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap:             'on',
              tabSize:              3,
              insertSpaces:         true,
              renderLineHighlight:  'line',
              cursorBlinking:       'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling:      true,
              padding:              { top: 12, bottom: 12 },
              overviewRulerLanes:   0,
              hideCursorInOverviewRuler: true,
              scrollbar: {
                verticalScrollbarSize:   4,
                horizontalScrollbarSize: 4,
              },
              lineNumbers:          'on',
              glyphMargin:          false,
              folding:              true,
              renderWhitespace:     'none',
            }}
          />
        )}
      </div>
    </div>
  )
}

'use client'
import { useState, useCallback } from 'react'
import { TopBar }           from '@/components/layout/TopBar'
import { ObjectTree }        from '@/components/tree/ObjectTree'
import { FileTabs }          from '@/components/editor/FileTabs'
import { EditorPanel }       from '@/components/editor/EditorPanel'
import { StatusBar }         from '@/components/editor/StatusBar'
import { DiagnosticsPanel }  from '@/components/diagnostics/DiagnosticsPanel'
import { AiPanel }           from '@/components/ai/AiPanel'
import { useTheme }          from '@/hooks/useTheme'
import { analyseCode }       from '@/lib/analyser'
import { PS_OBJECTS }        from '@/config/objectTree'
import { DEFAULT_VERSION }   from '@/config/ptVersions'
import type { PSObject, PSEvent } from '@/config/objectTree'
import type { FileTab, AppTab, AnalysisResult } from '@/types'

// ── Initial state ─────────────────────────────────────────
const DEFAULT_OBJ   = PS_OBJECTS.find(o => o.id === 'component')!
const DEFAULT_EVENT = DEFAULT_OBJ.events.find(e => e.id === 'PostBuild')!

function makeTab(obj: PSObject, ev: PSEvent): FileTab {
  return {
    id:          crypto.randomUUID(),
    label:       ev.label,
    objectId:    obj.id,
    eventId:     ev.id,
    language:    obj.language,
    code:        ev.sample,
    isDirty:     false,
    diagnostics: [],
  }
}

const initialTab = makeTab(DEFAULT_OBJ, DEFAULT_EVENT)

export default function Home() {
  const { theme, toggle: toggleTheme } = useTheme()

  // Tabs
  const [tabs,       setTabs]       = useState<FileTab[]>([initialTab])
  const [activeTabId, setActiveTabId] = useState(initialTab.id)

  // PT version
  const [ptVersion, setPtVersion] = useState(DEFAULT_VERSION)

  // App-level tab
  const [appTab, setAppTab] = useState<AppTab>('studio')

  // Editor state
  const [cursorLine, setCursorLine] = useState(1)
  const [cursorCol,  setCursorCol]  = useState(1)
  const [fontSize,   setFontSize]   = useState(12)

  // Analysis
  const [analysis,    setAnalysis]    = useState<AnalysisResult>({ errors: [], warnings: [], good: [], trace: [] })
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [suggestions, setSuggestions] = useState('')

  // Active object/event (derived from active tab)
  const activeTab = tabs.find(t => t.id === activeTabId) ?? tabs[0]
  const activeObj = PS_OBJECTS.find(o => o.id === activeTab?.objectId) ?? null
  const activeEv  = activeObj?.events.find(e => e.id === activeTab?.eventId) ?? null

  // ── Tab operations ───────────────────────────────────────
  function handleSelectObjEvent(obj: PSObject, ev: PSEvent) {
    // Check if tab already open
    const existing = tabs.find(t => t.objectId === obj.id && t.eventId === ev.id)
    if (existing) { setActiveTabId(existing.id); return }

    const newTab = makeTab(obj, ev)
    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
    setAnalysis({ errors: [], warnings: [], good: [], trace: [] })
    setSuggestions('')
  }

  function handleCloseTab(id: string) {
    setTabs(prev => {
      const next = prev.filter(t => t.id !== id)
      if (next.length === 0) {
        const fallback = makeTab(DEFAULT_OBJ, DEFAULT_EVENT)
        setActiveTabId(fallback.id)
        return [fallback]
      }
      if (activeTabId === id) {
        setActiveTabId(next[next.length - 1].id)
      }
      return next
    })
  }

  function handleNewTab() {
    const obj = DEFAULT_OBJ
    const ev  = DEFAULT_OBJ.events[0]
    const t   = makeTab(obj, ev)
    setTabs(prev => [...prev, t])
    setActiveTabId(t.id)
  }

  function handleCodeChange(code: string) {
    setTabs(prev =>
      prev.map(t =>
        t.id === activeTabId ? { ...t, code, isDirty: true } : t
      )
    )
  }

  // ── Analysis ─────────────────────────────────────────────
  const handleRun = useCallback(async () => {
    if (!activeTab || !activeEv) return
    setIsAnalysing(true)
    setSuggestions('')

    // Slight delay so UI updates before sync computation
    await new Promise(r => setTimeout(r, 50))

    const result = analyseCode(activeTab.code, activeEv.id, ptVersion)
    setAnalysis(result)

    // Update tab diagnostics
    setTabs(prev =>
      prev.map(t =>
        t.id === activeTabId
          ? { ...t, diagnostics: [...result.errors, ...result.warnings] }
          : t
      )
    )

    setIsAnalysing(false)

    // Fetch AI suggestions in background if issues found
    if (result.errors.length > 0 || result.warnings.length > 0) {
      fetchSuggestions(activeTab.code, result, activeEv.id)
    }
  }, [activeTab, activeEv, ptVersion, activeTabId])

  async function fetchSuggestions(
    code: string,
    result: AnalysisResult,
    eventId: string,
  ) {
    const issues = [
      ...result.errors.map(e => `ERROR: ${e.message}`),
      ...result.warnings.map(w => `WARNING: ${w.message}`),
    ].join('\n')

    const prompt = `Review this PeopleCode for the ${eventId} event in PeopleTools ${ptVersion}.

Issues found:
${issues}

Code:
\`\`\`
${code.substring(0, 600)}
\`\`\`

Provide a corrected version with all issues fixed, and explain each fix in 1 line.`

    try {
      const resp = await fetch('/api/ai/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          mode:     'studio',
        }),
      })

      if (!resp.body) return
      const reader  = resp.body.getReader()
      const decoder = new TextDecoder()
      let text = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const p = JSON.parse(data) as { text: string }
            text += p.text
            setSuggestions(text)
          } catch { /* skip */ }
        }
      }
    } catch { /* silent fail */ }
  }

  const totalErrors = tabs.reduce((n, t) => n + t.diagnostics.filter(d => d.severity === 'error').length, 0)
  const totalWarns  = tabs.reduce((n, t) => n + t.diagnostics.filter(d => d.severity === 'warning').length, 0)

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <TopBar
        activeTab={appTab}
        ptVersion={ptVersion}
        theme={theme}
        errorCount={totalErrors}
        warnCount={totalWarns}
        onTabChange={setAppTab}
        onVersionChange={setPtVersion}
        onThemeToggle={toggleTheme}
        onRun={handleRun}
      />

      {/* Main content */}
      {appTab === 'studio' ? (
        <div className="flex flex-1 overflow-hidden">

          {/* Left: Object Tree */}
          <ObjectTree
            selectedObjectId={activeTab?.objectId ?? ''}
            selectedEventId={activeTab?.eventId ?? ''}
            onSelect={handleSelectObjEvent}
          />

          {/* Centre: Editor + diagnostics */}
          <div className="flex flex-col flex-1 overflow-hidden min-w-0">

            {/* File tabs */}
            <FileTabs
              tabs={tabs}
              activeTabId={activeTabId}
              onSelect={id => {
                setActiveTabId(id)
                setAnalysis({ errors: [], warnings: [], good: [], trace: [] })
                setSuggestions('')
              }}
              onClose={handleCloseTab}
              onNew={handleNewTab}
            />

            {/* Editor */}
            <EditorPanel
              code={activeTab?.code ?? ''}
              language={activeTab?.language ?? 'peoplecode'}
              fontSize={fontSize}
              theme={theme}
              object={activeObj}
              event={activeEv}
              onChange={handleCodeChange}
              onCursorChange={(l, c) => { setCursorLine(l); setCursorCol(c) }}
            />

            {/* Status bar */}
            <StatusBar
              line={cursorLine}
              column={cursorCol}
              language={activeTab?.language ?? 'peoplecode'}
              fontSize={fontSize}
              errorCount={analysis.errors.length}
              warnCount={analysis.warnings.length}
              onFontSize={setFontSize}
            />

            {/* Diagnostics panel */}
            <DiagnosticsPanel
              errors={analysis.errors}
              warnings={analysis.warnings}
              good={analysis.good}
              trace={analysis.trace}
              suggestions={suggestions}
              ptVersion={ptVersion}
              isAnalysing={isAnalysing}
            />
          </div>

          {/* Right: AI Panel */}
          <AiPanel
            object={activeObj}
            event={activeEv}
            code={activeTab?.code ?? ''}
            ptVersion={ptVersion}
          />
        </div>
      ) : (
        /* PS Agent Tab — coming soon */
        <div
          className="flex flex-1 items-center justify-center flex-col gap-4"
          style={{ color: 'var(--muted)' }}
        >
          <div style={{ fontSize: 48, opacity: 0.15 }}>🤖</div>
          <div className="text-sm font-medium" style={{ color: 'var(--text2)' }}>
            PS Agent — Coming Soon
          </div>
          <div className="text-xs text-center max-w-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
            Full PeopleSoft Q&A powered by your PeopleBooks 8.62.
            Complete Code Studio first, then this tab unlocks.
          </div>
        </div>
      )}
    </div>
  )
}

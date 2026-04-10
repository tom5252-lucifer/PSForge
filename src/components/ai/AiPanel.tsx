'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Square, Trash2, Code } from 'lucide-react'
import { useAiStream } from '@/hooks/useAiStream'
import type { PSObject, PSEvent } from '@/config/objectTree'
import type { AiMessage } from '@/types'

interface AiPanelProps {
  object:    PSObject | null
  event:     PSEvent  | null
  code:      string
  ptVersion: string
}

const QUICK_PROMPTS = [
  'Explain this event',
  'Fix all errors',
  'Best practices',
  'PeopleBooks ref',
  'Optimise this code',
  'Add error handling',
]

export function AiPanel({ object, event, code, ptVersion }: AiPanelProps) {
  const [input, setInput]       = useState('')
  const { messages, streaming, sendMessage, clearMessages, stopStream } = useAiStream()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function buildContext(): string {
    const parts: string[] = []
    if (object && event) {
      parts.push(`Current context: ${object.label} › ${event.label}`)
      parts.push(`When it fires: ${event.when}`)
      parts.push(`Allowed in this event: ${event.allowed.join(', ')}`)
      parts.push(`Forbidden: ${event.forbidden.join(', ')}`)
      parts.push(`PeopleTools version: ${ptVersion}`)
    }
    if (code.trim()) {
      parts.push(`\nCurrent code in editor:\n\`\`\`\n${code.substring(0, 800)}\n\`\`\``)
    }
    return parts.join('\n')
  }

  function handleSend() {
    const q = input.trim()
    if (!q || streaming) return
    setInput('')
    sendMessage(q, buildContext(), ptVersion)
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleQuick(prompt: string) {
    sendMessage(prompt, buildContext(), ptVersion)
  }

  function handleInsert(snippet: string) {
    const fn = (window as Window & { psforgeInsertCode?: (s: string) => void }).psforgeInsertCode
    fn?.(snippet)
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        width:       280,
        background:  'var(--surface)',
        borderLeft:  '1px solid var(--border)',
        flexShrink:  0,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-xs font-semibold tracking-widest" style={{ color: 'var(--muted)', fontSize: '9px' }}>
          AI ASSISTANT
        </span>
        <div className="flex items-center gap-2">
          {/* Context aware indicator */}
          {object && (
            <div
              className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
              style={{ background: 'var(--green-s)', color: 'var(--green)', fontSize: '9px' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--green)', animation: 'pulseDot 2s ease-in-out infinite' }}
              />
              Context aware
            </div>
          )}
          <button
            onClick={clearMessages}
            className="p-1 rounded transition-colors hover:opacity-70"
            style={{ color: 'var(--muted)' }}
            title="Clear history"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Context pill */}
      {object && event && (
        <div
          className="mx-2 mt-2 px-2 py-1 rounded text-xs flex-shrink-0 truncate"
          style={{
            background: 'var(--bg)',
            border:     '1px solid var(--border)',
            color:      'var(--muted2)',
            fontSize:   '10px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          ⊟ {object.label} › {event.label}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-2">
        {messages.length === 0 && (
          <div
            className="text-xs text-center mt-4 leading-relaxed"
            style={{ color: 'var(--muted)' }}
          >
            {object
              ? `Ask anything about ${event?.label ?? 'this event'} in PeopleTools ${ptVersion}`
              : 'Select an object and event to get context-aware help'
            }
          </div>
        )}

        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isStreaming={streaming && msg === messages[messages.length - 1] && msg.role === 'assistant'}
            onInsert={handleInsert}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div
        className="px-2 py-1.5 flex flex-wrap gap-1 flex-shrink-0"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        {QUICK_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => handleQuick(p)}
            disabled={streaming}
            className="text-xs px-2 py-0.5 rounded-full transition-colors hover:opacity-80 disabled:opacity-40"
            style={{
              background: 'var(--surface2)',
              border:     '1px solid var(--border)',
              color:      'var(--muted2)',
              fontSize:   '9.5px',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div
        className="px-2 pb-2 pt-1 flex gap-2 flex-shrink-0 items-end"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about this code..."
          rows={2}
          className="flex-1 resize-none text-xs px-2 py-1.5 rounded outline-none leading-relaxed"
          style={{
            background: 'var(--bg)',
            border:     '1px solid var(--border2)',
            color:      'var(--text)',
            fontFamily: 'var(--font-sans)',
            fontSize:   '11px',
          }}
        />
        <button
          onClick={streaming ? stopStream : handleSend}
          className="w-7 h-7 flex items-center justify-center rounded flex-shrink-0 transition-opacity hover:opacity-85"
          style={{ background: streaming ? 'var(--red-s)' : 'var(--accent)', color: streaming ? 'var(--red)' : '#fff' }}
          title={streaming ? 'Stop' : 'Send (Enter)'}
        >
          {streaming ? <Square size={11} /> : <Send size={11} />}
        </button>
      </div>
    </div>
  )
}

// ── Message Bubble ─────────────────────────────────────────

function MessageBubble({
  message, isStreaming, onInsert,
}: {
  message:     AiMessage
  isStreaming: boolean
  onInsert:    (code: string) => void
}) {
  const isUser = message.role === 'user'

  return (
    <div
      className="animate-fade-in"
      style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '95%' }}
    >
      {/* Role label */}
      {!isUser && (
        <div className="text-xs mb-1 flex items-center gap-1" style={{ color: 'var(--green)', fontSize: '9px', fontWeight: 600 }}>
          PSforge AI
        </div>
      )}

      {/* Bubble */}
      <div
        className="text-xs leading-relaxed px-3 py-2 rounded-lg"
        style={{
          background: isUser ? 'var(--accent-s)' : 'var(--surface2)',
          border:     `1px solid ${isUser ? 'rgba(79,127,255,0.2)' : 'var(--border)'}`,
          color:      'var(--text)',
        }}
      >
        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <div
            className={`ai-content ${isStreaming ? 'ai-streaming' : ''}`}
            dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
          />
        )}
      </div>

      {/* Insert code button */}
      {!isUser && message.hasCode && message.codeSnippet && (
        <button
          onClick={() => onInsert(message.codeSnippet!)}
          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded mt-1 transition-colors hover:opacity-80"
          style={{ background: 'var(--green-s)', color: 'var(--green)', fontSize: '9.5px' }}
        >
          <Code size={9} /> Insert into editor
        </button>
      )}
    </div>
  )
}

function formatMessage(text: string): string {
  if (!text) return ''
  return text
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:var(--text);font-weight:600">$1</strong>')
    .replace(/\n/g, '<br>')
}

'use client'
import { useState, useCallback, useRef } from 'react'
import type { AiMessage } from '@/types'

export function useAiStream() {
  const [messages,   setMessages]   = useState<AiMessage[]>([])
  const [streaming,  setStreaming]   = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (
    content:   string,
    context:   string,
    ptVersion: string,
  ) => {
    if (streaming) return

    // Add user message
    const userMsg: AiMessage = {
      id:        crypto.randomUUID(),
      role:      'user',
      content,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])

    // Add empty assistant message for streaming
    const assistantId = crypto.randomUUID()
    const assistantMsg: AiMessage = {
      id:        assistantId,
      role:      'assistant',
      content:   '',
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, assistantMsg])
    setStreaming(true)

    try {
      abortRef.current = new AbortController()

      // Build messages for API
      const apiMessages = [
        // Include last 6 messages for context
        ...messages.slice(-6).map(m => ({
          role:    m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: `${context}\n\n${content}` },
      ]

      const resp = await fetch('/api/ai/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages:     apiMessages,
          mode:         'studio',
        }),
        signal: abortRef.current.signal,
      })

      if (!resp.ok) throw new Error('API error')
      if (!resp.body) throw new Error('No stream body')

      const reader  = resp.body.getReader()
      const decoder = new TextDecoder()
      let fullText  = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data) as { text: string }
            fullText += parsed.text
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: fullText }
                  : m
              )
            )
          } catch { /* skip malformed chunks */ }
        }
      }

      // Mark message as complete (extract code snippet if present)
      const codeMatch = fullText.match(/```[\w]*\n([\s\S]*?)```/)
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? {
                ...m,
                content:     fullText,
                hasCode:     !!codeMatch,
                codeSnippet: codeMatch?.[1]?.trim(),
              }
            : m
        )
      )

    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === 'AbortError'
      if (!isAbort) {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: '⚠️ Unable to reach AI. Check your API key in `.env.local`.' }
              : m
          )
        )
      }
    } finally {
      setStreaming(false)
    }
  }, [messages, streaming])

  function clearMessages() {
    setMessages([])
  }

  function stopStream() {
    abortRef.current?.abort()
    setStreaming(false)
  }

  return { messages, streaming, sendMessage, clearMessages, stopStream }
}

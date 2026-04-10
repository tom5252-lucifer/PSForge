// ─────────────────────────────────────────────
// API Route: /api/ai/chat
// Handles OpenAI API streaming calls
// Server-side only — API key never exposed
// ─────────────────────────────────────────────

import OpenAI from 'openai'
import { NextRequest } from 'next/server'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      systemPrompt,
      mode = 'studio',
    } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Build system prompt based on mode
    const system = systemPrompt || buildSystemPrompt(mode)

    // Build messages array with system prompt prepended
    const apiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: system },
      ...messages,
    ]

    // Stream response
    const stream = await client.chat.completions.create({
      model:      'gpt-4o',
      max_tokens: 1024,
      messages:   apiMessages,
      stream:     true,
    })

    // Return as SSE stream
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content
            if (text) {
              const data = JSON.stringify({ text })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
      },
    })

  } catch (error: unknown) {
    console.error('AI route error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

function buildSystemPrompt(mode: string): string {
  if (mode === 'studio') {
    return `You are PSforge AI — an expert PeopleSoft Technical Architect embedded inside a PeopleCode development tool.

You have 20+ years of deep expertise in:
- PeopleCode: all events, built-in functions, Application Classes, Component Processor model
- Application Engine: batch processing, state records, restart logic, Meta-SQL
- Integration Broker: service operations, handlers, routings, OnNotify subscription code
- Component Interfaces: CI design, error handling, batch CI patterns
- SQR: report writing, data processing, PS-specific patterns
- Data Mover: export/import, migration patterns
- PeopleSoft Security: roles, permission lists, row-level security

RESPONSE RULES:
1. Be concise and developer-focused — no fluff
2. Use exact PeopleCode syntax in all examples
3. When suggesting code, wrap it in a code block using triple backticks
4. Always mention which event/context your answer applies to
5. If you detect an anti-pattern in the shared code, call it out directly
6. Reference PeopleTools version where behaviour differs between versions
7. Format: answer first, then example code, then any caveats`
  }

  return `You are PSforge AI — a PeopleSoft functional and technical expert.
Answer questions about PeopleSoft HCM, FSCM, PeopleTools, and related topics.
Be precise, practical, and developer/consultant-focused.`
}

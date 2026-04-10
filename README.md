# PSforge — PeopleSoft Developer Studio

> PeopleCode IDE · Static Analyser · AI Assistant · PeopleBooks Reference  
> Built with Next.js 14 · TypeScript · Tailwind CSS · Monaco Editor · Claude API

---

## Deploy to Vercel (Recommended — Free, No Install Needed)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Fork or push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import GitHub repo
3. Add environment variable: `ANTHROPIC_API_KEY`
4. Click Deploy — live in ~2 minutes

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Add API key
cp .env.example .env.local
# Edit .env.local → paste your Anthropic API key

# 3. Start dev server
npm run dev
# Opens at http://localhost:3000
```

**Requirements:** Node.js 18+

---

## Features

| Feature | Detail |
|---------|--------|
| **Object Tree** | Record Field, Component, Page, AE, App Package, CI, IB Subscription |
| **SQL & Scripts** | AE SQL Steps, SQR Programs, Data Mover Scripts |
| **Multi-tab editor** | Multiple files open simultaneously |
| **Syntax highlighting** | PeopleCode, SQL, SQR, Data Mover |
| **Static analyser** | 12 anti-pattern rules with severity |
| **Execution trace** | Line-by-line code flow visualisation |
| **PeopleBooks Ref** | Oracle Help Center links per PT version |
| **AI Assistant** | Context-aware Claude AI with streaming |
| **Insert from AI** | One-click insert AI code into editor |
| **Dark/Light mode** | Persistent theme preference |
| **PT version selector** | PT 8.57 → 8.62, version-specific docs |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key — server-side only, never exposed |

Get a free key at [console.anthropic.com](https://console.anthropic.com)

---

## Project Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                    ← Main app
│   └── api/ai/chat/route.ts        ← Claude API (server-side)
├── components/
│   ├── layout/TopBar.tsx
│   ├── tree/ObjectTree.tsx
│   ├── editor/EditorPanel.tsx
│   ├── editor/FileTabs.tsx
│   ├── editor/StatusBar.tsx
│   ├── diagnostics/DiagnosticsPanel.tsx
│   └── ai/AiPanel.tsx
├── config/
│   ├── objectTree.ts               ← PS objects & events
│   ├── antPatterns.ts              ← 12 analysis rules
│   └── ptVersions.ts               ← PT 8.57–8.62
├── hooks/
│   ├── useTheme.ts
│   └── useAiStream.ts
├── lib/
│   ├── analyser.ts
│   └── monacoLanguages.ts
└── types/index.ts
```

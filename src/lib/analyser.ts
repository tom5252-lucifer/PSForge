// ─────────────────────────────────────────────
// PSforge Analyser Engine
// Runs anti-pattern rules against code
// Returns structured diagnostic results
// ─────────────────────────────────────────────

import { ANTI_PATTERNS, GOOD_PATTERNS } from '@/config/antPatterns'
import { buildOracleUrl, getVersionUrlCode } from '@/config/ptVersions'
import type { DiagnosticResult, TraceStep, AnalysisResult } from '@/types'

export function analyseCode(
  code: string,
  eventId: string,
  ptVersion: string
): AnalysisResult {
  const errors:   DiagnosticResult[] = []
  const warnings: DiagnosticResult[] = []
  const good:     DiagnosticResult[] = []
  const urlCode = getVersionUrlCode(ptVersion)
  const lines   = code.split('\n')

  // ── Run Anti-Pattern Rules ──────────────────
  for (const rule of ANTI_PATTERNS) {
    const appliesToEvent =
      rule.events.includes('*') ||
      rule.events.includes(eventId)

    if (!appliesToEvent) continue
    if (!rule.pattern.test(code)) continue

    // Skip if good pattern is also present
    if (rule.goodPattern && rule.goodPattern.test(code)) continue

    // Find which line the pattern appears on
    let lineNumber: number | undefined
    for (let i = 0; i < lines.length; i++) {
      if (rule.pattern.test(lines[i])) {
        lineNumber = i + 1
        break
      }
    }

    const result: DiagnosticResult = {
      id:           rule.id,
      severity:     rule.severity,
      title:        rule.title,
      message:      rule.message,
      detail:       rule.detail,
      suggestion:   rule.suggestion,
      line:         lineNumber,
      oraclePage:   rule.oraclePage,
      oracleSection: rule.oracleSection,
      oracleSummary: rule.oracleSummary,
      oracleUrl:    buildOracleUrl(urlCode, rule.oraclePage),
    }

    if (rule.severity === 'error') {
      errors.push(result)
    } else {
      warnings.push(result)
    }
  }

  // ── Good Pattern Detection ──────────────────
  for (const gp of GOOD_PATTERNS) {
    const applies = gp.events.includes('*') || gp.events.includes(eventId)
    if (!applies) continue
    if (!gp.pattern.test(code)) continue

    good.push({
      id:         gp.id,
      severity:   'ok',
      title:      'Good Practice',
      message:    gp.message,
      detail:     '',
      suggestion: '',
    })
  }

  // ── Build Execution Trace ───────────────────
  const trace = buildTrace(lines)

  return { errors, warnings, good, trace }
}

function buildTrace(lines: string[]): TraceStep[] {
  const steps: TraceStep[] = []

  for (let i = 0; i < lines.length; i++) {
    const raw     = lines[i]
    const trimmed = raw.trim()

    // Skip blank lines and comments
    if (!trimmed) continue
    if (trimmed.startsWith('/*') ||
        trimmed.startsWith('*') ||
        trimmed.startsWith('!') ||
        trimmed.startsWith('//')) continue

    let type: TraceStep['type'] = 'info'
    let icon  = '→'
    let label = 'statement'

    if (/^import\s/i.test(trimmed)) {
      type = 'import'; icon = '⬢'; label = 'import'
    } else if (/^Local\s/i.test(trimmed)) {
      type = 'var'; icon = '⬡'; label = 'declare'
    } else if (/^If\s/i.test(trimmed)) {
      type = 'if'; icon = '⤷'; label = 'if'
    } else if (/^Else/i.test(trimmed)) {
      type = 'if'; icon = '⤷'; label = 'else'
    } else if (/^End-If/i.test(trimmed)) {
      type = 'end'; icon = '⤴'; label = 'end-if'
    } else if (/^For\s|^While\s|^Repeat/i.test(trimmed)) {
      type = 'if'; icon = '↻'; label = 'loop'
    } else if (/^End-For|^End-While|^Until/i.test(trimmed)) {
      type = 'end'; icon = '⤴'; label = 'end-loop'
    } else if (/SQLExec|CreateSQL/i.test(trimmed)) {
      type = 'sql'; icon = '⊗'; label = 'SQL'
    } else if (/CallAppEngine/i.test(trimmed)) {
      type = 'call'; icon = '⚙'; label = 'AE call'
    } else if (/\.Value\s*=/i.test(trimmed)) {
      type = 'set'; icon = '✎'; label = 'set value'
    } else if (/Error\s|Warning\s/i.test(trimmed)) {
      type = 'error'; icon = '⚠'; label = 'error/warn'
    } else if (/try$/i.test(trimmed)) {
      type = 'call'; icon = '⟨'; label = 'try'
    } else if (/catch/i.test(trimmed)) {
      type = 'call'; icon = '⟩'; label = 'catch'
    }

    steps.push({
      line:  i + 1,
      type,
      icon,
      label,
      code:  trimmed.substring(0, 72),
    })
  }

  return steps
}

export type Theme   = 'dark' | 'light'
export type AppTab  = 'studio' | 'psagent'
export type BottomTab = 'errors' | 'warnings' | 'trace' | 'suggestions' | 'peoplebooks'

export interface AiMessage {
  id:           string
  role:         'user' | 'assistant'
  content:      string
  timestamp:    Date
  hasCode?:     boolean
  codeSnippet?: string
}

export interface DiagnosticResult {
  id:             string
  severity:       'error' | 'warning' | 'ok' | 'info'
  title:          string
  message:        string
  detail:         string
  suggestion:     string
  line?:          number
  oraclePage?:    string
  oracleSection?: string
  oracleSummary?: string
  oracleUrl?:     string
}

export interface TraceStep {
  line:  number
  type:  'var' | 'sql' | 'if' | 'end' | 'call' | 'set' | 'import' | 'error' | 'info'
  icon:  string
  label: string
  code:  string
}

export interface AnalysisResult {
  errors:   DiagnosticResult[]
  warnings: DiagnosticResult[]
  good:     DiagnosticResult[]
  trace:    TraceStep[]
}

export interface FileTab {
  id:          string
  label:       string
  objectId:    string
  eventId:     string
  language:    string
  code:        string
  isDirty:     boolean
  diagnostics: DiagnosticResult[]
}

'use client'

interface StatusBarProps {
  line:       number
  column:     number
  language:   string
  fontSize:   number
  errorCount: number
  warnCount:  number
  onFontSize: (n: number) => void
}

export function StatusBar({
  line, column, language, fontSize,
  errorCount, warnCount, onFontSize,
}: StatusBarProps) {
  const langLabel: Record<string, string> = {
    peoplecode: 'PeopleCode',
    sql:        'SQL',
    sqr:        'SQR',
    datamover:  'Data Mover',
  }

  return (
    <div
      className="flex items-center justify-between px-3 h-5 flex-shrink-0 text-xs"
      style={{
        background:  'var(--surface)',
        borderTop:   '1px solid var(--border)',
        color:       'var(--muted)',
        fontFamily:  'var(--font-mono)',
        fontSize:    '10px',
      }}
    >
      {/* Left: position + language */}
      <div className="flex items-center gap-3">
        <span>Ln {line}, Col {column}</span>
        <span style={{ color: 'var(--border2)' }}>|</span>
        <span style={{ color: 'var(--text2)' }}>{langLabel[language] ?? language}</span>
        <span style={{ color: 'var(--border2)' }}>|</span>
        <span>UTF-8</span>
        <span style={{ color: 'var(--border2)' }}>|</span>
        <span>Spaces: 3</span>
      </div>

      {/* Right: diagnostics + font size */}
      <div className="flex items-center gap-2">
        {errorCount > 0 && (
          <span
            className="px-1.5 py-0.5 rounded"
            style={{ background: 'var(--red-s)', color: 'var(--red)' }}
          >
            ✕ {errorCount}
          </span>
        )}
        {warnCount > 0 && (
          <span
            className="px-1.5 py-0.5 rounded"
            style={{ background: 'var(--amber-s)', color: 'var(--amber)' }}
          >
            ⚠ {warnCount}
          </span>
        )}
        {errorCount === 0 && warnCount === 0 && (
          <span style={{ color: 'var(--green)', fontSize: '10px' }}>✓ No issues</span>
        )}

        <span style={{ color: 'var(--border2)' }}>|</span>

        {/* Font size control */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onFontSize(Math.max(10, fontSize - 1))}
            className="px-1 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--muted2)', fontFamily: 'var(--font-sans)' }}
            title="Decrease font size"
          >
            A-
          </button>
          <span style={{ color: 'var(--text2)', minWidth: 24, textAlign: 'center' }}>
            {fontSize}px
          </span>
          <button
            onClick={() => onFontSize(Math.min(20, fontSize + 1))}
            className="px-1 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--muted2)', fontFamily: 'var(--font-sans)' }}
            title="Increase font size"
          >
            A+
          </button>
        </div>
      </div>
    </div>
  )
}

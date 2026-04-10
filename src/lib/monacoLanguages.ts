// ─────────────────────────────────────────────
// Monaco Editor — PeopleCode Language Definition
// Syntax highlighting, keywords, autocomplete
// ─────────────────────────────────────────────

import type { languages } from 'monaco-editor'

export const PEOPLECODE_LANGUAGE_ID = 'peoplecode'

export const PEOPLECODE_TOKENS: languages.IMonarchLanguage = {
  ignoreCase: true,
  defaultToken: 'text',

  keywords: [
    'And', 'Break', 'By', 'Call', 'Catch', 'Class', 'Constant', 'Continue',
    'Declare', 'Else', 'End-Call', 'End-Class', 'End-Evaluate', 'End-For',
    'End-Function', 'End-Get', 'End-If', 'End-Method', 'End-Program',
    'End-Set', 'End-When', 'End-While', 'Evaluate', 'Exception', 'Exit',
    'Extends', 'False', 'For', 'Function', 'Get', 'Global', 'If', 'Import',
    'Instance', 'Interface', 'Local', 'Method', 'Mod', 'Not', 'Null', 'Object',
    'Of', 'Or', 'Otherwise', 'Out', 'PeopleCode', 'Program', 'Property',
    'Ref', 'Repeat', 'Return', 'Returns', 'Row', 'Rowset', 'Set', 'Step',
    'Then', 'Throw', 'To', 'True', 'Try', 'Until', 'Var', 'When', 'When-Other',
    'While', 'Abstract', 'As', 'End-Try', 'end-method', 'end-class',
  ],

  builtins: [
    'GetRowset', 'GetRecord', 'GetField', 'GetRow', 'GetGrid', 'GetLevel0',
    'SQLExec', 'CreateSQL', 'GetSQL', 'FetchIntoRecord', 'Close',
    'CallAppEngine', 'CommitWork', 'Transfer', 'TransferPage', 'DoModal',
    'DoSave', 'DoSaveNow', 'Error', 'Warning', 'MsgGet', 'MsgGetText',
    'MessageBox', 'WinMessage', 'CreateObject', 'CreateException',
    'CreateArray', 'CreateArrayRept', 'CreateRowset', 'CreateRecord',
    'GetComponent', 'TriggerBusinessEvent', 'AddKeyListItem',
    'ClearKeyList', 'StopFetching', 'FlushBulkInserts',
    'IsUserInRole', 'SetDefaultViewport', 'SetSearchDialogBehavior',
    'RevalidatePassword', 'SyncRequest', 'None', 'All', 'Len', 'Substring',
    'Upper', 'Lower', 'LTrim', 'RTrim', 'String', 'Value', 'Number',
    'DateTimeToTimeZone', 'DateAdd', 'DateDiff', 'Date', 'Time', 'DateTime',
    'IsDate', 'IsNumber', 'IsAlpha', 'IsAlphaNumeric',
  ],

  systemVars: [
    '%Date', '%DateTime', '%Time', '%OperatorId', '%EmployeeId',
    '%BusinessUnit', '%DeptId', '%Session', '%IntBroker', '%This',
    '%Super', '%Mode', '%Component', '%Page', '%Record', '%Field',
    '%Menu', '%BarName', '%ItemName', '%EventName', '%IsUserInRole',
    '%CurrentDateTimeIn', '%DateIn', '%TimeIn', '%DateOut', '%TimeOut',
    '%Bind', '%Table', '%KeyEqual', '%InsertSelect', '%SelectAll',
    '%TruncateTable', '%UpdateStats',
  ],

  tokenizer: {
    root: [
      // Comments
      [/\/\*/, 'comment', '@comment'],
      [/!.*$/, 'comment'],

      // Strings
      [/"([^"\\]|\\.)*"/, 'string'],

      // System variables (% prefix)
      [/%[A-Za-z_][A-Za-z0-9_]*/, 'variable.predefined'],

      // PeopleCode variables (& prefix)
      [/&[A-Za-z_][A-Za-z0-9_]*/, 'variable'],

      // Record.Field pattern
      [/[A-Z_][A-Z0-9_]*\.[A-Z_][A-Z0-9_]*/, 'type.identifier'],

      // Numbers
      [/\b\d+(\.\d+)?\b/, 'number'],

      // Keywords and built-ins
      [/[A-Za-z_][A-Za-z0-9_-]*/, {
        cases: {
          '@keywords': 'keyword',
          '@builtins': 'predefined',
          '@systemVars': 'variable.predefined',
          '@default': 'identifier',
        }
      }],

      // Operators
      [/[=<>!+\-*/|]/, 'operator'],
      [/[();,]/, 'delimiter'],
    ],

    comment: [
      [/\*\//, 'comment', '@pop'],
      [/./, 'comment'],
    ],
  },
}

export const PEOPLECODE_THEME_DARK = {
  base:    'vs-dark' as const,
  inherit: true,
  rules: [
    { token: 'keyword',              foreground: '7B93FF', fontStyle: 'bold' },
    { token: 'predefined',           foreground: 'F59E0B' },
    { token: 'variable',             foreground: 'C8D4F0' },
    { token: 'variable.predefined',  foreground: 'C084FC' },
    { token: 'string',               foreground: '86EFAC' },
    { token: 'number',               foreground: 'C084FC' },
    { token: 'comment',              foreground: '4A5878', fontStyle: 'italic' },
    { token: 'type.identifier',      foreground: '14B8A6' },
    { token: 'operator',             foreground: '7A8AAA' },
    { token: 'delimiter',            foreground: '7A8AAA' },
  ],
  colors: {
    'editor.background':              '#0D1117',
    'editor.foreground':              '#D4DBF0',
    'editor.lineHighlightBackground': '#1A2540',
    'editor.selectionBackground':     '#2A4080',
    'editorLineNumber.foreground':    '#3A4A6A',
    'editorLineNumber.activeForeground': '#7A8AAA',
    'editorCursor.foreground':        '#4F7FFF',
    'editorIndentGuide.background':   '#1C2233',
    'editor.inactiveSelectionBackground': '#1A2540',
  },
}

export const PEOPLECODE_THEME_LIGHT = {
  base:    'vs' as const,
  inherit: true,
  rules: [
    { token: 'keyword',              foreground: '2952CC', fontStyle: 'bold' },
    { token: 'predefined',           foreground: 'B45309' },
    { token: 'variable',             foreground: '1A2040' },
    { token: 'variable.predefined',  foreground: '7C3AED' },
    { token: 'string',               foreground: '166534' },
    { token: 'number',               foreground: '7C3AED' },
    { token: 'comment',              foreground: '6B7280', fontStyle: 'italic' },
    { token: 'type.identifier',      foreground: '0F766E' },
    { token: 'operator',             foreground: '6B7280' },
    { token: 'delimiter',            foreground: '6B7280' },
  ],
  colors: {
    'editor.background':              '#F8FAFF',
    'editor.foreground':              '#1A2040',
    'editor.lineHighlightBackground': '#EEF2FF',
    'editor.selectionBackground':     '#BFDBFE',
    'editorLineNumber.foreground':    '#9CA3AF',
    'editorCursor.foreground':        '#3B6FEF',
  },
}

// SQR language (simplified)
export const SQR_LANGUAGE_ID = 'sqr'
export const SQR_TOKENS: languages.IMonarchLanguage = {
  ignoreCase: true,
  defaultToken: 'text',
  keywords: [
    'begin-report', 'end-report', 'begin-procedure', 'end-procedure',
    'begin-select', 'end-select', 'begin-sql', 'end-sql',
    'begin-heading', 'end-heading', 'begin-footing', 'end-footing',
    'if', 'else', 'end-if', 'while', 'end-while', 'move', 'let',
    'print', 'display', 'do', 'call', 'add', 'subtract', 'multiply',
    'divide', 'string', 'unstring', 'concat',
  ],
  tokenizer: {
    root: [
      [/!.*$/, 'comment'],
      [/"[^"]*"/, 'string'],
      [/'[^']*'/, 'string'],
      [/\$[A-Za-z_]\w*/, 'variable'],
      [/#[A-Za-z_]\w*/, 'variable.predefined'],
      [/\b\d+\b/, 'number'],
      [/[A-Za-z_]\w*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
    ],
  },
}

// Data Mover language (simplified)
export const DM_LANGUAGE_ID = 'datamover'
export const DM_TOKENS: languages.IMonarchLanguage = {
  ignoreCase: true,
  defaultToken: 'text',
  keywords: [
    'EXPORT', 'IMPORT', 'SET', 'REPLACE_ALL', 'REPLACE_DATA',
    'REPLACE_CREATE', 'LOG', 'INPUT', 'OUTPUT', 'NO', 'TRACE',
    'ENCRYPT_PASSWORD', 'WHERE', 'AND', 'OR', 'RUN_SCRIPT',
  ],
  tokenizer: {
    root: [
      [/\/\*/, 'comment', '@block_comment'],
      [/'[^']*'/, 'string'],
      [/"[^"]*"/, 'string'],
      [/\b\d{4}-\d{2}-\d{2}\b/, 'number'],
      [/[A-Za-z_]\w*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
      [/;/, 'delimiter'],
    ],
    block_comment: [
      [/\*\//, 'comment', '@pop'],
      [/./, 'comment'],
    ],
  },
}

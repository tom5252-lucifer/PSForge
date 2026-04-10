// ─────────────────────────────────────────────
// PeopleCode Anti-Pattern Rules
// Every rule maps to Oracle Help Center docs
// across all supported PT versions
// ─────────────────────────────────────────────

export type Severity = 'error' | 'warning' | 'info'

export interface AntiPattern {
  id: string
  pattern: RegExp
  events: string[]
  severity: Severity
  title: string
  message: string
  detail: string
  suggestion: string
  oraclePage: string       // page filename — combined with version urlCode
  oracleSection: string    // section title shown in PeopleBooks Ref tab
  oracleSummary: string    // summary shown before user clicks through
  goodPattern?: RegExp     // if present, code is fine if this also matches
}

export const ANTI_PATTERNS: AntiPattern[] = [
  // ── ERROR RULES ─────────────────────────────
  {
    id: 'sqlexec_rowinit',
    pattern: /SQLExec|CreateSQL|sql\.Execute/i,
    events: ['RowInit'],
    severity: 'error',
    title: 'SQLExec in RowInit',
    message: 'SQLExec detected in RowInit — critical performance issue.',
    detail: 'RowInit fires once per row, per scroll. SQLExec here = N DB calls for N rows.',
    suggestion: 'Move SQL to PostBuild. Load data into a derived work record, then read from it in RowInit.',
    oraclePage: 'concept_RowInitEvent.html',
    oracleSection: 'RowInit Event',
    oracleSummary: 'RowInit fires for every row in every scroll level. Placing SQLExec here causes one database round-trip per row — a critical performance anti-pattern.',
  },
  {
    id: 'sqlex_fieldedit',
    pattern: /SQLExec|CreateSQL/i,
    events: ['FieldEdit'],
    severity: 'error',
    title: 'SQLExec in FieldEdit',
    message: 'SQLExec in FieldEdit fires on every keystroke in some contexts.',
    detail: 'FieldEdit fires continuously during data entry. SQLExec here causes repeated DB hits.',
    suggestion: 'Move validation SQL to FieldChange (fires after user exits the field).',
    oraclePage: 'concept_FieldEditEvent.html',
    oracleSection: 'FieldEdit Event',
    oracleSummary: 'FieldEdit fires on every validation cycle during data entry. SQLExec here can cause repeated database calls. Use FieldChange for post-entry SQL validation.',
  },
  {
    id: 'callae_postbuild',
    pattern: /CallAppEngine/i,
    events: ['PostBuild'],
    severity: 'error',
    title: 'CallAppEngine in PostBuild',
    message: 'CallAppEngine is not supported in PostBuild.',
    detail: 'PostBuild is in the build phase — no commit context exists. CallAppEngine requires a save cycle.',
    suggestion: 'Move CallAppEngine to SavePreChange — the only component event where it is explicitly supported.',
    oraclePage: 'concept_PostBuildEvent.html',
    oracleSection: 'PostBuild Event — Restrictions',
    oracleSummary: 'PostBuild fires during the Component Processor build phase before any save cycle. CallAppEngine requires a commit context which does not exist here. Use SavePreChange instead.',
  },
  {
    id: 'callae_fieldchange',
    pattern: /CallAppEngine/i,
    events: ['FieldChange'],
    severity: 'error',
    title: 'CallAppEngine in FieldChange',
    message: 'CallAppEngine is not supported in FieldChange.',
    detail: 'FieldChange fires interactively — no batch context. Causes unpredictable behaviour.',
    suggestion: 'Use SavePreChange for batch triggers. If you need a process on field change, consider a Component Interface call instead.',
    oraclePage: 'concept_FieldChangeEvent.html',
    oracleSection: 'FieldChange Event — Restrictions',
    oracleSummary: 'FieldChange fires during interactive data entry. CallAppEngine is not supported here and causes unpredictable Component Processor behaviour.',
  },
  {
    id: 'commitwork_component',
    pattern: /CommitWork/i,
    events: ['RowInit', 'FieldChange', 'FieldEdit', 'PostBuild', 'PreBuild', 'Activate', 'SaveEdit'],
    severity: 'error',
    title: 'CommitWork in Component Event',
    message: 'CommitWork in a component event bypasses the save cycle.',
    detail: 'CommitWork commits immediately, bypassing SaveEdit validation and breaking the Component Processor save cycle.',
    suggestion: 'Remove CommitWork. Let the Component Processor manage commits. CommitWork is only valid in App Engine (with restart disabled).',
    oraclePage: 'concept_CommitWork.html',
    oracleSection: 'CommitWork — When Allowed',
    oracleSummary: 'CommitWork commits the current transaction immediately. In component events this bypasses the Component Processor save cycle, breaks SaveEdit validation, and can cause data integrity issues.',
  },
  {
    id: 'error_savepostchange',
    pattern: /\b(Error|Warning)\s+/i,
    events: ['SavePostChange'],
    severity: 'error',
    title: 'Error/Warning in SavePostChange',
    message: 'Error and Warning are ignored in SavePostChange — data is already committed.',
    detail: 'SavePostChange fires after database write. Error/Warning produce no user message and cannot roll back the save.',
    suggestion: 'Move validation logic to SaveEdit (fires before save, can stop the save with Error).',
    oraclePage: 'concept_SavePostChangeEvent.html',
    oracleSection: 'SavePostChange Event',
    oracleSummary: 'Data is already committed to the database at SavePostChange. Error and Warning statements are silently ignored by the Component Processor here.',
  },
  {
    id: 'getrowset_prebuild',
    pattern: /GetRowset|GetRecord|GetField/i,
    events: ['PreBuild'],
    severity: 'error',
    title: 'Buffer Access in PreBuild',
    message: 'Component buffer is not loaded yet in PreBuild.',
    detail: 'GetRowset, GetRecord, GetField all require a loaded buffer. PreBuild fires before the buffer loads.',
    suggestion: 'Move all buffer access to PostBuild where the full component buffer is available.',
    oraclePage: 'concept_PreBuildEvent.html',
    oracleSection: 'PreBuild Event — Buffer Availability',
    oracleSummary: 'PreBuild fires before the component buffer is loaded. GetRowset, GetRecord, and GetField return null or throw a runtime error here. Move buffer access to PostBuild.',
  },
  {
    id: 'msgbox_appengine',
    pattern: /MessageBox/i,
    events: ['OnExecute', 'OnExecute_AC'],
    severity: 'error',
    title: 'MessageBox in App Engine',
    message: 'MessageBox requires a UI session — not valid in App Engine batch context.',
    detail: 'App Engine runs without a browser session. MessageBox throws a runtime error and abends the AE program.',
    suggestion: 'Use state record fields for error logging. Write errors to a log table via SQLExec or use AE built-in error handling.',
    oraclePage: 'concept_ApplicationEnginePrograms.html',
    oracleSection: 'Application Engine — PeopleCode Restrictions',
    oracleSummary: 'Application Engine runs in batch with no UI context. MessageBox requires a browser session and will throw a runtime error causing the AE to abend.',
  },

  // ── WARNING RULES ────────────────────────────
  {
    id: 'setviewport_activate',
    pattern: /SetDefaultViewport/i,
    events: ['Activate'],
    severity: 'warning',
    title: 'SetDefaultViewport in PageActivate',
    message: 'SetDefaultViewport in PageActivate fires on every tab switch.',
    detail: 'PageActivate fires every time the page is displayed, including tab navigation within the component.',
    suggestion: 'Move SetDefaultViewport to PreBuild — fires once on component load only.',
    oraclePage: 'concept_FluidDevelopment.html',
    oracleSection: 'Fluid Development — SetDefaultViewport',
    oracleSummary: 'SetDefaultViewport in PageActivate causes repeated viewport resets on every tab switch. Place it in PreBuild where it fires once on component load.',
  },
  {
    id: 'sql_in_loop',
    pattern: /(?:For\s|While\s|Repeat)[\s\S]{0,200}(?:SQLExec|CreateSQL)/i,
    events: ['*'],
    severity: 'warning',
    title: 'SQL Inside Loop',
    message: 'SQLExec detected inside a loop — potential performance issue.',
    detail: 'One database round-trip per loop iteration. For 1,000 rows = 1,000 separate DB calls.',
    suggestion: 'Move SQL outside the loop. Use CreateSQL with Fetch, or load results into an array before looping.',
    oraclePage: 'concept_PeopleCodePerformance.html',
    oracleSection: 'PeopleCode Performance Guidelines',
    oracleSummary: 'SQLExec inside a For/While loop causes one database round-trip per iteration. Use CreateSQL with Fetch outside the loop or pre-load data into an array.',
  },
  {
    id: 'no_error_handling_ci',
    pattern: /\.Get\(\)|\.Save\(\)/i,
    events: ['OnExecute', 'OnExecute_AC'],
    severity: 'warning',
    title: 'CI Call Without try/catch',
    message: 'Component Interface call detected without try/catch error handling.',
    detail: 'CI Get() or Save() failures without try/catch will abend the App Engine program.',
    suggestion: 'Wrap all CI calls in try/catch. Log errors to state record fields.',
    goodPattern: /try[\s\S]+catch/i,
    oraclePage: 'concept_UsingComponentInterfaces.html',
    oracleSection: 'Using Component Interfaces in PeopleCode',
    oracleSummary: 'Component Interface Get() and Save() calls can fail at runtime. Without try/catch error handling, failures abend the calling program. Always wrap CI calls in try/catch blocks.',
  },
  {
    id: 'getgrid_before_activate',
    pattern: /GetGrid\s*\(/i,
    events: ['PreBuild', 'PostBuild', 'RowInit'],
    severity: 'warning',
    title: 'GetGrid Before PageActivate',
    message: 'GetGrid is only available from PageActivate onward.',
    detail: 'The Grid class requires the page to be rendered before it is accessible.',
    suggestion: 'Move GetGrid calls to PageActivate (Activate event on the Page object).',
    oraclePage: 'concept_GridClass.html',
    oracleSection: 'Grid Class — Availability',
    oracleSummary: 'The Grid class is only available after the page has been rendered. GetGrid called before PageActivate returns null and causes runtime errors.',
  },
]

// ── GOOD PATTERNS (positive reinforcement) ──
export interface GoodPattern {
  id: string
  pattern: RegExp
  events: string[]
  message: string
}

export const GOOD_PATTERNS: GoodPattern[] = [
  {
    id: 'try_catch',
    pattern: /try[\s\S]+catch/i,
    events: ['*'],
    message: 'try/catch error handling detected — good practice.',
  },
  {
    id: 'app_package_import',
    pattern: /import\s+\w+:\w+/i,
    events: ['*'],
    message: 'App Package import detected — object-oriented pattern in use.',
  },
  {
    id: 'no_sql_rowinit',
    pattern: /^(?![\s\S]*(?:SQLExec|CreateSQL))[\s\S]*$/i,
    events: ['RowInit'],
    message: 'No SQLExec in RowInit — correct performance pattern maintained.',
  },
  {
    id: 'state_record_ae',
    pattern: /\w+AET\.\w+/i,
    events: ['OnExecute'],
    message: 'State record usage detected — correct App Engine data pattern.',
  },
]

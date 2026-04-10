// ─────────────────────────────────────────────
// PeopleSoft Object Tree Configuration
// Defines all objects, events, sample code
// ─────────────────────────────────────────────

export type ObjectCategory = 'peoplecode' | 'sql' | 'config'
export type EditorLanguage = 'peoplecode' | 'sql' | 'sqr' | 'datamover'

export interface PSEvent {
  id: string
  label: string
  badge: string
  badgeColor: string
  when: string
  allowed: string[]
  forbidden: string[]
  tips: string[]
  sample: string
  language: EditorLanguage
}

export interface PSObject {
  id: string
  label: string
  icon: string
  color: string
  category: ObjectCategory
  description: string
  language: EditorLanguage
  events: PSEvent[]
  noCode?: boolean        // true = config only, link to PS Agent tab
  noCodeReason?: string
}

export const PS_OBJECTS: PSObject[] = [
  // ── PEOPLECODE OBJECTS ──────────────────────
  {
    id: 'record_field',
    label: 'Record Field Events',
    icon: '⊞',
    color: '#4F7FFF',
    category: 'peoplecode',
    description: 'PeopleCode attached to a specific field on a record definition.',
    language: 'peoplecode',
    events: [
      {
        id: 'FieldDefault', label: 'FieldDefault', badge: 'Default', badgeColor: '#4F7FFF',
        when: 'When page loads and field has no value — sets default',
        allowed: ['Set field default values', 'Read %Date, %OperatorId system variables'],
        forbidden: ['SQLExec (use derived record instead)', 'Error/Warning'],
        tips: ['Fires only when field is blank on page load', 'Use for smart defaults based on user context'],
        language: 'peoplecode',
        sample: `/* FieldDefault — Set intelligent default value */
Local date &today;
&today = %Date;

/* Default effective date to today */
If None(RECORD_NAME.EFFDT.Value) Then
   RECORD_NAME.EFFDT.Value = &today;
End-If;`,
      },
      {
        id: 'FieldFormula', label: 'FieldFormula', badge: 'Formula', badgeColor: '#7B93FF',
        when: 'Fires during field recalculation — rarely used directly',
        allowed: ['Calculated field values', 'Derived field logic'],
        forbidden: ['SQLExec', 'Error/Warning', 'UI operations'],
        tips: ['Use for derived/calculated fields only', 'Prefer FieldChange for interactive updates'],
        language: 'peoplecode',
        sample: `/* FieldFormula — Calculated field */
/* Total = Quantity * Unit Price */
RECORD_NAME.TOTAL_AMT.Value =
   RECORD_NAME.QTY.Value *
   RECORD_NAME.UNIT_PRICE.Value;`,
      },
      {
        id: 'FieldChange', label: 'FieldChange', badge: 'Change', badgeColor: '#22C55E',
        when: 'After user changes a field value and exits the field',
        allowed: ['SQLExec for validation', 'Update related fields', 'Show/hide page elements', 'Error/Warning'],
        forbidden: ['CallAppEngine', 'CommitWork', 'DoModal (use sparingly)'],
        tips: ['Most common event for interactive logic', 'Fires after user exits — not on every keystroke', 'Use GetField to read/write related fields'],
        language: 'peoplecode',
        sample: `/* FieldChange — React to user input */
Local string &deptId;
Local string &deptName;

&deptId = RECORD_NAME.DEPTID.Value;

/* Look up department name */
SQLExec("SELECT DESCR FROM PS_DEPT_TBL
         WHERE DEPTID = :1
         AND EFF_STATUS = 'A'",
         &deptId, &deptName);

If All(&deptName) Then
   RECORD_NAME.DEPT_DESCR.Value = &deptName;
Else
   Error "Department " | &deptId | " is not active.";
End-If;`,
      },
      {
        id: 'FieldEdit', label: 'FieldEdit', badge: 'Edit', badgeColor: '#F59E0B',
        when: 'During field validation — before FieldChange fires',
        allowed: ['Error to reject invalid values', 'Warning to alert user', 'Format validation'],
        forbidden: ['SQLExec (fires too frequently)', 'CallAppEngine', 'Update other fields'],
        tips: ['Use for FORMAT validation only (length, format, range)', 'Move SQL validation to FieldChange', 'Error here prevents field from being accepted'],
        language: 'peoplecode',
        sample: `/* FieldEdit — Format and range validation only */
Local string &empId;
&empId = RECORD_NAME.EMPLID.Value;

/* Validate format — must be 11 characters */
If Len(&empId) <> 11 Then
   Error "Employee ID must be exactly 11 characters.";
End-If;

/* Validate numeric */
If Not IsNumber(&empId) Then
   Error "Employee ID must be numeric only.";
End-If;`,
      },
      {
        id: 'RowInit', label: 'RowInit', badge: 'Row', badgeColor: '#14B8A6',
        when: 'When each row is loaded into the component buffer — fires per row',
        allowed: ['Set display properties (Visible, Enabled)', 'Read field values already loaded', 'Conditional formatting'],
        forbidden: ['SQLExec / CreateSQL (N calls for N rows)', 'CallAppEngine', 'CommitWork'],
        tips: ['NO SQL here — ever. Use derived records loaded in PostBuild', 'Perfect for conditional show/hide logic per row', 'Fires for every row in every scroll level'],
        language: 'peoplecode',
        sample: `/* RowInit — Display logic per row — NO SQL */

/* Show/hide based on status already in buffer */
If RECORD_NAME.EMP_STATUS.Value = "T" Then
   /* Terminated — grey out editable fields */
   RECORD_NAME.DEPTID.Enabled = False;
   RECORD_NAME.JOBCODE.Enabled = False;
   RECORD_NAME.STATUS_LBL.Style = "PSINACTIVE";
Else
   RECORD_NAME.DEPTID.Enabled = True;
   RECORD_NAME.JOBCODE.Enabled = True;
End-If;`,
      },
      {
        id: 'RowInsert', label: 'RowInsert', badge: 'Insert', badgeColor: '#EC4899',
        when: 'When user inserts a new row in a scroll/grid',
        allowed: ['Set defaults for new row', 'Copy values from previous row', 'Generate sequence numbers'],
        forbidden: ['CommitWork', 'CallAppEngine'],
        tips: ['Use to default new row data from parent row', 'Good place for sequence number generation'],
        language: 'peoplecode',
        sample: `/* RowInsert — Default new row values */
Local integer &nextSeq;
Local Rowset &rs;

&rs = GetRowset();
&nextSeq = &rs.ActiveRowCount;

/* Set sequence number for new row */
RECORD_NAME.SEQ_NBR.Value = &nextSeq;

/* Copy header data to detail row */
RECORD_NAME.BUSINESS_UNIT.Value =
   GetRecord(Record.HEADER_REC).BUSINESS_UNIT.Value;`,
      },
      {
        id: 'SaveEdit', label: 'SaveEdit', badge: 'Save', badgeColor: '#EF4444',
        when: 'Before save — final cross-field validation across all rows',
        allowed: ['Error to stop save', 'Warning to alert but allow save', 'Cross-field validation', 'Cross-row validation'],
        forbidden: ['CommitWork', 'Database updates (not yet saved)', 'CallAppEngine'],
        tips: ['Last chance to stop a bad save', 'Error here prevents save — Warning allows it', 'Can access all rows in all scrolls for cross-validation'],
        language: 'peoplecode',
        sample: `/* SaveEdit — Final cross-field validation */
Local string &empId;
Local date &startDt;
Local date &endDt;

&empId  = RECORD_NAME.EMPLID.Value;
&startDt = RECORD_NAME.EFFDT.Value;
&endDt   = RECORD_NAME.END_DATE.Value;

/* Required field check */
If None(&empId) Then
   Error MsgGet(30000, 5, "Employee ID is required.");
End-If;

/* Date range validation */
If All(&endDt) Then
   If &endDt < &startDt Then
      Error "End date cannot be before effective date.";
   End-If;
End-If;`,
      },
      {
        id: 'SavePreChange', label: 'SavePreChange', badge: 'Save', badgeColor: '#14B8A6',
        when: 'After SaveEdit passes — just before database write',
        allowed: ['CallAppEngine ✓', 'SQLExec', 'Data transformations', 'Audit logging', 'Component Interface calls'],
        forbidden: ['Error/Warning (ignored)', 'Modifying component buffer (too late)'],
        tips: ['ONLY component event where CallAppEngine is supported', 'Errors/Warnings are silently ignored here', 'Best place for audit logging and batch triggers'],
        language: 'peoplecode',
        sample: `/* SavePreChange — Pre-save processing */
/* CallAppEngine IS supported here */

Local string &userId;
&userId = %OperatorId;

/* Audit log */
SQLExec("INSERT INTO PS_AUDIT_LOG
         (EMPLID, CHANGED_BY, CHANGE_DT)
         VALUES (:1, :2, %DateIn(:3))",
         RECORD_NAME.EMPLID.Value,
         &userId, %Date);

/* Trigger batch if flagged */
If RECORD_NAME.TRIGGER_BATCH.Value = "Y" Then
   CallAppEngine("MY_BATCH_AE");
End-If;`,
      },
      {
        id: 'SavePostChange', label: 'SavePostChange', badge: 'Save', badgeColor: '#F97316',
        when: 'After database write — data is committed',
        allowed: ['Post-save notifications', 'Email triggers', 'External system calls via IB'],
        forbidden: ['Error/Warning (ignored after commit)', 'Rollback not possible'],
        tips: ['Data is committed — cannot roll back', 'Use for notifications and downstream triggers', 'Error/Warning produce no effect here'],
        language: 'peoplecode',
        sample: `/* SavePostChange — Post-save actions */
/* Data IS committed at this point */

Local string &empId;
Local string &email;

&empId = RECORD_NAME.EMPLID.Value;

/* Notify manager after successful save */
SQLExec("SELECT EMAILID FROM PS_PERSONAL_DT
         WHERE EMPLID = :1", &empId, &email);

If All(&email) Then
   TriggerBusinessEvent(BusinessEvent.NOTIFY_MANAGER);
End-If;`,
      },
    ],
  },

  {
    id: 'component',
    label: 'Component Events',
    icon: '⊟',
    color: '#14B8A6',
    category: 'peoplecode',
    description: 'PeopleCode at the component level — applies across all records in the component.',
    language: 'peoplecode',
    events: [
      {
        id: 'PreBuild', label: 'PreBuild', badge: 'Build', badgeColor: '#22C55E',
        when: 'Before component buffer loads — search criteria available, no page data yet',
        allowed: ['Security checks and redirects', 'SetDefaultViewport (Fluid)', 'Set component-level state', 'DoModal for pre-checks'],
        forbidden: ['GetField / GetRecord (buffer not loaded)', 'GetRowset', 'SQLExec against page records'],
        tips: ['Fluid: SetDefaultViewport goes HERE — fires once only', 'Buffer NOT loaded — cannot access record fields', 'Best place for security redirects'],
        language: 'peoplecode',
        sample: `/* PreBuild — Before buffer loads */
import PT_PAGE_UTILS:Utils;

/* Fluid: set viewport once here, not in PageActivate */
PT_PAGE_UTILS:Utils.SetDefaultViewport();

/* Security redirect */
If Not %IsUserInRole("HCM_Employee_Admin") Then
   Transfer(False,
      MenuName.EMPLOYEE_SELF_SERVICE,
      BarName.USE,
      ItemName.HR_EE_PERS_DATA,
      Page.HR_PERS_DATA, "U");
End-If;`,
      },
      {
        id: 'PostBuild', label: 'PostBuild', badge: 'Build', badgeColor: '#4F7FFF',
        when: 'After component buffer fully loaded — all rows available',
        allowed: ['GetRowset', 'GetRecord', 'GetField', 'Hide/show elements', 'Complex initialization', 'SQLExec for setup data'],
        forbidden: ['CallAppEngine (use SavePreChange)', 'CommitWork'],
        tips: ['Full buffer access — most complex init goes here', 'Runs AFTER all RowInit events complete', 'Load lookup data here for RowInit to consume'],
        language: 'peoplecode',
        sample: `/* PostBuild — Full buffer available */

Local Rowset &rs;
Local Row &row;

&rs  = GetRowset();
&row = &rs.GetRow(1);

/* Role-based UI */
If %IsUserInRole("HCM_Manager") Then
   &row.GetRecord(Record.APPROVAL_WRK)
      .APPROVE_BTN.Visible = True;
Else
   &row.GetRecord(Record.APPROVAL_WRK)
      .APPROVE_BTN.Visible = False;
End-If;`,
      },
      {
        id: 'SearchInit', label: 'SearchInit', badge: 'Search', badgeColor: '#F59E0B',
        when: 'Search page init — before user enters search criteria',
        allowed: ['SetDefault on search keys', 'Restrict search', 'AddKeyListItem'],
        forbidden: ['GetRowset (no component buffer yet)', 'Transfer', 'Error (avoid)'],
        tips: ['Use SearchDefault to auto-populate AND lock a search key', 'Restricting search here improves performance (server-side filter)'],
        language: 'peoplecode',
        sample: `/* SearchInit — Pre-populate search */

/* Default to user's business unit */
SEARCH_REC.BUSINESS_UNIT.Value = %BusinessUnit;

/* Restrict non-admins to their department */
If Not %IsUserInRole("HRMS_ADMINISTRATOR") Then
   SEARCH_REC.DEPTID.Value = %DeptId;
   SEARCH_REC.DEPTID.SearchDefault = True;
End-If;`,
      },
      {
        id: 'SearchSave', label: 'SearchSave', badge: 'Search', badgeColor: '#EF4444',
        when: 'When user submits search — validate search criteria',
        allowed: ['Error to reject invalid search', 'Validate search keys'],
        forbidden: ['Database updates', 'Transfer'],
        tips: ['Error here prevents search from running', 'Use to enforce "at least one key" rules'],
        language: 'peoplecode',
        sample: `/* SearchSave — Validate search input */

If None(SEARCH_REC.EMPLID.Value) And
   None(SEARCH_REC.LAST_NAME.Value) Then
   Error "Enter Employee ID or Last Name.";
End-If;`,
      },
    ],
  },

  {
    id: 'page',
    label: 'Page Events',
    icon: '▦',
    color: '#A855F7',
    category: 'peoplecode',
    description: 'Page-level PeopleCode — scoped to a specific page within a component.',
    language: 'peoplecode',
    events: [
      {
        id: 'Activate', label: 'Activate (PageActivate)', badge: 'Page', badgeColor: '#A855F7',
        when: 'Every time a page is displayed — including tab switches',
        allowed: ['GetGrid (Grid class requires Activate or later)', 'Hide/show page sections', 'Page-specific security'],
        forbidden: ['SetDefaultViewport (use PreBuild)', 'MessageBox Error (stops all processing)', 'Heavy SQL'],
        tips: ['Grid class ONLY available from PageActivate onward', 'Fires on EVERY tab switch — keep lightweight', 'SetDefaultViewport belongs in PreBuild'],
        language: 'peoplecode',
        sample: `/* PageActivate — Fires on every page display */
/* Grid class available here */

Local Grid &grid;

&grid = GetGrid(Page.MY_PAGE, "SCROLL_NAME");

/* Role-based column visibility */
If Not %IsUserInRole("FINANCE_ADMIN") Then
   &grid.GetColumn("SALARY").Visible = False;
End-If;

/* Page security check */
If %Mode = "A" And
   Not %IsUserInRole("HR_RECRUITER") Then
   Transfer(False,
      MenuName.EMPLOYEE_SS,
      BarName.USE,
      ItemName.HR_PERS_DATA,
      Page.HR_PERS_DATA, "U");
End-If;`,
      },
    ],
  },

  {
    id: 'app_engine',
    label: 'Application Engine',
    icon: '⚙',
    color: '#F59E0B',
    category: 'peoplecode',
    description: 'Batch PeopleCode in an AE action — OnExecute context.',
    language: 'peoplecode',
    events: [
      {
        id: 'OnExecute', label: 'OnExecute (AE Action)', badge: 'Batch', badgeColor: '#F59E0B',
        when: 'When the App Engine executes this step — batch context, no UI',
        allowed: ['SQLExec', 'CommitWork (if restart disabled)', 'Component Interface calls', 'File I/O', 'CreateSQL/Fetch'],
        forbidden: ['GetRowset (no component buffer)', 'GetRecord', 'MessageBox', 'Error/Warning', 'DoModal', 'Transfer'],
        tips: ['Always use try/catch around CI calls', 'Reference fields via State Record: MY_AE_AET.FIELDNAME', 'No component buffer — GetRowset/GetRecord will fail', 'MessageBox will abend the AE'],
        language: 'peoplecode',
        sample: `/* App Engine OnExecute */
/* State Record: MY_AE_AET */

Local ApiObject &myCI;
Local boolean &saved;
Local string &emplid;

&emplid = MY_AE_AET.EMPLID;

try
   &myCI = %Session.GetCompIntfc(CompIntfc.CI_JOB_DATA);
   &myCI.InteractiveMode = False;
   &myCI.GetHistoryItems = False;
   &myCI.KEYPROP_EMPLID   = &emplid;
   &myCI.KEYPROP_EMPL_RCD = "0";

   If &myCI.Get() Then
      /* Process record */
      &saved = &myCI.Save();
      If Not &saved Then
         MY_AE_AET.ERROR_FLAG = "Y";
         MY_AE_AET.ERROR_MSG  =
            &myCI.PSMessages.Item(1).Text;
      End-If;
   End-If;

catch Exception &ex
   MY_AE_AET.ERROR_FLAG = "Y";
   MY_AE_AET.ERROR_MSG  = &ex.ToString();
end-try;`,
      },
    ],
  },

  {
    id: 'app_package',
    label: 'Application Package',
    icon: '◈',
    color: '#22C55E',
    category: 'peoplecode',
    description: 'Object-oriented PeopleCode in Application Class methods.',
    language: 'peoplecode',
    events: [
      {
        id: 'OnExecute_AC', label: 'Class Method / OnExecute', badge: 'Class', badgeColor: '#22C55E',
        when: 'Called by framework (AWE, EMF, CI) or explicitly via CreateObject / import',
        allowed: ['All PeopleCode', 'Full OOP patterns', 'Component buffer access (if called from component context)', 'Batch operations (if called from AE)'],
        forbidden: ['MessageBox if called from batch', 'GetRowset without checking context', 'Modal dialogs if called from SavePreChange'],
        tips: ['Context depends on WHO calls this class', 'Use %This to call other methods', 'Event Mapping Framework target — upgrade-safe pattern'],
        language: 'peoplecode',
        sample: `/* Application Class — Event Mapping Handler */
import CUSTOM_PKG:HCMEventHandler;

class HCMEventHandler
   method OnFieldChange();
   method ValidateDeptId(&deptId As string)
      Returns boolean;
end-class;

method OnFieldChange
   /+ Event Mapping: POST-PROCESS FieldChange +/
   Local string  &deptId;
   Local boolean &valid;

   &deptId = GetField(Field.DEPTID).Value;
   &valid  = %This.ValidateDeptId(&deptId);

   If Not &valid Then
      GetField(Field.CUSTOM_FLAG).Value = "E";
      GetField(Field.CUSTOM_FLAG).Style = "PSERROR";
   End-If;
end-method;

method ValidateDeptId
   /+ &deptId as String +/
   /+ Returns Boolean +/
   Local string &result;
   SQLExec("SELECT 'Y' FROM PS_DEPT_TBL
            WHERE DEPTID = :1
            AND EFF_STATUS = 'A'",
            &deptId, &result);
   Return All(&result);
end-method;`,
      },
    ],
  },

  {
    id: 'comp_interface',
    label: 'Component Interface',
    icon: '⇄',
    color: '#14B8A6',
    category: 'peoplecode',
    description: 'PeopleCode in Component Interface OnExecute — used for CI-level pre/post processing.',
    language: 'peoplecode',
    events: [
      {
        id: 'CI_OnExecute', label: 'OnExecute (CI)', badge: 'CI', badgeColor: '#14B8A6',
        when: 'Called when CI is invoked — pre/post processing on CI properties',
        allowed: ['Validate CI property values', 'Transform data before component buffer', 'Error to reject invalid CI call'],
        forbidden: ['MessageBox (batch callers have no UI)', 'Heavy SQLExec loops'],
        tips: ['Minimal logic here — CI is already a thin wrapper', 'Use for CI-level data validation only', 'Keep it lightweight — CI is called per record'],
        language: 'peoplecode',
        sample: `/* Component Interface OnExecute */
/* Validate before data reaches component */

Local string &emplId;
&emplId = %This.KEYPROP_EMPLID;

/* Validate key */
If None(&emplId) Then
   Error "Employee ID is required for CI call.";
End-If;

If Len(&emplId) <> 11 Then
   Error "Invalid Employee ID format.";
End-If;`,
      },
    ],
  },

  {
    id: 'ib_subscription',
    label: 'IB Subscription PeopleCode',
    icon: '⇆',
    color: '#EC4899',
    category: 'peoplecode',
    description: 'PeopleCode for Integration Broker inbound message handling — OnNotify event.',
    language: 'peoplecode',
    events: [
      {
        id: 'OnNotify', label: 'OnNotify (Subscription)', badge: 'IB', badgeColor: '#EC4899',
        when: 'When an inbound IB message is received and routed to this subscription handler',
        allowed: ['Parse incoming XML/JSON message', 'Component Interface calls to process data', 'SQLExec for lookups', 'Error handling and logging'],
        forbidden: ['MessageBox (no UI context in IB)', 'DoModal', 'Transfer', 'GetRowset (no component buffer)'],
        tips: ['Use &MSG.GetRowset() to parse message content', 'Always handle errors — failed messages go to IB error queue', 'Use CI to write to PS — do not use SQLExec for inserts'],
        language: 'peoplecode',
        sample: `/* IB Subscription — OnNotify Handler */

Local Message  &msg;
Local Rowset   &rs;
Local Row      &row;
Local Record   &rec;
Local string   &emplId;

&msg = %IntBroker.GetMessage();
&rs  = &msg.GetRowset();
&row = &rs.GetRow(1);
&rec = &row.GetRecord(Record.INBOUND_REC);

&emplId = &rec.EMPLID.Value;

/* Process via Component Interface */
Local ApiObject &ci;
try
   &ci = %Session.GetCompIntfc(
      CompIntfc.CI_PERSONAL_DATA);
   &ci.InteractiveMode = False;
   &ci.KEYPROP_EMPLID  = &emplId;

   If &ci.Get() Then
      /* Update fields from message */
      &ci.Save();
   End-If;

catch Exception &ex
   /* Log to IB error handling */
   throw CreateException(0, 0, &ex.ToString());
end-try;`,
      },
    ],
  },

  // ── SQL & SCRIPTS ──────────────────────────
  {
    id: 'ae_sql',
    label: 'AE SQL Steps',
    icon: '⊞',
    color: '#F97316',
    category: 'sql',
    description: 'Pure SQL steps within an Application Engine program — not PeopleCode.',
    language: 'sql',
    events: [
      {
        id: 'AE_SQL_STEP', label: 'SQL Step', badge: 'SQL', badgeColor: '#F97316',
        when: 'Executes as a direct SQL statement within an AE step — no PeopleCode wrapper',
        allowed: ['INSERT / UPDATE / DELETE on PS tables', 'Meta-SQL: %Table, %DateIn, %Bind', 'State record binds via %Bind()', 'Subqueries and joins'],
        forbidden: ['PeopleCode functions (SQLExec, etc.)', 'Procedural logic (use PeopleCode step)', 'DDL statements'],
        tips: ['Use %Table(RECORD_NAME) not hardcoded PS_ prefix', 'Use %Bind(FIELD) for state record values', 'Use %DateIn(%Bind(DATE_FLD)) for date fields'],
        language: 'sql',
        sample: `/* AE SQL Step — Bulk update using state record */
/* State record fields bound via %Bind() */

UPDATE %Table(JOB)
SET    EMPL_STATUS = 'T',
       EFFDT       = %Bind(PROCESS_DATE),
       LAST_UPDATE_DTTM = %CurrentDateTimeIn
WHERE  EMPLID   = %Bind(EMPLID)
AND    EMPL_RCD = %Bind(EMPL_RCD)
AND    EFFDT    = (
   SELECT MAX(J2.EFFDT)
   FROM   %Table(JOB) J2
   WHERE  J2.EMPLID   = %Bind(EMPLID)
   AND    J2.EMPL_RCD = %Bind(EMPL_RCD)
);`,
      },
    ],
  },

  {
    id: 'sqr',
    label: 'SQR Programs',
    icon: '≡',
    color: '#F97316',
    category: 'sql',
    description: 'SQR (Structured Query Reporter) programs — PS legacy reporting and batch.',
    language: 'sqr',
    events: [
      {
        id: 'SQR_MAIN', label: 'SQR Program', badge: 'SQR', badgeColor: '#F97316',
        when: 'Runs as a PS Process Scheduler job — batch reporting or data processing',
        allowed: ['BEGIN-SELECT / END-SELECT', 'BEGIN-SQL / END-SQL', 'Procedures', 'File I/O', 'Variables'],
        forbidden: ['PeopleCode functions', 'Real-time component buffer access'],
        tips: ['Always use &EMPLID bind variables — never string concatenation', 'Use SHOW for debug output to log', '#include for shared procedures'],
        language: 'sqr',
        sample: `! SQR Program — Employee Report
! ─────────────────────────────

#include 'setenv.sqr'
#include 'setup32.sqr'

begin-report
   do Init-Report
   do Process-Main
   do Wrapup
end-report

begin-procedure Init-Report
   move 'ACTIVE' to $Status
   display 'Starting Employee Report'
end-procedure

begin-procedure Process-Main
begin-select
EMPLID         &EmpId
NAME           &Name
DEPTID         &DeptId
EMPL_STATUS    &Status

   if &Status = 'A'
      print &EmpId    (+1, 1, 11)
      print &Name     (0, 13, 30)
      print &DeptId   (0, 44, 10)
   end-if

FROM  PS_PERSONAL_DT
WHERE EMPL_STATUS = $Status
ORDER BY EMPLID
end-select
end-procedure

begin-procedure Wrapup
   display 'Report complete'
end-procedure`,
      },
    ],
  },

  {
    id: 'data_mover',
    label: 'Data Mover Scripts',
    icon: '⇅',
    color: '#F97316',
    category: 'sql',
    description: 'PeopleSoft Data Mover scripts — used for data import/export and bootstrap.',
    language: 'datamover',
    events: [
      {
        id: 'DM_SCRIPT', label: 'Data Mover Script', badge: 'DM', badgeColor: '#F97316',
        when: 'Runs in PS Data Mover utility — data migration, export, import, system bootstrap',
        allowed: ['EXPORT / IMPORT statements', 'SET commands', 'SQL INSERT/UPDATE via RUN_SCRIPT', 'ENCRYPT_PASSWORD'],
        forbidden: ['PeopleCode', 'Complex joins (use SQL script instead)', 'DDL'],
        tips: ['Always SET LOG before running', 'Use REPLACE_ALL for full table replacement', 'Test EXPORT before IMPORT in new environment'],
        language: 'datamover',
        sample: `/* Data Mover Script — Export and Import */
/* Run in PeopleSoft Data Mover utility */

SET LOG C:\PS\LOGS\dm_export.log;
SET OUTPUT C:\PS\DATA\my_export.dat;

/* Export specific records */
EXPORT PS_INSTALLATION;
EXPORT PS_DEPT_TBL WHERE EFFDT > '2020-01-01';
EXPORT PS_JOBCODE_TBL;

/* ── Import in target environment ── */
SET LOG C:\PS\LOGS\dm_import.log;
SET INPUT C:\PS\DATA\my_export.dat;
SET NO TRACE;

/* Replace existing data */
REPLACE_ALL PS_DEPT_TBL;
REPLACE_ALL PS_JOBCODE_TBL;

IMPORT *;`,
      },
    ],
  },

  // ── CONFIGURATION (no code — links to PS Agent) ──
  {
    id: 'ib_config',
    label: 'IB Setup',
    icon: '⚙',
    color: '#3A4A6A',
    category: 'config',
    description: '',
    language: 'peoplecode',
    noCode: true,
    noCodeReason: 'IB service definitions, routings, connectors and gateway config are App Designer configuration screens — no PeopleCode is written here. Ask PS Agent for IB setup guidance.',
    events: [],
  },
]

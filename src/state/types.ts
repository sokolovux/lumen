export type Role = 'assistant' | 'physician'

export type NoteStatus =
  | 'not_started'
  | 'draft'
  | 'submitted'
  | 'returned'
  | 'cosigned'

export type LabStatus =
  | 'pending'
  | 'requested'
  | 'granted_unstarted'
  | 'active'
  | 'expired'
  | 'denied'
  | 'released'

export type GrantDuration = '10s' | '10m' | '1h' | '4h' | '24h'

export type ScheduleStatus =
  | 'scheduled'
  | 'intake'
  | 'review'
  | 'finished'

export type ScheduleView = 'today' | 'fullWeek'

export interface NoteVersion {
  id: string
  version: number
  status: 'submitted' | 'returned' | 'cosigned'
  actor: Role
  timestamp: string
  feedback?: string
}

export interface LabResult {
  id: string
  name: string
  type: 'lab' | 'imaging'
  orderDate: string
  status: LabStatus
  /** True the moment the assistant requests access; never reset */
  everRequested: boolean
  /** True the first time a physician denies; never reset (drives "Request access again") */
  everDenied?: boolean
  requestId?: string
  grantDuration?: GrantDuration
  /** Set when the assistant confirms/starts the countdown, not at grant time */
  grantExpiresAt?: number
  grantConfirmedAt?: number
  denialReason?: string
  /** Assistant display-only: denial block dismissed on Labs tab; audit / My Requests unchanged */
  denialDismissed?: boolean
}

export interface AuditEvent {
  id: string
  timestamp: string
  actor: Role
  action: string
  detail: string
}

export interface MedicationEvent {
  id: string
  timestamp: string
  actor: Role
  action: 'continued' | 'discontinued' | 'added'
  detail?: string
}

export interface Medication {
  id: string
  name: string
  dose: string
  frequency: string
  status: 'active' | 'discontinued'
  history: MedicationEvent[]
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  time: string
  date: string
  kind: string
  status: ScheduleStatus
  isInteractive?: boolean
}

export interface Patient {
  id: string
  name: string
  mrn: string
  dob: string
  insurance: string
  insurancePolicyNumber: string
  isInteractive?: boolean
}

export interface VisitVitals {
  bloodPressure: string
  heartRate: string
  respiratoryRate: string
  temperature: string
  spO2: string
  weight: string
  painScale: string
  fingerstickGlucose: string
}

export interface AppState {
  role: Role
  selectedVisitId: 'today' | string | null
  visitStarted: boolean
  /** Wall-clock ms when START_VISIT fired; drives the shared encounter timer */
  encounterStartedAt: number | null
  /** Increments each time the physician returns the note for revision */
  revisionCount: number
  vitalsSubmitted: boolean
  vitalsShowErrors: boolean
  vitals: VisitVitals
  noteStatus: NoteStatus
  hasSubmittedOnce: boolean
  visitFinished: boolean
  returnFeedback: string | null
  noteDraft: string
  noteHistory: NoteVersion[]
  confidentialNoteExists: boolean
  confidentialNoteContent: string
  confidentialNoteCommitted: boolean
  /** Physician addendum — shared with the assistant once saved */
  physicianAddendum: string
  physicianAddendumCommitted: boolean
  labs: LabResult[]
  auditLog: AuditEvent[]
  meds: Medication[]
  /** Physician: unread submitted notes awaiting cosign */
  cosignUnread: number
  /** Assistant: unread returned notes awaiting resubmit */
  notesReviewUnread: number
  /** Physician: lab ids of incoming requests that have been opened/viewed */
  viewedRequests: string[]
  /** Assistant: lab ids of outcomes not yet seen via Resolved-tab viewport entry */
  assistantUnseenResolution: string[]
  scheduleView: ScheduleView
  expiryModalLabId: string | null
  pendingGrantLabId: string | null
  pendingGrantDuration: GrantDuration | null
}

export type AppAction =
  | { type: 'RESET_DEMO' }
  | { type: 'SET_ROLE'; role: Role }
  | { type: 'SET_SCHEDULE_VIEW'; view: ScheduleView }
  | { type: 'OPEN_VISIT'; visitId: 'today' | string }
  | { type: 'CLOSE_VISIT' }
  | { type: 'START_VISIT' }
  | { type: 'UPDATE_VITALS'; vitals: Partial<VisitVitals> }
  | { type: 'SHOW_VITALS_ERRORS' }
  | { type: 'SUBMIT_VITALS' }
  | { type: 'UPDATE_NOTE_DRAFT'; content: string }
  | { type: 'SUBMIT_NOTE' }
  | { type: 'COSIGN_NOTE' }
  | { type: 'RETURN_NOTE'; feedback: string }
  | { type: 'FINISH_VISIT' }
  | { type: 'SAVE_CONFIDENTIAL_NOTE'; content: string }
  | { type: 'SAVE_PHYSICIAN_ADDENDUM'; content: string }
  | { type: 'REQUEST_LAB_ACCESS'; labId: string }
  | { type: 'GRANT_LAB_ACCESS'; labId: string; duration: GrantDuration }
  | { type: 'CONFIRM_LAB_GRANT'; labId: string }
  | { type: 'DENY_LAB_ACCESS'; labId: string; feedback: string }
  | { type: 'RELEASE_LAB'; labId: string }
  | { type: 'DISMISS_LAB_DENIAL'; labId: string }
  | { type: 'EXPIRE_LAB'; labId: string }
  | { type: 'DISMISS_EXPIRY_MODAL' }
  | { type: 'TICK_LAB_TIMERS' }
  | { type: 'CONTINUE_MED'; medId: string }
  | { type: 'DISCONTINUE_MED'; medId: string }
  | { type: 'ADD_MEDICATION'; name: string; dose: string; frequency: string }
  | { type: 'MARK_PHYSICIAN_COSIGN_VIEWED' }
  | { type: 'MARK_ASSISTANT_NOTES_REVIEW_VIEWED' }
  | { type: 'MARK_REQUEST_READ'; labId: string }
  | { type: 'MARK_ASSISTANT_RESOLUTION_SEEN'; labId: string }

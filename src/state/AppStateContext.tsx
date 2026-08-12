import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  type Dispatch,
} from 'react'
import type { AppAction, AppState, AuditEvent } from '@/state/types'
import { createInitialLabs, createInitialMeds, JORDAN_REYES_INITIAL_CONFIDENTIAL_NOTE } from '@/lib/scheduleData'
import { JORDAN_REYES_AUDIT_SEED } from '@/lib/jordanReyesAuditSeed'
import { createEmptyVitals, areVitalsComplete } from '@/lib/vitals'
import { formatTimestamp } from '@/lib/fixedClock'
import { durationToMs, formatGrantDurationPhrase } from '@/lib/statusDerivation'

let auditCounter = JORDAN_REYES_AUDIT_SEED.maxAuditSeedId
let noteVersionCounter = JORDAN_REYES_AUDIT_SEED.maxNoteVersion
let medEventCounter = 0

function nextAuditId(): string {
  auditCounter += 1
  return `audit-${auditCounter}`
}

function nextNoteVersion(): number {
  noteVersionCounter += 1
  return noteVersionCounter
}

function nextMedEventId(): string {
  medEventCounter += 1
  return `me-${medEventCounter}`
}

function logAudit(
  state: AppState,
  actor: AppState['role'],
  action: string,
  detail: string,
): AuditEvent {
  return {
    id: nextAuditId(),
    timestamp: formatTimestamp(),
    actor,
    action,
    detail,
  }
}

export const initialState: AppState = {
  role: 'assistant',
  selectedVisitId: null,
  visitStarted: false,
  encounterStartedAt: null,
  revisionCount: 0,
  vitalsShowErrors: false,
  vitals: createEmptyVitals(),
  noteStatus: 'not_started',
  hasSubmittedOnce: false,
  visitFinished: false,
  visitFinishedAt: null,
  returnFeedback: null,
  noteDraft: '',
  noteHistory: [...JORDAN_REYES_AUDIT_SEED.noteHistory],
  confidentialNoteExists: true,
  confidentialNoteContent: JORDAN_REYES_INITIAL_CONFIDENTIAL_NOTE,
  confidentialNoteCommitted: false,
  physicianAddendum: '',
  physicianAddendumCommitted: false,
  labs: createInitialLabs(),
  auditLog: [...JORDAN_REYES_AUDIT_SEED.auditLog],
  meds: createInitialMeds(),
  cosignUnread: 0,
  notesReviewUnread: 0,
  viewedRequests: [],
  assistantUnseenResolution: [],
  scheduleView: 'today',
  expiryModalLabId: null,
  pendingGrantLabId: null,
  pendingGrantDuration: null,
}

function createFreshInitialState(): AppState {
  return {
    ...initialState,
    labs: createInitialLabs(),
    meds: createInitialMeds(),
    vitals: createEmptyVitals(),
    noteHistory: [...JORDAN_REYES_AUDIT_SEED.noteHistory],
    auditLog: [...JORDAN_REYES_AUDIT_SEED.auditLog],
    viewedRequests: [],
    assistantUnseenResolution: [],
  }
}

function withAssistantUnseenResolution(state: AppState, labId: string): string[] {
  return state.assistantUnseenResolution.includes(labId)
    ? state.assistantUnseenResolution
    : [...state.assistantUnseenResolution, labId]
}

function withViewedRequest(state: AppState, labId: string): string[] {
  return state.viewedRequests.includes(labId)
    ? state.viewedRequests
    : [...state.viewedRequests, labId]
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'RESET_DEMO':
      auditCounter = JORDAN_REYES_AUDIT_SEED.maxAuditSeedId
      noteVersionCounter = JORDAN_REYES_AUDIT_SEED.maxNoteVersion
      medEventCounter = 0
      return createFreshInitialState()

    case 'SET_ROLE':
      return { ...state, role: action.role }

    case 'SET_SCHEDULE_VIEW':
      return { ...state, scheduleView: action.view }

    case 'OPEN_VISIT':
      return {
        ...state,
        selectedVisitId: action.visitId,
      }

    case 'CLOSE_VISIT':
      return { ...state, selectedVisitId: null }

    case 'START_VISIT':
      return {
        ...state,
        visitStarted: true,
        encounterStartedAt: state.encounterStartedAt ?? Date.now(),
        auditLog: [
          ...state.auditLog,
          logAudit(state, state.role, 'Start visit', 'Visit started'),
        ],
      }

    case 'UPDATE_VITALS': {
      const vitalsLocked =
        state.role === 'physician' ||
        (state.visitFinished && state.noteStatus !== 'returned') ||
        (state.role === 'assistant' &&
          state.noteStatus !== 'returned' &&
          (state.noteStatus === 'submitted' ||
            state.noteStatus === 'cosigned' ||
            state.hasSubmittedOnce))
      if (vitalsLocked) {
        return state
      }
      const vitals = { ...state.vitals, ...action.vitals }
      return {
        ...state,
        vitals,
        vitalsShowErrors: state.vitalsShowErrors && !areVitalsComplete(vitals),
      }
    }

    case 'SHOW_VITALS_ERRORS':
      return { ...state, vitalsShowErrors: true }

    case 'UPDATE_NOTE_DRAFT': {
      const noteStatus = state.noteStatus === 'not_started' ? 'draft' : state.noteStatus
      return { ...state, noteDraft: action.content, noteStatus }
    }

    case 'SUBMIT_NOTE': {
      const version = nextNoteVersion()
      const resubmit = state.noteHistory.some((entry) => entry.status === 'returned')
      const auditEntries = [...state.auditLog]
      if (areVitalsComplete(state.vitals)) {
        auditEntries.push(
          logAudit(state, state.role, 'Submit vitals', 'Vitals submitted for today\'s visit'),
        )
      }
      auditEntries.push(
        logAudit(
          state,
          state.role,
          'Submit note',
          resubmit
            ? `Note resubmitted (v${version})`
            : `Note submitted (v${version})`,
        ),
      )
      return {
        ...state,
        noteStatus: 'submitted',
        hasSubmittedOnce: true,
        vitalsShowErrors: false,
        returnFeedback: null,
        noteHistory: [
          ...state.noteHistory,
          {
            id: `nv-${version}`,
            version,
            status: 'submitted',
            actor: state.role,
            timestamp: formatTimestamp(),
          },
        ],
        notesReviewUnread: 0,
        cosignUnread: state.cosignUnread + 1,
        auditLog: auditEntries,
      }
    }

    case 'COSIGN_NOTE': {
      const version = nextNoteVersion()
      return {
        ...state,
        noteStatus: 'cosigned',
        cosignUnread: 0,
        notesReviewUnread: state.notesReviewUnread + 1,
        noteHistory: [
          ...state.noteHistory,
          {
            id: `nv-${version}`,
            version,
            status: 'cosigned',
            actor: 'physician',
            timestamp: formatTimestamp(),
          },
        ],
        auditLog: [
          ...state.auditLog,
          logAudit(state, 'physician', 'Approve note', `Note approved (v${version})`),
        ],
      }
    }

    case 'RETURN_NOTE': {
      const version = nextNoteVersion()
      return {
        ...state,
        noteStatus: 'returned',
        returnFeedback: action.feedback,
        revisionCount: state.revisionCount + 1,
        cosignUnread: 0,
        notesReviewUnread: state.notesReviewUnread + 1,
        noteHistory: [
          ...state.noteHistory,
          {
            id: `nv-${version}`,
            version,
            status: 'returned',
            actor: 'physician',
            timestamp: formatTimestamp(),
            feedback: action.feedback,
          },
        ],
        auditLog: [
          ...state.auditLog,
          logAudit(
            state,
            'physician',
            'Return note',
            `Note returned (v${version}). Comment: ${action.feedback}`,
          ),
        ],
      }
    }

    case 'FINISH_VISIT':
      return {
        ...state,
        visitFinished: true,
        visitFinishedAt: Date.now(),
        physicianAddendumCommitted:
          state.physicianAddendum.trim().length > 0 || state.physicianAddendumCommitted,
        auditLog: [
          ...state.auditLog,
          logAudit(state, 'physician', 'Finish visit', 'Visit finished by physician'),
        ],
      }

    case 'UPDATE_PHYSICIAN_ADDENDUM':
      return {
        ...state,
        physicianAddendum: action.content,
        physicianAddendumCommitted: false,
      }

    case 'LOG_PHYSICIAN_ADDENDUM_EDIT':
      return {
        ...state,
        auditLog: [
          ...state.auditLog,
          logAudit(state, 'physician', 'Save physician addendum', 'Physician addendum edited'),
        ],
      }

    case 'LOG_CONFIDENTIAL_NOTE_EDIT':
      return {
        ...state,
        auditLog: [
          ...state.auditLog,
          logAudit(state, 'physician', 'Save confidential note', 'Confidential note edited'),
        ],
      }

    case 'SAVE_CONFIDENTIAL_NOTE': {
      const exists = action.content.trim().length > 0
      return {
        ...state,
        confidentialNoteExists: exists,
        confidentialNoteContent: action.content,
      }
    }

    case 'REQUEST_LAB_ACCESS': {
      const requestId = `req-${action.labId}`
      const lab = state.labs.find((item) => item.id === action.labId)
      const labName = lab?.name ?? action.labId
      return {
        ...state,
        viewedRequests: state.viewedRequests.filter((id) => id !== action.labId),
        labs: state.labs.map((item) =>
          item.id === action.labId
            ? {
                ...item,
                status: 'requested' as const,
                everRequested: true,
                requestId,
                denialReason: undefined,
                denialDismissed: undefined,
              }
            : item,
        ),
        auditLog: [
          ...state.auditLog,
          logAudit(
            state,
            'assistant',
            'Request lab access',
            `Requested access to ${labName}`,
          ),
        ],
      }
    }

    case 'GRANT_LAB_ACCESS': {
      const lab = state.labs.find((item) => item.id === action.labId)
      const labName = lab?.name ?? action.labId
      return {
        ...state,
        pendingGrantLabId: action.labId,
        pendingGrantDuration: action.duration,
        viewedRequests: withViewedRequest(state, action.labId),
        assistantUnseenResolution: withAssistantUnseenResolution(state, action.labId),
        labs: state.labs.map((item) =>
          item.id === action.labId
            ? {
                ...item,
                status: 'granted_unstarted' as const,
                grantDuration: action.duration,
              }
            : item,
        ),
        auditLog: [
          ...state.auditLog,
          logAudit(
            state,
            'physician',
            'Grant lab access',
            `Granted ${formatGrantDurationPhrase(action.duration)} temporary access to ${labName}`,
          ),
        ],
      }
    }

    case 'CONFIRM_LAB_GRANT': {
      const lab = state.labs.find((l) => l.id === action.labId)
      const labName = lab?.name ?? action.labId
      const duration = lab?.grantDuration ?? '10m'
      const now = Date.now()
      return {
        ...state,
        pendingGrantLabId: null,
        pendingGrantDuration: null,
        labs: state.labs.map((l) =>
          l.id === action.labId
            ? {
                ...l,
                status: 'active' as const,
                grantConfirmedAt: now,
                grantExpiresAt: now + durationToMs(duration),
              }
            : l,
        ),
        auditLog: [
          ...state.auditLog,
          logAudit(
            state,
            'assistant',
            'Confirm lab grant',
            `Started temporary access window for ${labName}`,
          ),
        ],
      }
    }

    case 'DENY_LAB_ACCESS': {
      const lab = state.labs.find((item) => item.id === action.labId)
      const labName = lab?.name ?? action.labId
      return {
        ...state,
        viewedRequests: withViewedRequest(state, action.labId),
        assistantUnseenResolution: withAssistantUnseenResolution(state, action.labId),
        labs: state.labs.map((item) =>
          item.id === action.labId
            ? {
                ...item,
                status: 'denied' as const,
                everDenied: true,
                denialReason: action.feedback,
                denialDismissed: false,
              }
            : item,
        ),
        auditLog: [
          ...state.auditLog,
          logAudit(
            state,
            'physician',
            'Deny lab access',
            `Denied access to ${labName}. Reason: ${action.feedback}`,
          ),
        ],
      }
    }

    case 'RELEASE_LAB': {
      const lab = state.labs.find((l) => l.id === action.labId)
      const labName = lab?.name ?? action.labId
      const isResponseToRequest = lab?.status === 'requested'
      const wasActiveGrant =
        lab?.status === 'active' || lab?.status === 'granted_unstarted'
      return {
        ...state,
        viewedRequests: isResponseToRequest
          ? withViewedRequest(state, action.labId)
          : state.viewedRequests,
        assistantUnseenResolution: isResponseToRequest
          ? withAssistantUnseenResolution(state, action.labId)
          : state.assistantUnseenResolution,
        labs: state.labs.map((item) =>
          item.id === action.labId
            ? {
                ...item,
                status: 'released' as const,
                grantExpiresAt: undefined,
                grantConfirmedAt: undefined,
                denialReason: undefined,
              }
            : item,
        ),
        auditLog: [
          ...state.auditLog,
          logAudit(
            state,
            'physician',
            'Release lab result',
            isResponseToRequest
              ? `Permanently released ${labName} in response to access request`
              : wasActiveGrant
                ? `Permanently released ${labName} (converted active temporary grant)`
                : `Permanently released ${labName}`,
          ),
        ],
      }
    }

    case 'DISMISS_LAB_DENIAL': {
      return {
        ...state,
        labs: state.labs.map((lab) =>
          lab.id === action.labId && lab.status === 'denied'
            ? { ...lab, denialDismissed: true }
            : lab,
        ),
      }
    }

    case 'EXPIRE_LAB': {
      const lab = state.labs.find((item) => item.id === action.labId)
      const labName = lab?.name ?? action.labId
      return {
        ...state,
        expiryModalLabId: action.labId,
        labs: state.labs.map((item) =>
          item.id === action.labId
            ? { ...item, status: 'expired' as const, grantExpiresAt: undefined }
            : item,
        ),
        auditLog: [
          ...state.auditLog,
          logAudit(
            state,
            state.role,
            'Lab access expired',
            `Temporary access expired for ${labName}`,
          ),
        ],
      }
    }

    case 'DISMISS_EXPIRY_MODAL':
      return { ...state, expiryModalLabId: null }

    case 'TICK_LAB_TIMERS': {
      const now = Date.now()
      let expiredLabId: string | null = null
      let anyActive = false
      const labs = state.labs.map((lab) => {
        if (lab.status === 'active' && lab.grantExpiresAt) {
          anyActive = true
          if (lab.grantExpiresAt <= now) {
            expiredLabId = lab.id
            return { ...lab, status: 'expired' as const, grantExpiresAt: undefined }
          }
        }
        return lab
      })
      if (expiredLabId) {
        const expiredLab = state.labs.find((lab) => lab.id === expiredLabId)
        const labName = expiredLab?.name ?? expiredLabId
        return {
          ...state,
          labs,
          expiryModalLabId: null,
          auditLog: [
            ...state.auditLog,
            logAudit(
              state,
              state.role,
              'Lab access expired',
              `Temporary access expired for ${labName}`,
            ),
          ],
        }
      }
      // Re-render every second while a countdown is live so cards/views tick
      if (anyActive) {
        return { ...state, labs: [...state.labs] }
      }
      return state
    }

    case 'CONTINUE_MED': {
      const med = state.meds.find((item) => item.id === action.medId)
      const medName = med?.name ?? action.medId
      return {
        ...state,
        meds: state.meds.map((item) =>
          item.id === action.medId
            ? {
                ...item,
                status: 'active',
                history: [
                  ...item.history,
                  {
                    id: nextMedEventId(),
                    timestamp: formatTimestamp(),
                    actor: state.role,
                    action: 'continued',
                  },
                ],
              }
            : item,
        ),
        auditLog: [
          ...state.auditLog,
          logAudit(state, state.role, 'Continue medication', `Continued ${medName}`),
        ],
      }
    }

    case 'DISCONTINUE_MED': {
      const med = state.meds.find((item) => item.id === action.medId)
      const medName = med?.name ?? action.medId
      return {
        ...state,
        meds: state.meds.map((item) =>
          item.id === action.medId
            ? {
                ...item,
                status: 'discontinued',
                history: [
                  ...item.history,
                  {
                    id: nextMedEventId(),
                    timestamp: formatTimestamp(),
                    actor: state.role,
                    action: 'discontinued',
                  },
                ],
              }
            : item,
        ),
        auditLog: [
          ...state.auditLog,
          logAudit(state, state.role, 'Discontinue medication', `Discontinued ${medName}`),
        ],
      }
    }

    case 'ADD_MEDICATION': {
      const id = `med-${Date.now()}`
      return {
        ...state,
        meds: [
          ...state.meds,
          {
            id,
            name: action.name,
            dose: action.dose,
            frequency: action.frequency,
            status: 'active',
            history: [
              {
                id: nextMedEventId(),
                timestamp: formatTimestamp(),
                actor: state.role,
                action: 'added',
                detail: `${action.name} ${action.dose} ${action.frequency}`,
              },
            ],
          },
        ],
        auditLog: [
          ...state.auditLog,
          logAudit(state, state.role, 'Add medication', `Added ${action.name}`),
        ],
      }
    }

    case 'MARK_PHYSICIAN_COSIGN_VIEWED':
      return { ...state, cosignUnread: 0 }

    case 'MARK_ASSISTANT_NOTES_REVIEW_VIEWED':
      return { ...state, notesReviewUnread: 0 }

    case 'MARK_REQUEST_READ':
      return {
        ...state,
        viewedRequests: withViewedRequest(state, action.labId),
      }

    case 'MARK_ASSISTANT_RESOLUTION_SEEN':
      return {
        ...state,
        assistantUnseenResolution: state.assistantUnseenResolution.filter((id) => id !== action.labId),
      }

    default:
      return state
  }
}

interface AppStateContextValue {
  state: AppState
  dispatch: Dispatch<AppAction>
}

const AppStateContext = createContext<AppStateContextValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'TICK_LAB_TIMERS' })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}

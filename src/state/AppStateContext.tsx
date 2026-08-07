import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  type Dispatch,
} from 'react'
import type { AppAction, AppState, AuditEvent } from '@/state/types'
import { createInitialLabs, createInitialMeds } from '@/lib/scheduleData'
import { formatTimestamp } from '@/lib/fixedClock'
import { durationToMs } from '@/lib/statusDerivation'

let auditCounter = 0
let noteVersionCounter = 0
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
  role: 'pa',
  selectedVisitId: null,
  visitStarted: false,
  checkedIn: false,
  vitalsSubmitted: false,
  noteStatus: 'not_started',
  hasSubmittedOnce: false,
  visitFinished: false,
  returnFeedback: null,
  noteDraft: '',
  noteHistory: [],
  confidentialNoteExists: false,
  confidentialNoteContent: '',
  labs: createInitialLabs(),
  auditLog: [],
  meds: createInitialMeds(),
  cosignUnread: 0,
  notesReviewUnread: 0,
  requestUnread: 0,
  viewedRequests: [],
  paApprovalUnread: 0,
  viewedPaApprovals: [],
  breadcrumbOrigin: 'schedule',
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
    noteHistory: [],
    auditLog: [],
    viewedRequests: [],
    viewedPaApprovals: [],
  }
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'RESET_DEMO':
      auditCounter = 0
      noteVersionCounter = 0
      medEventCounter = 0
      return createFreshInitialState()

    case 'SET_ROLE':
      return { ...state, role: action.role }

    case 'SET_SCHEDULE_VIEW':
      return { ...state, scheduleView: action.view }

    case 'SET_BREADCRUMB_ORIGIN':
      return { ...state, breadcrumbOrigin: action.origin }

    case 'OPEN_VISIT': {
      const isToday = action.visitId === 'today'
      const events = [...state.auditLog]
      if (isToday && !state.checkedIn) {
        events.push(logAudit(state, state.role, 'Check In', 'Patient checked in for today\'s visit'))
      }
      return {
        ...state,
        selectedVisitId: action.visitId,
        checkedIn: isToday ? true : state.checkedIn,
        auditLog: events,
      }
    }

    case 'CLOSE_VISIT':
      return { ...state, selectedVisitId: null }

    case 'START_VISIT':
      return {
        ...state,
        visitStarted: true,
        auditLog: [
          ...state.auditLog,
          logAudit(state, state.role, 'Start Visit', 'Visit started'),
        ],
      }

    case 'SUBMIT_VITALS':
      return {
        ...state,
        vitalsSubmitted: true,
        auditLog: [
          ...state.auditLog,
          logAudit(state, state.role, 'Submit Vitals', 'Vitals submitted'),
        ],
      }

    case 'UPDATE_NOTE_DRAFT': {
      const noteStatus = state.noteStatus === 'not_started' ? 'draft' : state.noteStatus
      return { ...state, noteDraft: action.content, noteStatus }
    }

    case 'SUBMIT_NOTE': {
      const version = nextNoteVersion()
      return {
        ...state,
        noteStatus: 'submitted',
        hasSubmittedOnce: true,
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
        auditLog: [
          ...state.auditLog,
          logAudit(state, state.role, 'Submit Note', `Note submitted (v${version})`),
        ],
      }
    }

    case 'COSIGN_NOTE': {
      const version = nextNoteVersion()
      return {
        ...state,
        noteStatus: 'cosigned',
        cosignUnread: 0,
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
          logAudit(state, 'physician', 'Cosign Note', `Note cosigned (v${version})`),
        ],
      }
    }

    case 'RETURN_NOTE': {
      const version = nextNoteVersion()
      return {
        ...state,
        noteStatus: 'returned',
        returnFeedback: action.feedback,
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
          logAudit(state, 'physician', 'Return Note', `Note returned: ${action.feedback}`),
        ],
      }
    }

    case 'FINISH_VISIT':
      return {
        ...state,
        visitFinished: true,
        auditLog: [
          ...state.auditLog,
          logAudit(state, 'physician', 'Finish Visit', 'Visit finished'),
        ],
      }

    case 'SAVE_CONFIDENTIAL_NOTE': {
      const exists = action.content.trim().length > 0
      return {
        ...state,
        confidentialNoteExists: exists,
        confidentialNoteContent: action.content,
        auditLog: [
          ...state.auditLog,
          logAudit(state, 'physician', 'Save Confidential Note', exists ? 'Confidential note saved' : 'Confidential note cleared'),
        ],
      }
    }

    case 'REQUEST_LAB_ACCESS': {
      const requestId = `req-${action.labId}`
      return {
        ...state,
        requestUnread: state.requestUnread + 1,
        labs: state.labs.map((lab) =>
          lab.id === action.labId
            ? { ...lab, status: 'requested' as const, requestId }
            : lab,
        ),
        auditLog: [
          ...state.auditLog,
          logAudit(state, 'pa', 'Request Lab Access', `Requested access to ${action.labId}`),
        ],
      }
    }

    case 'GRANT_LAB_ACCESS': {
      const lab = state.labs.find((l) => l.id === action.labId)
      const requestId = lab?.requestId
      const alreadyViewed = requestId ? state.viewedRequests.includes(requestId) : false
      return {
        ...state,
        pendingGrantLabId: action.labId,
        pendingGrantDuration: action.duration,
        requestUnread: alreadyViewed
          ? state.requestUnread
          : Math.max(0, state.requestUnread - 1),
        viewedRequests:
          requestId && !alreadyViewed
            ? [...state.viewedRequests, requestId]
            : state.viewedRequests,
        paApprovalUnread: state.viewedPaApprovals.includes(action.labId)
          ? state.paApprovalUnread
          : state.paApprovalUnread + 1,
        labs: state.labs.map((lab) =>
          lab.id === action.labId
            ? {
                ...lab,
                status: 'granted_unstarted' as const,
                grantDuration: action.duration,
              }
            : lab,
        ),
        auditLog: [
          ...state.auditLog,
          logAudit(state, 'physician', 'Grant Lab Access', `Granted ${action.duration} access to ${action.labId}`),
        ],
      }
    }

    case 'CONFIRM_LAB_GRANT': {
      const lab = state.labs.find((l) => l.id === action.labId)
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
          logAudit(state, 'pa', 'Confirm Lab Grant', `Temporary access confirmed for ${action.labId}`),
        ],
      }
    }

    case 'DENY_LAB_ACCESS': {
      const lab = state.labs.find((l) => l.id === action.labId)
      const requestId = lab?.requestId
      const alreadyViewed = requestId ? state.viewedRequests.includes(requestId) : false
      return {
        ...state,
        requestUnread: alreadyViewed
          ? state.requestUnread
          : Math.max(0, state.requestUnread - 1),
        viewedRequests:
          requestId && !alreadyViewed
            ? [...state.viewedRequests, requestId]
            : state.viewedRequests,
        labs: state.labs.map((lab) =>
          lab.id === action.labId
            ? {
                ...lab,
                status: 'denied' as const,
                denialFeedback: action.feedback,
              }
            : lab,
        ),
        auditLog: [
          ...state.auditLog,
          logAudit(state, 'physician', 'Deny Lab Access', `Access denied: ${action.feedback}`),
        ],
      }
    }

    case 'RELEASE_LAB': {
      const lab = state.labs.find((l) => l.id === action.labId)
      const wasRequested = lab?.requestId != null
      const approvalAlreadyViewed = state.viewedPaApprovals.includes(action.labId)
      return {
        ...state,
        paApprovalUnread:
          wasRequested && !approvalAlreadyViewed
            ? state.paApprovalUnread + 1
            : state.paApprovalUnread,
        labs: state.labs.map((lab) =>
          lab.id === action.labId
            ? { ...lab, status: 'released' as const, grantExpiresAt: undefined }
            : lab,
        ),
        auditLog: [
          ...state.auditLog,
          logAudit(state, 'physician', 'Release Lab', `Permanently released ${action.labId}`),
        ],
      }
    }

    case 'EXPIRE_LAB':
      return {
        ...state,
        expiryModalLabId: action.labId,
        labs: state.labs.map((lab) =>
          lab.id === action.labId
            ? { ...lab, status: 'expired' as const, grantExpiresAt: undefined }
            : lab,
        ),
        auditLog: [
          ...state.auditLog,
          logAudit(state, state.role, 'Lab Access Expired', `Temporary access expired for ${action.labId}`),
        ],
      }

    case 'DISMISS_EXPIRY_MODAL':
      return { ...state, expiryModalLabId: null }

    case 'TICK_LAB_TIMERS': {
      const now = Date.now()
      let expiredLabId: string | null = null
      const labs = state.labs.map((lab) => {
        if (lab.status === 'active' && lab.grantExpiresAt && lab.grantExpiresAt <= now) {
          expiredLabId = lab.id
          return { ...lab, status: 'expired' as const, grantExpiresAt: undefined }
        }
        return lab
      })
      if (expiredLabId) {
        return {
          ...state,
          labs,
          expiryModalLabId: expiredLabId,
          auditLog: [
            ...state.auditLog,
            logAudit(state, state.role, 'Lab Access Expired', `Temporary access expired for ${expiredLabId}`),
          ],
        }
      }
      return state.labs === labs ? state : { ...state, labs }
    }

    case 'CONTINUE_MED':
      return {
        ...state,
        meds: state.meds.map((med) =>
          med.id === action.medId
            ? {
                ...med,
                status: 'active',
                history: [
                  ...med.history,
                  {
                    id: nextMedEventId(),
                    timestamp: formatTimestamp(),
                    actor: state.role,
                    action: 'continued',
                  },
                ],
              }
            : med,
        ),
        auditLog: [
          ...state.auditLog,
          logAudit(state, state.role, 'Continue Medication', `Continued ${action.medId}`),
        ],
      }

    case 'DISCONTINUE_MED':
      return {
        ...state,
        meds: state.meds.map((med) =>
          med.id === action.medId
            ? {
                ...med,
                status: 'discontinued',
                history: [
                  ...med.history,
                  {
                    id: nextMedEventId(),
                    timestamp: formatTimestamp(),
                    actor: state.role,
                    action: 'discontinued',
                  },
                ],
              }
            : med,
        ),
        auditLog: [
          ...state.auditLog,
          logAudit(state, state.role, 'Discontinue Medication', `Discontinued ${action.medId}`),
        ],
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
          logAudit(state, state.role, 'Add Medication', `Added ${action.name}`),
        ],
      }
    }

    case 'MARK_PHYSICIAN_COSIGN_VIEWED':
      return { ...state, cosignUnread: 0 }

    case 'MARK_PA_NOTES_REVIEW_VIEWED':
      return { ...state, notesReviewUnread: 0 }

    case 'MARK_REQUEST_READ':
      return {
        ...state,
        requestUnread: state.viewedRequests.includes(action.requestId)
          ? state.requestUnread
          : Math.max(0, state.requestUnread - 1),
        viewedRequests: state.viewedRequests.includes(action.requestId)
          ? state.viewedRequests
          : [...state.viewedRequests, action.requestId],
      }

    case 'MARK_PA_APPROVAL_VIEWED':
      return {
        ...state,
        paApprovalUnread: state.viewedPaApprovals.includes(action.labId)
          ? state.paApprovalUnread
          : Math.max(0, state.paApprovalUnread - 1),
        viewedPaApprovals: state.viewedPaApprovals.includes(action.labId)
          ? state.viewedPaApprovals
          : [...state.viewedPaApprovals, action.labId],
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

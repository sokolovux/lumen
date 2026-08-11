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
import { createEmptyVitals, areVitalsComplete } from '@/lib/vitals'
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
  role: 'assistant',
  selectedVisitId: null,
  visitStarted: false,
  vitalsSubmitted: false,
  vitalsShowErrors: false,
  vitals: createEmptyVitals(),
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
    noteHistory: [],
    auditLog: [],
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
      auditCounter = 0
      noteVersionCounter = 0
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
        auditLog: [
          ...state.auditLog,
          logAudit(state, state.role, 'Start visit', 'Visit started'),
        ],
      }

    case 'UPDATE_VITALS': {
      const vitals = { ...state.vitals, ...action.vitals }
      return {
        ...state,
        vitals,
        vitalsShowErrors: state.vitalsShowErrors && !areVitalsComplete(vitals),
      }
    }

    case 'SHOW_VITALS_ERRORS':
      return { ...state, vitalsShowErrors: true }

    case 'SUBMIT_VITALS':
      return {
        ...state,
        vitalsSubmitted: true,
        vitalsShowErrors: false,
        auditLog: [
          ...state.auditLog,
          logAudit(state, state.role, 'Submit vitals', 'Vitals submitted'),
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
          logAudit(state, state.role, 'Submit note', `Note submitted (v${version})`),
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
          logAudit(state, 'physician', 'Cosign note', `Note cosigned (v${version})`),
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
          logAudit(state, 'physician', 'Return note', `Note returned: ${action.feedback}`),
        ],
      }
    }

    case 'FINISH_VISIT':
      return {
        ...state,
        visitFinished: true,
        auditLog: [
          ...state.auditLog,
          logAudit(state, 'physician', 'Finish visit', 'Visit finished'),
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
          logAudit(state, 'physician', 'Save confidential note', exists ? 'Confidential note saved' : 'Confidential note cleared'),
        ],
      }
    }

    case 'REQUEST_LAB_ACCESS': {
      const requestId = `req-${action.labId}`
      return {
        ...state,
        labs: state.labs.map((lab) =>
          lab.id === action.labId
            ? {
                ...lab,
                status: 'requested' as const,
                everRequested: true,
                requestId,
                denialReason: undefined,
                denialDismissed: undefined,
              }
            : lab,
        ),
        auditLog: [
          ...state.auditLog,
          logAudit(state, 'assistant', 'Request lab access', `Requested access to ${action.labId}`),
        ],
      }
    }

    case 'GRANT_LAB_ACCESS': {
      return {
        ...state,
        pendingGrantLabId: action.labId,
        pendingGrantDuration: action.duration,
        viewedRequests: withViewedRequest(state, action.labId),
        assistantUnseenResolution: withAssistantUnseenResolution(state, action.labId),
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
          logAudit(
            state,
            'physician',
            'Granted access',
            `Granted ${action.duration} access`,
          ),
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
          logAudit(state, 'assistant', 'Confirm lab grant', `Temporary access confirmed for ${action.labId}`),
        ],
      }
    }

    case 'DENY_LAB_ACCESS': {
      return {
        ...state,
        viewedRequests: withViewedRequest(state, action.labId),
        assistantUnseenResolution: withAssistantUnseenResolution(state, action.labId),
        labs: state.labs.map((lab) =>
          lab.id === action.labId
            ? {
                ...lab,
                status: 'denied' as const,
                everDenied: true,
                denialReason: action.feedback,
                denialDismissed: false,
              }
            : lab,
        ),
        auditLog: [
          ...state.auditLog,
          logAudit(
            state,
            'physician',
            'Denied access request',
            action.feedback,
          ),
        ],
      }
    }

    case 'RELEASE_LAB': {
      const lab = state.labs.find((l) => l.id === action.labId)
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
                // Mid-countdown release converts temporary → permanent (never expired)
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
            'Released result',
            isResponseToRequest
              ? 'Released result in response to request'
              : wasActiveGrant
                ? 'Released result (converted active temporary grant to permanent)'
                : 'Released result (direct release)',
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
          logAudit(state, state.role, 'Lab access expired', `Temporary access expired for ${action.labId}`),
        ],
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
        return {
          ...state,
          labs,
          expiryModalLabId: null,
          auditLog: [
            ...state.auditLog,
            logAudit(state, state.role, 'Lab access expired', `Temporary access expired for ${expiredLabId}`),
          ],
        }
      }
      // Re-render every second while a countdown is live so cards/views tick
      if (anyActive) {
        return { ...state, labs: [...state.labs] }
      }
      return state
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
          logAudit(state, state.role, 'Continue medication', `Continued ${action.medId}`),
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
          logAudit(state, state.role, 'Discontinue medication', `Discontinued ${action.medId}`),
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

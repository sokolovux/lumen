import type { Dispatch } from 'react'
import type { Appointment, AppAction, AppState, NoteStatus, Role } from '@/state/types'
import { FIXED_CLOCK } from '@/lib/fixedClock'
import { DEMO_TODAY, parseAppointmentTime } from '@/lib/scheduleData'
import { formatSubmitHandoffErrors } from '@/lib/vitals'
import { visitErrorToast, visitStageToast } from '@/lib/visitToasts'

export type NoteReviewStatus = 'pending' | 'returned' | 'approved'

export type VisitBannerPhase =
  | 'no_appointment'
  | 'future'
  | 'scheduled_today'
  | 'late_today'
  | 'intake'
  | 'review'
  | 'finished'

export function getNoteReviewStatus(noteStatus: NoteStatus): NoteReviewStatus | null {
  switch (noteStatus) {
    case 'submitted':
      return 'pending'
    case 'returned':
      return 'returned'
    case 'cosigned':
      return 'approved'
    default:
      return null
  }
}

export function isAppointmentLate(
  appointment: Appointment,
  visitStarted: boolean,
  now: Date = FIXED_CLOCK,
): boolean {
  if (visitStarted || appointment.date !== DEMO_TODAY) {
    return false
  }
  const appointmentMinutes = parseAppointmentTime(appointment.time)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return nowMinutes > appointmentMinutes
}

export function getVisitBannerPhase(
  state: Pick<
    AppState,
    'visitStarted' | 'visitFinished' | 'hasSubmittedOnce' | 'noteStatus'
  >,
  appointment: Appointment | undefined,
  now: Date = FIXED_CLOCK,
): VisitBannerPhase {
  if (state.visitFinished) {
    return 'finished'
  }
  if (!appointment) {
    return 'no_appointment'
  }
  if (appointment.date !== DEMO_TODAY) {
    return 'future'
  }
  if (state.hasSubmittedOnce) {
    return 'review'
  }
  if (state.visitStarted) {
    return 'intake'
  }
  if (isAppointmentLate(appointment, state.visitStarted, now)) {
    return 'late_today'
  }
  return 'scheduled_today'
}

export function formatAppointmentDateTime(appointment: Appointment): string {
  const date = new Date(`${appointment.date}T12:00:00`)
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  return `${dateLabel} at ${appointment.time}`
}

export function formatEncounterElapsed(startedAt: number, now: number): string {
  const totalSeconds = Math.max(0, Math.floor((now - startedAt) / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function formatEncounterStartTime(startedAt: number): string {
  return new Date(startedAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function getLatestPhysicianReviewOutcome(
  noteHistory: AppState['noteHistory'],
): AppState['noteHistory'][number] | null {
  for (let i = noteHistory.length - 1; i >= 0; i--) {
    const entry = noteHistory[i]
    if (entry.status === 'cosigned' || entry.status === 'returned') {
      return entry
    }
  }
  return null
}

export function shouldAutoOpenTodayVisit(
  role: Role,
  state: Pick<
    AppState,
    'visitStarted' | 'visitFinished' | 'hasSubmittedOnce' | 'noteStatus'
  >,
): boolean {
  if (
    state.visitFinished &&
    state.noteStatus !== 'returned' &&
    state.noteStatus !== 'submitted'
  ) {
    return false
  }
  if (state.hasSubmittedOnce && role === 'physician') {
    return true
  }
  if (state.visitStarted && !state.hasSubmittedOnce && role === 'assistant') {
    return true
  }
  if (role === 'assistant' && state.noteStatus === 'returned') {
    return true
  }
  if (role === 'assistant' && state.hasSubmittedOnce && state.noteStatus !== 'returned') {
    return true
  }
  return false
}

export function canPhysicianOpenTodayVisit(
  state: Pick<AppState, 'visitFinished' | 'hasSubmittedOnce' | 'noteStatus'>,
): boolean {
  if (state.visitFinished) {
    return true
  }
  return state.hasSubmittedOnce
}

export function canAssistantOpenTodayVisit(
  state: Pick<
    AppState,
    'visitFinished' | 'noteStatus' | 'visitStarted' | 'hasSubmittedOnce'
  >,
): boolean {
  return (
    state.visitStarted ||
    state.visitFinished ||
    state.hasSubmittedOnce ||
    state.noteStatus === 'returned'
  )
}

export function isAssistantVisitViewOnly(
  state: Pick<AppState, 'role' | 'hasSubmittedOnce' | 'noteStatus'>,
): boolean {
  return (
    state.role === 'assistant' &&
    state.hasSubmittedOnce &&
    state.noteStatus !== 'returned'
  )
}

export function isAssistantNoteRevision(
  state: Pick<AppState, 'role' | 'noteStatus'>,
): boolean {
  return state.role === 'assistant' && state.noteStatus === 'returned'
}

export function hasPhysicianReviewedNote(noteStatus: NoteStatus): boolean {
  return noteStatus === 'cosigned' || noteStatus === 'returned'
}

/** Visit panel header title for today's encounter. */
export function getTodayVisitPanelTitle(
  state: Pick<
    AppState,
    'role' | 'visitStarted' | 'visitFinished' | 'hasSubmittedOnce' | 'noteStatus'
  >,
): string {
  if (state.visitFinished && state.noteStatus !== 'returned') {
    return "Today's visit"
  }

  if (state.noteStatus === 'returned') {
    return state.role === 'assistant' ? 'Revise visit' : "Today's visit"
  }

  if (state.hasSubmittedOnce) {
    if (state.role === 'physician' && state.noteStatus === 'submitted') {
      return 'Review visit'
    }
    return "Today's visit"
  }

  if (state.visitStarted) {
    return 'Visit in progress'
  }

  return "Today's visit"
}

/** Single source of truth for clinical note textarea editability. */
export function isClinicalNoteEditable(
  state: Pick<AppState, 'role' | 'noteStatus' | 'visitFinished'>,
  readOnly = false,
): boolean {
  if (readOnly || state.role !== 'assistant') {
    return false
  }
  if (state.noteStatus === 'returned') {
    return true
  }
  if (state.visitFinished) {
    return false
  }
  return state.noteStatus === 'not_started' || state.noteStatus === 'draft'
}

/** Hide Submit & hand off after a successful submit until the note is returned. */
export function isSubmitHandoffDisabled(
  state: Pick<AppState, 'noteStatus'>,
): boolean {
  return state.noteStatus === 'submitted' || state.noteStatus === 'cosigned'
}

export function getSubmitHandoffLabel(noteStatus: NoteStatus): string {
  return noteStatus === 'returned' ? 'Submit revision' : 'Submit & hand off'
}

export function submitClinicalNoteHandoff(
  state: AppState,
  dispatch: Dispatch<AppAction>,
  readOnly: boolean,
  options?: { setShowNoteError?: (show: boolean) => void },
): void {
  const noteEditable = isClinicalNoteEditable(state, readOnly)

  if (!noteEditable) {
    visitErrorToast('Clinical note is not editable right now')
    return
  }

  if (isSubmitHandoffDisabled(state)) {
    visitErrorToast('Note has already been submitted')
    return
  }

  const validationError = formatSubmitHandoffErrors(state.vitals, state.noteDraft)
  if (validationError) {
    dispatch({ type: 'SHOW_VITALS_ERRORS' })
    if (!state.noteDraft.trim()) {
      options?.setShowNoteError?.(true)
    }
    visitErrorToast(validationError)
    return
  }

  options?.setShowNoteError?.(false)
  dispatch({ type: 'SUBMIT_NOTE' })
  visitStageToast(
    state.noteStatus === 'returned'
      ? 'Note resubmitted for review'
      : 'Note submitted for review',
    'review',
  )
}

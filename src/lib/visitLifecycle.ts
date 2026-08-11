import type { Appointment, AppState, NoteStatus, Role } from '@/state/types'
import { FIXED_CLOCK } from '@/lib/fixedClock'
import { DEMO_TODAY, parseAppointmentTime } from '@/lib/scheduleData'

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
    'visitStarted' | 'visitFinished' | 'hasSubmittedOnce'
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

export function shouldAutoOpenTodayVisit(
  role: Role,
  state: Pick<AppState, 'visitStarted' | 'visitFinished' | 'hasSubmittedOnce' | 'noteStatus'>,
): boolean {
  if (state.visitFinished) {
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
  return false
}

export function canPhysicianOpenTodayVisit(
  state: Pick<AppState, 'visitFinished' | 'hasSubmittedOnce'>,
): boolean {
  return !state.visitFinished && state.hasSubmittedOnce
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

/** Submit & hand off is disabled after a successful submit until the note is returned. */
export function isSubmitHandoffDisabled(
  state: Pick<AppState, 'noteStatus'>,
): boolean {
  return state.noteStatus === 'submitted' || state.noteStatus === 'cosigned'
}

import type { AppState, LabResult, LabStatus, ScheduleStatus } from '@/state/types'
import { isLateAppointment } from '@/lib/scheduleData'

export function jordanStatus(state: Pick<
  AppState,
  'checkedIn' | 'visitStarted' | 'visitFinished' | 'noteStatus'
>): ScheduleStatus {
  if (state.visitFinished && state.noteStatus === 'cosigned') return 'completed'
  if (state.noteStatus === 'submitted') return 'awaiting_cosign'
  if (state.visitStarted && !state.visitFinished) return 'in_progress'
  if (state.checkedIn) return 'checked_in'
  return 'scheduled'
}

export function jordanDisplayStatus(
  state: Pick<AppState, 'checkedIn' | 'visitStarted' | 'visitFinished' | 'noteStatus'>,
  appointmentTime = '10:30 AM',
): ScheduleStatus {
  const base = jordanStatus(state)
  if (base === 'completed') return 'completed'
  if (isLateAppointment(appointmentTime, base)) return 'late'
  return base
}

export function getLabStatusLabel(status: LabStatus): string {
  switch (status) {
    case 'pending': return 'Locked'
    case 'requested': return 'Access Requested'
    case 'granted_unstarted': return 'Grant Pending Confirmation'
    case 'active': return 'Temporary Access'
    case 'expired': return 'Access Expired'
    case 'denied': return 'Access Denied'
    case 'released': return 'Released'
  }
}

export function getScheduleStatusLabel(status: ScheduleStatus): string {
  switch (status) {
    case 'scheduled': return 'Scheduled'
    case 'checked_in': return 'Checked In'
    case 'in_progress': return 'In Progress'
    case 'awaiting_cosign': return 'Awaiting Cosign'
    case 'completed': return 'Completed'
    case 'late': return 'Late'
  }
}

export function canPaViewLab(lab: LabResult): boolean {
  return lab.status === 'active' || lab.status === 'released'
}

export function isPaApprovedLabStatus(status: LabStatus): boolean {
  return status === 'granted_unstarted' || status === 'active' || status === 'released'
}

export function hasPaRequestedLab(lab: LabResult): boolean {
  return lab.requestId != null
}

export function durationToMs(duration: string): number {
  switch (duration) {
    case '10s': return 10_000
    case '10m': return 10 * 60_000
    case '1h': return 60 * 60_000
    case '4h': return 4 * 60 * 60_000
    case '24h': return 24 * 60 * 60_000
    default: return 0
  }
}

export function formatCountdown(expiresAt: number, now: number): string {
  const remaining = Math.max(0, expiresAt - now)
  const totalSeconds = Math.floor(remaining / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

export function getNoteStatusLabel(status: AppState['noteStatus']): string {
  switch (status) {
    case 'not_started': return 'Not Started'
    case 'draft': return 'Draft'
    case 'submitted': return 'Submitted — Awaiting Cosign'
    case 'returned': return 'Returned for Revision'
    case 'cosigned': return 'Cosigned'
  }
}

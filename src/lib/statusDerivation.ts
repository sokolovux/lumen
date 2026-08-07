import type { AppState, LabResult, LabStatus, ScheduleStatus } from '@/state/types'
import { isLateAppointment } from '@/lib/scheduleData'

export function jordanStatus(state: Pick<
  AppState,
  'visitStarted' | 'visitFinished' | 'noteStatus'
>): ScheduleStatus {
  if (state.visitFinished) return 'finished'
  if (state.noteStatus === 'submitted' || state.noteStatus === 'cosigned') {
    return 'with_physician'
  }
  if (state.visitStarted) return 'with_pa'
  return 'scheduled'
}

export function jordanDisplayStatus(
  state: Pick<AppState, 'visitStarted' | 'visitFinished' | 'noteStatus'>,
  appointmentTime = '10:30 AM',
): ScheduleStatus {
  const base = jordanStatus(state)
  if (base === 'finished') return 'finished'
  if (isLateAppointment(appointmentTime, base)) return 'late'
  return base
}

export function getLabStatusLabel(status: LabStatus): string {
  switch (status) {
    case 'pending': return 'Locked'
    case 'requested': return 'Access requested'
    case 'granted_unstarted': return 'Grant pending confirmation'
    case 'active': return 'Temporary access'
    case 'expired': return 'Access expired'
    case 'denied': return 'Access denied'
    case 'released': return 'Released'
  }
}

export function getScheduleStatusLabel(status: ScheduleStatus): string {
  switch (status) {
    case 'scheduled': return 'Scheduled'
    case 'with_pa': return 'With PA'
    case 'with_physician': return 'With physician'
    case 'finished': return 'Finished'
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
  return lab.everRequested
}

export function isPaResolvedLabStatus(status: LabStatus): boolean {
  return (
    status === 'granted_unstarted'
    || status === 'active'
    || status === 'expired'
    || status === 'denied'
    || status === 'released'
  )
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
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function formatGrantDurationLabel(duration: string): string {
  switch (duration) {
    case '10s': return '10s'
    case '10m': return '10m'
    case '1h': return '1h'
    case '4h': return '4h'
    case '24h': return '24h'
    default: return duration
  }
}

export function formatGrantDurationPhrase(duration: string): string {
  switch (duration) {
    case '10s': return '10-second'
    case '10m': return '10-minute'
    case '1h': return '1-hour'
    case '4h': return '4-hour'
    case '24h': return '24-hour'
    default: return duration
  }
}

export function getNoteStatusLabel(status: AppState['noteStatus']): string {
  switch (status) {
    case 'not_started': return 'Not started'
    case 'draft': return 'Draft'
    case 'submitted': return 'Submitted — awaiting cosign'
    case 'returned': return 'Returned for revision'
    case 'cosigned': return 'Cosigned'
  }
}

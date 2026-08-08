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

/** Labs chart: physician sees pending/denied as neutral "Unreleased". Requests queue uses true outcome labels. */
export function getLabStatusLabel(
  status: LabStatus,
  role?: 'pa' | 'physician',
  surface: 'labs' | 'requests' = 'labs',
): string {
  const physicianChartLocked =
    surface === 'labs' && role === 'physician'
  switch (status) {
    case 'pending': return physicianChartLocked ? 'Unreleased' : 'Locked'
    case 'requested': return 'Access requested'
    case 'granted_unstarted': return 'Grant pending confirmation'
    case 'active': return 'Temporary access'
    case 'expired': return 'Access expired'
    case 'denied': return physicianChartLocked ? 'Unreleased' : 'Access denied'
    case 'released': return 'Released'
  }
}

/** Outline Badge tints for lab statuses. Physician labs surface treats denied as neutral. */
export function getLabStatusTint(
  status: LabStatus,
  role?: 'pa' | 'physician',
  surface: 'labs' | 'requests' = 'labs',
): string {
  const physicianChartLocked =
    surface === 'labs' && role === 'physician'
  switch (status) {
    case 'requested':
    case 'granted_unstarted':
    case 'active':
      return 'border-blue-200 bg-blue-50 text-blue-700'
    case 'expired':
      return 'text-muted-foreground'
    case 'denied':
      return physicianChartLocked
        ? ''
        : 'border-destructive/30 bg-destructive/10 text-destructive'
    case 'released':
      return 'border-green-200 bg-green-50 text-green-700'
    default:
      return ''
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

/** Outline Badge tints for schedule statuses. `scheduled` has no pill. */
export const scheduleStatusTint: Partial<Record<ScheduleStatus, string>> = {
  with_pa: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  with_physician: 'border-blue-200 bg-blue-50 text-blue-700',
  finished: 'border-green-200 bg-green-50 text-green-700',
  late: 'border-amber-200 bg-amber-50 text-amber-700',
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

/** Always H:MM:SS for live “Available for …” tags */
export function formatCountdownHms(expiresAt: number, now: number): string {
  const remaining = Math.max(0, expiresAt - now)
  const totalSeconds = Math.floor(remaining / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
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

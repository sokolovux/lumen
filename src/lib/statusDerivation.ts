import type { AppState, LabResult, LabStatus, Role, ScheduleStatus } from '@/state/types'

export function getRoleLabel(role: Role): string {
  return role === 'assistant' ? 'Assistant' : 'Physician'
}

export function jordanStatus(state: Pick<
  AppState,
  'visitStarted' | 'visitFinished' | 'hasSubmittedOnce'
>): ScheduleStatus {
  if (state.visitFinished) return 'finished'
  if (state.hasSubmittedOnce) return 'review'
  if (state.visitStarted) return 'intake'
  return 'scheduled'
}

/** Labs chart: physician sees pending/denied as neutral "Unreleased". Requests queue uses true outcome labels. */
export function getLabStatusLabel(
  status: LabStatus,
  role?: Role,
  surface: 'labs' | 'requests' = 'labs',
): string {
  const physicianChartLocked =
    surface === 'labs' && role === 'physician'
  switch (status) {
    case 'pending': return physicianChartLocked ? 'Unreleased' : 'Locked'
    case 'requested': return 'Access requested'
    case 'granted_unstarted':
      return surface === 'labs'
        ? 'Temporary access'
        : 'Grant pending confirmation'
    case 'active': return 'Temporary access'
    case 'expired': return 'Access expired'
    case 'denied': return physicianChartLocked ? 'Unreleased' : 'Access denied'
    case 'released': return 'Released'
  }
}

/** Outline Badge tints for lab statuses. Physician labs surface treats denied as neutral. */
export function getLabStatusTint(
  status: LabStatus,
  role?: Role,
  surface: 'labs' | 'requests' = 'labs',
): string {
  const physicianChartLocked =
    surface === 'labs' && role === 'physician'
  switch (status) {
    case 'requested':
      return 'border-blue-200 bg-blue-50 text-blue-600'
    case 'granted_unstarted':
    case 'active':
    case 'released':
      return 'border-green-200 bg-green-50 text-green-600'
    case 'denied':
      return physicianChartLocked
        ? ''
        : 'border-red-200 bg-red-50 text-red-600'
    case 'pending':
    case 'expired':
    default:
      // Neutral outline — Locked / Access expired / Unreleased
      return ''
  }
}

export function getScheduleStatusLabel(status: ScheduleStatus): string {
  switch (status) {
    case 'scheduled': return 'Scheduled'
    case 'intake': return 'Intake'
    case 'review': return 'Review'
    case 'finished': return 'Finished'
  }
}

/** Background tints for Today kanban columns. */
export const scheduleStatusColumnBackground: Record<ScheduleStatus, string> = {
  scheduled: 'bg-gray-50',
  intake: 'bg-purple-50',
  review: 'bg-blue-50',
  finished: 'bg-green-50',
}

/** Text color for schedule status labels. */
export const scheduleStatusTextColor: Record<ScheduleStatus, string> = {
  scheduled: 'text-gray-600',
  intake: 'text-purple-600',
  review: 'text-blue-600',
  finished: 'text-green-600',
}

/** Outline Badge tints for schedule statuses. */
export const scheduleStatusTint: Record<ScheduleStatus, string> = {
  scheduled: 'border-gray-200 bg-gray-50 text-gray-600',
  intake: 'border-purple-200 bg-purple-50 text-purple-600',
  review: 'border-blue-200 bg-blue-50 text-blue-600',
  finished: 'border-green-200 bg-green-50 text-green-600',
}

export function canAssistantViewLab(lab: LabResult): boolean {
  return lab.status === 'active' || lab.status === 'released'
}

export function isAssistantApprovedLabStatus(status: LabStatus): boolean {
  return status === 'granted_unstarted' || status === 'active' || status === 'released'
}

export function hasAssistantRequestedLab(lab: LabResult): boolean {
  return lab.everRequested
}

export function isAssistantResolvedLabStatus(status: LabStatus): boolean {
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
    case 'submitted': return 'Pending review'
    case 'returned': return 'Returned for revision'
    case 'cosigned': return 'Approved'
  }
}

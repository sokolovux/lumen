import type { AppState, AuditEvent, NoteVersion, Role } from '@/state/types'
import { getDemoUserProfile } from '@/lib/scheduleData'
import { getRoleLabel } from '@/lib/statusDerivation'

export function getAuditActorLabel(role: Role): string {
  const profile = getDemoUserProfile(role)
  return `${profile.name}, ${getRoleLabel(role)}`
}

export function splitAuditTimestamp(timestamp: string): { dayLabel: string; timeLabel: string } {
  const match = timestamp.match(/^(.+ \d{4}) (.+)$/)
  if (!match) {
    return { dayLabel: timestamp, timeLabel: '' }
  }
  return { dayLabel: match[1], timeLabel: match[2] }
}

export function getNoteRevisionOutcomeLabel(status: NoteVersion['status']): string {
  switch (status) {
    case 'submitted':
      return 'Submitted'
    case 'returned':
      return 'Returned for revision'
    case 'cosigned':
      return 'Approved'
  }
}

export function formatAuditEventDescription(event: AuditEvent): string {
  switch (event.action) {
    case 'Start visit':
      return event.detail === 'Visit started'
        ? 'Started today\'s visit with the patient.'
        : `${capitalizeFirst(event.detail)}.`
    case 'Submit vitals':
      return event.detail === 'Vitals submitted for today\'s visit'
        ? 'Submitted vitals for today\'s visit.'
        : `${capitalizeFirst(event.detail)}.`
    case 'Submit note':
      return event.detail.includes('resubmitted')
        ? `Resubmitted clinical note for physician review (${extractVersion(event.detail)}).`
        : `Submitted clinical note for physician review (${extractVersion(event.detail)}).`
    case 'Approve note':
    case 'Cosign note':
      return `Approved clinical note (${extractVersion(event.detail)}).`
    case 'Return note':
      return formatReturnNoteDescription(event.detail)
    case 'Finish visit':
      return event.detail === 'Visit finished by physician' || event.detail === 'Visit finished'
        ? 'Finished today\'s visit.'
        : `${capitalizeFirst(event.detail)}.`
    case 'Save physician addendum':
      return 'Edited physician addendum.'
    case 'Save confidential note':
      return 'Edited confidential note.'
    case 'Request lab access':
      return `${capitalizeFirst(event.detail)}.`
    case 'Grant lab access':
    case 'Granted access':
      return `${capitalizeFirst(event.detail)}.`
    case 'Confirm lab grant':
      return `${capitalizeFirst(event.detail)}.`
    case 'Deny lab access':
    case 'Denied access request':
      return formatDenyLabDescription(event.detail)
    case 'Release lab result':
    case 'Released result':
      return `${capitalizeFirst(event.detail)}.`
    case 'Lab access expired':
      return capitalizeFirst(event.detail) + '.'
    case 'Continue medication':
      return capitalizeFirst(event.detail) + '.'
    case 'Discontinue medication':
      return capitalizeFirst(event.detail) + '.'
    case 'Add medication':
      return capitalizeFirst(event.detail) + '.'
    default:
      return event.detail ? capitalizeFirst(event.detail) + '.' : event.action + '.'
  }
}

function extractVersion(detail: string): string {
  const match = detail.match(/v(\d+)/)
  return match ? `revision ${match[1]}` : 'revision unknown'
}

function formatReturnNoteDescription(detail: string): string {
  const match = detail.match(/^Note returned \(v(\d+)\)\. Comment: (.+)$/)
  if (match) {
    return `Returned clinical note for revision (revision ${match[1]}). Comment: "${match[2]}"`
  }
  const legacy = detail.match(/^Note returned: (.+)$/)
  if (legacy) {
    return `Returned clinical note for revision. Comment: "${legacy[1]}"`
  }
  return capitalizeFirst(detail) + '.'
}

function formatDenyLabDescription(detail: string): string {
  const match = detail.match(/^Denied access to (.+)\. Reason: (.+)$/)
  if (match) {
    return `Denied access request for ${match[1]}. Reason: "${match[2]}"`
  }
  return `Denied access request. Reason: "${detail}"`
}

function capitalizeFirst(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export interface AuditTimelineGroup {
  dayLabel: string
  events: AuditEvent[]
}

export function groupAuditEventsReverseChronological(events: AuditEvent[]): AuditTimelineGroup[] {
  const reversed = [...events].reverse()
  const groups: AuditTimelineGroup[] = []

  for (const event of reversed) {
    const { dayLabel } = splitAuditTimestamp(event.timestamp)
    const existing = groups.find((group) => group.dayLabel === dayLabel)
    if (existing) {
      existing.events.push(event)
    } else {
      groups.push({ dayLabel, events: [event] })
    }
  }

  return groups
}

export function formatNoteRevisionLine(entry: NoteVersion): string {
  const actor = getAuditActorLabel(entry.actor)
  const outcome = getNoteRevisionOutcomeLabel(entry.status)
  const feedback =
    entry.status === 'returned' && entry.feedback
      ? ` Comment: "${entry.feedback}"`
      : ''
  return `Revision ${entry.version}: ${outcome} by ${actor}.${feedback}`
}

/** Events not instrumented in this demo build. */
export const AUDIT_TRAIL_OMISSIONS = [
  'Chart and tab view events are not logged.',
  'Full clinical note text history and diffs are not stored; only revision number, author, timestamp, and outcome.',
] as const

export function hasAuditTrailContent(state: Pick<AppState, 'auditLog' | 'noteHistory'>): boolean {
  return state.auditLog.length > 0 || state.noteHistory.length > 0
}

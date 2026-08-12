import type { AuditEvent, NoteVersion, Role } from '@/state/types'

function formatSeedTimestamp(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): string {
  const date = new Date(year, month - 1, day, hour, minute)
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const timeLabel = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `${dateLabel} ${timeLabel}`
}

function audit(
  id: string,
  timestamp: string,
  actor: Role,
  action: string,
  detail: string,
): AuditEvent {
  return { id, timestamp, actor, action, detail }
}

function noteRevision(
  id: string,
  version: number,
  status: NoteVersion['status'],
  actor: Role,
  timestamp: string,
  feedback?: string,
): NoteVersion {
  return { id, version, status, actor, timestamp, feedback }
}

type VisitSeedOptions = {
  visitLabel: string
  year: number
  month: number
  day: number
  startHour?: number
  withReturn?: {
    feedback: string
    resubmitOffsetMin?: number
    returnOffsetMin?: number
  }
  addendum?: boolean
  versionStart: number
}

function visitTimestamp(
  year: number,
  month: number,
  day: number,
  startHour: number,
  offsetMin: number,
): string {
  const totalMin = startHour * 60 + offsetMin
  const hour = Math.floor(totalMin / 60)
  const minute = totalMin % 60
  return formatSeedTimestamp(year, month, day, hour, minute)
}

function buildVisitCluster(options: VisitSeedOptions): {
  events: AuditEvent[]
  revisions: NoteVersion[]
  nextVersion: number
} {
  const {
    visitLabel,
    year,
    month,
    day,
    startHour = 9,
    withReturn,
    addendum,
    versionStart,
  } = options

  const events: AuditEvent[] = []
  const revisions: NoteVersion[] = []
  let version = versionStart
  let auditSeq = 0

  const push = (actor: Role, action: string, detail: string, offsetMin: number) => {
    auditSeq += 1
    events.push(
      audit(
        `audit-visit-${auditSeq}`,
        visitTimestamp(year, month, day, startHour, offsetMin),
        actor,
        action,
        detail,
      ),
    )
  }

  push('assistant', 'Start visit', `Started ${visitLabel}`, 5)
  push('assistant', 'Submit vitals', `Vitals submitted for ${visitLabel}`, 28)

  version += 1
  revisions.push(
    noteRevision(
      `nv-seed-${version}`,
      version,
      'submitted',
      'assistant',
      visitTimestamp(year, month, day, startHour, 42),
    ),
  )
  push('assistant', 'Submit note', `Note submitted (v${version})`, 42)

  if (withReturn) {
    version += 1
    const returnMin = withReturn.returnOffsetMin ?? 58
    revisions.push(
      noteRevision(
        `nv-seed-${version}`,
        version,
        'returned',
        'physician',
        visitTimestamp(year, month, day, startHour, returnMin),
        withReturn.feedback,
      ),
    )
    push(
      'physician',
      'Return note',
      `Note returned (v${version}). Comment: ${withReturn.feedback}`,
      returnMin,
    )

    version += 1
    const resubmitMin = withReturn.resubmitOffsetMin ?? 75
    revisions.push(
      noteRevision(
        `nv-seed-${version}`,
        version,
        'submitted',
        'assistant',
        visitTimestamp(year, month, day, startHour, resubmitMin),
      ),
    )
    push('assistant', 'Submit note', `Note resubmitted (v${version})`, resubmitMin)
  }

  version += 1
  const approveMin = withReturn ? (withReturn.resubmitOffsetMin ?? 75) + 18 : 58
  revisions.push(
    noteRevision(
      `nv-seed-${version}`,
      version,
      'cosigned',
      'physician',
      visitTimestamp(year, month, day, startHour, approveMin),
    ),
  )
  push('physician', 'Approve note', `Note approved (v${version})`, approveMin)
  push('physician', 'Finish visit', `Visit finished (${visitLabel})`, approveMin + 6)

  if (addendum) {
    push('physician', 'Save physician addendum', 'Physician addendum edited', approveMin + 12)
  }

  return { events, revisions, nextVersion: version }
}

export type JordanReyesAuditSeed = {
  auditLog: AuditEvent[]
  noteHistory: NoteVersion[]
  maxAuditSeedId: number
  maxNoteVersion: number
}

export function createJordanReyesAuditSeed(): JordanReyesAuditSeed {
  const allEvents: AuditEvent[] = []
  const allRevisions: NoteVersion[] = []
  let versionCursor = 0
  let globalAuditSeq = 0

  const mergeVisit = (options: Omit<VisitSeedOptions, 'versionStart'>) => {
    const result = buildVisitCluster({ ...options, versionStart: versionCursor })
    for (const event of result.events) {
      globalAuditSeq += 1
      allEvents.push({
        ...event,
        id: `audit-seed-${String(globalAuditSeq).padStart(3, '0')}`,
      })
    }
    allRevisions.push(...result.revisions)
    versionCursor = result.nextVersion
  }

  const pushStandalone = (
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    actor: Role,
    action: string,
    detail: string,
  ) => {
    globalAuditSeq += 1
    allEvents.push(
      audit(
        `audit-seed-${String(globalAuditSeq).padStart(3, '0')}`,
        formatSeedTimestamp(year, month, day, hour, minute),
        actor,
        action,
        detail,
      ),
    )
  }

  mergeVisit({
    visitLabel: 'Sep 5, 2024 diabetes and lipids review',
    year: 2024,
    month: 9,
    day: 5,
    startHour: 9,
  })

  pushStandalone(2024, 9, 5, 11, 20, 'physician', 'Add medication', 'Added Atorvastatin')
  pushStandalone(2024, 9, 5, 11, 22, 'physician', 'Add medication', 'Added Vitamin D3')
  pushStandalone(2024, 9, 18, 14, 0, 'physician', 'Release lab result', 'Permanently released Serum creatinine')
  pushStandalone(2024, 9, 18, 14, 2, 'physician', 'Release lab result', 'Permanently released eGFR')
  pushStandalone(2024, 9, 18, 14, 4, 'physician', 'Release lab result', 'Permanently released LDL cholesterol')

  mergeVisit({
    visitLabel: 'Mar 12, 2025 anxiety check-in',
    year: 2025,
    month: 3,
    day: 12,
    startHour: 14,
  })

  pushStandalone(2025, 3, 12, 15, 10, 'physician', 'Continue medication', 'Continued Levothyroxine')
  pushStandalone(2025, 3, 12, 15, 12, 'physician', 'Continue medication', 'Continued Sertraline')

  mergeVisit({
    visitLabel: 'Aug 20, 2025 GERD follow-up',
    year: 2025,
    month: 8,
    day: 20,
    startHour: 13,
    withReturn: {
      feedback:
        'Please document dietary triggers discussed and omeprazole adherence.',
      returnOffsetMin: 55,
      resubmitOffsetMin: 72,
    },
  })

  pushStandalone(2025, 8, 20, 14, 35, 'physician', 'Continue medication', 'Continued Omeprazole')

  mergeVisit({
    visitLabel: 'Nov 8, 2025 annual physical',
    year: 2025,
    month: 11,
    day: 8,
    startHour: 13,
  })

  pushStandalone(2025, 11, 10, 10, 30, 'physician', 'Release lab result', 'Permanently released CBC with differential')
  pushStandalone(2025, 11, 10, 10, 32, 'physician', 'Release lab result', 'Permanently released TSH')
  pushStandalone(2025, 11, 10, 10, 34, 'physician', 'Release lab result', 'Permanently released Fasting glucose')
  pushStandalone(2025, 11, 8, 14, 40, 'physician', 'Continue medication', 'Continued Empagliflozin')
  pushStandalone(2025, 11, 8, 14, 42, 'physician', 'Continue medication', 'Continued Aspirin')

  mergeVisit({
    visitLabel: 'Feb 2, 2026 medication adjustment',
    year: 2026,
    month: 2,
    day: 2,
    startHour: 9,
    withReturn: {
      feedback:
        'Add counseling note on injection technique and titration schedule.',
      returnOffsetMin: 56,
      resubmitOffsetMin: 74,
    },
    addendum: true,
  })

  pushStandalone(2026, 2, 2, 10, 35, 'physician', 'Add medication', 'Added Semaglutide')

  mergeVisit({
    visitLabel: 'May 15, 2026 hypertension check',
    year: 2026,
    month: 5,
    day: 15,
    startHour: 8,
    withReturn: {
      feedback:
        'Clarify whether home BP log was reviewed; include average readings.',
      returnOffsetMin: 54,
      resubmitOffsetMin: 70,
    },
    addendum: true,
  })

  pushStandalone(2026, 5, 15, 9, 50, 'physician', 'Add medication', 'Added Amlodipine')
  pushStandalone(2026, 5, 15, 9, 52, 'physician', 'Continue medication', 'Continued Lisinopril')
  pushStandalone(2026, 5, 15, 11, 0, 'physician', 'Release lab result', 'Permanently released Chest X-ray')

  pushStandalone(2026, 4, 22, 15, 10, 'assistant', 'Request lab access', 'Requested access to Diabetic retinal screening')
  pushStandalone(2026, 4, 22, 15, 45, 'physician', 'Grant lab access', 'Granted 1-hour temporary access to Diabetic retinal screening')
  pushStandalone(2026, 4, 22, 16, 5, 'assistant', 'Confirm lab grant', 'Started temporary access window for Diabetic retinal screening')
  pushStandalone(2026, 4, 22, 17, 8, 'assistant', 'Lab access expired', 'Temporary access expired for Diabetic retinal screening')
  pushStandalone(2026, 4, 23, 9, 15, 'physician', 'Release lab result', 'Permanently released Diabetic retinal screening')

  pushStandalone(2026, 7, 22, 16, 15, 'physician', 'Add medication', 'Added Amoxicillin')
  pushStandalone(2026, 7, 29, 9, 0, 'physician', 'Discontinue medication', 'Discontinued Amoxicillin')

  mergeVisit({
    visitLabel: 'Aug 3, 2026 diabetes follow-up',
    year: 2026,
    month: 8,
    day: 3,
    startHour: 9,
    addendum: true,
  })

  pushStandalone(2026, 8, 3, 10, 15, 'physician', 'Continue medication', 'Continued Metformin')
  pushStandalone(2026, 8, 5, 16, 40, 'physician', 'Save confidential note', 'Confidential note edited')
  pushStandalone(2026, 8, 6, 11, 10, 'physician', 'Save confidential note', 'Confidential note edited')

  pushStandalone(2026, 7, 28, 10, 0, 'assistant', 'Request lab access', 'Requested access to HbA1c')
  pushStandalone(
    2026,
    7,
    28,
    10,
    22,
    'physician',
    'Deny lab access',
    'Denied access to HbA1c. Reason: Repeat draw scheduled for Aug 12 visit; hold release until new sample is resulted.',
  )

  return {
    auditLog: allEvents,
    noteHistory: allRevisions,
    maxAuditSeedId: globalAuditSeq,
    maxNoteVersion: versionCursor,
  }
}

export const JORDAN_REYES_AUDIT_SEED = createJordanReyesAuditSeed()

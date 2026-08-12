import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useAppState } from '@/state/AppStateContext'
import { visitStageToast } from '@/lib/visitToasts'
import { AccessTimer } from '@/components/patient/AccessTimer'
import { Button } from '@/components/ui/button'
import {
  DEMO_ASSISTANT_NAME,
  DEMO_PHYSICIAN_SHORT_NAME,
  DEMO_TODAY,
  getAnyAppointmentForPatient,
  getAppointmentForPatientOnDate,
} from '@/lib/scheduleData'
import {
  formatAppointmentDateTime,
  formatEncounterStartTime,
  getNoteReviewStatus,
  getVisitBannerPhase,
  type VisitBannerPhase,
} from '@/lib/visitLifecycle'

interface TodayAppointmentBannerProps {
  patientId: string
  panelOpen: boolean
}

function bannerPhaseAttr(phase: VisitBannerPhase): string {
  switch (phase) {
    case 'no_appointment':
    case 'future':
    case 'scheduled_today':
    case 'late_today':
      return 'neutral'
    case 'intake':
    case 'review':
    case 'finished':
      return phase
    default:
      return 'neutral'
  }
}

export function TodayAppointmentBanner({ patientId, panelOpen }: TodayAppointmentBannerProps) {
  const { state, dispatch } = useAppState()
  const [now, setNow] = useState(() => Date.now())
  const todayAppointment = getAppointmentForPatientOnDate(patientId, DEMO_TODAY)
  const fallbackAppointment = getAnyAppointmentForPatient(patientId)
  const appointmentForPhase = todayAppointment ?? fallbackAppointment
  const phase = getVisitBannerPhase(state, appointmentForPhase)

  useEffect(() => {
    if (phase !== 'intake' && phase !== 'review') {
      return
    }
    if (!state.encounterStartedAt || (state.visitFinished && state.noteStatus !== 'returned')) {
      return
    }
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [phase, state.encounterStartedAt, state.visitFinished, state.noteStatus])

  const isAssistant = state.role === 'assistant'
  const noteReview = getNoteReviewStatus(state.noteStatus)
  const scheduledTime = todayAppointment?.time ?? appointmentForPhase?.time
  const startedAtLabel =
    state.encounterStartedAt != null
      ? formatEncounterStartTime(state.encounterStartedAt)
      : null

  const renderFinishedTiming = () => {
    const parts: string[] = []
    if (scheduledTime) {
      parts.push(`Scheduled ${scheduledTime}`)
    }
    if (startedAtLabel != null) {
      parts.push(`Started ${startedAtLabel}`)
    }
    if (state.visitFinishedAt != null) {
      parts.push(`Finished ${formatEncounterStartTime(state.visitFinishedAt)}`)
    }

    if (parts.length === 0) {
      return null
    }

    return (
      <p className="text-sm text-muted-foreground">
        {parts.join(' · ')}
      </p>
    )
  }

  const renderIntakeReviewHeadline = () => {
    if (startedAtLabel == null || state.encounterStartedAt == null) {
      return null
    }

    const parts: string[] = []
    if (scheduledTime) {
      parts.push(`Scheduled ${scheduledTime}`)
    }
    parts.push(`Started ${startedAtLabel}`)

    return (
      <div className="flex flex-wrap items-center gap-2">
        <h6>{parts.join(' · ')}</h6>
        <AccessTimer startedAt={state.encounterStartedAt} now={now} />
      </div>
    )
  }

  const handleStartVisit = () => {
    dispatch({ type: 'START_VISIT' })
    dispatch({ type: 'OPEN_VISIT', visitId: 'today' })
    visitStageToast('Visit started', 'intake')
  }

  const handleOpenPanel = () => {
    dispatch({ type: 'OPEN_VISIT', visitId: 'today' })
  }

  const renderVisitPanelButton = (
    label: string,
    onClick: () => void,
    variant?: 'default' | 'outline',
  ) => (
    <Button variant={variant} onClick={onClick}>
      {label}
      <ArrowRight data-icon="inline-end" />
    </Button>
  )

  const renderPrimaryCopy = () => {
    switch (phase) {
      case 'no_appointment':
        return <h6>No appointment has been scheduled yet.</h6>
      case 'future':
        return (
          <h6>
            {appointmentForPhase ? formatAppointmentDateTime(appointmentForPhase) : 'Appointment scheduled'}
          </h6>
        )
      case 'scheduled_today':
        return (
          <h6>
            {todayAppointment
              ? `${todayAppointment.kind} appointment is today at ${todayAppointment.time}`
              : 'Appointment is today'}
          </h6>
        )
      case 'late_today':
        return (
          <h6>
            {todayAppointment
              ? `${todayAppointment.kind} appointment was today at ${todayAppointment.time}, running late`
              : 'Appointment is running late'}
          </h6>
        )
      case 'intake':
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            {renderIntakeReviewHeadline()}
            {isAssistant ? (
              <p className="text-sm text-muted-foreground">
                You&apos;re currently with the patient.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {DEMO_ASSISTANT_NAME} is currently with the patient.
              </p>
            )}
          </div>
        )
      case 'review':
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            {renderIntakeReviewHeadline()}
            {isAssistant && noteReview === 'pending' && (
              <p className="text-sm text-muted-foreground">
                Awaiting {DEMO_PHYSICIAN_SHORT_NAME}&apos;s review.
              </p>
            )}
            {isAssistant && noteReview === 'returned' && (
              <p className="text-sm text-muted-foreground">
                {DEMO_PHYSICIAN_SHORT_NAME} returned your note. Revise and resubmit.
              </p>
            )}
            {isAssistant && noteReview === 'approved' && (
              <p className="text-sm text-muted-foreground">
                Awaiting {DEMO_PHYSICIAN_SHORT_NAME} to finish the visit.
              </p>
            )}
            {!isAssistant && noteReview === 'pending' && (
              <p className="text-sm text-muted-foreground">Waiting on your review.</p>
            )}
            {!isAssistant && noteReview === 'returned' && (
              <p className="text-sm text-muted-foreground">
                Waiting on {DEMO_ASSISTANT_NAME}&apos;s revision.
              </p>
            )}
            {!isAssistant && noteReview === 'approved' && (
              <p className="text-sm text-muted-foreground">
                You approved the note. Finish the visit when ready.
              </p>
            )}
          </div>
        )
      case 'finished':
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <h6>Visit finished</h6>
            {renderFinishedTiming()}
            {noteReview === 'approved' && (
              <p className="text-sm text-muted-foreground">
                {isAssistant
                  ? `${DEMO_PHYSICIAN_SHORT_NAME} approved the note and finished the visit.`
                  : 'You approved the note and finished the visit.'}
              </p>
            )}
            {noteReview === 'pending' && (
              <p className="text-sm text-muted-foreground">
                {isAssistant
                  ? 'Note submitted. Visit closed before physician review completed.'
                  : 'Visit closed. Note still awaiting your review.'}
              </p>
            )}
            {!noteReview && (
              <p className="text-sm text-muted-foreground">
                Today&apos;s visit is complete.
              </p>
            )}
          </div>
        )
      default:
        return null
    }
  }

  const renderAction = () => {
    switch (phase) {
      case 'no_appointment':
        return (
          <Button disabled>Schedule appointment</Button>
        )
      case 'future':
        return (
          <Button variant="outline" disabled>Reschedule</Button>
        )
      case 'scheduled_today':
      case 'late_today':
        if (!isAssistant) {
          return null
        }
        return renderVisitPanelButton('Start visit', handleStartVisit)
      case 'intake':
        if (!isAssistant) {
          return null
        }
        return renderVisitPanelButton('Continue', handleOpenPanel)
      case 'review':
        if (isAssistant && noteReview === 'returned') {
          return renderVisitPanelButton('Revise', handleOpenPanel)
        }
        if (isAssistant) {
          return renderVisitPanelButton('View visit', handleOpenPanel, 'outline')
        }
        if (!isAssistant) {
          return renderVisitPanelButton('Review visit', handleOpenPanel)
        }
        return null
      case 'finished':
        return renderVisitPanelButton('View visit', handleOpenPanel, 'outline')
      default:
        return null
    }
  }

  return (
    <div
      data-slot="today-appointment-banner"
      data-phase={bannerPhaseAttr(phase)}
      data-panel-open={panelOpen ? 'true' : 'false'}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        {renderPrimaryCopy()}
      </div>
      {renderAction()}
    </div>
  )
}

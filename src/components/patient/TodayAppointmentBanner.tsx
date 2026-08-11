import { useEffect, useState } from 'react'
import { useAppState } from '@/state/AppStateContext'
import { visitStageToast } from '@/lib/visitToasts'
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
  formatEncounterElapsed,
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
      return 'neutral'
    case 'scheduled_today':
    case 'late_today':
    case 'intake':
    case 'review':
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
    if (!state.encounterStartedAt || state.visitFinished) {
      return
    }
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [phase, state.encounterStartedAt, state.visitFinished])

  if (phase === 'finished') {
    return null
  }

  const isAssistant = state.role === 'assistant'
  const noteReview = getNoteReviewStatus(state.noteStatus)
  const elapsed =
    state.encounterStartedAt != null
      ? formatEncounterElapsed(state.encounterStartedAt, now)
      : null

  const handleStartVisit = () => {
    dispatch({ type: 'START_VISIT' })
    dispatch({ type: 'OPEN_VISIT', visitId: 'today' })
    visitStageToast('Visit started', 'intake')
  }

  const handleOpenPanel = () => {
    dispatch({ type: 'OPEN_VISIT', visitId: 'today' })
  }

  const renderPrimaryCopy = () => {
    switch (phase) {
      case 'no_appointment':
        return <p className="text-foreground">No appointment has been scheduled yet.</p>
      case 'future':
        return (
          <p className="text-foreground">
            {appointmentForPhase ? formatAppointmentDateTime(appointmentForPhase) : 'Appointment scheduled'}
          </p>
        )
      case 'scheduled_today':
        return (
          <p className="text-foreground">
            {todayAppointment
              ? `${todayAppointment.kind} appointment is today at ${todayAppointment.time}`
              : 'Appointment is today'}
          </p>
        )
      case 'late_today':
        return (
          <p className="text-foreground">
            {todayAppointment
              ? `${todayAppointment.kind} appointment was today at ${todayAppointment.time} — running late`
              : 'Appointment is running late'}
          </p>
        )
      case 'intake':
        return (
          <div className="flex flex-col gap-0.5">
            {elapsed && (
              <p className="text-foreground">
                <strong>{elapsed}</strong>
              </p>
            )}
            {!isAssistant && (
              <p className="text-sm text-muted-foreground">
                {DEMO_ASSISTANT_NAME} is currently with the patient.
              </p>
            )}
          </div>
        )
      case 'review':
        return (
          <div className="flex flex-col gap-0.5">
            {elapsed && (
              <p className="text-foreground">
                <strong>{elapsed}</strong>
              </p>
            )}
            {isAssistant && noteReview === 'pending' && (
              <p className="text-sm text-muted-foreground">
                Submitted — awaiting {DEMO_PHYSICIAN_SHORT_NAME}&apos;s review.
              </p>
            )}
            {isAssistant && noteReview === 'returned' && (
              <p className="text-sm text-muted-foreground">
                {DEMO_PHYSICIAN_SHORT_NAME} returned your note with comments.
              </p>
            )}
            {isAssistant && noteReview === 'approved' && (
              <p className="text-sm text-muted-foreground">
                Note approved — awaiting {DEMO_PHYSICIAN_SHORT_NAME} to finish the visit.
              </p>
            )}
            {!isAssistant && noteReview === 'pending' && (
              <p className="text-sm text-muted-foreground">Ready for your review</p>
            )}
            {!isAssistant && noteReview === 'returned' && (
              <p className="text-sm text-muted-foreground">Waiting on Sam&apos;s revision</p>
            )}
            {!isAssistant && noteReview === 'approved' && (
              <p className="text-sm text-muted-foreground">Note approved</p>
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
        return (
          <Button onClick={handleStartVisit}>Start visit</Button>
        )
      case 'intake':
        if (!isAssistant) {
          return null
        }
        return (
          <Button onClick={handleOpenPanel}>Continue</Button>
        )
      case 'review':
        if (isAssistant && noteReview === 'returned') {
          return (
            <Button onClick={handleOpenPanel}>Revise</Button>
          )
        }
        if (!isAssistant) {
          return (
            <Button onClick={handleOpenPanel}>Review visit</Button>
          )
        }
        return null
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
      {renderPrimaryCopy()}
      {renderAction()}
    </div>
  )
}

import { toast } from 'sonner'
import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import { DEMO_TODAY, getAppointmentForPatientOnDate } from '@/lib/scheduleData'

interface TodayAppointmentBannerProps {
  patientId: string
}

export function TodayAppointmentBanner({ patientId }: TodayAppointmentBannerProps) {
  const { state, dispatch } = useAppState()
  const appointment = getAppointmentForPatientOnDate(patientId, DEMO_TODAY)

  if (!appointment || state.visitStarted || state.visitFinished) {
    return null
  }

  const handleStartVisit = () => {
    dispatch({ type: 'START_VISIT' })
    dispatch({ type: 'OPEN_VISIT', visitId: 'today' })
    toast.success('Visit started')
  }

  return (
    <div
      data-slot="today-appointment-banner"
      className="flex shrink-0 items-center justify-between gap-4 border-b border-green-200 bg-green-50 px-6 py-4"
    >
      <h5>
        {appointment.kind} appointment is today at {appointment.time}
      </h5>
      <Button onClick={handleStartVisit}>Start visit</Button>
    </div>
  )
}

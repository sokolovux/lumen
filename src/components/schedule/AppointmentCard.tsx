import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { Appointment } from '@/state/types'
import { Card, CardAction, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { JORDAN_REYES_ID } from '@/lib/scheduleData'
import {
  getScheduleStatusLabel,
  scheduleStatusTint,
} from '@/lib/statusDerivation'
import { useAppState } from '@/state/AppStateContext'

interface AppointmentCardProps {
  appointment: Appointment
  displayStatus: Appointment['status']
}

export function AppointmentCard({ appointment, displayStatus }: AppointmentCardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { dispatch } = useAppState()

  const handleClick = () => {
    if (appointment.isInteractive || appointment.patientId === JORDAN_REYES_ID) {
      dispatch({ type: 'CLOSE_VISIT' })
      navigate(`/patients/${appointment.patientId}`, {
        state: { from: `${location.pathname}${location.search}` },
      })
      return
    }
    toast.info('This patient is scoped out of the demo', {
      description: 'Jordan Reyes is the only interactive patient in this prototype.',
    })
  }

  const statusTint = scheduleStatusTint[displayStatus]

  return (
    <Card size="sm" interactive onClick={handleClick}>
      <CardHeader>
        <div>
          <p><strong>{appointment.patientName}</strong></p>
          <p>{appointment.time}, {appointment.kind}</p>
        </div>
        {statusTint && (
          <CardAction>
            <Badge variant="outline" className={statusTint}>
              {getScheduleStatusLabel(displayStatus)}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
    </Card>
  )
}

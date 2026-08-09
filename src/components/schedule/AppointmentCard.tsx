import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { Appointment } from '@/state/types'
import { Card, CardAction, CardContent, CardHeader } from '@/components/ui/card'
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
  const { dispatch } = useAppState()

  const handleClick = () => {
    if (appointment.isInteractive || appointment.patientId === JORDAN_REYES_ID) {
      dispatch({ type: 'SET_BREADCRUMB_ORIGIN', origin: 'schedule' })
      dispatch({ type: 'OPEN_VISIT', visitId: 'today' })
      navigate(`/patients/${appointment.patientId}`)
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
          <p className="text-sm"><strong>{appointment.patientName}</strong></p>
          <p className="text-xs text-muted-foreground">{appointment.time}</p>
        </div>
        {statusTint && (
          <CardAction>
            <Badge variant="outline" className={statusTint}>
              {getScheduleStatusLabel(displayStatus)}
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">MRN placeholder</p>
      </CardContent>
    </Card>
  )
}

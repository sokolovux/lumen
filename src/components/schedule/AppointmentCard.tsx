import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { Appointment } from '@/state/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { StatusPill } from '@/components/schedule/StatusPill'
import { JORDAN_REYES_ID } from '@/lib/scheduleData'
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

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={handleClick}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3 pb-1">
        <div>
          <p className="text-sm font-medium">{appointment.patientName}</p>
          <p className="text-xs text-muted-foreground">{appointment.time}</p>
        </div>
        <StatusPill status={displayStatus} />
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-xs text-muted-foreground">MRN placeholder</p>
      </CardContent>
    </Card>
  )
}

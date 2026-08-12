import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { Appointment } from '@/state/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { JORDAN_REYES_ID } from '@/lib/scheduleData'
import {
  getScheduleStatusLabel,
  scheduleStatusTint,
} from '@/lib/statusDerivation'
import { useAppState } from '@/state/AppStateContext'
import { shouldAutoOpenTodayVisit } from '@/lib/visitLifecycle'

interface AppointmentCardProps {
  appointment: Appointment
  displayStatus: Appointment['status']
  showStatusBadge?: boolean
}

export function AppointmentCard({
  appointment,
  displayStatus,
  showStatusBadge = true,
}: AppointmentCardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { dispatch, state } = useAppState()

  const handleClick = () => {
    if (appointment.isInteractive || appointment.patientId === JORDAN_REYES_ID) {
      const autoOpenTodayVisit =
        appointment.patientId === JORDAN_REYES_ID
        && shouldAutoOpenTodayVisit(state.role, state)
      navigate(`/patients/${appointment.patientId}`, {
        state: {
          from: `${location.pathname}${location.search}`,
          autoOpenTodayVisit,
        },
      })
      return
    }
    toast.info('This patient is scoped out of the demo', {
      description: 'Jordan Reyes is the only interactive patient in this prototype.',
    })
  }

  const statusTint = scheduleStatusTint[displayStatus]
  const showStatusDot =
    displayStatus === 'intake' || displayStatus === 'review'

  return (
    <Card
      size="sm"
      interactive
      data-schedule-status={displayStatus}
      onClick={handleClick}
    >
      <CardContent className="flex flex-col gap-1">
        <div className="@container">
          <div className="flex flex-col gap-1 @[13rem]:flex-row @[13rem]:items-center @[13rem]:justify-between">
            {showStatusBadge && (
              <Badge variant="outline" className={`order-1 @[13rem]:order-2 ${statusTint}`}>
                {getScheduleStatusLabel(displayStatus)}
                {showStatusDot && (
                  <span
                    data-slot="appointment-status-dot"
                    data-status={displayStatus}
                    aria-hidden
                  />
                )}
              </Badge>
            )}
            <p className="order-2 @[13rem]:order-1">
              <strong className="font-mono tabular-nums">{appointment.time}</strong>
            </p>
          </div>
        </div>
        <p className="text-sm text-foreground">{appointment.patientName}</p>
        <p className="text-sm">{appointment.kind}</p>
      </CardContent>
    </Card>
  )
}

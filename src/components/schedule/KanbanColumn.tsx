import type { Appointment, ScheduleStatus } from '@/state/types'
import { AppointmentCard } from '@/components/schedule/AppointmentCard'
import { jordanStatus } from '@/lib/statusDerivation'
import type { AppState } from '@/state/types'
import { JORDAN_REYES_ID } from '@/lib/scheduleData'
import { LightScrollbar } from '@/components/ui/light-scrollbar'

interface KanbanColumnProps {
  statusKey: ScheduleStatus
  label: string
  appointments: Appointment[]
  visitState: Pick<AppState, 'visitStarted' | 'visitFinished' | 'hasSubmittedOnce'>
}

function columnStatus(
  apt: Appointment,
  visitState: KanbanColumnProps['visitState'],
): Appointment['status'] {
  if (apt.patientId === JORDAN_REYES_ID) {
    return jordanStatus(visitState)
  }
  return apt.status
}

export function KanbanColumn({
  statusKey,
  label,
  appointments,
  visitState,
}: KanbanColumnProps) {
  const columnAppointments = appointments.filter(
    (apt) => columnStatus(apt, visitState) === statusKey,
  )

  return (
    <div className="flex min-h-0 min-w-[200px] flex-1 flex-col overflow-hidden border-r border-gray-200 bg-gray-50 last:border-r-0">
      <div className="shrink-0 border-b bg-background p-6">
        <h5>{label}</h5>
        <p className="text-sm">{columnAppointments.length} appointments</p>
      </div>
      <LightScrollbar className="min-h-0 flex-1" data-schedule-column="">
        <div data-schedule-column-content="">
          {columnAppointments.length === 0 ? (
            <p className="p-6 text-center text-xs text-muted-foreground">No appointments</p>
          ) : (
            <div className="flex w-full flex-col gap-2 p-6">
              {columnAppointments.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  displayStatus={columnStatus(apt, visitState)}
                />
              ))}
            </div>
          )}
        </div>
      </LightScrollbar>
    </div>
  )
}

export { columnStatus }

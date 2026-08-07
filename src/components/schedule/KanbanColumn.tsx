import type { Appointment } from '@/state/types'
import { AppointmentCard } from '@/components/schedule/AppointmentCard'
import { isLateAppointment } from '@/lib/scheduleData'
import { jordanStatus } from '@/lib/statusDerivation'
import type { AppState } from '@/state/types'
import { JORDAN_REYES_ID } from '@/lib/scheduleData'

interface KanbanColumnProps {
  statusKey: string
  label: string
  appointments: Appointment[]
  visitState: Pick<AppState, 'checkedIn' | 'visitStarted' | 'visitFinished' | 'noteStatus'>
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

function displayStatus(
  apt: Appointment,
  visitState: KanbanColumnProps['visitState'],
): Appointment['status'] {
  const base = columnStatus(apt, visitState)
  if (base === 'completed') return 'completed'
  if (isLateAppointment(apt.time, base)) return 'late'
  return base
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
    <div className="flex min-w-[200px] flex-1 flex-col rounded-lg border bg-muted/20">
      <div className="border-b px-3 py-2">
        <h3 className="text-sm font-medium">{label}</h3>
        <p className="text-xs text-muted-foreground">{columnAppointments.length} appointments</p>
      </div>
      <div className="flex flex-col gap-2 p-2">
        {columnAppointments.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">No appointments</p>
        ) : (
          columnAppointments.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              displayStatus={displayStatus(apt, visitState)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export { columnStatus, displayStatus }

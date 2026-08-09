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
  visitState: Pick<AppState, 'visitStarted' | 'visitFinished' | 'noteStatus'>
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
  // Column already conveys stage — hide late/status pills from with Assistant onward
  if (base === 'with_assistant' || base === 'with_physician' || base === 'finished') {
    return 'scheduled'
  }
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
    <div className="flex min-w-[200px] flex-1 flex-col gap-3 border-r bg-sidebar p-6 last:border-r-0">
      <div>
        <h6>{label}</h6>
        <p className="text-sm">{columnAppointments.length} appointments</p>
      </div>
      <div className="flex flex-col gap-2">
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

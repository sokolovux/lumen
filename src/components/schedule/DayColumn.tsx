import type { Appointment, AppState } from '@/state/types'
import { AppointmentCard } from '@/components/schedule/AppointmentCard'
import { parseAppointmentTime, isLateAppointment, JORDAN_REYES_ID } from '@/lib/scheduleData'
import { jordanStatus } from '@/lib/statusDerivation'
import { Separator } from '@/components/ui/separator'

interface DayColumnProps {
  date: string
  label: string
  appointments: Appointment[]
  visitState: Pick<AppState, 'visitStarted' | 'visitFinished' | 'noteStatus'>
}

function columnStatus(
  apt: Appointment,
  visitState: DayColumnProps['visitState'],
): Appointment['status'] {
  if (apt.patientId === JORDAN_REYES_ID) {
    return jordanStatus(visitState)
  }
  return apt.status
}

function displayStatus(
  apt: Appointment,
  visitState: DayColumnProps['visitState'],
): Appointment['status'] {
  const base = columnStatus(apt, visitState)
  if (base === 'finished') return 'finished'
  if (isLateAppointment(apt.time, base)) return 'late'
  return base
}

export function DayColumn({ date, label, appointments, visitState }: DayColumnProps) {
  const dayAppointments = appointments
    .filter((apt) => apt.date === date)
    .sort((a, b) => parseAppointmentTime(a.time) - parseAppointmentTime(b.time))

  const active = dayAppointments.filter((apt) => columnStatus(apt, visitState) !== 'finished')
  const finished = dayAppointments.filter((apt) => columnStatus(apt, visitState) === 'finished')

  return (
    <div className="flex min-w-[200px] flex-1 flex-col gap-3 border-r bg-sidebar p-6 last:border-r-0">
      <div>
        <h6>{label}</h6>
        <p className="text-sm">{dayAppointments.length} appointments</p>
      </div>
      <div className="flex flex-col gap-2">
        {active.length === 0 && finished.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">No appointments</p>
        ) : (
          <>
            {active.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                displayStatus={displayStatus(apt, visitState)}
              />
            ))}
            {finished.length > 0 && (
              <>
                <Separator className="my-1" />
                <p className="px-1 text-xs"><strong>Finished</strong></p>
                {finished.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    displayStatus={displayStatus(apt, visitState)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

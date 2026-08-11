import type { Appointment, AppState, ScheduleStatus } from '@/state/types'
import { Fragment } from 'react'
import { AppointmentCard } from '@/components/schedule/AppointmentCard'
import { Separator } from '@/components/ui/separator'
import { parseAppointmentTime, JORDAN_REYES_ID, TODAY_KANBAN_COLUMNS } from '@/lib/scheduleData'
import { jordanStatus } from '@/lib/statusDerivation'
import { LightScrollbar } from '@/components/ui/light-scrollbar'

interface DayColumnProps {
  date: string
  label: string
  appointments: Appointment[]
  visitState: Pick<AppState, 'visitStarted' | 'visitFinished' | 'hasSubmittedOnce'>
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

function appointmentsForStatus(
  dayAppointments: Appointment[],
  status: ScheduleStatus,
  visitState: DayColumnProps['visitState'],
): Appointment[] {
  return dayAppointments
    .filter((apt) => columnStatus(apt, visitState) === status)
    .sort((a, b) => parseAppointmentTime(a.time) - parseAppointmentTime(b.time))
}

export function DayColumn({ date, label, appointments, visitState }: DayColumnProps) {
  const dayAppointments = appointments.filter((apt) => apt.date === date)

  const sections = TODAY_KANBAN_COLUMNS
    .map(({ key }) => ({
      status: key,
      appointments: appointmentsForStatus(dayAppointments, key, visitState),
    }))
    .filter((section) => section.appointments.length > 0)

  return (
    <div className="flex min-h-0 min-w-[200px] flex-1 flex-col overflow-hidden border-r border-gray-200 bg-gray-50 last:border-r-0">
      <div className="shrink-0 border-b bg-background p-6">
        <h5>{label}</h5>
        <p className="text-sm">{dayAppointments.length} appointments</p>
      </div>
      <LightScrollbar className="min-h-0 flex-1" data-schedule-column="">
        <div data-schedule-column-content="">
          {sections.length === 0 ? (
            <p className="p-6 text-center text-xs text-muted-foreground">No appointments</p>
          ) : (
            sections.map((section, index) => (
              <Fragment key={section.status}>
                {index > 0 && <Separator />}
                <div className="flex w-full flex-col gap-2 p-6">
                  {section.appointments.map((apt) => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      displayStatus={columnStatus(apt, visitState)}
                    />
                  ))}
                </div>
              </Fragment>
            ))
          )}
        </div>
      </LightScrollbar>
    </div>
  )
}

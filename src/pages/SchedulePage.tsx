import { useMemo } from 'react'
import { useAppState } from '@/state/AppStateContext'
import { ScheduleToggle } from '@/components/schedule/ScheduleToggle'
import { KanbanColumn } from '@/components/schedule/KanbanColumn'
import { DayColumn } from '@/components/schedule/DayColumn'
import {
  SEEDED_APPOINTMENTS,
  TODAY_KANBAN_COLUMNS,
  WEEK_DATES,
} from '@/lib/scheduleData'
import { formatFixedDate } from '@/lib/fixedClock'

const DAY_LABELS = ['Mon Aug 10', 'Tue Aug 11', 'Wed Aug 12', 'Thu Aug 13', 'Fri Aug 14']

export function SchedulePage() {
  const { state } = useAppState()

  const todayAppointments = useMemo(
    () => SEEDED_APPOINTMENTS.filter((apt) => apt.date === '2026-08-10'),
    [],
  )

  const visitState = {
    checkedIn: state.checkedIn,
    visitStarted: state.visitStarted,
    visitFinished: state.visitFinished,
    noteStatus: state.noteStatus,
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold">Schedule</h1>
          <p className="text-sm text-muted-foreground">{formatFixedDate()}</p>
        </div>
        <ScheduleToggle />
      </div>
      <div className="flex-1 overflow-x-auto p-4">
        {state.scheduleView === 'today' ? (
          <div className="flex min-h-full gap-3">
            {TODAY_KANBAN_COLUMNS.map((col) => (
              <KanbanColumn
                key={col.key}
                statusKey={col.key}
                label={col.label}
                appointments={todayAppointments}
                visitState={visitState}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-full gap-3">
            {WEEK_DATES.map((date, i) => (
              <DayColumn
                key={date}
                date={date}
                label={DAY_LABELS[i] ?? date}
                appointments={SEEDED_APPOINTMENTS}
                visitState={visitState}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

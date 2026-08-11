import { useEffect, useMemo, useState } from 'react'
import { Plus, SearchIcon } from 'lucide-react'
import { useAppState } from '@/state/AppStateContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { KanbanColumn } from '@/components/schedule/KanbanColumn'
import { DayColumn } from '@/components/schedule/DayColumn'
import {
  SEEDED_APPOINTMENTS,
  TODAY_KANBAN_COLUMNS,
  WEEK_DATES,
} from '@/lib/scheduleData'

const DAY_LABELS = ['Mon Aug 10', 'Tue Aug 11', 'Wed Aug 12', 'Thu Aug 13', 'Fri Aug 14']
const EST_TIME_ZONE = 'America/New_York'

function EstClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const dateLabel = now.toLocaleDateString('en-US', {
    timeZone: EST_TIME_ZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const timeLabel = now
    .toLocaleTimeString('en-US', {
      timeZone: EST_TIME_ZONE,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(/\s+(AM|PM)/i, '$1')

  return (
    <div className="flex items-center gap-6">
      <p>{dateLabel}</p>
      <div data-slot="schedule-clock-time">
        <p>{timeLabel}</p>
        <span data-slot="schedule-clock-dot" aria-hidden />
      </div>
    </div>
  )
}

export function SchedulePage() {
  const { state, dispatch } = useAppState()

  const todayAppointments = useMemo(
    () => SEEDED_APPOINTMENTS.filter((apt) => apt.date === '2026-08-10'),
    [],
  )

  const visitState = {
    visitStarted: state.visitStarted,
    visitFinished: state.visitFinished,
    noteStatus: state.noteStatus,
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        title={(
          <div className="flex items-center gap-6">
            <h3>Schedule</h3>
            <EstClock />
          </div>
        )}
      >
        <div className="flex items-center gap-2">
          <InputGroup className="h-10 w-64">
            <InputGroupAddon>
              <SearchIcon className="opacity-50" />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search appointments" readOnly />
          </InputGroup>
          <div
            data-slot="page-view-switch"
            className="flex h-10 rounded-sm border bg-background p-0.5"
          >
            {([
              { key: 'today' as const, label: 'Day' },
              { key: 'fullWeek' as const, label: 'Week' },
            ]).map(({ key, label }) => (
              <Button
                key={key}
                variant="ghost"
                size="sm"
                className="h-full"
                aria-pressed={state.scheduleView === key}
                onClick={() => dispatch({ type: 'SET_SCHEDULE_VIEW', view: key })}
              >
                {label}
              </Button>
            ))}
          </div>
          <Button type="button">
            <Plus />
            Create visit
          </Button>
        </div>
      </PageHeader>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {state.scheduleView === 'today' ? (
          <div className="flex min-h-0 flex-1">
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
          <div className="flex min-h-0 flex-1">
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

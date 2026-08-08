import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'

export function ScheduleToggle() {
  const { state, dispatch } = useAppState()

  return (
    <div className="flex rounded-lg border bg-background p-0.5">
      {([
        { key: 'today' as const, label: 'Today' },
        { key: 'fullWeek' as const, label: 'Full week' },
      ]).map(({ key, label }) => (
        <Button
          key={key}
          variant={state.scheduleView === key ? 'default' : 'ghost'}
          size="sm"
          onClick={() => dispatch({ type: 'SET_SCHEDULE_VIEW', view: key })}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}

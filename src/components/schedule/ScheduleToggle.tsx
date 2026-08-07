import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 px-4',
            state.scheduleView === key && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
          )}
          onClick={() => dispatch({ type: 'SET_SCHEDULE_VIEW', view: key })}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}

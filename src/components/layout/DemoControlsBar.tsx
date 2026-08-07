import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import { formatFixedDate, formatFixedTime } from '@/lib/fixedClock'
import { cn } from '@/lib/utils'

export function DemoControlsBar() {
  const { state, dispatch } = useAppState()

  return (
    <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Demo Controls
        </span>
        <div className="flex rounded-lg border bg-background p-0.5">
          {(['pa', 'physician'] as const).map((role) => (
            <Button
              key={role}
              variant="ghost"
              size="sm"
              className={cn(
                'h-7 px-3 text-xs capitalize',
                state.role === role && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
              )}
              onClick={() => dispatch({ type: 'SET_ROLE', role })}
            >
              {role === 'pa' ? 'PA' : 'Physician'}
            </Button>
          ))}
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        Pinned clock: {formatFixedDate()} · {formatFixedTime()}
      </div>
    </div>
  )
}

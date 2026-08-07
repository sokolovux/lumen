import { toast } from 'sonner'
import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import { formatFixedDate, formatFixedTime } from '@/lib/fixedClock'
import { cn } from '@/lib/utils'
import { RotateCcw } from 'lucide-react'

export function DemoControlsBar() {
  const { state, dispatch } = useAppState()

  const handleReset = () => {
    dispatch({ type: 'RESET_DEMO' })
    toast.success('Demo reset', { description: 'All state restored to initial values.' })
  }

  return (
    <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2">
      <div className="flex items-center gap-3">
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
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 px-2.5 text-xs"
          onClick={handleReset}
        >
          <RotateCcw className="size-3" />
          Reset Demo
        </Button>
      </div>
      <div className="text-xs text-muted-foreground">
        Pinned clock: {formatFixedDate()} · {formatFixedTime()}
      </div>
    </div>
  )
}

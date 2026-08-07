import { toast } from 'sonner'
import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { RotateCcw } from 'lucide-react'

export function DemoControlsBar() {
  const { state, dispatch } = useAppState()

  const handleReset = () => {
    dispatch({ type: 'RESET_DEMO' })
    toast.success('Demo reset', { description: 'All state restored to initial values.' })
  }

  return (
    <div className="dark flex items-center gap-3 border-b border-border bg-background px-4 py-2 text-foreground">
      <div className="flex rounded-lg border border-border bg-card p-0.5">
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
        Reset demo
      </Button>
    </div>
  )
}

import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface VitalsSectionProps {
  readOnly?: boolean
}

export function VitalsSection({ readOnly = false }: VitalsSectionProps) {
  const { state, dispatch } = useAppState()

  return (
    <section>
      <h3 className="mb-2 text-sm font-medium">Vitals</h3>
      {state.vitalsSubmitted || readOnly ? (
        <div className="grid grid-cols-2 gap-2">
          {['BP', 'HR', 'Temp', 'SpO2'].map((label) => (
            <div key={label} className="rounded-md border p-2">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Skeleton className="mt-1 h-4 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {['BP', 'HR', 'Temp', 'SpO2'].map((label) => (
              <div key={label} className="rounded-md border p-2">
                <p className="text-xs text-muted-foreground">{label}</p>
                <Skeleton className="mt-1 h-4 w-full" />
              </div>
            ))}
          </div>
          {state.role === 'pa' && state.visitStarted && (
            <Button
              size="sm"
              onClick={() => {
                dispatch({ type: 'SUBMIT_VITALS' })
                toast.success('Vitals submitted')
              }}
            >
              Submit vitals
            </Button>
          )}
        </div>
      )}
    </section>
  )
}

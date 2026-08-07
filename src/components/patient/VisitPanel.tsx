import { X } from 'lucide-react'
import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { VitalsSection } from '@/components/patient/VitalsSection'
import { NoteSection } from '@/components/patient/NoteSection'
import { ConfidentialNoteSection } from '@/components/patient/ConfidentialNoteSection'
import { toast } from 'sonner'

interface VisitPanelProps {
  visitLabel: string
  isPastVisit?: boolean
}

export function VisitPanel({ visitLabel, isPastVisit = false }: VisitPanelProps) {
  const { state, dispatch } = useAppState()
  const isPhysician = state.role === 'physician'
  const isToday = !isPastVisit

  const handleFinishVisit = () => {
    if (!state.hasSubmittedOnce) return
    dispatch({ type: 'FINISH_VISIT' })
    toast.success('Visit finished', { description: 'Encounter closed. Documentation review can continue.' })
  }

  return (
    <div className="flex h-full w-[380px] shrink-0 flex-col border-l bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">{visitLabel}</h2>
          <p className="text-xs text-muted-foreground">
            {isPastVisit ? 'Past visit' : 'Today\'s visit'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => dispatch({ type: 'CLOSE_VISIT' })}
        >
          <X className="size-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 p-4">
          {isToday && !state.visitStarted && !isPastVisit && (
            <Button
              onClick={() => {
                dispatch({ type: 'START_VISIT' })
                toast.success('Visit started')
              }}
              disabled={state.role !== 'pa' && state.role !== 'physician'}
            >
              Start Visit
            </Button>
          )}

          {(state.visitStarted || isPastVisit) && (
            <>
              <VitalsSection readOnly={isPastVisit} />
              <Separator />
              <NoteSection readOnly={isPastVisit} />
            </>
          )}

          {isPhysician && (state.visitStarted || isPastVisit) && (
            <>
              <Separator />
              <ConfidentialNoteSection readOnly={isPastVisit} />
            </>
          )}

          {isToday && isPhysician && state.visitStarted && !state.visitFinished && (
            <>
              <Separator />
              <Button
                onClick={handleFinishVisit}
                disabled={!state.hasSubmittedOnce}
                variant="secondary"
              >
                Finish Visit
              </Button>
              {!state.hasSubmittedOnce && (
                <p className="text-xs text-muted-foreground">
                  Note must be submitted at least once before finishing the visit.
                </p>
              )}
            </>
          )}

          {state.visitFinished && isToday && (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
              Visit finished — documentation review continues
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

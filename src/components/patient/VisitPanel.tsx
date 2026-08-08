import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { NoteSection } from '@/components/patient/NoteSection'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface VisitPanelProps {
  open: boolean
  visitLabel: string
  isPastVisit?: boolean
}

export function VisitPanel({
  open,
  visitLabel,
  isPastVisit = false,
}: VisitPanelProps) {
  const { state, dispatch } = useAppState()
  const isPhysician = state.role === 'physician'
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)
  const [displayLabel, setDisplayLabel] = useState(visitLabel)
  const [displayPast, setDisplayPast] = useState(isPastVisit)
  const [confidentialDraft, setConfidentialDraft] = useState(state.confidentialNoteContent)

  useEffect(() => {
    if (open) {
      setDisplayLabel(visitLabel)
      setDisplayPast(isPastVisit)
      setMounted(true)
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
      return () => cancelAnimationFrame(id)
    }
    setVisible(false)
  }, [open, visitLabel, isPastVisit])

  useEffect(() => {
    setConfidentialDraft(state.confidentialNoteContent)
  }, [state.confidentialNoteContent])

  const handleFinishVisit = () => {
    if (!state.hasSubmittedOnce) return
    dispatch({ type: 'FINISH_VISIT' })
    toast.success('Visit finished', {
      description: 'Encounter closed. Documentation review can continue.',
    })
  }

  if (!mounted) return null

  const isToday = !displayPast
  const showClinicalSections = state.visitStarted || displayPast

  return (
    <div
      className={cn(
        'h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        visible ? 'w-[380px]' : 'w-0',
      )}
      onTransitionEnd={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.propertyName !== 'width') return
        if (!visible) setMounted(false)
      }}
    >
      <div
        className={cn(
          'flex h-full w-[380px] flex-col border-l bg-background transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          visible ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h6>{displayLabel}</h6>
            <p className="text-xs text-muted-foreground">
              {displayPast ? 'Past visit' : "Today's visit"}
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
            {isToday && !state.visitStarted && !displayPast && (
              <Button
                onClick={() => {
                  dispatch({ type: 'START_VISIT' })
                  toast.success('Visit started')
                }}
                disabled={state.role !== 'pa' && state.role !== 'physician'}
              >
                Start visit
              </Button>
            )}

            {showClinicalSections && (
              <>
                <section>
                  <h6 className="mb-2">Vitals</h6>
                  {state.vitalsSubmitted || displayPast ? (
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
                <Separator />
                <NoteSection readOnly={displayPast} />
              </>
            )}

            {isPhysician && showClinicalSections && (
              <>
                <Separator />
                <section>
                  <h6 className="mb-1">Confidential note</h6>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Physician-only. Hidden from PA — no request path.
                  </p>
                  <Textarea
                    placeholder="Confidential physician note..."
                    value={confidentialDraft}
                    onChange={(e) => setConfidentialDraft(e.target.value)}
                    rows={4}
                    disabled={displayPast}
                    className="text-sm"
                  />
                  {!displayPast && (
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        dispatch({ type: 'SAVE_CONFIDENTIAL_NOTE', content: confidentialDraft })
                        toast.success('Confidential note saved')
                      }}
                    >
                      Save confidential note
                    </Button>
                  )}
                </section>
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
                  Finish visit
                </Button>
                {!state.hasSubmittedOnce && (
                  <p className="text-xs text-muted-foreground">
                    Note must be submitted at least once before finishing the visit.
                  </p>
                )}
              </>
            )}

            {state.visitFinished && isToday && (
              <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                Visit finished — documentation review continues
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

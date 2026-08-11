import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LightScrollbar } from '@/components/ui/light-scrollbar'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { NoteSection } from '@/components/patient/NoteSection'
import { VitalsSection } from '@/components/patient/VitalsSection'
import { DEMO_ASSISTANT_NAME } from '@/lib/scheduleData'
import { getScheduleStatusLabel, scheduleStatusTint } from '@/lib/statusDerivation'
import { formatEncounterElapsed } from '@/lib/visitLifecycle'
import { visitErrorToast, visitStageToast } from '@/lib/visitToasts'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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
  const [now, setNow] = useState(() => Date.now())
  const [finishDialogOpen, setFinishDialogOpen] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
      return () => cancelAnimationFrame(id)
    }
    setVisible(false)
  }, [open])

  const isToday = !isPastVisit
  const showEncounterMeta =
    isToday &&
    state.encounterStartedAt != null &&
    !state.visitFinished &&
    state.visitStarted
  const visitPhase = state.hasSubmittedOnce ? 'review' : 'intake'
  const fieldsLocked = isPastVisit || state.visitFinished

  useEffect(() => {
    if (!showEncounterMeta) {
      return
    }
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [showEncounterMeta])

  const handleFinishVisit = () => {
    if (!state.hasSubmittedOnce) {
      visitErrorToast('Submit the clinical note before finishing the visit')
      return
    }
    setFinishDialogOpen(true)
  }

  const confirmFinishVisit = () => {
    setFinishDialogOpen(false)
    dispatch({ type: 'FINISH_VISIT' })
    visitStageToast('Visit finished', 'finished')
  }

  if (!mounted) return null

  const showClinicalSections = state.visitStarted || isPastVisit
  const physicianIntakeBlock =
    isToday && isPhysician && state.visitStarted && !state.hasSubmittedOnce
  const inReview = isToday && state.hasSubmittedOnce && !state.visitFinished
  const showPhysicianOptionalFields =
    isPhysician && showClinicalSections && !physicianIntakeBlock && !fieldsLocked
  const elapsed =
    state.encounterStartedAt != null
      ? formatEncounterElapsed(state.encounterStartedAt, now)
      : null

  return (
    <>
      <div
        className={cn(
          'h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          visible ? 'w-[480px]' : 'w-0',
        )}
        onTransitionEnd={(event) => {
          if (event.target !== event.currentTarget) return
          if (event.propertyName !== 'width') return
          if (!visible) setMounted(false)
        }}
      >
        <div
          data-slot="visit-panel"
          className={cn(
            'flex h-full w-[480px] flex-col border-l bg-background transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
            visible ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div
            data-slot="visit-panel-header"
            data-phase={showEncounterMeta ? visitPhase : undefined}
          >
            <div data-slot="visit-panel-header-start">
              <h4>{visitLabel}</h4>
              {showEncounterMeta && elapsed && (
                <p className="text-sm text-foreground">
                  <strong>{elapsed}</strong>
                </p>
              )}
              {showEncounterMeta && (
                <Badge variant="outline" className={scheduleStatusTint[visitPhase]}>
                  {getScheduleStatusLabel(visitPhase)}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => dispatch({ type: 'CLOSE_VISIT' })}
            >
              <X className="size-4" />
            </Button>
          </div>
          <LightScrollbar className="min-h-0 flex-1">
            <div className="flex flex-col gap-4 p-4">
              {physicianIntakeBlock && (
                <p className="text-sm text-muted-foreground">
                  {DEMO_ASSISTANT_NAME} is currently with the patient.
                </p>
              )}

              {showClinicalSections && !physicianIntakeBlock && (
                <>
                  <VitalsSection readOnly={isPastVisit} inVisitPanel />
                  <Separator />
                  <NoteSection readOnly={isPastVisit} inVisitPanel />
                </>
              )}

              {showPhysicianOptionalFields && (
                <>
                  <Separator />
                  <section>
                    <h5 className="mb-1">Physician addendum</h5>
                    <p className="mb-2 text-xs text-muted-foreground">
                      Optional. Shared with the assistant.
                    </p>
                    <Textarea
                      placeholder="Add physician addendum..."
                      value={state.physicianAddendum}
                      disabled={fieldsLocked}
                      onChange={(e) => {
                        dispatch({
                          type: 'SAVE_PHYSICIAN_ADDENDUM',
                          content: e.target.value,
                        })
                      }}
                    />
                  </section>
                </>
              )}

              {!isPhysician && state.physicianAddendum.trim() && inReview && !isPastVisit && (
                <>
                  <Separator />
                  <section>
                    <h5 className="mb-1">Physician addendum</h5>
                    <Textarea disabled value={state.physicianAddendum} />
                  </section>
                </>
              )}

              {showPhysicianOptionalFields && (
                <>
                  <Separator />
                  <section>
                    <h5 className="mb-1">Confidential note</h5>
                    <p className="mb-2 text-xs text-muted-foreground">
                      Optional. Physician-only. Hidden from Assistant — no request path.
                    </p>
                    <Textarea
                      placeholder="Confidential physician note..."
                      value={state.confidentialNoteContent}
                      disabled={fieldsLocked}
                      onChange={(e) => {
                        dispatch({
                          type: 'SAVE_CONFIDENTIAL_NOTE',
                          content: e.target.value,
                        })
                      }}
                    />
                  </section>
                </>
              )}

              {isToday && isPhysician && inReview && (
                <>
                  <Separator />
                  <Button onClick={handleFinishVisit}>
                    Finish visit
                  </Button>
                </>
              )}
            </div>
          </LightScrollbar>
        </div>
      </div>

      <AlertDialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finish visit?</AlertDialogTitle>
            <AlertDialogDescription>
              All information entered by the physician and the assistant will be finalized
              and become uneditable going forward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmFinishVisit}>
              Finish visit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

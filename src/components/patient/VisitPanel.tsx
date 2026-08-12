import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LightScrollbar } from '@/components/ui/light-scrollbar'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { NoteSection } from '@/components/patient/NoteSection'
import { VitalsSection } from '@/components/patient/VitalsSection'
import { VisitFieldLabel } from '@/components/patient/VisitFieldLabel'
import { AccessTimer } from '@/components/patient/AccessTimer'
import { DEMO_ASSISTANT_NAME } from '@/lib/scheduleData'
import { getScheduleStatusLabel, scheduleStatusTint } from '@/lib/statusDerivation'
import { isAssistantNoteRevision, isAssistantVisitViewOnly, hasPhysicianReviewedNote, getSubmitHandoffLabel, isSubmitHandoffDisabled, submitClinicalNoteHandoff } from '@/lib/visitLifecycle'
import { visitErrorToast, visitStageToast } from '@/lib/visitToasts'
import type { VisitChromeStagger } from '@/components/patient/visit-chrome-sequence'
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
  chromeStagger?: VisitChromeStagger
  instantOpen?: boolean
  onWidthOpenTransitionEnd?: () => void
  onWidthCloseTransitionEnd?: () => void
}

export function VisitPanel({
  open,
  visitLabel,
  isPastVisit = false,
  chromeStagger = 'idle',
  instantOpen = false,
  onWidthOpenTransitionEnd,
  onWidthCloseTransitionEnd,
}: VisitPanelProps) {
  const { state, dispatch } = useAppState()
  const isPhysician = state.role === 'physician'
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(open && instantOpen)
  const visitLabelRef = useRef(visitLabel)
  const isPastVisitRef = useRef(isPastVisit)
  const [now, setNow] = useState(() => Date.now())
  const [finishDialogOpen, setFinishDialogOpen] = useState(false)
  const [showNoteError, setShowNoteError] = useState(false)

  if (open) {
    visitLabelRef.current = visitLabel
    isPastVisitRef.current = isPastVisit
  }

  useLayoutEffect(() => {
    if (open) {
      setMounted(true)
      if (instantOpen) {
        setVisible(true)
        return
      }
      setVisible(false)
      const id = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(id)
    }
    setVisible(false)
  }, [open, instantOpen])

  const panelVisitLabel = visitLabelRef.current
  const panelIsPastVisit = isPastVisitRef.current
  const isToday = !panelIsPastVisit
  const revisionActive = isAssistantNoteRevision(state)
  const assistantViewOnly = isAssistantVisitViewOnly(state)
  const todayVisitReadOnly =
    panelIsPastVisit ||
    (isToday && state.visitFinished && !revisionActive) ||
    (isToday && assistantViewOnly)
  const showFinishedMeta =
    isToday && state.visitFinished && !revisionActive && state.visitStarted
  const showEncounterMeta =
    isToday &&
    state.encounterStartedAt != null &&
    state.visitStarted &&
    (!state.visitFinished || revisionActive)
  const showVisitStatusMeta = showEncounterMeta || showFinishedMeta
  const visitPhase = state.visitFinished && !revisionActive
    ? 'finished'
    : state.hasSubmittedOnce
      ? 'review'
      : 'intake'
  const fieldsLocked = todayVisitReadOnly

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
    if (!hasPhysicianReviewedNote(state.noteStatus)) {
      visitErrorToast('Approve or return the note before finishing the visit')
      return
    }
    setFinishDialogOpen(true)
  }

  const confirmFinishVisit = () => {
    setFinishDialogOpen(false)
    dispatch({ type: 'FINISH_VISIT' })
    visitStageToast('Visit finished', 'finished')
  }

  const handleSubmitHandoff = () => {
    submitClinicalNoteHandoff(state, dispatch, todayVisitReadOnly, {
      setShowNoteError,
    })
  }

  if (!mounted) return null

  const showClinicalSections =
    state.visitStarted || panelIsPastVisit || (isToday && revisionActive) || (isToday && state.visitFinished)
  const physicianIntakeBlock =
    isToday && isPhysician && state.visitStarted && !state.hasSubmittedOnce && !state.visitFinished
  const inReview =
    isToday && state.hasSubmittedOnce && (!state.visitFinished || revisionActive)
  const submitHandoffDisabled = isSubmitHandoffDisabled(state)
  const showSubmitHandoff =
    isToday &&
    !isPhysician &&
    !todayVisitReadOnly &&
    !submitHandoffDisabled &&
    showClinicalSections &&
    !physicianIntakeBlock
  const showPhysicianOptionalFields =
    isPhysician && showClinicalSections && !physicianIntakeBlock && !panelIsPastVisit
  const showSubmittedAddendumToAssistant =
    !isPhysician &&
    state.physicianAddendumCommitted &&
    state.physicianAddendum.trim() &&
    showClinicalSections &&
    !panelIsPastVisit

  return (
    <>
      <div
        data-slot="visit-panel-port"
        data-open={visible ? 'true' : 'false'}
        data-stagger={chromeStagger}
        data-instant={instantOpen ? 'true' : undefined}
        onTransitionEnd={(event) => {
          if (event.target !== event.currentTarget) return
          if (event.propertyName !== 'width') return
          if (visible) {
            onWidthOpenTransitionEnd?.()
            return
          }
          setMounted(false)
          onWidthCloseTransitionEnd?.()
        }}
      >
        <div
          data-slot="visit-panel"
          data-phase={showVisitStatusMeta ? visitPhase : undefined}
        >
          <div
            data-slot="visit-panel-header"
            data-phase={showVisitStatusMeta ? visitPhase : undefined}
          >
            <div data-slot="visit-panel-header-start">
              <h4>{panelVisitLabel}</h4>
              {showVisitStatusMeta && (
                <Badge variant="outline" className={scheduleStatusTint[visitPhase]}>
                  {getScheduleStatusLabel(visitPhase)}
                  {(visitPhase === 'intake' || visitPhase === 'review') && (
                    <span
                      data-slot="appointment-status-dot"
                      data-status={visitPhase}
                      aria-hidden
                    />
                  )}
                </Badge>
              )}
              {showEncounterMeta && state.encounterStartedAt != null && (
                <AccessTimer startedAt={state.encounterStartedAt} now={now} />
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
            <div data-slot="visit-panel-body" className="flex flex-col gap-4">
              {physicianIntakeBlock && (
                <p className="text-sm text-muted-foreground">
                  {DEMO_ASSISTANT_NAME} is currently with the patient.
                </p>
              )}

              {showClinicalSections && !physicianIntakeBlock && (
                <>
                  <VitalsSection readOnly={todayVisitReadOnly} />
                  <Separator />
                  <NoteSection
                    readOnly={todayVisitReadOnly}
                    inVisitPanel
                    showNoteError={showNoteError}
                    onShowNoteErrorChange={setShowNoteError}
                  />
                </>
              )}

              {showPhysicianOptionalFields && (
                <>
                  <Separator />
                  <section>
                    <VisitFieldLabel as="h5" optional>
                      Physician addendum
                    </VisitFieldLabel>
                    <Textarea
                      placeholder="Add physician addendum..."
                      value={state.physicianAddendum}
                      disabled={fieldsLocked}
                      onChange={(e) => {
                        dispatch({
                          type: 'UPDATE_PHYSICIAN_ADDENDUM',
                          content: e.target.value,
                        })
                      }}
                    />
                  </section>
                </>
              )}

              {showSubmittedAddendumToAssistant && (
                <>
                  <Separator />
                  <section>
                    <VisitFieldLabel as="h5" optional>
                      Physician addendum
                    </VisitFieldLabel>
                    <Textarea disabled value={state.physicianAddendum} />
                  </section>
                </>
              )}

              {showPhysicianOptionalFields && (
                <>
                  <Separator />
                  <section>
                    <VisitFieldLabel as="h5" optional>
                      Confidential note
                    </VisitFieldLabel>
                    <p className="mb-2 text-sm text-muted-foreground">
                      Physician-only. Hidden from Assistant — no request path.
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

              {showSubmitHandoff && (
                <>
                  <Separator />
                  <Button onClick={handleSubmitHandoff}>
                    {getSubmitHandoffLabel(state.noteStatus)}
                  </Button>
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

import { useEffect, useState } from 'react'
import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { getNoteStatusLabel } from '@/lib/statusDerivation'
import { areVitalsComplete, formatMissingVitalsMessage } from '@/lib/vitals'
import {
  isClinicalNoteEditable,
  isSubmitHandoffDisabled,
} from '@/lib/visitLifecycle'
import { visitErrorToast, visitStageToast } from '@/lib/visitToasts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface NoteSectionProps {
  readOnly?: boolean
  inVisitPanel?: boolean
}

export function NoteSection({ readOnly = false, inVisitPanel = false }: NoteSectionProps) {
  const { state, dispatch } = useAppState()
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [returnFeedback, setReturnFeedback] = useState('')
  const [showNoteError, setShowNoteError] = useState(false)

  const noteEditable = isClinicalNoteEditable(state, readOnly)
  const submitHandoffDisabled = isSubmitHandoffDisabled(state)

  useEffect(() => {
    if (!import.meta.env.DEV || !inVisitPanel) {
      return
    }
    console.debug('[NoteSection] textarea gate', {
      disabled: !noteEditable,
      noteStatus: state.noteStatus,
      role: state.role,
      visitFinished: state.visitFinished,
      readOnly,
      vitalsSubmitted: state.vitalsSubmitted,
    })
  }, [
    inVisitPanel,
    noteEditable,
    readOnly,
    state.noteStatus,
    state.role,
    state.visitFinished,
    state.vitalsSubmitted,
  ])

  const handleSubmit = () => {
    if (!noteEditable) {
      visitErrorToast('Clinical note is not editable right now')
      return
    }

    if (submitHandoffDisabled) {
      visitErrorToast('Note has already been submitted')
      return
    }

    if (!state.vitalsSubmitted) {
      dispatch({ type: 'SHOW_VITALS_ERRORS' })
      visitErrorToast('Submit vitals before handing off the note')
      return
    }

    if (!areVitalsComplete(state.vitals)) {
      dispatch({ type: 'SHOW_VITALS_ERRORS' })
      visitErrorToast(formatMissingVitalsMessage(state.vitals))
      return
    }

    if (!state.noteDraft.trim()) {
      setShowNoteError(true)
      visitErrorToast('Please fill out: Clinical note.')
      return
    }

    setShowNoteError(false)
    dispatch({ type: 'SUBMIT_NOTE' })
    visitStageToast(
      state.noteStatus === 'returned'
        ? 'Note resubmitted for review'
        : 'Note submitted for review',
      'review',
    )
  }

  const handleCosign = () => {
    if (state.noteStatus !== 'submitted') {
      visitErrorToast('No note is awaiting approval')
      return
    }
    dispatch({ type: 'COSIGN_NOTE' })
    visitStageToast('Note approved', 'review')
  }

  const handleReturnClick = () => {
    if (state.noteStatus !== 'submitted') {
      visitErrorToast('No note is awaiting return')
      return
    }
    setReturnDialogOpen(true)
  }

  const handleReturn = () => {
    if (!returnFeedback.trim()) {
      visitErrorToast('Please fill out: Return feedback.')
      return
    }
    dispatch({ type: 'RETURN_NOTE', feedback: returnFeedback })
    setReturnDialogOpen(false)
    setReturnFeedback('')
    visitStageToast('Note returned to assistant', 'review')
  }

  const statusVariant = (() => {
    switch (state.noteStatus) {
      case 'submitted':
        return 'border-blue-200 bg-blue-50 text-blue-600'
      case 'returned':
        return 'border-amber-200 bg-amber-50 text-amber-600'
      case 'cosigned':
        return 'border-green-200 bg-green-50 text-green-600'
      default:
        return ''
    }
  })()

  const secondaryButtonVariant = inVisitPanel ? 'outline' : 'default'

  return (
    <section>
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h5>Clinical note</h5>
          <Badge variant="outline" className={statusVariant}>
            {getNoteStatusLabel(state.noteStatus)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Shared visit documentation — physician review required.
        </p>
      </div>

      {state.returnFeedback && state.noteStatus === 'returned' && (
        <div className="mb-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
          <p><strong>Return feedback</strong></p>
          <p>{state.returnFeedback}</p>
        </div>
      )}

      <Textarea
        key={`clinical-note-${state.noteStatus}`}
        placeholder="Enter clinical note..."
        value={state.noteDraft}
        disabled={!noteEditable}
        aria-invalid={showNoteError && !state.noteDraft.trim() ? true : undefined}
        onChange={(e) => {
          dispatch({ type: 'UPDATE_NOTE_DRAFT', content: e.target.value })
          if (showNoteError && e.target.value.trim()) {
            setShowNoteError(false)
          }
        }}
      />

      <div className="mt-2 flex flex-wrap gap-2">
        {!readOnly && state.role === 'assistant' && (
          <Button
            onClick={handleSubmit}
            disabled={submitHandoffDisabled}
          >
            Submit & hand off
          </Button>
        )}
        {!readOnly && state.role === 'physician' && (
          <>
            <Button variant={secondaryButtonVariant} onClick={handleCosign}>
              Approve
            </Button>
            <Button variant={secondaryButtonVariant} onClick={handleReturnClick}>
              Return for revision
            </Button>
          </>
        )}
      </div>

      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return note for revision</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Provide feedback for the assistant..."
            value={returnFeedback}
            onChange={(e) => setReturnFeedback(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReturn}>
              Return note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

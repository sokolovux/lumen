import { useEffect, useState } from 'react'
import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { getNoteStatusLabel } from '@/lib/statusDerivation'
import {
  isClinicalNoteEditable,
} from '@/lib/visitLifecycle'
import { VisitFieldLabel } from '@/components/patient/VisitFieldLabel'
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
  showNoteError?: boolean
  onShowNoteErrorChange?: (show: boolean) => void
}

export function NoteSection({
  readOnly = false,
  inVisitPanel = false,
  showNoteError: showNoteErrorProp,
  onShowNoteErrorChange,
}: NoteSectionProps) {
  const { state, dispatch } = useAppState()
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [returnFeedback, setReturnFeedback] = useState('')
  const [internalShowNoteError, setInternalShowNoteError] = useState(false)

  const noteEditable = isClinicalNoteEditable(state, readOnly)
  const showNoteError = showNoteErrorProp ?? internalShowNoteError
  const setShowNoteError = onShowNoteErrorChange ?? setInternalShowNoteError

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
    })
  }, [
    inVisitPanel,
    noteEditable,
    readOnly,
    state.noteStatus,
    state.role,
    state.visitFinished,
  ])

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

  return (
    <section>
      <div className="mb-2">
        <div className="flex items-center justify-between gap-2">
          <VisitFieldLabel as="h5" required>
            Clinical note
          </VisitFieldLabel>
          <Badge variant="outline" className={statusVariant}>
            {getNoteStatusLabel(state.noteStatus)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Shared visit documentation. Physician review required.
        </p>
      </div>

      {state.returnFeedback && state.noteStatus === 'returned' && (
        <div className="mb-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-amber-800">
          <p><strong>Return feedback</strong></p>
          <p>{state.returnFeedback}</p>
        </div>
      )}

      <Textarea
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

      {state.role === 'physician' && state.noteStatus === 'submitted' && (
        <div className="mt-2 flex flex-wrap gap-2">
          <Button variant="success" onClick={handleCosign}>
            Approve
          </Button>
          <Button variant="destructive" onClick={handleReturnClick}>
            Return for revision
          </Button>
        </div>
      )}

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

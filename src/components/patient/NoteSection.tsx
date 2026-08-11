import { useState } from 'react'
import { toast } from 'sonner'
import { useAppState } from '@/state/AppStateContext'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { getNoteStatusLabel } from '@/lib/statusDerivation'
import { areVitalsComplete } from '@/lib/vitals'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface NoteSectionProps {
  readOnly?: boolean
}

export function NoteSection({ readOnly = false }: NoteSectionProps) {
  const { state, dispatch } = useAppState()
  const [returnDialogOpen, setReturnDialogOpen] = useState(false)
  const [returnFeedback, setReturnFeedback] = useState('')
  const [showNoteError, setShowNoteError] = useState(false)

  const canEdit =
    !readOnly &&
    state.role === 'assistant' &&
    (state.noteStatus === 'not_started' ||
      state.noteStatus === 'draft' ||
      state.noteStatus === 'returned')

  const handleSubmit = () => {
    if (!canEdit) return

    if (!areVitalsComplete(state.vitals) || !state.vitalsSubmitted) {
      dispatch({ type: 'SHOW_VITALS_ERRORS' })
      toast.error('Complete and submit all vitals before handing off')
      return
    }

    if (!state.noteDraft.trim()) {
      setShowNoteError(true)
      toast.error('Enter a clinical note before submitting')
      return
    }

    setShowNoteError(false)
    dispatch({ type: 'SUBMIT_NOTE' })
    toast.success(
      state.noteStatus === 'returned'
        ? 'Note resubmitted for cosign'
        : 'Note submitted for cosign',
    )
  }

  const handleCosign = () => {
    dispatch({ type: 'COSIGN_NOTE' })
    toast.success('Note cosigned')
  }

  const handleReturn = () => {
    if (!returnFeedback.trim()) return
    dispatch({ type: 'RETURN_NOTE', feedback: returnFeedback })
    setReturnDialogOpen(false)
    setReturnFeedback('')
    toast.success('Note returned to assistant')
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
        <div className="flex items-center justify-between">
          <h5>Clinical note</h5>
          <Badge variant="outline" className={statusVariant}>
            {getNoteStatusLabel(state.noteStatus)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Shared visit documentation — physician cosign required.
        </p>
      </div>

      {state.returnFeedback && state.noteStatus === 'returned' && (
        <div className="mb-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
          <p><strong>Return feedback</strong></p>
          <p>{state.returnFeedback}</p>
        </div>
      )}

      {canEdit ? (
        <Textarea
          placeholder="Enter clinical note..."
          value={state.noteDraft}
          aria-invalid={showNoteError && !state.noteDraft.trim() ? true : undefined}
          onChange={(e) => {
            dispatch({ type: 'UPDATE_NOTE_DRAFT', content: e.target.value })
            if (showNoteError && e.target.value.trim()) {
              setShowNoteError(false)
            }
          }}
        />
      ) : (
        <Textarea
          readOnly
          value={state.noteDraft}
          placeholder="No note content"
        />
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {!readOnly && state.role === 'assistant' && (
          <Button onClick={handleSubmit}>
            Submit & hand off
          </Button>
        )}
        {!readOnly && state.role === 'physician' && (
          <>
            <Button
              size="sm"
              onClick={handleCosign}
              disabled={state.noteStatus !== 'submitted'}
            >
              Cosign
            </Button>
            {state.noteStatus === 'submitted' && (
              <Button size="sm" variant="outline" onClick={() => setReturnDialogOpen(true)}>
                Return for revision
              </Button>
            )}
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
            <Button onClick={handleReturn} disabled={!returnFeedback.trim()}>
              Return note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
